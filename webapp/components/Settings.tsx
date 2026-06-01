import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { CancelFlow } from './CancelFlow';
import { ProfileCampfire } from './HeroVariants';


type SettingsTab = 'Data' | 'Privacy' | 'Access' | 'Terms';

// ---------------------------------------------------------------------------
// Subscription row shape as stored in Supabase (written by webhook.js)
// ---------------------------------------------------------------------------
interface Subscription {
  stripe_subscription_id: string;
  plan_label: string | null;
  amount_paid: number | null;       // cents
  currency: string | null;
  paid_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

// ---------------------------------------------------------------------------
// users_profile row shape — populated by funnel/api/provision-account.js
// after Stripe payment. quiz_answers stores the raw funnel answer map:
//   { [screenId]: { value: string | number | string[], timestamp: string } }
// ---------------------------------------------------------------------------
interface QuizAnswer {
  value: string | number | string[];
  timestamp?: string;
}

interface UserProfile {
  email: string | null;
  name: string | null;
  gender: string | null;
  age_group: string | null;
  main_challenge: string | null;
  goal: string | null;
  score_overall: number | null;
  score_dopamine_sensitivity: number | null;
  score_emotional_regulation: number | null;
  score_pattern_stage: number | null;
  score_physical_impact: number | null;
  quiz_answers: Record<string, QuizAnswer> | null;
}

// Subset of funnel screen shape we need to render labels.
interface FunnelScreen {
  id: string;
  type: string;
  headline?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a cents integer + ISO currency code as a display string (e.g. "€19.99") */
function formatAmount(cents: number | null, currency: string | null): string {
  if (cents == null || currency == null) return '—';
  const symbol = currency.toLowerCase() === 'eur' ? '€' : currency.toUpperCase() + ' ';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

/** Format an ISO date string as a short locale date (e.g. "16 Apr 2026") */
function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Render any quiz_answers value as a comma-separated string. */
function formatAnswer(value: QuizAnswer['value'] | undefined): string {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

// Multi-choice question ids whose values are arrays (life stressors, symptoms, etc.).
// Pulled from funnel/funnel-v2/screens.json screens of type "multiple_choice".
const GOALS_SYMPTOMS_QUESTIONS = ['question_30', 'question_31', 'question_32', 'question_33', 'question_34'];

// ---------------------------------------------------------------------------
// Data tab — read-only view of the user's onboarding answers
// ---------------------------------------------------------------------------
const DataSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Guards against setState on an unmounted component if the user navigates
    // away from the Profile tab before the parallel load resolves.
    let mounted = true;

    const load = async () => {
      if (!supabase) { if (mounted) setLoading(false); return; }

      // Fetch the user's profile row and the funnel question text in parallel.
      // screens.json is copied into public/data at build time (scripts/copy-screens.mjs).
      try {
        const [{ data: userData }, screensRes] = await Promise.all([
          supabase.auth.getUser(),
          fetch('/data/screens.json'),
        ]);

        const userId = userData?.user?.id;
        if (!userId) { if (mounted) setLoading(false); return; }

        const { data: profileData, error: profileErr } = await supabase
          .from('users_profile')
          .select('email, name, gender, age_group, main_challenge, goal, score_overall, score_dopamine_sensitivity, score_emotional_regulation, score_pattern_stage, score_physical_impact, quiz_answers')
          .eq('id', userId)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (mounted) setProfile(profileData as UserProfile | null);

        // screens.json is a soft dependency — a network/parse failure should
        // never mask the profile we already loaded. labelFor() falls back to
        // "Question N" when the map stays empty.
        if (screensRes.ok) {
          try {
            const screens: FunnelScreen[] = await screensRes.json();
            const map: Record<string, string> = {};
            for (const s of screens) {
              if (s.id && s.headline) map[s.id] = s.headline.replace(/^"|"$/g, '');
            }
            if (mounted) setLabels(map);
          } catch {
            // Swallow — labels remain empty and the UI falls back gracefully.
          }
        }
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load profile data');
      }
      if (mounted) setLoading(false);
    };
    load();

    return () => { mounted = false; };
  }, []);

