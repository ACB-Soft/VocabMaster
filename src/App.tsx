import React, { useState, useEffect } from 'react';
import { Word, UserStats, QuizModeType } from './types/vocab';
import { StorageService } from './services/storage';
import { TopHeader } from './components/TopHeader';
import { BottomNavigation, ActiveTab } from './components/BottomNavigation';
import { DashboardMode } from './components/DashboardMode';
import { QuizMode } from './components/QuizMode';
import { LibraryMode } from './components/LibraryMode';
import { AnalyticsMode } from './components/AnalyticsMode';
import { SettingsMode } from './components/SettingsMode';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [words, setWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<UserStats>(StorageService.getStats());
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string | undefined>(undefined);

  const refreshData = () => {
    const loadedWords = StorageService.getWords();
    const loadedStats = StorageService.getStats();
    setWords(loadedWords);
    setStats(loadedStats);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStartQuiz = (mode: QuizModeType, category?: string) => {
    setSelectedQuizCategory(category);
    setActiveTab(mode === 'EN_TO_TR' ? 'quiz_en_tr' : 'quiz_tr_en');
  };

  const handleToggleQuizMode = () => {
    setActiveTab(prev => (prev === 'quiz_en_tr' ? 'quiz_tr_en' : 'quiz_en_tr'));
  };

  const reviewDueCount = words.filter((w) => {
    if (w.leitnerBox === 1) return true;
    if (!w.nextReview) return true;
    return new Date(w.nextReview).getTime() <= Date.now();
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Mobile Header */}
      <TopHeader
        stats={stats}
        totalWordsCount={words.length}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto pt-2">
        {activeTab === 'dashboard' && (
          <DashboardMode
            words={words}
            stats={stats}
            onStartQuiz={handleStartQuiz}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'quiz_en_tr' && (
          <QuizMode
            words={words}
            onWordsUpdated={refreshData}
            stats={stats}
            mode="EN_TO_TR"
            onToggleMode={handleToggleQuizMode}
            selectedCategory={selectedQuizCategory}
          />
        )}

        {activeTab === 'quiz_tr_en' && (
          <QuizMode
            words={words}
            onWordsUpdated={refreshData}
            stats={stats}
            mode="TR_TO_EN"
            onToggleMode={handleToggleQuizMode}
            selectedCategory={selectedQuizCategory}
          />
        )}

        {activeTab === 'library' && (
          <LibraryMode words={words} onWordsUpdated={refreshData} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsMode words={words} stats={stats} />
        )}

        {activeTab === 'settings' && (
          <SettingsMode
            stats={stats}
            words={words}
            onWordsUpdated={refreshData}
          />
        )}
      </main>

      {/* Connectivity Banner */}
      <OfflineIndicator />

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'quiz_en_tr' || tab === 'quiz_tr_en') {
            setSelectedQuizCategory(undefined);
          }
          setActiveTab(tab);
        }}
        reviewDueCount={reviewDueCount}
      />
    </div>
  );
}
