import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Compass } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

/**
 * Login component with Supabase authentication.
 *
 * Auto-auth flow: On mount, checks localStorage for tokens written by the funnel
 * after account creation. If found, restores the Supabase session silently and
 * calls onLogin() — the user never sees the login form.
 *
 * Manual flow: If no tokens are present (e.g., user opens the app directly),
 * shows an email + password form and authenticates via supabase.auth.signInWithPassword().
 */
export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Start in "checking" state — hide the form while we try auto-auth
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    /**
     * Attempt silent auto-authentication from tokens stored by the funnel.
     * The funnel's create-user serverless function returns access_token + refresh_token
     * and the funnel stores them as compass_access_token / compass_refresh_token.
     */
    const tryAutoAuth = async () => {
      const accessToken = localStorage.getItem('compass_access_token');
      const refreshToken = localStorage.getItem('compass_refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!sessionError) {
          // Session restored — proceed directly to the app
          onLogin();
          return;
        }

        // Tokens expired or invalid — clear them and fall through to login form
        localStorage.removeItem('compass_access_token');
        localStorage.removeItem('compass_refresh_token');
      }

      // No valid tokens — show the login form
      setChecking(false);
    };

    tryAutoAuth();
  }, [onLogin]);

  /** Handle manual email/password sign-in */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Show nothing while auto-auth is in progress
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Compass className="text-emerald-800 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-50 p-4 rounded-full mb-4">
            <Compass className="text-emerald-800" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-emerald-900">Compass</h1>
          <p className="text-stone-500 mt-2 text-center">
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
              className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
              placeholder="you@example.com"
              required
              autoComplete="email"
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
              className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <Button type="submit" fullWidth className="mt-4" disabled={loading}>
            {loading ? 'Signing in…' : 'Enter Personal Space'}
          </Button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          Privacy First. No social logins. Encrypted local session.
        </p>
      </div>
    </div>
  );
};
