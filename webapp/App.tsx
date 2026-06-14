import React, { useState, useEffect, useCallback } from 'react';
import { View, CheckIn, CheckInStatus, ChatMessage, UrgeContextSeed, UrgeLogEntry } from './types';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { DailyCheckIn } from './components/DailyCheckIn';
import { Dashboard } from './components/Dashboard';
import { AICoach } from './components/AICoach';
import { UrgeHelp } from './components/UrgeHelp';
import { isSameDay, subDays } from 'date-fns';
import { Plan28 } from './components/Plan28';
import { Settings } from './components/Settings';
import { ProGate } from './components/ProGate';
import { supabase } from './src/lib/supabase';
import { planData, getRequiredTaskKeys, DayCompletion } from './data/planData';
import { lessonsData } from './data/lessonsData';
import { invalidateMemoryCache } from './services/claudeService';
import {
  fetchLog as fetchUrgeLog,
  insertEntry as insertUrgeEntry,
  readLocalLog as readLocalUrgeLog,
  clearLocalLog as clearLocalUrgeLog,
  uploadLocalLog as uploadLocalUrgeLog,
  fetchLetter,
  upsertLetter,
  readLocalLetter,
  clearLocalLetter,
  uploadLocalLetter,
  type FutureSelfLetter,
  type FutureSelfLetterDraft,
} from './src/lib/urgeLog';
import { COACH_WELCOME_MESSAGE as WELCOME_MESSAGE } from './constants';

