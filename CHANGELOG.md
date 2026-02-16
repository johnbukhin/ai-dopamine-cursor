# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Compass Funnel App** (`funnel/`) - Interactive quiz funnel with multi-screen architecture
  - Landing screen with gender selection (Male/Female cards)
  - 3D cartoon-style character images (generated)
  - Purple theme with CSS variables for easy customization
  - JSON-driven content from `liven-funnel-analysis.json`
  - State management with localStorage persistence
  - Multi-screen router with history-based back navigation
  - Mobile-first responsive design
  - Accessibility: keyboard navigation, ARIA labels

- **Question screen types** (Issue #2 / YEV-6)
  - Single choice (`icon_list`, `text_list`) - tap to select and auto-advance
  - Multiple choice (`checkbox_list`, `icon_checkbox_list`) - toggle selections + Continue button
  - Likert scale (1-5 rating) - icon-based with auto-advance
  - Text input field with auto-select for "Type your answer" options

- **Interstitial screens** (Issue #5 / YEV-9)
  - Trust building (interstitial_1): heart icon info card + checkmark bullet list
  - Educational (interstitial_2): research citation + image placeholder
  - Credibility (interstitial_3): 3 university logo SVG badges (Harvard, Oxford, Cambridge)
  - CBT diagram (interstitial_4): circular Thoughts/Feelings/Behavior SVG + therapist card
  - Social proof (interstitial_5): world map SVG with animated avatar markers + "2.5M users"
  - 3 renderers: `trustBuilding()`, `educational()`, `socialProof()`
  - 9 new components: infoCard, checkmarkBullets, researchCitation, imagePlaceholder, universityLogos, cbtDiagram, expertBadge, therapistCard, worldMap

- **Loading/transition screens** (Issue #7 / YEV-10 split)
  - Social proof loading (loading_1): circular progress animation + "534,568 people" text, auto-advances after ~3s
  - Engagement loading (profile_creation): progress checklist + 3 overlay engagement modals + 2 Trustpilot testimonials
  - Engagement loading (plan_creation_v2): progress checklist + 1 engagement modal
  - `LoadingController` — timed animation sequencer with pause/resume for modal interrupts
  - 2 renderers: `loadingSocialProof()`, `loadingEngagement()`
  - 4 new components: circularProgress, progressChecklist, engagementModal, testimonialCard
  - CSS animations: `checkmarkPop`, `fadeIn/fadeOut`, `modalSlideUp`

- **Value proposition & paywall screens** (Issue #9)
  - Plan ready (`plan_ready`): feature list + "Get my plan" CTA
  - Paywall (`paywall`): countdown timer (10:00 loop), promo code badge, 3 pricing tiers, FAQ accordion, testimonials, trust elements
  - `CountdownTimer` controller — real-time MM:SS with infinite loop, cleanup on unmount
  - 14 new components: featureList, ctaButton, countdownTimer, promoCodeBadge, pricingCard, paymentIcons, mediaLogos, statisticsBlock, awardBadge, moneyBackGuarantee, faqAccordion, companyFooter
  - State: `selectedTier`, `openFaqIndex`
  - Payment icons: Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal SVGs

- **Toast notifications**
  - `App.showToast(type, message)` — generic toast with `error` / `success` variants
  - `App.showError()` / `App.showSuccess()` convenience wrappers
  - Delegated close handler (no inline onclick)

- **Icon library** - 19 Lucide-inspired inline SVGs + 17 emoji mappings
  - Relationship: people, heart, rings, link, handshake, broken_heart
  - Actions: thumbs_up, thumbs_down, smile, lightning, hand_stop, checkmark, question, prohibited, puzzle
  - Likert: thumbs_down_x, thumbs_up_star
  - Emoji sets for wellbeing, improvement areas, and goals

- **Navigation**
  - History stack in State (`pushHistory`/`popHistory`) for accurate back navigation
  - Back button uses history, falls back to landing
  - Progress bar auto-calculates total from `questionNumber` fields

- **Security features**
  - XSS protection via `Security.escapeHtml()` utility
  - Debug logging disabled by default (`CONFIG.debug: false`)

- **Developer tooling**
  - `CONFIG.debug` flag to toggle console logging
  - Centralized `log.info/warn/error` utilities
  - Fallback data if JSON fails to load (landing + question_1)
  - `App.showToast()` / `showError()` / `showSuccess()` for non-blocking notifications
  - Multiple JSON path fallback for different server configs

- **CSS design tokens**
  - `--color-success`, `--color-error`, `--color-urgent`, `--color-promo` for status/urgency
  - `--color-primary-rgb` for rgba() usage (91, 91, 214)

- **Project tooling**
  - `.claude/commands/explore.md` - Exploration slash command
  - `.claude/commands/document.md` - Auto-close GitHub issue after documentation
  - `CLAUDE.md` - Dev workflow, test credentials, GitHub integration docs

### Changed
- `handleContinueClick` skips answer validation for interstitial, transition, personalized_results, value_proposition screens
- `App.render()` cleans up LoadingController and CountdownTimer before DOM swap

### Fixed
- **Timer reset on paywall** — pricing/FAQ clicks use targeted DOM updates instead of full re-render; countdown no longer restarts
- **Keyboard accessibility** — pricing cards and FAQ questions now respond to Enter/Space
- **Toast close** — delegated handler replaces inline onclick; consistent event delegation
- **Success toast** — paywall CTA uses `showSuccess()` (green) instead of `showError()` (red)
- Hardcoded green color replaced with `var(--color-success)` CSS variable
- `--color-primary-rgb` defined in `:root` (expert badge background was transparent)
- Citation year now escaped via `Security.escapeHtml()`
- Testimonial star color uses `var(--color-success)` instead of hardcoded `#22c55e`
- Testimonial star rating capped to max 5

### Files Added
```
funnel/
├── index.html      # Entry point with favicon
├── styles.css      # Purple theme, mobile-first, 15+ component styles
├── app.js          # Router, state, components, 9 screen renderers, LoadingController
└── assets/
    ├── male.png    # Cartoon male character
    └── female.png  # Cartoon female character
```

## [1.0.0] - 2026-02-02

### Added
- Initial project setup
- Funnel capture automation (Puppeteer)
- PDF generation from screenshots
- Liven funnel analysis JSON
- Project documentation (README, CONTEXT, ARCHITECTURE, CLAUDE.md)
- GitHub repository sync
