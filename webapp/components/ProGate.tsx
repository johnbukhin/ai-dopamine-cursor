import React, { useState } from 'react';
import { Lock, Sparkles, CheckCircle } from 'lucide-react';
import { CoachLighthouse, HelpTree } from './HeroVariants';

interface ProGateProps {
  featureName: string;
  featureDescription: string;
  userEmail: string;
  onUnlocked: () => void;
}

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Europe/London') return 'gbp';
    if (tz.startsWith('Australia/')) return 'aud';
    if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns)/.test(tz)) return 'cad';
    if (tz.startsWith('America/')) return 'usd';
    return 'eur';
  } catch {
    return 'eur';
  }
}

const UPSELL_API = 'https://ai-dopamine-addict.vercel.app/api/create-upsell';

export const ProGate: React.FC<ProGateProps> = ({ featureName, featureDescription, userEmail, onUnlocked }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpgrade = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(UPSELL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, currency: detectCurrency() }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTimeout(onUnlocked, 1500);
      } else {
        setStatus('error');
        if (data.reason === 'no_pm') {
          setErrorMsg('No saved payment method found. Please contact support.');
        } else if (data.reason === 'customer_not_found') {
          setErrorMsg('Account not found. Please contact support.');
        } else {
          setErrorMsg('Upgrade failed. Please try again or contact support.');
        }
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
        <h2 className="text-xl font-bold text-purple-900 mb-2">Unlocked!</h2>
        <p className="text-gray-500 text-sm">Welcome to {featureName}. Loading…</p>
      </div>
    );
  }

  // Show the corresponding hero illustration at 50 % opacity so the user gets
  // a preview of what's behind the paywall — same position and proportions as
  // the unlocked tab, just faded to read as "locked". Explicit map so adding
  // a third PRO feature doesn't silently inherit the wrong illustration.
  const HERO_BY_FEATURE: Record<string, React.FC> = {
    'AI Coach': CoachLighthouse,
    'Urge Help': HelpTree,
  };
  const Hero = HERO_BY_FEATURE[featureName];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto relative">
      {/* Faded hero behind the lock — anchored to the top in the same
          position as the unlocked tab. The content stays vertically
          centered (z-10) so it sits on top of the illustration. */}
      {Hero && (
        <div className="absolute top-0 left-0 right-0 opacity-40 grayscale pointer-events-none">
          <Hero />
        </div>
      )}
      <div className="max-w-sm w-full relative z-10">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center mx-auto">
            <Lock className="text-purple-700" size={36} />
          </div>
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
            PRO
          </span>
        </div>

        <h2 className="text-xl font-bold text-purple-900 mb-2">{featureName}</h2>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">{featureDescription}</p>

        <div className="bg-purple-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={12} />
            AI Companion includes
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5 flex-shrink-0">✓</span>
              <span>AI Coach — personalized recovery coaching on demand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5 flex-shrink-0">✓</span>
              <span>Urge Help — immediate support during cravings</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={status === 'loading'}
          className="w-full py-3.5 rounded-2xl font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {status === 'loading' ? 'Processing…' : 'Upgrade to AI Companion'}
        </button>

        {status === 'error' && (
          <p className="text-red-500 text-sm mt-3">{errorMsg}</p>
        )}

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Uses your saved payment method. First month at intro price, then regular rate.
          Cancel anytime.
        </p>
      </div>
    </div>
  );
};
