import React, { useEffect, useMemo, useState } from 'react';
import { planData, PlanDay, DayCompletion } from '../data/planData';
import { JourneyPath } from './JourneyPath';
import { LessonBottomSheet } from './LessonBottomSheet';

interface Plan28Props {
  onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void;
  hasCheckedInToday: boolean;
  completedTasks: Record<number, Set<string>>;
  onTaskToggle: (dayNumber: number, taskKey: string) => void;
  // Timestamps from day_completions table — used to compute green/yellow stones.
  dayCompletions: Record<number, DayCompletion>;
  // When true, automatically open the Day 0 Welcome lesson on mount (new users).
  autoOpenWelcomeLesson?: boolean;
}

/**
 * Plan tab orchestrator. Renders the vertical stone-path journey and the
 * lesson bottom sheet that opens when the user taps a lesson stone.
 *
 * Derives two key values from dayCompletions:
 *   completedDays  — Set of day numbers whose stone should show green.
 *   activePlanDay  — First day not in completedDays; the current yellow stone.
 *
 * Green stone rules (both checked client-side each render):
 *   1. all_tasks_completed_at is set  → always green (immediate, same day).
 *   2. lesson_completed_at is set AND it was on a prior calendar date → green.
 *
 * "Come back tomorrow" banner: shown inside the bottom sheet when the user opens
 * activePlanDay and the previous day was fully completed today.
 */
export const Plan28: React.FC<Plan28Props> = ({
  onOpenCheckIn,
  hasCheckedInToday,
  completedTasks,
  onTaskToggle,
  dayCompletions,
  autoOpenWelcomeLesson = false,
}) => {
  // today at midnight — stable for the component's lifetime (Plan28 remounts on
  // tab switch so this is always fresh when the user re-opens the Journey tab).
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Set of day numbers whose stone is green.
  const completedDays = useMemo<Set<number>>(() => {
    const result = new Set<number>();
    for (const [dayStr, c] of Object.entries(dayCompletions)) {
      const dayNum = Number(dayStr);
      if (c.all_tasks_completed_at) {
        // Fully done — green regardless of when.
        result.add(dayNum);
      } else if (c.lesson_completed_at) {
        // Lesson done on a prior calendar day — green.
        const lessonDate = new Date(c.lesson_completed_at);
        lessonDate.setHours(0, 0, 0, 0);
        if (lessonDate < todayMidnight) result.add(dayNum);
      }
    }
    return result;
  }, [dayCompletions, todayMidnight]);

  // First plan day (sequential, 0 → 28) not in completedDays.
  const activePlanDay = useMemo(() => {
    for (const day of planData) {
      if (!completedDays.has(day.day)) return day.day;
    }
    return 28;
  }, [completedDays]);

  // True when the previous day was fully completed today — triggers the
  // "come back tomorrow" informational banner in the lesson bottom sheet.
  const showComeTomorrow = useMemo(() => {
    if (activePlanDay === 0) return false;
    const prev = dayCompletions[activePlanDay - 1];
    if (!prev?.all_tasks_completed_at) return false;
    const completedDate = new Date(prev.all_tasks_completed_at);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === todayMidnight.getTime();
  }, [activePlanDay, dayCompletions, todayMidnight]);

  // Selected day is kept after close so the sheet can play its exit animation
  // without the content disappearing mid-slide.
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // New users: open the Welcome lesson (Day 0) automatically on first login.
  useEffect(() => {
    if (!autoOpenWelcomeLesson) return;
    const day0 = planData.find(d => d.day === 0);
    if (day0) {
      setSelectedDay(day0);
      setIsSheetOpen(true);
    }
  }, [autoOpenWelcomeLesson]);

  const handleSelectLesson = (day: PlanDay) => {
    setSelectedDay(day);
    setIsSheetOpen(true);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-purple-100">
      <JourneyPath
        planData={planData}
        activePlanDay={activePlanDay}
        completedDays={completedDays}
        onSelectLesson={handleSelectLesson}
      />
      <LessonBottomSheet
        day={selectedDay}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        activePlanDay={activePlanDay}
        hasCheckedInToday={hasCheckedInToday}
        completedTasks={completedTasks}
        onTaskToggle={onTaskToggle}
        onOpenCheckIn={onOpenCheckIn}
        showComeTomorrow={showComeTomorrow}
      />
    </div>
  );
};
