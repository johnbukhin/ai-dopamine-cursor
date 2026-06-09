import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { FeelingId } from '../../types';
import { FEELINGS } from '../../data/urgeData';

interface LocateStageProps {
  /** Pre-fills the picker if the user came back from a later stage. */
  initialFeeling?: FeelingId | null;
  /** Receives the selected feeling and (optionally) an intensity 1–10. */
  onComplete: (feeling: FeelingId, intensity: number | null) => void;
}

/** Exit animation duration — must match `.animate-sheet-down` in index.css. */
const SHEET_EXIT_MS = 240;

/** Smooth HSL transition duration for intensity-driven shading. */
const TONE_TRANSITION = 'background-color 300ms ease, border-color 300ms ease, color 300ms ease, accent-color 300ms ease';

/** A single HSL anchor — `[hue, saturation%, lightness%]`. */
type HSLAnchor = readonly [number, number, number];

/** Linearly interpolate a single tone (3 anchors: v=1, v=5, v=10) for any
 *  integer intensity v ∈ [1, 10]. v=5 reproduces today's baseline colour
 *  exactly so the sheet's "untouched" look matches the slider default. */
function interpolateHSL(v: number, a: HSLAnchor, b: HSLAnchor, c: HSLAnchor): string {
  const t = v <= 5 ? (v - 1) / 4 : (v - 5) / 5;
  const [from, to] = v <= 5 ? [a, b] : [b, c];
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return `hsl(${lerp(from[0], to[0]).toFixed(1)}, ${lerp(from[1], to[1]).toFixed(1)}%, ${lerp(from[2], to[2]).toFixed(1)}%)`;
}

/** Map intensity 1–10 (or null → 5) to the rose-family tones that modulate
 *  the Locate sheet's interior. Hue stays in the rose band; only lightness
 *  and saturation shift, so the sheet always reads as rose-themed but visibly
 *  deepens with intensity. v=5 anchors reproduce today's Tailwind rose-* shades
 *  (rose-50, rose-100, rose-200, rose-700, rose-800) so the baseline is
 *  identical pre- and post-touch.
 *
 *  IMPORTANT: every tone's 3 hue anchors stay within the narrow 345°–356°
 *  band — `interpolateHSL` does plain linear lerp, NOT shortest-arc, so any
 *  anchor pair that crosses 0°/360° would visibly sweep through yellow →
 *  green → blue → purple before landing on rose. Keep all three values close. */
function intensityTones(intensity: number | null) {
  const v = intensity ?? 5;
  return {
    cardBg:       interpolateHSL(v, [355, 100, 99], [355, 100, 97], [355, 90, 92]),
    cardBorder:   interpolateHSL(v, [356, 100, 97], [356, 100, 95], [355, 96, 85]),
    handle:       interpolateHSL(v, [355, 96, 94],  [355, 96, 89],  [355, 90, 80]),
    sliderAccent: interpolateHSL(v, [347, 70, 60],  [347, 83, 41],  [345, 90, 30]),
    numberColor:  interpolateHSL(v, [345, 70, 50],  [345, 82, 35],  [345, 90, 22]),
  };
}

/**
 * Stage 2 — Locate.
 *
 * The Pause bought time; Locate gives the urge a name. Naming the emotion
 * underneath the impulse activates the prefrontal cortex and weakens the
 * amygdala response (Lieberman 2007 — "affect labeling"). That's why this
 * stage is more than a picker: every feeling carries a one-line context
 * line so the user *understands* what they're feeling, not just labels it.
 *
 * Once a feeling is picked, the intensity slider rises in a modal bottom
 * sheet (same pattern as LessonBottomSheet: backdrop dim + blur, click-
 * outside-to-dismiss, body scroll lock). The dimmed backdrop creates a
 * clear focus shift away from the feelings grid; the X button or backdrop
 * tap deselects so the user can pick a different feeling.
 */
