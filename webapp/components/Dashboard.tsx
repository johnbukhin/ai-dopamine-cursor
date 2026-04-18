import React, { useState, useMemo } from 'react';
import { CheckIn, CheckInStatus, View } from '../types';
import { ChevronLeft, ChevronRight, X, Sparkles, Activity, Plus } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isFuture } from 'date-fns';

interface DashboardProps {
  checkIns: CheckIn[];
  streak: number;
  onOpenCheckIn?: () => void;
  onChangeView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, streak, onOpenCheckIn, onChangeView }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth)); // 0 = Sunday
  const emptyDays = Array(startDay).fill(null);

  const getDayStatus = (date: Date): CheckInStatus | 'FUTURE' | 'EMPTY' => {
    if (isFuture(date)) return 'FUTURE';
    
    const dayCheckIns = checkIns.filter(c => isSameDay(new Date(c.date), date));
    
    if (dayCheckIns.length === 0) return 'EMPTY';
    
    // Rigorous honesty: if any slip happened, the day is marked as a slip.
    const hasSlip = dayCheckIns.some(c => c.status === CheckInStatus.SLIP);
    if (hasSlip) return CheckInStatus.SLIP;
    
    // A day is only marked fully 'CLEAN' (green) if there's a clean check-in AND tasks were completed.
    const hasCompletedCleanCheckIn = dayCheckIns.some(c => c.status === CheckInStatus.CLEAN && c.tasksCompleted);
    if (hasCompletedCleanCheckIn) return CheckInStatus.CLEAN;

    // If there was a clean check-in but tasks were not completed, or any other case, treat as neutral.
    return 'EMPTY';
  };

  const handleDateClick = (date: Date) => {
    if (!isFuture(date)) {
      setSelectedDate(date);
    }
  };

  const getDayDetails = (date: Date) => {
     return checkIns.filter(c => isSameDay(new Date(c.date), date));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-28 md:pb-8">
      
      {/* Edge-to-Edge Header Image */}
      <div className="w-full h-56 md:h-64 relative mb-4 overflow-hidden">
        <img src="/illustrations/dashboard.png" alt="Dashboard" className="w-full h-full object-cover scale-[1.4] origin-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-50" />
        <div className="absolute bottom-10 md:bottom-12 left-4 md:left-8 right-4 md:right-8">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 mt-1">{greeting}</h2>
        </div>
      </div>
      
      {/* Top Section: Split into Progress and Check-in Action */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 relative z-10 -mt-8 mb-8">
         {/* Left: Progress */}
         <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-center gap-1">
             <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Your Streak</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-bold text-purple-900">{streak}</span>
                <span className="text-sm font-medium text-purple-600">Days</span>
             </div>
             <p className="text-xs text-gray-500 mt-1">One day at a time.</p>
         </div>
         
         {/* Right: Add Check-in */}
         {onOpenCheckIn ? (
           <div className="flex flex-col gap-3">
             <button 
                onClick={onOpenCheckIn}
                className="flex-1 bg-purple-600 p-5 md:p-8 rounded-2xl shadow-sm border border-purple-700 flex flex-col justify-center items-start text-left gap-1 hover:bg-purple-700 transition-all group relative overflow-hidden"
             >
                 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Plus size={64} className="text-white" />
                 </div>
                 
                 <div className="flex items-center gap-2 text-purple-200 mb-2 z-10">
                    <div className="bg-purple-500/50 p-1 rounded-md">
                        <Plus size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">New Entry</span>
                 </div>
                 <span className="text-xl md:text-2xl font-bold text-white z-10">Add Check-in</span>
                 <p className="text-xs text-purple-200/70 mt-1 z-10">Log your status now</p>
             </button>
             <button 
                onClick={() => onChangeView(View.URGE_HELP)}
                className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors gap-2 font-semibold text-sm shadow-sm"
             >
                 <span>⚠️ Urge Help</span>
             </button>
           </div>
         ) : (
            <div className="bg-gray-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-center text-gray-500">
                <span className="text-sm">Read Only Mode</span>
            </div>
         )}
      </div>

      <div className="px-4 md:px-8 mt-4 md:mt-8">
      {/* Calendar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-purple-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-purple-900">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full text-purple-800"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full text-purple-800"><ChevronRight size={20} /></button>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {daysInMonth.map(day => {
                const status = getDayStatus(day);
                let bgClass = 'bg-gray-50 border-gray-100';
                let textClass = 'text-gray-500';
                
                if (status === CheckInStatus.CLEAN) {
                    bgClass = 'bg-emerald-500 border-emerald-600 shadow-sm';
                    textClass = 'text-white font-bold';
                } else if (status === CheckInStatus.SLIP) {
                    bgClass = 'bg-rose-400 border-rose-500 shadow-sm';
                    textClass = 'text-white font-bold';
                } else if (status === 'EMPTY') {
                    bgClass = 'bg-gray-100 border-purple-100 hover:bg-gray-200 cursor-pointer';
                    textClass = 'text-gray-600';
                }

                return (
                    <button 
                        key={day.toString()} 
                        onClick={() => handleDateClick(day)}
                        disabled={status === 'FUTURE'}
                        className={`aspect-square rounded-lg border flex items-center justify-center text-xs md:text-sm transition-all relative ${bgClass} ${textClass} ${status === 'FUTURE' ? 'opacity-30 cursor-default' : ''}`}
                    >
                        {format(day, 'd')}
                    </button>
                );
            })}
        </div>
      </div>

      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedDate(null)}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                    <h3 className="text-lg md:text-xl font-semibold text-purple-900">{format(selectedDate, 'EEEE, MMMM do')}</h3>
                    <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-gray-600"><X /></button>
                </div>
                
                <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh]">
                    {(() => {
                        const dayDetails = getDayDetails(selectedDate);
                        
                        if (dayDetails.length === 0) {
                            return <p className="text-purple-600 text-center py-8">No check-in recorded for this day.</p>;
                        }

                        // Determine Overall Status for the UI Banner
                        const isDayClean = !dayDetails.some(c => c.status === CheckInStatus.SLIP);

                        return (
                            <div className="space-y-6">
                                {/* Overall Status Banner */}
                                <div className={`p-4 rounded-xl border ${isDayClean ? 'bg-emerald-50 border-emerald-100 text-purple-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                                    <span className="font-bold block text-lg mb-1">{isDayClean ? "Clean Day" : "Slip Day"}</span>
                                    <span className="text-sm opacity-80">{isDayClean ? "A day of control." : "A learning day."}</span>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Log ({dayDetails.length})</h4>
                                    
                                    {/* List all Check-ins */}
                                    {dayDetails.map((detail, index) => {
                                        const isClean = detail.status === CheckInStatus.CLEAN;
                                        
                                        // Conditional Styling
                                        const containerClasses = isClean 
                                            ? "bg-emerald-50/50 border-emerald-100" 
                                            : "bg-rose-50/50 border-rose-100";
                                        
                                        const timeBadgeClasses = isClean
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700";
                                        
                                        const statusTextClass = isClean ? 'text-emerald-700' : 'text-rose-700';
                                        
                                        const labelClass = isClean ? "text-purple-600/70" : "text-rose-600/70";
                                        const valueClass = isClean ? "text-purple-900" : "text-rose-900";
                                        
                                        const tagClass = isClean 
                                            ? "bg-white border-emerald-100 text-purple-800" 
                                            : "bg-white border-rose-100 text-rose-800";
                                        
                                        const noteClass = isClean
                                            ? "text-purple-800 border-emerald-200"
                                            : "text-rose-800 border-rose-200";
                                            
                                        const aiBoxClass = isClean
                                            ? "bg-emerald-100/50 border-emerald-100 text-purple-900"
                                            : "bg-rose-100/50 border-rose-100 text-rose-900";

                                        return (
                                            <div key={detail.id} className={`border rounded-xl p-4 ${containerClasses}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${timeBadgeClasses}`}>
                                                        {format(new Date(detail.date), 'h:mm a')}
                                                    </span>
                                                    <span className={`text-xs font-bold ${statusTextClass}`}>
                                                        {isClean ? 'CLEAN' : 'SLIP'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                    <div>
                                                        <span className={`block text-[10px] uppercase mb-1 ${labelClass}`}>Emotion</span>
                                                        <span className={`font-medium ${valueClass}`}>{detail.emotions.join(', ')}</span>
                                                    </div>
                                                    <div>
                                                        <span className={`block text-[10px] uppercase mb-1 ${labelClass}`}>Time Context</span>
                                                        <span className={`font-medium ${valueClass}`}>{detail.timeOfDay || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className={`block text-[10px] uppercase mb-1 ${labelClass}`}>{isClean ? "Helpers" : "Triggers"}</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(isClean ? detail.copingStrategies : detail.triggers)?.map(t => (
                                                            <span key={t} className={`px-2 py-1 border text-xs rounded-md ${tagClass}`}>{t}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {detail.notes && (
                                                    <div className={`text-sm italic border-l-2 pl-3 ${noteClass}`}>
                                                        "{detail.notes}"
                                                    </div>
                                                )}
                                                
                                                {/* Individual AI Insight */}
                                                {detail.aiInsight && (
                                                    <div className={`mt-3 text-xs p-2 rounded border ${aiBoxClass}`}>
                                                        <span className="font-semibold mr-1">AI:</span> {detail.aiInsight}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};