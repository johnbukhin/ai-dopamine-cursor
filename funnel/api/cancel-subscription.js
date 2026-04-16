import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Service-role client — needed to update the subscriptions row after cancel.
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { stripe_subscription_id, userEmail } = req.body;

    if (!stripe_subscription_id || !userEmail) {
        return res.status(400).json({ error: 'stripe_subscription_id and userEmail are required' });
    }

    // ── Ownership verification ───────────────────────────────────────────────
    // Confirm the subscription row exists in Supabase AND belongs to the
    // requesting user's email before touching Stripe. This prevents any user
    // from cancelling another user's subscription by guessing a subscription ID.
    const { data: row, error: lookupError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, user_email, cancel_at_period_end')
        .eq('stripe_subscription_id', stripe_subscription_id)
        .eq('user_email', userEmail)
        .single();

    if (lookupError || !row) {
        return res.status(403).json({ error: 'Subscription not found or does not belong to this user' });
    }

    if (row.cancel_at_period_end) {
        return res.status(400).json({ error: 'Subscription is already scheduled for cancellation' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // Schedule cancellation at end of current billing period.
        // User retains access until current_period_end — not cut off immediately.
        const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
            cancel_at_period_end: true,
        });

        // Mirror the cancel flag in Supabase so the webapp can read it without
        // waiting for the next webhook event.
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ cancel_at_period_end: true })
            .eq('stripe_subscription_id', stripe_subscription_id);

        if (updateError) {
            // Non-fatal — Stripe is the source of truth. Log and continue.
            console.error('[cancel-subscription] Supabase update error:', updateError.message, updateError.code);
        }

        // cancel_at is a Unix timestamp of when the subscription will end.
        return res.status(200).json({
            cancel_at: subscription.cancel_at,
            current_period_end: subscription.current_period_end,
        });

    } catch (err) {
        console.error('[cancel-subscription] Stripe error:', err.message);
        return res.status(500).json({ error: err.message || 'Failed to cancel subscription' });
    }
}
