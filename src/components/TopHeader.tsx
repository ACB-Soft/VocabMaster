import React from 'react';
import { UserStats } from '../types/vocab';
import { BookOpen, Sparkles } from 'lucide-react';

interface TopHeaderProps {
  stats: UserStats;
  totalWordsCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = () => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                VocabMaster
              </h1>
              <Sparkles className="w-3 h-3 text-cyan-400 opacity-90" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              İngilizce Kelime & SRS Sistemi
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
