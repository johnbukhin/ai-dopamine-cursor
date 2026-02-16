# Phase 3a: Loading & Transition Screens Implementation Plan

**Overall Progress:** `100%`
**Issue:** #7 / YEV-10 (split)

## TLDR
Build 3 loading/transition screens with timed animations, sequential progress checklists, overlay engagement modals, and testimonial cards. Loading screens simulate backend processing while keeping users engaged with commitment questions.

## Critical Decisions
- **Animation approach:** CSS keyframes + JS timers for sequencing (no external libs)
- **Engagement modals:** Overlay dialogs, fire-and-forget (no state storage)
- **Modal timing:** Pop up at intervals during progress animation, loading pauses until answered
- **loading_1 behavior:** Auto-advance after animation (~3s), no Continue button
- **profile_creation / plan_creation_v2:** Continue button appears after all modals answered + animation done
- **Routing:** `case 'transition':` in switch, branch on `screenData.type` (`loading_with_social_proof` vs `loading_with_engagement`)
- **Testimonials:** Displayed below progress area in profile_creation only (2 cards from JSON)

## Tasks:

- [x] 🟩 **Step 1: Route transition screens in App.render()**
  - [x] 🟩 Add `case 'transition':` to switch statement
  - [x] 🟩 Branch: `loading_with_social_proof` → `Screens.loadingSocialProof()`
  - [x] 🟩 Branch: `loading_with_engagement` → `Screens.loadingEngagement()`

- [x] 🟩 **Step 2: Build Components.circularProgress()**
  - [x] 🟩 SVG circle with stroke-dasharray animation (0→100%)
  - [x] 🟩 Percentage text in center, updates during animation
  - [x] 🟩 CSS: `.circular-progress`, `.circular-progress__circle`, `.circular-progress__text`

- [x] 🟩 **Step 3: Build Components.progressChecklist(steps)**
  - [x] 🟩 Render list of steps with checkmark icons
  - [x] 🟩 Steps start as pending, animate to completed sequentially
  - [x] 🟩 CSS: `.progress-checklist`, `.progress-step`, `.progress-step--completed`, `.progress-step--active`

- [x] 🟩 **Step 4: Build Components.engagementModal(question, options)**
  - [x] 🟩 Semi-transparent overlay backdrop
  - [x] 🟩 Centered card with question text + Yes/No buttons
  - [x] 🟩 Clicking either button dismisses modal (fire-and-forget)
  - [x] 🟩 CSS: `.engagement-modal`, `.engagement-modal__overlay`, `.engagement-modal__card`, `.engagement-modal__buttons`

- [x] 🟩 **Step 5: Build Components.testimonialCard(testimonial)**
  - [x] 🟩 Trustpilot-style: 5 star icons + title + content + author
  - [x] 🟩 Source label ("Trustpilot")
  - [x] 🟩 CSS: `.testimonial-card`, `.testimonial-card__stars`, `.testimonial-card__author`

- [x] 🟩 **Step 6: Build Screens.loadingSocialProof() — loading_1**
  - [x] 🟩 Headline ("Over 534,568 people your age") + content text
  - [x] 🟩 Circular progress component
  - [x] 🟩 "Connecting to database..." loading text
  - [x] 🟩 Auto-advance timer: after ~3s animation completes, navigate to nextScreenLogic
  - [x] 🟩 No Continue button, no back button

- [x] 🟩 **Step 7: Build Screens.loadingEngagement() — profile_creation & plan_creation_v2**
  - [x] 🟩 Headline + subheadline
  - [x] 🟩 Progress checklist (animated step-by-step)
  - [x] 🟩 Circular progress component
  - [x] 🟩 Engagement modals appear at timed intervals during animation
  - [x] 🟩 Animation pauses while modal is open, resumes on dismiss
  - [x] 🟩 Testimonial cards rendered below (profile_creation only, if `testimonials` array exists)
  - [x] 🟩 Continue button appears after animation + all modals complete

- [x] 🟩 **Step 8: Wire animation sequencing logic**
  - [x] 🟩 `LoadingController` object to manage timer state (start, pause, resume, complete)
  - [x] 🟩 Schedule modal popups at defined intervals during animation
  - [x] 🟩 Track modals answered count, enable Continue when all done + animation done
  - [x] 🟩 Wire modal button clicks via event delegation in Events.handleClick()
  - [x] 🟩 Wire Continue button via existing handleContinueClick (needs bypass for `hasAnswers` check since loading screens have no "answers")

- [x] 🟩 **Step 9: Add CSS animations**
  - [x] 🟩 `@keyframes checkmarkPop` — step completion checkmark
  - [x] 🟩 `@keyframes fadeIn/fadeOut` — modal appearance/dismissal
  - [x] 🟩 `@keyframes modalSlideUp` — modal card entrance
  - [x] 🟩 Smooth transitions for step state changes

- [x] 🟩 **Step 10: Test & restart server**
  - [x] 🟩 Kill + restart server on port 8080
  - [x] 🟩 JS syntax validated (no errors)
  - [x] 🟩 All files served (200 OK)
  - [ ] 🟥 Manual test: click through full flow (user to verify)
