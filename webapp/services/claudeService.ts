// Client wrappers around the webapp's Anthropic-backed serverless functions
// (`/api/coach` and `/api/daily-insight`). The Anthropic API key lives only
// on the server — this module just authenticates the user with Supabase
// and forwards the prompt payload.
import { CheckIn, ChatMessage } from "../types";
import { buildCoachSystemPrompt } from "../prompts/aiCoach";
import { buildDailyInsightSystem, buildDailyInsightUserMessage } from "../prompts/dailyInsight";
import { supabase } from "../src/lib/supabase";
import { logger } from "../src/lib/logger";

const COACH_ENDPOINT = '/api/coach';
const DAILY_INSIGHT_ENDPOINT = '/api/daily-insight';

// User-facing fallback strings — keep aligned with prior Gemini messages so
// existing UX copy doesn't shift.
const FALLBACK = {
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

// Returns the Supabase access_token for the current session, or null if the
// user is signed out / Supabase isn't configured.
async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

type FallbackKind = keyof typeof FALLBACK;

async function callEndpoint(
  endpoint: string,
  payload: unknown,
  fallback: typeof FALLBACK[FallbackKind],
  contextLabel: string
): Promise<string> {
  const token = await getAccessToken();
  if (!token) return fallback.auth;

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
    return fallback.server;
  }

  if (response.status === 401) return fallback.auth;
  if (response.status === 429) {
    logger.warn(`${contextLabel} rate-limited.`);
    return fallback.rateLimit;
  }
  if (!response.ok) {
    logger.error(`${contextLabel} request failed.`, { status: response.status });
    return fallback.server;
  }

  try {
    const data = await response.json();
    return (typeof data.text === 'string' && data.text.trim()) ? data.text : fallback.empty;
  } catch (err) {
    logger.error(`${contextLabel} response parse error.`, { error: err });
    return fallback.server;
  }
}

export const getCoachResponse = async (
  message: string,
  context: string,
  history: ChatMessage[] = []
): Promise<string> => {
  // Build the messages[] payload: prior turns + the new user message.
  // Server caps the array length too as defense in depth.
  const messages: ChatMessage[] = [...history, { role: 'user', content: message }];
  const payload = {
    systemPrompt: buildCoachSystemPrompt(context),
    messages,
  };
  return callEndpoint(COACH_ENDPOINT, payload, FALLBACK.coach, 'Coach');
};

export const generateDailyInsight = async (checkIn: CheckIn): Promise<string> => {
  const payload = {
    systemPrompt: buildDailyInsightSystem(),
    userMessage: buildDailyInsightUserMessage(checkIn),
  };
  return callEndpoint(DAILY_INSIGHT_ENDPOINT, payload, FALLBACK.insight, 'Daily insight');
};
