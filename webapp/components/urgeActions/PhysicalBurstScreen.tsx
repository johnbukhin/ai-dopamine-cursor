import React, { useState } from 'react';
import { Dumbbell, Plus, RotateCcw } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

const TARGET = 20;

/** Encouragement messages keyed by count threshold. The thresholds are
 *  spaced so the user gets a fresh reinforcement every five reps without
 *  becoming noisy. */
const MILESTONES: { at: number; copy: string }[] = [
  { at: 5, copy: 'Your heart rate is climbing. Keep going.' },
  { at: 10, copy: 'Halfway there. The urge is burning off.' },
  { at: 15, copy: "Almost done. You're stronger than this." },
  { at: 20, copy: 'Done. Your body just used the urge instead of you.' },
];

/**
 * Physical burst — tap-to-count to 20 push-ups (or any equivalent burst).
 *
 * The tap-counter is the entire point: each tap is a deliberate beat the
 * user controls, which competes with the autopilot of the urge. We don't
 * bother with motion sensors — taps are accessible and unambiguous.
 *
 * The "Reset" button is intentional in case the user loses count or wants
 * a second round.
 */
export const PhysicalBurstScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [count, setCount] = useState(0);
  const reached = count >= TARGET;

  // Find the highest milestone at or below the current count for the
  // encouragement text. Default to the start prompt before any reps.
  const milestone =
    [...MILESTONES].reverse().find((m) => count >= m.at)?.copy ??
    'Tap each rep. Stand up first if you need to.';

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.physical_burst}
      icon={Dumbbell}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!reached}
      doneLabel={reached ? 'I burned it off' : `${count} / ${TARGET}`}
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        {/* Big tappable counter — the primary interaction. Sized so the
            user can tap it without looking after the first few reps. */}
        <button
          onClick={() => setCount((c) => Math.min(c + 1, TARGET))}
          disabled={reached}
          aria-label="Add one rep"
          className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center
                      shadow-xl transition-all active:scale-95
                      ${
                        reached
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-700 text-white hover:bg-rose-800'
                      }`}
        >
          <span className="text-7xl font-light tabular-nums leading-none">{count}</span>
          <span className="text-xs font-semibold uppercase tracking-widest mt-2 opacity-80">
            of {TARGET}
          </span>
          {!reached && (
            <span className="absolute bottom-6 inline-flex items-center gap-1 text-[11px] font-semibold opacity-80">
              <Plus size={12} />
              Tap to count
            </span>
          )}
        </button>

        <p className="mt-6 text-sm md:text-base text-rose-800 text-center max-w-xs font-medium">
          {milestone}
        </p>

        {count > 0 && (
          <button
            onClick={() => setCount(0)}
            className="mt-4 inline-flex items-center gap-1 text-xs text-rose-700/70 hover:text-rose-900 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </ActionScreenShell>
  );
};
