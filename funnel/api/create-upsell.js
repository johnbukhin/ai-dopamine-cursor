import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// One-Click Upsell Handler — AI Companion One-Time Purchase
//
// After a successful subscription checkout the frontend offers an AI Companion
// add-on for a one-time charge. Because the user already entered their card on
// the checkout screen, Stripe has a saved PaymentMethod on the customer. This
// endpoint charges it off-session immediately — no additional user interaction.
//
// Request body:  { email, currency }
// Responses:
//   200 { success: true }                  — payment collected
//   200 { success: false, reason: string } — no PM / customer not found / already purchased
//   400 { error: string }                  — bad request
//   500 { error: string }                  — unexpected server error
// ---------------------------------------------------------------------------

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];

async function logUpsellError({ email, stripeCustomerId, currency, reason, rawError }) {
    try {
        await supabase.from('upsell_errors').insert({
            user_email:         email,
            stripe_customer_id: stripeCustomerId || null,
            price_id:           process.env.STRIPE_PRICE_UPSELL,
            currency,
            reason,
            raw_error:          rawError || null,
        });
    } catch (err) {
        console.error('[create-upsell] Failed to log upsell error:', err.message);
    }
}

const ALLOWED_ORIGINS = [
    'https://ai-dopamine-addict.vercel.app',
    'https://mind-compass-webapp.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

export default async function handler(req, res) {
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, currency: rawCurrency } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'email is required' });
    }

    const upsellPriceId = process.env.STRIPE_PRICE_UPSELL;
    if (!upsellPriceId) {
        console.error('[create-upsell] Missing STRIPE_PRICE_UPSELL env var');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency?.toLowerCase())
        ? rawCurrency.toLowerCase()
        : 'usd';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // 1. Find the Stripe customer by email.
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) {
            await logUpsellError({ email, currency, reason: 'customer_not_found' });
            return res.status(200).json({ success: false, reason: 'customer_not_found' });
        }

        const customer = customers.data[0];

        // 2. Guard against duplicate upsell purchases. Check for a prior
        //    PaymentIntent on this customer for the upsell price ID.
        const existingPIs = await stripe.paymentIntents.list({
            customer: customer.id,
            limit: 20,
        });
        const alreadyPurchased = existingPIs.data.some(pi =>
            pi.status === 'succeeded' &&
            pi.metadata?.upsell_price_id === upsellPriceId
        );
        if (alreadyPurchased) {
            console.info('[create-upsell] Customer already purchased upsell', customer.id);
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        // 3. Retrieve the most recently attached payment method.
        const pms = await stripe.paymentMethods.list({
            customer: customer.id,
            type: 'card',
            limit: 1,
        });

        if (!pms.data.length) {
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                currency,
                reason: 'no_pm',
            });
            return res.status(200).json({ success: false, reason: 'no_pm' });
        }

        const pm = pms.data[0];

        // 4. Look up the price amount for the customer's currency.
        //    Stripe stores currency_options on the price object.
        const price = await stripe.prices.retrieve(upsellPriceId, {
            expand: ['currency_options'],
        });

        const priceData = price.currency_options?.[currency] || price.currency_options?.[price.currency];
        const amount   = priceData?.unit_amount ?? price.unit_amount;
        const chargeCurrency = priceData ? currency : price.currency;

        // 5. Create and immediately confirm a PaymentIntent off-session.
        //    'off_session: true' tells Stripe the customer is not present
        //    and to use the saved card without any UI interaction.
        const pi = await stripe.paymentIntents.create({
            amount,
            currency: chargeCurrency,
            customer: customer.id,
            payment_method: pm.id,
            off_session: true,
            confirm: true,
            metadata: {
                upsell_price_id: upsellPriceId,
                user_email: email,
            },
        });

        if (pi.status !== 'succeeded') {
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                currency,
                reason: 'payment_failed',
                rawError: `PI ${pi.id} status: ${pi.status}`,
            });
            return res.status(200).json({ success: false, reason: 'payment_failed' });
        }

        console.info('[create-upsell] One-time upsell charged for', email, pi.id);

        // 6. Record the upsell purchase in Supabase immediately so the webapp
        //    can gate AI Companion access without waiting for the webhook.
        //    The webhook will upsert again on payment_intent.succeeded — harmless.
        try {
            await supabase.from('upsell_purchases').upsert(
                {
                    stripe_customer_id: customer.id,
                    stripe_payment_intent_id: pi.id,
                    user_email: email,
                    amount_paid: amount,
                    currency: chargeCurrency,
                    paid_at: new Date().toISOString(),
                    plan_label: 'AI Companion',
                },
                { onConflict: 'stripe_payment_intent_id' }
            );
        } catch (dbErr) {
            console.error('[create-upsell] Supabase upsert error (non-fatal):', dbErr.message);
        }

        return res.status(200).json({ success: true, paymentIntentId: pi.id });

    } catch (err) {
        console.error('[create-upsell] Error:', err.message);
        await logUpsellError({
            email,
            currency,
            reason: 'stripe_error',
            rawError: err.message,
        });
        return res.status(200).json({ success: false, reason: 'stripe_error' });
    }
}
