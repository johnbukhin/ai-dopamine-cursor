import { createClient } from '@supabase/supabase-js';

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

  const {
    email, password, name, selectedPlan, promoCode, quizAnswers,
    // Structured quiz profile fields (Issue #19)
    gender, ageGroup, mainChallenge, goal, scores, funnelVersion,
  } = req.body;

  // Clip text fields to guard against oversized client payloads.
  // Profile insert is non-fatal so errors are swallowed — prevent silent
  // DB rejections by trimming at the boundary.
  const clip = (v, max = 100) => (typeof v === 'string' ? v.slice(0, max) : null);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { error: profileError } = await supabase.from('users_profile').insert({
      id: authData.user.id,
      email,
      name:          name          || null,
      selected_plan: selectedPlan  || null,
      promo_code:    promoCode     || null,
      quiz_answers:  quizAnswers   || null,
      // Structured quiz columns (Issue #19) — queryable alternatives to the
      // raw quiz_answers blob. All are optional; missing answers send null.
      gender:                        clip(gender),
      age_group:                     clip(ageGroup),
      main_challenge:                clip(mainChallenge),
      goal:                          clip(goal),
      score_overall:                 scores?.overall              ?? null,
      score_dopamine_sensitivity:    scores?.dopamine_sensitivity  ?? null,
      score_emotional_regulation:    scores?.emotional_regulation  ?? null,
      score_pattern_stage:           scores?.pattern_stage         ?? null,
      score_physical_impact:         scores?.physical_impact       ?? null,
      funnel_version:                clip(funnelVersion, 20),
    });

    if (profileError) {
      console.error('[create-user] Profile insert error:', profileError.message, profileError.code);
    }

    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      return res.status(200).json({
        user: authData.user,
        access_token: null,
        warning: 'User created but auto-sign-in failed'
      });
    }

    // Return both tokens so the webapp can initialize a full Supabase session
    // (access_token for immediate auth, refresh_token for session renewal)
    return res.status(200).json({
      user: authData.user,
      access_token: session?.session?.access_token,
      refresh_token: session?.session?.refresh_token
    });
  } catch (error) {
    console.error('[create-user] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
