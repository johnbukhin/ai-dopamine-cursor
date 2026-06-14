# Feature Implementation Plan — Issue #71

**Overall Progress:** `83%` (code + typecheck/build complete; remaining: review, peer-review, commit, PR, merge, CHANGELOG, close)

## TLDR
Expand the `USER CONTEXT (recent activity)` block introduced in #69 so the coach stops over-claiming on tiny windows and gets the longer-horizon signals it currently lacks. Adds 4 new sections (Future-Self Letter, Plan Status, Lifetime Stats, Today), explicit timeframe labels, memory-note staleness annotation, and prompt rules for how to read multi-timeframe data + calibrate confidence by sample size. Pure frontend, no schema, no new fetches except extending one existing query.

## Critical Decisions
- **Identity-first section order**: `Letter → Plan → Lifetime → 7 days → Today`. Therapeutic frame: who-you-are → trajectory → patterns → right-now.
- **`getMemoryNote()` returns `{summary, updatedAt} | null`** instead of `string | null` — cohesive single fetch + cache; coach gets staleness annotation in `PRIOR CONVERSATION SUMMARY` header.
- **Plan day > 28 displays honestly**: `Day 35 of 28 (plan complete)` — lets coach frame maintenance-phase coaching differently from active-curriculum coaching.
- **Last slip format**: `Last slip: 5 days ago (Fri evening, trigger: stress)` — relative time + behavioral context one line.
- **Memory staleness threshold**: omit annotation when <1 day; otherwise show in days/weeks.
- **All new data already in App state** — no new Supabase fetches except adding one column to the existing `coach_memory` SELECT.
- **No schema changes, no new endpoints.**

## Tasks:

- [ ] 🟥 **Step 1: Extend `coachContext.ts` with new sections + timeframe labels**
  - [x] 🟩 Extend `BuildCoachContextInput` with `streak: number`, `planStartedAt: string | null`, `letter: FutureSelfLetter | null | undefined`
  - [x] 🟩 Add timeframe labels to existing section headers: `Check-ins (last 7 days)`, `Urges surfed (last 7 days)`, `Recent journal entries (most recent 10)`
  - [x] 🟩 New `formatLetter(letter)` → `USER'S OWN WORDS (Future-Self Letter):` with Values/Identity/Message; omit if `letter` is null/undefined
  - [x] 🟩 New `formatPlanStatus(planStartedAt, now)` → `PLAN STATUS: Day N of 28 (started YYYY-MM-DD)`; appends `(plan complete)` when day > 28; omit if `planStartedAt` null
  - [x] 🟩 New `formatLifetime(checkIns, urgeLog, streak, now)` → `LIFETIME (since YYYY-MM-DD, N days):` block with total check-ins (CLEAN/SLIP breakdown), total urges (with escalated count), current streak, and `Last slip: 5 days ago (Fri evening, trigger: stress)` line (omitted if no slips ever); start date from `checkIns[0]?.date`
  - [x] 🟩 New `formatToday(checkIns, urgeLog, journalEntries, now)` → `TODAY (YYYY-MM-DD):` block with today's check-in count + status breakdown, today's urge count (passed/escalated split), today's journal count; omit section entirely if all three are zero
  - [x] 🟩 Reorder output: `[Letter, PlanStatus, Lifetime, CheckIns, Urges, Journal, Today].filter(Boolean).join('\n\n')`
  - [x] 🟩 Empty-state branch updated: only emit `(new user — no activity yet)` when ALL sections (including Letter and Plan) are empty

- [ ] 🟥 **Step 2: Refactor `getMemoryNote()` to return `{summary, updatedAt}`**
  - [x] 🟩 In `webapp/services/claudeService.ts`: change return type to `{summary: string; updatedAt: string} | null`
  - [x] 🟩 Extend SELECT: `.select('summary, updated_at')`
  - [x] 🟩 Cache stores the tuple object; `invalidateMemoryCache` unchanged
  - [x] 🟩 `getCoachResponse` extracts `memoryNote?.summary` + `memoryNote?.updatedAt`, passes both to `buildCoachSystemPrompt`

- [ ] 🟥 **Step 3: Extend `buildCoachSystemPrompt` signature + add new prompt sections**
  - [x] 🟩 In `webapp/prompts/aiCoach.ts`: add `memoryNoteUpdatedAt?: string | null` as 3rd param
  - [x] 🟩 Render staleness annotation in PRIOR CONVERSATION SUMMARY header — format using a small `formatStaleness(updatedAt, now)` helper (e.g. `(last refreshed 3 days ago)`); omit when <1 day old or `updatedAt` missing
  - [x] 🟩 Add new section `# How to read context` BEFORE the USER CONTEXT block, containing:
    - Data-limits rules (recent-activity is last 7 days only, lifetime is totals, journal is last 10)
    - Conflict-resolution rule (when recent contradicts memory note, prefer recent; user's own words are ground truth for values)
  - [x] 🟩 Add sample-size calibration bullet to the existing `# What NOT to do` section:
    > Don't make absolute pattern claims (`you always X`, `you keep doing Y`) when supporting data is fewer than 10 events. Use tentative framing.
  - [x] 🟩 Update doc-comment for `context` arg to mention new sections

- [ ] 🟥 **Step 4: Thread new props from App.tsx → AICoach → buildCoachContext**
  - [x] 🟩 In `webapp/App.tsx`: pass `streak={streak}`, `planStartedAt={planStartedAt}`, `letter={futureSelfLetter}` to `<AICoach>`
  - [x] 🟩 In `webapp/components/AICoach.tsx`: add 3 new props to interface (with JSDoc); accept in destructure
  - [x] 🟩 In `handleSend`: pass the 3 new fields into `buildCoachContext({...})` input

- [ ] 🟥 **Step 5: Typecheck + build**
  - [x] 🟩 `npx tsc --noEmit` exit 0
  - [x] 🟩 `npm run build` clean

- [ ] 🟥 **Step 6: Pipeline (review → peer-review → PR → merge → document)**
  - [x] 🟩 Commit + push branch
  - [x] 🟩 `/review` on diff
  - [x] 🟩 `/peer-review`
  - [x] 🟩 Open PR referencing #71
  - [x] 🟩 Squash-merge
  - [x] 🟩 CHANGELOG entry under `### Changed (Issue #71)`
  - [x] 🟩 Close issue #71

## Manual verification (after deploy)
- [ ] 🟥 Active user opens Coach → DevTools Network → request body's `systemPrompt` contains all expected sections in order: Letter, Plan Status, Lifetime, Check-ins (last 7 days), Urges surfed (last 7 days), Journal, Today
- [ ] 🟥 Memory note staleness annotation appears when memory exists and is >1 day old; omitted when fresh or absent
- [ ] 🟥 Plan day display correct for active plan (Day N of 28) AND past Day 28 (`Day 35 of 28 (plan complete)`)
- [ ] 🟥 Coach asks user "how many check-ins do I have?" → answer cites both 7-day window AND lifetime totals (not just window)
- [ ] 🟥 Coach references letter values when relevant ("you said your family matters most…")
- [ ] 🟥 New user (no data, no plan, no letter) → context contains only `(new user — no activity yet)`
- [ ] 🟥 Console clean on happy path
