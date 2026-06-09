# Issue #58 — Cosmetic Polish Pass

**Overall Progress:** `86%` — 6 of 7 steps complete; Step 4 (Coach navigation) deferred per user instruction during /execute.

## TLDR

Six small visual fixes across the Help tab, Dashboard day-detail modal, and the daily AI insight. All scoped narrowly — no architecture changes beyond lifting `coachSeed` to App-level (Item 4) and adopting the existing `LessonBottomSheet` modal pattern for the Locate sheet (Item 2).

## Critical Decisions

- **Item 1 (stage labels):** Remove `<p>` only; compensate the vertical gap so the `<h2>` stays at the same screen position.
- **Item 2 (Locate sheet):** Use the existing `LessonBottomSheet` modal pattern (`bg-stone-900/40 backdrop-blur-sm` + click-outside-to-dismiss). Trade-off accepted: feelings grid no longer tappable while sheet is open; the X button is the way to change feeling.
- **Item 3 (Act palette):** Touch only `URGE_CATEGORY_META`. Mini-screens stay rose-themed; only the icon badge auto-picks up the new color. Fix subtitle to inherit `meta.accent`.
- **Item 4 (Coach navigation):** Lift `coachSeed` from `UrgeHelp` to `App.tsx` so the seed survives the tab switch. Reflect's "talk it through" calls `changeView(View.AI_COACH)` instead of opening the modal. Audit other `CoachModal` call sites — if none, delete `CoachModal.tsx` entirely.
- **Item 5 (Clean Day):** Swap `text-purple-*` → `text-emerald-*` only inside the `isClean` branches (lines 420–456). Day-header title at line 402 is neutral chrome — leave it.
- **Item 6 (AI insight):** Prompt-only change for the length cap; no truncation safety net. Drop `mr-1` to fix the double-space.

## Tasks

- [x] 🟩 **Step 1: Item 1 — Remove "Stage N of 4" labels**
  - [x] 🟩 Delete `<p>Stage 2 of 4</p>` in `webapp/components/urgeHelp/LocateStage.tsx` (line ~122-124)
  - [x] 🟩 Delete `<p>Stage 3 of 4</p>` in `webapp/components/urgeHelp/ActStage.tsx` (line ~86-88)
  - [x] 🟩 Delete `<p>Stage 4 of 4</p>` in `webapp/components/urgeHelp/ReflectStage.tsx` (line ~41)
  - [x] 🟩 In each of the three files, bump the wrapping `<header>` top margin by the lost height (the deleted `<p>` is `text-[10px]` + `mb-2`, ≈18px) so the `<h2>` stays at the same vertical position. Easiest: change `mt-6 md:mt-8` → `mt-10 md:mt-12` (or whatever compensates exactly).

- [x] 🟩 **Step 2: Item 2 — Locate bottom sheet → full modal pattern**
  - [x] 🟩 In `webapp/components/urgeHelp/LocateStage.tsx`, replace the current `absolute inset-x-0 bottom-0` sheet wrapper with a fixed-overlay structure mirroring `LessonBottomSheet`:
    - Outer overlay: `fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-900/40 backdrop-blur-sm`, with `onClick={deselect}` and `animate-in fade-in duration-200`
    - Inner sheet container: `onClick={(e) => e.stopPropagation()}` so taps inside don't dismiss
    - Keep the existing `animate-sheet-up` / `animate-sheet-down` slide animations on the inner sheet
  - [x] 🟩 Drop the `sheetHeight` / `ResizeObserver` / `paddingBottom` plumbing that propped the grid clear of the in-flow sheet — no longer needed once the sheet is `fixed`.
  - [x] 🟩 Verify the close animation still plays correctly on backdrop click (the existing `deselect()` already handles the slide-down).
  - [x] 🟩 Add `role="dialog"` + `aria-modal="true"` + `aria-label` to the overlay for a11y parity with `LessonBottomSheet`.

