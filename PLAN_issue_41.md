# Feature Implementation Plan — Issue #41: Upsell Flow

**Overall Progress:** `100%`

## TLDR
After a successful subscription checkout, show a one-click upsell screen offering the AI Companion bundle (AI Coach + AI Help) before the thank-you step. Also add multi-currency support to all existing subscription prices. No Payment Element shown — charge using the saved PM from checkout.

## Critical Decisions
- **Multi-currency**: Stripe `currency_options` on all Price IDs; `navigator.language` detection on frontend; EUR fallback
- **One-click charge**: New `/api/create-upsell.js` — look up customer by email → list PMs → create + confirm PI server-side
- **No-PM fallback**: Skip silently, log to `upsell_errors` Supabase table
- **Images**: `imagen-4.0-generate-001`, generated once at dev time, committed as static assets to `funnel/funnels/v2/assets/upsell/`
- **Upsell type**: One-time charge (not subscription); toggle between 1-month ($9) and 3-month ($19) bundles
- **Screen insertion**: `upsell` inserted between `checkout` and `thank_you` in sequence

---

## Tasks

- [x] 🟩 **Step 1: Stripe Setup — Create Upsell Price IDs + Add currency_options**
  - [ ] 🟥 Create Stripe Price ID for upsell 1-month bundle (USD $9 + currency_options for EUR/GBP/CAD/AUD)
  - [ ] 🟥 Create Stripe Price ID for upsell 3-month bundle (USD $19 + currency_options)
  - [ ] 🟥 Update `create-checkout.js` `PLAN_MAP` — add `currency_options` to all 5 existing subscription prices
  - [ ] 🟥 Update `create-checkout.js` to detect currency from request (passed from frontend) and pass as `currency` param to Stripe

- [ ] 🟥 **Step 2: Generate Upsell Images**
  - [ ] 🟥 Generate 4 images with `imagen-4.0-generate-001` via Gemini API
  - [ ] 🟥 Save as PNG to `funnel/funnels/v2/assets/upsell/` (hero.png, coach.png, progress.png, community.png)
  - [ ] 🟥 Verify images look good; regenerate any that miss the mark

- [ ] 🟥 **Step 3: Supabase — Create upsell_errors table**
  - [ ] 🟥 Write migration SQL: `supabase/migrations/20260513_upsell_errors.sql`
  - [ ] 🟥 Apply migration in Supabase dashboard

- [ ] 🟥 **Step 4: Backend — /api/create-upsell.js**
  - [ ] 🟥 Create `funnel/api/create-upsell.js`
  - [ ] 🟥 Accept `{ email, priceId, currency }` from frontend
  - [ ] 🟥 Look up Stripe customer by email (`stripe.customers.list({ email })`)
  - [ ] 🟥 List saved PMs (`stripe.paymentMethods.list({ customer, type: 'card' })`)
  - [ ] 🟥 If no PM: log to `upsell_errors`, return `{ success: false, reason: 'no_pm' }`
  - [ ] 🟥 Create + confirm PaymentIntent server-side with `confirm: true, off_session: true`
  - [ ] 🟥 Return `{ success: true }` on success

- [ ] 🟥 **Step 5: Webhook — Add upsell price IDs to PRICE_LABEL_MAP**
  - [ ] 🟥 Add both upsell price IDs to `PRICE_LABEL_MAP` in `funnel/api/webhook.js`

- [ ] 🟥 **Step 6: Frontend — Currency detection utility**
  - [ ] 🟥 Add `detectCurrency()` function in `funnel/engine/app.js` (maps `navigator.language` → USD/EUR/GBP/CAD/AUD)
  - [ ] 🟥 Add `CURRENCY_PRICES` map with all 8 price points × 5 currencies
  - [ ] 🟥 Update checkout screen to call `detectCurrency()` and pass currency to `create-checkout` API
  - [ ] 🟥 Update paywall display to show currency-appropriate prices

- [ ] 🟥 **Step 7: Frontend — Upsell screen renderer**
  - [ ] 🟥 Add `upsell` screen entry to `funnel/screens/registry.json`
  - [ ] 🟥 Insert `upsell` between `checkout` and `thank_you` in `funnel/funnels/v2/config.json`
  - [ ] 🟥 Update `checkout` entry in `registry.json`: `nextScreenLogic: "upsell"`
  - [ ] 🟥 Add `case 'upsell':` to the screen rendering switch in `funnel/engine/app.js`
  - [ ] 🟥 Implement `Screens.upsell(screenData)` — long-scroll layout:
    - Hero image + headline ("You've unlocked your plan!")
    - Value prop section with coach.png + copy
    - Progress image + feature bullets
    - Community image + social proof
    - 1-month / 3-month toggle (updates displayed price)
    - Sticky bottom CTA button ("Add AI Companion — $X/mo")
    - Skip link ("No thanks, continue without AI features")
  - [ ] 🟥 Add CTA click handler: POST to `/api/create-upsell`, on success navigate to `thank_you`, on `no_pm` navigate to `thank_you` (skip silently)
  - [ ] 🟥 Set `State.set('hasUpsell', true)` on successful upsell charge

- [ ] 🟥 **Step 8: Review & Smoke Test (iterate until clean)**
  - [ ] 🟥 Run `/review` on all changed files; fix any issues found
  - [ ] 🟥 Restart local server and click through full flow (checkout → upsell → thank_you)
  - [ ] 🟥 Verify currency switches based on locale
  - [ ] 🟥 Run `bash scripts/smoke-test.sh`; if any check fails — diagnose, fix, re-run; repeat until all 5 checks pass (exit code 0)
