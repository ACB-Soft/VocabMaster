import React from 'react';
import { Book, BarChart3, Settings, LayoutDashboard } from 'lucide-react';
import { EnToTrIcon, TrToEnIcon } from './TranslationIcons';

export type ActiveTab = 'dashboard' | 'quiz_en_tr' | 'quiz_tr_en' | 'library' | 'analytics' | 'settings';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  reviewDueCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  reviewDueCount,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Panel', icon: LayoutDashboard },
    { id: 'quiz_en_tr' as ActiveTab, label: 'EN → TR', icon: EnToTrIcon, badge: reviewDueCount },
    { id: 'quiz_tr_en' as ActiveTab, label: 'TR → EN', icon: TrToEnIcon },
    { id: 'library' as ActiveTab, label: 'Kelimeler', icon: Book },
    { id: 'analytics' as ActiveTab, label: 'Analiz', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Ayarlar', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-6 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 && (tab.id === 'quiz_en_tr' || tab.id === 'quiz_tr_en') ? (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-[56px] ${isActive ? 'font-bold' : ''}`}>
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
