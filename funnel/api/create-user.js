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

  const { email, password, name, selectedPlan, promoCode, quizAnswers } = req.body;

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
      name: name || null,
      selected_plan: selectedPlan || null,
      promo_code: promoCode || null,
      quiz_answers: quizAnswers || null
    });

    if (profileError) {
      console.error('[create-user] Profile insert error:', profileError.message);
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
