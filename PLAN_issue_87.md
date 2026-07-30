# Feature Implementation Plan — Issue #87: Landing Page

**Overall Progress:** `95%` _(implementation + local QA done; production smoke test + docs run post-deploy)_

## TLDR
Build a new sibling site at `funnel/landing-page/` — a single, high-converting, mobile-first marketing page that sells **Mind Compass** (porn/dopamine recovery) **directly** (no quiz), as a second acquisition channel alongside the web funnel. It carries an **embedded Stripe checkout** that reuses the existing serverless APIs (`/api/prices`, `/api/create-checkout`, `/api/provision-account`), the same live pricing, Meta Pixel/CAPI tracking, and hands off to the webapp on success. Landing becomes the site homepage (`/` → `/landing-page/`).

**North star (owner directive):** the page must *persuasively sell first*. Emotion + benefit + shame-reframe lead; science is a short, subordinate trust/credibility block, never a lecture. No overclaiming.

## Critical Decisions
- **Bespoke page + reuse backend, not the quiz engine** — `app.js` is a quiz state machine that owns `#app`; embedding it is awkward and kills design freedom. Instead: hand-crafted `index.html`/`landing.css`/`landing.js`, with checkout glue that calls the *same* APIs + Stripe publishable key. Full design control, zero `app.js` changes, end-to-end sale. Rationale: matches "advanced, hand-crafted single page" + "embedded checkout" requirements.
- **Data-driven copy via `content.json`** — mirrors funnel's data/engine split ("same power & hierarchy"); paywall data (tiers, before/after, testimonials, FAQ, guarantee, disclaimer) ported from `funnel/funnel-v2/screens.json`. Keeps prices/legal a single source, easy to edit.
- **Live pricing via `/api/prices`** — replicate the funnel's compact currency-detect (timezone → usd/eur/gbp/cad/aud) + price population, with static EUR fallback copied from `screens.json` (so it degrades like the funnel). Marked "keep in sync with engine/app.js Currency".
- **Same-origin deploy** — served from `ai-dopamine-addict.vercel.app`, so hardcoded CORS in `create-checkout.js`/`provision-account.js` needs no change.
- **Positioning: direct** (porn/dopamine recovery), **language: English**, **routing: landing = `/`**. (Owner-confirmed.)
- **Localhost dev-mock** in `landing.js` (mirror engine) — bypass real Stripe charges when testing on `localhost` (live keys are in use).
- **Copy guardrails** — apply STRONG/MIXED/WEAK phrasing from verified sources: allowed "grounded in neuroscience & CBT", "WHO-recognized (ICD-11)", "~66 days to form a habit", "many people report"; banned "cure", "clinically proven", "21 days", "damages your brain". Gender-neutral voice.

## Tasks

- [ ] 🟩 **Step 1: Scaffold `funnel/landing-page/`**
  - [ ] 🟩 Create folder + `index.html`, `landing.css`, `landing.js`, `content.json`
  - [ ] 🟩 `index.html` head: title "Mind Compass", favicon, `landing.css`, Stripe.js, inline Meta Pixel snippet (same pixel id `1530402652053089`), image preloads, mobile viewport
  - [ ] 🟩 Reuse root assets via `../assets/` (before/after, cbt_head_brain, badges, world-map, funnel-v2 upsell imagery)

- [ ] 🟩 **Step 2: Author `content.json` (persuasion-first copy)**
  - [ ] 🟩 Port paywall data from `funnel-v2/screens.json`: pricingTiers, beforeAfter metrics, testimonials, FAQ, moneyBackGuarantee, trustElements, legal disclaimer, company/footer links
  - [ ] 🟩 Generic personalization (replace `{gender}/{ageGroup}` → "Your Personalized Recovery Plan")
  - [ ] 🟩 Write new marketing copy: hero (verb-first permanence promise + mechanism subhead + proof number), shame-reframe/agitation, how-it-works (3 steps), feature stack (urge/panic tool, streaks, CBT lessons, AI coach, progress), who-it-helps use-cases, benefit stack, "what to expect" (evidence-framed, not overclaimed)
  - [ ] 🟩 Short science/credibility block with 2–4 curated citations (subordinate to the offer)

