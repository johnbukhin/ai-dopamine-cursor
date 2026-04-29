# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added (Issue #27)
- **Checkout prefetch** — `prefetchCheckout()` fires `/api/create-checkout` in the background the moment the paywall renders; `stripe.elements({ clientSecret })` pre-initialized as soon as the PI resolves, giving Stripe a head-start loading payment form assets before the user reaches checkout
- **Tier-change re-prefetch** — clicking a different pricing plan aborts the in-flight prefetch and starts a fresh one immediately via `AbortController`; `initStripe()` awaits the prefetch promise (instant if already resolved) then falls back to a fresh fetch with zero regression risk
- **Apple Pay / Google Pay** — automatically surfaces in Stripe Payment Element on supported devices; requires one-time domain registration in Stripe Dashboard → Settings → Payment Method Domains (no code changes needed)
- **Smoke test** (`scripts/smoke-test.sh`) — 5-category post-deploy check: (1) page health (HTTP 200 + correct title for funnel and webapp), (2) `create-checkout` returns `clientSecret` and rejects missing fields; webhook rejects unsigned POST, (3) Supabase `subscriptions` table readable via service role, (4) full E2E Stripe mock purchase → Supabase row appears within 20 s, (5) `Login.tsx` hash-before-session order and `signOut()` present
- **Auto smoke test on push** (`.claude/settings.json`) — Claude Code PostToolUse hook runs smoke test automatically after every `git push`

### Fixed (Issue #27)
- **New buyer logged in as previous user** — `Login.tsx` `tryAutoAuth` was calling `getSession()` before reading URL hash tokens; a cached session from a prior user was returned before the new buyer's tokens were consumed. Fixed by checking URL hash first, then calling `supabase.auth.signOut()` before `setSession()` so the correct user is always active after a purchase redirect
- **"No active subscription found" for new users** — three-part root cause: (1) Stripe webhook URL pointed to decommissioned Vercel project (corrected in Stripe Dashboard); (2) `STRIPE_WEBHOOK_SECRET` was missing from Vercel env vars (added); (3) Vercel's default JSON body parser converted `req.body` to an object before `stripe.webhooks.constructEvent()` could verify the HMAC signature — fixed with `export const config = { api: { bodyParser: false } }` and a `getRawBody()` stream reader
- **Subscription ID null for some invoices** — `invoice.subscription` moved to `invoice.parent.subscription_details.subscription` in Stripe API 2025-03+; webhook now resolves via three-path fallback: old field → new field → live `subscriptions.list` API call
- **Orphaned subscription schedules** — `create-checkout` now lists and cancels any `active`/`not_started` schedules for the customer before creating a new one, preventing dangling Stripe objects from paywall prefetch bursts or tier switches

### Security (Issue #27)
- CORS on `create-checkout` and `create-user` restricted from wildcard `*` to `https://ai-dopamine-addict.vercel.app`
- `quizAnswers` payload capped at 50 KB in `create-user` — oversized JSONB rejected at API boundary before reaching Supabase
- Removed `whsec_todo` placeholder bypass from webhook signature check — secret must be a real value; placeholder can no longer silently skip HMAC verification

### Added (Issue #22)
- **Purple visual theme** — full color system overhaul; emerald/stone replaced with purple/gray across all components
- **Edge-to-edge illustration headers** — Dashboard, AI Coach, Urge Help, and Login now open with full-width hero images (gradient fade into background)
- **Tailwind v3 (Play CDN)** — upgraded from v2 CDN; unlocks full token support (`purple-*`, `rose-*`, arbitrary values)
- **Time-based greeting** — Dashboard shows "Good morning / afternoon / evening" based on current hour
- **Settings in main nav** — Settings moved from sidebar footer/mobile header into primary nav (both desktop and mobile bottom bar); replaces "Future" placeholder

