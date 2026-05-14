import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// One-Click Upsell Handler — AI Companion Subscription
//
// After a successful subscription checkout the frontend offers an AI Companion
// add-on. Because the user already entered their card on the checkout screen,
// Stripe has a saved PaymentMethod on the customer. This endpoint creates a
// subscription schedule off-session with no additional user interaction.
//
// Subscription schedule:
//   Phase 1 — 1 month at intro price  (STRIPE_PRICE_UPSELL_INTRO)
//   Phase 2 — recurring monthly       (STRIPE_PRICE_UPSELL_REGULAR)
//
// Request body:  { email, currency }
// Responses:
//   200 { success: true }                  — subscription created
//   200 { success: false, reason: string } — no PM / customer not found (skip)
//   400 { error: string }                  — bad request
//   500 { error: string }                  — unexpected server error
//
// All skip-cases are logged to `upsell_errors` for post-hoc investigation.
// The frontend always redirects to thank_you regardless.
// ---------------------------------------------------------------------------

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];

async function logUpsellError({ email, stripeCustomerId, currency, reason, rawError }) {
    try {
        await supabase.from('upsell_errors').insert({
            user_email:         email,
            stripe_customer_id: stripeCustomerId || null,
            price_id:           process.env.STRIPE_PRICE_UPSELL_INTRO,
            currency,
            reason,
            raw_error:          rawError || null,
        });
    } catch (err) {
        console.error('[create-upsell] Failed to log upsell error:', err.message);
    }
}

const ALLOWED_ORIGINS = [
    'https://ai-dopamine-addict.vercel.app',
    'https://mind-compass-webapp.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

export default async function handler(req, res) {
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, currency: rawCurrency } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'email is required' });
    }

    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency?.toLowerCase())
        ? rawCurrency.toLowerCase()
        : 'eur';

    const introPriceId   = process.env.STRIPE_PRICE_UPSELL_INTRO;
    const regularPriceId = process.env.STRIPE_PRICE_UPSELL_REGULAR;

    if (!introPriceId || !regularPriceId) {
        console.error('[create-upsell] Missing STRIPE_PRICE_UPSELL_INTRO or _REGULAR env vars');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // 1. Find the Stripe customer by email. The checkout step always creates
        //    one, so this should always succeed for a user who just paid.
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) {
            await logUpsellError({ email, currency, reason: 'customer_not_found' });
            return res.status(200).json({ success: false, reason: 'customer_not_found' });
        }

        const customer = customers.data[0];

        // 1b. Guard against duplicate upsell subscriptions. If the customer
        //     already has an active subscription on either upsell price, return
        //     success immediately — idempotent for the caller.
        const activeSubs = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 10,
        });
        const alreadySubscribed = activeSubs.data.some(sub =>
            sub.items.data.some(item =>
                item.price.id === introPriceId || item.price.id === regularPriceId
            )
        );
        if (alreadySubscribed) {
            console.info('[create-upsell] Customer already has active upsell subscription', customer.id);
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        // Use the currency from the customer's existing subscription to avoid
        // "cannot combine currencies on a single customer" — Stripe rejects
        // mixing currencies. The frontend-detected currency may differ from
        // the price currency used at checkout.
        const effectiveCurrency = activeSubs.data.find(s => s.currency)?.currency || currency;

        // 2. Retrieve the most recently attached payment method.
        const pms = await stripe.paymentMethods.list({
            customer: customer.id,
            type: 'card',
            limit: 1,
        });

        if (!pms.data.length) {
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                currency,
                reason: 'no_pm',
            });
            return res.status(200).json({ success: false, reason: 'no_pm' });
        }

        const pm = pms.data[0];

        // 3. Create a subscription schedule with two phases:
        //    Phase 1 — intro price for 1 month
        //    Phase 2 — regular recurring price (no end date)
        //
        //    payment_behavior='default_incomplete' + expand latest_invoice lets
        //    us detect if the first charge requires further action (3DS).
        const schedule = await stripe.subscriptionSchedules.create({
            customer: customer.id,
            start_date: 'now',
            default_settings: {
                default_payment_method: pm.id,
            },
            phases: [
                {
                    items: [{ price: introPriceId, quantity: 1 }],
                    currency: effectiveCurrency,
                    iterations: 1,
                    default_payment_method: pm.id,
                },
                {
                    items: [{ price: regularPriceId, quantity: 1 }],
                    currency: effectiveCurrency,
                },
            ],
            expand: ['subscription.latest_invoice.payment_intent'],
        });

        const sub = schedule.subscription;
        const pi  = sub?.latest_invoice?.payment_intent;

        // If the first invoice payment intent is in a terminal failed state, log it
        if (pi && pi.status !== 'succeeded' && pi.status !== 'processing') {
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                currency,
                reason: 'stripe_error',
                rawError: `PI status: ${pi.status}`,
            });
            // Still return success:false but don't cancel — Stripe may retry
            return res.status(200).json({ success: false, reason: 'requires_action' });
        }

        console.info('[create-upsell] Subscription schedule created for', email, schedule.id);

        // Write immediately to Supabase so the webapp sees the upsell subscription
        // without waiting for the webhook (which fires 2–10s later).
        // The webhook will upsert again with the final invoice data — that's fine.
        try {
            const subId = typeof sub === 'string' ? sub : sub?.id;
            if (subId) {
                const introPrice = await stripe.prices.retrieve(introPriceId);
                await supabase.from('subscriptions').upsert(
                    {
                        stripe_customer_id:     customer.id,
                        stripe_subscription_id: subId,
                        user_email:             email,
                        status:                 'active',
                        paid_at:                new Date().toISOString(),
                        amount_paid:            introPrice.unit_amount,
                        currency:               effectiveCurrency,
                        current_period_end:     new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
                        plan_label:             'AI Companion (Intro Month)',
                        cancel_at_period_end:   false,
                    },
                    { onConflict: 'stripe_subscription_id' }
                );
            }
        } catch (dbErr) {
            // Non-fatal — webhook will write it eventually
            console.error('[create-upsell] Supabase upsert error (non-fatal):', dbErr.message);
        }

        return res.status(200).json({ success: true, scheduleId: schedule.id });

    } catch (err) {
        console.error('[create-upsell] Error:', err.message);
        await logUpsellError({
            email,
            currency,
            reason: 'stripe_error',
            rawError: err.message,
        });
        return res.status(200).json({ success: false, reason: 'stripe_error' });
    }
}
