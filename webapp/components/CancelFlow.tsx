import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface CancelFlowProps {
  stripeSubscriptionId: string;
  userEmail: string;
  onClose: () => void;
  /** Called with the period-end ISO string after Stripe confirms the cancel */
  onConfirmCancel: (periodEnd: string | null) => void;
}

export const CancelFlow: React.FC<CancelFlowProps> = ({
  stripeSubscriptionId,
  userEmail,
  onClose,
  onConfirmCancel,
}) => {
  const [step, setStep] = useState(1);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const cancellationReasons = [
    'I feel lazy to practice',
    'I regret spending money on myself',
    'Nothing will help me anymore',
  ];

  // ── Step 4: final cancel — calls real Stripe API ────────────────────────
  const handleFinalCancel = async () => {
    setCancelling(true);
    setCancelError('');

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripe_subscription_id: stripeSubscriptionId,
          userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCancelError(data.error || 'Failed to cancel subscription. Please try again.');
        setCancelling(false);
        return;
      }

      // Convert Unix timestamp to ISO string for the parent to display
      const periodEndIso = data.current_period_end
        ? new Date(data.current_period_end * 1000).toISOString()
        : null;

      onConfirmCancel(periodEndIso);
      setStep(5);
    } catch {
      setCancelError('Network error. Please try again.');
      setCancelling(false);
    }
  };

  const steps = [
    // Step 1
    {
      title: 'Wait,',
      content: [
        'Do you really want to cancel your subscription?',
        "You've just started.",
        'To truly change yourself and restore your energy, you need at least 1 more month.',
        'Everything you need to regain control is already here.',
      ],
      primaryBtn: { text: "Yes, I'm staying!", action: onClose },
      secondaryBtn: { text: "No, I'm leaving", action: () => setStep(2) },
    },
    // Step 2
    {
      title: 'We will save your progress and access if you decide to stay.',
      content: [
        "This will allow you not to lose your results and finish what you've started.",
        'Plus a gift for you - Guide "XXX" for free',
      ],
      primaryBtn: { text: 'Stay free and receive the gift', action: onClose },
      secondaryBtn: { text: "No, I'm leaving", action: () => setStep(3) },
    },
    // Step 3
    {
      title: 'We have a special offer for you!',
      content: [
        "If you don't leave, we are ready to offer you a subscription at the lowest price at $XX per month, so you can try again.",
      ],
      primaryBtn: { text: "I'm staying with the discount!", action: onClose },
      secondaryBtn: { text: 'No, continue cancellation', action: () => setStep(4) },
    },
    // Step 4 — final confirm, wired to real API
    {
      title: "We understand that life can be unpredictable, and maybe this isn't the best moment.",
      content: [
        "But think about it as you've already started your transformation journey, and we wouldn't want you to stop now.",
        "If there's something you didn't like, we'd be happy to help improve your experience.",
      ],
      primaryBtn: { text: 'Keep my subscription', action: onClose },
      secondaryBtn: { text: cancelling ? 'Cancelling…' : 'Yes, cancel subscription', action: handleFinalCancel, disabled: cancelling },
    },
    // Step 5 — confirmation after successful cancel
    {
      title: 'Subscription cancelled.',
      content: [
        'We truly appreciate you being with us.',
        'You can always come back.',
      ],
      question: 'Why did you cancel your subscription?',
      primaryBtn: { text: 'Restore subscription for $24 per month', action: onClose },
    },
  ];

  const currentStep = steps[step - 1];

  return (
    // Tailwind v2 compatible overlay: use bg-opacity-* instead of slash syntax
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.6)' }}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-emerald-900 mb-4">{currentStep.title}</h2>
          <div className="space-y-2 text-gray-600 text-sm mb-6">
            {currentStep.content.map((line, i) => <p key={i}>{line}</p>)}
          </div>

          {/* Inline error shown only on Step 4 if the API call fails */}
          {cancelError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{cancelError}</p>
          )}

          {currentStep.question && (
            <div className="my-6 text-left">
              <p className="font-semibold text-sm text-gray-700 mb-3">{currentStep.question}</p>
              <div className="space-y-2">
                {cancellationReasons.map(reason => (
                  <label key={reason} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                    <input type="radio" name="cancellation-reason" className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                    <span className="ml-3 text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {/* Secondary button — destructive/leave action */}
            {'secondaryBtn' in currentStep && currentStep.secondaryBtn && (
              <button
                onClick={currentStep.secondaryBtn.action}
                disabled={('disabled' in currentStep.secondaryBtn) ? currentStep.secondaryBtn.disabled : false}
                className="w-full px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep.secondaryBtn.text}
              </button>
            )}
            {/* Primary button — uses existing Button component (known-working styles) */}
            <Button
              onClick={currentStep.primaryBtn.action}
              fullWidth
              className="py-2"
            >
              {currentStep.primaryBtn.text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
