# Feature Implementation Plan — Issue #44

**Overall Progress:** `100%`

**Issue:** https://github.com/johnbukhin/ai-dopamine-cursor/issues/44

## TLDR
Replace realistic PNG headers across all 5 main tabs with hand-drawn SVG hero illustrations sharing one visual language (sunset palette, layered mountains, hills, bottom-fade composition). One focal element per tab, each with a subtle animation that reinforces the tab's metaphor. Add Settings → Profile rename, Help tab layout redesign, paywall hero preview in ProGate, and fix iOS safe-area handling so the bottom nav and Log Out button don't collide with the home indicator.

## Critical Decisions

- **Inline SVG components, not PNG assets** — keeps everything vector, animatable via CSS, and lets each tab share a single base scene (sky/sun/mountains/hills) with one focal addition. Trade-off: more code, less designer-friendly, but full control over animation and zero asset pipeline.
- **One shared `HeroVariants.tsx` file** — five named exports (PlanTrail, ProgressPeak, CoachLighthouse, HelpTree, ProfileCampfire) with private helper functions (`baseDefs`, `skyAndAtmosphere`, `standardMountains`, `standardHills`). Avoids per-component duplication while keeping each variant independently editable.
- **Per-component unique `id` prefix on `<defs>`** — needed so SVG gradient IDs don't collide when multiple heroes ever render on the same page (e.g. in IllustrationGallery during picking).
- **Title overlay at upper-left of each hero** — matches the original Plan tab pattern (eyebrow + h2 absolute-positioned over the sky region) for cross-tab consistency.
- **Animations purely CSS keyframes** — no SMIL, no JS — so they cost nothing on idle and respect `prefers-reduced-motion` via a single media-query block.
- **`h-dvh` overlay on `h-screen`** — fixes iOS Safari "100vh extends behind toolbar" without breaking older browsers (h-dvh ignored where unsupported, h-screen still applies).
- **ProGate paywall uses absolute-positioned hero behind content** — keeps the lock+description vertically centered like before, while previewing what's behind the paywall at `opacity-40 grayscale`.
- **Settings → Profile renamed only at the nav/heading level** — inner Profile/Access/Terms sub-tabs left alone (named clash acknowledged in issue Risk/notes for follow-up).

## Tasks

- [x] 🟩 **Step 1: Build shared SVG hero scaffolding**
  - [x] 🟩 Define `baseDefs(id)` — sky gradient, sun glow, 3 mountain gradients, 2 hill gradients, bottom-fade mask
  - [x] 🟩 Define `skyAndAtmosphere(id)` — sky, sun (3 stacked circles), clouds, faint stars
  - [x] 🟩 Define `standardMountains(id)` — 3 layered paths with different gradients
  - [x] 🟩 Define `standardHills(id)` — 2 layered paths, gentle waves
  - [x] 🟩 Define `leftTrees()` / `rightTrees()` — broadleaf clusters with highlight + trunk
  - [x] 🟩 Define `HeroSvg` wrapper — common viewBox 800×600, fade mask group, accepts extraDefs

- [x] 🟩 **Step 2: Build 5 hero variants in `HeroVariants.tsx`**
  - [x] 🟩 `PlanTrail` — winding stones from foreground into distance
  - [x] 🟩 `ProgressPeak` — central snow-capped peak + planted flag, custom bolder far-mountain gradient
  - [x] 🟩 `CoachLighthouse` — striped tower on cliff + 3 light beams of varying length
  - [x] 🟩 `HelpTree` — thick trunk with exposed roots + dense canopy + drifting wind streaks
  - [x] 🟩 `ProfileCampfire` — stacked logs + 3-layer flames + glow halos + rising sparks

- [x] 🟩 **Step 3: Wire each variant into its tab**
  - [x] 🟩 `JourneyPath.tsx` — replace `JourneyHero` with `PlanTrail`, eyebrow now dynamic `Day {activePlanDay}`
  - [x] 🟩 `Dashboard.tsx` — swap PNG for `ProgressPeak`, move title to upper-left, extend greeting to 4 periods (night/morning/afternoon/evening)
  - [x] 🟩 `AICoach.tsx` — swap PNG for `CoachLighthouse`, skip auto-scroll on first mount so hero is visible
  - [x] 🟩 `PauseStage.tsx` — swap urge.png watermark for `HelpTree`, restructure layout (hero flows at top, content centered below), heading "3 minutes is enough / to weaken the urge" forced 2 lines
  - [x] 🟩 `Settings.tsx` — add `ProfileCampfire` hero, restructure to single scroll container, heading "Your Space / Profile"
  - [x] 🟩 `Sidebar.tsx` — rename Settings → Profile (mobile + desktop nav)

