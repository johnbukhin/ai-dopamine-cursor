import React, { useState, useEffect } from 'react';
import { View, CheckIn, CheckInStatus, ChatMessage } from './types';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Dashboard } from './components/Dashboard';
import { AICoach } from './components/AICoach';
import { UrgeHelp } from './components/UrgeHelp';
import { isSameDay, subDays } from 'date-fns';
import { Plan28 } from './components/Plan28';
import { Settings } from './components/Settings';
import { supabase } from './src/lib/supabase';

// Hardcoded welcome message — never stored in DB, always prepended at load time.
const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hello. I'm your Mind Compass coach.\n\nI'm here to help you reflect, analyze patterns, and maintain control.\n\nWhat's on your mind today?",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInPayload, setCheckInPayload] = useState<{ tasksCompleted: boolean } | null>(null);

  // ── Persisted app data ────────────────────────────────────────────────────
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);
  const [completedPlanTasks, setCompletedPlanTasks] = useState<Record<number, Set<string>>>({});
  // Active plan cycle start — used to scope plan_progress queries/writes.
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  // ── Load all persisted data after authentication ──────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !supabase) return;

    const loadUserData = async () => {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return;

      // Run all three data fetches in parallel for speed
      const [checkInsResult, appStateResult, coachResult] = await Promise.all([
        // Check-ins: all rows for this user, oldest first so streak calc is correct
        supabase!
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),

        // App state: single row per user — contains active plan_started_at
        supabase!
          .from('user_app_state')
          .select('plan_started_at')
          .eq('user_id', user.id)
          .maybeSingle(),

        // Coach messages: single row per user — contains full messages jsonb array
        supabase!
          .from('coach_messages')
          .select('messages')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      // ── Check-ins ──────────────────────────────────────────────────────────
      if (checkInsResult.data) {
        const loaded: CheckIn[] = checkInsResult.data.map((row: any) => ({
          id: row.id,
          date: new Date(row.date),
          status: row.status as CheckInStatus,
          triggers: row.triggers ?? [],
          emotions: row.emotions ?? [],
          reaction: row.reaction ?? undefined,
          copingStrategies: row.coping_strategies ?? undefined,
          notes: row.notes ?? undefined,
          aiInsight: row.ai_insight ?? undefined,
          timeOfDay: row.time_of_day ?? undefined,
          tasksCompleted: row.tasks_completed ?? false,
        }));
        setCheckIns(loaded);
      }

      // ── Plan progress ──────────────────────────────────────────────────────
      let activePlanStartedAt: string;

      if (appStateResult.data?.plan_started_at) {
        // Existing cycle found — use it
        activePlanStartedAt = appStateResult.data.plan_started_at;
      } else {
        // First login: create a user_app_state row with plan_started_at = now
        const { data: inserted } = await supabase!
          .from('user_app_state')
          .upsert({ user_id: user.id, plan_started_at: new Date().toISOString() })
          .select('plan_started_at')
          .single();
        activePlanStartedAt = inserted?.plan_started_at ?? new Date().toISOString();
      }

      setPlanStartedAt(activePlanStartedAt);

      // Fetch plan_progress rows for the active cycle
      const { data: progressRows } = await supabase!
        .from('plan_progress')
        .select('day_number, task_key')
        .eq('user_id', user.id)
        .eq('plan_started_at', activePlanStartedAt);

      if (progressRows) {
        const rebuilt: Record<number, Set<string>> = {};
        for (const row of progressRows) {
          if (!rebuilt[row.day_number]) rebuilt[row.day_number] = new Set();
          rebuilt[row.day_number].add(row.task_key);
        }
        setCompletedPlanTasks(rebuilt);
      }

      // ── Coach messages ─────────────────────────────────────────────────────
      if (coachResult.data?.messages?.length > 0) {
        // Prepend the hardcoded welcome message — it's never stored in DB
        setChatHistory([WELCOME_MESSAGE, ...coachResult.data.messages]);
      }
      // If no stored messages, chatHistory stays as [WELCOME_MESSAGE] (default)
    };

    loadUserData();
  }, [isAuthenticated]);

  // ── Streak calculation ────────────────────────────────────────────────────
  const getAggregatedDayStatus = (date: Date, allCheckIns: CheckIn[]): CheckInStatus | null => {
    const dayCheckIns = allCheckIns.filter(c => isSameDay(new Date(c.date), date));
    if (dayCheckIns.length === 0) return null;
    const hasSlip = dayCheckIns.some(c => c.status === CheckInStatus.SLIP);
    return hasSlip ? CheckInStatus.SLIP : CheckInStatus.CLEAN;
  };

  useEffect(() => {
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = subDays(today, 1);

    while (true) {
      const status = getAggregatedDayStatus(checkDate, checkIns);
      if (status === CheckInStatus.CLEAN) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [checkIns]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView(View.PLAN_21);
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    localStorage.removeItem('compass_access_token');
    localStorage.removeItem('compass_refresh_token');
    // Reset all in-memory state on logout
    setCheckIns([]);
    setCompletedPlanTasks({});
    setPlanStartedAt(null);
    setChatHistory([WELCOME_MESSAGE]);
    setIsAuthenticated(false);
    setCurrentView(View.LOGIN);
  };

  // ── Check-in handlers ─────────────────────────────────────────────────────
  const handleOpenCheckIn = (payload: { tasksCompleted: boolean }) => {
    setCheckInPayload(payload);
    setShowCheckInModal(true);
  };

  const handleCheckInComplete = (newCheckIn: CheckIn) => {
    // Update UI immediately — DB write happens inside DailyCheckIn component
    setCheckIns(prev => [...prev, newCheckIn]);
    setShowCheckInModal(false);
    setCheckInPayload(null);
  };

  // ── Plan task handlers ────────────────────────────────────────────────────
  const handlePlanTaskToggle = async (dayNumber: number, taskKey: string) => {
    if (!supabase || !planStartedAt) return;

    const isCurrentlyChecked = completedPlanTasks[dayNumber]?.has(taskKey) ?? false;

    // Optimistic UI update first
    setCompletedPlanTasks(prev => {
      const updated = { ...prev };
      const daySet = new Set(updated[dayNumber] ?? []);
      if (isCurrentlyChecked) {
        daySet.delete(taskKey);
      } else {
        daySet.add(taskKey);
      }
      updated[dayNumber] = daySet;
      return updated;
    });

    // Persist to DB — non-blocking
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isCurrentlyChecked) {
      // Remove completion
      await supabase
        .from('plan_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('plan_started_at', planStartedAt)
        .eq('day_number', dayNumber)
        .eq('task_key', taskKey);
    } else {
      // Record completion — UNIQUE constraint prevents duplicates
      await supabase
        .from('plan_progress')
        .upsert({
          user_id: user.id,
          plan_started_at: planStartedAt,
          day_number: dayNumber,
          task_key: taskKey,
        });
    }
  };

  const hasCheckedInToday = checkIns.some(c => isSameDay(new Date(c.date), new Date()));

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-purple-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[4.5rem] md:pb-0 w-full">
        {currentView === View.DASHBOARD && (
          <Dashboard
            checkIns={checkIns}
            streak={streak}
            onOpenCheckIn={() => handleOpenCheckIn({ tasksCompleted: false })}
            onChangeView={setCurrentView}
          />
        )}

        {currentView === View.AI_COACH && (
          <AICoach
            checkInHistory={checkIns}
            messages={chatHistory}
            setMessages={setChatHistory}
          />
        )}

        {currentView === View.URGE_HELP && (
          <UrgeHelp onChangeView={setCurrentView} />
        )}

        {currentView === View.PLAN_21 && (
          <Plan28
            streak={streak}
            onOpenCheckIn={handleOpenCheckIn}
            hasCheckedInToday={hasCheckedInToday}
            completedTasks={completedPlanTasks}
            onTaskToggle={handlePlanTaskToggle}
          />
        )}

        {currentView === View.FUTURE && (
          <div className="flex-1 flex items-center justify-center text-stone-400 p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
              <p>This very module is under development.</p>
            </div>
          </div>
        )}

        {currentView === View.SETTINGS && (
          <Settings onLogout={handleLogout} />
        )}

        {showCheckInModal && (
          <DailyCheckIn
            onComplete={handleCheckInComplete}
            onClose={() => {
              setShowCheckInModal(false);
              setCheckInPayload(null);
            }}
            payload={checkInPayload}
          />
        )}
      </main>
    </div>
  );
}
