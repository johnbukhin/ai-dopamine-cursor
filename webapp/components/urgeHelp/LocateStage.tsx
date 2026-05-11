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

/**
 * Stage 2 — Locate.
 *
 * The Pause bought time; Locate gives the urge a name. Naming the emotion
 * underneath the impulse activates the prefrontal cortex and weakens the
 * amygdala response (Lieberman 2007 — "affect labeling"). That's why this
 * stage is more than a picker: every feeling carries a one-line context
 * line so the user *understands* what they're feeling, not just labels it.
 *
 * The intensity slider rises as a bottom sheet (matching the lesson sheet
 * pattern from PlanLessonContent) the moment a feeling is picked. This
 * pulls the user's eye down to the next decision without crowding the
 * grid above. The sheet has a Close affordance so users can deselect and
 * pick a different feeling.
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

  // Live measurement of the sheet's rendered height. Drives the grid's
  // bottom padding so the last row of cards is always reachable above the
  // sheet — no magic numbers, no clipping when localized copy is longer.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

  useEffect(() => {
    if (!sheetVisible || !sheetRef.current) {
      setSheetHeight(0);
      return;
    }
    const node = sheetRef.current;
    // Read initial size synchronously, then re-read on any resize
    // (orientation change, on-screen keyboard, dynamic content).
    setSheetHeight(node.offsetHeight);
    const obs = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height ?? node.offsetHeight;
      setSheetHeight(h);
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, [sheetVisible]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

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

  return (
    <div className="flex-1 flex flex-col min-h-0 relative animate-in fade-in duration-300">
      {/* Scrollable feelings grid. Bottom padding tracks the live sheet
          height so the last row of cards is always reachable, regardless
          of localized copy or device chrome. Animation duration matches
          the sheet slide-up keyframe in index.css for synced motion. */}
      <div
        className="flex-1 overflow-y-auto transition-[padding] duration-[320ms]"
        style={{
          // +24px breathing room above the sheet edge; +32px when no sheet
          // for normal scroll bottom space.
          paddingBottom: sheetVisible ? sheetHeight + 24 : 32,
        }}
      >
        <div className="px-4 md:px-6 max-w-2xl mx-auto">
          <header className="text-center mt-6 md:mt-8 mb-6 md:mb-8">
            <p className="text-[10px] font-semibold text-rose-700/60 uppercase tracking-widest mb-2">
              Stage 2 of 4
            </p>
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

      {/* Bottom sheet — slides up from the bottom of the stage container.
          Anchored absolutely so it floats above the scrollable grid; mobile
          bottom-nav offset clears the fixed nav (h-4.5rem). */}
      {sheetVisible && (
        <div
          ref={sheetRef}
          className={`absolute inset-x-0 bottom-0 mx-auto max-w-2xl pointer-events-auto
                      ${sheetClosing ? 'animate-sheet-down' : 'animate-sheet-up'}`}
        >
          <div
            className="bg-white border-t border-rose-200 rounded-t-3xl shadow-2xl
                       px-4 md:px-6 pt-3"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
          >
            {/* Drag-handle visual cue (non-functional — just signals "sheet"). */}
            <div className="flex justify-center mb-2" aria-hidden="true">
              <div className="w-10 h-1.5 rounded-full bg-rose-200" />
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
                richer signal without blocking progress. */}
            <section
              aria-label="How intense is this urge"
              className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-4"
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
                className="w-full accent-rose-700"
                aria-label="Urge intensity from 1 to 10"
              />

              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-rose-700/50 mt-1">
                <span>Mild</span>
                <span
                  className={
                    intensity !== null
                      ? 'text-rose-800 text-base font-bold normal-case tracking-normal'
                      : ''
                  }
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
