import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Price-plan mapping
// Each of the three plans is a 2-phase Subscription Schedule:
//   Phase 1 — introductory price for exactly 1 billing period
//   Phase 2 — full recurring price, ongoing
// ---------------------------------------------------------------------------
const PLAN_MAP = {
    '7_day': {
        introPrice:     process.env.STRIPE_PRICE_INTRO_7DAY,
        regularPrice:   process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:          '7-Day Plan',
        introDisplay:   '€10.50',
        regularDisplay: '€49.99/mo after first week',
    },
    '1_month': {
        introPrice:     process.env.STRIPE_PRICE_INTRO_1MONTH,
        regularPrice:   process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:          '1-Month Plan',
        introDisplay:   '€19.99',
        regularDisplay: '€49.99/mo after first month',
    },
    '3_month': {
        introPrice:     process.env.STRIPE_PRICE_INTRO_3MONTH,
        regularPrice:   process.env.STRIPE_PRICE_REGULAR_QUARTERLY,
        label:          '3-Month Plan',
        introDisplay:   '€34.99',
        regularDisplay: '€99.99/3 mo after first 3 months',
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tierId, email } = req.body;
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
            introDisplay:   plan.introDisplay,
            regularDisplay: plan.regularDisplay,
        });

    } catch (error) {
        console.error('[create-checkout] Stripe error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment setup failed' });
    }
}
