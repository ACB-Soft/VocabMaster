import React from 'react';
import { Word, UserStats } from '../types/vocab';
import { 
  Flame, 
  Target, 
  Brain, 
  Volume2, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Play,
  RotateCw,
  Clock,
  Compass
} from 'lucide-react';
import { EnToTrIcon, TrToEnIcon, TranslationSwapIcon } from './TranslationIcons';

interface DashboardModeProps {
  words: Word[];
  stats: UserStats;
  onStartQuiz: (mode: 'EN_TO_TR' | 'TR_TO_EN', category?: string) => void;
  onOpenLibrary: () => void;
}

export const DashboardMode: React.FC<DashboardModeProps> = ({
  words,
  stats,
  onStartQuiz,
  onOpenLibrary,
}) => {
  // Goal and mastery calculation
  const goalProgress = Math.min(100, Math.round((stats.dailyProgressCount / stats.dailyGoal) * 100));
  const masteredCount = words.filter((w) => w.leitnerBox === 5).length;
  const inProgressCount = words.filter((w) => w.leitnerBox >= 2 && w.leitnerBox <= 4).length;
  const newCount = words.filter((w) => w.leitnerBox === 1).length;

  const totalAnswered = stats.totalCorrectAnswers + stats.totalIncorrectAnswers;
  const accuracyRate = totalAnswered > 0 ? Math.round((stats.totalCorrectAnswers / totalAnswered) * 100) : 0;

  // Due for review count
  const reviewDueWords = words.filter((w) => {
    if (w.leitnerBox === 1) return true;
    if (!w.nextReview) return true;
    return new Date(w.nextReview).getTime() <= Date.now();
  });

  // Word of the Day (seeded by today's date so it changes daily)
  const getWordOfTheDay = (): Word | null => {
    if (words.length === 0) return null;
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % words.length;
    return words[index];
  };

  const wordOfTheDay = getWordOfTheDay();

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Pre-defined category lists
  const categories = [
    { name: 'Önemli İsimler', count: 600, color: 'from-blue-600 to-indigo-600', icon: '📘' },
    { name: 'Önemli Fiiller', count: 600, color: 'from-emerald-600 to-teal-600', icon: '📗' },
    { name: 'Önemli Sıfatlar', count: 600, color: 'from-amber-600 to-orange-600', icon: '📙' },
    { name: 'Önemli Zarflar', count: 200, color: 'from-purple-600 to-pink-600', icon: '📕' },
    { name: 'Phrasal Verbs', count: 150, color: 'from-cyan-600 to-blue-600', icon: '⚡' },
    { name: 'Önemli Bağlaçlar', count: 94, color: 'from-rose-600 to-red-600', icon: '🔗' },
    { name: 'Edat Öbekleri', count: 75, color: 'from-violet-600 to-indigo-600', icon: '🧭' },
  ];

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      {/* Header Greeting & Daily Goal Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Günün Çalışma Özeti</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Kontrol Paneli
            </h2>
          </div>

          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-bold text-sm">{stats.currentStreak} Gün Seri</span>
          </div>
        </div>

        {/* Daily Goal Gauge */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Günlük Hedef:</span>
              <span className="text-slate-300 font-mono">{stats.dailyProgressCount} / {stats.dailyGoal} Kelime</span>
            </div>
            <span className="font-extrabold text-indigo-400">%{goalProgress}</span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Start Cards */}
      <div className="space-y-2.5">
        {/* Primary EN -> TR Quiz Card */}
        <button
          onClick={() => onStartQuiz('EN_TO_TR')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-left shadow-xl shadow-indigo-600/20 flex items-center justify-between gap-3 group active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
              <EnToTrIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">EN ➔ TR Sınavı</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                  Öncelikli
                </span>
              </div>
              <p className="text-xs text-indigo-100/80 font-normal mt-0.5">
                {reviewDueWords.length > 0
                  ? `${reviewDueWords.length} tekrar bekleyen kelime`
                  : 'İngilizce kelime anlam testi'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
          </div>
        </button>

        {/* Secondary TR -> EN Quiz Card */}
        <button
          onClick={() => onStartQuiz('TR_TO_EN')}
          className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold text-left flex items-center justify-between gap-3 group active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 group-hover:text-cyan-300 transition">
              <TrToEnIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">TR ➔ EN Ters Çeviri Sınavı</span>
              <p className="text-[11px] text-slate-400 font-normal">
                Türkçe karşılıktan İngilizce kelimeyi bul
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
        </button>
      </div>

      {/* Word of the Day Card */}
      {wordOfTheDay && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Günün Kelimesi
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Kutu {wordOfTheDay.leitnerBox}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 my-2">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {wordOfTheDay.word}
              </h3>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                {wordOfTheDay.translation}
              </p>
            </div>

            <button
              onClick={() => playAudio(wordOfTheDay.word)}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-sm shrink-0"
              title="Telaffuzu Dinle"
              aria-label="Telaffuz"
            >
              <Volume2 className="w-5 h-5 text-indigo-400" />
            </button>
          </div>

          {wordOfTheDay.exampleEn && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
              <p className="italic text-slate-300 font-serif">"{wordOfTheDay.exampleEn}"</p>
              {wordOfTheDay.exampleTr && (
                <p className="text-slate-400 mt-1">"{wordOfTheDay.exampleTr}"</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leitner SRS Box Progress Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white">Leitner Aralıklı Tekrar (SRS) Durumu</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{words.length} Toplam</span>
        </div>

        {/* 5 Boxes Bar */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((boxNum) => {
            const count = words.filter((w) => w.leitnerBox === boxNum).length;
            const pct = words.length > 0 ? Math.round((count / words.length) * 100) : 0;
            return (
              <div key={boxNum} className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
                <span className="text-[9px] font-semibold text-slate-400">Kutu {boxNum}</span>
                <span className={`text-xs font-black my-0.5 ${
                  boxNum === 5 ? 'text-emerald-400' :
                  boxNum === 4 ? 'text-cyan-400' :
                  boxNum === 3 ? 'text-indigo-400' :
                  boxNum === 2 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {count}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">%{pct}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Kalıcı Hafızaya Alınan: <strong className="text-emerald-400">{masteredCount}</strong></span>
          <span>Doğruluk: <strong className="text-white">%{accuracyRate}</strong></span>
        </div>
      </div>

      {/* Word Categories Quick Launch */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Kelime Klasörleri ({categories.length})
          </h3>
          <button
            onClick={onOpenLibrary}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            Tümünü Gör ➔
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat.name);
            const catMastered = catWords.filter((w) => w.leitnerBox >= 4).length;
            const catPercent = catWords.length > 0 ? Math.round((catMastered / catWords.length) * 100) : 0;

            return (
              <div
                key={cat.name}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{cat.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{cat.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {cat.count} Kelime · %{catPercent} Hakimiyet
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onStartQuiz('EN_TO_TR', cat.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
                    title={`${cat.name} sınavını başlat`}
                  >
                    <Play className="w-3 h-3 fill-indigo-300" />
                    <span>Test Çöz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
