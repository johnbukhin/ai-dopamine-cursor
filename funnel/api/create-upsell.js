import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// One-Click Upsell Handler
//
// After a successful subscription checkout, the frontend offers the user an
// AI Companion bundle upgrade (AI Coach + AI Help). Because the user already
// entered their card details on the checkout screen, Stripe has a saved
// PaymentMethod on the customer. This endpoint charges it server-side with
// no additional user interaction (no Payment Element shown).
//
// Request body:  { email, upsellTier: '1_month'|'3_month', currency }
// Responses:
//   200 { success: true }                  — charged successfully
//   200 { success: false, reason: string } — no PM or customer not found (skip)
//   400 { error: string }                  — bad request
//   500 { error: string }                  — unexpected server error
//
// All failures where we cannot charge are logged to the `upsell_errors` table
// for post-hoc investigation — the frontend always redirects to thank_you
// regardless, so the user experience is never blocked.
// ---------------------------------------------------------------------------

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];

// Display amount strings per price ID per currency — used in the charge
// description visible in the Stripe dashboard and customer receipts.
const UPSELL_DISPLAY = {
    [process.env.STRIPE_PRICE_UPSELL_1MONTH]: {
        usd: '$9', eur: '€9', gbp: '£8', cad: 'CA$12', aud: 'A$14',
    },
    [process.env.STRIPE_PRICE_UPSELL_3MONTH]: {
        usd: '$19', eur: '€18', gbp: '£16', cad: 'CA$26', aud: 'A$30',
    },
};

async function logUpsellError({ email, stripeCustomerId, priceId, currency, reason, rawError }) {
    try {
        await supabase.from('upsell_errors').insert({
            user_email:         email,
            stripe_customer_id: stripeCustomerId || null,
            price_id:           priceId,
            currency,
            reason,
            raw_error:          rawError || null,
        });
    } catch (err) {
        // Non-fatal — logging failure must not affect the response to the frontend
        console.error('[create-upsell] Failed to log upsell error:', err.message);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, upsellTier, currency: rawCurrency } = req.body;
    if (!email || !upsellTier) {
        return res.status(400).json({ error: 'email and upsellTier are required' });
    }

    const TIER_TO_PRICE = {
        '1_month': process.env.STRIPE_PRICE_UPSELL_1MONTH,
        '3_month': process.env.STRIPE_PRICE_UPSELL_3MONTH,
    };

    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency?.toLowerCase())
        ? rawCurrency.toLowerCase()
        : 'eur';

    const priceId = TIER_TO_PRICE[upsellTier];
    if (!priceId) {
        return res.status(400).json({ error: `Unknown upsell tier: ${upsellTier}` });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        // 1. Find the Stripe customer by email. The checkout step always creates
        //    one, so this should always succeed for a user who just paid.
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) {
            await logUpsellError({ email, priceId, currency, reason: 'customer_not_found' });
            return res.status(200).json({ success: false, reason: 'customer_not_found' });
        }

        const customer = customers.data[0];

        // 2. Retrieve the most recently attached payment method.
        //    After checkout the user's card is attached as a default PM.
        const pms = await stripe.paymentMethods.list({
            customer: customer.id,
            type: 'card',
            limit: 1,
        });

        if (!pms.data.length) {
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                priceId,
                currency,
                reason: 'no_pm',
            });
            return res.status(200).json({ success: false, reason: 'no_pm' });
        }

        const pm = pms.data[0];

        // Resolve display amount for receipt description
        const amountDisplay = UPSELL_DISPLAY[priceId]?.[currency] || '';

        // 3. Create and immediately confirm a PaymentIntent off-session.
        //    off_session=true tells Stripe the customer is not present — it will
        //    use the card's stored authentication and attempt the charge directly.
        const pi = await stripe.paymentIntents.create({
            customer:       customer.id,
            payment_method: pm.id,
            currency,
            confirm:        true,
            off_session:    true,
            // Amount read from the Price's currency_options for the detected currency.
            amount:         await resolveAmount(stripe, priceId, currency),
            description:    `AI Companion Bundle upsell${amountDisplay ? ` — ${amountDisplay}` : ''}`,
            metadata: {
                upsell:      'true',
                upsell_tier: upsellTier,
                price_id:    priceId,
                currency,
                email,
            },
        });

        if (pi.status !== 'succeeded') {
            // Payment requires additional action (3DS, etc.) — treat as skip
            await logUpsellError({
                email,
                stripeCustomerId: customer.id,
                priceId,
                currency,
                reason: 'stripe_error',
                rawError: `PI status: ${pi.status}`,
            });
            return res.status(200).json({ success: false, reason: 'requires_action' });
        }

        console.info('[create-upsell] Upsell charged successfully for', email, pi.id);
        return res.status(200).json({ success: true, paymentIntentId: pi.id });

    } catch (err) {
        // Stripe card errors (declined, insufficient funds, etc.) are caught here.
        // We log and return success:false so the frontend skips gracefully.
        console.error('[create-upsell] Error:', err.message);
        await logUpsellError({
            email,
            priceId,
            currency,
            reason: 'stripe_error',
            rawError: err.message,
        });
        return res.status(200).json({ success: false, reason: 'stripe_error' });
    }
}

// Resolve the charge amount from the Stripe Price object's currency_options.
// Falls back to the Price's default unit_amount if the currency isn't found.
async function resolveAmount(stripe, priceId, currency) {
    const price = await stripe.prices.retrieve(priceId);

    if (currency === price.currency) {
        return price.unit_amount;
    }

    const option = price.currency_options?.[currency];
    if (option?.unit_amount) {
        return option.unit_amount;
    }

    // Fallback: use default currency amount (should not happen for supported currencies)
    console.warn(`[create-upsell] currency_options.${currency} not found on ${priceId}, falling back to ${price.currency}`);
    return price.unit_amount;
}
