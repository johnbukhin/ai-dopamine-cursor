# Help Tab Redesign — Implementation Plan

**Issue:** [#34](https://github.com/johnbukhin/ai-dopamine-cursor/issues/34)
**Overall Progress:** `100%` (9/9 steps) · TypeScript clean · `vite build` passes

## TLDR

Rebuild [webapp/components/UrgeHelp.tsx](../../webapp/components/UrgeHelp.tsx) as a 4-stage evidence-based urge-response journey (Pause → Locate → Act → Reflect). Replace the 60s timer with a 3-min one, expand to 10 actions each with its own interactive mini-screen, add an always-accessible AI Coach modal, log every completed urge to `localStorage`, and surface an "Urges Surfed" tile on the Dashboard. Visual language harmonizes with Plan tab.

## Critical Decisions

- **Future-Self Letter** = action contains its own editor (first-time guided write, then read; editable from Settings). No onboarding to read from.
- **Persistence** = `localStorage` only (key `mc.urge_log.v1`). Supabase deferred to a follow-up issue.
- **AI Coach mid-flow** = slide-up modal *over* Help (not nav). Receives `currentUrgeContext` props. UrgeHelp state stays local.
- **Phone Away** = soft timer + back button (browser cannot enforce hard lock).
- **All 10 actions** get full mini-screens — no static cards.
- **Intensity slider** = visible in Stage 2, skippable.
- **Auto-log** triggers only on Reflect-stage feedback click.
- **Urges Surfed tile** ships in this issue (3rd Dashboard tile).
- **Visual style** = rose palette retained for emergency context, but spacing/radii/typography aligned with Plan (`rounded-2xl`, soft shadow, stagger-fade entrance).

## Tasks

- [x] 🟩 **Step 1: Types & data foundation**
  - [x] 🟩 Add `Feeling`, `UrgeAction`, `UrgeActionId`, `UrgeLogEntry`, `UrgeContextSeed` to [webapp/types.ts](../../webapp/types.ts)
  - [x] 🟩 Define feeling list (7 entries) with `{ id, label, context }`
  - [x] 🟩 Define action registry (10 entries) in [webapp/data/urgeData.ts](../../webapp/data/urgeData.ts) with `{ id, title, category, whyItWorks, recommendedFor: feelingId[] }` + category meta
  - [x] 🟩 Add localStorage helpers in [webapp/src/lib/urgeLog.ts](../../webapp/src/lib/urgeLog.ts) (`readLog`, `appendEntry`, `count`)
  - [x] 🟩 Add localStorage helper for Future-Self Letter in same file (`readLetter`, `writeLetter`)

- [x] 🟩 **Step 2: Stage shell & Pause (3-min timer)**
  - [x] 🟩 Refactor [UrgeHelp.tsx](../../webapp/components/UrgeHelp.tsx) into stage orchestrator (state machine + stub stages for incremental fill-in)
  - [x] 🟩 Build [PauseStage.tsx](../../webapp/components/urgeHelp/PauseStage.tsx): 3-min countdown, animated ring, reframe copy, Skip button
  - [x] 🟩 Build [StageProgress.tsx](../../webapp/components/urgeHelp/StageProgress.tsx) wizard indicator (4 dots) pinned to top of every stage
  - [x] 🟩 [CoachPill.tsx](../../webapp/components/urgeHelp/CoachPill.tsx) floating bottom-right with mobile offset `bottom-[5.5rem]`, desktop `bottom-6`

- [ ] 🟥 **Step 3: Locate stage (feelings + intensity)**
  - [ ] 🟥 Render feelings as 2-col tiles with one-line context per feeling (mobile-first)
  - [ ] 🟥 After feeling selection, slide-in optional intensity slider (1–10) with skippable Continue CTA
  - [ ] 🟥 Persist selection in component state for downstream stages + Coach context

- [x] 🟩 **Step 4: Act stage (10 action grid)**
  - [x] 🟩 Category-grouped sections (Reset / Ground / Protect / Reframe), 2 cards/row, subtle category tints via `URGE_CATEGORY_META`
  - [x] 🟩 Stagger-fade entrance (50ms apart, capped at 400ms total)
  - [x] 🟩 Recommended-for-feeling "Best fit" badge on top 2 matches via `recommendedFor`
  - [x] 🟩 Card layout: icon-first, title, why-it-works always visible (small text); "tried" dot on prior actions

- [x] 🟩 **Step 5: 10 mini-screen components**
  - [x] 🟩 [urgeActions/](../../webapp/components/urgeActions/) directory + [index.ts](../../webapp/components/urgeActions/index.ts) registry barrel
  - [x] 🟩 [ActionScreenShell](../../webapp/components/urgeActions/ActionScreenShell.tsx) — shared wrapper with header (title + why) + content slot + Done/Back CTAs
  - [x] 🟩 [BoxBreathingScreen](../../webapp/components/urgeActions/BoxBreathingScreen.tsx) — animated breathing circle, 4-4-4-4 × 5 cycles
  - [x] 🟩 [ColdWaterScreen](../../webapp/components/urgeActions/ColdWaterScreen.tsx) — 3-step instructional checklist
  - [x] 🟩 [PhysicalBurstScreen](../../webapp/components/urgeActions/PhysicalBurstScreen.tsx) — tap-counter to 20 with milestone copy
  - [x] 🟩 [Grounding54321Screen](../../webapp/components/urgeActions/Grounding54321Screen.tsx) — interactive sensory checkboxes, auto-advance per sense
  - [x] 🟩 [HALTCheckScreen](../../webapp/components/urgeActions/HALTCheckScreen.tsx) — 4 toggles → 1 merged recommendation (priority Hungry > Tired > Angry > Lonely)
  - [x] 🟩 [LeaveRoomScreen](../../webapp/components/urgeActions/LeaveRoomScreen.tsx) — 60s reorient with pulsing dot + breath prompt
  - [x] 🟩 [PhoneAwayScreen](../../webapp/components/urgeActions/PhoneAwayScreen.tsx) — soft 15-min countdown, back always available
  - [x] 🟩 [UrgeJournalScreen](../../webapp/components/urgeActions/UrgeJournalScreen.tsx) — Trigger chips + intensity slider + note
  - [x] 🟩 [FutureSelfLetterScreen](../../webapp/components/urgeActions/FutureSelfLetterScreen.tsx) — guided write OR display saved letter; uses shared [LetterEditor](../../webapp/components/urgeActions/LetterEditor.tsx)
  - [x] 🟩 [PlayTheTapeScreen](../../webapp/components/urgeActions/PlayTheTapeScreen.tsx) — 30s auto-advancing 5-scene visualization

- [x] 🟩 **Step 6: Reflect stage + Urge Log**
  - [x] 🟩 [ReflectStage.tsx](../../webapp/components/urgeHelp/ReflectStage.tsx) — three feedback options with descriptive subtitles
  - [x] 🟩 On click, orchestrator writes `UrgeLogEntry` via `urgeLog.appendEntry` (timestamp, feeling, intensity, actionsTried[], outcome)
  - [x] 🟩 "Yes, it passed" → [SurfCelebration.tsx](../../webapp/components/urgeHelp/SurfCelebration.tsx) sparkle overlay → reset to Pause
  - [x] 🟩 "Still here" → return to Act stage with prior actions still marked
  - [x] 🟩 "I want to talk it through" → opens Coach modal pre-seeded

- [x] 🟩 **Step 7: AI Coach modal integration**
  - [x] 🟩 Extended `AICoachProps` with `currentUrgeContext?: UrgeContextSeed | null` and `compact?: boolean`
  - [x] 🟩 `formatUrgeContext()` in AICoach prepends an "ACTIVE URGE SESSION" block to the existing context string when seed present (no system-prompt rewrite needed)
  - [x] 🟩 [CoachModal.tsx](../../webapp/components/urgeHelp/CoachModal.tsx) — slide-up sheet on mobile, centered on desktop, dismissible, renders AICoach in compact mode
  - [x] 🟩 Wired from CoachPill: `useMemo` snapshots seed at modal-open time so context doesn't drift while modal is open
  - [x] 🟩 App.tsx now passes `chatHistory` + `setChatHistory` + `checkIns` into UrgeHelp; Coach view continues to mount full-page version unchanged

- [x] 🟩 **Step 8: Future-Self Letter editor — Help tab only** _(Settings entry removed per user feedback)_
  - [x] 🟩 Editor lives inside the [FutureSelfLetterScreen](../../webapp/components/urgeActions/FutureSelfLetterScreen.tsx) action mini-screen only — no Settings tab
  - [x] 🟩 First-time users land in guided write flow (auto-detected via `readLetter() === null`)
  - [x] 🟩 Subsequent visits show formatted letter with Edit button
  - [x] 🟩 Reads/writes through `urgeLog.readLetter` / `writeLetter` — single source of truth
  - [x] 🟩 [LetterEditor](../../webapp/components/urgeActions/LetterEditor.tsx) extracted as reusable component (kept for potential future re-introduction)

- [x] 🟩 **Step 9: Dashboard — Urges Surfed tile**
  - [x] 🟩 3rd tile added matching Streak structure (rose-100 bg, decorative wave SVG, min-h, rounded-2xl)
  - [x] 🟩 Grid reflowed to `grid-cols-2 md:grid-cols-3`; tile spans `col-span-2 md:col-span-1` so mobile stays clean (Streak + Check-in row + Urges Surfed full-width row)
  - [x] 🟩 Data: `urgeLog.count()` read once via `useMemo` on mount
  - [x] 🟩 Rose-100/rose-700 accents — kindred to Help context, doesn't overpower purple-dominant Dashboard

## Out of scope (explicit)

- Supabase persistence for urge log (separate follow-up)
- Audio/voice meditation guidance
- Push notifications
- Social/accountability contact integration
- Onboarding to capture future-self letter pre-emptively
- Any change to Sidebar labels or icons
- Routing/URL changes

## Post-build adjustments (per user feedback after initial /execute)

These deviated from the original plan based on real UX testing of the built feature:

- **CoachPill removed entirely.** Originally a persistent floating pill on every stage. User found it visually distracting and overlapping the action footer. Coach is now only accessible from the Reflect-stage "I want to talk it through" option.
- **Settings "Letter" tab removed.** Originally a parallel surface in Settings for editing the Future-Self Letter. User decided the in-Help editor (which already auto-opens for first-time users and has an Edit button afterward) is sufficient.
- **LocateStage redesigned as a bottom sheet.** Originally inline intensity-slider + Continue. Reworked to slide up as a sheet (matching LessonBottomSheet pattern) — pulls the eye to the next decision without crowding the grid.
- **Dashboard "Urges Surfed" tile compressed to a single horizontal row** with full purple styling (matches Streak structure exactly). Originally a vertical tile mirroring Streak/Check-in dimensions.
- **Grounding 5-4-3-2-1**: tap-anywhere-on-card pattern, completion banner with auto-advance, scrollIntoView. Originally just the dot checkboxes.
- **PlayTheTape**: per-scene durations (8/8/7/9/6 instead of uniform 6s) plus tap-to-skip with discoverability hint. Originally fixed auto-advance only.
- **Urge log policy**: only `passed` and `escalated` outcomes are logged. `still_here` is now treated as mid-session feedback (no log entry) so the Dashboard counter reflects resolved urge sessions, not attempt counts.

## Acceptance criteria mirror

Maps to Acceptance Criteria from issue #34 exploration comment — all 10 items must be true before review.
