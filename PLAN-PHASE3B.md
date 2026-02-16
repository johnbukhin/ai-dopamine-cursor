# Phase 3b: Form Capture & Personalized Results Implementation Plan

**Overall Progress:** `100%`
**Issue:** #8 / YEV-10 (split)

## TLDR
Build 4 screens: email capture gate, name capture gate, personalized profile summary (dynamic from previous answers), and goal timeline selector. These bridge the loading screens (Phase 3a) to the paywall (Phase 3c).

## Critical Decisions
- **Email validation:** Basic format validation only (no server-side check, no pre-fill)
- **Form state:** Store email/name in State via `recordAnswer()` like other screens
- **Profile summary:** Dynamic — pulls previous answers from State to populate patterns/focus areas
- **Goal timeline:** Reuse existing `text_list` single-choice pattern (tap to select + auto-advance)
- **Routing:** Add `case 'email_gate':`, `case 'name_gate':`, `case 'personalized_results':`, `case 'timeline_selection':` to switch

## Tasks:

- [x] 🟩 **Step 1: Route new screen types in App.render()**
  - [x] 🟩 Add `case 'email_gate':` → `Screens.emailCapture()`
  - [x] 🟩 Add `case 'name_gate':` → `Screens.nameCapture()`
  - [x] 🟩 Add `case 'personalized_results':` → `Screens.profileSummary()`
  - [x] 🟩 Add `case 'timeline_selection':` → `Screens.goalTimeline()`

- [x] 🟩 **Step 2: Build Screens.emailCapture(screenData)**
  - [x] 🟩 Headline + subheadline from JSON
  - [x] 🟩 Email input field with placeholder
  - [x] 🟩 Lock icon + privacy note text
  - [x] 🟩 Continue button (disabled until valid email entered)
  - [x] 🟩 Basic email format validation (regex on input event)

- [x] 🟩 **Step 3: Build Screens.nameCapture(screenData)**
  - [x] 🟩 Headline from JSON
  - [x] 🟩 Text input field with placeholder
  - [x] 🟩 Continue button (disabled until non-empty name)

- [x] 🟩 **Step 4: Build Screens.profileSummary(screenData)**
  - [x] 🟩 Headline ("Your Dopamine Profile Summary")
  - [x] 🟩 "Your Patterns" section — dynamic text based on user's quiz answers
  - [x] 🟩 "Recommended Focus Areas" section — list items from JSON + user context
  - [x] 🟩 User's name displayed (from name_capture answer)
  - [x] 🟩 Continue button

- [x] 🟩 **Step 5: Build Screens.goalTimeline(screenData)**
  - [x] 🟩 Headline from JSON
  - [x] 🟩 Render options as text_list cards (reuse existing pattern)
  - [x] 🟩 "Recommended" badge on first option
  - [x] 🟩 Tap to select + auto-advance (same as single_choice)

- [x] 🟩 **Step 6: Wire form input handling**
  - [x] 🟩 Extend `Events.handleInput()` to detect `.form-capture__input` fields
  - [x] 🟩 Email validation: enable/disable Continue based on regex match
  - [x] 🟩 Name validation: enable/disable Continue based on non-empty value
  - [x] 🟩 Store input value via `State.recordAnswer()` on Continue click
  - [x] 🟩 Skip `hasAnswers` check in `handleContinueClick` for `email_gate` and `name_gate` (use input value directly)

- [x] 🟩 **Step 7: Add CSS styles**
  - [x] 🟩 `.form-capture` — screen layout (centered, max-width)
  - [x] 🟩 `.form-capture__input` — styled input field (border, padding, focus state)
  - [x] 🟩 `.form-capture__privacy` — lock icon + muted privacy text
  - [x] 🟩 `.profile-summary` — card layout for sections
  - [x] 🟩 `.profile-summary__section` — section title + content
  - [x] 🟩 `.profile-summary__focus-item` — focus area list items with icons
  - [x] 🟩 `.recommended-badge` — small badge for goal timeline option

- [x] 🟩 **Step 8: Test & restart server**
  - [x] 🟩 Kill + restart server on port 8080
  - [x] 🟩 JS syntax validated (no errors)
  - [x] 🟩 All files served (200 OK)
  - [ ] 🟥 Manual test: click through full flow (user to verify)
