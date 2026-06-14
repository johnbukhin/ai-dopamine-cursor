import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CheckIn, CheckInStatus, View } from '../types';
import { ChevronLeft, ChevronRight, X, Trophy, CircleCheck, Anchor, CalendarDays, Waves, BarChart3 } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isFuture } from 'date-fns';
import { ProgressPeak } from './HeroVariants';

interface DashboardProps {
  checkIns: CheckIn[];
  streak: number;
  /** Completed urge-surf sessions for this user. Loaded from `urge_log`
   *  in App.tsx (Issue #64) so the count follows the user across devices. */
  urgesCount: number;
  hasCheckedInToday: boolean;
  celebrationSignal: { type: 'clean' | 'slip'; ts: number } | null;
  onOpenCheckIn?: () => void;
  onChangeView: (view: View) => void;
  /** When false, the `Urges Surfed` tile becomes a clickable upsell button
   *  that routes to the Coach tab (which renders ProGate). Paid users see
   *  the existing static stat tile. */
  hasUpsellAccess: boolean;
}

// Rotating CTA phrases shown on the Check-in card before the day's first check-in.
// Sequential: current fades fully to 0, then the next phrase fades in from 0 in the same spot.
const CTA_PHRASES = ['Track today', 'Mark today', 'Log today', 'Note today'];
const CTA_FADE_MS = 800;
const CTA_CYCLE_MS = 3000;

// Celebration overlay shown inside the Streak card after a check-in.
// CLEAN → 5s confetti rain falling from top across full width (vibrant, celebratory)
// SLIP  → 5s translucent pastel bubbles rising from bottom (supportive, calmer)
const CLEAN_CELEBRATION_MS = 5000;
const SLIP_CELEBRATION_MS = 5000;
const CONFETTI_COLORS = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb923c', '#22d3ee'];
const SUPPORT_COLORS = ['#fda4af', '#fbcfe8', '#fed7aa', '#ddd6fe', '#a5b4fc'];

// Particle generators hoisted to module scope so they can be invoked from
// Dashboard's useMemo (precomputing particle arrays at mount). Keeps the
// first celebration trigger cheap — only DOM render remains, no Math.random
// loops or array allocation at trigger time.
const generateCleanParticles = () =>
  Array.from({ length: 400 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    startX: Math.random() * 100,                          // % across the top
    cx: (Math.random() - 0.5) * 80,                       // mild horizontal drift
    cy: 180 + Math.random() * 80,                         // 180..260px down
    rot: (Math.random() - 0.5) * 1080 + 540,
    delay: Math.random() * 3,                             // last starts ~3s, finishes by ~5s
    duration: 1.4 + Math.random() * 0.6,
    isCircle: Math.random() < 0.35,
  }));

