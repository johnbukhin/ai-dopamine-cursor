// LLM spend tracking for AI Coach v2 (Issue #54, Scope 4).
//
// Lifetime budget: $1.00 per user per 3 months, rolling window.
// Covers: Coach chat, Daily Insight, chat-reset summarize.
//
// All writes go through the `track_llm_spend(p_user_id, p_cost)` Postgres
// RPC, which atomically checks the period window, resets if expired, and
// increments. Reads (pre-call quota check) hit the table directly so we
// can fail fast without invoking the RPC for blocked users.
import { createClient } from '@supabase/supabase-js';

// Claude Haiku 4.5 pricing — keep in sync with model selection in coach.js
// and daily-insight.js. Numbers are USD per single token.
const HAIKU_INPUT_USD_PER_TOKEN  = 1 / 1_000_000;  // $1 per MTok
const HAIKU_OUTPUT_USD_PER_TOKEN = 5 / 1_000_000;  // $5 per MTok

export const QUOTA_USD = 1.0;

// Service-role client — bypasses RLS so we can read/write the usage row
// for any user. The caller MUST verify the JWT first (`verifyUser` in
// api/_lib/auth.js) and pass the trusted `user.id` to these helpers.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Pre-call quota check. Returns whether the user has crossed the budget
 * inside their current 3-month window, plus the window's end timestamp
 * (used by the frontend to render the "Resets on …" banner).
 *
 * A missing row is treated as "fresh user, plenty of budget" — no row is
 * created here; the RPC inserts on the first successful call.
 *
 * @param {string} userId  Trusted user.id from verifyUser()
 * @returns {Promise<{ exceeded: boolean, periodEndsAt: string | null }>}
 */
export async function checkQuota(userId) {
  const { data, error } = await supabase
    .from('llm_usage')
    .select('total_cost_usd, period_start_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Don't block users on read errors — fail open. recordSpend will still
    // attempt to write; if the table is genuinely broken, that's a bigger
    // alarm than letting a few extra calls through.
    console.error('[spend] checkQuota read error:', error.message);
    return { exceeded: false, periodEndsAt: null };
  }

  if (!data) return { exceeded: false, periodEndsAt: null };

  // Mirror the RPC's reset logic so we don't 402 a user whose window has
  // just expired but whose row hasn't been touched yet.
  const periodStart = new Date(data.period_start_at);
  const windowEnd = new Date(periodStart);
  windowEnd.setMonth(windowEnd.getMonth() + 3);
  const expired = windowEnd < new Date();

  if (expired) return { exceeded: false, periodEndsAt: null };
  return {
    exceeded: Number(data.total_cost_usd) >= QUOTA_USD,
    periodEndsAt: windowEnd.toISOString(),
  };
}

/**
 * Compute USD cost from an Anthropic `response.usage` object.
 * Handles missing fields defensively (treat as 0).
 */
export function costFromUsage(usage) {
  const input  = Number(usage?.input_tokens  ?? 0);
  const output = Number(usage?.output_tokens ?? 0);
  return input * HAIKU_INPUT_USD_PER_TOKEN + output * HAIKU_OUTPUT_USD_PER_TOKEN;
}

/**
 * Record spend via the atomic RPC. Fire-and-forget — callers should NOT
 * await this if the user-facing response can be returned first.
 *
 * @param {string} userId  Trusted user.id from verifyUser()
 * @param {number} cost    USD, from costFromUsage()
 */
export async function recordSpend(userId, cost) {
  if (cost <= 0) return;

  const { error } = await supabase.rpc('track_llm_spend', {
    p_user_id: userId,
    p_cost: cost,
  });
  if (error) {
    // Log only — don't propagate. Worst case we under-count one call.
    console.error('[spend] recordSpend RPC error:', error.message);
  }
}
