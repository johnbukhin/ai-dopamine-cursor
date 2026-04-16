# Feature Implementation Plan — Issue #20

**Overall Progress:** `86%`

## TLDR
Connect webapp Settings to real data and wire Stripe subscription management. Profile tab pre-fills from Supabase auth. Access tab reads live subscription data from a `subscriptions` Supabase table. Cancel button actually cancels in Stripe via a new serverless endpoint. "Other materials" section removed.

## Critical Decisions

- **Subscription data source:** Read from Supabase `subscriptions` table (not live Stripe API) — webhook enriched to store `current_period_end` and `plan_label` so Settings needs no Stripe call
- **Cancellation:** Server-side only via new `funnel/api/cancel-subscription.js` — verifies ownership by matching `user_email` in `subscriptions` table before calling Stripe
- **Cancel behaviour:** `cancel_at_period_end: true` — user keeps access until period ends, not cut off immediately
- **"Other materials" section:** Removed entirely — features don't exist yet
- **Terms tab:** Keep with existing placeholder — legal docs coming later
- **RLS:** `subscriptions` table requires RLS policy `user_email = auth.email()` — manual Supabase step; table also needs 3 new columns added upfront
- **User context in Settings:** `supabase.auth.getUser()` called inside Settings itself — no prop threading needed

## Tasks

- [x] 🟩 **Step 1: Supabase migrations (manual)**
  - [ ] 🟥 Create `subscriptions` table with all columns (including `current_period_end`, `plan_label`, `cancel_at_period_end`) via Supabase SQL editor:
    ```sql
    create table subscriptions (
      id uuid primary key default gen_random_uuid(),
      stripe_customer_id text not null,
      stripe_subscription_id text not null unique,
      user_email text not null,
      status text not null,
      paid_at timestamptz,
      amount_paid integer,
      currency text,
      current_period_end timestamptz,
      plan_label text,
      cancel_at_period_end boolean default false,
      created_at timestamptz default now()
    );
    alter table subscriptions enable row level security;
    create policy "Users can view own subscription"
      on subscriptions for select
      using (user_email = auth.email());
    ```

- [x] 🟩 **Step 2: Enrich webhook to write new columns**
  - [ ] 🟥 In `funnel/api/webhook.js`, extract `current_period_end` from `invoice.lines.data[0].period.end` (Unix timestamp → ISO string)
  - [ ] 🟥 Extract `plan_label` by matching `invoice.lines.data[0].price.id` against `PLAN_MAP` price IDs (or use `invoice.lines.data[0].description` as fallback)
  - [ ] 🟥 Add `current_period_end`, `plan_label`, `cancel_at_period_end: false` to the `supabase.upsert()` call

- [x] 🟩 **Step 3: New `cancel-subscription.js` API endpoint**
  - [ ] 🟥 Accept `{ stripe_subscription_id, userEmail }` from request body
  - [ ] 🟥 Verify ownership: query `subscriptions` table — confirm row exists with matching `stripe_subscription_id` AND `user_email`
  - [ ] 🟥 Call `stripe.subscriptions.update(id, { cancel_at_period_end: true })`
  - [ ] 🟥 Update `subscriptions` row: set `cancel_at_period_end = true`
  - [ ] 🟥 Return `{ cancel_at: subscription.cancel_at }` (Unix timestamp of period end)

- [x] 🟩 **Step 4: Rewrite `Settings.tsx` — Profile tab**
  - [ ] 🟥 On mount call `supabase.auth.getUser()` to get `email`; pre-fill email field (read-only display, not editable)
  - [ ] 🟥 Wire password change form to `supabase.auth.updateUser({ password })` on save
  - [ ] 🟥 Add Save button with loading, success ("Password updated"), and error states

- [x] 🟩 **Step 5: Rewrite `Settings.tsx` — Access tab**
  - [ ] 🟥 On mount fetch `supabase.from('subscriptions').select('*').eq('user_email', email).single()`
  - [ ] 🟥 Show loading spinner while fetching; show "No active subscription" state if no row found
  - [ ] 🟥 Display real values: `plan_label`, `amount_paid / 100` formatted as `€X.XX`, `paid_at` as begin date, `current_period_end` as valid until
  - [ ] 🟥 If `cancel_at_period_end = true`: hide Cancel button, show "Access until [current_period_end date]" message
  - [ ] 🟥 Remove "Other materials" section entirely

- [x] 🟩 **Step 6: Wire `CancelFlow.tsx` final step to real API**
  - [ ] 🟥 Accept `stripeSubscriptionId` and `userEmail` as props from `AccessSettings`
  - [ ] 🟥 In `handleFinalCancel`, POST to `/api/cancel-subscription` with `{ stripe_subscription_id, userEmail }`
  - [ ] 🟥 On success: call existing `onConfirmCancel()` callback (which already updates parent state); pass `cancel_at` date back up so Access tab can display it
  - [ ] 🟥 On error: show inline error message in the modal, keep subscription active in UI

- [ ] 🟥 **Step 7: Validate end-to-end**
  - [ ] 🟥 Log in with a test account that has a paid Stripe subscription — verify Access tab shows real plan/date/amount
  - [ ] 🟥 Click "Cancel Membership", proceed through retention steps, confirm — verify Stripe dashboard shows `cancel_at_period_end: true` and Access tab switches to "Access until [date]"
  - [ ] 🟥 Profile tab: verify email is pre-filled; change password and verify new password works on next login
