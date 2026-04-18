import React, { useState, useEffect, useRef } from 'react';
import { planData, PlanDay } from '../data/planData';
import { Check, Lock, Award, Star, CheckCircle, Info } from 'lucide-react';

const calculateCheckmarkColor = (completed: number, total: number) => {
  if (total === 0 || completed === 0) {
    return { color: 'rgb(214, 211, 209)', fill: 'rgb(255, 255, 255)' }; // stone-300, white
  }

  const progress = completed / total;

  const grayColor = [214, 211, 209]; // stone-300
  const greenColor = [16, 185, 129]; // emerald-500

  const grayFill = [255, 255, 255]; // white
  const greenFill = [240, 253, 244]; // emerald-50

  const r = Math.round(grayColor[0] + (greenColor[0] - grayColor[0]) * progress);
  const g = Math.round(grayColor[1] + (greenColor[1] - grayColor[1]) * progress);
  const b = Math.round(grayColor[2] + (greenColor[2] - grayColor[2]) * progress);

  const fillR = Math.round(grayFill[0] + (greenFill[0] - grayFill[0]) * progress);
  const fillG = Math.round(grayFill[1] + (greenFill[1] - grayFill[1]) * progress);
  const fillB = Math.round(grayFill[2] + (greenFill[2] - grayFill[2]) * progress);

  return {
    color: `rgb(${r}, ${g}, ${b})`,
    fill: `rgb(${fillR}, ${fillG}, ${fillB})`,
  };
};

interface Plan28Props {
  streak: number;
  onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void;
  hasCheckedInToday: boolean;
  completedTasks: Record<number, Set<string>>;
  onTaskToggle: (dayNumber: number, taskKey: string) => void;
}

// Helper component to render formatted text for OLD unstructured days
const FormattedContent = ({ text }: { text: string }) => {
  return <p className="leading-relaxed mb-4">{text}</p>;
};


