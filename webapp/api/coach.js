// POST /api/coach
// Body: { systemPrompt: string, messages: [{ role: 'user'|'assistant', content: string }] }
// Returns: { text: string }
//
// Auth: Supabase JWT via `Authorization: Bearer <access_token>`.
// Calls Claude Haiku 4.5 with multi-turn conversation history.
import { applyCors } from './_lib/cors.js';
import { verifyUser } from './_lib/auth.js';
import { anthropic, callWithRetry, extractText } from './_lib/anthropic.js';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
const MAX_HISTORY = 10;

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { systemPrompt, messages } = req.body || {};
  if (typeof systemPrompt !== 'string' || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'systemPrompt (string) and messages (non-empty array) are required' });
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
    return res.status(200).json({ text: extractText(response) });
  } catch (err) {
    console.error('[coach] Anthropic error:', err.message);
    const status = err?.status || err?.statusCode;
    if (status === 429) return res.status(429).json({ error: 'Rate limited' });
    return res.status(500).json({ error: 'Coach unavailable' });
  }
}
