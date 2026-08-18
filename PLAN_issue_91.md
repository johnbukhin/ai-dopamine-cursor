# PLAN — Issue #91: checkout parity (landing ↔ funnel-v2) + Meta Pixel audit

Branch: `feat/issue-91-checkout-parity-pixel`

Applies to **both** landing variants. They share one controller
(`funnel/landing-shared/landing.js`) and one DOM contract, so every change below
lands on `/landing-quiz/` and `/landing-direct/` simultaneously. Tests assert
both explicitly rather than trusting that.

Out of scope: Stripe price/subscription configuration; the displayed-vs-charged
currency mismatch (issue #92).

---

## Blocking dependency (owner: user, not code)

`STRIPE_PRICE_UPSELL` is not set in the Vercel project. Verified on prod:

- `POST /api/create-upsell` → `500 {"error":"Server misconfiguration"}` (`create-upsell.js:66`)
- `GET /api/prices` omits the `upsell` key entirely — `prices.js:53` filters out
  falsy env ids, so `Currency.UPSELL_PRICES` is `{}` everywhere

funnel-v2's upsell screen is therefore **already broken in production**: it
renders `for just <strong></strong>` and its CTA always 500s. That is pre-existing.

**Decision:** the landing upsell step renders only when a live upsell price
resolves. Otherwise it is skipped silently and the buyer goes straight to the
password step. Self-heals the moment the env var is added — no code deploy.
An empty-priced screen wedged between payment and account creation would cost
more conversions than having no upsell at all.

---

## Part 1 — post-payment flow

### Current

`Checkout.pay()` (`landing.js:842`): `confirmPayment()` → `provision-account`
→ `location.href = webappUrl + '#access_token=…&refresh_token=…'`.

`provision-account.js:38` sets `password: randomUUID()` and never returns it.
funnel-v2 overwrites it on the `create_account` screen; the landing has no such
screen, so **a landing buyer whose session expires cannot log in**. That is the
core bug.

### Target

Turn the existing `#checkout` modal into a 3-step machine. No new routes, no
new page — the modal shell, theme tokens and scroll-lock already exist.

```
step 1  payment   (current form, unchanged)
   ↓ confirmPayment() ok  →  provision-account (as today)
step 2  upsell    (only when an upsell price resolved)
   ↓ CONFIRM → /api/create-upsell   |   SKIP
step 3  password  → /api/create-user
   ↓
location.href = webappUrl + '#access_token=…&refresh_token=…' + (bought ? '&upsell=1' : '')
```

### Notes per step

**Step 2 — upsell.** Port the offer from `engine/app.js:3857 Screens.upsell()`:
eyebrow, headline, price, hero, the three feature blocks, social proof, reviews,
final legal, `CONFIRM PAYMENT` + `SKIP →`. Rendered as a full-height takeover
inside the modal (funnel-v2 uses a full screen; a cramped dialog would undersell
it), styled from landing theme tokens rather than `engine/styles.css`.

Assets: `funnel/funnel-v2/assets/upsell/` is 11 MB of PNG. Do **not** reference
it cross-directory — that couples the landing to funnel-v2. Convert the needed
images to JPEG into a new shared `funnel/assets/upsell/` (target < 700 KB total,
same `sips` recipe as `funnel/assets/hero/`), `loading="lazy"`. funnel-v2 keeps
pointing at its own copies; not touched.

`handleUpsellUpgrade` (`app.js:5360`) is the behaviour reference: disable all
confirm buttons, POST `{ email, currency }`, treat any non-`success` as a skip,
never block the buyer on an upsell failure.

**Step 3 — password.** POST `/api/create-user` with
`{ email, password, selectedPlan, funnelVersion, quizAnswers?, mainChallenge?, goal? }`.
Validation mirrors `app.js:5049`: both fields present, match, ≥ 8 chars
(`create-user.js:44` enforces 8 server-side too). `funnel_version` is clipped to
20 chars server-side — `landing-quiz` (12) and `landing-direct` (14) both fit.

`create-user.js` returns fresh tokens; prefer them over the provision tokens,
since the provision session predates the real password.

**Failure policy.** Payment has already succeeded by the time steps 2–3 run.
Nothing here may strand the buyer: any API failure logs, shows a non-blocking
message, and still lands them in the webapp with whatever session exists.

**Prefetch.** Port `prefetchCheckout()` (`app.js:5342`): fire `create-checkout`
when the pricing section first becomes visible and on tier change, abort the
in-flight request on change, and pre-build `stripe.elements()`. Matches
funnel-v2's perceived latency.

---

## Part 2 — Meta Pixel

### Event parity

| Event | Change |
|---|---|
| `ViewContent` | move from checkout-modal-open to **pricing section visible** — funnel-v2 fires it on paywall render (`app.js:6083`); today the two mean different things |
| `AddToCart` | **add** — fires with `ViewContent`, as in `app.js:6084`. Currently never fires on the landing |
| `InitiateCheckout` | keep at modal open (equivalent to funnel-v2's checkout screen) |
| `Lead` | fire on **both** variants and carry the email. Today: quiz-completion only, no email, so `landing-direct` never fires it. New trigger = valid email entered in the checkout modal (the `email_capture` equivalent) |
| `Purchase` | unchanged — already correct, with `eventID = purchase_<subId>` |

### Match quality

- **Advanced matching** — re-`fbq('init', PIXEL_ID, { em })` once a valid email
  is entered. Meta hashes client-side.
- **`fbclid`** — read from the landing URL on load, persist to `localStorage`,
  and synthesize `_fbc` when the cookie is absent.
- **CAPI enrichment** — `webhook.js:40 fireCapiPurchase()` sends only a hashed
  email, and `event_source_url` is hardcoded to
  `https://ai-dopamine-addict.vercel.app/funnel-v2/` (`webhook.js:57`), so every
  landing purchase is reported to Meta as coming from funnel-v2.

  The webhook has no browser context, so the browser values must travel with the
  payment: `create-checkout` writes `fbp`, `fbc`, `src_url`, `external_id` to
  **Stripe customer metadata**; the webhook retrieves the customer and forwards
  them. Customer metadata is used rather than schedule metadata because the
  webhook already holds `invoice.customer` and the mapping is unambiguous.

  Backwards compatible: absent metadata → current behaviour.

- **`external_id`** — the Supabase user id from `provision-account`, hashed.

Dedup is unaffected: `event_id` stays `purchase_<subscriptionId>` on both sides.

---

## Files

| File | Change |
|---|---|
| `funnel/landing-shared/landing.js` | step machine, upsell step, password step, prefetch, pixel changes |
| `funnel/landing-shared/core.css` | upsell + password step styles (theme tokens only) |
| `funnel/landing-quiz/index.html`, `funnel/landing-direct/index.html` | step containers in the modal, asset preload, cache-stamp bump |
| `funnel/assets/upsell/*.jpg` | new — compressed shared upsell art |
| `funnel/api/create-checkout.js` | accept + persist `fbp`/`fbc`/`src_url`/`external_id` |
| `funnel/api/webhook.js` | read customer metadata; real `event_source_url`; `fbp`/`fbc`/`external_id` in `user_data` |

`funnel/engine/app.js` and `funnel/funnel-v2/**` are **not** touched.

---

## Verification

1. `/tmp/mcdom/flow.js` extended, asserted for **both** variants:
   - the 3-step machine advances and skips step 2 when no upsell price
   - password validation: empty, mismatch, < 8 chars
   - redirect URL carries both tokens, and `&upsell=1` only after a successful charge
   - fbq call log contains `PageView, ViewContent, AddToCart, InitiateCheckout, Lead(em), Purchase(eventID)` in order
   - `Lead` fires on `landing-direct`
2. `/tmp/mcdom/prod.js` after deploy.
3. Real Stripe test purchase end-to-end → Supabase row, then **log out and log
   back in with the chosen password** — the actual bug being fixed.
4. Meta Events Manager → Test Events: full sequence, one Purchase, dedup OK.
5. `bash scripts/smoke-test.sh` — expect the two pre-existing CRITICAL failures
   (`funnel/.env.local` missing locally), nothing new.

## Acceptance

Issue #91's checklist, verbatim.
