import React, { useCallback, useRef, useState } from 'react';
import { FeelingId, UrgeActionId, UrgeContextSeed, UrgeLogEntry, UrgeOutcome } from '../types';
import { type Stage } from './urgeHelp/StageProgress';
import { PauseStage } from './urgeHelp/PauseStage';
import { LocateStage } from './urgeHelp/LocateStage';
import { ActStage } from './urgeHelp/ActStage';
import { ReflectStage } from './urgeHelp/ReflectStage';
import { SurfCelebration } from './urgeHelp/SurfCelebration';
import { URGE_ACTION_SCREENS } from './urgeActions';
import { buildUrgeAutoMessage } from '../src/lib/urgeAutoMessage';

interface UrgeHelpProps {
  /** Number of urge sessions this user has already completed (passed +
   *  escalated). Owned by App.tsx from the `urge_log` Supabase table
   *  (Issue #64) so it stays correct across devices. */
  priorSurfCount: number;
  /** Append a freshly-completed urge entry to App-level state and persist
   *  it to Supabase. Returns the freshly-incremented total so the caller
   *  can drive the celebration overlay without re-reading state. */
  onAppendUrge: (entry: UrgeLogEntry) => number;
  /** Called when the user picks "I want to talk it through" on Reflect.
   *  Parent (App) seeds Coach state and navigates to the Coach tab — the
   *  modal that used to live here was unscrollable on mobile, so the whole
   *  escalate path moves into the full-page Coach view (Issue #61 follow-up). */
  onEscalateToCoach: (seed: UrgeContextSeed, autoMessage: string) => void;
}

/**
 * Help tab orchestrator (Issue #34).
 *
 * Owns the 4-stage state machine — Pause → Locate → Act → Reflect — plus
 * the active mini-screen (when the user is inside one of the 10 actions)
 * and the urge log write that fires on Reflect-stage feedback.
 *
 * State is intentionally local to this component: the user starts a fresh
 * session every time they open the Help tab. That matches the existing
 * pattern (the legacy UrgeHelp also reset on remount) and matches user
 * expectation — an urge is a discrete moment, not a resumable workflow.
 */
