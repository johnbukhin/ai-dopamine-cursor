// POST /api/coach-reset
// Body: { messages: ChatMessage[], save: boolean }
// Returns: { ok: true, summary?: string }
//   or:   402 { error: 'quota_exceeded', periodEndsAt: ISO string }
//
// "Save & start fresh": LLM summarizes the prior chat (folding in any
// existing memory note so summaries don't stack), writes the result into
// `coach_memory`, then clears `coach_messages`.
//
// "Discard & start fresh": just clears `coach_messages`. No LLM call,
// no quota consumed, existing memory note is wiped too.
//
// Issue #54, Scope 2.
import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_lib/cors.js';
import { verifyUser } from './_lib/auth.js';
import { anthropic, callWithRetry, extractText } from './_lib/anthropic.js';
import { checkQuota, costFromUsage, recordSpend } from './_lib/spend.js';

const MODEL = 'claude-haiku-4-5';
const SUMMARY_MAX_TOKENS = 300;

const SUMMARY_SYSTEM_PROMPT = `You are a memory compressor for an AI coach helping a user reduce porn addiction and compulsive dopamine-driven behaviors.

You will receive a prior conversation (and possibly an existing memory note from earlier conversations). Produce ONE concise memory note (≤300 tokens, plain prose, no markdown headers) that captures:
- the user's recurring struggles and triggers
- what coping strategies they've tried and what seems to work / not work
- recurring emotional themes
- tone preferences they've signaled (e.g. "I don't want advice, just to vent")
- any concrete commitments or goals they've stated

If an existing memory note is present, INTEGRATE it — don't repeat verbatim. Drop stale facts that newer messages have superseded.

Do NOT include advice, opinions, or coaching language. This is a private note for the coach's future context, not a message to the user. Write in third-person ("the user…") for clarity.`;

const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { messages, save } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages (array) is required' });
  }
  if (typeof save !== 'boolean') {
    return res.status(400).json({ error: 'save (boolean) is required' });
  }

  // ── Path A: discard — wipe BOTH chat AND memory, no LLM. ────────────
  if (!save) {
    const chatErr = await wipeChat(user.id);
    const memErr  = await wipeMemory(user.id);
    if (chatErr || memErr) {
      return res.status(500).json({ error: 'Reset failed', detail: chatErr || memErr });
    }
    return res.status(200).json({ ok: true });
  }

  // ── Path B: save with empty chat — nothing to summarize. ─────────────
  // Frontend disables Save when chat is empty; this is defensive. Wipe chat
  // only (preserve any existing memory the user accumulated before).
  if (messages.length === 0) {
    const chatErr = await wipeChat(user.id);
    if (chatErr) return res.status(500).json({ error: 'Reset failed', detail: chatErr });
    return res.status(200).json({ ok: true });
  }

  // ── Path C: save & summarize. ────────────────────────────────────────
  const { exceeded, periodEndsAt } = await checkQuota(user.id);
  if (exceeded) {
    return res.status(402).json({ error: 'quota_exceeded', periodEndsAt });
  }

  // Pull existing memory so the summarizer can integrate it instead of
  // dropping prior context.
  const { data: existingMemoryRow } = await adminClient
    .from('coach_memory')
    .select('summary')
    .eq('user_id', user.id)
    .maybeSingle();
  const existingSummary = existingMemoryRow?.summary ?? null;

  const userMessage = buildSummarizeUserMessage(messages, existingSummary);

  let newSummary;
  let summarizeCost = 0;
  try {
    const response = await callWithRetry(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: SUMMARY_MAX_TOKENS,
        system: SUMMARY_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })
    );
    newSummary = extractText(response).trim();
    summarizeCost = costFromUsage(response.usage);
  } catch (err) {
    console.error('[coach-reset] Anthropic error:', err.message);
    const status = err?.status || err?.statusCode;
    if (status === 429) return res.status(429).json({ error: 'Rate limited' });
    return res.status(500).json({ error: 'Reset summarize failed' });
  }

  if (!newSummary) {
    return res.status(500).json({ error: 'Reset summarize returned empty' });
  }

  // Upsert memory FIRST (it's what the user explicitly asked us to preserve),
  // then wipe chat. Both errors are propagated so the frontend doesn't think
  // a partial reset succeeded and clear its own state prematurely.
  const { error: memErr } = await adminClient
    .from('coach_memory')
    .upsert(
      {
        user_id: user.id,
        summary: newSummary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (memErr) {
    console.error('[coach-reset] coach_memory upsert error:', memErr.message);
    return res.status(500).json({ error: 'Memory save failed' });
  }

  const wipeErr = await wipeChat(user.id);
  if (wipeErr) {
    return res.status(500).json({
      error: 'Chat wipe failed after memory save',
      detail: wipeErr,
    });
  }

  // Spend recorded only AFTER both writes succeed — we don't bill the user
  // for a summarize whose result we couldn't persist.
  recordSpend(user.id, summarizeCost);

  return res.status(200).json({ ok: true, summary: newSummary });
}

// ── helpers ─────────────────────────────────────────────────────────────

/** Returns the Supabase error message string on failure, or null on success. */
async function wipeChat(userId) {
  const { error } = await adminClient
    .from('coach_messages')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error('[coach-reset] coach_messages delete error:', error.message);
    return error.message;
  }
  return null;
}

/** Returns the Supabase error message string on failure, or null on success. */
async function wipeMemory(userId) {
  const { error } = await adminClient
    .from('coach_memory')
    .delete()
    .eq('user_id', userId);
  if (error) {
    console.error('[coach-reset] coach_memory delete error:', error.message);
    return error.message;
  }
  return null;
}

/** Compose the summarizer's user message: optional prior memory + chat transcript. */
function buildSummarizeUserMessage(messages, existingSummary) {
  const transcript = messages
    .map((m) => `${m.role === 'assistant' ? 'Coach' : 'User'}: ${m.content}`)
    .join('\n\n');

  if (existingSummary) {
    return `EXISTING MEMORY NOTE (from earlier conversations):\n${existingSummary}\n\nNEW CONVERSATION TO INTEGRATE:\n${transcript}`;
  }
  return `CONVERSATION TO SUMMARIZE:\n${transcript}`;
}
