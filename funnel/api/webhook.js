import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Stripe Webhook Handler
//
// Listens for subscription lifecycle events and upserts a `subscriptions`
// row in Supabase so the webapp can gate access to the 28-day plan.
//
// Wiring up (after first Vercel deploy):
//   Stripe Dashboard → Developers → Webhooks → Add endpoint
//   URL: https://<your-funnel>.vercel.app/api/webhook
//   Events: invoice.payment_succeeded
//   Copy the signing secret → set STRIPE_WEBHOOK_SECRET env var in Vercel
// ---------------------------------------------------------------------------

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Parse and verify the Stripe event.
    // If STRIPE_WEBHOOK_SECRET is not yet configured ('whsec_todo') skip
    // signature verification so the endpoint still works during local dev /
    // initial Vercel deployment without a webhook.
    let event;
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-06-20',
        });

        if (webhookSecret && webhookSecret !== 'whsec_todo') {
            // Vercel buffers request body as a string when using raw body parser;
            // pass the raw string so Stripe can verify the HMAC signature.
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // Signature verification is disabled — log clearly so this is visible
            // in Vercel logs. Set STRIPE_WEBHOOK_SECRET to a real whsec_... value
            // in the Vercel dashboard to enable verification.
            console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification. Any POST will be accepted.');
            event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
    // invoice.payment_succeeded — record the active subscription in Supabase
    // -----------------------------------------------------------------------
    const invoice = event.data.object;

    try {
        const { error } = await supabase.from('subscriptions').upsert(
            {
                stripe_customer_id:     invoice.customer,
                stripe_subscription_id: invoice.subscription,
                user_email:             invoice.customer_email,
                status:                 'active',
                paid_at:                new Date(invoice.status_transitions?.paid_at * 1000).toISOString(),
                amount_paid:            invoice.amount_paid,   // in cents
                currency:               invoice.currency,
            },
            { onConflict: 'stripe_subscription_id' }
        );

        if (error) {
            // Log but don't return 500 — Stripe would retry and we'd loop.
            console.error('[webhook] Supabase upsert error:', error.message);
        }
    } catch (err) {
        console.error('[webhook] Unexpected error:', err.message);
    }

    return res.status(200).json({ received: true });
}
