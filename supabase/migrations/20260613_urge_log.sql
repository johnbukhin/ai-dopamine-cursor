-- Per-user log of completed urge-surf sessions (Issue #64).
--
-- Replaces the localStorage-bound urge log (`mc.urge_log.v1`) so the
-- Dashboard "Urges Surfed" tile and any future history surfaces follow
-- the user across devices.
--
-- One row per terminal urge session — either `passed` (the user surfed
-- it out) or `escalated` (handed off to Coach). Mid-session `still_here`
-- feedback is intentionally NOT logged (see webapp/components/UrgeHelp.tsx
-- handleReflect); the CHECK constraint enforces that invariant in SQL too.
--
-- `id` is the client-generated `Date.now()` Unix ms timestamp; the composite
-- primary key `(user_id, id)` makes the one-shot localStorage → Supabase
-- migration idempotent (re-running the upsert produces no duplicates).
--
-- Run this SQL once in the Supabase Dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS urge_log (
  id            BIGINT       NOT NULL,
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ended_at      TIMESTAMPTZ  NOT NULL,
  feeling       TEXT,
  intensity     SMALLINT     CHECK (intensity IS NULL OR (intensity BETWEEN 1 AND 10)),
  actions_tried TEXT[]       NOT NULL DEFAULT '{}',
  outcome       TEXT         NOT NULL CHECK (outcome IN ('passed', 'escalated')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE urge_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own urge_log" ON urge_log;
CREATE POLICY "Users manage own urge_log" ON urge_log
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