const generateSlipParticles = () =>
  Array.from({ length: 175 }, (_, i) => ({
    id: i,
    color: SUPPORT_COLORS[i % SUPPORT_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 3.5,
    duration: 2.4 + Math.random() * 1.0,
    size: 10 + Math.random() * 8,
  }));

type CleanParticle = ReturnType<typeof generateCleanParticles>[number];
type SlipParticle = ReturnType<typeof generateSlipParticles>[number];

const Celebration: React.FC<{
  type: 'clean' | 'slip';
  cleanParticles: CleanParticle[];
  slipParticles: SlipParticle[];
}> = ({ type, cleanParticles, slipParticles }) => {
  // Decorative-only — screen readers should ignore the 575 particle spans.
  return (
    <div aria-hidden="true" role="presentation" className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {type === 'clean'
        ? cleanParticles.map((p) => (
            <span
              key={p.id}
              className={`absolute top-0 w-3 h-4 animate-confetti-fall ${p.isCircle ? 'rounded-full' : 'rounded-sm'}`}
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}, 0 0 14px ${p.color}66`,
                left: `${p.startX}%`,
                // CSS custom properties — React's CSSProperties type doesn't model these natively.
                ['--cx' as any]: `${p.cx}px`,
                ['--cy' as any]: `${p.cy}px`,
                ['--rot' as any]: `${p.rot}deg`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))
        : slipParticles.map((p) => (
            <span
              key={p.id}
              className="absolute bottom-0 rounded-full animate-support-rise"
              style={{
                backgroundColor: `${p.color}99`,                              // ~60% alpha — translucent
                boxShadow: `0 0 8px ${p.color}55, 0 0 14px ${p.color}33`,     // softer, calmer glow
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ checkIns, streak, urgesCount, hasCheckedInToday, celebrationSignal, onOpenCheckIn, onChangeView, hasUpsellAccess }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [ctaIndex, setCtaIndex] = useState(0);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [celebration, setCelebration] = useState<'clean' | 'slip' | null>(null);
  // Pre-generate particle arrays at mount (i.e. when the user lands on Progress)
  // so the first celebration trigger doesn't pay the Math.random + allocation cost.
  const cleanParticles = useMemo(() => generateCleanParticles(), []);
  const slipParticles = useMemo(() => generateSlipParticles(), []);
  // Tracks the last celebration signal we acted on. Prevents the same `ts`
  // from firing twice (e.g. if Dashboard rerenders while signal is still set).
  const lastSignalTsRef = useRef(0);

  useEffect(() => {
    if (hasCheckedInToday) return;

    let swapTimeoutId: number | undefined;
    const cycle = () => {
      setCtaVisible(false);                                                    // fade out current
      swapTimeoutId = window.setTimeout(() => {
        setCtaIndex((prev) => (prev + 1) % CTA_PHRASES.length);                // swap while invisible
        setCtaVisible(true);                                                   // fade in next
      }, CTA_FADE_MS);
    };

    const intervalId = window.setInterval(cycle, CTA_CYCLE_MS);
    return () => {
      window.clearInterval(intervalId);
      if (swapTimeoutId !== undefined) window.clearTimeout(swapTimeoutId);
    };
  }, [hasCheckedInToday]);

  // React to celebration signals fired by App.handleCheckInComplete. App owns
  // the trigger logic because it sees the authoritative pre-check-in state in
  // a single closure — no race between setCheckIns/setStreak rerenders.
  useEffect(() => {
    if (!celebrationSignal) return;
    if (celebrationSignal.ts === lastSignalTsRef.current) return;              // already handled this signal
    lastSignalTsRef.current = celebrationSignal.ts;

    const { type } = celebrationSignal;
    const duration = type === 'clean' ? CLEAN_CELEBRATION_MS : SLIP_CELEBRATION_MS;
    setCelebration(type);
    const id = window.setTimeout(() => setCelebration(null), duration);
    return () => window.clearTimeout(id);
  }, [celebrationSignal]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    if (h < 22) return 'Good evening';
    return 'Good night';
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
    
    // Rigorous honesty: any slip in the day marks it as SLIP, regardless of
    // any clean check-ins before or after it.
    const hasSlip = dayCheckIns.some(c => c.status === CheckInStatus.SLIP);
    if (hasSlip) return CheckInStatus.SLIP;

    // Any clean check-in marks the day as CLEAN — plan-task completion is no
    // longer a factor (plan is moving to a self-paced unit model).
    const hasClean = dayCheckIns.some(c => c.status === CheckInStatus.CLEAN);
    if (hasClean) return CheckInStatus.CLEAN;

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
      
      {/* Hand-drawn SVG hero — shares the cross-tab HeroVariants visual style. */}
      <div className="w-full relative mb-4">
        <ProgressPeak />
        <div className="absolute top-[41px] md:top-[57px] left-4 md:left-8 pointer-events-none">
          <span className="text-xs md:text-sm font-bold text-purple-700/80 uppercase tracking-wider">
            Hey
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">
            {greeting}
          </h2>
        </div>
      </div>
      
      {/* Top Section: Streak + Check-in (top row), Urges Faced + Urge Help
          stacked in the right column on desktop (single grid handles both
          rows). On mobile, Urges Faced and Urge Help both `col-span-2` —
          full-width rows below Streak + Check-in, preserving the original
          vertical stack. */}
      <div className="max-w-4xl mx-auto w-full px-4 md:px-8 relative z-10 -mt-8 mb-8 flex flex-col gap-3 md:gap-4">
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* Streak — light purple sibling of Check-in; same internal structure.
                `md:row-span-2` makes it tall enough that its bottom aligns with the
                Urge Help button in column 3 row 2 (right column = Urges Faced top +
                Urge Help bottom). On mobile the row-span no-ops (single column-pair flow). */}
            <div className="md:row-span-2 relative overflow-hidden bg-purple-100 p-5 md:p-6 rounded-2xl border border-purple-200 flex flex-col justify-between min-h-[126px] md:min-h-[144px]">
                {/* Decorative upward line-chart silhouette (📈), bottom-right, low contrast */}
                <svg
                   aria-hidden="true"
                   viewBox="0 0 60 60"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="6"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="absolute -bottom-3 -right-3 w-20 h-20 text-purple-600/20 pointer-events-none"
                >
                   <polyline points="6,48 20,38 32,42 44,24 54,12" />
                </svg>
                {celebration && <Celebration key={celebration} type={celebration} cleanParticles={cleanParticles} slipParticles={slipParticles} />}
                <div className="flex items-center gap-2 relative h-7">
                   <div className="bg-purple-300/60 p-1.5 rounded-lg">
                      <Trophy size={16} className="text-purple-700" />
                   </div>
                   <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">Your Streak</span>
                </div>
                <div className="flex items-baseline gap-1.5 relative">
                   <span className={`inline-block text-[23px] md:text-[27px] font-semibold text-purple-900 leading-tight ${celebration === 'clean' ? 'animate-streak-pop' : ''}`}>{streak}</span>
                   <span className="text-xl md:text-2xl font-semibold text-purple-700 leading-tight">{streak === 1 ? 'day' : 'days'}</span>
                </div>
            </div>

            {/* Check-in — primary CTA; mirrors Streak's structure on a darker purple */}
            {onOpenCheckIn ? (
               <button
                  onClick={onOpenCheckIn}
                  className="md:row-span-2 relative overflow-hidden bg-purple-600 hover:bg-purple-700 p-5 md:p-6 rounded-2xl shadow-md flex flex-col justify-between text-left min-h-[126px] md:min-h-[144px] transition-colors"
               >
                   {/* Decorative plus silhouette (➕), bottom-right, matches Streak's chart in size/position/stroke.
                       Pulses in sync with the rotating CTA phrase (3s cycle); static once the day has been checked in. */}
                   <svg
                      aria-hidden="true"
                      viewBox="0 0 60 60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className={`absolute -bottom-3 -right-3 w-20 h-20 text-white/20 pointer-events-none ${hasCheckedInToday ? '' : 'animate-pulse-130'}`}
                   >
                      <line x1="30" y1="10" x2="30" y2="50" />
                      <line x1="10" y1="30" x2="50" y2="30" />
                   </svg>
                   <div className="flex items-center gap-2 relative h-7">
                      <div className="bg-white/15 p-1.5 rounded-lg">
                         <CircleCheck size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-100"><span className="normal-case">30s</span> Check-in</span>
                   </div>
                   {hasCheckedInToday ? (
                      <p className="text-xl md:text-2xl font-semibold text-white leading-tight relative">Log more</p>
                   ) : (
                      <p className={`text-xl md:text-2xl font-semibold text-white leading-tight relative transition-opacity duration-[800ms] ease-in-out ${ctaVisible ? 'opacity-100' : 'opacity-0'}`}>
                         {CTA_PHRASES[ctaIndex]}
                      </p>
                   )}
               </button>
            ) : (
               <div className="bg-gray-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-center text-gray-500">
                   <span className="text-sm">Read Only Mode</span>
               </div>
            )}

            {/* Urges Surfed (Issue #34). Single-row compact layout: icon +
                label on the left, count + unit on the right. Visually
                styled as a sibling of the Streak tile (purple palette,
                same icon-badge tint, same stroke weight) so the row reads
                as one cohesive trio. */}
            {/* `Urges Surfed` tile. Paid users see a static stat; free users
                see a clickable button that routes to the Coach tab (which
                renders ProGate as the upsell). Hover treatment mirrors the
                `I'm having an urge — help me` button below — same hover-bg
                step and `transition-colors` — so the row reads as a
                consistent affordance family. */}
            {(() => {
              // `md:self-start` pins the tile to the top of its grid cell so
              // its top edge aligns with the row-span-2 Streak / Check-in
              // tiles. `md:col-start-3` keeps it in column 3 even with the
              // adjacent items spanning extra rows. `md:min-h-[64px]` makes
              // it tall enough that Urges Faced + gap(16) + Urge Help (64) =
              // 144px, matching Streak / Check-in `md:min-h-[144px]` so the
              // gap between the two right tiles stays identical to the gap
              // between Streak ↔ Check-in. Mobile keeps its natural height.
              const baseClasses = "col-span-2 md:col-span-1 md:col-start-3 md:self-start md:min-h-[64px] relative overflow-hidden bg-purple-100 px-4 py-3 md:py-4 rounded-2xl border border-purple-200 flex items-center justify-between gap-3";
              const inner = (
                <>
                  {/* Decorative wave silhouette — "urges rise and fall like
                      waves" reframe. Stroke weight matches the Streak chart
                      and Check-in plus for visual consistency across the row. */}
                  <svg
                     aria-hidden="true"
                     viewBox="0 0 60 60"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="6"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="absolute -bottom-2 -right-3 w-16 h-16 text-purple-600/20 pointer-events-none"
                  >
                     <path d="M2 36 Q12 22 22 36 T42 36 T62 36" />
                     <path d="M2 46 Q12 32 22 46 T42 46 T62 46" />
                  </svg>
                  <div className="flex items-center gap-2 relative">
                     <div className="bg-purple-300/60 p-1.5 rounded-lg">
                        <Waves size={16} className="text-purple-700" />
                     </div>
                     <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">Urges Faced</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 relative">
                     <span className="text-[23px] md:text-[27px] font-semibold text-purple-900 leading-tight">{urgesCount}</span>
                     <span className="text-xl md:text-2xl font-semibold text-purple-700 leading-tight">{urgesCount === 1 ? 'time' : 'times'}</span>
                  </div>
                </>
              );
              return hasUpsellAccess ? (
                <div className={baseClasses}>{inner}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => onChangeView(View.AI_COACH)}
                  className={`${baseClasses} text-left hover:bg-purple-200 transition-colors`}
                  aria-label="Unlock Urges Faced — open Coach"
                >
                  {inner}
                </button>
              );
            })()}

            {/* Urge Help — rose accent telegraphs "panic button". On mobile
                it spans the full row beneath Urges Faced (col-span-2). On
                desktop `md:col-start-3` pins it to the right column directly
                under Urges Faced; `md:self-end` pushes it to the bottom of
                its grid cell so its bottom edge aligns with the row-span-2
                Streak / Check-in tiles. `md:min-h-[64px]` matches Urges
                Faced so the two right tiles split the 144px column height
                evenly with the same 16px gap as Streak ↔ Check-in. */}
            <button
               onClick={() => onChangeView(View.URGE_HELP)}
               className="col-span-2 md:col-span-1 md:col-start-3 md:self-end md:min-h-[64px] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-rose-800 text-sm font-medium transition-colors"
            >
                <div className="bg-rose-200/70 p-1 rounded-md">
                   <Anchor size={14} className="text-rose-700" />
                </div>
                <span>I'm having an urge — help me</span>
            </button>
         </div>
      </div>

      <div className="px-4 md:px-8 mt-4 md:mt-8">
      {/* Calendar */}
      <div className="bg-[#FEFCFF] p-5 md:p-6 rounded-2xl border border-purple-200 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <div className="bg-purple-200/70 p-1.5 rounded-lg">
                  <CalendarDays size={16} className="text-purple-700" />
               </div>
               <h3 className="text-xl md:text-2xl font-semibold text-purple-900 leading-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-purple-100 rounded-full text-purple-800"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-purple-100 rounded-full text-purple-800"><ChevronRight size={20} /></button>
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
                let bgClass = 'bg-white border-purple-100';
                let textClass = 'text-gray-500';

                if (status === CheckInStatus.CLEAN) {
                    bgClass = 'bg-emerald-500 border-emerald-600 shadow-sm';
                    textClass = 'text-white font-bold';
                } else if (status === CheckInStatus.SLIP) {
                    bgClass = 'bg-rose-400 border-rose-500 shadow-sm';
                    textClass = 'text-white font-bold';
                } else if (status === 'EMPTY') {
                    bgClass = 'bg-slate-100 border-slate-200 hover:bg-slate-200 cursor-pointer';
                    textClass = 'text-slate-600';
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
                                {/* Overall Status Banner. Headline + body
                                    column on the left; Insights button pinned
                                    to the right edge, aligned to the heading's
                                    optical centre. Click closes the modal and
                                    routes to Insights (paid) / ProGate (free). */}
                                <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${isDayClean ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                                    <div className="min-w-0">
                                        <span className="font-bold block text-lg mb-1">{isDayClean ? "Clean Day" : "Slip Day"}</span>
                                        <span className="text-sm opacity-80">{isDayClean ? "A day of control." : "A learning day."}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(null);
                                            onChangeView(View.INSIGHTS);
                                        }}
                                        aria-label="View your patterns and insights"
                                        className="animate-coach-reset-pulse flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold
                                                   bg-white border-2 hover:bg-purple-50
                                                   px-3 py-1.5 rounded-full shadow-sm self-center"
                                    >
                                        <BarChart3 size={14} />
                                        <span>Insights</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Log ({dayDetails.length})</h4>
                                    
                                    {/* List all Check-ins */}
                                    {dayDetails.map((detail) => {
                                        const isClean = detail.status === CheckInStatus.CLEAN;
                                        
                                        // Conditional Styling
                                        const containerClasses = isClean 
                                            ? "bg-emerald-50/50 border-emerald-100" 
                                            : "bg-rose-50/50 border-rose-100";
                                        
                                        const timeBadgeClasses = isClean
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-rose-100 text-rose-700";
                                        
                                        const statusTextClass = isClean ? 'text-emerald-700' : 'text-rose-700';
                                        
                                        const labelClass = isClean ? "text-emerald-700/70" : "text-rose-600/70";
                                        const valueClass = isClean ? "text-emerald-900" : "text-rose-900";

                                        const tagClass = isClean
                                            ? "bg-white border-emerald-100 text-emerald-800"
                                            : "bg-white border-rose-100 text-rose-800";

                                        const noteClass = isClean
                                            ? "text-emerald-800 border-emerald-200"
                                            : "text-rose-800 border-rose-200";

                                        const aiBoxClass = isClean
                                            ? "bg-emerald-100/50 border-emerald-100 text-emerald-900"
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
                                                        <span className="font-semibold">Observation.</span> {detail.aiInsight}
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