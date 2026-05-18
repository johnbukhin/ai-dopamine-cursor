import React, { useEffect, useState } from 'react';
import { HelpTree } from '../HeroVariants';

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
const SIZE = 266;
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
    <div className="flex-1 flex flex-col animate-in fade-in duration-500 min-h-0">
      {/* Hand-drawn SVG hero — flows at the top so it never overlaps the
          timer copy. The SVG's own bottom alpha mask blends into the rose-50
          page background, so no extra colour overlay is needed. */}
      <div className="relative flex-shrink-0">
        <HelpTree />
        <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
          <span className="text-xs md:text-sm font-bold text-rose-700/80 uppercase tracking-wider">
            Pause and breathe
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-rose-900 mt-1 drop-shadow-sm leading-tight whitespace-nowrap">
            3 minutes is enough
            <br />
            to weaken the urge
          </h2>
        </div>
      </div>

      {/* Content — centered in the remaining vertical space below the hero. */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 min-h-0">
        <div className="relative w-[17.1rem] h-[17.1rem] mb-10">
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

        <button
          onClick={onComplete}
          className="px-6 py-3 bg-white border border-rose-200 text-rose-800 rounded-xl hover:bg-rose-50 transition-colors font-semibold text-sm tracking-wide shadow-sm"
        >
          I'm grounded — skip ahead
        </button>

        <p className="mt-2 text-xs text-stone-400 text-center max-w-xs font-normal">
          Urges rise and fall like waves. This one will too.
        </p>
      </div>
    </div>
  );
};
