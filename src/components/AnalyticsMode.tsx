import React, { useState } from 'react';
import { Word, UserStats } from '../types/vocab';
import { CheckCircle2, Layers, Brain, Zap, Folder, BarChart2 } from 'lucide-react';

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

  // Dynamic list of categories from word data
  const defaultCategories = ['Önemli İsimler', 'Önemli Fiiller', 'Önemli Sıfatlar', 'Önemli Zarflar', 'Phrasal Verbs', 'Önemli Bağlaçlar', 'Edat Öbekleri'];
  const presentCategories = Array.from(new Set(words.map((w) => w.category))).filter(Boolean);
  
  // Combine defaults and any custom categories preserving order
  const categories = Array.from(new Set([...defaultCategories, ...presentCategories])).filter(cat => 
    words.some(w => w.category === cat)
  );

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const filteredCategories = selectedCategoryFilter === 'ALL'
    ? categories
    : categories.filter((c) => c === selectedCategoryFilter);

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
          <p className="text-[10px] text-slate-500 font-mono">Leitner Kutu 5 (%{masteryPercent})</p>
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

      {/* Overall Leitner Box Breakdown Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Genel Leitner Kutuları Dağılımı</h3>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono">5 Seviyeli SRS</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { box: 1, label: 'Kutu 1 (Yeni / Zor)', count: boxCounts.box1, color: 'bg-rose-500' },
            { box: 2, label: 'Kutu 2 (Öğreniliyor)', count: boxCounts.box2, color: 'bg-amber-500' },
            { box: 3, label: 'Kutu 3 (Pekiştirildi)', count: boxCounts.box3, color: 'bg-blue-500' },
            { box: 4, label: 'Kutu 4 (İleri Düzey)', count: boxCounts.box4, color: 'bg-indigo-500' },
            { box: 5, label: 'Kutu 5 (Tam Öğrenildi)', count: boxCounts.box5, color: 'bg-emerald-500' },
          ].map((item) => {
            const pct = totalWords > 0 ? Math.round((item.count / totalWords) * 100) : 0;

            return (
              <div key={item.box} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-400">{item.count} kelime (%{pct})</span>
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

      {/* Category Leitner Box Distribution Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Kategoriye Göre Kutuların Dağılımı</h3>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] font-mono px-1 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />K1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />K2</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />K3</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />K4</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />K5</span>
        </div>

        {/* Category Cards List */}
        <div className="space-y-3">
          {filteredCategories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat);
            const catTotal = catWords.length;
            if (catTotal === 0) return null;

            const b1 = catWords.filter((w) => w.leitnerBox === 1).length;
            const b2 = catWords.filter((w) => w.leitnerBox === 2).length;
            const b3 = catWords.filter((w) => w.leitnerBox === 3).length;
            const b4 = catWords.filter((w) => w.leitnerBox === 4).length;
            const b5 = catWords.filter((w) => w.leitnerBox === 5).length;

            const b1Pct = (b1 / catTotal) * 100;
            const b2Pct = (b2 / catTotal) * 100;
            const b3Pct = (b3 / catTotal) * 100;
            const b4Pct = (b4 / catTotal) * 100;
            const b5Pct = (b5 / catTotal) * 100;

            const catMastery = Math.round((b5 / catTotal) * 100);

            return (
              <div key={cat} className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2.5">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-bold text-white text-xs">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{catTotal} Kelime</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      %{catMastery} Tamamlandı
                    </span>
                  </div>
                </div>

                {/* Stacked Multi-Color Distribution Bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800/80">
                  {b1 > 0 && <div style={{ width: `${b1Pct}%` }} className="bg-rose-500 h-full transition-all duration-300" title={`Kutu 1: ${b1} (${Math.round(b1Pct)}%)`} />}
                  {b2 > 0 && <div style={{ width: `${b2Pct}%` }} className="bg-amber-500 h-full transition-all duration-300" title={`Kutu 2: ${b2} (${Math.round(b2Pct)}%)`} />}
                  {b3 > 0 && <div style={{ width: `${b3Pct}%` }} className="bg-blue-500 h-full transition-all duration-300" title={`Kutu 3: ${b3} (${Math.round(b3Pct)}%)`} />}
                  {b4 > 0 && <div style={{ width: `${b4Pct}%` }} className="bg-indigo-500 h-full transition-all duration-300" title={`Kutu 4: ${b4} (${Math.round(b4Pct)}%)`} />}
                  {b5 > 0 && <div style={{ width: `${b5Pct}%` }} className="bg-emerald-500 h-full transition-all duration-300" title={`Kutu 5: ${b5} (${Math.round(b5Pct)}%)`} />}
                </div>

                {/* 5 Box Numeric Breakdown Chips */}
                <div className="grid grid-cols-5 gap-1 pt-0.5 text-center">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl py-1 px-0.5">
                    <span className="block text-[8px] font-bold text-rose-400 uppercase">K1</span>
                    <span className="block text-[11px] font-black text-white">{b1}</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl py-1 px-0.5">
                    <span className="block text-[8px] font-bold text-amber-400 uppercase">K2</span>
                    <span className="block text-[11px] font-black text-white">{b2}</span>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl py-1 px-0.5">
                    <span className="block text-[8px] font-bold text-blue-400 uppercase">K3</span>
                    <span className="block text-[11px] font-black text-white">{b3}</span>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl py-1 px-0.5">
                    <span className="block text-[8px] font-bold text-indigo-400 uppercase">K4</span>
                    <span className="block text-[11px] font-black text-white">{b4}</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-1 px-0.5">
                    <span className="block text-[8px] font-bold text-emerald-400 uppercase">K5</span>
                    <span className="block text-[11px] font-black text-white">{b5}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
