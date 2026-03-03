import React from 'react';
import { View } from '../types';
import { TrendingUp, Map, Brain, ShieldAlert, Leaf, Settings, LogOut, Compass, Menu } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        currentView === view
          ? 'bg-emerald-100 text-emerald-900 font-semibold'
          : 'text-emerald-800/70 hover:bg-stone-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const MobileNavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
        currentView === view
          ? 'text-emerald-900 font-semibold'
          : 'text-stone-400 hover:text-emerald-800'
      }`}
    >
      <div className={`p-1.5 rounded-full ${currentView === view ? 'bg-emerald-100' : 'bg-transparent'}`}>
        <Icon size={22} />
      </div>
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );

  // --- Components ---

  const DesktopSidebar = () => (
    <div className="hidden md:flex w-64 flex-shrink-0 bg-stone-50 border-r border-stone-200 flex-col h-full overflow-hidden">
      <div className="p-6 flex items-center gap-2">
        <Compass className="text-emerald-800" size={32} />
        <h1 className="text-xl font-semibold text-emerald-900 tracking-tight">Mind Compass</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 text-xs font-medium text-emerald-800/50 uppercase tracking-wider mb-2">Core Features</p>
          <NavItem view={View.PLAN_21} icon={Map} label="28-Day Plan" />
          <NavItem view={View.DASHBOARD} icon={TrendingUp} label="Progress" />
          <NavItem view={View.AI_COACH} icon={Brain} label="AI Coach" />
          <NavItem view={View.URGE_HELP} icon={ShieldAlert} label="Urge Help" />
          <NavItem view={View.FUTURE} icon={Leaf} label="Future" />
        </div>
      </nav>

      <div className="p-4 border-t border-stone-200 space-y-2">
        <button onClick={() => onChangeView(View.SETTINGS)} className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${currentView === View.SETTINGS ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-emerald-800/70 hover:bg-stone-100'}`}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-800/70 hover:bg-stone-100 rounded-lg"
        >
          <LogOut size={18} />
          <span>Exit</span>
        </button>
        
        <div className="pt-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-stone-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 flex-shrink-0 z-10">
      <div className="flex items-center gap-2">
        <Compass className="text-emerald-800" size={24} />
        <h1 className="text-lg font-semibold text-emerald-900 tracking-tight">Mind Compass</h1>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onChangeView(View.SETTINGS)} className="p-2 text-stone-400 hover:text-emerald-800">
          <Settings size={20} />
        </button>
        <button onClick={onLogout} className="p-2 text-stone-400 hover:text-emerald-800">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );

  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center px-1 pb-safe z-40 h-[4.5rem] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <MobileNavItem view={View.PLAN_21} icon={Map} label="Plan" />
      <MobileNavItem view={View.DASHBOARD} icon={TrendingUp} label="Progress" />
      <MobileNavItem view={View.AI_COACH} icon={Brain} label="Coach" />
      <MobileNavItem view={View.URGE_HELP} icon={ShieldAlert} label="Help" />
      <MobileNavItem view={View.FUTURE} icon={Leaf} label="Future" />
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileBottomNav />
    </>
  );
};