- [ ] 🟩 **Step 3: Build page markup (`index.html` sections)**
  - [ ] 🟩 Section order (from teardown): sticky header+CTA → hero → proof strip (rating/users) → problem/shame-reframe → how-it-works → feature deep-dive → before→after → who-it-helps → outcome/expectations → testimonials (quantified) → science/trust strip → pricing → guarantee + privacy/discretion → payment-security icons → FAQ → final CTA → footer (legal links) → checkout modal
  - [ ] 🟩 Semantic, accessible markup; single primary CTA action repeated

- [ ] 🟩 **Step 4: Style `landing.css` (mobile-first + desktop)**
  - [ ] 🟩 Reuse brand tokens (primary `#5B5BD6`, success `#22c55e`, bg `#F8F8FC`, radii, shadows, system font)
  - [ ] 🟩 Mobile-first layout; responsive breakpoints for desktop/web; sticky mobile CTA bar
  - [ ] 🟩 Polished visuals: hero, cards, before/after bars, pricing cards (MOST POPULAR badge), FAQ accordion, modal; scroll-reveal-friendly

- [ ] 🟩 **Step 5: Interactions (`landing.js`)**
  - [ ] 🟩 Render dynamic parts from `content.json` (tiers, testimonials, FAQ, guarantee, footer)
  - [ ] 🟩 Sticky CTA visibility, smooth-scroll, FAQ accordion, tier selection state, optional countdown/urgency
  - [ ] 🟩 Scroll-reveal animations (lightweight, no heavy deps)

- [ ] 🟩 **Step 6: Live pricing integration**
  - [ ] 🟩 Compact `Currency` helper: timezone/locale detect (usd/eur/gbp/cad/aud) + `?currency=` override
  - [ ] 🟩 Fetch `/api/prices` (sessionStorage cache), populate tier prices + per-day + disclaimer; static EUR fallback from `content.json`
  - [ ] 🟩 Tier-aware legal disclaimer text (mirror `Currency.tierDisclaimer`)

- [ ] 🟩 **Step 7: Embedded checkout (end-to-end)**
  - [ ] 🟩 Checkout modal: email input + `#payment-element` mount + pay button (disabled until ready)
  - [ ] 🟩 POST `/api/create-checkout` `{tierId,email,currency}` → `clientSecret`; mount Stripe Payment Element with hardcoded publishable key
  - [ ] 🟩 `stripe.confirmPayment` (`redirect:'if_required'`); on success POST `/api/provision-account` (email) → redirect to webapp via the same token-handoff the funnel uses
  - [ ] 🟩 Localhost dev-mock bypass; error/loading states

- [ ] 🟩 **Step 8: Tracking**
  - [ ] 🟩 Meta Pixel: PageView (auto), ViewContent/InitiateCheckout on checkout open, Purchase on success with `event_id = purchase_${subscriptionId}` (CAPI dedup preserved)

- [ ] 🟩 **Step 9: Routing (`funnel/vercel.json`)**
  - [x] 🟩 Change `/` redirect → `/landing-page/`; add `/landing-page` → `/landing-page/`
  - [x] 🟩 Legal links: landing footer points directly at `/legal/*.html` (served via the existing global `/legal/:path+` rewrite) — no per-path redirects needed; funnel-v2 stays reachable via `/funnel-v2`

- [ ] 🟩 **Step 10: QA & smoke test**
  - [ ] 🟩 Restart local server, hard-refresh; verify load (title "Mind Compass"), no console errors, primary flow, back/close, mobile + desktop
  - [ ] 🟩 Verify checkout dev-mock flow end-to-end locally
  - [x] 🟩 Added landing-page HTTP 200 + title-contains-"Mind Compass" check to `scripts/smoke-test.sh` (full run is post-deploy — landing check will 404 until deployed)
  - [x] 🟩 Local QA: HTTP 200, valid `content.json`, `node --check` clean, all assets/engine CSS resolve, dev-mock gated to localhost
  - [x] 🟩 Science citations (Voon 2014, WHO ICD-11 6C72, Antons 2022, Lally 2010) verified earlier via research sub-agents; disclaimer present

- [ ] 🟨 **Step 11: Docs stub (handled fully in `/document`)**
  - [ ] 🟥 Optional `funnel/landing-page/README.md` + research/citations reference file (deferred to `/document`)