### Fixed (Issue #22)
- **Logout bypassed app state reset** — new Log Out button in Settings was calling `supabase.auth.signOut()` directly; fixed by wiring `onLogout` prop through `Settings` → `ProfileSettings` so full state cleanup runs
- **Mobile content hidden behind bottom nav** — `pb-[4.5rem] md:pb-0` was accidentally removed from `<main>` during redesign; restored
- **Urge Help shortcut used global event bus** — Dashboard's "Urge Help" quick button was dispatching a `CustomEvent` on `window`; replaced with direct `onChangeView` prop call

### Changed (Issue #22)
- **Desktop sidebar** — logout button restored to footer; redundant `MobileHeader` removed
- **Plan28 `completedTasks`/`onTaskToggle`** — changed from optional to required props (always provided by App.tsx)

### Added (Issue #21)
- **Supabase data persistence** — all webapp user data now survives page refresh: check-ins, plan task completions, AI coach conversation history
- **`check_ins` table** — each daily check-in (status, triggers, emotions, reaction, coping strategies, notes, AI insight, time of day) inserted on completion; loaded on login ordered by date
- **`plan_progress` table** — individual task completions stored per day per plan cycle (`plan_started_at`); reconstructed into `Record<number, Set<string>>` on login; optimistic UI update fires before DB write
- **`user_app_state` table** — single row per user storing active `plan_started_at`; auto-created on first login; supports plan restart (old rows preserved, new cycle timestamp scopes queries)
- **`coach_messages` table** — full AI coach conversation upserted after each assistant reply (jsonb array, one row per user); welcome message excluded from storage, always prepended at load time

### Fixed (Issue #21)
- **Page-refresh logout** — added `supabase.auth.getSession()` as first check in `Login.tsx` auto-auth; native Supabase session (persisted in `sb-*` localStorage keys) now restores without re-login
- **Coach messages stale-closure bug** — upsert used closure-captured `messages` state which could be stale on rapid sends; replaced with `messagesRef` kept current via `useEffect`

### Changed (Issue #21)
- `Plan28` `completedTasks` and `onTaskToggle` props changed from optional to required (always provided by `App.tsx`)

### Added (Issue #20)
- **Settings → Access tab** — live subscription data from Supabase `subscriptions` table: plan label, amount paid, begin date, renewal/access-until date, active/cancelled badge
- **Cancel Membership flow** — single-step confirmation modal; calls `POST /api/cancel-subscription` which sets `cancel_at_period_end: true` in Stripe and mirrors to Supabase; user retains access until period end
- **Renew Subscription** — green button shown when subscription is cancelled; calls `POST /api/renew-subscription` which flips `cancel_at_period_end: false` in Stripe and Supabase; UI reverts to active state immediately
- **Settings → Profile tab** — email pre-filled from Supabase auth (read-only); password change via `supabase.auth.updateUser({ password })` with validation and success/error feedback
- **`webapp/api/cancel-subscription.js`** — ownership-verified cancellation endpoint; releases Stripe subscription schedule if present before updating, logs schedule+subscription IDs on partial failure
- **`webapp/api/renew-subscription.js`** — ownership-verified renewal endpoint; re-enables auto-renew on an already-cancelled subscription
- **Webhook enrichment** (`funnel/api/webhook.js`) — `invoice.payment_succeeded` now writes `current_period_end`, `plan_label`, `cancel_at_period_end: false` to `subscriptions` table; resolves human-readable label from `PRICE_LABEL_MAP` with `description` fallback

### Fixed (Issue #20)
- **Stripe schedule error on cancel** — subscriptions managed by a schedule rejected direct `cancel_at_period_end` update; fixed by releasing the schedule first
- **Button text invisible** — `Button.tsx` used `text-stone-50`/`stone-*`/`rose-*` (Tailwind v3-only); replaced with `text-white`/`gray-*`/`red-*` (v2-compatible)
- **Cancel API on wrong domain** — `CancelFlow` called `/api/cancel-subscription` as relative URL; this resolved to the webapp domain (`mind-compass-webapp.vercel.app`) not the funnel project; fixed by adding the endpoint to `webapp/api/`
- **`paid_at` null crash in webhook** — `new Date(null * 1000)` stored Unix epoch `1970-01-01`; guarded to store `null` when `status_transitions.paid_at` is missing

