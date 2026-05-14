import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Price-plan mapping
// Each of the three plans is a 2-phase Subscription Schedule:
//   Phase 1 — introductory price for exactly 1 billing period
//   Phase 2 — full recurring price, ongoing
//
// All prices have multi-currency support via Stripe currency_options.
// Display strings are resolved dynamically from CURRENCY_DISPLAY below.
// ---------------------------------------------------------------------------
const PLAN_MAP = {
    '7_day': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_7DAY,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:        '7-Day Plan',
    },
    '1_month': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_1MONTH,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:        '1-Month Plan',
    },
    '3_month': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_3MONTH,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_QUARTERLY,
        label:        '3-Month Plan',
    },
};

// Per-currency display strings for each plan tier.
// Keys mirror the currency codes passed by the frontend detectCurrency() helper.
// Must stay in sync with Currency.PRICES in funnel/engine/app.js — both drive
// the same price display (paywall + checkout summary).
const CURRENCY_DISPLAY = {
    usd: {
        '7_day':   { intro: '$9.99',    regular: '$49.99/mo after first week' },
        '1_month': { intro: '$19.99',   regular: '$49.99/mo after first month' },
        '3_month': { intro: '$34.99',   regular: '$49.99/mo after first 3 months' },
    },
    eur: {
        '7_day':   { intro: '€9.99',    regular: '€49.99/mo after first week' },
        '1_month': { intro: '€19.99',   regular: '€49.99/mo after first month' },
        '3_month': { intro: '€34.99',   regular: '€49.99/mo after first 3 months' },
    },
    gbp: {
        '7_day':   { intro: '£8.99',    regular: '£41.99/mo after first week' },
        '1_month': { intro: '£16.99',   regular: '£41.99/mo after first month' },
        '3_month': { intro: '£29.99',   regular: '£41.99/mo after first 3 months' },
    },
    cad: {
        '7_day':   { intro: 'CA$13.99', regular: 'CA$67.99/mo after first week' },
        '1_month': { intro: 'CA$26.99', regular: 'CA$67.99/mo after first month' },
        '3_month': { intro: 'CA$46.99', regular: 'CA$67.99/mo after first 3 months' },
    },
    aud: {
        '7_day':   { intro: 'A$15.99',  regular: 'A$76.99/mo after first week' },
        '1_month': { intro: 'A$30.99',  regular: 'A$76.99/mo after first month' },
        '3_month': { intro: 'A$52.99',  regular: 'A$76.99/mo after first 3 months' },
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tierId, email, currency: rawCurrency } = req.body;
    if (!tierId || !email) {
        return res.status(400).json({ error: 'tierId and email are required' });
    }

    const plan = PLAN_MAP[tierId];
    if (!plan) {
        return res.status(400).json({ error: `Unknown plan: ${tierId}` });
    }
    if (!plan.introPrice || !plan.regularPrice) {
        return res.status(500).json({ error: 'Stripe price IDs not configured' });
    }

    // Normalise currency — fallback to EUR if not in our supported set
    const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];
    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency?.toLowerCase())
        ? rawCurrency.toLowerCase()
        : 'eur';

    // Resolve human-readable display strings for the detected currency
    const display = CURRENCY_DISPLAY[currency]?.[tierId] || CURRENCY_DISPLAY.eur[tierId];

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // 1. Look up an existing Stripe Customer by email to avoid duplicates;
        //    create a new one only if none exists. This prevents orphaned
        //    customers + invoices when the user navigates back and re-submits.
        const existing = await stripe.customers.list({ email, limit: 1 });
        const customer = existing.data.length > 0
            ? existing.data[0]
            : await stripe.customers.create({ email });

        // 1b. Cancel any open subscription schedules for this customer so that
        //     prefetch calls (which fire on paywall load and on tier change) do not
        //     accumulate dangling schedules in Stripe. Only active/not_started
        //     schedules are cancelled; completed/released ones are left alone.
        const openSchedules = await stripe.subscriptionSchedules.list({ customer: customer.id, limit: 10 });
        for (const s of openSchedules.data) {
            if (s.status === 'active' || s.status === 'not_started') {
                await stripe.subscriptionSchedules.cancel(s.id);
            }
        }

        // 2. Create a 2-phase Subscription Schedule:
        //    Phase 1: introductory price × 1 billing period
        //    Phase 2: regular price, ongoing (no iterations → never ends)
        //
        //    NOTE: subscriptionSchedules.create() does not support payment_behavior,
        //    so the first invoice is created in 'draft' state with payment_intent=null.
        //    We finalize the invoice in step 3 to produce the PaymentIntent.
        const schedule = await stripe.subscriptionSchedules.create({
            customer: customer.id,
            start_date: 'now',
            phases: [
                {
                    items: [{ price: plan.introPrice, quantity: 1 }],
                    iterations: 1,
                },
                {
                    items: [{ price: plan.regularPrice, quantity: 1 }],
                    // no iterations → phase continues indefinitely
                },
            ],
            expand: ['subscription.latest_invoice'],
        });

        // Extract the subscription and its draft invoice.
        const sub = schedule.subscription;
        const subId = typeof sub === 'string' ? sub : sub?.id;
        const rawInvoice = typeof sub === 'object' ? sub?.latest_invoice : null;
        const invoiceId  = typeof rawInvoice === 'string' ? rawInvoice : rawInvoice?.id;

        if (!invoiceId) {
            return res.status(500).json({
                error: 'No invoice found on subscription schedule',
                scheduleId: schedule.id,
            });
        }

        // 3. Finalize the draft invoice.
        //    This transitions the invoice from 'draft' → 'open' and creates a
        //    PaymentIntent in 'requires_payment_method' state — exactly what the
        //    Stripe Payment Element needs on the frontend.
        const finalized = await stripe.invoices.finalizeInvoice(invoiceId, {
            expand: ['payment_intent'],
        });

        // Resolve the PaymentIntent — expand returns it as an object, but guard
        // against the string-ID case just in case.
        let clientSecret = null;
        const pi = finalized.payment_intent;
        if (typeof pi === 'object' && pi !== null) {
            clientSecret = pi.client_secret;
        } else if (typeof pi === 'string') {
            const piObj = await stripe.paymentIntents.retrieve(pi);
            clientSecret = piObj.client_secret;
        }

        if (!clientSecret) {
            return res.status(500).json({
                error: 'Failed to obtain PaymentIntent client secret',
                invoiceId,
                invoiceStatus: finalized.status,
            });
        }

        return res.status(200).json({
            clientSecret,
            customerId:     customer.id,
            subscriptionId: subId,
            scheduleId:     schedule.id,
            planLabel:      plan.label,
            currency,
            introDisplay:   display.intro,
            regularDisplay: display.regular,
        });

    } catch (error) {
        console.error('[create-checkout] Stripe error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment setup failed' });
    }
}
