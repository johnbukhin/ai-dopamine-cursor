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
          ? 'bg-purple-100 text-purple-900 font-semibold'
          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'
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
          ? 'text-purple-900 font-semibold'
          : 'text-gray-400 hover:text-purple-600'
      }`}
    >
      <div className={`p-1.5 rounded-full ${currentView === view ? 'bg-purple-100' : 'bg-transparent'}`}>
        <Icon size={22} />
      </div>
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );

  // --- Components ---

  const DesktopSidebar = () => (
    <div className="hidden md:flex w-64 flex-shrink-0 bg-purple-50 border-r border-purple-100 flex-col h-full overflow-hidden">
      <div className="p-6 flex items-center gap-2">
        <Compass className="text-purple-700" size={32} />
        <h1 className="text-xl font-semibold text-purple-900 tracking-tight">Mind Compass</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 text-xs font-medium text-purple-700/50 uppercase tracking-wider mb-2">Core Features</p>
          <NavItem view={View.PLAN_21} icon={Map} label="28-Day Plan" />
          <NavItem view={View.DASHBOARD} icon={TrendingUp} label="Progress" />
          <NavItem view={View.AI_COACH} icon={Brain} label="AI Coach" />
          <NavItem view={View.URGE_HELP} icon={ShieldAlert} label="Urge Help" />
          <NavItem view={View.SETTINGS} icon={Settings} label="Settings" />
        </div>
      </nav>

      <div className="p-4 border-t border-purple-100 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:bg-purple-50 hover:text-purple-900 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
        <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );

  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 flex justify-around items-center px-1 pb-safe z-40 h-[4.5rem] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <MobileNavItem view={View.PLAN_21} icon={Map} label="Plan" />
      <MobileNavItem view={View.DASHBOARD} icon={TrendingUp} label="Progress" />
      <MobileNavItem view={View.AI_COACH} icon={Brain} label="Coach" />
      <MobileNavItem view={View.URGE_HELP} icon={ShieldAlert} label="Help" />
      <MobileNavItem view={View.SETTINGS} icon={Settings} label="Settings" />
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
};