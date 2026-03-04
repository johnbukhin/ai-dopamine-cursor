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
    // #region agent log
    fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H1',location:'funnel/api/create-checkout.js:34',message:'create-checkout entered',data:{method:req.method},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tierId, email } = req.body;
    // #region agent log
    fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H2',location:'funnel/api/create-checkout.js:43',message:'request payload parsed',data:{tierId,hasEmail:Boolean(email)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H3',location:'funnel/api/create-checkout.js:66',message:'stripe customer created',data:{hasCustomerId:Boolean(customer?.id)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

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
        // #region agent log
        fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H4',location:'funnel/api/create-checkout.js:89',message:'subscription schedule created',data:{scheduleId:schedule?.id||null,subscriptionType:typeof schedule?.subscription,subscriptionExpanded:Boolean(schedule?.subscription && typeof schedule.subscription === 'object'),latestInvoiceType:typeof schedule?.subscription?.latest_invoice,hasPaymentIntent:Boolean(schedule?.subscription?.latest_invoice?.payment_intent)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        // 3. Extract the PaymentIntent client secret from the first invoice.
        //    Stripe can return schedule.subscription as either:
        //    - expanded object (when expand works), or
        //    - plain string ID (when not expanded).
        //    We normalize both paths to reliably get latest_invoice.payment_intent.
        let subscription = schedule.subscription || null;
        if (typeof subscription === 'string') {
            subscription = await stripe.subscriptions.retrieve(subscription, {
                expand: ['latest_invoice.payment_intent'],
            });
        }

        if (subscription && typeof subscription === 'object' && typeof subscription.latest_invoice === 'string') {
            subscription = await stripe.subscriptions.retrieve(subscription.id, {
                expand: ['latest_invoice.payment_intent'],
            });
        }

        const paymentIntent =
            subscription?.latest_invoice?.payment_intent;

        if (!paymentIntent?.client_secret) {
            const diagnostics = {
                scheduleId: schedule?.id || null,
                subscriptionType: typeof schedule?.subscription,
                subscriptionId: typeof schedule?.subscription === 'string'
                    ? schedule.subscription
                    : (schedule?.subscription?.id || null),
                normalizedSubscriptionType: typeof subscription,
                normalizedLatestInvoiceType: typeof subscription?.latest_invoice,
                paymentIntentType: typeof subscription?.latest_invoice?.payment_intent,
            };
            // #region agent log
            fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H5',location:'funnel/api/create-checkout.js:106',message:'payment intent client secret missing',data:diagnostics,timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return res.status(500).json({
                error: 'Failed to retrieve payment intent from subscription schedule',
                diagnostics,
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
        // #region agent log
        fetch('http://127.0.0.1:7939/ingest/4aa7fdbc-e992-435f-8c9a-60a3ad8cc6a7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d23057'},body:JSON.stringify({sessionId:'d23057',runId:'issue11-pi-pre-fix',hypothesisId:'H5',location:'funnel/api/create-checkout.js:116',message:'create-checkout caught stripe error',data:{message:error?.message||'unknown',type:error?.type||null,code:error?.code||null,param:error?.param||error?.raw?.param||null,statusCode:error?.statusCode||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        console.error('[create-checkout] Stripe error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment setup failed' });
    }
}
