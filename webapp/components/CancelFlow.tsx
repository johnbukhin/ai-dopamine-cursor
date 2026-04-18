import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface CancelFlowProps {
  stripeSubscriptionId: string;
  userEmail: string;
  onClose: () => void;
  onConfirmCancel: (periodEnd: string | null) => void;
}

export const CancelFlow: React.FC<CancelFlowProps> = ({
  stripeSubscriptionId,
  userEmail,
  onClose,
  onConfirmCancel,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleCancel = async () => {
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

      const periodEndIso = data.current_period_end
        ? new Date(data.current_period_end * 1000).toISOString()
        : null;

      onConfirmCancel(periodEndIso);
      setConfirmed(true);
    } catch {
      setCancelError('Network error. Please try again.');
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,25,23,0.6)' }}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X />
        </button>

        {confirmed ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Subscription cancelled.</h2>
            <div className="space-y-2 text-gray-600 text-sm mb-6">
              <p>We truly appreciate you being with us.</p>
              <p>You can always come back.</p>
            </div>
            <Button onClick={onClose} fullWidth className="py-2">Close</Button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">
              Are you sure you want to cancel?
            </h2>
            <div className="space-y-2 text-gray-600 text-sm mb-6">
              <p>You've already started your transformation journey — we wouldn't want you to stop now.</p>
              <p>You'll keep access until the end of your current billing period.</p>
            </div>

            {cancelError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{cancelError}</p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling…' : 'Yes, cancel subscription'}
              </button>
              <Button onClick={onClose} fullWidth className="py-2">
                Keep my subscription
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
