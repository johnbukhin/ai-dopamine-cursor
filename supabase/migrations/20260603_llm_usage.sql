-- LLM spend tracking for AI Coach v2 (Issue #54, Scope 4).
--
-- One row per user. Accumulates cost across all LLM-backed endpoints
-- (Coach chat, Daily Insight, chat-reset summarize). When the user crosses
-- the $1.00 quota inside the current 3-month window, the API returns 402
-- and the frontend swaps the chat input for a "Quota reached" banner.
--
-- The window is rolling-but-discrete: at the moment a call lands AFTER
-- `period_start_at + 3 months`, the row resets (`total_cost_usd = 0`,
-- `period_start_at = now()`) inside the same atomic RPC, then the new
-- call's cost is added. This avoids any backfill — users who never call
-- the LLM never get a row.

CREATE TABLE IF NOT EXISTS llm_usage (
  user_id          UUID         NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  total_cost_usd   NUMERIC(10,6) NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE llm_usage ENABLE ROW LEVEL SECURITY;

-- Users may read their own row (used by the frontend to render the quota
-- reset date in the banner). All writes go through the SERVICE_ROLE key
-- in `api/_lib/spend.js`, NOT directly from clients — so no INSERT/UPDATE
-- policy is granted here.
DROP POLICY IF EXISTS "Users read own llm_usage" ON llm_usage;
CREATE POLICY "Users read own llm_usage" ON llm_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Atomic check + reset + increment. The serverless API verifies the user
-- via Supabase JWT first and then passes the trusted `user_id` here — the
-- function does NOT trust `auth.uid()` because it's invoked via the
-- SERVICE_ROLE key (which has no auth context).
--
-- Returns the row state AFTER the update so the caller can log telemetry
-- if useful.
CREATE OR REPLACE FUNCTION track_llm_spend(p_user_id UUID, p_cost NUMERIC)
RETURNS TABLE (
  total_cost_usd  NUMERIC,
  period_start_at TIMESTAMPTZ,
  period_ends_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Upsert with conditional reset. The CASE in the UPDATE branch handles
  -- the "window expired" rollover atomically — no separate SELECT-then-
  -- UPDATE race window.
  INSERT INTO llm_usage (user_id, period_start_at, total_cost_usd, updated_at)
  VALUES (p_user_id, now(), p_cost, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    period_start_at = CASE
      WHEN llm_usage.period_start_at < now() - interval '3 months' THEN now()
      ELSE llm_usage.period_start_at
    END,
    total_cost_usd = CASE
      WHEN llm_usage.period_start_at < now() - interval '3 months' THEN p_cost
      ELSE llm_usage.total_cost_usd + p_cost
    END,
    updated_at = now();

  RETURN QUERY
    SELECT
      u.total_cost_usd,
      u.period_start_at,
      (u.period_start_at + interval '3 months')::TIMESTAMPTZ AS period_ends_at
    FROM llm_usage u
    WHERE u.user_id = p_user_id;
END;
$$;

-- Only the service role invokes this (from webapp/api/_lib/spend.js).
-- Revoke default PUBLIC EXECUTE to be explicit about that boundary.
REVOKE EXECUTE ON FUNCTION track_llm_spend(UUID, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION track_llm_spend(UUID, NUMERIC) TO service_role;
