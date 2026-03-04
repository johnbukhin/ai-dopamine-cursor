# Feature Implementation Plan — Issue #10

**Overall Progress:** `100%`

## TLDR
Optimize `funnel/styles.css` for mobile viewports: reduce header chrome height so all answer options fit on one screen, make the CTA button sticky so it's always reachable, and tighten landing-screen margins so the legal footer isn't clipped. Desktop is unchanged. Paywall excluded.

## Critical Decisions

- **Single new breakpoint** (`max-width: 479px`): All mobile overrides go in one new block. Existing `min-width` queries (desktop/tablet) are untouched.
- **CSS-only / styles.css only**: No JS or HTML changes needed — layout problems are purely spacing/sizing.
- **Sticky CTA via `position: sticky`**: Simplest approach that works without restructuring HTML. The body is the scroll container, so `sticky` on `.cta-button` keeps it in view when content overflows.
- **No structural restyling**: We're trimming margins/padding and font sizes, not redesigning components. Consistent with "minimal, integrate seamlessly" requirement.
- **Paywall excluded**: No changes to `.paywall`, `.paywall-screen`, `.countdown-timer`, or anything inside `@media (max-width: 768px)` paywall block.

---

## Root Cause Analysis

On a typical small phone (~375px wide, ~584px visible viewport after browser chrome):

| Chrome element | Current height | Culprit |
|---|---|---|
| `.screen` top padding | 16px | `--spacing-md` |
| `.header` (padding + margin-bottom) | ~40px | 16px + 24px |
| `.progress-container` (bar + margin) | ~28px | 4px + 24px mb |
| `.question-nav` (back btn + margin) | ~52px | 36px + 16px mb |
| `.headline--question` (text + margin) | ~72px | ~40px + 32px mb |
| 5 cards × 52px + 4 gaps × 16px | **324px** | padding + gap |
| `.screen` bottom padding | 16px | — |
| **Total** | **~548px** | Overflows 584px |

Five-option questions overflow by ~64px → "Civil partnership" is cut off.

---

## Tasks

- [x] 🟩 **Step 1: Add `@media (max-width: 479px)` compact-chrome block**

  Add a new block at the end of the file (before the final paywall `@media (max-width: 768px)` section) that trims vertical overhead:

  - [x] 🟩 `.screen` → `padding: 12px` (was 16px; saves 8px)
  - [x] 🟩 `.header` → `padding: 6px 0; margin-bottom: 10px` (was 16px/24px; saves 24px)
  - [x] 🟩 `.progress-container` → `margin-bottom: 10px` (was 24px; saves 14px)
  - [x] 🟩 `.question-nav` → `margin-bottom: 6px` (was 16px; saves 10px)
  - [x] 🟩 `.headline--question` → `font-size: 18px; margin-bottom: 12px` (was 20px/32px; saves 20px)
  - [x] 🟩 `.answer-cards` → `gap: 8px` (was 16px; saves 32px for 5-option lists)
  - [x] 🟩 `.answer-card` → `padding: 10px 12px` (was 16px; saves 48px for 5 cards)
  - [x] 🟩 `.answer-card__icon` → `width: 32px; height: 32px` (was 40px; keeps proportions)
  - [x] 🟩 `.answer-card__icon svg` → `width: 20px; height: 20px` (was 24px)

  **Net saving: ~156px** — all 5 options comfortably visible on 375px phones.

- [x] 🟩 **Step 2: Sticky CTA button on mobile**

  Within the same `@media (max-width: 479px)` block:

  - [x] 🟩 `.cta-button` → `position: sticky; bottom: 0; margin-top: 12px` (was margin-top inherited from container `var(--spacing-xl)`)
  - [x] 🟩 Add subtle top shadow so button visually floats above content: `box-shadow: 0 -4px 12px rgba(0,0,0,0.08)`

  This ensures the "Continue" button on multi-select (checkbox) screens is always reachable even when 6+ options cause overflow.

- [x] 🟩 **Step 3: Tighten landing-screen margins on mobile**

  Within the same `@media (max-width: 479px)` block, prevent the legal footer from being clipped on the landing screen:

  - [x] 🟩 `.headline` → `margin-bottom: 8px` (was `--spacing-md` = 16px)
  - [x] 🟩 `.subheadline` → `margin-bottom: 12px` (was `--spacing-lg` = 24px)
  - [x] 🟩 `.badge` → `margin-bottom: 16px` (was `--spacing-xl` = 32px)
  - [x] 🟩 `.legal` → `padding: 12px 0` (was `var(--spacing-lg)` = 24px each side)

- [x] 🟩 **Step 4: Verify nothing is broken**
  - [x] 🟩 Server restarted, funnel returns HTTP 200
  - [x] 🟩 New `@media (max-width: 479px)` block confirmed present at line 2405 of styles.css
  - [x] 🟩 Paywall `@media (max-width: 768px)` block untouched (immediately follows)
  - [x] 🟩 Desktop `@media (min-width: 480px)` and `(min-width: 768px)` blocks untouched
