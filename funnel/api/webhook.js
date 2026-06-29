import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Stripe Webhook Handler
//
// Listens for invoice.payment_succeeded (subscriptions) and
// payment_intent.succeeded (one-time upsell). Updates Supabase and fires
// server-side Meta CAPI Purchase events for each confirmed payment.
//
// IMPORTANT: body parsing must be disabled (see config export below) so that
// req.body is the raw string Stripe needs for HMAC signature verification.
// ---------------------------------------------------------------------------

export const config = { api: { bodyParser: false } };

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICE_LABEL_MAP = {
    [process.env.STRIPE_PRICE_INTRO_7DAY]:        '7-Day Plan',
    [process.env.STRIPE_PRICE_INTRO_1MONTH]:      '1-Month Plan',
    [process.env.STRIPE_PRICE_INTRO_3MONTH]:      '3-Month Plan',
    [process.env.STRIPE_PRICE_REGULAR_MONTHLY]:   'Monthly Plan',
    [process.env.STRIPE_PRICE_REGULAR_QUARTERLY]: 'Quarterly Plan',
    [process.env.STRIPE_PRICE_UPSELL]:            'AI Companion',
};

// ---------------------------------------------------------------------------
// Meta CAPI — server-side Purchase event
//
// Fires after every confirmed payment. Complements the browser pixel Purchase
// event — deduplication is handled by Meta heuristically (same email hash +
// event within seconds). Only fires on initial subscription purchases, not
// renewals, to avoid inflating Meta's purchase count.
// ---------------------------------------------------------------------------
async function fireCapiPurchase({ email, amountCents, currency, contentId }) {
    const pixelId = process.env.META_PIXEL_ID;
    const token   = process.env.META_CAPI_TOKEN;
    if (!pixelId || !token) return;

    const hashedEmail = email
        ? crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
        : null;

    const payload = {
        data: [{
            event_name:       'Purchase',
            event_time:       Math.floor(Date.now() / 1000),
            action_source:    'website',
            event_source_url: 'https://ai-dopamine-addict.vercel.app/funnel-v2/',
            user_data: {
                ...(hashedEmail && { em: [hashedEmail] }),
            },
            custom_data: {
                value:        amountCents / 100,
                currency:     currency.toUpperCase(),
                content_ids:  [contentId],
                content_type: 'product',
            },
        }],
        access_token: token,
    };

    try {
        const resp = await fetch(
            `https://graph.facebook.com/v19.0/${pixelId}/events`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );
        const result = await resp.json();
        if (result.error) {
            console.error('[CAPI] Error:', result.error.message);
        } else {
            console.info('[CAPI] Purchase sent, events_received:', result.events_received);
        }
    } catch (err) {
        console.error('[CAPI] Failed to send event:', err.message);
    }
}

// ---------------------------------------------------------------------------
// Raw body reader — required because bodyParser: false
// ---------------------------------------------------------------------------
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
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
            console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification.');
            event = JSON.parse(rawBody.toString('utf8'));
        }
    } catch (err) {
        console.error('[webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === 'payment_intent.succeeded') {
        return handleUpsellPayment(event.data.object, res);
    }
    if (event.type !== 'invoice.payment_succeeded') {
        return res.status(200).json({ received: true });
    }

    // -----------------------------------------------------------------------
    // invoice.payment_succeeded — upsert active subscription in Supabase
    // and fire CAPI Purchase on the initial payment only.
    // -----------------------------------------------------------------------
    const invoice = event.data.object;

    const firstLine      = invoice.lines?.data?.[0];
    const periodEndUnix  = firstLine?.period?.end;
    const currentPeriodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;

    const priceId  = firstLine?.price?.id
        || firstLine?.pricing?.price_details?.price
        || null;
    const planLabel = PRICE_LABEL_MAP[priceId] || firstLine?.description || null;

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
            console.info('[webhook] Subscription upserted for', invoice.customer_email, subscriptionId);
        }
    } catch (err) {
        console.error('[webhook] Unexpected error:', err.message);
    }

    // Fire CAPI Purchase only on initial subscription payment, not renewals.
    const billingReason = invoice.billing_reason;
    if (billingReason === 'subscription_create' || !billingReason) {
        await fireCapiPurchase({
            email:       invoice.customer_email,
            amountCents: invoice.amount_paid,
            currency:    invoice.currency,
            contentId:   planLabel || priceId || 'subscription',
        });
    }

    return res.status(200).json({ received: true });
}

// ---------------------------------------------------------------------------
// payment_intent.succeeded — one-time AI Companion upsell purchase
// ---------------------------------------------------------------------------
async function handleUpsellPayment(pi, res) {
    const upsellPriceId = process.env.STRIPE_PRICE_UPSELL;
    if (!upsellPriceId || pi.metadata?.upsell_price_id !== upsellPriceId) {
        return res.status(200).json({ received: true });
    }

    try {
        const { error } = await supabase.from('upsell_purchases').upsert(
            {
                stripe_customer_id:       pi.customer,
                stripe_payment_intent_id: pi.id,
                user_email:               pi.metadata?.user_email || null,
                amount_paid:              pi.amount,
                currency:                 pi.currency,
                paid_at:                  new Date(pi.created * 1000).toISOString(),
                plan_label:               'AI Companion',
            },
            { onConflict: 'stripe_payment_intent_id' }
        );

        if (error) {
            console.error('[webhook] upsell_purchases upsert error:', error.message, error.code);
        } else {
            console.info('[webhook] AI Companion upsell recorded for', pi.metadata?.user_email, pi.id);
        }
    } catch (err) {
        console.error('[webhook] Unexpected error in handleUpsellPayment:', err.message);
    }

    await fireCapiPurchase({
        email:       pi.metadata?.user_email,
        amountCents: pi.amount,
        currency:    pi.currency,
        contentId:   'ai_companion',
    });

    return res.status(200).json({ received: true });
}
