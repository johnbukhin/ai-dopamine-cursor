# Issue #58 — Cosmetic Polish Pass (2nd round)

**Overall Progress:** `100%`

## TLDR

Four follow-up polish items from issue #58 that came in after #59 merged: action-card text picks up its category color (Item 7), the Locate modal stops jumping when the slider is first touched (Item 8), the `URGES SURFED` Dashboard tile becomes an upsell button for free users (Item 9), and the Locate modal subtly darkens/lightens within the rose palette as intensity changes (Item 10). Item 4 (Coach tab navigation) remains deferred.

## Critical Decisions

- **Item 7:** Extend `URGE_CATEGORY_META` with two new static-literal fields (`titleClass`, `descriptionClass`). `Best fit` badge and recommended-card border stay rose — they're a separate highlight layer on top of the category color.
- **Item 8:** Always render the middle Mild/value/Crushing span at the larger `text-base font-bold` size; only the content swaps (`·` ↔ number). No `min-h` wrapper needed.
- **Item 9:** Add `hasUpsellAccess` prop on `Dashboard`. When `false`, wrap the tile in a `<button>` with the exact same hover/transition treatment as the existing `I'm having an urge — help me` button (translated to purple). When `true`, stay as a static `<div>`.
- **Item 10:** Surfaces modulated (B): inner card bg + border + slider accent + intensity number color + drag-handle pill. Sheet outer (white) and CTA button stay constant. Implementation: inline HSL interpolation (not a 10-step Tailwind lookup) — user explicitly asked for *плавно* (smooth). `intensity === null` renders identically to `intensity === 5`.
- **Pairing:** Items 8 + 10 ship together — on first slider touch, neither the height nor the color jumps.

## Tasks

- [x] 🟩 **Step 1: Item 7 — Card title + description per category color**
  - [x] 🟩 In `webapp/data/urgeData.ts`, extend each `URGE_CATEGORY_META` entry with two new fields:
    - `reset`: `titleClass: 'text-emerald-900'`, `descriptionClass: 'text-emerald-700/70'`
    - `ground`: `titleClass: 'text-teal-900'`, `descriptionClass: 'text-teal-700/70'`
    - `protect`: `titleClass: 'text-sky-900'`, `descriptionClass: 'text-sky-700/70'`
    - `reframe`: `titleClass: 'text-indigo-900'`, `descriptionClass: 'text-indigo-700/70'`
  - [x] 🟩 Update the `URGE_CATEGORY_META` TypeScript type signature in `urgeData.ts:151-154` to include the two new fields.
  - [x] 🟩 In `webapp/components/urgeHelp/ActStage.tsx`:
    - Line 168: swap `font-semibold text-rose-900 text-sm` → `font-semibold ${meta.titleClass} text-sm`
    - Line 171: swap `text-[11px] md:text-xs text-rose-700/70` → `text-[11px] md:text-xs ${meta.descriptionClass}`
  - [x] 🟩 Leave the `Best fit` badge (line 142-149) and the highlighted-card border (line 127-130) untouched — they stay rose as a special-highlight layer.

- [x] 🟩 **Step 2: Item 8 — Sheet height stability**
  - [x] 🟩 In `webapp/components/urgeHelp/LocateStage.tsx` lines 228-236, change the middle `<span>` so its className is **always** `text-base font-bold normal-case tracking-normal text-rose-800` (no ternary). Only the children swap: `{intensity !== null ? intensity : '·'}`.
  - [x] 🟩 Verify visually that the placeholder `·` reads as a neutral-looking dot when rendered at the larger weight (an alternative like `–` or a non-breaking space can be subbed in at review if `·` looks weird).