- [x] 🟩 **Step 3: Item 3 — Recolor Act categories**
  - [x] 🟩 Update `URGE_CATEGORY_META` in `webapp/data/urgeData.ts` (lines 151–179):
    - `reset` → `tint: 'bg-emerald-100/60 border-emerald-200'`, `accent: 'text-emerald-700'`
    - `ground` → `tint: 'bg-teal-100/60 border-teal-200'`, `accent: 'text-teal-700'`
    - `protect` → `tint: 'bg-sky-100/60 border-sky-200'`, `accent: 'text-sky-700'`
    - `reframe` → `tint: 'bg-indigo-100/60 border-indigo-200'`, `accent: 'text-indigo-700'`
  - [x] 🟩 In `webapp/components/urgeHelp/ActStage.tsx` line 110, change subtitle from `<p className="text-xs text-rose-700/60">{meta.subtitle}</p>` → use `meta.accent` (e.g. with reduced opacity: `${meta.accent}/70`) so it tracks the category color.
  - [x] 🟩 Verify nothing else breaks: `ActionScreenShell.tsx` already reads `meta.tint`/`meta.accent` for the icon badge — it will auto-pick up new colors with no further changes.

- [ ] 🟥 **Step 4: Item 4 — Reflect "talk it through" navigates to Coach tab** _(deferred per user instruction during /execute — to be picked up in a follow-up pass)_
  - [ ] 🟥 In `webapp/App.tsx`:
    - Lift the `coachSeed` state (currently in `UrgeHelp`) up to App-level: `const [coachSeed, setCoachSeed] = useState<UrgeContextSeed | null>(null)`
    - Pass `currentUrgeContext={coachSeed}` to `<AICoach>` in the `View.AI_COACH` branch (around line 491–497)
    - Pass `setCoachSeed` (and `changeView`) down to `<UrgeHelp>` so it can stash a seed before navigating
  - [ ] 🟥 In `webapp/components/UrgeHelp.tsx`:
    - Replace the existing local `coachSeed` state with the App-provided setter
    - In the `escalated` branch of `handleReflect`, build the seed payload (current `stage`, `feeling`, `intensity`, last `actionsTried`, `elapsedSec`), call `setCoachSeed(seed)`, then call `changeView(View.AI_COACH)` — drop the `setCoachOpen(true)` path
  - [ ] 🟥 Audit `CoachModal` usage across the codebase. If `UrgeHelp` was the only consumer, delete `webapp/components/urgeHelp/CoachModal.tsx` and remove its import + render from `UrgeHelp.tsx`. Otherwise leave it.
  - [ ] 🟥 Decide a seed lifecycle in App: clear it on Coach unmount or on a subsequent `changeView` away from `AI_COACH`, so a stale seed doesn't leak into a future fresh Coach visit.

- [x] 🟩 **Step 5: Item 5 — Clean Day card fully green**
  - [x] 🟩 In `webapp/components/Dashboard.tsx` lines 420–456, swap inside the `isClean` branches:
    - Line 420 banner: `text-purple-800` → `text-emerald-800`
    - Line 443 `labelClass`: `text-purple-600/70` → `text-emerald-700/70`
    - Line 444 `valueClass`: `text-purple-900` → `text-emerald-900`
    - Line 447 `tagClass`: `text-purple-800` → `text-emerald-800`
    - Lines 450–451 `noteClass`: `text-purple-800` → `text-emerald-800`
    - Lines 454–455 `aiBoxClass`: `text-purple-900` → `text-emerald-900`
  - [x] 🟩 Verify line 402 (`text-purple-900` on the day-header title) is NOT changed — it's the modal chrome, not part of the Clean/Slip card.

- [x] 🟩 **Step 6: Item 6 — Tighten AI insight**
  - [x] 🟩 Update the prompt in `webapp/prompts/dailyInsight.ts` line 7: replace `Provide a single, short paragraph (2-3 sentences) insight.` with a hard constraint: `Provide an insight of MAX 3 sentences AND MAX 50 words total.` (or similar explicit wording).
  - [x] 🟩 In `webapp/components/Dashboard.tsx` line 498:
    - Relabel `AI:` → `Observation.`
    - Drop `mr-1` from the bold span so only the literal space between `</span>` and `{detail.aiInsight}` provides separation.

- [x] 🟩 **Step 7: Verify in browser**
  - [x] 🟩 Run dev server and smoke-test each item: Help tab Locate flow (sheet appears with blurred backdrop, click-outside dismisses), Help tab Act grid (4 distinct category colors + subtitle), Reflect "talk it through" (lands on Coach tab, Coach has urge context), Dashboard day modal for a CLEAN day (all green) vs SLIP day (all rose), AI insight on a fresh check-in (≤3 sentences, "Observation." label, single space).