// Dev-only: skip the login screen when VITE_DEV_BYPASS_AUTH=true in .env.local.
// Hard-gated on import.meta.env.DEV so the flag is *physically impossible* to
// activate in a production build, even if VITE_DEV_BYPASS_AUTH is accidentally
// set in Vercel env or in a non-local .env file.
const BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH);
  const [currentView, setCurrentView] = useState<View>(BYPASS_AUTH ? View.PLAN_21 : View.LOGIN);

  // Smooth cross-fade between tabs via the View Transitions API. The browser
  // snapshots the old + new view and animates them out/in simultaneously so
  // any element that differs (hero illustration, layout, content) appears to
  // dissolve between states. Falls back to an instant switch on browsers
  // without support (Safari < 18, older Chrome).
  const withTransition = (fn: () => void) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(fn);
    } else {
      fn();
    }
  };
  const changeView = (next: View) => withTransition(() => setCurrentView(next));
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInPayload, setCheckInPayload] = useState<{ tasksCompleted: boolean } | null>(null);

  // ── Persisted app data ────────────────────────────────────────────────────
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);
  const [completedPlanTasks, setCompletedPlanTasks] = useState<Record<number, Set<string>>>({});
  // Active plan cycle start — used to scope plan_progress queries/writes.
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  // ── Urge → Coach handoff (Issue #61 follow-up) ──────────────────────────
  // Held at App level (not inside UrgeHelp) so the seed + auto-message
  // survive the View change when the user escalates from Help → Coach tab.
  // Cleared by AICoach via the consume callback right after auto-send fires,
  // so navigating away and back to Coach doesn't re-fire the same message.
  const [coachSeed, setCoachSeed] = useState<UrgeContextSeed | null>(null);
  const [coachAutoMessage, setCoachAutoMessage] = useState<string | null>(null);
  const escalateToCoach = useCallback((seed: UrgeContextSeed, autoMessage: string) => {
    setCoachSeed(seed);
    setCoachAutoMessage(autoMessage);
    changeView(View.AI_COACH);
  }, []);
  const consumeCoachAutoMessage = useCallback(() => {
    setCoachSeed(null);
    setCoachAutoMessage(null);
  }, []);
  const [hasUpsellAccess, setHasUpsellAccess] = useState(
    () => localStorage.getItem('mc_has_upsell') === '1'
  );
  const setUpsellAccess = (val: boolean) => {
    setHasUpsellAccess(val);
    if (val) localStorage.setItem('mc_has_upsell', '1');
    else localStorage.removeItem('mc_has_upsell');
  };
  const [userEmail, setUserEmail] = useState('');
  const [autoOpenWelcomeLesson, setAutoOpenWelcomeLesson] = useState(false);

  // Day-level completion timestamps — loaded from day_completions table.
  // lesson_completed_at : when the lesson was finished (drives next-day green stone).
  // all_tasks_completed_at : when lesson + all tasks were done (drives same-day green).
  const [dayCompletions, setDayCompletions] = useState<Record<number, DayCompletion>>({});

  // Completed urge-surf sessions (Issue #64). Owned at App level so the
  // Dashboard tile count and UrgeHelp's `priorSurfCount` read from a single
  // source of truth and stay in sync across cross-device fetches and
  // optimistic appends.
  const [urgeLogEntries, setUrgeLogEntries] = useState<UrgeLogEntry[]>([]);

  // Future-Self Letter (Issue #65). Three-state sentinel:
  //   undefined → not yet loaded — FutureSelfLetterScreen shows a spinner
  //   null      → loaded, no letter exists — screen shows first-time write
  //   object    → loaded, letter exists — screen shows display + Edit
  // The `undefined` state is critical: if we initialized to `null`, the
  // screen would flash the first-time-write UI before the fetch resolved
  // and mislead a returning user into thinking their letter was lost.
  const [futureSelfLetter, setFutureSelfLetter] = useState<FutureSelfLetter | null | undefined>(undefined);

  // Append a completed urge-surf session. Optimistically updates local state
  // so the Dashboard tile + UrgeHelp celebration reflect the new total without
  // waiting on the network, then fires the Supabase insert best-effort
  // (matching the DailyCheckIn → check_ins pattern). Returns the freshly-
  // incremented count so the caller can drive the celebration overlay without
  // a second state read.
  const handleAppendUrge = useCallback(
    (entry: UrgeLogEntry): number => {
      const newTotal = urgeLogEntries.length + 1;
      setUrgeLogEntries((prev) => [...prev, entry]);
      if (supabase) {
        (async () => {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) return;
          await insertUrgeEntry(user.id, entry);
        })();
      }
      return newTotal;
    },
    [urgeLogEntries.length],
  );

  // Save the Future-Self Letter (Issue #65). Stamps a fresh `updatedAt`,
  // optimistically updates local state so the screen flips to display mode
  // immediately, then fires the Supabase upsert best-effort (same pattern
  // as DailyCheckIn → check_ins).
  const handleSaveLetter = useCallback(
    (draft: FutureSelfLetterDraft): void => {
      const next: FutureSelfLetter = { ...draft, updatedAt: new Date().toISOString() };
      setFutureSelfLetter(next);
      if (supabase) {
        (async () => {
          const { data: { user } } = await supabase!.auth.getUser();
          if (!user) return;
          await upsertLetter(user.id, next);
        })();
      }
    },
    [],
  );

  // ── Load all persisted data after authentication ──────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !supabase) return;

    const loadUserData = async () => {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return;

      setUserEmail(user.email ?? '');

      interface SubRow { plan_label: string; current_period_end: string | null; }

      // Run all data fetches in parallel for speed
      const [checkInsResult, appStateResult, coachResult, subsResult, urgeLogServer, letterServer] = await Promise.all([
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

        // Subscriptions: check for active upsell access
        supabase!
          .from('subscriptions')
          .select('plan_label, current_period_end')
          .eq('user_email', user.email ?? '')
          .order('paid_at', { ascending: false }),

        // Urge log: all completed urge-surf sessions for this user (Issue #64).
        // Helper lives in src/lib/urgeLog so the column shape stays in one place.
        fetchUrgeLog(user.id),

        // Future-Self Letter: singleton record per user (Issue #65). Null
        // when the user has never written one — screen handles by showing
        // the first-time guided write flow.
        fetchLetter(user.id),
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

      // ── Urge log + one-shot localStorage → Supabase migration ─────────────
      // Anyone on a pre-#64 build accumulated entries in `mc.urge_log.v1`.
      // Bulk-upsert those into the server, then drop the local key. The
      // composite (user_id, id) PK makes the upsert idempotent, so this is
      // safe to re-run if cleanup ever fails partway.
      const localPending = readLocalUrgeLog();
      let mergedLog: UrgeLogEntry[] = urgeLogServer;
      if (localPending.length > 0) {
        const uploaded = await uploadLocalUrgeLog(user.id, localPending);
        if (uploaded) {
          clearLocalUrgeLog();
          const seen = new Set(urgeLogServer.map((e) => e.id));
          const fresh = localPending.filter((e) => !seen.has(e.id));
          mergedLog = [...urgeLogServer, ...fresh].sort((a, b) =>
            a.endedAt.localeCompare(b.endedAt),
          );
        }
      }
      setUrgeLogEntries(mergedLog);

      // ── Future-Self Letter + one-shot localStorage → Supabase migration ─
      // Last-write-wins by `updatedAt`. We compare BEFORE uploading so a
      // stale local letter can never overwrite a newer server one (the
      // common case when the user wrote on device B after device A was
      // already migrated).
      const localLetter = readLocalLetter();
      let mergedLetter: FutureSelfLetter | null = letterServer;
      if (localLetter) {
        const localNewer = !letterServer || localLetter.updatedAt > letterServer.updatedAt;
        if (localNewer) {
          const uploaded = await uploadLocalLetter(user.id, localLetter);
          if (uploaded) {
            clearLocalLetter();
            mergedLetter = localLetter;
          }
        } else {
          // Server already has a newer letter — local is stale, drop it.
          clearLocalLetter();
        }
      }
      setFutureSelfLetter(mergedLetter);

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
        setAutoOpenWelcomeLesson(true);
      }

      setPlanStartedAt(activePlanStartedAt);

      // Fetch plan_progress and day_completions in parallel — both depend only on activePlanStartedAt
      const [{ data: progressRows }, { data: dayCompletionRows }] = await Promise.all([
        supabase!
          .from('plan_progress')
          .select('day_number, task_key')
          .eq('user_id', user.id)
          .eq('plan_started_at', activePlanStartedAt),
        supabase!
          .from('day_completions')
          .select('day_number, lesson_completed_at, all_tasks_completed_at')
          .eq('user_id', user.id)
          .eq('plan_started_at', activePlanStartedAt),
      ]);

      if (progressRows) {
        const rebuilt: Record<number, Set<string>> = {};
        for (const row of progressRows) {
          if (!rebuilt[row.day_number]) rebuilt[row.day_number] = new Set();
          rebuilt[row.day_number].add(row.task_key);
        }
        setCompletedPlanTasks(rebuilt);
      }

      if (dayCompletionRows) {
        const rebuilt: Record<number, DayCompletion> = {};
        for (const row of dayCompletionRows) {
          rebuilt[row.day_number] = {
            lesson_completed_at: row.lesson_completed_at,
            all_tasks_completed_at: row.all_tasks_completed_at ?? null,
          };
        }
        setDayCompletions(rebuilt);
      }

      // ── Coach messages ─────────────────────────────────────────────────────
      if (coachResult.data?.messages?.length > 0) {
        // Prepend the hardcoded welcome message — it's never stored in DB
        setChatHistory([WELCOME_MESSAGE, ...coachResult.data.messages]);
      }
      // If no stored messages, chatHistory stays as [WELCOME_MESSAGE] (default)

      // ── Upsell access ──────────────────────────────────────────────────────
      const checkUpsellAccess = (rows: SubRow[]): boolean => {
        const upsellLabels = ['AI Companion (Intro Month)', 'AI Companion (Monthly)'];
        const now = new Date();
        return rows.some(
          s =>
            upsellLabels.includes(s.plan_label) &&
            (!s.current_period_end || new Date(s.current_period_end) > now)
        );
      };

      if (subsResult.data) {
        const active = checkUpsellAccess(subsResult.data as SubRow[]);
        if (active) withTransition(() => setUpsellAccess(true));
        // create-upsell writes immediately but may be slightly behind webapp load.
        // Retry once after 8s — only if still locked.
        else {
          setTimeout(async () => {
            const { data: retryRows } = await supabase!
              .from('subscriptions')
              .select('plan_label, current_period_end')
              .eq('user_email', user.email ?? '')
              .order('paid_at', { ascending: false });
            if (retryRows && checkUpsellAccess(retryRows as SubRow[])) {
              withTransition(() => setUpsellAccess(true));
            }
          }, 8000);
        }
      }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // A SLIP today zeros the streak immediately — no need to walk further back.
    const todayStatus = getAggregatedDayStatus(today, checkIns);
    if (todayStatus === CheckInStatus.SLIP) {
      setStreak(0);
      return;
    }

    // Walk back from yesterday counting consecutive CLEAN days.
    let currentStreak = 0;
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

    // Today's CLEAN counts toward the streak immediately on success — the user
    // shouldn't have to wait until tomorrow for today's day to be credited.
    if (todayStatus === CheckInStatus.CLEAN) currentStreak++;

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
    setDayCompletions({});
    setPlanStartedAt(null);
    setChatHistory([WELCOME_MESSAGE]);
    setUrgeLogEntries([]);
    setFutureSelfLetter(undefined);
    setUpsellAccess(false);
    setUserEmail('');
    setIsAuthenticated(false);
    setCurrentView(View.LOGIN);
    // Drop the module-level Coach memory cache so the next signed-in user
    // doesn't inherit the previous user's summary.
    invalidateMemoryCache();
  };

  // Grant access immediately on successful ProGate upgrade — the Stripe webhook
  // that writes the Supabase row arrives seconds later, so re-querying here would
  // race and almost always miss the row. We trust data.success === true from
  // create-upsell, so optimistic state update is correct.
  // Wrap in transition so the ProGate → AICoach/UrgeHelp swap cross-fades
  // (same animation as switching tabs) — the locked grayscale hero dissolves
  // into the live coloured hero.
  const grantUpsellAccess = () => withTransition(() => setUpsellAccess(true));

  // Celebration signal passed to Dashboard. Decided here (not in Dashboard)
  // so we have the authoritative pre-check-in state without racing the
  // setCheckIns / setStreak rerenders. `ts` makes each signal unique even if
  // the same type fires twice in a row, so the effect re-runs.
  const [celebrationSignal, setCelebrationSignal] = useState<{ type: 'clean' | 'slip'; ts: number } | null>(null);

  // ── Check-in handlers ─────────────────────────────────────────────────────
  const handleOpenCheckIn = (payload: { tasksCompleted: boolean }) => {
    setCheckInPayload(payload);
    setShowCheckInModal(true);
  };

  // One-shot celebration emit. The signal is cleared shortly after dispatch so
  // Dashboard remounts (e.g. tab switching) don't replay an already-played
  // celebration. 100ms is enough for Dashboard's effect to read it on the
  // current render cycle; far less than any remount the user could perform.
  const fireCelebration = (type: 'clean' | 'slip') => {
    const sig = { type, ts: Date.now() };
    setCelebrationSignal(sig);
    window.setTimeout(() => {
      setCelebrationSignal(curr => (curr?.ts === sig.ts ? null : curr));
    }, 100);
  };

  const handleCheckInComplete = (newCheckIn: CheckIn) => {
    // Update UI immediately — DB write happens inside DailyCheckIn component
    setCheckIns(prev => [...prev, newCheckIn]);
    setShowCheckInModal(false);
    setCheckInPayload(null);

    // Decide if this check-in earns a celebration. Rules (mirroring streak logic):
    //   CLEAN → fire only if today has no prior CLEAN/SLIP (streak just got credited)
    //   SLIP  → fire only if today has no prior SLIP AND there was a streak to wipe
    const today = new Date();
    if (!isSameDay(new Date(newCheckIn.date), today)) return;
    const todayBefore = checkIns.filter(c => isSameDay(new Date(c.date), today));
    const hadCleanToday = todayBefore.some(c => c.status === CheckInStatus.CLEAN);
    const hadSlipToday = todayBefore.some(c => c.status === CheckInStatus.SLIP);

    if (newCheckIn.status === CheckInStatus.CLEAN && !hadCleanToday && !hadSlipToday) {
      fireCelebration('clean');
    } else if (newCheckIn.status === CheckInStatus.SLIP && !hadSlipToday && streak > 0) {
      fireCelebration('slip');
    }
  };

  // ── Plan task handlers ────────────────────────────────────────────────────
  const handlePlanTaskToggle = async (dayNumber: number, taskKey: string) => {
    if (!supabase || !planStartedAt) return;

    const isCurrentlyChecked = completedPlanTasks[dayNumber]?.has(taskKey) ?? false;

    // Compute the new set of completed tasks for this day BEFORE the state
    // update so we can use it synchronously in the day_completions logic below.
    const newDaySet = new Set(completedPlanTasks[dayNumber] ?? []);
    if (isCurrentlyChecked) {
      newDaySet.delete(taskKey);
    } else {
      newDaySet.add(taskKey);
    }

    // Optimistic UI update first
    setCompletedPlanTasks(prev => {
      const updated = { ...prev };
      updated[dayNumber] = new Set(newDaySet);
      return updated;
    });

    // Persist to DB — non-blocking
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isCurrentlyChecked) {
      await supabase
        .from('plan_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('plan_started_at', planStartedAt)
        .eq('day_number', dayNumber)
        .eq('task_key', taskKey);
    } else {
      // UNIQUE constraint prevents duplicates
      await supabase
        .from('plan_progress')
        .upsert({
          user_id: user.id,
          plan_started_at: planStartedAt,
          day_number: dayNumber,
          task_key: taskKey,
        });
    }

    // ── day_completions sync ───────────────────────────────────────────────
    // Determine whether the day is now fully complete (all required tasks done).
    const dayEntry = planData.find(d => d.day === dayNumber);
    if (!dayEntry) return;

    const hasLesson = lessonsData.some(l => (l.day ?? l.lessonNumber) === dayNumber);
    const requiredKeys = getRequiredTaskKeys(dayEntry, hasLesson);
    const allDone = requiredKeys.length > 0 && requiredKeys.every(k => newDaySet.has(k));
    const now = new Date().toISOString();

    if (taskKey === 'lesson') {
      if (!isCurrentlyChecked) {
        // Optimistic update before DB write so the stone turns green immediately
        // even if the table doesn't exist yet or the write is slow.
        setDayCompletions(prev => ({
          ...prev,
          [dayNumber]: {
            lesson_completed_at: now,
            all_tasks_completed_at: allDone ? now : null,
          },
        }));
        await supabase.from('day_completions').upsert({
          user_id: user.id,
          plan_started_at: planStartedAt,
          day_number: dayNumber,
          lesson_completed_at: now,
          all_tasks_completed_at: allDone ? now : null,
        });
      } else {
        // Lesson unchecked — remove optimistically, then delete from DB.
        setDayCompletions(prev => {
          const updated = { ...prev };
          delete updated[dayNumber];
          return updated;
        });
        await supabase
          .from('day_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('plan_started_at', planStartedAt)
          .eq('day_number', dayNumber);
      }
    } else {
      // Non-lesson task toggled. Update all_tasks_completed_at only when a
      // lesson row already exists for this day (lesson is required).
      const existing = dayCompletions[dayNumber];
      if (existing) {
        // Preserve the original timestamp if the day was already fully done;
        // don't overwrite an earlier completion time.
        const newAllDoneAt = allDone ? (existing.all_tasks_completed_at ?? now) : null;

        if (newAllDoneAt !== existing.all_tasks_completed_at) {
          // Optimistic update first, then persist.
          setDayCompletions(prev => ({
            ...prev,
            [dayNumber]: { ...existing, all_tasks_completed_at: newAllDoneAt },
          }));
          await supabase
            .from('day_completions')
            .update({ all_tasks_completed_at: newAllDoneAt })
            .eq('user_id', user.id)
            .eq('plan_started_at', planStartedAt)
            .eq('day_number', dayNumber);
        }
      }
    }
  };

  const hasCheckedInToday = checkIns.some(c => isSameDay(new Date(c.date), new Date()));

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen h-dvh w-full bg-purple-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={changeView}
        onLogout={handleLogout}
        hasUpsellAccess={hasUpsellAccess}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 w-full">
        {/* Gradient fade from status-bar color (#FAF5FF) into content — mobile only.
            Masks the hard edge between the iOS status bar and the tab content.
            pointer-events-none so it never blocks scroll or tap targets. */}
        <div className="md:hidden pointer-events-none absolute top-0 left-0 right-0 h-10 z-20
                        bg-gradient-to-b from-[#FAF5FF] to-transparent" />
        {currentView === View.DASHBOARD && (
          <Dashboard
            checkIns={checkIns}
            streak={streak}
            urgesCount={urgeLogEntries.length}
            hasCheckedInToday={hasCheckedInToday}
            celebrationSignal={celebrationSignal}
            onOpenCheckIn={() => handleOpenCheckIn({ tasksCompleted: false })}
            onChangeView={changeView}
            hasUpsellAccess={hasUpsellAccess}
          />
        )}

        {currentView === View.AI_COACH && (
          hasUpsellAccess ? (
            <AICoach
              checkInHistory={checkIns}
              messages={chatHistory}
              setMessages={setChatHistory}
              currentUrgeContext={coachSeed}
              autoMessage={coachAutoMessage}
              onAutoMessageConsumed={consumeCoachAutoMessage}
            />
          ) : (
            <ProGate
              featureName="AI Coach"
              featureDescription="Get personalized coaching from your AI companion. Analyze your patterns, reflect on triggers, and build lasting strategies — all tailored to your journey."
              userEmail={userEmail}
              onUnlocked={grantUpsellAccess}
            />
          )
        )}

        {currentView === View.URGE_HELP && (
          hasUpsellAccess ? (
            <UrgeHelp
              priorSurfCount={urgeLogEntries.length}
              onAppendUrge={handleAppendUrge}
              letter={futureSelfLetter}
              onSaveLetter={handleSaveLetter}
              onEscalateToCoach={escalateToCoach}
            />
          ) : (
            <ProGate
              featureName="Urge Help"
              featureDescription="Immediate support when cravings hit hardest. Your AI companion guides you through proven, science-backed techniques to break the urge cycle in real time."
              userEmail={userEmail}
              onUnlocked={grantUpsellAccess}
            />
          )
        )}

        {currentView === View.PLAN_21 && (
          <Plan28
            onOpenCheckIn={handleOpenCheckIn}
            hasCheckedInToday={hasCheckedInToday}
            completedTasks={completedPlanTasks}
            onTaskToggle={handlePlanTaskToggle}
            dayCompletions={dayCompletions}
            autoOpenWelcomeLesson={autoOpenWelcomeLesson}
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
