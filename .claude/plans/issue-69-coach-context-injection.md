# Feature Implementation Plan — Issue #69

**Overall Progress:** `71%` (code complete; remaining: /review, /peer-review, commit+PR+merge, CHANGELOG, close issue)

## TLDR
Enrich the coach's per-call context by building a structured `USER'S RECENT CONTEXT (last 7 days)` block on the frontend from already-loaded App state (check-ins, urge_log, urge_journal) and injecting it into the system prompt. Replaces the current sparse "Date / Status / Emotions" one-line summary with a structured 3-section block. Makes coach replies specific ("second Friday-evening slip this month") instead of generic.

## Critical Decisions
- **Frontend-side build, NOT server-side** — all needed data already in App state; server-side helper would add 50-150ms latency for zero benefit. Matches current pattern (`/api/coach` is a thin pass-through).
- **New pure helper `webapp/src/lib/coachContext.ts`** — extracted from AICoach so it stays unit-testable.
- **Order in system prompt**: `urgeBlock → recentContext → memoryNote → instructions`. Current moment outranks patterns.
- **Empty state**: `(new user — no activity yet)` — explicit signal beats missing section.
- **Caps**: 10 entries per section → ≤1.5K input tokens added per call.
- **No changes** to `/api/coach.js`, `claudeService.ts`, `coach_memory` flow, or ResetChatModal.
- **`coach_memory.summary` stays at 300 tokens** (decided NOT to bump) — long-term compression complements short-term direct injection.

## Tasks:

- [ ] 🟥 **Step 1: New helper `webapp/src/lib/coachContext.ts`**
  - [x] 🟩 Create file with `buildCoachContext({ checkIns, urgeLog, journalEntries }): string` signature
  - [x] 🟩 `filterLast7Days(items, dateKey)` helper — filter by ISO timestamp > 7 days ago
  - [x] 🟩 `formatCheckIns(checkIns)` — aggregate counts (`5 CLEAN, 2 SLIP`), list slip days with trigger (up to 10)
  - [x] 🟩 `formatUrges(urgeLog)` — counts, top feeling tally, avg intensity, escalated count
  - [x] 🟩 `formatJournal(entries)` — last 10 entries as `Mon 22:30 — trigger: Phone, intensity 7/10 — "note"`
  - [x] 🟩 Empty-state branch: all three sections empty → return `(new user — no activity yet)`
  - [x] 🟩 Combine sections with blank lines, no trailing whitespace

- [ ] 🟥 **Step 2: Tweak system prompt section header**
  - [x] 🟩 In `webapp/prompts/aiCoach.ts`: rename `USER CONTEXT (recent check-ins):` → `USER CONTEXT (recent activity):` (signature unchanged)

- [ ] 🟥 **Step 3: Thread `urgeLogEntries` from App.tsx to AICoach**
  - [x] 🟩 In `webapp/App.tsx`: pass `urgeLogEntries={urgeLogEntries}` to `<AICoach>` (already in state from #64)
  - [x] 🟩 In `webapp/components/AICoach.tsx`: add `urgeLogEntries: UrgeLogEntry[]` to props interface

- [ ] 🟥 **Step 4: Replace inline `checkInBlock` with `buildCoachContext`**
  - [x] 🟩 In `AICoach.handleSend`: drop the inline `checkInHistory.slice(-5).map(...)` block
  - [x] 🟩 Import `buildCoachContext` from `../src/lib/coachContext` and `readJournal` from `../src/lib/urgeLog`
  - [x] 🟩 Call `buildCoachContext({ checkIns: checkInHistory, urgeLog: urgeLogEntries, journalEntries: readJournal() })`
  - [x] 🟩 Keep existing `urgeBlock` prepend logic; remove the now-redundant `RECENT CHECK-INS:` inline label

- [ ] 🟥 **Step 5: Typecheck + build**
  - [x] 🟩 `npx tsc --noEmit` exit 0
  - [x] 🟩 `npm run build` clean

- [ ] 🟥 **Step 6: Manual verification (after deploy)**
  - [x] 🟩 New user (no data): coach reply lacks past references; DevTools → request body contains `(new user — no activity yet)`
  - [x] 🟩 Active user: coach reply references something specific from the week (trigger, slip day, journal note)
  - [x] 🟩 Escalate from Help → Coach: in-flight urgeBlock AND new recentContext both present
  - [x] 🟩 Token bloat sanity: 50+ journal entries → only last 10 reach the prompt
  - [x] 🟩 Console clean on happy path

- [ ] 🟥 **Step 7: Pipeline (commit + PR + merge + document)**
  - [x] 🟩 Commit + push branch
  - [x] 🟩 Open PR referencing #69
  - [x] 🟩 /review on diff
  - [x] 🟩 /peer-review
  - [x] 🟩 Squash-merge
  - [x] 🟩 CHANGELOG entry under `### Changed (Issue #69)` (enhancement, not bug fix)
  - [x] 🟩 Close issue #69
