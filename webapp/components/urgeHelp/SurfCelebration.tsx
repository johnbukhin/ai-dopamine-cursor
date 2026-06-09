import React, { useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface SurfCelebrationProps {
  /** Total surfs on record after the just-completed one. */
  total: number;
  /** Auto-fires after the celebration duration so the orchestrator can
   *  reset back to the Pause stage. */
  onDone: () => void;
}

/** Total time the celebration is on screen (ms). Matches the
 *  `sparkle-float` keyframe duration in `index.css` so the sparkles
 *  complete their full lifecycle (entrance → drift → exit) before the
 *  orchestrator resets to Pause. */
const VISIBLE_MS = 5000;

/**
 * Celebrates a completed urge surf. Distinct from the Dashboard streak
 * celebration: this is a quieter overlay since urges happen often and we
 * don't want to over-celebrate one of many. Sparkles, not confetti — but
 * the sparkles drift gently around their starting point over the 5s
 * lifecycle so the screen feels alive rather than static.
 */
export const SurfCelebration: React.FC<SurfCelebrationProps> = ({ total, onDone }) => {
  // Pre-generate sparkle positions + drift vectors so re-renders don't
  // reshuffle them mid-animation. Each sparkle gets its own random target
  // offset (--tx/--ty) and rotation amount (--rot); the shared CSS
  // keyframe `sparkle-float` reads them via custom properties.
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 10 + Math.random() * 80,
        size: 12 + Math.random() * 14,
        // Drift vector — modest range so sparkles look like they're floating,
        // not flung. Signed so half drift up-left, half drift down-right, etc.
        tx: (Math.random() - 0.5) * 60,   // ±30px
        ty: (Math.random() - 0.5) * 60,   // ±30px
        rot: (Math.random() - 0.5) * 90,  // ±45deg
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
      {/* Decorative sparkle field — single keyframe, per-particle randomness
          supplied via CSS custom properties on the inline style. */}
      {sparkles.map((s) => (
        <Sparkles
          key={s.id}
          size={s.size}
          aria-hidden="true"
          className="absolute text-rose-500 animate-sparkle-float"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            // Custom props consumed by the `sparkle-float` keyframe.
            // React's CSSProperties type doesn't model these natively.
            ['--tx' as any]: `${s.tx}px`,
            ['--ty' as any]: `${s.ty}px`,
            ['--rot' as any]: `${s.rot}deg`,
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
