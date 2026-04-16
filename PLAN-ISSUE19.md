# Feature Implementation Plan — Issue #19

**Overall Progress:** `75%`

## TLDR
Store structured onboarding quiz data (gender, age group, scores, challenge, goal, funnel version) as queryable columns in `users_profile` alongside the existing raw `quiz_answers` blob. Three files touched: Supabase migration, `create-user.js` API handler, `app.js` account submission.

## Critical Decisions

- **Score format:** `numeric(4,3)` float (store `pct` 0.0–1.0 from `Scoring.calculate()`) — normalized across funnels, enables range queries, labels derived at read time
- **Age field:** Single `age_group` column; client tries `age_selection` (V2) then `question_age` (V1) — same data point, one column
- **Goal for V1:** Send explicit `null` — V1 has no `question_33`, so falling through to `Scoring.getGoal()`'s default `'Focus levels'` would be misleading noise
- **`funnel_version` source:** Parse from `window.location.pathname` at runtime — no config changes needed, works for any future funnel slug
- **Profile write stays non-fatal:** New columns follow existing pattern — `profileError` is logged and swallowed, never blocks account creation

## Tasks

- [x] 🟩 **Step 1: Supabase migration**
  - [x] 🟩 Add 10 new columns to `users_profile` via Supabase dashboard SQL editor:
    ```sql
    alter table users_profile add column if not exists gender text;
    alter table users_profile add column if not exists age_group text;
    alter table users_profile add column if not exists main_challenge text;
    alter table users_profile add column if not exists goal text;
    alter table users_profile add column if not exists score_overall numeric(4,3);
    alter table users_profile add column if not exists score_dopamine_sensitivity numeric(4,3);
    alter table users_profile add column if not exists score_emotional_regulation numeric(4,3);
    alter table users_profile add column if not exists score_pattern_stage numeric(4,3);
    alter table users_profile add column if not exists score_physical_impact numeric(4,3);
    alter table users_profile add column if not exists funnel_version text;
    ```

- [x] 🟩 **Step 2: Extend `handleAccountFormSubmit` in `app.js`**
  - [x] 🟩 Compute scores: `const scores = Scoring.calculate()`
  - [x] 🟩 Parse funnel version: `window.location.pathname.match(/\/funnels\/([^/]+)\//)?.[1] || null`
  - [x] 🟩 Resolve age group: `State.getAnswer('age_selection') || State.getAnswer('question_age') || null`
  - [x] 🟩 Resolve goal: only call `Scoring.getGoal()` if `State.getAnswer('question_33')` exists, otherwise `null`
  - [x] 🟩 Add 6 new fields to the `fetch` body: `gender`, `ageGroup`, `mainChallenge`, `goal`, `scores` (object with 5 `pct` values), `funnelVersion`

- [x] 🟩 **Step 3: Extend `create-user.js` API handler**
  - [x] 🟩 Destructure new fields from `req.body`: `gender`, `ageGroup`, `mainChallenge`, `goal`, `scores`, `funnelVersion`
  - [x] 🟩 Add new columns to the `supabase.from('users_profile').insert(...)` call

- [ ] 🟥 **Step 4: Validate**
  - [ ] 🟥 Run through V2 funnel end-to-end, create test account, verify all 10 new columns populated in Supabase
  - [ ] 🟥 Run through V1 funnel, verify `goal` is `null` and `age_group` reads from `question_age`
  - [ ] 🟥 Confirm `profileError` path: if insert fails, account creation still succeeds
