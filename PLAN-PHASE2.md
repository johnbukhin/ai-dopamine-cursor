# Phase 2: Interstitial Screens Implementation Plan

**Overall Progress:** `100%`
**Issue:** #5 / YEV-9

## TLDR
Build 5 interstitial screens (trust building, educational, credibility/CBT, social proof) that sit between question blocks in the funnel flow. SVG/CSS for diagrams and logos, placeholder images for photos.

## Critical Decisions
- **Assets:** SVG/CSS for logos, diagrams, map; placeholder blocks for photos (man at laptop, therapist)
- **Architecture:** 3 separate renderers — `trustBuilding()`, `educational()`, `socialProof()`
- **Progress bar:** None on interstitials — just back button + content + Continue CTA
- **Flow boundary:** interstitial_5 → profile_creation navigates to placeholder (Phase 3)
- **Routing:** Use `screenType: 'interstitial'` then branch on `type` field

## Tasks:

- [x] 🟩 **Step 1: Route interstitials in App.render()**
  - [x] 🟩 Add `case 'interstitial':` to switch statement
  - [x] 🟩 Branch to renderer based on `screenData.type` (trust_building, educational, social_proof)

- [x] 🟩 **Step 2: Build Screens.trustBuilding() — interstitial_1**
  - [x] 🟩 Back button (no progress bar)
  - [x] 🟩 Heart icon + "Everything at Liven is science based" info card
  - [x] 🟩 Checkmark bullet list (2 items from JSON `content.bulletPoints`)
  - [x] 🟩 Continue button wired to `nextScreenLogic`
  - [x] 🟩 CSS: `.info-card`, `.checkmark-bullets`, `.checkmark-bullet`

- [x] 🟩 **Step 3: Build Screens.educational() — interstitial_2**
  - [x] 🟩 Back button (no progress bar)
  - [x] 🟩 Headline + description text
  - [x] 🟩 Research citation component (author, year, title)
  - [x] 🟩 Image placeholder block ("Man at laptop")
  - [x] 🟩 Continue button
  - [x] 🟩 CSS: `.educational-card`, `.research-citation`, `.image-placeholder`

- [x] 🟩 **Step 4: Extend trustBuilding() for interstitial_3 (credibility)**
  - [x] 🟩 Detect `credibilityLogos` array in screenData
  - [x] 🟩 3 university logo SVG badges (Harvard, Oxford, Cambridge)
  - [x] 🟩 Subheadline support
  - [x] 🟩 CSS: `.university-logos`, `.university-logo`

- [x] 🟩 **Step 5: Extend trustBuilding() for interstitial_4 (CBT diagram)**
  - [x] 🟩 Detect `content.cbtModel` in screenData
  - [x] 🟩 Circular CBT diagram SVG (Thoughts ↔ Feelings ↔ Behavior)
  - [x] 🟩 Expert badge ("Content reviewed by an expert")
  - [x] 🟩 Therapist card (photo placeholder + name + title)
  - [x] 🟩 CSS: `.cbt-diagram`, `.therapist-card`, `.expert-badge`

- [x] 🟩 **Step 6: Build Screens.socialProof() — interstitial_5**
  - [x] 🟩 Back button (no progress bar)
  - [x] 🟩 "Join over 2,500,000 people" headline + subheadline
  - [x] 🟩 World map SVG with avatar dot markers on 5 continents
  - [x] 🟩 Continue button
  - [x] 🟩 CSS: `.world-map`, `.avatar-marker`, `.social-proof`

- [x] 🟩 **Step 7: Wire Continue button for interstitials**
  - [x] 🟩 Existing `handleContinueClick` handler covers this (uses `data-screen` attribute)
  - [x] 🟩 All 5 interstitials use `Components.continueButton(false, screenId)`
  - [x] 🟩 Back navigation uses history stack (same pattern as questions)

- [x] 🟩 **Step 8: Test & restart server**
  - [x] 🟩 Kill + restart server on port 8080
  - [ ] 🟥 Manual test: click through full flow (user to verify)
