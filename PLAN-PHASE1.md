# Phase 1: Question Screens Implementation Plan

**Overall Progress:** `95%`

**GitHub Issue:** [#4](https://github.com/johnbukhin/ai-dopamine-cursor/issues/4)

## TLDR
Implement all question screen types for the Compass funnel: single choice (icon_list, text_list), multiple choice (checkbox_list, icon_checkbox_list), and likert scale (icon_scale). Covers questions 1-31 with proper state management, validation, and navigation.

## Critical Decisions
- **Emoji icons:** Use Unicode emoji characters (🧘, 😰, 🎯, etc.) mapped from JSON icon names
- **Text input:** Always visible field that auto-selects as checkbox when user types
- **Likert scale:** Custom SVG icons with labels only on positions 1 & 5
- **Continue button:** Disabled until ≥1 option selected
- **Text-only cards:** Label takes full width (no icon gap)
- **Interstitials:** Keep placeholder screens for Phase 2

---

## Tasks

### Step 1: Icons Module Updates
- [x] 🟩 **1.1** Add emoji mapping object for icon_checkbox_list icons
- [x] 🟩 **1.2** Add 5 custom SVG icons for likert scale (thumbs_down_x, thumbs_down, question, thumbs_up, thumbs_up_star)
- [x] 🟩 **1.3** Add `getEmoji(name)` method to Icons module

### Step 2: State Management Updates
- [x] 🟩 **2.1** Update `State.recordAnswer()` to handle array values for multiple choice
- [x] 🟩 **2.2** Add `State.toggleAnswer(screenId, value)` for checkbox toggling
- [x] 🟩 **2.3** Add `State.hasAnswers(screenId)` to check if any options selected

### Step 3: Single Choice Enhancements
- [x] 🟩 **3.1** Update `Components.answerCard()` to handle text_list (no icon, full-width label)
- [x] 🟩 **3.2** Verify `Screens.singleChoice()` works for both icon_list and text_list

### Step 4: Multiple Choice Components
- [x] 🟩 **4.1** Create `Components.checkboxAnswer(option, screenId, isSelected)` - basic checkbox
- [x] 🟩 **4.2** Create `Components.iconCheckboxAnswer(option, screenId, isSelected)` - emoji + checkbox
- [x] 🟩 **4.3** Create `Components.textInputField(screenId, placeholder)` - auto-select text input
- [x] 🟩 **4.4** Create `Components.continueButton(disabled)` - with disabled state

### Step 5: Likert Scale Components
- [x] 🟩 **5.1** Create `Components.likertOption(option, screenId, isSelected)` - single scale option
- [x] 🟩 **5.2** Create `Components.likertScale(options, screenId)` - horizontal 5-option layout

### Step 6: Screen Renderers
- [x] 🟩 **6.1** Create `Screens.multipleChoice(screenData)` - handles checkbox_list and icon_checkbox_list
- [x] 🟩 **6.2** Create `Screens.likertScale(screenData)` - handles icon_scale
- [x] 🟩 **6.3** Update `App.render()` switch to route multiple_choice and likert_scale types

### Step 7: Event Handlers
- [x] 🟩 **7.1** Add `Events.handleCheckboxSelect(checkbox)` - toggle selection, update state
- [x] 🟩 **7.2** Add `Events.handleLikertSelect(option)` - select and auto-advance
- [x] 🟩 **7.3** Add `Events.handleTextInput(input)` - auto-select checkbox when typing
- [x] 🟩 **7.4** Add `Events.handleContinueClick()` - validate and navigate
- [x] 🟩 **7.5** Update `Events.handleClick()` to delegate to new handlers

### Step 8: CSS Styles
- [x] 🟩 **8.1** Add checkbox answer styles (`.checkbox-answer`, `.checkbox-answer--selected`, `.checkbox-answer__checkbox`)
- [x] 🟩 **8.2** Add icon checkbox styles (`.checkbox-answer--icon`, `.checkbox-answer__emoji`)
- [x] 🟩 **8.3** Add text input styles (`.text-input-field`, `.text-input-field__input`)
- [x] 🟩 **8.4** Add continue button styles (`.continue-button`, `.continue-button--disabled`)
- [x] 🟩 **8.5** Add likert scale styles (`.likert-scale`, `.likert-option`, `.likert-option--selected`, `.likert-option__icon`, `.likert-option__label`)

### Step 9: Testing & Verification
- [x] 🟩 **9.1** Test single choice icon_list (q1-4, q10-13, q29)
- [x] 🟩 **9.2** Test single choice text_list (q7-9, q16, q30)
- [x] 🟩 **9.3** Test multiple choice checkbox_list (q5-6, q14-15, q27)
- [x] 🟩 **9.4** Test multiple choice icon_checkbox_list (q26, q28, q31)
- [x] 🟩 **9.5** Test likert scale (q17-25)
- [x] 🟩 **9.6** Test navigation flow through all questions
- [ ] 🟨 **9.7** Test state persistence (refresh page, answers retained) - Manual test required
- [ ] 🟨 **9.8** Test mobile responsiveness - Manual test required

---

## Files to Modify
| File | Changes |
|------|---------|
| `funnel/app.js` | Icons, State, Components, Screens, Events, App modules |
| `funnel/styles.css` | New component styles |

## Dependencies
- Landing screen (complete)
- JSON data loading (complete)
- State management (complete, needs array support)
