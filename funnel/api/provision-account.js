import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Provision Account — called immediately after stripe.confirmPayment() succeeds.
//
// Creates the Supabase auth user (or finds the existing one) with a server-side
// temp password, writes the quiz profile, and returns a live session so the
// user is already authenticated before they reach the account-creation screen.
//
// At account-creation the user sets their real password; create-user.js then
// updates it (idempotent).  This endpoint is intentionally lightweight and
// tolerant of duplicate calls.
// ---------------------------------------------------------------------------

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const clip = (v, max = 100) => (typeof v === 'string' ? v.slice(0, max) : null);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-dopamine-addict.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

    const {
        email, name, selectedPlan, promoCode, quizAnswers,
        gender, ageGroup, mainChallenge, goal, scores, funnelVersion,
    } = req.body;

    if (!email) return res.status(400).json({ error: 'email is required' });

    const tempPassword = randomUUID(); // server-only; never sent to client

    try {
        let userId;

        // 1. Try to create a new auth user.
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password:      tempPassword,
            email_confirm: true,
        });

        if (createErr) {
            if (!createErr.message.toLowerCase().includes('already')) {
                // Unexpected error — bail out; account creation will still work as fallback
                console.error('[provision-account] createUser error:', createErr.message);
                return res.status(200).json({ provisioned: false, reason: createErr.message });
            }

            // User already exists — look up their ID from the profile table so we
            // can temporarily update their password to obtain a session token.
            const { data: profile } = await supabase
                .from('users_profile')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (!profile?.id) {
                // Profile row missing (edge case) — fall through to account-creation fallback
                return res.status(200).json({ provisioned: false, reason: 'profile_not_found' });
            }

            userId = profile.id;

            // Temporarily set password so we can sign them in server-side
            const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
                password: tempPassword,
            });
            if (updateErr) {
                console.error('[provision-account] updateUser error:', updateErr.message);
                return res.status(200).json({ provisioned: false, reason: updateErr.message });
            }
        } else {
            userId = created.user.id;

            // 2. Write quiz profile for new users.
            await supabase.from('users_profile').insert({
                id:           userId,
                email,
                name:          name          || null,
                selected_plan: selectedPlan  || null,
                promo_code:    promoCode     || null,
                quiz_answers:  quizAnswers   || null,
                gender:                     clip(gender),
                age_group:                  clip(ageGroup),
                main_challenge:             clip(mainChallenge),
                goal:                       clip(goal),
                score_overall:              scores?.overall              ?? null,
                score_dopamine_sensitivity: scores?.dopamine_sensitivity  ?? null,
                score_emotional_regulation: scores?.emotional_regulation  ?? null,
                score_pattern_stage:        scores?.pattern_stage         ?? null,
                score_physical_impact:      scores?.physical_impact       ?? null,
                funnel_version:             clip(funnelVersion, 20),
            });
        }

        // 3. Sign in with the temp password to obtain a live session.
        const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password: tempPassword,
        });

        if (signInErr || !session?.session) {
            console.error('[provision-account] signIn error:', signInErr?.message);
            return res.status(200).json({ provisioned: false, reason: 'sign_in_failed' });
        }

        return res.status(200).json({
            provisioned:   true,
            access_token:  session.session.access_token,
            refresh_token: session.session.refresh_token,
        });

    } catch (err) {
        console.error('[provision-account] unexpected error:', err.message);
        return res.status(200).json({ provisioned: false, reason: err.message });
    }
}
