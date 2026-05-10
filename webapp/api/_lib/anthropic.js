// Shared Anthropic client + retry helper for webapp serverless functions.
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Retry transient failures (429 rate-limit, 5xx server errors) with
// exponential backoff. Mirrors the previous Gemini retry behavior.
export async function callWithRetry(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status || err?.statusCode;
      const retryable = status === 429 || (status >= 500 && status < 600);
      if (!retryable || i === retries) throw err;
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000 + Math.random() * 500));
    }
  }
}

// Extracts text from an Anthropic messages.create response.
export function extractText(response) {
  return (response.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
