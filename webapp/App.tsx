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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInPayload, setCheckInPayload] = useState<{ tasksCompleted: boolean } | null>(null);
  
  // App State / Data
  // Initial state cleared to prevent confusion with dummy dates
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);

  // Chat State (lifted up for persistence)
  const [completedPlanTasks, setCompletedPlanTasks] = useState<Record<number, Set<string>>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hello. I'm your Mind Compass coach.\n\nI'm here to help you reflect, analyze patterns, and maintain control.\n\nWhat's on your mind today?" 
    }
  ]);

  // Helper to get aggregated status for a specific date
  const getAggregatedDayStatus = (date: Date, allCheckIns: CheckIn[]): CheckInStatus | null => {
    const dayCheckIns = allCheckIns.filter(c => isSameDay(new Date(c.date), date));
    if (dayCheckIns.length === 0) return null;
    
    // Rigorous honesty: If any check-in is a SLIP, the day is a SLIP.
    const hasSlip = dayCheckIns.some(c => c.status === CheckInStatus.SLIP);
    return hasSlip ? CheckInStatus.SLIP : CheckInStatus.CLEAN;
  };

  // Logic to calculate streak. A streak is the number of consecutive clean days *before* today.
  useEffect(() => {
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Start checking from yesterday and go backwards.
    let checkDate = subDays(today, 1);

    while (true) {
      const status = getAggregatedDayStatus(checkDate, checkIns);
      
      if (status === CheckInStatus.CLEAN) {
        currentStreak++;
        checkDate = subDays(checkDate, 1); // Move back one more day
      } else {
        // Streak ends if a day is a slip or has no clean check-in.
        break;
      }
    }

    setStreak(currentStreak);
  }, [checkIns]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Land on 28-day plan as the primary post-login screen
    setCurrentView(View.PLAN_21);
  };

  const handleOpenCheckIn = (payload: { tasksCompleted: boolean }) => {
    setCheckInPayload(payload);
    setShowCheckInModal(true);
  };

  const handleCheckInComplete = (newCheckIn: CheckIn) => {
    setCheckIns(prev => [...prev, newCheckIn]);
    setShowCheckInModal(false);
    setCheckInPayload(null);
  };

  const handlePlanTaskToggle = (dayNumber: number, taskKey: string) => {
    setCompletedPlanTasks(prev => {
      const newCompleted = { ...prev };
      const dayTasks = new Set(newCompleted[dayNumber] || []);
      
      if (dayTasks.has(taskKey)) {
        dayTasks.delete(taskKey);
      } else {
        dayTasks.add(taskKey);
      }
      
      newCompleted[dayNumber] = dayTasks;
      return newCompleted;
    });
  };

  const handleLogout = async () => {
    // Sign out from Supabase and clear locally stored funnel tokens
    await supabase.auth.signOut();
    localStorage.removeItem('compass_access_token');
    localStorage.removeItem('compass_refresh_token');
    setIsAuthenticated(false);
    setCurrentView(View.LOGIN);
  };

  const hasCheckedInToday = checkIns.some(c => isSameDay(new Date(c.date), new Date()));

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-stone-50 text-emerald-900 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
      />
      
      {/* Main Content Area: Has bottom padding on mobile to account for fixed nav */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[4.5rem] md:pb-0 w-full">
        {currentView === View.DASHBOARD && (
          <Dashboard 
            checkIns={checkIns} 
            streak={streak} 
            onOpenCheckIn={() => handleOpenCheckIn({ tasksCompleted: false })} // Provide default payload
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
                    <p>This module is under development.</p>
                 </div>
             </div>
        )}

        {currentView === View.SETTINGS && (
          <Settings />
        )}

        {/* Check In Modal Overlay */}
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