- [x] 🟩 **Step 3: Item 9 — `URGES SURFED` tile as upsell button**
  - [x] 🟩 In `webapp/components/Dashboard.tsx`:
    - Add `hasUpsellAccess: boolean` to `DashboardProps` (around line 8-15).
    - In the tile JSX at lines 299-326, conditionally render: when `hasUpsellAccess === true`, keep the current `<div>` exactly as-is; when `false`, swap the outer wrapper to `<button type="button" onClick={() => onChangeView(View.AI_COACH)}>` with these extra classes appended: `hover:bg-purple-200 transition-colors text-left`. All inner content (icon, label, count, wave SVG) stays identical.
  - [x] 🟩 In `webapp/App.tsx` around line 481-489 where `<Dashboard ... />` is rendered, pass `hasUpsellAccess={hasUpsellAccess}` (the state already exists at line 55).
  - [x] 🟩 No changes needed to `urgeLog.ts` or its callers — the counter is already frozen for users without Help access by virtue of being localStorage-only and only written from inside `UrgeHelp.tsx` (which is gated behind ProGate).

- [x] 🟩 **Step 4: Item 10 — Intensity-driven rose shading (paired with Step 2)**
  - [x] 🟩 In `webapp/components/urgeHelp/LocateStage.tsx`, add a small helper near the top of the file (after imports, before the component):
    ```ts
    /** Map intensity 1–10 (or null = 5) to an HSL tuple for the rose-family
     *  tones that modulate around the sheet. Lightness/saturation only — hue
     *  stays in the rose band so the visual stays rose-themed. */
    function intensityTones(intensity: number | null) {
      const v = intensity ?? 5; // null renders identical to 5 — no first-touch jump
      // ... linear interpolation: 1 = lightest, 5 = baseline (today's tones), 10 = deepest
      // Returns { cardBg, cardBorder, sliderAccent, numberColor, handle }
    }
    ```
    Anchor values at `v=5` should reproduce today's rendered colors (`bg-rose-50` ≈ `hsl(355, 100%, 97%)`, `border-rose-100` ≈ `hsl(354, 100%, 94%)`, `accent-rose-700` ≈ `hsl(348, 83%, 47%)`, `text-rose-800` ≈ `hsl(348, 80%, 36%)`, `bg-rose-200` ≈ `hsl(352, 96%, 90%)`). Interpolate each toward a lighter pair at `v=1` and a darker pair at `v=10`.
  - [x] 🟩 Replace the static Tailwind classes on these elements with inline-styled equivalents driven by `intensityTones(intensity)`:
    - Drag handle pill (line 182): `bg-rose-200` → inline `backgroundColor`
    - Inner intensity card (line 208): `bg-rose-50 border border-rose-100` → inline `backgroundColor` + `borderColor` (keep `border` utility for the 1px width)
    - Slider input (line 222): `accent-rose-700` → inline `accentColor`
    - Intensity number span (Step 2 element): `text-rose-800` → inline `color`
  - [x] 🟩 Add `transition: 'background-color 300ms, border-color 300ms, color 300ms, accent-color 300ms'` to each inline-styled element so drag-to-change reads as a gradient.
  - [x] 🟩 Leave constant: sheet outer (white), `border-rose-200` on the sheet top edge, header text (`text-rose-900` / `text-rose-700/60`), close button, `Continue` CTA (`bg-rose-700`). These read as stable chrome around the modulating interior.

- [x] 🟩 **Step 5: Verify in browser**
  - [x] 🟩 Run `tsc --noEmit` clean
  - [x] 🟩 Smoke-test each item:
    - Act stage: each of the 4 categories shows its own hue on the card title and description; `Best fit` cards remain rose
    - Locate sheet: first touch on slider does NOT change the sheet height; no visual jump from null → 5
    - Locate sheet: dragging the slider smoothly darkens/lightens the inner card, slider, number, and drag handle (rose-only, subtle)
    - Dashboard: in incognito or with `localStorage.removeItem('mc_has_upsell')`, the `URGES SURFED` tile shows hover state, cursor pointer, and clicking navigates to the Coach tab (which renders ProGate)
    - Dashboard: with `localStorage.setItem('mc_has_upsell', '1')`, the tile is static (no hover, no click)
