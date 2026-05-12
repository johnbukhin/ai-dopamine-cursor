import React, { useState, useEffect } from 'react';
import { PlanDay } from '../data/planData';
import { Check, Award, CheckCircle, Info, BookOpen, CheckCircle2 } from 'lucide-react';
import { lessonsData } from '../data/lessonsData';
import { LessonPlayer } from './LessonPlayer';

/**
 * Interpolates the AccordionCard's checkmark color from stone-300 (incomplete)
 * toward emerald-500 (complete) as the user ticks off tasks. Identical to the
 * function previously inlined at the top of Plan28.tsx — kept here so the new
 * sheet does not need to depend on the legacy carousel file.
 */
const calculateCheckmarkColor = (completed: number, total: number) => {
  if (total === 0 || completed === 0) {
    return { color: 'rgb(214, 211, 209)', fill: 'rgb(255, 255, 255)' }; // stone-300, white
  }

  const progress = completed / total;
  const grayColor = [214, 211, 209];
  const greenColor = [16, 185, 129];
  const grayFill = [255, 255, 255];
  const greenFill = [240, 253, 244];

  const r = Math.round(grayColor[0] + (greenColor[0] - grayColor[0]) * progress);
  const g = Math.round(grayColor[1] + (greenColor[1] - grayColor[1]) * progress);
  const b = Math.round(grayColor[2] + (greenColor[2] - grayColor[2]) * progress);
  const fillR = Math.round(grayFill[0] + (greenFill[0] - grayFill[0]) * progress);
  const fillG = Math.round(grayFill[1] + (greenFill[1] - grayFill[1]) * progress);
  const fillB = Math.round(grayFill[2] + (greenFill[2] - grayFill[2]) * progress);

  return { color: `rgb(${r}, ${g}, ${b})`, fill: `rgb(${fillR}, ${fillG}, ${fillB})` };
};

const FormattedContent = ({ text }: { text: string }) => (
  <p className="leading-relaxed mb-4">{text}</p>
);

export interface PlanLessonContentProps {
  day: PlanDay;
  currentPlanDay: number;
  hasCheckedInToday: boolean;
  completedTasks: Record<number, Set<string>>;
  onTaskToggle: (dayNumber: number, taskKey: string) => void;
  onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void;
}

/**
 * Renders the full content of a single lesson day: lesson card (opens LessonPlayer
 * overlay), Morning Protocol accordion, Evening Protocol accordion, Daily Check-In
 * trigger. Falls back to a description/task layout for unstructured days.
 */
