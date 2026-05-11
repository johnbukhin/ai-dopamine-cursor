import React, { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

/** A single 60-second reorientation window. Long enough to actually walk
 *  to another room and breathe; short enough that the user doesn't feel
 *  trapped on the screen. */
const TOTAL_SECONDS = 60;

/**
 * Leave the Room — 60-second reorient.
 *
 * Just enough structure to get the user up and moving. The screen shows a
 * calm gradient, a slow countdown, and a single line of breath guidance.
 * The point isn't the timer — the point is that the user is no longer in
 * the trigger room. The timer just gives them permission to do nothing
 * for a minute while their nervous system catches up.
 */
export const LeaveRoomScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const done = secondsLeft <= 0;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [done]);

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.leave_room}
      icon={Footprints}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!done}
      doneLabel={done ? "I'm in a new space" : `${secondsLeft}s — keep walking`}
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
        <p className="text-base md:text-lg text-rose-900 font-medium text-center max-w-sm">
          Stand up and walk to a different room. Any room. Bathroom, kitchen, balcony.
        </p>

        {/* Calm pulsing dot — visual cue to slow breath while walking. */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-rose-300/40 animate-ping"
          />
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-full bg-rose-200/60"
          />
          <span className="relative text-5xl font-light text-rose-900 tabular-nums">
            {secondsLeft > 0 ? secondsLeft : '✓'}
          </span>
        </div>

        <p className="text-sm text-rose-700/70 text-center max-w-xs">
          {done
            ? 'You changed your environment. The pattern just broke.'
            : 'Slow breath in. Slow breath out. Keep moving.'}
        </p>
      </div>
    </ActionScreenShell>
  );
};
