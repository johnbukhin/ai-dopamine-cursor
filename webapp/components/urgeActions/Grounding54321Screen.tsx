import React, { useEffect, useRef, useState } from 'react';
import { Eye, Hand, Ear, Wind, Coffee, Check, Sparkles } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

/** Auto-advance delay once all 15 dots are checked. Long enough that the
 *  user can register the completion banner; short enough that they don't
 *  feel stranded. */
const AUTO_ADVANCE_MS = 1400;

const SENSES = [
  { count: 5, sense: 'see', icon: Eye, prompt: 'Name 5 things you can see.' },
  { count: 4, sense: 'feel', icon: Hand, prompt: 'Name 4 things you can feel.' },
  { count: 3, sense: 'hear', icon: Ear, prompt: 'Name 3 things you can hear.' },
  { count: 2, sense: 'smell', icon: Wind, prompt: 'Name 2 things you can smell.' },
  { count: 1, sense: 'taste', icon: Coffee, prompt: 'Name 1 thing you can taste.' },
] as const;

/**
 * 5-4-3-2-1 sensory grounding.
 *
 * Walks the user through the five senses in descending count. Each sense
 * is its own card; tapping the card reveals checkboxes equal to the
 * required count, and the user marks each thing they notice. The next
 * sense unlocks once all checkboxes for the current sense are filled.
 *
 * We don't ask for text input — checkboxes are enough and don't make the
 * user fight a keyboard during a crisis. The act of looking around and
 * mentally naming each item is what does the work.
 */
export const Grounding54321Screen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  // checks[i] is the number of items the user has marked for sense i.
  const [checks, setChecks] = useState<number[]>(SENSES.map(() => 0));
  const [activeIdx, setActiveIdx] = useState(0);

  // Holds the auto-advance timeout so we can cancel it if the user
  // unmounts the screen mid-pause (e.g. taps Back during the 250ms window).
  const advanceTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const allDone = SENSES.every((s, i) => checks[i] >= s.count);

  // Ref on the completion banner so we can scrollIntoView once it mounts —
  // the senses list is tall enough that the footer Done button can land
  // off-screen, leaving the user stuck staring at the last filled card.
  const doneBannerRef = useRef<HTMLDivElement | null>(null);
  // Holds the auto-advance-to-Reflect timeout so the user gets a brief
  // moment to register completion before the screen exits on its own.
  const autoDoneTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!allDone) return;
    // Bring the celebration into view first…
    doneBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // …then auto-fire onDone, mirroring the auto-completion behaviour of
    // the other timed/visual action screens (BoxBreathing, PhysicalBurst).
    autoDoneTimerRef.current = window.setTimeout(() => {
      autoDoneTimerRef.current = null;
      onDone();
    }, AUTO_ADVANCE_MS);
    return () => {
      if (autoDoneTimerRef.current !== null) {
        window.clearTimeout(autoDoneTimerRef.current);
        autoDoneTimerRef.current = null;
      }
    };
  }, [allDone, onDone]);

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.grounding_54321}
      icon={Eye}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!allDone}
      doneLabel={allDone ? "I'm back here" : `${SENSES.reduce((sum, s, i) => sum + Math.min(checks[i], s.count), 0)} / 15`}
    >
      <div className="max-w-md mx-auto">
      <ol className="space-y-3" aria-label="Grounding senses">
        {SENSES.map((s, i) => {
          const Icon = s.icon;
          const count = checks[i];
          const isActive = i === activeIdx;
          const isComplete = count >= s.count;
          // Whole-card tap is enabled only on the active, not-yet-complete
          // card. Once complete (or for inactive cards), taps are inert so
          // the user can't keep firing increments while waiting for the
          // 250ms auto-advance to next sense.
          const cardTappable = isActive && !isComplete;

          /** Bump the count for this sense by 1, wired to both the card-
           *  level tap and the legacy keyboard-Enter path. */
          const bump = () => {
            if (!cardTappable) return;
            const next = [...checks];
            next[i] = Math.min(next[i] + 1, s.count);
            setChecks(next);
            if (next[i] >= s.count && i < SENSES.length - 1) {
              if (advanceTimerRef.current !== null) {
                window.clearTimeout(advanceTimerRef.current);
              }
              advanceTimerRef.current = window.setTimeout(() => {
                advanceTimerRef.current = null;
                setActiveIdx(i + 1);
              }, 250);
            }
          };

          return (
            <li key={s.sense}>
              <div
                role={cardTappable ? 'button' : undefined}
                tabIndex={cardTappable ? 0 : undefined}
                onClick={bump}
                onKeyDown={(e) => {
                  if (!cardTappable) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    bump();
                  }
                }}
                aria-label={cardTappable ? `${s.prompt} Tap to count one.` : undefined}
                className={`p-4 rounded-2xl border-2 transition-all select-none
                            ${
                              isActive
                                ? 'bg-white border-rose-500 shadow-md'
                                : isComplete
                                  ? 'bg-rose-50 border-rose-200'
                                  : 'bg-white border-rose-100 opacity-50'
                            }
                            ${cardTappable ? 'cursor-pointer active:scale-[0.99] active:bg-rose-50' : ''}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center
                                ${isComplete ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-700'}`}
                  >
                    {isComplete ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-900">{s.prompt}</p>
                    {cardTappable && (
                      <p className="text-[11px] text-rose-700/60 mt-0.5">
                        Tap anywhere on this card to count one.
                      </p>
                    )}
                  </div>
                </div>

                {/* Visual count indicator — pure indicator, NOT interactive
                    (taps go through the wrapping card). Avoids nested
                    interactive elements and keeps the tap target huge. */}
                <div className="flex gap-2 pl-12" aria-hidden="true">
                  {Array.from({ length: s.count }).map((_, j) => {
                    const filled = j < count;
                    return (
                      <span
                        key={j}
                        className={`w-6 h-6 rounded-full border-2 transition-all
                                    ${
                                      filled
                                        ? 'bg-rose-700 border-rose-700'
                                        : isActive
                                          ? 'bg-white border-rose-400'
                                          : 'bg-stone-100 border-stone-200'
                                    }`}
                      />
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Completion banner — appears once all 15 dots are filled, auto-
          scrolls into view, and the screen auto-exits to Reflect a beat
          later so the user never has to hunt for a Done button at the
          bottom of a long list. */}
      {allDone && (
        <div
          ref={doneBannerRef}
          role="status"
          aria-live="polite"
          className="mt-4 p-5 rounded-2xl bg-rose-700 text-white text-center
                     shadow-md animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} />
            <p className="font-bold text-base md:text-lg">You're back in the room.</p>
          </div>
          <p className="text-xs text-rose-100">
            Nice grounding. Wrapping up…
          </p>
        </div>
      )}
      </div>
    </ActionScreenShell>
  );
};
