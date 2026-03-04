import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Compass, ShieldCheck, ExternalLink } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

/** Funnel URL — users without an account should purchase there first */
const FUNNEL_URL = import.meta.env.VITE_FUNNEL_URL || 'https://ai-dopamine-cursor.vercel.app/funnel/';

interface LoginProps {
  onLogin: () => void;
}

/**
 * Login component with three rendering states:
 *
 * 1. Checking (spinner) — silently tries to restore session:
 *    a. URL hash tokens (#access_token=...&refresh_token=...) — written by the funnel
 *       when redirecting cross-origin after account creation. Hash is stripped from the
 *       URL after consumption so tokens don't persist in browser history.
 *    b. localStorage tokens (compass_access_token / compass_refresh_token) — same-origin
 *       fallback used in local dev where funnel and webapp share an origin.
 * 2. Login form — shown when no valid tokens exist (direct URL access, expired session).
 * 3. Not configured — shown when Supabase env vars are missing (dev/build misconfiguration).
 */
export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If Supabase isn't configured at all, skip the check and show the form/error
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }

    /**
     * Attempt silent auto-authentication.
     *
     * Priority order:
     * 1. URL hash tokens — cross-origin handoff from the funnel after purchase.
     *    These are URL-encoded in the fragment: #access_token=...&refresh_token=...
     *    We strip the hash immediately after reading to keep tokens out of history.
     * 2. localStorage tokens — same-origin fallback for local development.
     */
    const tryAutoAuth = async () => {
      // ── 1. Check URL hash (cross-origin post-purchase redirect) ──────────────
      const hash = window.location.hash.slice(1); // strip leading '#'
      if (hash) {
        const params = new URLSearchParams(hash);
        const hashAccessToken = params.get('access_token');
        const hashRefreshToken = params.get('refresh_token');

        // Strip hash from URL immediately — tokens must not linger in browser history
        history.replaceState(null, '', window.location.pathname);

        if (hashAccessToken && hashRefreshToken) {
          try {
            const { error: sessionError } = await supabase!.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            });

            if (!sessionError) {
              onLogin();
              return;
            }
          } catch {
            // Invalid/expired hash tokens — fall through to localStorage check
          }
        }
      }

      // ── 2. Check localStorage (same-origin local dev fallback) ────────────────
      const accessToken = localStorage.getItem('compass_access_token');
      const refreshToken = localStorage.getItem('compass_refresh_token');

      if (accessToken && refreshToken) {
        try {
          const { error: sessionError } = await supabase!.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError) {
            onLogin();
            return;
          }
        } catch {
          // Network error or invalid tokens — fall through to login form
        }

        // Tokens expired or invalid — clear them
        localStorage.removeItem('compass_access_token');
        localStorage.removeItem('compass_refresh_token');
      }

      setChecking(false);
    };

    tryAutoAuth();
  }, [onLogin]);

  /** Handle manual email/password sign-in */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      onLogin();
    }
  };

  // ── Spinner while checking for stored tokens ─────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <Compass className="text-emerald-700 animate-spin" size={36} />
          <p className="text-stone-400 text-sm">Loading your space…</p>
        </div>
      </div>
    );
  }

  // ── Supabase not configured (missing env vars) ────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-100 text-center">
          <div className="bg-amber-50 p-4 rounded-full inline-flex mb-4">
            <Compass className="text-amber-600" size={40} />
          </div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">Configuration needed</h1>
          <p className="text-stone-500 text-sm">
            The app is not fully configured yet. If you're the developer, set{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-stone-100 px-1 rounded text-xs">VITE_SUPABASE_ANON_KEY</code>{' '}
            in Vercel and redeploy.
          </p>
        </div>
      </div>
    );
  }

  // ── Login form (direct URL access or expired session) ────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full space-y-4">

        {/* Branding card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-50 p-4 rounded-full mb-4">
              <Compass className="text-emerald-800" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">Compass</h1>
            <p className="text-stone-500 mt-2 text-center text-sm">
              Your private space for recovery and impulse control.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors text-stone-800"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors text-stone-800"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg p-2">{error}</p>
            )}

            <Button type="submit" fullWidth className="mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Enter My Space'}
            </Button>
          </form>

          <div className="flex items-center gap-2 mt-6 justify-center">
            <ShieldCheck size={14} className="text-stone-300" />
            <p className="text-xs text-stone-400">
              Private. Encrypted. No social logins.
            </p>
          </div>
        </div>

        {/* No account yet — prompt to go through funnel */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4">
          <div className="bg-emerald-50 p-2 rounded-xl flex-shrink-0">
            <ExternalLink size={20} className="text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-700">Don't have an account yet?</p>
            <p className="text-xs text-stone-400 mt-0.5 mb-2">
              Access is created automatically when you complete the Compass program.
            </p>
            <a
              href={FUNNEL_URL}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors underline underline-offset-2"
            >
              Start my Compass journey →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
