import React, { useEffect, useState } from 'react';
import { PhoneOff } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

const TOTAL_SECONDS = 15 * 60;

/**
 * Phone Away — 15-minute soft timer.
 *
 * Browser apps cannot enforce a real lock, so this screen is built on
 * trust: it explains *why* distance from the device matters, sets a clear
 * 15-minute target, and gets out of the user's way. The Back button is
 * always available — we never trap users — but the copy reframes early
 * exit as costing them the whole point of the exercise.
 */
export const PhoneAwayScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const done = secondsLeft <= 0;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [done]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.phone_away}
      icon={PhoneOff}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!done}
      doneLabel={done ? 'I made it the full 15' : 'Put the phone down'}
    >
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6">
        <p className="text-base md:text-lg text-rose-900 font-medium text-center max-w-sm">
          Place this phone screen-down in a different room. Set it on a shelf, a fridge,
          anywhere out of arm's reach.
        </p>

        <div className="text-7xl md:text-8xl font-light text-rose-900 tabular-nums tracking-tight">
          {display}
        </div>

        <div className="text-center max-w-xs space-y-2">
          <p className="text-sm text-rose-700/80">
            {done
              ? "You made it the full 15. The urge has almost certainly passed by now."
              : 'Distance from the trigger device drops urge intensity faster than anything else on this list.'}
          </p>
          <p className="text-[11px] text-rose-700/50 italic">
            Back button is here if you really need it — but every minute counts.
          </p>
        </div>
      </div>
    </ActionScreenShell>
  );
};
