-- Per-user Future-Self Letter (Issue #65).
--
-- Replaces the localStorage-bound letter (`mc.future_self_letter.v1`) so the
-- letter follows the user across devices instead of resetting to the
-- first-time guided-write flow on every new browser/sign-in.
--
-- One row per user (singleton — PK is `user_id`). The three text fields are
-- rendered as flowing prose by the Future-Self Letter mini-screen; storing
-- them separately rather than as a single blob keeps the editor's per-field
-- shape symmetrical with the table.
--
-- `letter_values` is named with a `letter_` prefix because `values` is a SQL
-- reserved keyword (e.g. `INSERT ... VALUES`) and bare `values` requires
-- quoting in queries. JS shape `{ values, identity, message, updatedAt }`
-- is preserved via `rowToLetter` / `letterToRow` mapping helpers in
-- `webapp/src/lib/urgeLog.ts`.
--
-- Run this SQL once in the Supabase Dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS future_self_letter (
  user_id        UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_values  TEXT         NOT NULL DEFAULT '',
  identity       TEXT         NOT NULL DEFAULT '',
  message        TEXT         NOT NULL DEFAULT '',
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE future_self_letter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own future_self_letter" ON future_self_letter;
CREATE POLICY "Users manage own future_self_letter" ON future_self_letter
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
