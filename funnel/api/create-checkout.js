import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Price-plan mapping
// Each of the three plans is a 2-phase Subscription Schedule:
//   Phase 1 — introductory price for exactly 1 billing period
//   Phase 2 — full recurring price, ongoing
//
// All prices have multi-currency support via Stripe currency_options.
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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tierId, email, currency: rawCurrency, fbp, fbc, srcUrl } = req.body;
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

    // Meta browser identifiers, carried through to the server-side CAPI Purchase.
    // The webhook runs from Stripe's request, not the buyer's browser, so it has
    // no cookies and no referring URL of its own — without stashing them here it
    // can only report a hashed email, and it reports every purchase as coming
    // from the funnel's hardcoded URL. Stripe metadata values must be strings and
    // are capped at 500 chars; anything longer is dropped rather than truncated,
    // since a clipped click id is worse than no click id.
    //
    // Every key is always written, empty string included. Stripe merges a
    // metadata update into what is already there rather than replacing it, so
    // omitting a key leaves the previous session's value in place — a buyer who
    // first arrived from an ad and later returned organically would have that
    // months-old click id attributed to the purchase. An empty string clears it.
    const fit = (v) => (typeof v === 'string' && v && v.length <= 500 ? v : '');
    const pixelMeta = { fbp: fit(fbp), fbc: fit(fbc), src_url: fit(srcUrl) };
    const hasPixelMeta = Object.values(pixelMeta).some(Boolean);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // 1. Look up an existing Stripe Customer by email to avoid duplicates;
        //    create a new one only if none exists. This prevents orphaned
        //    customers + invoices when the user navigates back and re-submits.
        const existing = await stripe.customers.list({ email, limit: 1 });
        const customer = existing.data.length > 0
            ? existing.data[0]
            : await stripe.customers.create({ email, metadata: pixelMeta });

        // A returning customer keeps whatever identifiers this session supplies —
        // the newest click is the one that earned the purchase.
        if (existing.data.length > 0 && hasPixelMeta) {
            await stripe.customers.update(customer.id, { metadata: pixelMeta });
        }

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
        let piId = null;
        const pi = finalized.payment_intent;
        if (typeof pi === 'object' && pi !== null) {
            clientSecret = pi.client_secret;
            piId = pi.id;
        } else if (typeof pi === 'string') {
            const piObj = await stripe.paymentIntents.retrieve(pi);
            clientSecret = piObj.client_secret;
            piId = pi;
        }

        // Save the card to the customer after payment so create-upsell can
        // charge it off-session without prompting the user again.
        if (piId) {
            await stripe.paymentIntents.update(piId, {
                setup_future_usage: 'off_session',
            });
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
        });

    } catch (error) {
        console.error('[create-checkout] Stripe error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment setup failed' });
    }
}