  /** Resolve a question id to its human-readable text, with a graceful fallback. */
  const labelFor = (id: string) => labels[id] || id.replace(/^question_/, 'Question ');

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Data</h2>
        <p className="text-sm text-gray-500">Loading your profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Data</h2>
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Data</h2>
        <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">No profile data found.</p>
          <p className="text-xs text-gray-400 mt-1">Your onboarding answers will appear here once you complete the quiz.</p>
        </div>
      </div>
    );
  }

  const answers = profile.quiz_answers || {};
  const goalsRows = GOALS_SYMPTOMS_QUESTIONS
    .map(id => ({ id, value: answers[id]?.value }))
    .filter(row => row.value !== undefined);

  // Sub-score rows for the Assessment section. Each row keeps its display
  // label next to the score, so a missing/null value renders as "—".
  const scoreRows: { label: string; value: number | null }[] = [
    { label: 'Overall',               value: profile.score_overall },
    { label: 'Dopamine sensitivity',  value: profile.score_dopamine_sensitivity },
    { label: 'Emotional regulation',  value: profile.score_emotional_regulation },
    { label: 'Pattern stage',         value: profile.score_pattern_stage },
    { label: 'Physical impact',       value: profile.score_physical_impact },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Data</h2>

      {/* Demographics ------------------------------------------------------- */}
      <section className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 mb-4">
        <h3 className="text-base leading-6 font-semibold text-gray-900 mb-3">Demographics</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Gender</dt>
            <dd className="text-gray-500">{profile.gender || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Age group</dt>
            <dd className="text-gray-500">{profile.age_group || '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Goals & Symptoms --------------------------------------------------- */}
      <section className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 mb-4">
        <h3 className="text-base leading-6 font-semibold text-gray-900 mb-3">Goals & Symptoms</h3>
        {goalsRows.length === 0 ? (
          <p className="text-sm text-gray-500">No answers recorded.</p>
        ) : (
          <dl className="space-y-3 text-sm">
            {goalsRows.map(row => (
              <div key={row.id}>
                <dt className="font-medium text-gray-700">{labelFor(row.id)}</dt>
                <dd className="text-gray-500 mt-0.5">{formatAnswer(row.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Assessment (pre-computed sub-scores from likert q1–q27) ------------ */}
      <section className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 mb-4">
        <h3 className="text-base leading-6 font-semibold text-gray-900 mb-3">Assessment</h3>
        <p className="text-xs text-gray-400 mb-3">Computed from your responses to the 27 assessment questions.</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {scoreRows.map(row => (
            <div key={row.label}>
              <dt className="font-medium text-gray-700">{row.label}</dt>
              <dd className="text-gray-500">{row.value != null ? row.value : '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Profile basics ----------------------------------------------------- */}
      <section className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6 mb-4">
        <h3 className="text-base leading-6 font-semibold text-gray-900 mb-3">Profile</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Name</dt>
            <dd className="text-gray-500">{profile.name || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email</dt>
            <dd className="text-gray-500 break-all">{profile.email || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Main challenge</dt>
            <dd className="text-gray-500">{profile.main_challenge || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Goal</dt>
            <dd className="text-gray-500">{profile.goal || '—'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Privacy tab (formerly "Profile") — account credentials and session control
// ---------------------------------------------------------------------------
const PrivacySettings: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill email from the current Supabase auth session
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setErrorMsg('');

    if (password !== confirm) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    setStatus('saving');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setPassword('');
      setConfirm('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy</h2>
      <form onSubmit={handleSave} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 sm:text-sm cursor-default"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Repeat password"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{errorMsg}</p>
        )}
        {status === 'success' && (
          <p className="text-sm text-purple-700 bg-purple-50 rounded-md px-3 py-2">Password updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={status === 'saving' || !password}
          style={{ backgroundColor: '#9333EA', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: (status === 'saving' || !password) ? 'not-allowed' : 'pointer', opacity: (status === 'saving' || !password) ? 0.5 : 1 }}
        >
          {status === 'saving' ? 'Saving…' : 'Save Password'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-200 max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Actions</h3>
        <button
          onClick={onLogout}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Single subscription card (used by AccessSettings for each row)
// ---------------------------------------------------------------------------
interface SubscriptionCardProps {
  sub: Subscription;
  userEmail: string;
  onCancelled: (id: string, periodEnd: string | null) => void;
  onRenewed: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ sub, userEmail, onCancelled, onRenewed }) => {
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelledUntil, setCancelledUntil] = useState<string | null>(
    sub.cancel_at_period_end ? sub.current_period_end : null
  );
  const [isCancelledState, setIsCancelledState] = useState(sub.cancel_at_period_end);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  const isCancelled = isCancelledState || !!cancelledUntil;

  const handleCancelConfirmed = (periodEnd: string | null) => {
    setCancelledUntil(periodEnd || sub.current_period_end);
    setIsCancelledState(true);
    onCancelled(sub.stripe_subscription_id, periodEnd);
  };

  const handleRenew = async () => {
    setRenewing(true);
    setRenewError('');
    try {
      const response = await fetch('/api/renew-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe_subscription_id: sub.stripe_subscription_id, userEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRenewError(data.error || 'Failed to renew. Please try again.');
      } else {
        setCancelledUntil(null);
        setIsCancelledState(false);
        onRenewed(sub.stripe_subscription_id);
      }
    } catch {
      setRenewError('Network error. Please try again.');
    }
    setRenewing(false);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg mb-4">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-base leading-6 font-semibold text-gray-900">
            {sub.plan_label || 'Subscription'}
          </h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            isCancelled ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          }`}>
            {isCancelled ? 'Cancels at period end' : 'Active'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-500">
          <div>
            <p className="font-medium text-gray-700">Begin date</p>
            <p>{formatDate(sub.paid_at)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Amount paid</p>
            <p>{formatAmount(sub.amount_paid, sub.currency)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">
              {isCancelled ? 'Access until' : 'Renews on'}
            </p>
            <p>{formatDate(cancelledUntil || sub.current_period_end)}</p>
          </div>
        </div>

        <div className="mt-4">
          {isCancelled ? (
            <div>
              <p className="text-sm text-amber-700 mb-3">
                Cancelled — access until <strong>{formatDate(cancelledUntil || sub.current_period_end)}</strong>.
              </p>
              {renewError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-2">{renewError}</p>
              )}
              <button
                onClick={handleRenew}
                disabled={renewing}
                style={{ backgroundColor: '#065f46', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: renewing ? 'not-allowed' : 'pointer', opacity: renewing ? 0.5 : 1 }}
              >
                {renewing ? 'Renewing…' : 'Renew'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelFlow(true)}
              className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {showCancelFlow && (
        <CancelFlow
          stripeSubscriptionId={sub.stripe_subscription_id}
          userEmail={userEmail}
          onClose={() => setShowCancelFlow(false)}
          onConfirmCancel={handleCancelConfirmed}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Access tab
// ---------------------------------------------------------------------------
const AccessSettings: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) { setLoading(false); return; }

      setUserEmail(email);

      const { data } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, plan_label, amount_paid, currency, paid_at, current_period_end, cancel_at_period_end')
        .eq('user_email', email)
        .order('paid_at', { ascending: false });

      if (data) setSubscriptions(data as Subscription[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
        <p className="text-sm text-gray-500">Loading subscriptions…</p>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
        <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">No active subscription found.</p>
          <p className="text-xs text-gray-400 mt-1">If you recently purchased, it may take a moment to appear.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
      {subscriptions.map(sub => (
        <SubscriptionCard
          key={sub.stripe_subscription_id}
          sub={sub}
          userEmail={userEmail}
          onCancelled={() => {}}
          onRenewed={() => {}}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Terms tab — links out to the four legal pages hosted on the funnel domain.
// Fallback uses the canonical production funnel host (matches scripts/
// smoke-test.sh and the CORS allowlists in funnel/api/*.js). Legal pages live
// at /legal/*.html on the funnel root — funnel/vercel.json redirects the
// older /funnel-v2/*.html paths there. The example value in
// .env.local.example + Login.tsx fallback are stale and broken (tracked as
// a follow-up cleanup) — do not copy from them.
// ---------------------------------------------------------------------------
const FUNNEL_URL = import.meta.env.VITE_FUNNEL_URL || 'https://ai-dopamine-addict.vercel.app';

const LEGAL_LINKS: { label: string; path: string }[] = [
  { label: 'Terms of Use and Service', path: '/legal/terms-of-use.html' },
  { label: 'Privacy Policy',           path: '/legal/privacy-policy.html' },
  { label: 'Subscription Policy',      path: '/legal/subscription-policy.html' },
  { label: 'Cookie Policy',            path: '/legal/cookie-policy.html' },
];

const TermsSettings: React.FC = () => {
  // Strip trailing slash so we don't end up with "//legal/..." in the href.
  const funnelBase = FUNNEL_URL.replace(/\/$/, '');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Terms</h2>
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {LEGAL_LINKS.map(link => (
            <li key={link.path}>
              <a
                href={`${funnelBase}${link.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-4 sm:px-6 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <span>{link.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Settings shell
// ---------------------------------------------------------------------------
export const Settings: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Data');

  const renderContent = () => {
    switch (activeTab) {
      case 'Data':    return <DataSettings />;
      case 'Privacy': return <PrivacySettings onLogout={onLogout} />;
      case 'Access':  return <AccessSettings />;
      case 'Terms':   return <TermsSettings />;
      default:        return <DataSettings />;
    }
  };

  const TabButton: React.FC<{ tabName: SettingsTab }> = ({ tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
        activeTab === tabName
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Hand-drawn SVG hero — shares the cross-tab HeroVariants visual style. */}
      <div className="relative">
        <ProfileCampfire />
        <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
          <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
            Your Space
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
            Profile
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+8rem)] md:pb-8">
        {/* overflow-x-auto keeps 4 tabs scrollable on narrow phones rather than wrapping. */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
          <TabButton tabName="Data" />
          <TabButton tabName="Privacy" />
          <TabButton tabName="Access" />
          <TabButton tabName="Terms" />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
