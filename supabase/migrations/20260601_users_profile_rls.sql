-- Enable RLS on users_profile and let each authenticated user read their own row.
--
-- Background: the table was created manually in the Supabase Dashboard before
-- migrations were checked into the repo. All existing writers (funnel/api/
-- provision-account.js, funnel/api/create-user.js) use SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS — so enabling it is safe and does not break ingestion.
--
-- The webapp's Profile tab (Data sub-tab, issue #52) reads quiz_answers from
-- this table using the anon key + the user's session JWT; that requires the
-- SELECT policy below so auth.uid() can match the row's id.
--
-- Run this once in the Supabase Dashboard → SQL Editor.

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON users_profile;
CREATE POLICY "Users read own profile" ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
