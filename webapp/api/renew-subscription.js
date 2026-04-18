import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://mind-compass-webapp.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { stripe_subscription_id, userEmail } = req.body;

    if (!stripe_subscription_id || !userEmail) {
        return res.status(400).json({ error: 'stripe_subscription_id and userEmail are required' });
    }

    const { data: row, error: lookupError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, user_email, cancel_at_period_end')
        .eq('stripe_subscription_id', stripe_subscription_id)
        .eq('user_email', userEmail)
        .single();

    if (lookupError || !row) {
        return res.status(403).json({ error: 'Subscription not found or does not belong to this user' });
    }

    if (!row.cancel_at_period_end) {
        return res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        await stripe.subscriptions.update(stripe_subscription_id, {
            cancel_at_period_end: false,
        });

        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ cancel_at_period_end: false })
            .eq('stripe_subscription_id', stripe_subscription_id);

        if (updateError) {
            console.error('[renew-subscription] Supabase update error:', updateError.message, updateError.code);
        }

        return res.status(200).json({ renewed: true });

    } catch (err) {
        console.error('[renew-subscription] Stripe error:', err.message);
        return res.status(500).json({ error: err.message || 'Failed to renew subscription' });
    }
}
