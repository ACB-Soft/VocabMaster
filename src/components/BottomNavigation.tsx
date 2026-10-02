import React from 'react';
import { Book, BarChart3, Settings, LayoutDashboard } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'quiz_en_tr' | 'quiz_tr_en' | 'library' | 'analytics' | 'settings';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  reviewDueCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Panel', icon: LayoutDashboard },
    { id: 'library' as ActiveTab, label: 'Kelimeler', icon: Book },
    { id: 'analytics' as ActiveTab, label: 'Analiz', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Ayarlar', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = 
            activeTab === tab.id || 
            (tab.id === 'dashboard' && (activeTab === 'quiz_en_tr' || activeTab === 'quiz_tr_en'));

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-1 truncate">
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-b-full shadow-sm shadow-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
