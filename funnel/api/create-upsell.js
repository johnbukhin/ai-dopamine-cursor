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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
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
                    currency,
                    iterations: 1,
                    default_payment_method: pm.id,
                },
                {
                    items: [{ price: regularPriceId, quantity: 1 }],
                    currency,
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
