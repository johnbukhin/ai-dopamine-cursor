// Client wrappers around the webapp's Anthropic-backed serverless functions
// (`/api/coach`, `/api/daily-insight`, `/api/coach-reset`).
// The Anthropic API key lives only on the server — this module just
// authenticates the user with Supabase and forwards the prompt payload.
import { CheckIn, ChatMessage } from "../types";
import { buildCoachSystemPrompt } from "../prompts/aiCoach";
import { buildDailyInsightSystem, buildDailyInsightUserMessage } from "../prompts/dailyInsight";
import { supabase } from "../src/lib/supabase";
import { logger } from "../src/lib/logger";

const COACH_ENDPOINT = '/api/coach';
const DAILY_INSIGHT_ENDPOINT = '/api/daily-insight';
const COACH_RESET_ENDPOINT = '/api/coach-reset';

// ── Result types ────────────────────────────────────────────────────────
// Issue #54: endpoints can now return 402 when the user is over their
// $1 / 3-month LLM budget. Callers branch on the discriminator instead
// of receiving a magic error string.

export interface QuotaExceeded {
  kind: 'quota_exceeded';
  /** ISO timestamp when the user's window resets. */
  periodEndsAt: string | null;
}
export interface TextResult { kind: 'text'; text: string; }
export interface AuthError  { kind: 'auth_error'; message: string; }
export interface ServerError { kind: 'server_error'; message: string; }

export type ServiceResult = TextResult | QuotaExceeded | AuthError | ServerError;

// User-facing fallback copy for non-quota errors. Kept here so the UI
// doesn't have to duplicate strings.
export const FALLBACK_COPY = {
  coach: {
    auth: "AI Coach unavailable (please sign in again).",
    rateLimit: "AI Coach is busy. Please try again in a moment.",
    server: "Connection to AI Coach interrupted.",
    empty: "I'm listening, but I can't respond right now.",
  },
  insight: {
    auth: "Insight unavailable (please sign in again).",
    rateLimit: "Insight unavailable (please try again later).",
    server: "Insight generation temporarily unavailable.",
    empty: "Unable to generate insight.",
  },
} as const;

// ── Auth helper ────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ── Memory cache ───────────────────────────────────────────────────────
// The Coach memory note (compressed summary of prior conversations) is
// fetched lazily and reused for subsequent Coach calls so we don't refetch
// on every keystroke. After a local reset / logout we invalidate so the
// next call refetches the freshly-written summary.
//
// Known limitation: if the user resets the chat in another tab or device,
// this tab's cached note is stale until the TTL expires. We refresh after
// CACHE_TTL_MS so multi-device drift heals on its own without explicit
// cross-tab signalling.

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

/** Coach memory note + its last-refresh timestamp. The `updatedAt` lets
 *  `buildCoachSystemPrompt` render a staleness annotation (Issue #71) so
 *  the coach can deprioritize old references when recent activity
 *  contradicts the summary. */
interface CachedMemoryNote {
  summary: string;
  updatedAt: string;
}

let cachedMemoryNote: CachedMemoryNote | null | undefined = undefined; // undefined = not yet fetched
let cachedAt = 0;

async function getMemoryNote(): Promise<CachedMemoryNote | null> {
  const fresh = cachedMemoryNote !== undefined && (Date.now() - cachedAt) < CACHE_TTL_MS;
  if (fresh) return cachedMemoryNote ?? null;

  if (!supabase) {
    cachedMemoryNote = null;
    cachedAt = Date.now();
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    cachedMemoryNote = null;
    cachedAt = Date.now();
    return null;
  }
  const { data, error } = await supabase
    .from('coach_memory')
    .select('summary, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    logger.warn('coach_memory fetch error', { error });
    cachedMemoryNote = null;
    cachedAt = Date.now();
    return null;
  }
  cachedMemoryNote = data?.summary
    ? { summary: data.summary, updatedAt: data.updated_at }
    : null;
  cachedAt = Date.now();
  return cachedMemoryNote;
}

/** Force a refetch on next Coach call. Call after sign-out or chat reset. */
export function invalidateMemoryCache(): void {
  cachedMemoryNote = undefined;
  cachedAt = 0;
}

