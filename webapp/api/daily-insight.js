// POST /api/daily-insight
// Body: { systemPrompt: string, userMessage: string }
// Returns: { text: string }
//   or:   402 { error: 'quota_exceeded', periodEndsAt: ISO string }
//
// Auth: Supabase JWT via `Authorization: Bearer <access_token>`.
// Generates a single short paragraph insight from a check-in.
// Spend counts toward the same $1 / 3-month quota as Coach (Issue #54).
import { applyCors } from './_lib/cors.js';
import { verifyUser } from './_lib/auth.js';
import { anthropic, callWithRetry, extractText } from './_lib/anthropic.js';
import { checkQuota, costFromUsage, recordSpend } from './_lib/spend.js';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 256;

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyUser(req);
  if (!user) return res.status(401).json({ error: authError });

  // Validate body first — a malformed request should always 400 regardless
  // of quota state, so misbehaving clients get the right diagnostic.
  const { systemPrompt, userMessage } = req.body || {};
  if (typeof systemPrompt !== 'string' || typeof userMessage !== 'string' || !userMessage.trim()) {
    return res.status(400).json({ error: 'systemPrompt and userMessage (non-empty strings) are required' });
  }

  // Quota gate — daily insight is cheap (~$0.0005/call) but still counts.
  // Frontend renders insight inline; on 402 it shows "Insight skipped".
  const { exceeded, periodEndsAt } = await checkQuota(user.id);
  if (exceeded) {
    return res.status(402).json({ error: 'quota_exceeded', periodEndsAt });
  }

  try {
    const response = await callWithRetry(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
    );
    recordSpend(user.id, costFromUsage(response.usage));
    return res.status(200).json({ text: extractText(response) });
  } catch (err) {
    console.error('[daily-insight] Anthropic error:', err.message);
    const status = err?.status || err?.statusCode;
    if (status === 429) return res.status(429).json({ error: 'Rate limited' });
    return res.status(500).json({ error: 'Insight unavailable' });
  }
}