### Security (Issue #20)
- CORS on `cancel-subscription` and `renew-subscription` restricted from wildcard `*` to `https://mind-compass-webapp.vercel.app`

### Added (Issue #19)
- **Structured quiz data in `users_profile`** — 10 new queryable columns written on account creation: `gender`, `age_group`, `main_challenge`, `goal`, `score_overall`, `score_dopamine_sensitivity`, `score_emotional_regulation`, `score_pattern_stage`, `score_physical_impact`, `funnel_version`
- **Dev mock for account creation** — on localhost, `handleAccountFormSubmit` skips the `/api/create-user` API call and navigates forward; real API runs on Vercel only
- **Dev mock for Stripe checkout** — on localhost, checkout screen shows a "Complete Payment (Mock)" button that skips Stripe and goes to the next screen
- **`isDev()` helper** — module-level utility in `app.js` for detecting localhost; replaces duplicate `isLocalhost` checks

### Fixed (Issue #19)
- **Gender not saved** — was reading `State.getAnswer('gender_selection')` but gender is stored under `'landing'` key by `handleGenderSelect`
- **`funnel_version` always null on Vercel** — regex only matched `/funnels/v2/` (localhost path); added second pattern to match `/funnel-v2/` (Vercel rewrite URL)
- **Vercel routing infinite load** — `fetch('config.json')` from URL `/funnel-v2` resolved to `/config.json` (wrong path); fixed by redirecting `/funnel-v2` → `/funnel-v2/` and rewriting `/funnel-v2/:path+` → `/funnels/v2/:path+` so relative fetches resolve correctly
- **Root URL 404** — `https://ai-dopamine-cursor.vercel.app/` now redirects to `/funnel-v2/`

### Changed (Issue #19)
- `create-user.js` text fields (`gender`, `age_group`, `main_challenge`, `goal`, `funnel_version`) clipped to 100/20 chars before insert to guard against oversized payloads silently failing the non-fatal profile write
- `profileError` log now includes `profileError.code` for easier Supabase debugging

### Added (Issue #18)
- **Timer persistence across page refreshes** — countdown timer stores expiry timestamp in `localStorage` (`mc_discount_expiry`); on reload, resumes from remaining time rather than resetting to 10:00
- **Timer expiry behavior** — when countdown hits 00:00: promo ticket hidden, `.discount-expired` CSS class applied to paywall; pricing cards revert to full (original) price, discounted price and per-day badge hidden; expired state persists across reloads
- **`maestro` and `discover` payment icons** — were missing from engine icon set despite being referenced in v2 screens.json
- **CSS architecture rules in CLAUDE.md** — explicit `width: 100%` over `align-items: stretch`, hard-refresh reminder, canonical data source for paywall content

