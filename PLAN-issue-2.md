# Feature Implementation Plan: Question 1 Screen

**Overall Progress:** `100%`

**Issue:** [#2 - Implement Question 1: Relationship Status Screen](https://github.com/johnbukhin/ai-dopamine-cursor/issues/2)

## TLDR
Build the single-choice question screen component for the Compass funnel. Reusable for all 33 quiz questions. Includes SVG icons, immediate navigation on selection, and history-based back navigation.

## Critical Decisions
- **Icons:** SVG from Lucide library (inline) - lightweight, no external dependencies
- **Selection:** Immediate navigation on tap - matches gender card UX pattern
- **Back navigation:** History array in State - reliable for non-linear flows
- **Headlines:** Sentence case - as specified in JSON data
- **Scope:** Reusable for all single_choice variants

## Tasks

- [x] 🟩 **Step 1: Add history tracking to State**
  - [x] 🟩 Add `history: []` to `State.data`
  - [x] 🟩 Update `State.reset()` to include history
  - [x] 🟩 Add `State.pushHistory(screenId)` method
  - [x] 🟩 Add `State.popHistory()` method for back navigation

- [x] 🟩 **Step 2: Create icon mapping utility**
  - [x] 🟩 Add `Icons` object with SVG strings for: people, heart, rings, link, handshake
  - [x] 🟩 Add `Icons.get(name)` method with fallback for unknown icons

- [x] 🟩 **Step 3: Add answerCard component**
  - [x] 🟩 Add `Components.answerCard(option, screenId)` function
  - [x] 🟩 Render icon + label with proper data attributes
  - [x] 🟩 Include accessibility attributes (role, tabindex, aria-label)

- [x] 🟩 **Step 4: Add singleChoice screen renderer**
  - [x] 🟩 Add `Screens.singleChoice(screenData)` function
  - [x] 🟩 Include header, progress bar, back button, headline
  - [x] 🟩 Map options to answerCard components

- [x] 🟩 **Step 5: Add event handlers**
  - [x] 🟩 Add `.answer-card` click detection in `Events.handleClick()`
  - [x] 🟩 Add `Events.handleAnswerSelect(card)` - record answer, push history, navigate
  - [x] 🟩 Update back button handler to use `State.popHistory()`
  - [x] 🟩 Add keyboard support for answer cards

- [x] 🟩 **Step 6: Update App.render() routing**
  - [x] 🟩 Add `case 'single_choice':` to switch statement

- [x] 🟩 **Step 7: Add CSS styles**
  - [x] 🟩 Add `.answer-cards` container styles
  - [x] 🟩 Add `.answer-card` base styles (card, padding, cursor)
  - [x] 🟩 Add `.answer-card:hover` and `.answer-card:active` states
  - [x] 🟩 Add `.answer-card__icon` styles
  - [x] 🟩 Add `.answer-card__label` styles

- [x] 🟩 **Step 8: Test and verify**
  - [x] 🟩 Verify question_1 renders correctly
  - [x] 🟩 Verify answer selection records and navigates
  - [x] 🟩 Verify back button returns to landing
  - [x] 🟩 Verify progress bar shows 1/33

> **Testing:** Run `cd funnel && python3 -m http.server 8080` and open http://localhost:8080
