import React, { useEffect, useRef, useState } from 'react';
import { Film } from 'lucide-react';
import { ActionScreenShell } from './ActionScreenShell';
import { URGE_ACTION_BY_ID } from '../../data/urgeData';

interface ScreenProps {
  onDone: () => void;
  onBack: () => void;
}

/**
 * Five scenes, each with its own auto-advance window.
 *
 * Per-scene timing because the cognitive load varies: visualization-heavy
 * scenes (1, 2) and the deepest reflective question (4) need more breathing
 * room; the closing identity statement (5) lands fast. Total ~38s if the
 * user lets it run, but they can tap to skip ahead at any moment.
 */
const SCENES: { text: string; ms: number }[] = [
  { text: 'Imagine the morning after.', ms: 8000 },
  { text: 'How does your body feel? What do you see in the mirror?', ms: 8000 },
  { text: 'What did you trade away for those few minutes?', ms: 7000 },
  { text: 'What did you actually want underneath the urge?', ms: 9000 },
  { text: "This is who you're becoming, with every choice like this one.", ms: 6000 },
];

/** Delay before the "Tap when ready" hint appears on each scene. We don't
 *  want the hint to crowd the moment a scene first lands. */
const HINT_DELAY_MS = 3000;

/**
 * Play the Tape Forward — guided visualization with hybrid pacing.
 *
 * The exercise is a classic relapse-prevention technique: instead of
 * fighting the impulse head-on, you walk forward through the consequences
 * and notice the gap between the imagined dopamine and the real aftermath.
 *
 * Pacing is hybrid by design:
 *   - **Auto-advance** handles the default case — the user can just sit
 *     and let each scene wash over them. Per-scene durations give heavier
 *     scenes more room to land.
 *   - **Tap-to-skip** lets the engaged user move on the moment a scene
 *     lands. A subtle "Tap when ready" hint appears mid-scene so the
 *     option is discoverable without being loud.
 *
 * No back, no pause — every extra control is friction in a crisis.
 */
export const PlayTheTapeScreen: React.FC<ScreenProps> = ({ onDone, onBack }) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  /** Hint visibility per scene — flipped true after HINT_DELAY_MS so the
   *  cue doesn't appear at the same moment the scene does. */
  const [showHint, setShowHint] = useState(false);

  const isLast = sceneIdx === SCENES.length - 1;
  const advanceTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  /** Move to the next scene (auto or via tap). On the last scene this is a
   *  no-op — the user must use the shell's Done CTA to finish, which gives
   *  the closing identity line a clear "this is the wrap" feel. */
  const advance = () => {
    if (isLast) return;
    setSceneIdx((i) => i + 1);
  };

  useEffect(() => {
    // Reset the hint each time we land on a new scene, then schedule both
    // the hint and the auto-advance from this same effect so they stay in
    // sync (and a single cleanup tears both down on unmount or skip).
    setShowHint(false);

    hintTimerRef.current = window.setTimeout(() => {
      hintTimerRef.current = null;
      setShowHint(true);
    }, HINT_DELAY_MS);

    if (!isLast) {
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        setSceneIdx((i) => i + 1);
      }, SCENES[sceneIdx].ms);
    }

    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [sceneIdx, isLast]);

  // Footer copy hierarchy: closing scene copy > scene-mid hint > opening
  // settle prompt. Hoisted out of JSX so the conditional reads top-to-bottom.
  const footerCopy = isLast
    ? "Last one. Take it in, then tap Done below."
    : showHint
      ? "Tap the card when you're ready to move on."
      : 'Let each line land before the next one comes.';

  return (
    <ActionScreenShell
      action={URGE_ACTION_BY_ID.play_the_tape}
      icon={Film}
      onDone={onDone}
      onBack={onBack}
      doneDisabled={!isLast}
      doneLabel={isLast ? 'I saw it' : `${sceneIdx + 1} / ${SCENES.length}`}
    >
      <div className="flex flex-col items-center justify-center min-h-[55vh] px-2">
        {/* Scene card — tapping anywhere on it skips ahead. Kept as a
            button (vs role+tabindex on a div) for native keyboard support
            and the right cursor on hover. Disabled on the last scene so
            an accidental tap doesn't feel broken — the user uses Done. */}
        <button
          key={sceneIdx}
          onClick={advance}
          disabled={isLast}
          aria-label={isLast ? SCENES[sceneIdx].text : `${SCENES[sceneIdx].text} Tap to continue.`}
          className="bg-white border border-rose-100 rounded-2xl p-8 md:p-10 shadow-md max-w-md w-full
                     animate-in fade-in zoom-in-95 duration-700 text-left
                     enabled:cursor-pointer enabled:active:scale-[0.99] enabled:hover:border-rose-300
                     transition-all"
        >
          <p className="text-lg md:text-xl text-rose-900 font-medium leading-relaxed text-center">
            {SCENES[sceneIdx].text}
          </p>
        </button>

        {/* Slow progress dots so the user knows the rhythm. */}
        <div className="mt-8 flex items-center gap-1.5" role="presentation">
          {SCENES.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i <= sceneIdx ? 'bg-rose-700' : 'bg-rose-200'
              }`}
            />
          ))}
        </div>

        {/* Footer copy — swaps from the meditative "let it land" prompt
            to the discoverability hint after HINT_DELAY_MS. The hint is
            intentionally low-contrast italic so it never overshadows the
            scene itself. */}
        <p
          className={`mt-6 text-xs italic text-center max-w-xs transition-colors duration-500
                      ${showHint && !isLast ? 'text-rose-700/80' : 'text-rose-700/60'}`}
        >
          {footerCopy}
        </p>
      </div>
    </ActionScreenShell>
  );
};
