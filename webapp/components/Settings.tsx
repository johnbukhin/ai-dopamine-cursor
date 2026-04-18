import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { CancelFlow } from './CancelFlow';
import { Button } from './Button';

type SettingsTab = 'Profile' | 'Access' | 'Terms';

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

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------
const ProfileSettings: React.FC = () => {
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="Repeat password"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{errorMsg}</p>
        )}
        {status === 'success' && (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">Password updated successfully.</p>
        )}

        <button
          type="submit"
          disabled={status === 'saving' || !password}
          style={{ backgroundColor: '#065f46', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: (status === 'saving' || !password) ? 'not-allowed' : 'pointer', opacity: (status === 'saving' || !password) ? 0.5 : 1 }}
        >
          {status === 'saving' ? 'Saving…' : 'Save Password'}
        </button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Access tab
// ---------------------------------------------------------------------------
const AccessSettings: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelledUntil, setCancelledUntil] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return; }

      // Get current user's email to query their subscription row
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) { setLoading(false); return; }

      setUserEmail(email);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, plan_label, amount_paid, currency, paid_at, current_period_end, cancel_at_period_end')
        .eq('user_email', email)
        .order('paid_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setSubscription(data as Subscription);
        // If already scheduled for cancellation, pre-populate the cancelled state
        if (data.cancel_at_period_end) {
          setCancelledUntil(data.current_period_end);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleCancelConfirmed = (periodEnd: string | null) => {
    setCancelledUntil(periodEnd || subscription?.current_period_end || null);
    setSubscription(prev => prev ? { ...prev, cancel_at_period_end: true } : prev);
  };

  const handleRenew = async () => {
    if (!subscription) return;
    setRenewing(true);
    setRenewError('');
    try {
      const response = await fetch('/api/renew-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe_subscription_id: subscription.stripe_subscription_id, userEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRenewError(data.error || 'Failed to renew subscription. Please try again.');
      } else {
        setCancelledUntil(null);
        setSubscription(prev => prev ? { ...prev, cancel_at_period_end: false } : prev);
      }
    } catch {
      setRenewError('Network error. Please try again.');
    }
    setRenewing(false);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
        <p className="text-sm text-gray-500">Loading subscription…</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
        <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">No active subscription found.</p>
          <p className="text-xs text-gray-400 mt-1">
            If you recently purchased, it may take a moment to appear.
          </p>
        </div>
      </div>
    );
  }

  const isCancelled = subscription.cancel_at_period_end || !!cancelledUntil;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Current membership</h3>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isCancelled ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              {isCancelled ? 'Cancels at period end' : 'Active'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p className="font-medium text-gray-700">Membership type</p>
              <p>{subscription.plan_label || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Begin date</p>
              <p>{formatDate(subscription.paid_at)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Amount paid</p>
              <p>{formatAmount(subscription.amount_paid, subscription.currency)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">
                {isCancelled ? 'Access until' : 'Renews on'}
              </p>
              <p>{formatDate(cancelledUntil || subscription.current_period_end)}</p>
            </div>
          </div>

          <div className="mt-6">
            {isCancelled ? (
              <div>
                <p className="text-sm text-amber-700 mb-4">
                  Your subscription has been cancelled. You have access until{' '}
                  <strong>{formatDate(cancelledUntil || subscription.current_period_end)}</strong>.
                </p>
                {renewError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-3">{renewError}</p>
                )}
                <button
                  onClick={handleRenew}
                  disabled={renewing}
                  style={{ backgroundColor: '#065f46', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: renewing ? 'not-allowed' : 'pointer', opacity: renewing ? 0.5 : 1, display: 'inline-block' }}
                >
                  {renewing ? 'Renewing…' : 'Renew Subscription'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelFlow(true)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Membership
              </button>
            )}
          </div>
        </div>
      </div>

      {showCancelFlow && (
        <CancelFlow
          stripeSubscriptionId={subscription.stripe_subscription_id}
          userEmail={userEmail}
          onClose={() => setShowCancelFlow(false)}
          onConfirmCancel={handleCancelConfirmed}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Terms tab
// ---------------------------------------------------------------------------
const TermsSettings: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Terms</h2>
    <p className="text-sm text-gray-500">Legal documents are in preparation and will be published here shortly.</p>
  </div>
);

// ---------------------------------------------------------------------------
// Settings shell
// ---------------------------------------------------------------------------
export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile': return <ProfileSettings />;
      case 'Access':  return <AccessSettings />;
      case 'Terms':   return <TermsSettings />;
      default:        return <ProfileSettings />;
    }
  };

  const TabButton: React.FC<{ tabName: SettingsTab }> = ({ tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeTab === tabName
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex space-x-4 border-b border-gray-200 mb-6 flex-shrink-0">
          <TabButton tabName="Profile" />
          <TabButton tabName="Access" />
          <TabButton tabName="Terms" />
        </div>
        <div className="flex-1 overflow-y-auto pb-16">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