### Fixed (Issue #18)
- **Paywall element widths** — first-section elements (before/after, promo ticket, context tags, CTA) were narrower than second section; fixed by adding `width: 100%; box-sizing: border-box` to `.paywall > *` instead of relying on `align-items: stretch` cascade
- **AMEX icon clipping** — complex path-based SVG was clipping "EXPRESS" at small display sizes; replaced with clean text-based card rendering "AMEX" (same approach as Discover icon)
- **Personalized headline** — was incorrectly appending `for {gender} {ageGroup}` text that was removed in Issue #17; reverted to "Your Porn Addiction Recovery Plan is ready!"
- **EUR pricing in v2 paywall** — migration used wrong source (pre-Issue-#17 USD data); all 3 tiers now use correct EUR amounts (7-day €10.50, 1-month €19.99, 3-month €34.99)
- **Legal disclaimer** — updated to EUR amounts and correct support email `support@mind-compass.app`
- **Timer NaN display** — corrupt or non-numeric `localStorage` value caused `NaN:NaN` countdown display; added `isNaN` guard that clears the corrupt key and starts fresh

### Changed (Issue #18)
- Payment icons upgraded from simplified 48×32 placeholder SVGs to proper branded 780×500 SVGs (Visa, Mastercard, Apple Pay, PayPal); icons sized to 31×20px with `flex-wrap: nowrap`
- `.cta-button` shape updated to pill (border-radius: 50px), uppercase, letter-spacing
- Tighter spacing between pricing cards and primary CTA button

### Removed (Issue #18)
- Dead `.before-after { display: grid }` CSS block — pre-Issue-#17 orphan that was overriding the new `ba-*` layout
- Orphaned `.progress-bar-mini__fill` CSS rules (parent `.progress-bar-mini` was already deleted)
- Stale `subscriptionNote` field from v2 `screens.json` — never rendered by engine, contained wrong USD pricing
- Dead `defaultSelectedTier` field from v2 `screens.json` — engine never read it (hardcoded fallback `'1_month'`)



### Added (Issue #26)
- **Legal policy pages** — 4 standalone HTML pages: Terms of Use, Privacy Policy, Subscription Policy, Cookie Policy
- **Clickable policy links** — landing screen legal text now links to real policy pages (opens in new tab)

### Changed (Issue #26)
- `legalDisclaimer()` links updated from `#hash` anchors to actual HTML files with `target="_blank" rel="noopener noreferrer"`
- Paywall company info synced: "Chesmint Limited" → "Compass Limited", address and email updated

### Added (Issue #25)
- **Paywall screen restored** — full pricing page back in v2 flow: pricing tiers (EUR), before/after comparison, FAQ, testimonials, money-back guarantee, company footer
- **Personalized paywall headline** — `personalizedHeadline()` now uses `PersonalizedText.replace()` for `{gender}` and `{ageGroup}` substitution, consistent with goal_timeline and plan_ready
- **Gender-aware before/after images** — paywall picks `before_state_male.png` / `before_state_female.png` based on quiz gender selection

### Changed (Issue #25)
- Funnel v2 sequence: `scratch_card → paywall → checkout` (was `scratch_card → checkout`)

### Removed (Issue #25)
- Dead data from paywall screens.json: `personalizedInfo`, `trustElements.goals` (duplicate of `goalsList`), `trustElements.lifeComparison` (duplicate of `contrastLists`)

### Added
- **Funnel v2 UI/UX redesign** (Issue #24)
  - Testimonial horizontal carousel with auto-scroll, touch/mouse drag, dot navigation
  - Profile illustration — SVG character with 4 emotional states based on score level
  - Personalized diagnostic text generator (`getDetailedDescription`) — 3-part level-based copy
  - SVG icons for checkbox lists replacing emoji icons (couple, shield, bicep, target, heart, trophy, lightning, meditation, flame, bird)
  - Animated map pins with staggered pinDrop animation on social proof screen
  - Scratch card ticket shape with CSS notch pseudo-elements, pulsing instruction, confetti on reveal
  - Likert scale redesign — full-screen layout, bottom-anchored scale, external labels
  - University logo cards with prefix/name typographic split
  - Recovery chart — single cubic bezier S-curve, dotted grid, "Today"/"After using Mind Compass" badges
  - Dysregulation bar level badges on profile summary

### Changed
- **Funnel v2 layout & components** (Issue #24)
  - Global content alignment: centered → left-aligned with per-screen overrides
  - Back button: removed text label, icon-only
  - Answer cards: removed right arrows, centered labels
  - Checkbox answers: flat list style with separator lines, label before checkbox
  - Landing screen: centered text, black colors, top margin
  - Welcome interstitial: 🙏 emoji, disclaimer below bullets, rounded card with purple checkmarks
  - Goal timeline: 6-bar chart with color gradient and Goal badge
  - Continue buttons wrapped in `continue-container` for consistent fixed positioning
  - Social proof headline: "2,500,000" → "100,000"
  - CBT headline: "reviewed by" → "designed in collaboration with"
  - Profile summary: compact layout, purple metric icons
  - Plan creation: line break in dynamic subheadline

### Removed
- **Old paywall screen** (Issue #24) — removed from v2 sequence and screens.json (using shared checkout screen instead)

### Fixed
- **Event listener cleanup** (Issue #24) — TestimonialCarousel uses AbortController to remove all listeners on screen transition
- **Scratch card accumulation** (Issue #24) — added `isRevealed` guard to stop scratch events after discount reveal
- **Confetti performance** (Issue #24) — batch DOM insertion via DocumentFragment
- **Unescaped profile description** (Issue #24) — `levelDesc` now passes through `Security.escapeHtml()`

### Added
- **Mind Compass funnel v2** (Issue #16, `funnel/liven-funnel-2/`)
  - Complete quiz-to-paywall funnel: 54 screens, 36 questions (27 likert + 9 mixed type)
  - Real scoring engine: 4 sub-metrics (dopamine_sensitivity, emotional_regulation, pattern_stage, physical_impact) calculated from user answers Q1-Q14, overall score from Q1-Q27
  - Personalized text system: `{name}`, `{gender}`, `{ageGroup}` placeholders dynamically replaced throughout the funnel
  - New screen types: `age_selection`, `timeline_chart` (bar chart with dynamic months), `recovery_curve` (SVG bezier chart with gradient), `scratch_card` (HTML5 Canvas scratch-to-reveal + discount modal)
  - Paywall with before/after comparison, personalized challenge/goal from quiz answers, countdown timer, life comparison cards, FAQ accordion, testimonials, 3 pricing tiers
  - Data-driven architecture: all content in `funnel-data.json`, single `app.js` renders dynamically
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

### Changed
- **Funnel directory restructure** (Issue #16) — moved original funnel to `funnel/liven-funnel-1/`, new funnel in `funnel/liven-funnel-2/`
- **Vercel routing** (Issue #16) — `funnel/vercel.json` updated with rewrites for `/liven-funnel-1` and `/liven-funnel-2`
- `webapp/App.tsx` — reverted dev shortcut; login required again

### Fixed
- **Gender personalization bug** (Issue #16) — gender comparison was case-sensitive (`'male' === 'Male'` → always "women"); fixed with `.toLowerCase()`
- **Pay button retry** (Issue #16) — removed `{ once: true }` from Stripe pay button listener; failed payments can now retry without page refresh
- **Thank-you screen price** (Issue #16) — `selectedTier.discountedPrice` didn't exist in JSON; added `|| price` fallback
- **Pricing card radio** (Issue #16) — `handlePricingCardClick` now toggles `pricing-card__radio--selected` on inner radio element
- **Stripe double-init** (Issue #16) — added `_stripeInitializing` guard with reset on error and navigation
- **Countdown timer** (Issue #16) — `Components.countdownTimer()` was never called in paywall renderer; now renders before pricing
- **Goal timeline / recovery curve navigation** (Issue #16) — added `timeline_chart` and `recovery_curve` to `isNonQuestion` list in `handleContinueClick`
- **CBT interstitial crash** (Issue #16) — guarded `screenData.content.expertReview` access with null check
- **`getAnswer()` falsy values** (Issue #16) — changed `|| null` to `?? null` to preserve valid falsy answers
- **CSS variables** (Issue #16) — defined 7 missing aliases (`--color-text`, `--color-card-bg`, `--color-bg`, `--color-primary-dark`, `--shadow-md`, `--radius-full`, `--font-size-base`); removed duplicate `--color-success`
- **Typos** (Issue #16) — "by practicing therapist" → "by a practicing therapist"; pricePerDay `$0.88` → `$0.89`
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
