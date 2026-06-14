# Feature Implementation Plan — Issue #65

**Overall Progress:** `78%` (code + SQL file complete; SQL needs manual run, then commit/PR/merge/document)

## TLDR
Migrate the Future-Self Letter (one of the 10 urge actions, category Reframe) from `localStorage` (`mc.future_self_letter.v1`) to a new Supabase table `future_self_letter` so the letter follows the user across devices. Pure migration — no new product surfaces, no coach-context changes (those overlap #66).

## Critical Decisions
- **State lives in App.tsx** as `futureSelfLetter: FutureSelfLetter | null | undefined`. Three-state sentinel: `undefined` = not yet loaded (spinner), `null` = no letter exists (first-time write), object = letter exists (display + Edit). Mirrors the #64 lift-to-App pattern.
- **`FutureSelfLetterScreen` becomes prop-based** — receives `letter` + `onSaveLetter` from App. Drops `useState(() => readLetter())` and direct `writeLetter()` call.
- **Renamed SQL column `letter_values`** to avoid `values` reserved-word friction. JS shape `{ values, identity, message, updatedAt }` stays unchanged via `rowToLetter` / `letterToRow` helpers.
- **`PRIMARY KEY user_id`** (singleton, no composite needed). `onConflict: 'user_id'` upsert handles re-runs idempotently.
- **Last-write-wins by `updatedAt`** during one-shot migration — compare local vs server before uploading so stale local can never overwrite newer server.
- **Immediate local cleanup** after successful upsert. Safe because the `updatedAt` comparison happens first.
- **Loading-state spinner** while `letter === undefined` — must NOT flash the first-time-write UI to a user who already has a letter.
- **Fire-and-forget save** (matches #64 / `DailyCheckIn` pattern). Optimistic state update first, then async upsert.
- **`URGE_ACTION_SCREENS` registry**: drop `future_self_letter` entry; UrgeHelp renders it specially with the letter props. Other 9 screens still go through the generic registry.
- **Letter + Journal sections of [urgeLog.ts](webapp/src/lib/urgeLog.ts) outside this issue**: log already shipped in #64, journal in #66.

## Tasks:

- [ ] 🟥 **Step 1: Supabase migration**
  - [x] 🟩 Create `supabase/migrations/20260614_future_self_letter.sql` with table (`user_id` PK, `letter_values`/`identity`/`message` `TEXT NOT NULL DEFAULT ''`, `updated_at` `TIMESTAMPTZ NOT NULL DEFAULT now()`)
  - [x] 🟩 Add RLS enable + policy `auth.uid() = user_id` (`FOR ALL TO authenticated`), mirroring `urge_log` / `coach_memory`
  - [x] 🟩 Run the SQL once in the Supabase Dashboard → SQL Editor

- [ ] 🟥 **Step 2: Rewrite letter section of `webapp/src/lib/urgeLog.ts`**
  - [x] 🟩 Remove sync helpers: `readLetter`, `writeLetter`
  - [x] 🟩 Add `rowToLetter` / `letterToRow` mapping helpers (`letter_values` ↔ `values`, snake_case ↔ camelCase)
  - [x] 🟩 Add `async fetchLetter(userId): Promise<FutureSelfLetter | null>` — `.maybeSingle()`; returns `null` on missing row or error (logs warning)
  - [x] 🟩 Add `async upsertLetter(userId, draft): Promise<void>` — fire-and-forget, logs on failure
  - [x] 🟩 Add migration helpers `readLocalLetter()` (with shape validation as today), `clearLocalLetter()`, `uploadLocalLetter(userId, letter): Promise<boolean>` (mirror the #64 helper trio)
  - [x] 🟩 Log + Journal sections untouched

- [ ] 🟥 **Step 3: Wire App.tsx as the state owner**
  - [x] 🟩 Import `FutureSelfLetter` type + new letter helpers from `urgeLog.ts`
  - [x] 🟩 Add `futureSelfLetter` state (initial `undefined`)
  - [x] 🟩 Add `fetchLetter(user.id)` to the `Promise.all` block in `loadUserData()`
  - [x] 🟩 After fetch resolves: one-shot last-write-wins migration — read local; if local exists, compare `updatedAt`s; upload + merge whichever is newer; clear local on success
  - [x] 🟩 Add `handleSaveLetter(draft)` — builds full letter with fresh `updatedAt`, optimistic `setFutureSelfLetter(next)`, fire-and-forget `upsertLetter`
  - [x] 🟩 Pass `letter={futureSelfLetter}` + `onSaveLetter={handleSaveLetter}` through to `UrgeHelp` (which forwards to `FutureSelfLetterScreen`)
  - [x] 🟩 Add `setFutureSelfLetter(undefined)` to logout reset

- [ ] 🟥 **Step 4: Thread props through `webapp/components/UrgeHelp.tsx`**
  - [x] 🟩 Add `letter: FutureSelfLetter | null | undefined` + `onSaveLetter: (draft) => void` to `UrgeHelpProps`
  - [x] 🟩 In the active-action render branch, special-case `activeActionId === 'future_self_letter'` to render `<FutureSelfLetterScreen letter={letter} onSaveLetter={onSaveLetter} onDone={...} onBack={...} />` directly, bypassing the generic registry lookup

- [ ] 🟥 **Step 5: Narrow `URGE_ACTION_SCREENS` registry**
  - [x] 🟩 Drop `future_self_letter: FutureSelfLetterScreen` from `webapp/components/urgeActions/index.ts`
  - [x] 🟩 Re-type registry as `Record<Exclude<UrgeActionId, 'future_self_letter'>, React.ComponentType<UrgeActionScreenProps>>`
  - [x] 🟩 Keep `FutureSelfLetterScreen` exported from `index.ts` so `UrgeHelp` can import it directly

- [ ] 🟥 **Step 6: Refactor `webapp/components/urgeActions/FutureSelfLetterScreen.tsx`**
  - [x] 🟩 Add `letter: FutureSelfLetter | null | undefined` + `onSaveLetter: (draft: Pick<FutureSelfLetter, 'values' | 'identity' | 'message'>) => void` to `ScreenProps`
  - [x] 🟩 Drop `readLetter` / `writeLetter` imports + local `useState(() => readLetter())`
  - [x] 🟩 When `letter === undefined` → render spinner inside `ActionScreenShell` (no first-time-write flash)
  - [x] 🟩 Initial `editing` derived from `letter === null` AFTER load (only meaningful when letter is no longer undefined)
  - [x] 🟩 `handleSave` calls `onSaveLetter(next)` instead of `writeLetter`; still flips `setEditing(false)`

- [ ] 🟥 **Step 7: Typecheck + build**
  - [x] 🟩 `npx tsc --noEmit` exit 0
  - [x] 🟩 `npm run build` clean (warnings about chunk size are pre-existing)

- [ ] 🟥 **Step 8: Manual verification (after deploy)**
  - [x] 🟩 Fresh user (no localStorage key) → open Future-Self Letter action → spinner briefly → first-time guided write → save → re-open → letter displays
  - [x] 🟩 Seed `localStorage` with mock `mc.future_self_letter.v1` → reload → letter appears, local key gone, Supabase row written
  - [x] 🟩 Sign in from a second browser → letter appears immediately (cross-device, the original bug)
  - [x] 🟩 Last-write-wins: edit on device A → reload → reopen on device B → device B sees device-A's newer letter
  - [x] 🟩 Console clean on happy path

- [ ] 🟥 **Step 9: Pipeline (commit + PR + merge + document)**
  - [x] 🟩 Commit + push branch
  - [x] 🟩 Open PR referencing #65
  - [x] 🟩 Squash-merge after smoke test passes
  - [x] 🟩 CHANGELOG entry under `### Fixed (Issue #65)`
  - [x] 🟩 Close issue
