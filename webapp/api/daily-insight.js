// POST /api/daily-insight
// Body: { systemPrompt: string, userMessage: string }
// Returns: { text: string }
//
// Auth: Supabase JWT via `Authorization: Bearer <access_token>`.
// Generates a single short paragraph insight from a check-in.
import { applyCors } from './_lib/cors.js';
import { verifyUser } from './_lib/auth.js';
import { anthropic, callWithRetry, extractText } from './_lib/anthropic.js';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 256;

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await verifyUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { systemPrompt, userMessage } = req.body || {};
  if (typeof systemPrompt !== 'string' || typeof userMessage !== 'string' || !userMessage.trim()) {
    return res.status(400).json({ error: 'systemPrompt and userMessage (non-empty strings) are required' });
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
    return res.status(200).json({ text: extractText(response) });
  } catch (err) {
    console.error('[daily-insight] Anthropic error:', err.message);
    const status = err?.status || err?.statusCode;
    if (status === 429) return res.status(429).json({ error: 'Rate limited' });
    return res.status(500).json({ error: 'Insight unavailable' });
  }
}
