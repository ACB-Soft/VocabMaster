import React from 'react';
import { Word, UserStats } from '../types/vocab';
import { Award, Flame, Target, CheckCircle2, TrendingUp, BarChart, Layers, Brain, Zap } from 'lucide-react';

interface AnalyticsModeProps {
  words: Word[];
  stats: UserStats;
}

export const AnalyticsMode: React.FC<AnalyticsModeProps> = ({ words, stats }) => {
  const totalWords = words.length;

  const boxCounts = {
    box1: words.filter((w) => w.leitnerBox === 1).length,
    box2: words.filter((w) => w.leitnerBox === 2).length,
    box3: words.filter((w) => w.leitnerBox === 3).length,
    box4: words.filter((w) => w.leitnerBox === 4).length,
    box5: words.filter((w) => w.leitnerBox === 5).length,
  };

  const masteredCount = boxCounts.box5;
  const inProgressCount = boxCounts.box2 + boxCounts.box3 + boxCounts.box4;
  const unlearnedCount = boxCounts.box1;

  const masteryPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  const totalAnswered = stats.totalCorrectAnswers + stats.totalIncorrectAnswers;
  const accuracyRate = totalAnswered > 0 ? Math.round((stats.totalCorrectAnswers / totalAnswered) * 100) : 0;

  // Estimated Vocab Score projection (out of 100)
  const vocabScoreProjection = Math.min(100, Math.round(masteryPercent * 0.85 + accuracyRate * 0.15));

  // Category breakdown
  const categories = ['Önemli İsimler', 'Önemli Fiiller', 'Önemli Sıfatlar', 'Önemli Zarflar', 'Önemli Bağlaçlar', 'Phrasal Verbs', 'Edat Öbekleri'] as const;

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Detaylı İlerleme Analizi</h2>
        <p className="text-xs text-slate-400">Aralıklı Tekrar (SRS) ve Kelime Hakimiyet Durumu</p>
      </div>

      {/* Primary Estimated Score Gauge Card */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Kelime Yeterlilik Puanı</span>
              <p className="text-[10px] text-slate-400">Tahmini Hakimiyet Derecesi</p>
            </div>
          </div>

          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
            {vocabScoreProjection} / 100
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-2">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${vocabScoreProjection}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400">
          {vocabScoreProjection >= 80 ? '🎯 Mükemmel seviye! Kelimelerin büyük çoğunluğuna hakimsiniz.' :
           vocabScoreProjection >= 50 ? '📈 İyi yoldasınız. Kutu 1 ve 2 deki kelimeleri tekrarlamaya devam edin.' :
           '💪 Öğrenme süreciniz devam ediyor. Günlük kelime hedefinizi tamamlayın.'}
        </p>
      </div>

      {/* Grid Quick Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold">Tam Öğrenilen</span>
          </div>
          <p className="text-2xl font-black text-white">{masteredCount}</p>
          <p className="text-[10px] text-slate-500 font-mono">Leitner Kutu 5 ({masteryPercent}%)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-1 text-indigo-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold">Doğruluk Oranı</span>
          </div>
          <p className="text-2xl font-black text-white">%{accuracyRate}</p>
          <p className="text-[10px] text-slate-500 font-mono">{stats.totalCorrectAnswers} / {totalAnswered} Doğru</p>
        </div>
      </div>

      {/* Leitner Box Breakdown Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Leitner Kutuları Dağılımı</h3>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono">5 Seviyeli SRS</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { box: 1, label: 'Kutu 1 (Yeni / Zor)', count: boxCounts.box1, color: 'bg-rose-500', note: 'Her Gün Tekrar' },
            { box: 2, label: 'Kutu 2 (Öğreniliyor)', count: boxCounts.box2, color: 'bg-amber-500', note: '2 Günde Bir' },
            { box: 3, label: 'Kutu 3 (Pekiştirildi)', count: boxCounts.box3, color: 'bg-blue-500', note: '5 Günde Bir' },
            { box: 4, label: 'Kutu 4 (İleri Düzey)', count: boxCounts.box4, color: 'bg-indigo-500', note: '10 Günde Bir' },
            { box: 5, label: 'Kutu 5 (Tam Öğrenildi)', count: boxCounts.box5, color: 'bg-emerald-500', note: '30 Günde Bir' },
          ].map((item) => {
            const pct = totalWords > 0 ? Math.round((item.count / totalWords) * 100) : 0;

            return (
              <div key={item.box} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-400">{item.count} kelime ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Mastery Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Kategoriye Göre Başarı</h3>
        </div>

        <div className="space-y-3 text-xs">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat);
            const catMastered = catWords.filter((w) => w.leitnerBox === 5).length;
            const catPct = catWords.length > 0 ? Math.round((catMastered / catWords.length) * 100) : 0;

            return (
              <div key={cat} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{cat}</span>
                  <span className="text-indigo-400 font-mono text-[11px] font-semibold">%{catPct}</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${catPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Öğrenilen: {catMastered}</span>
                  <span>Toplam: {catWords.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
