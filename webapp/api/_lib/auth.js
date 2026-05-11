// Shared Supabase JWT verifier for webapp serverless functions.
// Reads `Authorization: Bearer <access_token>` from the request and validates
// it against Supabase. Returns the user on success, or an error reason.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function verifyUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { user: null, error: 'Missing Authorization header' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { user: null, error: 'Invalid token' };

  return { user: data.user, error: null };
}