// ── Core fetch + result normalization ──────────────────────────────────

async function callEndpoint(
  endpoint: string,
  payload: unknown,
  contextLabel: string,
): Promise<ServiceResult> {
  const token = await getAccessToken();
  if (!token) return { kind: 'auth_error', message: 'no-session' };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error(`${contextLabel} network error.`, { error: err });
    return { kind: 'server_error', message: 'network' };
  }

  if (response.status === 401) return { kind: 'auth_error', message: 'unauthorized' };
  if (response.status === 402) {
    let periodEndsAt: string | null = null;
    try {
      const body = await response.json();
      periodEndsAt = body?.periodEndsAt ?? null;
    } catch { /* ignore — return null */ }
    return { kind: 'quota_exceeded', periodEndsAt };
  }
  if (response.status === 429) return { kind: 'server_error', message: 'rate_limit' };
  if (!response.ok) {
    logger.error(`${contextLabel} request failed.`, { status: response.status });
    return { kind: 'server_error', message: `http_${response.status}` };
  }

  try {
    const data = await response.json();
    const text = typeof data.text === 'string' ? data.text.trim() : '';
    if (!text) return { kind: 'server_error', message: 'empty' };
    return { kind: 'text', text };
  } catch (err) {
    logger.error(`${contextLabel} response parse error.`, { error: err });
    return { kind: 'server_error', message: 'parse' };
  }
}

// ── Public API ─────────────────────────────────────────────────────────

export const getCoachResponse = async (
  message: string,
  context: string,
  history: ChatMessage[] = [],
): Promise<ServiceResult> => {
  const memoryNote = await getMemoryNote();
  const messages: ChatMessage[] = [...history, { role: 'user', content: message }];
  const payload = {
    systemPrompt: buildCoachSystemPrompt(
      context,
      memoryNote?.summary ?? null,
      memoryNote?.updatedAt ?? null,
    ),
    messages,
  };
  return callEndpoint(COACH_ENDPOINT, payload, 'Coach');
};

export const generateDailyInsight = async (checkIn: CheckIn): Promise<ServiceResult> => {
  const payload = {
    systemPrompt: buildDailyInsightSystem(),
    userMessage: buildDailyInsightUserMessage(checkIn),
  };
  return callEndpoint(DAILY_INSIGHT_ENDPOINT, payload, 'Daily insight');
};

/**
 * Reset the Coach chat. `save: true` summarizes prior messages into the
 * memory note before wiping; `save: false` discards both chat AND memory.
 * Both paths clear `coach_messages` server-side.
 *
 * Resolves to a ServiceResult so callers can show the same quota/error
 * UI as the regular Coach calls. On success returns kind: 'text' with the
 * new summary as text (or empty string for discard).
 */
export const resetCoachChat = async (
  messages: ChatMessage[],
  save: boolean,
): Promise<ServiceResult> => {
  const token = await getAccessToken();
  if (!token) return { kind: 'auth_error', message: 'no-session' };

  let response: Response;
  try {
    response = await fetch(COACH_RESET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, save }),
    });
  } catch (err) {
    logger.error('Coach reset network error.', { error: err });
    return { kind: 'server_error', message: 'network' };
  }

  if (response.status === 401) return { kind: 'auth_error', message: 'unauthorized' };
  if (response.status === 402) {
    let periodEndsAt: string | null = null;
    try {
      const body = await response.json();
      periodEndsAt = body?.periodEndsAt ?? null;
    } catch { /* ignore */ }
    return { kind: 'quota_exceeded', periodEndsAt };
  }
  if (!response.ok) {
    logger.error('Coach reset failed.', { status: response.status });
    return { kind: 'server_error', message: `http_${response.status}` };
  }

  try {
    const data = await response.json();
    // Invalidate cache so the next Coach call picks up the new (or wiped)
    // memory note.
    invalidateMemoryCache();
    return { kind: 'text', text: typeof data.summary === 'string' ? data.summary : '' };
  } catch (err) {
    logger.error('Coach reset response parse error.', { error: err });
    return { kind: 'server_error', message: 'parse' };
  }
};
