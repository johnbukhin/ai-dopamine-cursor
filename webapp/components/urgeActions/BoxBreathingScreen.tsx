import React, { useEffect, useState } from 'react';
import { Wind } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

const PHASES = [
  { name: 'Inhale', seconds: 4 },
  { name: 'Hold', seconds: 4 },
  { name: 'Exhale', seconds: 4 },
  { name: 'Hold', seconds: 4 },
] as const;

const TOTAL_CYCLES = 5;

/**
 * Box breathing — 4-4-4-4 inhale/hold/exhale/hold for 5 cycles.
 *
 * Animated breathing circle drives the pace: it expands during Inhale,
 * stays large during the first Hold, contracts during Exhale, stays small
 * during the second Hold. The user follows the circle with their breath
 * — no counting required, no app-juggling.
 */
export const BoxBreathingScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [cycle, setCycle] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [completed, setCompleted] = useState(false);

  // Tick down the seconds counter every 1s. Pure: only mutates secondsLeft.
  useEffect(() => {
    if (completed) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [completed]);

  // Watch for phase completion (secondsLeft reaching 0) and advance phase
  // and cycle from there. Splitting this off the tick effect avoids the
  // setState-inside-setState anti-pattern that misbehaves under React 18
  // StrictMode (updaters double-invoked surface side effects twice).
  useEffect(() => {
    if (completed || secondsLeft > 0) return;
    const nextPhase = (phaseIdx + 1) % PHASES.length;
    if (nextPhase === 0) {
      // Just wrapped a full cycle — either advance the cycle counter or
      // finish if we've hit the cap.
      if (cycle >= TOTAL_CYCLES) {
        setCompleted(true);
        return;
      }
      setCycle((c) => c + 1);
    }
    setPhaseIdx(nextPhase);
    setSecondsLeft(PHASES[nextPhase].seconds);
  }, [secondsLeft, phaseIdx, cycle, completed]);

  // Map phase to circle scale: large for Inhale and the hold after it; small
  // for Exhale and the hold after it. Tailwind doesn't do dynamic transform
  // values cleanly, so we drive the scale via inline style.
  const phaseName = PHASES[phaseIdx].name;
  const scale = phaseIdx === 0 || phaseIdx === 1 ? 1 : 0.55;
  const transitionDuration = phaseName === 'Hold' ? '0ms' : '4000ms';

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.box_breathing}
      icon={Wind}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!completed}
      doneLabel={completed ? "I'm calmer" : `Cycle ${cycle} of ${TOTAL_CYCLES}`}
    >
      <div className="flex flex-col items-center justify-center min-h-[55vh]">
        {/* Breathing circle — purely visual; the colour shifts with each
            phase to give an extra sensory cue beyond size alone. */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div
            aria-hidden="true"
            className="rounded-full bg-rose-300/40 ring-8 ring-rose-200/40"
            style={{
              width: '256px',
              height: '256px',
              transform: `scale(${scale})`,
              transition: `transform ${transitionDuration} ease-in-out`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-3xl md:text-4xl font-light text-rose-900 tracking-tight">
              {phaseName}
            </span>
            <span className="text-5xl md:text-6xl font-light text-rose-900 tabular-nums mt-2">
              {secondsLeft}
            </span>
          </div>
        </div>

        <p className="mt-8 text-sm text-rose-700/70 text-center max-w-xs">
          {completed
            ? 'Five cycles done. Notice how your shoulders feel.'
            : 'Match your breath to the circle.'}
        </p>
      </div>
    </ActionScreenShell>
  );
};
