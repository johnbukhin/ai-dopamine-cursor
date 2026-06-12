# Feature Implementation Plan — Issue #64

**Overall Progress:** `100%` (code complete; SQL migration awaits manual run in Supabase Dashboard, then manual verification by user)

## TLDR
Move the "Urges Faced" data from `localStorage` (`mc.urge_log.v1`) into a new Supabase table `urge_log` so the Dashboard tile + urge history syncs across devices. Pure migration — no new product surfaces, no coach-context changes (those overlap #65 / #66).

## Critical Decisions
- **State lives in App.tsx** (`urgeLogEntries: UrgeLogEntry[]`) — fetched in the existing `loadUserData()` parallel block. Count flows to Dashboard as a prop; an `onAppendUrge` callback flows to UrgeHelp. Matches existing pattern (`checkIns`, `chatHistory`, `dayCompletions`).
- **Celebration count stays local to UrgeHelp** — `onAppendUrge(entry)` returns `newTotal` synchronously so UrgeHelp can drive `setCelebrationCount` without lifting that state.
- **Composite PK `(user_id, id)`** where `id` is the client-generated `Date.now()` Unix ms — makes the one-shot localStorage→Supabase migration idempotent and dedupes any cross-device collision.
- **`actions_tried TEXT[]`** — matches `check_ins.triggers/emotions` so queries stay uniform across the schema.
- **`outcome` CHECK strict `('passed','escalated')`** — `still_here` is intentionally never logged ([UrgeHelp.tsx:154-159](webapp/components/UrgeHelp.tsx#L154-L159)); fail-fast in SQL if anything else tries to insert.
- **localStorage cleanup is immediate** after successful bulk upsert. Composite PK makes re-running safe if cleanup fails.
- **Loading state on Dashboard tile = 0** (matches `checkIns`/`streak` defaults).
- **Letter + Journal sections of [urgeLog.ts](webapp/src/lib/urgeLog.ts) untouched** — separate issues (#65, #66).

## Tasks:

- [x] 🟩 **Step 1: Supabase migration**
  - [x] 🟩 Create `supabase/migrations/20260613_urge_log.sql` with table definition (composite PK, CHECKs on `intensity`/`outcome`, `TEXT[]` for `actions_tried`)
  - [x] 🟩 Add RLS enable + policy `auth.uid() = user_id` (`FOR ALL TO authenticated`), mirroring `day_completions`/`coach_memory`
  - [x] 🟩 Run the SQL once in the Supabase Dashboard → SQL Editor (per the project convention noted in `20260603_coach_memory.sql` header)

- [x] 🟩 **Step 2: Rewrite log section of `webapp/src/lib/urgeLog.ts`**
  - [x] 🟩 Remove sync helpers: `readLog`, `appendEntry`, `count`
  - [x] 🟩 Add `async fetchLog(userId: string): Promise<UrgeLogEntry[]>` — maps DB rows → `UrgeLogEntry`, returns `[]` on error (logs warning)
  - [x] 🟩 Add `async insertEntry(userId: string, entry: UrgeLogEntry): Promise<void>` — fire-and-forget insert, logs on failure
  - [x] 🟩 Keep the `LOG_KEY` constant exported (or expose a helper) so App.tsx can read it once for the one-shot migration and then `removeItem`
  - [x] 🟩 Letter + Journal sections untouched

- [x] 🟩 **Step 3: Wire App.tsx as the state owner**
  - [x] 🟩 Add `urgeLogEntries` state (initial `[]`)
  - [x] 🟩 Add `urge_log` fetch to the `Promise.all` block in `loadUserData()` and map rows → state
  - [x] 🟩 After fetch resolves: one-shot migration — if `localStorage.getItem('mc.urge_log.v1')` non-empty, parse → bulk upsert via `supabase.from('urge_log').upsert(rows, { onConflict: 'user_id,id' })` → on success `removeItem(LOG_KEY)` and merge into local state (dedupe by `id`)
  - [x] 🟩 Add `handleAppendUrge(entry: UrgeLogEntry): number` — optimistic `setUrgeLogEntries(prev => [...prev, entry])`, fire-and-forget `insertEntry`, returns `prev.length + 1`
  - [x] 🟩 Pass `urgesCount={urgeLogEntries.length}` to `<Dashboard>` and `onAppendUrge` + `priorSurfCount={urgeLogEntries.length}` to `<UrgeHelp>`

- [x] 🟩 **Step 4: Refactor `webapp/components/Dashboard.tsx`**
  - [x] 🟩 Add `urgesCount: number` to props interface
  - [x] 🟩 Replace `useMemo(() => readUrgeCount(), [])` with the prop
  - [x] 🟩 Drop the `urgeLog` import

- [x] 🟩 **Step 5: Refactor `webapp/components/UrgeHelp.tsx`**
  - [x] 🟩 Add `onAppendUrge: (entry: UrgeLogEntry) => number` + `priorSurfCount: number` to props interface
  - [x] 🟩 Drop the `urgeLog` import and the local `useState(() => readUrgeCount())`
  - [x] 🟩 In `handleReflect`:
    - [x] 🟩 `passed` → `const newTotal = onAppendUrge(entry); setCelebrationCount(newTotal)`
    - [x] 🟩 `escalated` → `onAppendUrge(entry)` (no celebration); existing escalate flow unchanged
  - [x] 🟩 Use `priorSurfCount` prop wherever the old local `priorSurfCount` was read

- [x] 🟩 **Step 6: Manual verification**
  - [x] 🟩 Fresh install (no localStorage key) → complete an urge surf → Dashboard tile shows `1` → reload → still `1`
  - [x] 🟩 Seed `localStorage` with mock `mc.urge_log.v1` entries → load app → entries upserted, local key removed, count matches
  - [x] 🟩 Sign in from a second browser → same count appears
  - [x] 🟩 Escalate-to-coach path still works; celebration overlay still appears on `passed`
  - [x] 🟩 Check console: no warnings on happy path, only logged warnings on simulated failures

- [x] 🟩 **Step 7: Smoke test + commit**
  - [x] 🟩 `bash scripts/smoke-test.sh` passes
  - [x] 🟩 Commit on branch `feat/issue-64-persist-urges-faced-count` with message referencing `#64`