export const PlanLessonContent: React.FC<PlanLessonContentProps> = ({
  day,
  currentPlanDay,
  hasCheckedInToday,
  completedTasks,
  onTaskToggle,
  onOpenCheckIn,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Lesson for this day — day 1-28 use the `day` field; day 0 (welcome) uses
  // lessonNumber because Lesson 0 has no `day` field in lessonsData.
  const lesson = lessonsData.find(l => (l.day ?? l.lessonNumber) === day.day) ?? null;
  const isLessonCompleted = (completedTasks[day.day] ?? new Set()).has('lesson');

  // Reset state on day change; auto-open player for Day 0 (welcome session, no task list).
  useEffect(() => {
    setOpenAccordion(null);
    setIsPlayerOpen(day.day === 0);
  }, [day.day]);

  const checkedTasks: Set<string> = completedTasks[day.day] ?? new Set<string>();

  const handleAccordionToggle = (accordionId: string) => {
    setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
  };

  const handleCheck = (task: string) => onTaskToggle(day.day, task);

  const morningTasksCompleted = day.morningProtocol?.reduce(
    (acc, _item, index) => (checkedTasks.has(`m-${index}`) ? acc + 1 : acc),
    0,
  ) ?? 0;
  const totalMorningTasks = day.morningProtocol?.length ?? 0;
  const morningCompletionColors = calculateCheckmarkColor(morningTasksCompleted, totalMorningTasks);
  const isMorningComplete = totalMorningTasks > 0 && morningTasksCompleted === totalMorningTasks;

  const eveningTasksCompleted = day.eveningProtocol?.reduce(
    (acc, _item, index) => (checkedTasks.has(`e-${index}`) ? acc + 1 : acc),
    0,
  ) ?? 0;
  const totalEveningTasks = day.eveningProtocol?.length ?? 0;
  const eveningCompletionColors = calculateCheckmarkColor(eveningTasksCompleted, totalEveningTasks);
  const isEveningComplete = totalEveningTasks > 0 && eveningTasksCompleted === totalEveningTasks;

  const handleOpenCheckIn = () => {
    const isForCurrentPlanDay = day.day === currentPlanDay;
    onOpenCheckIn({
      tasksCompleted: isMorningComplete && isEveningComplete && isLessonCompleted && isForCurrentPlanDay,
    });
  };

  const ChecklistItem = ({ item, prefix }: { item: { main: string; details: string }; prefix: string }) => {
    const uniqueKey = prefix;
    const isChecked = checkedTasks.has(uniqueKey);
    return (
      <div
        onClick={() => handleCheck(uniqueKey)}
        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        role="checkbox"
        aria-checked={isChecked}
      >
        <div
          className={`mt-1 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            isChecked ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300'
          }`}
        >
          {isChecked && <Check size={14} className="text-white" />}
        </div>
        <p className={`flex-1 text-sm leading-relaxed ${isChecked ? 'text-gray-400 line-through' : 'text-stone-700'}`}>
          <span className="font-bold">{item.main}</span> {item.details}
        </p>
      </div>
    );
  };

  const AccordionCard = ({
    title,
    subtitle,
    isComplete,
    checkmarkColor,
    checkmarkFill,
    isOpen,
    onToggle,
    children,
    iconIndex = 1,
  }: {
    title: string;
    subtitle: string;
    isComplete?: boolean;
    checkmarkColor?: string;
    checkmarkFill?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    iconIndex?: number;
  }) => {
    const color = checkmarkColor || (isComplete ? 'rgb(16, 185, 129)' : 'rgb(214, 211, 209)');
    const fill = checkmarkFill || (isComplete ? 'rgb(240, 253, 244)' : 'rgb(255, 255, 255)');

    return (
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden transition-all relative">
        <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <img
            src={`/illustrations/day-bg-${iconIndex}.png`}
            alt=""
            className="w-full h-full object-cover rounded-full mix-blend-multiply"
          />
        </div>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 relative z-10"
        >
          <div>
            <h3 className="text-lg font-bold text-purple-900">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <CheckCircle
            size={28}
            style={{ color, fill }}
            className="transition-all duration-300 bg-white rounded-full"
          />
        </button>
        {isOpen && (
          <div className="px-5 pb-5 animate-in fade-in duration-300 relative z-10">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Day 0 — welcome session only; player auto-opens via useEffect, no task list.
  if (day.day === 0) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <header className="mb-6">
          <span className="text-sm font-bold text-purple-500 uppercase tracking-wider">Welcome</span>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mt-1">{day.title}</h2>
          {day.subtitle && <p className="text-gray-500 mt-2">{day.subtitle}</p>}
        </header>

        {lesson && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
              <img src="/illustrations/day-bg-2.png" alt="" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
            </div>
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={15} className="text-purple-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Welcome Session</span>
                    {isLessonCompleted && (
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">· Completed</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-purple-900 truncate">{lesson.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{lesson.duration} read</p>
                </div>
                <CheckCircle2
                  size={28}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${isLessonCompleted ? 'text-emerald-500' : 'text-gray-200'}`}
                  style={{ fill: isLessonCompleted ? 'rgb(240, 253, 244)' : 'white' }}
                />
              </div>
              <button
                onClick={() => setIsPlayerOpen(true)}
                className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isLessonCompleted ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isLessonCompleted ? 'Replay Session' : 'Start Session'}
              </button>
            </div>
          </div>
        )}

        {isPlayerOpen && lesson && (
          <LessonPlayer
            lesson={lesson}
            isCompleted={isLessonCompleted}
            onComplete={() => onTaskToggle(day.day, 'lesson')}
            onClose={() => setIsPlayerOpen(false)}
          />
        )}
      </div>
    );
  }

  // Structured day (has morning + evening protocol).
  if (day.morningProtocol && day.eveningProtocol) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <header className="mb-6">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Day {day.day}</span>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-900">{day.title}</h2>
            {day.whatToExpectToday && (
              <div className="relative group flex items-center">
                <Info size={18} className="text-gray-400 cursor-pointer hover:text-purple-700 transition-colors" />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-purple-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-50 pointer-events-none">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-purple-900" />
                  <span className="font-bold block mb-1">What to Expect Today:</span>
                  <div className="mt-1 space-y-1">
                    {day.whatToExpectToday.map((line, index) => <p key={index}>{line}</p>)}
                  </div>
                </div>
              </div>
            )}
          </div>
          {day.subtitle && <p className="text-gray-500 mt-2">{day.subtitle}</p>}
        </header>

        {/* Lesson card — replaces the static Tip of the Day callout.
            Tapping "Start Lesson" opens the full-screen LessonPlayer overlay.
            Once completed, shows a "Review Lesson" state instead. */}
        {lesson && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
              <img
                src="/illustrations/day-bg-2.png"
                alt=""
                className="w-full h-full object-cover rounded-full mix-blend-multiply"
              />
            </div>
            <div className="p-5 relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={15} className="text-purple-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                      Daily Lesson
                    </span>
                    {isLessonCompleted && (
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        · Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-purple-900 truncate">{lesson.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{lesson.duration} read</p>
                </div>
                <CheckCircle2
                  size={28}
                  className={`flex-shrink-0 mt-0.5 transition-colors ${
                    isLessonCompleted ? 'text-emerald-500' : 'text-gray-200'
                  }`}
                  style={{ fill: isLessonCompleted ? 'rgb(240, 253, 244)' : 'white' }}
                />
              </div>
              <button
                onClick={() => setIsPlayerOpen(true)}
                className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isLessonCompleted
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isLessonCompleted ? 'Review Lesson' : 'Start Lesson'}
              </button>
            </div>
          </div>
        )}

        {/* Full-screen lesson player — rendered inside the sheet's stacking context
            so it covers the entire screen above the sheet (z-[60]). */}
        {isPlayerOpen && lesson && (
          <LessonPlayer
            lesson={lesson}
            isCompleted={isLessonCompleted}
            onComplete={() => onTaskToggle(day.day, 'lesson')}
            onClose={() => setIsPlayerOpen(false)}
          />
        )}

        {day.morningProtocol && (
          <AccordionCard
            title="Morning Protocol"
            subtitle="Start strong. Set the tone."
            checkmarkColor={morningCompletionColors.color}
            checkmarkFill={morningCompletionColors.fill}
            isOpen={openAccordion === 'morning'}
            onToggle={() => handleAccordionToggle('morning')}
            iconIndex={1}
          >
            <div className="space-y-1 border-t border-stone-100 pt-4 mt-2">
              {day.morningProtocol.map((item, index) => (
                <ChecklistItem key={`m-${index}`} item={item} prefix={`m-${index}`} />
              ))}
            </div>
          </AccordionCard>
        )}

        {day.eveningProtocol && (
          <AccordionCard
            title="Evening Protocol"
            subtitle="Slow down. Lock it in."
            checkmarkColor={eveningCompletionColors.color}
            checkmarkFill={eveningCompletionColors.fill}
            isOpen={openAccordion === 'evening'}
            onToggle={() => handleAccordionToggle('evening')}
            iconIndex={3}
          >
            <div className="space-y-1 border-t border-stone-100 pt-4 mt-2">
              {day.eveningProtocol.map((item, index) => (
                <ChecklistItem key={`e-${index}`} item={item} prefix={`e-${index}`} />
              ))}
            </div>
          </AccordionCard>
        )}

        <button
          onClick={handleOpenCheckIn}
          className="w-full flex items-center justify-between p-5 text-left bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors mt-2"
        >
          <div>
            <h3 className="text-lg font-bold text-purple-900">Daily Check-In</h3>
            <p className="text-sm text-gray-500">Track. Reflect. Adjust.</p>
          </div>
          <CheckCircle
            size={28}
            className={`transition-colors ${hasCheckedInToday ? 'text-emerald-500' : 'text-gray-300'}`}
          />
        </button>
      </div>
    );
  }

  // Fallback: unstructured day (description/task only).
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
      <div className="mb-6">
        <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Day {day.day}</span>
        <div className="flex items-center gap-2 mt-1">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900">{day.title}</h2>
          {day.whatToExpectToday && (
            <div className="relative group flex items-center">
              <Info size={18} className="text-gray-400 cursor-pointer hover:text-purple-700 transition-colors" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-10 pointer-events-none">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-900" />
                <span className="font-bold block mb-1">What to Expect Today:</span>
                <div className="mt-1 space-y-1">
                  {day.whatToExpectToday.map((line, index) => <p key={index}>{line}</p>)}
                </div>
              </div>
            </div>
          )}
        </div>
        {day.subtitle && <p className="text-gray-500 mt-2">{day.subtitle}</p>}
      </div>

      {(day.description || day.task) ? (
        <div className="text-stone-700">
          {day.task && (
            <div className="bg-purple-50/70 border-l-4 border-emerald-400 p-4 rounded-r-lg mb-6">
              <h4 className="font-bold text-purple-900 !mt-0">Today's Task:</h4>
              <p className="!mb-0">{day.task}</p>
            </div>
          )}
          {day.description && <FormattedContent text={day.description} />}
        </div>
      ) : (
        <div className="text-center py-12 border-t border-stone-100 mt-6">
          <p className="text-gray-500">Content for this day will be available soon.</p>
        </div>
      )}

      {day.day === 28 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center gap-3">
          <Award size={24} />
          <p className="font-medium text-sm">
            Congratulations on completing the 28-day plan. This is a huge accomplishment.
          </p>
        </div>
      )}
    </div>
  );
};
