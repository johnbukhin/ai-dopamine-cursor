import React, { useEffect, useRef, useState } from 'react';
import { PlanDay } from '../data/planData';
import { PlanLessonContent } from './PlanLessonContent';

interface LessonBottomSheetProps {
  day: PlanDay | null;
  isOpen: boolean;
  onClose: () => void;
  activePlanDay: number;
  hasCheckedInToday: boolean;
  completedTasks: Record<number, Set<string>>;
  onTaskToggle: (dayNumber: number, taskKey: string) => void;
  onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void;
  /** When true, PlanLessonContent shows an informational "come back tomorrow" banner. */
  showComeTomorrow: boolean;
}

/** Exit animation duration — must match `.animate-sheet-down` in index.css. */
const EXIT_ANIM_MS = 240;
/** Drag-distance threshold (px) past which release dismisses the sheet. */
const DISMISS_DRAG_PX = 100;
/** Drag-velocity threshold (px/ms) past which a quick flick dismisses. */
const DISMISS_VELOCITY = 0.5;

/**
 * Modal bottom sheet that hosts a single lesson's content.
 *
 * Mirrors the existing Daily Check-In modal pattern (z-50 + backdrop-blur)
 * but slides up from the bottom instead of fading in. Includes:
 *
 *   - Drag-to-dismiss on the top handle (vanilla touch handlers — no
 *     framer-motion in dependencies). Triggers on either drag distance or
 *     flick velocity.
 *   - Backdrop click and Escape key both dismiss.
 *   - Body scroll lock while open so the page beneath doesn't scroll.
 *   - iOS safe-area padding via env(safe-area-inset-bottom).
 *
 * The sheet renders its own exit animation (isClosing state) before calling
 * the parent's onClose, so the parent doesn't need to manage timing.
 */
export const LessonBottomSheet: React.FC<LessonBottomSheetProps> = ({
  day,
  isOpen,
  onClose,
  activePlanDay,
  hasCheckedInToday,
  completedTasks,
  onTaskToggle,
  onOpenCheckIn,
  showComeTomorrow,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  // Reset state every time the sheet (re)opens.
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setDragY(0);
    }
  }, [isOpen]);

  // Body scroll lock. Restoring on cleanup also covers unmount mid-open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return; // ignore repeat triggers during exit anim
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setDragY(0);
      onClose();
    }, EXIT_ANIM_MS);
  };

  // Esc key dismisses on desktop. Listener is bound only while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // --- Drag-to-dismiss (touch handlers attached to the drag handle only) ---

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startYRef.current;
    // Only allow downward drag — upward is a no-op so the sheet doesn't pop up.
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    const elapsed = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = dragY / elapsed;
    if (dragY > DISMISS_DRAG_PX || velocity > DISMISS_VELOCITY) {
      handleClose();
    } else {
      setDragY(0); // snap back; transition: 200ms applied below
    }
  };

  // Don't render anything once fully closed.
  if (!isOpen && !isClosing) return null;
  if (!day) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop — separate fixed element so its fade timing is independent
          of the sheet's slide. Click anywhere outside the sheet to dismiss. */}
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm ${
          isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        }`}
        onClick={handleClose}
      />

      {/* Sheet — anchored to the bottom, max 90vh tall, internal scroll for
          long content. Drag-translate is applied inline so React owns the
          per-frame value while the user is actively dragging. */}
      <div
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-2xl bg-white rounded-t-3xl shadow-2xl ${
          isClosing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          // Snap-back animation when drag is released without dismissing.
          transition: dragY === 0 ? 'transform 200ms ease-out' : 'none',
          maxHeight: '90vh',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
        }}
      >
        {/* Drag handle. Touch listeners ONLY here — the scrollable content
            below must not fight the gesture. touch-action: none stops the
            page from also scrolling while the user drags the handle. */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div className="w-10 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Scrollable lesson content. */}
        <div
          className="overflow-y-auto px-4 pb-4"
          style={{ maxHeight: 'calc(90vh - 40px)' }}
        >
          <PlanLessonContent
            day={day}
            activePlanDay={activePlanDay}
            hasCheckedInToday={hasCheckedInToday}
            completedTasks={completedTasks}
            onTaskToggle={onTaskToggle}
            onOpenCheckIn={onOpenCheckIn}
            showComeTomorrow={showComeTomorrow}
          />
        </div>
      </div>
    </div>
  );
};
