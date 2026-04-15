# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Paywall UI redesign** (Issue #17)
  - New sticky minimal paywall header (timer + CTA only) — replaces generic header; `Components.paywallHeader()` renders `.paywall-header` fixed bar; `CountdownTimer.updateDisplay()` now uses `querySelectorAll` to sync both header timer and promo ticket timer simultaneously
  - New `question_age` screen (single-choice: 18–24, 25–34, 35–44, 45–54, 55+) inserted as second screen after landing
  - `Components.beforeAfter()` — two-column grid with before/after photos, metric rows with progress bars; After image uses `background-image` div technique for reliable zoom/crop without layout-flow issues
  - `Components.personalizedHeadline()` — "Your Dopamine Reset Plan for men {ageGroup} is ready!" with primary-color highlight span; reads `question_age` answer from State with fallback
  - `Components.promoTicket()` — ticket-style card with promo code pill + live countdown timer digits; promo code format updated to `Name_Apr2026` (was `NAME_APR_50`)
  - `Components.contextTags()` — two-chip row showing main challenge and goal pulled from quiz answers with icon + value labels
  - `Components.goalsList()` — "Our goals" heading + 8-item green-checkmark list from JSON
  - `Components.statsWithChart()` — section heading, SVG arc/semicircle chart (3 concentric arcs at 45%/77%/83%), 3 stat callout blocks with large primary-color percentages
  - `Components.contrastLists()` — "Without Compass" grey ✕ card vs "With Compass" green-bordered ✓ card from JSON
  - `Components.secondCtaBlock()` — duplicate pricing + CTA after testimonials section, now also renders legal disclaimer and payment icons for full trust context
  - Redesigned `Components.pricingCard()` — radio-button style (flex row), per-day price in right-side grey badge, MOST POPULAR as full-width header bar above the card
  - Redesigned `Components.moneyBackGuarantee()` — full bordered card with medal SVG badge bottom-right and "Learn more" link
  - Updated `Components.faqAccordion()` — heading changed to "People often ask", `?` circle icon badge per question
  - Updated `Components.testimonialCard()` — orange stars, `handle` field right-aligned beside author name
  - Official brand SVGs for all payment icons (Visa, Mastercard, Amex, Apple Pay, Maestro, Discover) using standardized `viewBox="0 0 780 500"` coordinate space — Apple Pay includes correct two-path Apple logo with leaf; Discover renders "DISC**O**VER" with orange O; Maestro uses overlapping circles with computed purple lens overlap
  - `Components.legalDisclaimer()` — escapes input, then regex-replaces policy names with `<a>` links to prevent XSS from raw HTML in JSON
  - JSON: added `beforeAfter`, `contextTags`, `goalsList`, `contrastLists`, `legalDisclaimer` (plain text), `companyInfo`; updated FAQ, testimonials, statistics; `legalDisclaimer` stores plain text only (links added dynamically by component)
  - New CSS sections: `.paywall-header`, `.before-after`/`.ba-*`, `.paywall-headline`, `.promo-ticket`, `.context-tags`, `.pricing-card` (radio redesign), `.goals-list-section`, `.stats-section`/`.stats-chart`, `.contrast-lists`, `.money-back-card`, `.ba-image--after` (background-image zoom variant), updated FAQ/testimonial styles
  - `paywall-audit.md` — mobile layout audit documenting per-section issues and recommended fixes for 375–429px and sub-375px breakpoints

