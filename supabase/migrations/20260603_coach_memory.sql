-- AI Coach memory note for "Save & start fresh" (Issue #54, Scope 2).
--
-- One overwritable summary per user. When the user clicks "Save & start
-- fresh" in the Coach reset modal, the server summarizes the prior chat
-- (including any existing summary in the input → aggregated, not stacked)
-- into ≤300 tokens and upserts here. The next Coach response prepends
-- this note to its system context so continuity is preserved without
-- ballooning the system prompt across resets.

CREATE TABLE IF NOT EXISTS coach_memory (
  user_id     UUID         NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary     TEXT         NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE coach_memory ENABLE ROW LEVEL SECURITY;

-- Same pattern as coach_messages: users own their row in full.
DROP POLICY IF EXISTS "Users manage own coach_memory" ON coach_memory;
CREATE POLICY "Users manage own coach_memory" ON coach_memory
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