export const Plan28: React.FC<Plan28Props> = ({ streak, onOpenCheckIn, hasCheckedInToday, completedTasks, onTaskToggle }) => {
  const currentPlanDay = Math.min(streak + 1, 28);
  const [selectedDay, setSelectedDay] = useState<PlanDay>(planData[currentPlanDay - 1]);
  const selectedDayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // When the component loads or the streak changes, update the selected day
    const newCurrentDayIndex = Math.max(0, Math.min(currentPlanDay - 1, planData.length - 1));
    setSelectedDay(planData[newCurrentDayIndex]);
  }, [currentPlanDay]);

  useEffect(() => {
    // Scroll the current day into view on load
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []); // Run only on initial mount


  const DaySelector = ({ day }: { day: PlanDay }) => {
    const isCompleted = day.day < currentPlanDay;
    const isCurrent = day.day === currentPlanDay;
    const isSelected = day.day === selectedDay.day;

    let statusIcon, dayLabelColor, bgColor, textColor;

    if (isCompleted) {
      statusIcon = <Check size={20} className="text-emerald-500" />;
      dayLabelColor = 'text-emerald-600';
      textColor = 'text-purple-900';
      bgColor = isSelected ? 'bg-purple-50 border-emerald-300 ring-1 ring-emerald-300' : 'bg-white hover:bg-gray-50 border-gray-200';
    } else if (isCurrent) {
      statusIcon = <Star size={20} className="text-yellow-500 fill-yellow-500" />;
      dayLabelColor = 'text-yellow-600';
      textColor = 'text-purple-900';
      bgColor = isSelected ? 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400' : 'bg-white hover:bg-gray-50 border-gray-200';
    } else { // isFuture, but now unlocked
      statusIcon = <div className="w-5 h-5" />; // A spacer instead of a lock icon
      dayLabelColor = 'text-gray-500';
      textColor = 'text-purple-900'; // Make text look active
      bgColor = isSelected ? 'bg-gray-100 border-stone-300 ring-1 ring-stone-300' : 'bg-white hover:bg-gray-50 border-gray-200';
    }

    const bgImageIndex = (day.day % 3) + 1;
    
    return (
      <button
        ref={isSelected ? selectedDayRef : null}
        onClick={() => setSelectedDay(day)}
        className={`flex-shrink-0 w-56 md:w-full p-4 rounded-xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden group ${bgColor}`}
      >
        {/* Subtle background image */}
        <div className="absolute right-0 top-0 w-24 h-24 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none translate-x-4 -translate-y-4">
            <img src={`/illustrations/day-bg-${bgImageIndex}.png`} alt="" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
            <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-full p-1">{statusIcon}</div>
            <span className={`text-xs font-bold uppercase tracking-wider ${dayLabelColor}`}>Day {day.day}</span>
        </div>
        <div className="relative z-10">
            <p className={`font-semibold text-sm leading-tight ${textColor}`}>{day.title}</p>
        </div>
      </button>
    );
  };

  const DayDetails = ({ day, onOpenCheckIn, hasCheckedInToday }: { day: PlanDay, onOpenCheckIn: (payload: { tasksCompleted: boolean }) => void, hasCheckedInToday: boolean }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [isTipRead, setIsTipRead] = useState(false);

    // Reset accordion/tip state when the user navigates to a different day
    useEffect(() => {
        setOpenAccordion(null);
        setIsTipRead(false);
    }, [day]);

    // Task completion state comes from persisted props — no local state needed
    const checkedTasks: Set<string> = completedTasks[day.day] ?? new Set<string>();

    const handleAccordionToggle = (accordionId: string) => {
      if (accordionId === 'tip') {
        setIsTipRead(true);
      }
      setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    };

    // Delegate to App.tsx which handles both optimistic UI update and DB write
    const handleCheck = (task: string) => {
      onTaskToggle(day.day, task);
    };

    const morningTasksCompleted = day.morningProtocol?.reduce((acc, item, index) => checkedTasks.has(`m-${index}`) ? acc + 1 : acc, 0) ?? 0;
    const totalMorningTasks = day.morningProtocol?.length ?? 0;
    const morningCompletionColors = calculateCheckmarkColor(morningTasksCompleted, totalMorningTasks);
    const isMorningComplete = totalMorningTasks > 0 && morningTasksCompleted === totalMorningTasks;

    const eveningTasksCompleted = day.eveningProtocol?.reduce((acc, item, index) => checkedTasks.has(`e-${index}`) ? acc + 1 : acc, 0) ?? 0;
    const totalEveningTasks = day.eveningProtocol?.length ?? 0;
    const eveningCompletionColors = calculateCheckmarkColor(eveningTasksCompleted, totalEveningTasks);
    const isEveningComplete = totalEveningTasks > 0 && eveningTasksCompleted === totalEveningTasks;

    const handleOpenCheckIn = () => {
        const isForCurrentPlanDay = day.day === currentPlanDay;
        onOpenCheckIn({
            tasksCompleted: isMorningComplete && isEveningComplete && isForCurrentPlanDay
        });
    };

    const ChecklistItem = ({ item, prefix }: { item: { main: string, details: string }, prefix: string }) => {
      const uniqueKey = prefix;
      const isChecked = checkedTasks.has(uniqueKey);
      return (
        <div
          onClick={() => handleCheck(uniqueKey)}
          className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          role="checkbox"
          aria-checked={isChecked}
        >
          <div className={`mt-1 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300'}`}>
            {isChecked && <Check size={14} className="text-white" />}
          </div>
          <p className={`flex-1 text-sm leading-relaxed ${isChecked ? 'text-gray-400 line-through' : 'text-stone-700'}`}>
            <span className="font-bold">{item.main}</span>
            {' '}
            {item.details}
          </p>
        </div>
      );
    };

    const AccordionCard = ({ title, subtitle, isComplete, checkmarkColor, checkmarkFill, isOpen, onToggle, children, iconIndex = 1 }: { title: string; subtitle: string; isComplete?: boolean; checkmarkColor?: string; checkmarkFill?: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; iconIndex?: number }) => {
      const color = checkmarkColor || (isComplete ? 'rgb(16, 185, 129)' : 'rgb(214, 211, 209)');
      const fill = checkmarkFill || (isComplete ? 'rgb(240, 253, 244)' : 'rgb(255, 255, 255)');
      
      return (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden transition-all relative">
          <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
            <img src={`/illustrations/day-bg-${iconIndex}.png`} alt="" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
          </div>
          <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-purple-900">{title}</h3>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <CheckCircle size={28} style={{ color, fill }} className="transition-all duration-300 bg-white rounded-full" />
          </button>
          {isOpen && (
            <div className="px-5 pb-5 animate-in fade-in duration-300 relative z-10">
              {children}
            </div>
          )}
        </div>
      );
    };

    // Render the new structured view if data exists
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
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-10 pointer-events-none">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-900"></div>
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
                {day.morningProtocol.map((item, index) => <ChecklistItem key={`m-${index}`} item={item} prefix={`m-${index}`} />)}
              </div>
            </AccordionCard>
          )}

          {day.tipOfTheDay && (
            <AccordionCard
              title="Tip of the Day"
              subtitle="One idea. One shift."
              isComplete={isTipRead}
              isOpen={openAccordion === 'tip'}
              onToggle={() => handleAccordionToggle('tip')}
              iconIndex={2}
            >
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 mt-2">
                {typeof day.tipOfTheDay === 'string' ? day.tipOfTheDay : (
                  <div className="space-y-2">
                    <p><span className="font-bold text-yellow-900">Typical Mistake:</span> {day.tipOfTheDay.mistake}</p>
                    <p><span className="font-bold text-yellow-900">Best Practice:</span> {day.tipOfTheDay.practice}</p>
                  </div>
                )}
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
                {day.eveningProtocol.map((item, index) => <ChecklistItem key={`e-${index}`} item={item} prefix={`e-${index}`} />)}
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
            <CheckCircle size={28} className={`transition-colors ${hasCheckedInToday ? 'text-emerald-500' : 'text-gray-300'}`} />
          </button>
        </div>
      );
    }

    // Fallback to old view for unstructured days
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
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-900"></div>
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
                    <p className="font-medium text-sm">Congratulations on completing the 28-day plan. This is a huge accomplishment.</p>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-purple-50">
        {/* Desktop: Vertical Sidebar (Hidden on Mobile) */}
        <aside className="hidden md:block p-4 w-72 h-full border-r border-gray-200 bg-white/60">
            <div className="flex flex-col gap-3 overflow-y-auto h-full pr-2">
                {planData.map(day => <DaySelector key={day.day} day={day} />)}
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-28 md:pb-8 overflow-y-auto">
            {/* Edge-to-Edge Header Image */}
            <div className="w-full h-56 md:h-64 relative mb-4 overflow-hidden">
              <img src="/illustrations/plan.png" alt="28-Day Plan" className="w-full h-full object-cover scale-[2.2] origin-center" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-50" />
              <div className="absolute bottom-10 md:bottom-12 left-4 md:left-8 right-4 md:right-8">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phase 1</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 mt-1">Your Journey</h2>
              </div>
            </div>
            
            {/* Mobile: Horizontal Scroll (Below Header) */}
            <div className="md:hidden px-4 mb-4 -mt-8 relative z-10">
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                    {planData.map(day => <div key={day.day} className="snap-start"><DaySelector day={day} /></div>)}
                </div>
            </div>

            <div className="px-4 md:px-8 max-w-3xl mx-auto">
              {selectedDay && <DayDetails day={selectedDay} onOpenCheckIn={onOpenCheckIn} hasCheckedInToday={hasCheckedInToday} />}
            </div>
        </main>
    </div>
  );
};