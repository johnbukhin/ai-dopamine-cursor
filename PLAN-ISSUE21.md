# Feature Implementation Plan — Issue #21

**Overall Progress:** `86%`

## TLDR
Persist all webapp user data to Supabase so nothing is lost on page refresh. Fix the auth session restore bug (logout on refresh), then add 4 new tables: `user_app_state`, `check_ins`, `plan_progress`, `coach_messages`. Wire each component to read/write from Supabase without blocking the UI.

## Critical Decisions
- **Plan cycles**: `plan_started_at` stored in `user_app_state`; `plan_progress` rows carry the same timestamp. Restarting updates `user_app_state.plan_started_at` — old rows preserved but excluded from queries
- **Task granularity**: individual task keys (`m-0`, `m-1`, `e-0`, `e-1`) per day per cycle — not day-level only
- **Plan28 props**: `completedTasks`/`onTaskToggle` props already exist in App.tsx but are ignored in `DayDetails`; wire them up properly
- **Coach welcome message**: never stored in DB — always prepended at load time; DB holds only real user↔AI exchanges
- **Coach history cap**: none — stored forever in a single jsonb array per user
- **All DB writes**: async, non-blocking — UI updates optimistically, Supabase write follows
- **RLS**: `user_id = auth.uid()` on all 4 new tables (anon key, client-side reads)

## Tasks

- [ ] 🟥 **Step 1: Supabase migrations (manual)**
  - [ ] 🟥 Run the following SQL in Supabase SQL editor:
    ```sql
    CREATE TABLE user_app_state (
      user_id uuid PRIMARY KEY REFERENCES auth.users,
      plan_started_at timestamptz DEFAULT now()
    );
    ALTER TABLE user_app_state ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage own app state"
      ON user_app_state FOR ALL USING (user_id = auth.uid());

    CREATE TABLE check_ins (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      date timestamptz NOT NULL,
      status text NOT NULL,
      triggers jsonb,
      emotions jsonb,
      reaction text,
      coping_strategies jsonb,
      notes text,
      ai_insight text,
      time_of_day text,
      tasks_completed boolean,
      created_at timestamptz DEFAULT now()
    );
    ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage own check-ins"
      ON check_ins FOR ALL USING (user_id = auth.uid());

    CREATE TABLE plan_progress (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      plan_started_at timestamptz NOT NULL,
      day_number int NOT NULL,
      task_key text NOT NULL,
      completed_at timestamptz DEFAULT now(),
      UNIQUE (user_id, plan_started_at, day_number, task_key)
    );
    ALTER TABLE plan_progress ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage own plan progress"
      ON plan_progress FOR ALL USING (user_id = auth.uid());

    CREATE TABLE coach_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
      messages jsonb NOT NULL DEFAULT '[]'::jsonb,
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage own coach messages"
      ON coach_messages FOR ALL USING (user_id = auth.uid());
    ```

- [x] 🟩 **Step 2: Fix refresh-logout bug**
  - [x] 🟩 In `Login.tsx` `tryAutoAuth`: add `supabase.auth.getSession()` as the first check before the URL hash and localStorage fallbacks — if a valid native session exists, call `onLogin()` and return immediately

- [x] 🟩 **Step 3: Load/save check-ins**
  - [x] 🟩 In `App.tsx`: after auth, fetch all `check_ins` rows for the current user ordered by `date asc`; map DB rows to `CheckIn` type (parse `date` as `Date` object); set state
  - [x] 🟩 In `DailyCheckIn.tsx`: after `onComplete` builds the `CheckIn` object, insert a row to `check_ins` (use `user_id` from `supabase.auth.getUser()`); fire-and-forget, never blocks UI
  - [x] 🟩 Non-blocking: insert fires after `onComplete(checkIn)` is called — UI doesn't wait

- [x] 🟩 **Step 4: Load/save plan progress**
  - [x] 🟩 In `App.tsx`: after auth, fetch `user_app_state` row (upsert if missing with `plan_started_at = now()`); fetch all `plan_progress` rows matching `user_id` + `plan_started_at`; reconstruct `Record<number, Set<string>>` and set `completedPlanTasks`
  - [x] 🟩 In `App.tsx` `handlePlanTaskToggle`: if task is being checked → upsert to `plan_progress`; if unchecked → delete; optimistic UI update fires before DB write
  - [x] 🟩 In `Plan28.tsx` `DayDetails`: replaced internal `checkedTasks` state with `completedTasks[day.day] ?? new Set()` from outer scope; `handleCheck` delegates to `onTaskToggle`

- [x] 🟩 **Step 5: Load/save coach messages**
  - [x] 🟩 In `App.tsx`: after auth, fetch `coach_messages` row for user; if found, set `chatHistory` to `[welcomeMessage, ...storedMessages]`; if not found, keep default (welcome message only)
  - [x] 🟩 In `AICoach.tsx`: after each assistant response, upsert `coach_messages` with all messages **excluding** index 0 (hardcoded welcome); fire-and-forget
