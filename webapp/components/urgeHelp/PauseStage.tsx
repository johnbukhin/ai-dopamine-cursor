import React, { useEffect, useState } from 'react';

interface PauseStageProps {
  /** Called when the timer hits zero OR the user taps the skip button. */
  onComplete: () => void;
}

/** Total Pause duration: 3 minutes per evidence-based "urge surfing" (Marlatt).
 *  Enough to weaken peak craving, short enough that the on-screen countdown
 *  never feels intimidating. */
const TOTAL_SECONDS = 180;

/** Geometry for the progress ring. Kept large on mobile (`w-72 h-72`) so the
 *  countdown reads from arm's length while the user is mid-crisis. */
const SIZE = 280;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Stage 1 — the Pause.
 *
 * The user lands here the moment they open the Help tab. The single goal is
 * to insert a 3-minute delay between impulse and action. The reframe copy
 * ("3 minutes is all your brain needs to weaken the urge") sells this as a
 * winnable amount of time, not a sentence.
 *
 * Auto-advances to Locate when the timer reaches zero. The user can also
 * tap "I'm grounded — skip" if they're already past the peak; it's a quiet
 * secondary button so it doesn't compete with the timer's calming presence.
 */
export const PauseStage: React.FC<PauseStageProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const id = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLeft, onComplete]);

  // Draw the progress ring as a fraction of completed time. `transition-all`
  // on the stroke gives the slow, calming sweep that mirrors a meditation
  // timer rather than a stopwatch.
  const strokeDashoffset =
    CIRCUMFERENCE - ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * CIRCUMFERENCE;

  // Format mm:ss; we want the user to read "2:43" not "163". The countdown
  // is the visual anchor of the screen so it has to be dead-simple to parse.
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 animate-in fade-in duration-500 relative">
      {/* Soft background illustration anchored at the top — same image as the
          legacy stage, kept because it matches the rose palette and reads as
          "calm" rather than "alarm". */}
      <div className="absolute top-0 left-0 right-0 h-64 md:h-80 z-0 overflow-hidden">
        <img
          src="/illustrations/urge.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover mix-blend-multiply opacity-40 scale-[1.4] origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/60 to-rose-50" />
      </div>

      <h2 className="text-xl md:text-2xl font-medium text-rose-900 mb-2 text-center max-w-md leading-relaxed relative z-10 mt-8">
        You don't need to decide right now.
      </h2>
      <p className="text-sm md:text-base text-rose-700/80 mb-8 md:mb-10 text-center max-w-md relative z-10">
        3 minutes is all your brain needs to weaken the urge.
      </p>

      <div className="relative w-72 h-72 mb-10 z-10">
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden="true"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            className="text-rose-200"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-rose-800 transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-6xl md:text-7xl font-light text-rose-900 tracking-tight tabular-nums">
            {display}
          </span>
          <span className="text-[10px] font-bold text-rose-800/40 uppercase tracking-widest mt-2">
            Breathe
          </span>
        </div>
      </div>

      <p className="text-stone-500 mb-8 font-medium text-sm md:text-base text-center max-w-xs">
        Urges rise and fall like waves. This one will too.
      </p>

      <button
        onClick={onComplete}
        className="px-6 py-3 bg-white border border-rose-200 text-rose-800 rounded-xl hover:bg-rose-50 transition-colors font-semibold text-sm tracking-wide shadow-sm"
      >
        I'm grounded — skip ahead
      </button>
    </div>
  );
};
