-- Day-level completion tracking for the 28-day plan.
--
-- One row per (user, plan cycle, day_number). Written by the webapp when:
--   lesson_completed_at    — the day's lesson slide-deck is finished
--   all_tasks_completed_at — lesson + all morning/evening tasks are checked off
--
-- These two timestamps drive stone colour on the Journey path:
--   GREEN (immediate) : all_tasks_completed_at IS NOT NULL
--   GREEN (next day)  : lesson_completed_at exists AND its calendar date < today
--   YELLOW (active)   : first day where neither condition is true
--
-- Run this SQL once in the Supabase Dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS day_completions (
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_started_at        TIMESTAMPTZ NOT NULL,
  day_number             SMALLINT    NOT NULL CHECK (day_number >= 0 AND day_number <= 28),
  lesson_completed_at    TIMESTAMPTZ NOT NULL,
  all_tasks_completed_at TIMESTAMPTZ,           -- NULL until fully done
  PRIMARY KEY (user_id, plan_started_at, day_number)
);

ALTER TABLE day_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own day completions" ON day_completions;
CREATE POLICY "Users manage own day completions" ON day_completions
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