export const UrgeHelp: React.FC<UrgeHelpProps> = ({ priorSurfCount, onAppendUrge, onEscalateToCoach }) => {
  // ── Session state ─────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('pause');
  const [feeling, setFeeling] = useState<FeelingId | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [actionsTried, setActionsTried] = useState<UrgeActionId[]>([]);
  const [activeActionId, setActiveActionId] = useState<UrgeActionId | null>(null);
  /** When non-null, we're showing the post-"passed" celebration overlay.
   *  Carries the freshly-incremented total so the overlay renders without
   *  a second storage read. */
  const [celebrationCount, setCelebrationCount] = useState<number | null>(null);

  /** Wall-clock start of this session — captured once per mount. Used to
   *  compute `elapsedSec` for the Coach context seed. A ref (not state) so
   *  re-renders don't reset it and we never re-render just because time
   *  passed. */
  const openedAtRef = useRef<number>(Date.now());

  // ── Stage transitions ─────────────────────────────────────────────────────

  const goToLocate = useCallback(() => setStage('locate'), []);

  /** Locate → Act. Captures the named feeling and (optional) intensity into
   *  session state so downstream stages and the Coach seed can read them. */
  const handleLocateComplete = useCallback(
    (chosenFeeling: FeelingId, chosenIntensity: number | null) => {
      setFeeling(chosenFeeling);
      setIntensity(chosenIntensity);
      setStage('act');
    },
    [],
  );

  /** Open a specific action mini-screen and record it in actionsTried.
   *  Dedupes so reopening the same action mid-session doesn't inflate the log. */
  const openAction = useCallback((id: UrgeActionId) => {
    setActiveActionId(id);
    setActionsTried((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  /** Close the current action mini-screen and either return to the Act grid
   *  ("back") or advance to Reflect ("done"). Keeps the orchestrator the
   *  single source of truth for stage progression. */
  const closeAction = useCallback((next: 'back' | 'done') => {
    setActiveActionId(null);
    if (next === 'done') setStage('reflect');
  }, []);

  // Stable callbacks for the active action screen. These end up in the
  // dependency arrays of effects inside individual action components
  // (notably Grounding's auto-advance) — fresh inline arrows would force
  // those effects to re-fire on every parent re-render and reset their
  // timers. Memoized once for the lifetime of the orchestrator.
  const handleActionDone = useCallback(() => closeAction('done'), [closeAction]);
  const handleActionBack = useCallback(() => closeAction('back'), [closeAction]);

  /** Reset all session state to a fresh Pause. Called after the celebration
   *  overlay or whenever the user explicitly restarts. */
  const resetSession = useCallback(() => {
    setStage('pause');
    setFeeling(null);
    setIntensity(null);
    setActionsTried([]);
    setActiveActionId(null);
    openedAtRef.current = Date.now();
  }, []);

  /** Reflect-stage handler. Logs only on terminal outcomes (`passed` /
   *  `escalated`) — `still_here` is mid-session feedback ("let me try
   *  another action"), not the end of an urge surf. Logging it would
   *  inflate the Dashboard tile with one entry per attempt instead of
   *  one entry per resolved session.
   */
  const handleReflect = useCallback(
    (outcome: UrgeOutcome) => {
      switch (outcome) {
        case 'passed': {
          const now = Date.now();
          const newTotal = onAppendUrge({
            id: now,
            endedAt: new Date(now).toISOString(),
            feeling,
            intensity,
            actionsTried,
            outcome,
          });
          // Surface the celebration; resetSession runs after it auto-dismisses.
          setCelebrationCount(newTotal);
          break;
        }
        case 'escalated': {
          const now = Date.now();
          onAppendUrge({
            id: now,
            endedAt: new Date(now).toISOString(),
            feeling,
            intensity,
            actionsTried,
            outcome,
          });
          // Hand the urge context off to App, which seeds the Coach tab
          // and navigates there. We stay mounted just long enough for the
          // view transition to flip; the next time the user lands on Help,
          // local state resets via remount.
          const seed: UrgeContextSeed = {
            stage,
            feeling,
            intensity,
            actionsTried,
            elapsedSec: Math.floor((Date.now() - openedAtRef.current) / 1000),
          };
          onEscalateToCoach(seed, buildUrgeAutoMessage(feeling, intensity, actionsTried));
          break;
        }
        case 'still_here':
          // Mid-session feedback only — no log entry. Send the user back
          // to the Act grid with prior actions still marked so they can
          // pick a fresh technique.
          setStage('act');
          break;
      }
    },
    [stage, feeling, intensity, actionsTried, onAppendUrge, onEscalateToCoach],
  );


  // ── Render ────────────────────────────────────────────────────────────────

  // Background tint stays rose throughout — the emergency context is the
  // single visual constant binding the four stages together.
  //
  // `min-h-0` on the outer wrapper is critical: without it, a `flex-1` flex
  // child won't shrink below its content's intrinsic height, so when a stage
  // grows taller than viewport (e.g. Act grid on short desktops) the wrapper
  // overflows its parent and `overflow-hidden` clips the bottom instead of
  // letting the inner `overflow-y-auto` scroll. Other tabs avoid this by
  // using `h-full` directly; Help inherits height through the flex chain
  // because each stage has its own scroll shell, so the chain must allow
  // shrinking at every level.
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-rose-50 relative overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        {stage === 'pause' && <PauseStage onComplete={goToLocate} />}

        {stage === 'locate' && (
          <LocateStage initialFeeling={feeling} onComplete={handleLocateComplete} />
        )}

        {stage === 'act' && activeActionId === null && (
          <ActStage
            feeling={feeling}
            triedActionIds={actionsTried}
            onPickAction={openAction}
          />
        )}
        {stage === 'act' && activeActionId !== null && (() => {
          // Resolve the screen component from the registry. Wrapped in an
          // IIFE so we can keep the lookup tight to the render branch.
          const ActionScreen = URGE_ACTION_SCREENS[activeActionId];
          return <ActionScreen onDone={handleActionDone} onBack={handleActionBack} />;
        })()}

        {stage === 'reflect' && (
          <ReflectStage
            totalSurfsAfterThisOne={priorSurfCount + 1}
            onChoose={handleReflect}
          />
        )}
      </div>

      {celebrationCount !== null && (
        <SurfCelebration
          total={celebrationCount}
          onDone={() => {
            setCelebrationCount(null);
            resetSession();
          }}
        />
      )}
    </div>
  );
};
