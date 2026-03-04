import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * Supabase client for the Compass webapp.
 *
 * Credentials are injected at BUILD time via Vite environment variables.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (dev)
 * or in Vercel project → Settings → Environment Variables (production).
 *
 * IMPORTANT: After adding env vars in Vercel, trigger a new deployment
 * so Vite can bake them into the bundle.
 *
 * Exported as nullable — callers must handle the unconfigured case gracefully
 * rather than crashing the app on missing credentials.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  logger.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.');
}

export { supabase };
export const isSupabaseConfigured = !!supabase;