### Fixed
- **Paywall header timer color** (Issue #17) — timer digits appeared grey because `.paywall-header__timer .countdown-timer__digits` descendant selector never matched (both classes on same element); fixed by applying `color: var(--color-primary); font-size: 28px` directly to `.paywall-header__timer`
- **Legal disclaimer raw HTML** (Issue #17) — `legalDisclaimer` JSON field contained raw `<a>` HTML that was escaped by `Security.escapeHtml()` and rendered as visible text; fixed by storing plain text in JSON and generating links in `Components.legalDisclaimer()`
- **XSS in legal disclaimer** (Issue #17) — `${screenData.legalDisclaimer}` was interpolated raw into DOM; routed through `Components.legalDisclaimer()` which escapes input before link injection
- **Dead `googlepay` icon mapping** (Issue #17) — `iconKeyMap` entry `'googlepay': 'googlepay'` referenced a non-existent SVG definition causing black-circle fallback; entry removed

### Added
- **Stripe checkout screen** (Issue #11)
  - New `checkout` screen inserted between paywall and `thank_you` — custom branded order summary + embedded Stripe Payment Element (cards, Apple Pay, Google Pay, PayPal)
  - `funnel/api/create-checkout.js`: serverless function creates Stripe Customer (deduped by email) + 2-phase Subscription Schedule (intro price × 1 period → regular price forever), finalizes draft invoice to obtain PaymentIntent `client_secret`
  - `funnel/api/webhook.js`: handles `invoice.payment_succeeded` → upserts `subscriptions` row in Supabase; logs warning when signature verification is bypassed
  - `funnel/app.js`: `Screens.checkout()` renders order summary card with tier name, original price, discount row, promo code badge, and "Total today"; `App.initStripe()` POSTs to `/api/create-checkout`, mounts Payment Element, wires pay button with `{ once: true }` listener and `return_url` for 3DS/redirect payment methods
  - `funnel/index.html`: Stripe.js CDN script added
  - `funnel/styles.css`: checkout screen styles (`.checkout__summary`, `.checkout__payment-element`, `.checkout__secure-footer`, etc.)
  - `funnel/package.json`: `stripe ^14` dependency
  - URL hash navigation for dev: `#checkout`, `#paywall`, `#email_capture`, etc. jump directly to any screen without clicking through the funnel

### Fixed
- **Mobile viewport layout** (Issue #10)
  - All 5 answer options now fit on-screen without scrolling on 375px phones — trimmed header chrome (~156px saved via tighter header, progress bar, nav, question text, card padding, and gap)
  - Continue/CTA button is now a fixed floating pill at the bottom of the viewport on all non-paywall screens (always reachable even when 6+ options overflow)
  - Legal disclaimer on landing screen sits directly below the gender cards instead of being pushed to the viewport bottom
  - Button container uses `left: 50%; transform: translateX(-50%); width: calc(100% - 32px)` so it never overflows or clips on any iPhone width
  - Three responsive tiers: `< 374px` (SE), `375px–428px` (most iPhones), shared CTA behavior at `≤ 768px`; paywall screens are fully excluded via `:not(.paywall-screen)` selectors

### Added
- **Seamless post-purchase auth handoff** (Issue #14)
  - Funnel now passes `access_token` + `refresh_token` via URL hash fragment (`#access_token=...&refresh_token=...`) on post-purchase redirect to the webapp
  - `webapp/components/Login.tsx`: `tryAutoAuth` reads hash tokens first (cross-origin), strips them from the URL via `history.replaceState` immediately after consumption, then falls through to the localStorage fallback for same-origin local dev
  - Users land directly on the 28-day plan after purchase — no manual login required

### Changed
- **Editable email on account creation** (Issue #14)
  - Email field on `account_creation` screen is now editable (was read-only) — users can correct a pre-filled typo before account creation
  - Real-time validation: submit stays disabled until email format is valid **and** all password requirements pass
  - `handleAccountFormSubmit` reads email from the DOM input and syncs it back to State so promo code generation and name-fallback logic stay consistent

### Fixed
- **Duplicate email UX** (Issue #14)
  - "Already registered" errors now surface inline on the form (instead of a generic toast) with a clickable "log in directly" link pointing to the webapp login screen
  - Submit button is restored after the error so users can correct the email and retry without reloading

### Added
- **Webapp merge into monorepo** (Issue #13)
  - Replaced `webapp/` placeholder scaffold with the working Mind-Compass React + Vite app
  - Added product modules: Dashboard, Daily Check-In, AI Coach, Urge Help, 28-day Plan, Settings
  - Added webapp data/prompts/services structure (`data/`, `prompts/`, `services/`, `components/`)
  - Added Supabase webapp client bootstrap (`webapp/src/lib/supabase.ts`) for login/session integration
  - Added lightweight shared client logger (`webapp/src/lib/logger.ts`) for consistent warn/error reporting

### Changed
- **Issue #13 post-merge auth flow hardening**
  - `funnel/app.js`: post-account-creation redirect points to deployed webapp URL (`https://mind-compass-webapp.vercel.app`)
  - `webapp/components/Login.tsx`: production login replaces fake login; supports silent token restore from funnel (`compass_access_token` + `compass_refresh_token`)
  - `webapp/components/Login.tsx`: funnel entry URL is now configurable via `VITE_FUNNEL_URL` (with fallback)
  - `webapp/.env.local.example`: documented `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, and optional `VITE_FUNNEL_URL`
  - `webapp/services/geminiService.ts`: tightened error typing (`unknown` + narrowing), removed unsafe `any` paths

### Fixed
- **Issue #13 white-screen regression**
  - Prevented app bootstrap crash when `VITE_GEMINI_API_KEY` is missing by making Gemini client init resilient
  - Replaced temporary debug instrumentation added during troubleshooting with clean production code
  - `webapp/App.tsx`: logout now null-guards Supabase client (`supabase?.auth.signOut()`) to avoid runtime errors in unconfigured environments

### Security
- Kept Supabase service-role usage scoped to serverless function (`funnel/api/create-user.js`); webapp uses anon client credentials only

### Removed
- Removed debugging instrumentation used for runtime white-screen diagnosis from webapp runtime files

### Added
- **User creation flow + Supabase backend** (Issue #12, commit `eddfa69`)
  - `thank_you` screen: animated SVG checkmark, selected plan summary, promo code display
  - `create_account` screen: read-only pre-filled email, password + confirm fields, real-time requirement indicators (8+ chars, 1 number, 1 uppercase), submit disabled until all pass
  - `app_dashboard` screen: placeholder welcome screen for future main product
  - `funnel/api/create-user.js`: Vercel serverless function — creates Supabase auth user + `users_profile` record, returns access token
  - `funnel/package.json`: `@supabase/supabase-js ^2` dependency for serverless function
  - `webapp/`: Next.js scaffold for future main product (`page.tsx`, `layout.tsx`, `lib/supabase.ts`)
  - New state field: `accountCreated: false`
  - New event handlers: `handleAccountFormInput()` (real-time validation), `handleAccountFormSubmit()` (async API call)
  - New CSS: thank-you checkmark animation (`stroke-dasharray`), account creation form, app dashboard placeholder

### Changed
- `Events.handleCtaClick()`: paywall `payment` screen now navigates to `thank_you` (was: showed success toast); `confirmation` screen navigates to `create_account`
- `funnel/liven-funnel-analysis.json`: paywall screen gains `nextScreenLogic: "thank_you"`; added 4 new screen definitions (`thank_you`, `create_account`, `app_dashboard`)

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

- **Form capture & personalized results screens** (Issue #8 / YEV-10 split)
  - Email capture gate (`email_capture`): email input with regex validation, lock icon, privacy note, disabled Continue until valid
  - Name capture gate (`name_capture`): text input, disabled Continue until non-empty
  - Profile summary (`profile_summary`): dynamic sections from JSON + user name pulled from State; checkmark focus-area list
  - Goal timeline (`goal_timeline`): single-choice text_list with "Recommended" badge on first option, auto-advance on tap
  - `Events.handleFormInput()` — validates email (regex) / name (non-empty), toggles Continue button
  - `handleContinueClick()` extended — stores form values via `State.recordAnswer()` before navigating; bypasses `hasAnswers` for form gates
  - `Icons.lock` added — padlock SVG for privacy indicator
  - 3 new CSS sections: `.form-capture`, `.profile-summary`, `.recommended-badge`

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