- [x] 🟩 **Step 4: Add per-element CSS animations**
  - [x] 🟩 `stone-wobble` — index-based amplitude via `--wobble-amp` custom prop, staggered delays/durations
  - [x] 🟩 `flag-wave` — 6 asymmetric keyframes, 3.2 s cycle, pivot at pole
  - [x] 🟩 `lighthouse-beam-pulse` — simple `0%/50%/100%` opacity, 3 beams use different `animationDelay`
  - [x] 🟩 `lighthouse-glow-pulse` — outer halo pulses in sync
  - [x] 🟩 `tree-sway` — canopy ±5° from trunk-join pivot, 6 s cycle
  - [x] 🟩 `wind-drift` — 5 white streaks drift left → right across the sky with per-streak delay/duration
  - [x] 🟩 `flame-flicker` — staggered scaleX/Y on 3 flame layers, 1.5 s cycle
  - [x] 🟩 `campfire-glow-breathe` — scale pulse on glow ellipses
  - [x] 🟩 `spark-rise` — translateY upward + fade out, 4 sparks staggered for continuous trickle
  - [x] 🟩 All animations added to `prefers-reduced-motion` reset block

- [x] 🟩 **Step 5: Remove Help tab StageProgress indicator**
  - [x] 🟩 Drop the `<StageProgress>` render from `UrgeHelp.tsx`
  - [x] 🟩 Keep the `Stage` type import (still used in `useState`)

- [x] 🟩 **Step 6: Fix iOS safe-area handling**
  - [x] 🟩 `App.tsx` outer: `h-screen` → `h-screen h-dvh`
  - [x] 🟩 `App.tsx` main: pb-[4.5rem] → `pb-[calc(4.5rem+env(safe-area-inset-bottom))]`
  - [x] 🟩 `Sidebar.tsx` mobile nav: replace broken `pb-safe` with inline-style `height: calc(4.5rem + env(safe-area-inset-bottom))` and matching paddingBottom

- [x] 🟩 **Step 7: ProGate paywall — faded hero preview**
  - [x] 🟩 Pick `CoachLighthouse` or `HelpTree` based on `featureName`
  - [x] 🟩 Render absolute-positioned at top with `opacity-40 grayscale pointer-events-none`
  - [x] 🟩 Lock content stays centered with `z-10`
  - [x] 🟩 Bump lock circle `bg-purple-100 → bg-purple-200`, icon `text-purple-600 → text-purple-700` for visibility
  - [x] 🟩 Description text `text-gray-500 → text-gray-600` for slightly more contrast
  - [x] 🟩 Add "science-backed" to Urge Help description in `App.tsx`

- [x] 🟩 **Step 8: Visual polish across all 5 heroes**
  - [x] 🟩 Smooth bottom-fade gradient (6 stops instead of 4)
  - [x] 🟩 Title overlays shifted +25 px down from `top-4 md:top-8` baseline
  - [x] 🟩 Far mountain on Progress: custom darker gradient + `opacity="0.75"`
  - [x] 🟩 Caminó, flag and campfire scaled +50 % for visual parity with lighthouse

- [x] 🟩 **Step 9: Cleanup before issue/commit**
  - [x] 🟩 Revert temporary PRO unlock in `App.tsx`
  - [x] 🟩 Remove `IllustrationGallery` import and `GALLERY_MODE` guard from `App.tsx`
  - [x] 🟩 Delete `IllustrationGallery.tsx` (gallery was only for picking)
  - [x] 🟩 Delete `JourneyHero.tsx` (replaced by `PlanTrail`)
  - [x] 🟩 Strip 6 unused variants from `HeroVariants.tsx` (ProgressTree, CoachOwl, CoachCompass, HelpAnchor, HelpLake, ProfileTent)
  - [x] 🟩 Rename export `ProgressTrail` → `PlanTrail` so name matches actual usage tab
  - [x] 🟩 Update stale comments referencing `JourneyHero`
  - [x] 🟩 `npx tsc --noEmit` passes cleanly

- [x] 🟩 **Step 10: Open GitHub issue #44 capturing the change set**
