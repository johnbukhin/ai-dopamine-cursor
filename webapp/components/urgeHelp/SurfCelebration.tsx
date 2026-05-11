import React, { useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface SurfCelebrationProps {
  /** Total surfs on record after the just-completed one. */
  total: number;
  /** Auto-fires after the celebration duration so the orchestrator can
   *  reset back to the Pause stage. */
  onDone: () => void;
}

/** Total time the celebration is on screen (ms). Long enough to read,
 *  short enough that the user doesn't wait around for the next surf. */
const VISIBLE_MS = 2400;

/**
 * Celebrates a completed urge surf. Distinct from the Dashboard streak
 * celebration: this is a quieter, faster overlay since urges happen often
 * and we don't want to over-celebrate one of many. Sparkles, not confetti.
 */
export const SurfCelebration: React.FC<SurfCelebrationProps> = ({ total, onDone }) => {
  // Pre-generate a few sparkle positions so re-renders don't reshuffle.
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 10 + Math.random() * 80,
        delay: Math.random() * 1.2,
        size: 12 + Math.random() * 14,
      })),
    [],
  );

  useEffect(() => {
    const id = window.setTimeout(onDone, VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-40 flex items-center justify-center bg-rose-50/95
                 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none"
    >
      {/* Decorative sparkle field */}
      {sparkles.map((s) => (
        <Sparkles
          key={s.id}
          size={s.size}
          aria-hidden="true"
          className="absolute text-rose-500 animate-in fade-in zoom-in-50 duration-700"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            animationFillMode: 'backwards',
          }}
        />
      ))}

      {/* Centered message */}
      <div className="relative text-center max-w-xs animate-in fade-in zoom-in-95 duration-500">
        <p className="text-3xl md:text-4xl font-bold text-rose-900 mb-2">
          You surfed it.
        </p>
        <p className="text-sm md:text-base text-rose-700">
          Surf #{total} on your record.
        </p>
      </div>
    </div>
  );
};
