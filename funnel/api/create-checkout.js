import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Price-plan mapping
// Each of the three plans is a 2-phase Subscription Schedule:
//   Phase 1 — introductory price for exactly 1 billing period
//   Phase 2 — full recurring price, ongoing
// ---------------------------------------------------------------------------
const PLAN_MAP = {
    '7_day': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_7DAY,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:        '7-Day Plan',
        introDisplay: '€10.50',
        regularDisplay: '€49.99/mo after first week',
    },
    '1_month': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_1MONTH,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        label:        '1-Month Plan',
        introDisplay: '€19.99',
        regularDisplay: '€49.99/mo after first month',
    },
    '3_month': {
        introPrice:   process.env.STRIPE_PRICE_INTRO_3MONTH,
        regularPrice: process.env.STRIPE_PRICE_REGULAR_QUARTERLY,
        label:        '3-Month Plan',
        introDisplay: '€34.99',
        regularDisplay: '€99.99/3 mo after first 3 months',
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
    });

    try {
        // 1. Create a Stripe Customer for this email.
        //    In production you may want to look up an existing customer first;
        //    for the funnel flow a new customer per purchase attempt is fine.
        const customer = await stripe.customers.create({ email });

        // 2. Create a Subscription Schedule with 2 phases:
        //    - Phase 1: intro price × 1 iteration  (auto-renews into phase 2)
        //    - Phase 2: regular price, no end date  (ongoing)
        //
        //    NOTE: payment_behavior is not supported on subscriptionSchedules.create.
        //    Stripe will create the underlying subscription/invoice for phase 1;
        //    we then use latest_invoice.payment_intent.client_secret in the Payment Element flow.
        const schedule = await stripe.subscriptionSchedules.create({
            customer: customer.id,
            start_date: 'now',
            phases: [
                {
                    items: [{ price: plan.introPrice, quantity: 1 }],
                    iterations: 1,           // exactly 1 billing period at intro price
                },
                {
                    items: [{ price: plan.regularPrice, quantity: 1 }],
                    // no iterations → phase continues indefinitely
                },
            ],
            expand: ['subscription.latest_invoice.payment_intent'],
        });

        // 3. Extract the PaymentIntent client secret from the first invoice.
        //    This is what the Stripe Payment Element needs on the frontend.
        const paymentIntent =
            schedule.subscription?.latest_invoice?.payment_intent;

        if (!paymentIntent?.client_secret) {
            return res.status(500).json({
                error: 'Failed to retrieve payment intent from subscription schedule',
            });
        }

        return res.status(200).json({
            clientSecret:    paymentIntent.client_secret,
            customerId:      customer.id,
            subscriptionId:  schedule.subscription?.id,
            scheduleId:      schedule.id,
            planLabel:       plan.label,
            introDisplay:    plan.introDisplay,
            regularDisplay:  plan.regularDisplay,
        });

    } catch (error) {
        console.error('[create-checkout] Stripe error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment setup failed' });
    }
}
