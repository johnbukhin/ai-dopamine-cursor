import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Stripe Webhook Handler
//
// Listens for invoice.payment_succeeded and upserts a `subscriptions` row
// in Supabase so the webapp can gate access and display subscription data.
//
// IMPORTANT: body parsing must be disabled (see config export below) so that
// req.body is the raw string Stripe needs for HMAC signature verification.
// Vercel's default JSON body parser converts req.body to an object, which
// causes stripe.webhooks.constructEvent to throw "No signatures found".
// ---------------------------------------------------------------------------

// Disable Vercel's automatic body parsing for this route.
export const config = { api: { bodyParser: false } };

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mirror of the plan map in create-checkout.js — used to resolve a human-
// readable label from a Stripe price ID for display in the webapp Settings.
const PRICE_LABEL_MAP = {
    [process.env.STRIPE_PRICE_INTRO_7DAY]:        '7-Day Plan',
    [process.env.STRIPE_PRICE_INTRO_1MONTH]:      '1-Month Plan',
    [process.env.STRIPE_PRICE_INTRO_3MONTH]:      '3-Month Plan',
    [process.env.STRIPE_PRICE_REGULAR_MONTHLY]:   'Monthly Plan',
    [process.env.STRIPE_PRICE_REGULAR_QUARTERLY]: 'Quarterly Plan',
};

// Read the raw request body as a Buffer from the Node.js stream.
// Required because body parsing is disabled (see config above).
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    let event;
    try {
        const rawBody = await getRawBody(req);

        if (webhookSecret && webhookSecret !== 'whsec_todo') {
            // Verify HMAC signature — rawBody is a Buffer which constructEvent accepts.
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
            console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification.');
            event = JSON.parse(rawBody.toString('utf8'));
        }
    } catch (err) {
        console.error('[webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    // Only handle the events we care about; acknowledge all others immediately.
    if (event.type !== 'invoice.payment_succeeded') {
        return res.status(200).json({ received: true });
    }

    // -----------------------------------------------------------------------
    // invoice.payment_succeeded — upsert active subscription in Supabase.
    //
    // Fires on initial payment AND every renewal, so current_period_end stays
    // up-to-date automatically without any additional cron/polling.
    // -----------------------------------------------------------------------
    const invoice = event.data.object;

    // Extract period end from the first line item.
    const firstLine = invoice.lines?.data?.[0];
    const periodEndUnix = firstLine?.period?.end;
    const currentPeriodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;

    // Resolve plan label from price ID on the line item.
    const priceId = firstLine?.price?.id
        || firstLine?.pricing?.price_details?.price
        || null;
    const planLabel = PRICE_LABEL_MAP[priceId] || firstLine?.description || null;

    // Resolve the subscription ID. In older Stripe API versions it is at
    // invoice.subscription; in 2025-03+ it moved to
    // invoice.parent.subscription_details.subscription. Fall back to a live
    // API lookup for any edge case not covered by the two field paths.
    let subscriptionId = invoice.subscription
        || invoice.parent?.subscription_details?.subscription
        || null;

    if (!subscriptionId && invoice.customer) {
        try {
            const subs = await stripe.subscriptions.list({
                customer: invoice.customer,
                status: 'active',
                limit: 1,
            });
            subscriptionId = subs.data[0]?.id || null;
            if (!subscriptionId) {
                const allSubs = await stripe.subscriptions.list({ customer: invoice.customer, limit: 1 });
                subscriptionId = allSubs.data[0]?.id || null;
            }
        } catch (lookupErr) {
            console.error('[webhook] Subscription lookup failed:', lookupErr.message);
        }
    }

    if (!subscriptionId) {
        console.error('[webhook] Could not resolve subscription ID for invoice', invoice.id, '— skipping upsert');
        return res.status(200).json({ received: true });
    }

    try {
        const { error } = await supabase.from('subscriptions').upsert(
            {
                stripe_customer_id:     invoice.customer,
                stripe_subscription_id: subscriptionId,
                user_email:             invoice.customer_email,
                status:                 'active',
                paid_at:                invoice.status_transitions?.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                    : null,
                amount_paid:            invoice.amount_paid,
                currency:               invoice.currency,
                current_period_end:     currentPeriodEnd,
                plan_label:             planLabel,
                cancel_at_period_end:   false,
            },
            { onConflict: 'stripe_subscription_id' }
        );

        if (error) {
            console.error('[webhook] Supabase upsert error:', error.message, error.code);
        } else {
            console.log('[webhook] Subscription upserted for', invoice.customer_email, subscriptionId);
        }
    } catch (err) {
        console.error('[webhook] Unexpected error:', err.message);
    }

    return res.status(200).json({ received: true });
}
