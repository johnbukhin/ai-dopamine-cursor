import React, { useState } from 'react';
import { planData, PlanDay } from '../data/planData';
import { JourneyPath } from './JourneyPath';
import { LessonBottomSheet } from './LessonBottomSheet';

interface Plan28Props {
  streak: number;
  onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void;
  hasCheckedInToday: boolean;
  completedTasks: Record<number, Set<string>>;
  onTaskToggle: (dayNumber: number, taskKey: string) => void;
}

/**
 * Plan tab orchestrator. Renders the vertical stone-path journey and the
 * lesson bottom sheet that opens when the user taps a colored "lesson" stone.
 *
 * State is intentionally minimal — only the currently-open lesson and the
 * sheet visibility live here. All persistent progress (completed tasks,
 * streak, check-in status) is owned by App.tsx and passed through.
 */
export const Plan28: React.FC<Plan28Props> = ({
  streak,
  onOpenCheckIn,
  hasCheckedInToday,
  completedTasks,
  onTaskToggle,
}) => {
  // Streak → current plan day, capped at 28 (the final lesson).
  // Day 0 is the intro: a new user (streak=0) lands on Day 0 as "current",
  // their first CLEAN check-in advances them to Day 1, and so on.
  const currentPlanDay = Math.min(streak, 28);

  // Selected day is kept after close so the sheet can play its exit animation
  // without the content disappearing mid-slide.
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectLesson = (day: PlanDay) => {
    setSelectedDay(day);
    setIsSheetOpen(true);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-purple-100">
      <JourneyPath
        planData={planData}
        currentPlanDay={currentPlanDay}
        onSelectLesson={handleSelectLesson}
      />
      <LessonBottomSheet
        day={selectedDay}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        currentPlanDay={currentPlanDay}
        hasCheckedInToday={hasCheckedInToday}
        completedTasks={completedTasks}
        onTaskToggle={onTaskToggle}
        onOpenCheckIn={onOpenCheckIn}
      />
    </div>
  );
};
