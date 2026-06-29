import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// GET /api/prices
//
// Returns live Stripe price amounts for all plan tiers in all supported
// currencies. The frontend uses this to display correct paywall prices
// without hardcoding them.
//
// Response is CDN-cached for 1 hour (s-maxage=3600) so it doesn't hit Stripe
// on every pageview. Browser sessionStorage provides an additional client-side
// cache with a 1-hour TTL.
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
    'https://ai-dopamine-addict.vercel.app',
    'https://mind-compass-webapp.vercel.app',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
];

export default async function handler(req, res) {
    const origin = req.headers.origin || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const IDS = {
        intro_7day:        process.env.STRIPE_PRICE_INTRO_7DAY,
        intro_1month:      process.env.STRIPE_PRICE_INTRO_1MONTH,
        intro_3month:      process.env.STRIPE_PRICE_INTRO_3MONTH,
        regular_monthly:   process.env.STRIPE_PRICE_REGULAR_MONTHLY,
        regular_quarterly: process.env.STRIPE_PRICE_REGULAR_QUARTERLY,
        upsell:            process.env.STRIPE_PRICE_UPSELL,
    };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    try {
        const entries = await Promise.all(
            Object.entries(IDS)
                .filter(([, id]) => id)
                .map(async ([key, id]) => {
                    const p = await stripe.prices.retrieve(id, { expand: ['currency_options'] });
                    // Build a flat map: { usd: 699, eur: 699, gbp: 599, ... } (amounts in cents)
                    const currencyAmounts = { [p.currency]: p.unit_amount };
                    for (const [c, data] of Object.entries(p.currency_options || {})) {
                        if (data.unit_amount != null) currencyAmounts[c] = data.unit_amount;
                    }
                    return [key, {
                        id:              p.id,
                        base_currency:   p.currency,
                        currency_amounts: currencyAmounts,
                        recurring: p.recurring
                            ? { interval: p.recurring.interval, interval_count: p.recurring.interval_count }
                            : null,
                    }];
                })
        );

        return res.status(200).json({ prices: Object.fromEntries(entries) });
    } catch (err) {
        console.error('[api/prices]', err.message);
        return res.status(500).json({ error: 'Failed to load prices' });
    }
}
