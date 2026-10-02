import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 flex items-center gap-3 rounded-2xl bg-amber-500/90 text-slate-950 px-4 py-2.5 shadow-xl backdrop-blur-md border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <div className="text-xs font-semibold">
        Çevrimdışı Mod — Kaydedilmiş yerel veriler kullanılıyor.
      </div>
    </div>
  );
};
