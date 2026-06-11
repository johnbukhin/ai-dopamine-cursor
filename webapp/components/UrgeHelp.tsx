import React, { useCallback, useRef, useState } from 'react';
import { FeelingId, UrgeActionId, UrgeContextSeed, UrgeOutcome, CheckIn, ChatMessage } from '../types';
import { type Stage } from './urgeHelp/StageProgress';
import { PauseStage } from './urgeHelp/PauseStage';
import { LocateStage } from './urgeHelp/LocateStage';
import { ActStage } from './urgeHelp/ActStage';
import { ReflectStage } from './urgeHelp/ReflectStage';
import { SurfCelebration } from './urgeHelp/SurfCelebration';
import { CoachModal } from './urgeHelp/CoachModal';
import { URGE_ACTION_SCREENS } from './urgeActions';
import { appendEntry, count as readUrgeCount } from '../src/lib/urgeLog';
import { buildUrgeAutoMessage } from '../src/lib/urgeAutoMessage';

interface UrgeHelpProps {
  // Coach state lifted from App so the modal session stays continuous with
  // the dedicated Coach view — same conversation, same persistence.
  checkInHistory: CheckIn[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Help tab orchestrator (Issue #34).
 *
 * Owns the 4-stage state machine — Pause → Locate → Act → Reflect — plus
 * the active mini-screen (when the user is inside one of the 10 actions),
 * the AI Coach modal (slide-up over the current stage), and the urge log
 * write that fires on Reflect-stage feedback.
 *
 * State is intentionally local to this component: the user starts a fresh
 * session every time they open the Help tab. That matches the existing
 * pattern (the legacy UrgeHelp also reset on remount) and matches user
 * expectation — an urge is a discrete moment, not a resumable workflow.
 */
export const UrgeHelp: React.FC<UrgeHelpProps> = ({
  checkInHistory,
  chatHistory,
  setChatHistory,
}) => {
  // ── Session state ─────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('pause');
  const [feeling, setFeeling] = useState<FeelingId | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [actionsTried, setActionsTried] = useState<UrgeActionId[]>([]);
  const [activeActionId, setActiveActionId] = useState<UrgeActionId | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  /** Snapshot of the urge state at the moment the Coach modal opens.
   *  Captured imperatively (not derived) so the modal sees a stable
   *  context for its full lifetime, regardless of any background state
   *  changes in the orchestrator. */
  const [coachSeed, setCoachSeed] = useState<UrgeContextSeed | null>(null);
  /** Auto-message text computed at openCoach time and sent into the Coach
   *  the moment the modal mounts. Captured imperatively alongside the seed
   *  so the message reflects exactly the state the user saw when they
   *  pressed "I want to talk it through". */
  const [coachAutoMessage, setCoachAutoMessage] = useState<string | null>(null);
  /** Number of completed surfs in the log. Read once per session reset so
   *  the Reflect copy ("Surf #N on your record") is accurate without
   *  re-reading localStorage on every keystroke. */
  const [priorSurfCount, setPriorSurfCount] = useState<number>(() => readUrgeCount());
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

  // ── Coach modal open/close ────────────────────────────────────────────────
  // Declared above handleReflect because the 'escalated' branch calls it.

  /** Open the Coach modal with a fresh snapshot of the current urge state.
   *  Captured imperatively at this single point so the modal's seed never
   *  drifts while it's open, and we don't have to ignore exhaustive-deps.
   *  Also builds the auto-message at the same moment so the visible chat
   *  text matches the system-prompt context exactly. */
  const openCoach = useCallback(() => {
    setCoachSeed({
      stage,
      feeling,
      intensity,
      actionsTried,
      elapsedSec: Math.floor((Date.now() - openedAtRef.current) / 1000),
    });
    setCoachAutoMessage(buildUrgeAutoMessage(feeling, intensity, actionsTried));
    setCoachOpen(true);
  }, [stage, feeling, intensity, actionsTried]);

  const closeCoach = useCallback(() => {
    setCoachOpen(false);
    setCoachSeed(null);
    setCoachAutoMessage(null);
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
          appendEntry({
            id: now,
            endedAt: new Date(now).toISOString(),
            feeling,
            intensity,
            actionsTried,
            outcome,
          });
          const newTotal = priorSurfCount + 1;
          setPriorSurfCount(newTotal);
          // Surface the celebration; resetSession runs after it auto-dismisses.
          setCelebrationCount(newTotal);
          break;
        }
        case 'escalated': {
          const now = Date.now();
          appendEntry({
            id: now,
            endedAt: new Date(now).toISOString(),
            feeling,
            intensity,
            actionsTried,
            outcome,
          });
          setPriorSurfCount((c) => c + 1);
          // Open Coach modal pre-seeded. Stay on Reflect so the user has
          // somewhere to land when they close the modal.
          openCoach();
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
    [feeling, intensity, actionsTried, priorSurfCount, openCoach],
  );


  // ── Render ────────────────────────────────────────────────────────────────

  // The CoachPill is rendered globally over all stages and mini-screens.
  // Background tint stays rose throughout — the emergency context is the
  // single visual constant binding the four stages together.
  return (
    <div className="flex-1 flex flex-col bg-rose-50 relative overflow-hidden">
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

      <CoachModal
        open={coachOpen}
        onClose={closeCoach}
        seed={coachSeed}
        autoMessage={coachAutoMessage}
        checkInHistory={checkInHistory}
        messages={chatHistory}
        setMessages={setChatHistory}
      />
    </div>
  );
};

