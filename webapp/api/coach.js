// POST /api/coach
// Body: { systemPrompt: string, messages: [{ role: 'user'|'assistant', content: string }] }
// Returns: { text: string }
//   or:   402 { error: 'quota_exceeded', periodEndsAt: ISO string }
//
// Auth: Supabase JWT via `Authorization: Bearer <access_token>`.
// Calls Claude Haiku 4.5 with multi-turn conversation history.
// Spend is tracked against the $1 / 3-month quota (Issue #54, Scope 4).
import { applyCors } from './_lib/cors.js';
import { verifyUser } from './_lib/auth.js';
import { anthropic, callWithRetry, extractText } from './_lib/anthropic.js';
import { checkQuota, costFromUsage, recordSpend } from './_lib/spend.js';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
const MAX_HISTORY = 10;

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyUser(req);
  if (!user) return res.status(401).json({ error: authError });

  // Validate body first — a malformed request should always 400 regardless
  // of quota state, so misbehaving clients get the right diagnostic.
  const { systemPrompt, messages } = req.body || {};
  if (typeof systemPrompt !== 'string' || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'systemPrompt (string) and messages (non-empty array) are required' });
  }

  // Pre-call quota check — fail fast before burning a Claude call on a user
  // who's already over budget. Frontend renders the "Quota reached" banner
  // off the 402 response shape.
  const { exceeded, periodEndsAt } = await checkQuota(user.id);
  if (exceeded) {
    return res.status(402).json({ error: 'quota_exceeded', periodEndsAt });
  }

  // Defense in depth: cap history length even if frontend over-sends.
  const trimmed = messages.slice(-MAX_HISTORY);

  try {
    const response = await callWithRetry(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: trimmed,
      })
    );
    // Fire-and-forget spend record — don't make the user wait on the RPC.
    recordSpend(user.id, costFromUsage(response.usage));
    return res.status(200).json({ text: extractText(response) });
  } catch (err) {
    console.error('[coach] Anthropic error:', err.message);
    const status = err?.status || err?.statusCode;
    if (status === 429) return res.status(429).json({ error: 'Rate limited' });
    return res.status(500).json({ error: 'Coach unavailable' });
  }
}
