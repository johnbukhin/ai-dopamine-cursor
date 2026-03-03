import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for the Compass webapp.
 *
 * Credentials are injected at build time via Vite environment variables.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (dev)
 * or in the Vercel project environment variables (production).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
