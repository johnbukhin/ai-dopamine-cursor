# Feature Implementation Plan — Issue #11

**Overall Progress:** `100%`

## TLDR
Build a custom checkout screen between the paywall and `thank_you` screens. When "Get my plan" is clicked, user lands on a branded order-summary + Stripe Payment Element page. Backend creates a Stripe Customer + recurring Subscription and returns the client secret; the frontend mounts the Payment Element (cards, Apple Pay, Google Pay, PayPal), confirms payment, then navigates to `thank_you` → `account_creation` as before.

## Critical Decisions

- **Embedded Payment Element (not Stripe-hosted Checkout)**: Full UI control, no redirect away from the funnel.
- **Stripe Subscriptions with `default_incomplete`**: Create Customer + Subscription server-side → the subscription's pending PaymentIntent `client_secret` is returned to the frontend. This is the standard Stripe recurring billing flow.
- **New `checkout` screen type**: Inserted between `paywall` and `thank_you` in `liven-funnel-analysis.json`. Paywall `nextScreenLogic` changes from `thank_you` → `checkout`; checkout navigates to `thank_you` on payment success.
- **Price IDs in env vars**: `STRIPE_PRICE_7DAY`, `STRIPE_PRICE_1MONTH`, `STRIPE_PRICE_3MONTH` → different values for test/prod without code changes.
- **Discount applied server-side via Stripe Coupon**: `create-checkout.js` creates/reuses a 60% off coupon and attaches it to the subscription, so the charged amount matches the displayed discounted price. Client-side promo code string stays cosmetic.
- **Stripe.js loaded in `index.html`**: One `<script>` tag, available globally; Stripe object initialised lazily on first checkout render.
- **Account creation timing unchanged**: Supabase account is still created *after* payment in the existing `account_creation` screen. The checkout API creates only a Stripe Customer (using `State.getAnswer('email_capture')`).
- **Webhook for production resilience**: `api/webhook.js` handles `invoice.payment_succeeded` to upsert a `subscriptions` row in Supabase. Can be wired up post-MVP; payment confirmation flow works without it via synchronous confirmation.

---

## Tasks

- [ ] 🟥 **Step 1: JSON — add `checkout` screen**
  - [ ] 🟥 Change paywall `nextScreenLogic` from `"thank_you"` → `"checkout"`
  - [ ] 🟥 Insert new screen object after `paywall`:
    ```json
    {
      "id": "checkout",
      "screenType": "checkout",
      "headline": "Complete Your Order",
      "nextScreenLogic": "thank_you"
    }
    ```

- [ ] 🟥 **Step 2: Backend — `api/create-checkout.js`**
  - [ ] 🟥 Accept `{ tierId, email }` via POST
  - [ ] 🟥 Map `tierId` → Stripe Price ID (env vars `STRIPE_PRICE_7DAY`, `STRIPE_PRICE_1MONTH`, `STRIPE_PRICE_3MONTH`)
  - [ ] 🟥 Create (or retrieve by email) a Stripe Customer
  - [ ] 🟥 Ensure a 60%-off Coupon exists (`GET /coupons/COMPASS60` or create once)
  - [ ] 🟥 Create Subscription with `payment_behavior: 'default_incomplete'`, `expand: ['latest_invoice.payment_intent']`, and the coupon
  - [ ] 🟥 Return `{ clientSecret, customerId, subscriptionId, discountedAmount, originalAmount }` to the frontend
  - [ ] 🟥 Add `stripe` npm dep to `funnel/package.json`

- [ ] 🟥 **Step 3: Backend — `api/webhook.js`**
  - [ ] 🟥 Verify Stripe signature (`STRIPE_WEBHOOK_SECRET` env var)
  - [ ] 🟥 Handle `invoice.payment_succeeded`: upsert a `subscriptions` row in Supabase (`user_email`, `stripe_customer_id`, `stripe_subscription_id`, `plan`, `status`, `paid_at`)
  - [ ] 🟥 Return 200 for all other events (no-op)

- [ ] 🟥 **Step 4: Frontend — `index.html`**
  - [ ] 🟥 Add `<script src="https://js.stripe.com/v3/"></script>` before `app.js`

- [ ] 🟥 **Step 5: Frontend — `Screens.checkout()` renderer in `app.js`**
  - [ ] 🟥 Retrieve `selectedTierId`, `email`, `userName`, `promoCode` from State
  - [ ] 🟥 Render order summary (plan name, original price, −60% discount row, promo badge, **Total**, savings blurb)
  - [ ] 🟥 Render `<div id="payment-element"></div>` mount point + "Pay Safe & Secure" footer
  - [ ] 🟥 Render a "Complete Payment" submit button (`class="cta-button checkout__pay-btn"`)
  - [ ] 🟥 On mount: call `App.initStripe(screenData)` to bootstrap the Payment Element
  - [ ] 🟥 Add `case 'checkout'` to `Router.renderScreen()` dispatch

- [ ] 🟥 **Step 6: Frontend — Stripe initialisation & payment flow in `app.js`**
  - [ ] 🟥 Add `CONFIG.stripePublishableKey` (read from a `<meta>` tag or inline constant; value injected at build/deploy)
  - [ ] 🟥 `App.initStripe(screenData)`: POST to `/api/create-checkout` with `{ tierId, email }` → receive `clientSecret`; call `Stripe(pk).elements({ clientSecret })` → `elements.create('payment')` → `.mount('#payment-element')`
  - [ ] 🟥 Wire up "Complete Payment" button click → `stripe.confirmPayment({ elements, redirect: 'if_required' })` → on success navigate to `thank_you`; on error show inline error message

- [ ] 🟥 **Step 7: Styles — `styles.css` checkout screen**
  - [ ] 🟥 `.checkout` container: white card, `border-radius: 16px`, `box-shadow`
  - [ ] 🟥 `.checkout__summary` section: plan name, price rows (original strikethrough, discount in red, total bold)
  - [ ] 🟥 `.checkout__promo-badge`: small pill badge (matches existing `.badge` palette)
  - [ ] 🟥 `.checkout__secure-footer`: centered lock-icon text, muted colour
  - [ ] 🟥 Mobile-responsive; reuse existing spacing variables (`--spacing-*`, `--color-*`)

- [ ] 🟥 **Step 8: Environment variables & Vercel config**
  - [ ] 🟥 Document required env vars in `funnel/README.md` (or `.env.local.example`):
    `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_7DAY`, `STRIPE_PRICE_1MONTH`, `STRIPE_PRICE_3MONTH`
  - [ ] 🟥 Confirm `.gitignore` excludes `.env.local`
  - [ ] 🟥 Verify `vercel.json` routes `/api/*` correctly (Vercel auto-handles `api/` folder — no change needed unless custom routes required)

- [ ] 🟥 **Step 9: Verify end-to-end flow**
  - [ ] 🟥 Server restarted; funnel loads at http://localhost:8080/funnel/
  - [ ] 🟥 Paywall "Get my plan" → navigates to checkout screen (not thank_you directly)
  - [ ] 🟥 Order summary shows correct tier prices and 60% discount
  - [ ] 🟥 Payment Element mounts (using Stripe test publishable key)
  - [ ] 🟥 Test card `4242 4242 4242 4242` → succeeds → lands on `thank_you`
  - [ ] 🟥 Test card `4000 0000 0000 0002` → shows inline decline error, stays on checkout
