import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Create / Update User — called from the account-creation screen when the
// user sets their password.
//
// By the time this runs, provision-account.js has already created the auth
// user and written the profile (fired right after stripe.confirmPayment).
// So the common path here is "user already exists" — we update their password,
// upsert the profile (idempotent), and sign them in.
//
// First-time fallback (provision-account failed or was skipped): create user
// from scratch exactly as before.
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    email, password, name, selectedPlan, promoCode, quizAnswers,
    gender, ageGroup, mainChallenge, goal, scores, funnelVersion,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (quizAnswers && JSON.stringify(quizAnswers).length > 50_000) {
    return res.status(400).json({ error: 'Quiz answers payload too large' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const profilePayload = {
    email,
    name:                       name          || null,
    selected_plan:              selectedPlan  || null,
    promo_code:                 promoCode     || null,
    quiz_answers:               quizAnswers   || null,
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
  };

  try {
    let userId;

    // Try to create a new user first.
    const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr) {
      if (!createErr.message.toLowerCase().includes('already')) {
        return res.status(400).json({ error: createErr.message });
      }

      // User already exists (provisioned after checkout) — just update their password.
      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!profile?.id) {
        return res.status(400).json({ error: 'Account not found. Please contact support.' });
      }

      userId = profile.id;

      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password });
      if (updateErr) {
        return res.status(400).json({ error: updateErr.message });
      }

      // Upsert profile (fills any fields that may have been null at provision time).
      await supabase.from('users_profile').upsert(
        { id: userId, ...profilePayload },
        { onConflict: 'id' }
      );
    } else {
      // Newly created user — insert profile.
      userId = authData.user.id;
      const { error: profileError } = await supabase.from('users_profile').insert({
        id: userId,
        ...profilePayload,
      });
      if (profileError) {
        console.error('[create-user] Profile insert error:', profileError.message, profileError.code);
      }
    }

    // Sign in with the real password to return a fresh session.
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(200).json({
        user: { id: userId },
        access_token: null,
        warning: 'Account ready but auto-sign-in failed',
      });
    }

    return res.status(200).json({
      user: { id: userId },
      access_token:  session?.session?.access_token,
      refresh_token: session?.session?.refresh_token,
    });

  } catch (error) {
    console.error('[create-user] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