export const LocateStage: React.FC<LocateStageProps> = ({ initialFeeling, onComplete }) => {
  const [selected, setSelected] = useState<FeelingId | null>(initialFeeling ?? null);
  const [intensity, setIntensity] = useState<number | null>(null);

  // Sheet animation lifecycle. `sheetVisible` is true whenever a feeling is
  // selected; `sheetClosing` flips during the slide-down exit anim so we can
  // unmount only after it finishes (mirrors LessonBottomSheet timing).
  const sheetVisible = selected !== null;
  const [sheetClosing, setSheetClosing] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  // Body scroll lock while the modal sheet is open — matches the standard
  // modal pattern used by LessonBottomSheet / DailyCheckIn so the page
  // beneath the dimmed backdrop doesn't scroll under the user's finger.
  useEffect(() => {
    if (!sheetVisible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [sheetVisible]);

  // Escape dismisses the modal on desktop — WAI-ARIA dialog contract.
  // Listener is bound only while the sheet is open.
  useEffect(() => {
    if (!sheetVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deselect();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetVisible]);

  /** Deselect with a slide-down — used by the close affordance and by
   *  tapping the same feeling twice. Holds the closing state for one
   *  animation tick before clearing the selection. */
  const deselect = () => {
    if (sheetClosing) return;
    setSheetClosing(true);
    exitTimerRef.current = window.setTimeout(() => {
      setSheetClosing(false);
      setSelected(null);
      setIntensity(null);
      exitTimerRef.current = null;
    }, SHEET_EXIT_MS);
  };

  const handleFeelingClick = (id: FeelingId) => {
    if (id === selected) {
      deselect();
      return;
    }
    // Cancel any in-flight close animation. Without this, an exit timer
    // scheduled by a previous deselect would fire after we set the new
    // selection and clobber it back to null mid-animation.
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
      setSheetClosing(false);
    }
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    onComplete(selected, intensity);
  };

  // Intensity-driven shading for the sheet interior. Recomputed every render
  // — the math is trivial (10 linear interpolations) and the alternative
  // (useMemo) would add boilerplate without measurable benefit.
  const tones = intensityTones(intensity);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative animate-in fade-in duration-300">
      {/* Scrollable feelings grid. Padding is static now that the sheet is
          a fixed-overlay modal (no longer in-flow), so the grid no longer
          needs to react to the sheet's rendered height. */}
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="px-4 md:px-6 max-w-2xl mx-auto">
          <header className="text-center mt-12 md:mt-14 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-rose-900 mb-2">
              What are you feeling?
            </h2>
            <p className="text-sm md:text-base text-rose-700/80 max-w-md mx-auto">
              Naming the feeling underneath the urge is half the work.
            </p>
          </header>

          {/* Two-column tile grid on mobile and desktop. Tiles are tall enough
              to fit the title + a two-line context without truncation, and each
              tile is a generous tap target (≥ 88px tall). */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {FEELINGS.map((f, i) => {
              const isSelected = selected === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFeelingClick(f.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all
                              animate-in fade-in slide-in-from-bottom-2 duration-300
                              ${
                                isSelected
                                  ? 'bg-rose-100 border-rose-500 shadow-md'
                                  : 'bg-white border-rose-100 hover:border-rose-300 hover:shadow-sm'
                              }`}
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}
                  aria-pressed={isSelected}
                >
                  <div className="font-semibold text-rose-900 mb-1">{f.label}</div>
                  <p className="text-xs md:text-sm text-rose-700/70 leading-snug">{f.context}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal bottom sheet — same overlay pattern as LessonBottomSheet:
          fixed full-screen container, dimmed/blurred backdrop on a separate
          element (so its fade timing is independent of the sheet's slide),
          click-outside-to-dismiss, sheet anchored to the bottom on mobile
          and centered on desktop. */}
      {sheetVisible && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Set the intensity of the feeling"
        >
          <div
            className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm ${
              sheetClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
            }`}
            onClick={deselect}
          />

          <div
            className={`absolute inset-x-0 bottom-0 mx-auto max-w-2xl
                        bg-white border-t border-rose-200 rounded-t-3xl shadow-2xl
                        px-4 md:px-6 pt-3
                        ${sheetClosing ? 'animate-sheet-down' : 'animate-sheet-up'}`}
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            {/* Drag-handle visual cue (non-functional — just signals "sheet").
                Tone shifts with intensity. */}
            <div className="flex justify-center mb-2" aria-hidden="true">
              <div
                className="w-10 h-1.5 rounded-full"
                style={{ backgroundColor: tones.handle, transition: TONE_TRANSITION }}
              />
            </div>

            {/* Header row with selected feeling + close-to-deselect button. */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700/60">
                  You picked
                </p>
                <p className="text-base font-semibold text-rose-900">
                  {FEELINGS.find((f) => f.id === selected)?.label}
                </p>
              </div>
              <button
                onClick={deselect}
                aria-label="Choose a different feeling"
                className="p-2 rounded-full text-rose-700/70 hover:bg-rose-100 hover:text-rose-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Intensity slider — the optional input that gives the log
                richer signal without blocking progress. Card background +
                border + slider accent + value number shift in rose tone as
                intensity changes; sheet outer chrome stays constant so the
                modulation reads as interior depth, not a wholesale repaint. */}
            <section
              aria-label="How intense is this urge"
              className="border rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: tones.cardBg,
                borderColor: tones.cardBorder,
                transition: TONE_TRANSITION,
              }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold text-rose-900">How strong is it?</h3>
                <span className="text-xs text-rose-700/60">Optional · 1–10</span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={intensity ?? 5}
                onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                className="w-full"
                style={{ accentColor: tones.sliderAccent, transition: TONE_TRANSITION }}
                aria-label="Urge intensity from 1 to 10"
              />

              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-rose-700/50 mt-1">
                <span>Mild</span>
                {/* Always rendered at the larger weight so the sheet height
                    is identical before and after the first slider touch —
                    only the content swaps (`·` placeholder ↔ number). Colour
                    also tracks intensity so null → 5 → 10 transitions are
                    smooth in both dimensions. */}
                <span
                  className="text-base font-bold normal-case tracking-normal"
                  style={{ color: tones.numberColor, transition: TONE_TRANSITION }}
                >
                  {intensity !== null ? intensity : '·'}
                </span>
                <span>Crushing</span>
              </div>
            </section>

            {/* Full-width primary CTA — sits flush with the sheet to feel
                like the natural next step. */}
            <button
              onClick={handleContinue}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3
                         bg-rose-700 text-white rounded-xl font-semibold text-sm shadow-md
                         hover:bg-rose-800 active:scale-[0.99] transition-all"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
