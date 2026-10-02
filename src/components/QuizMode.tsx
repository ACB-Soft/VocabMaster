import React, { useState, useEffect } from 'react';
import { Word, QuizQuestion, QuizModeType, UserStats } from '../types/vocab';
import { LeitnerSRS } from '../services/leitnerSRS';
import { StorageService } from '../services/storage';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Trophy, 
  HelpCircle, 
  TrendingUp,
  Layers
} from 'lucide-react';
import { EnToTrIcon, TrToEnIcon, TranslationSwapIcon } from './TranslationIcons';

interface QuizModeProps {
  words: Word[];
  onWordsUpdated: () => void;
  stats: UserStats;
  mode: QuizModeType;
  onToggleMode?: () => void;
  selectedCategory?: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({ 
  words, 
  onWordsUpdated, 
  stats, 
  mode, 
  onToggleMode, 
  selectedCategory 
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>(selectedCategory || 'ALL');

  useEffect(() => {
    if (selectedCategory) {
      setSelectedFolder(selectedCategory);
    }
  }, [selectedCategory]);

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [previousBox, setPreviousBox] = useState<number>(1);
  const [newBox, setNewBox] = useState<number>(1);

  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<Word[]>([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Filter pool based on selected folder
  const activePool = selectedFolder === 'ALL'
    ? words
    : words.filter((w) => w.category === selectedFolder);

  // Restart session when mode, word count, or selected folder changes
  useEffect(() => {
    startNewQuizSession();
  }, [words.length, mode, selectedFolder]);

  const startNewQuizSession = () => {
    if (activePool.length === 0) return;
    const priorityBatch = LeitnerSRS.getPriorityQueue(activePool, 15);
    setQuestionQueue(priorityBatch);
    setSessionScore(0);
    setSessionTotal(0);
    setIsSessionFinished(false);

    if (priorityBatch.length > 0) {
      loadNextQuestion(priorityBatch[0]);
    }
  };

  const loadNextQuestion = (targetWord: Word) => {
    const q = LeitnerSRS.generateQuestion(targetWord, activePool, mode);
    setCurrentQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setPreviousBox(targetWord.leitnerBox);
    setNewBox(targetWord.leitnerBox);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQuestion) return;

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const correct = option === currentQuestion.correctAnswer;
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setSessionScore((prev) => prev + 1);
    }
    setSessionTotal((prev) => prev + 1);

    // Save answer and update Leitner box
    const updatedWord = StorageService.recordAnswer(currentQuestion.word.id, correct);
    if (updatedWord) {
      setNewBox(updatedWord.leitnerBox);
      setCurrentQuestion(prev => prev ? { ...prev, word: updatedWord } : null);
    }

    onWordsUpdated();
  };

  const handleIDontKnow = () => {
    if (isAnswered || !currentQuestion) return;

    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    setSelectedOption('__DONT_KNOW__');
    setIsAnswered(true);
    setIsCorrect(false);
    setSessionTotal((prev) => prev + 1);

    // Records as false so SRS Leitner algorithm prioritizes reviewing it
    const updatedWord = StorageService.recordAnswer(currentQuestion.word.id, false);
    if (updatedWord) {
      setNewBox(updatedWord.leitnerBox);
      setCurrentQuestion(prev => prev ? { ...prev, word: updatedWord } : null);
    }

    onWordsUpdated();
  };

  const handleNext = () => {
    if (questionQueue.length === 0) return;

    const remaining = questionQueue.slice(1);
    setQuestionQueue(remaining);

    if (remaining.length > 0) {
      loadNextQuestion(remaining[0]);
    } else {
      setIsSessionFinished(true);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSessionFinished) return;
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      } else if (currentQuestion) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleSelectOption(currentQuestion.options[0]);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleSelectOption(currentQuestion.options[1]);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleSelectOption(currentQuestion.options[2]);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleSelectOption(currentQuestion.options[3]);
        else if (e.key === '?' || e.key === 'k') handleIDontKnow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isSessionFinished, currentQuestion, questionQueue]);

  if (activePool.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-[calc(100dvh-54px-64px)]">
        <div className="w-14 h-14 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Bu Klasörde Kelime Yok</h2>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          Lütfen başka bir klasör seçin veya kütüphaneden kelime ekleyin.
        </p>
        <button
          onClick={() => setSelectedFolder('ALL')}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-white font-bold text-xs"
        >
          Tüm Kelimeleri Göster
        </button>
      </div>
    );
  }

  if (isSessionFinished) {
    const accuracy = sessionTotal > 0 ? Math.round((sessionScore / sessionTotal) * 100) : 0;

    return (
      <div className="p-4 max-w-md mx-auto h-[calc(100dvh-54px-64px)] flex flex-col justify-center animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-xl">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Trophy className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            {mode === 'EN_TO_TR' ? 'İngilizce → Türkçe' : 'Türkçe → İngilizce'} Tamamlandı! 🎉
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Aralıklı tekrar algoritmasıyla kutu seviyeleri başarıyla güncellendi.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-xl font-black text-indigo-400">{sessionScore} / {sessionTotal}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Doğru Sayısı</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-xl font-black text-emerald-400">%{accuracy}</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Başarı Oranı</p>
            </div>
          </div>

          <button
            onClick={startNewQuizSession}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yeni Oturum Başlat</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const target = currentQuestion.word;

  const partOfSpeechLabels: Record<string, string> = {
    noun: 'İsim',
    verb: 'Fiil',
    adjective: 'Sıfat',
    adverb: 'Zarf',
    conjunction: 'Bağlaç',
    preposition: 'Edat',
    phrasal: 'Phrasal Verb',
    other: 'İfade'
  };

  return (
    <div className="max-w-md mx-auto w-full px-3.5 py-1.5 flex flex-col justify-start space-y-2.5 select-none">
      {/* 1. Top Controls Bar */}
      <div className="flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Interactive Translation Direction Toggle */}
          <button
            type="button"
            onClick={onToggleMode}
            title="Çeviri Yönünü Değiştir (EN ↔ TR)"
            className="px-2 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-sm active:scale-95 transition"
          >
            {mode === 'EN_TO_TR' ? (
              <EnToTrIcon className="w-3.5 h-3.5" />
            ) : (
              <TrToEnIcon className="w-3.5 h-3.5" />
            )}
            <span>{mode === 'EN_TO_TR' ? 'EN ➔ TR' : 'TR ➔ EN'}</span>
            <TranslationSwapIcon className="w-2.5 h-2.5 text-indigo-200 opacity-80" />
          </button>

          {/* Folder Select Dropdown */}
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-[11px] font-medium rounded-lg px-2 py-1 truncate focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">📁 Tüm Kelimeler ({words.length})</option>
              <option value="Önemli İsimler">📁 Önemli İsimler (600)</option>
              <option value="Önemli Fiiller">📁 Önemli Fiiller (600)</option>
              <option value="Önemli Sıfatlar">📁 Önemli Sıfatlar (600)</option>
              <option value="Önemli Zarflar">📁 Önemli Zarflar (200)</option>
              <option value="Phrasal Verbs">📁 Phrasal Verbs (150)</option>
              <option value="Önemli Bağlaçlar">📁 Önemli Bağlaçlar (94)</option>
              <option value="Edat Öbekleri">📁 Edat Öbekleri (75)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-400 shrink-0 pl-1">
          Kalan: <span className="text-white font-bold">{questionQueue.length}</span>
        </div>
      </div>

      {/* 2. Word Question Card (Compact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 shadow-md shrink-0 relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
            {partOfSpeechLabels[target.partOfSpeech] || 'Kelime'} · {target.category}
          </span>

          {/* Live Leitner Box Badge */}
          <div className="flex items-center gap-1.5">
            {isAnswered && isCorrect ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                <TrendingUp className="w-3 h-3" />
                <span>Kutu {previousBox} ➔ {newBox}</span>
              </span>
            ) : isAnswered && selectedOption === '__DONT_KNOW__' ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Kutu 1'e Alındı
              </span>
            ) : isAnswered && !isCorrect ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                Kutu {previousBox} ➔ {newBox}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/60">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>Leitner Kutu {target.leitnerBox}</span>
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
            {currentQuestion.prompt}
          </h2>
        </div>
      </div>

      {/* 3. Options (A, B, C, D) + "Bilmiyorum" Directly Underneath */}
      <div className="space-y-2">
        {currentQuestion.options.map((option, idx) => {
          let btnStyle = 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 active:border-slate-700';
          let icon = null;

          if (isAnswered) {
            if (option === currentQuestion.correctAnswer) {
              btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm font-bold';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            } else if (option === selectedOption) {
              btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold';
              icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else {
              btnStyle = 'bg-slate-900/40 text-slate-500 border-slate-800/50 opacity-40';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`w-full py-2.5 px-3 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between gap-2.5 min-h-[44px] transition active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-slate-800/80 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-snug truncate">{option}</span>
              </div>
              {icon}
            </button>
          );
        })}

        {/* "Bilmiyorum" button placed immediately below options */}
        {!isAnswered ? (
          <button
            type="button"
            onClick={handleIDontKnow}
            className="w-full py-2.5 px-3 min-h-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 active:bg-slate-750 border border-slate-800/80 hover:border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition mt-1 shadow-sm"
            title="Cevabı göster ve bu kelimeyi tekrar listesine ekle"
          >
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Bilmiyorum (Cevabı Göster)</span>
          </button>
        ) : (
          <div className="space-y-2 pt-1 animate-fadeIn">
            {/* 1-Line Compact Feedback Strip */}
            <div className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : selectedOption === '__DONT_KNOW__'
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold truncate">Doğru! Kutu {previousBox} ➔ {newBox} (+1 Seviye)</span>
                  </>
                ) : selectedOption === '__DONT_KNOW__' ? (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold truncate">Doğru: "{currentQuestion.correctAnswer}" (Tekrar Listesinde)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-bold truncate">Doğru: "{currentQuestion.correctAnswer}"</span>
                  </>
                )}
              </div>

              {target.exampleEn && (
                <span className="italic text-[10px] text-slate-400 truncate max-w-[130px] hidden xs:inline" title={target.exampleEn}>
                  "{target.exampleEn}"
                </span>
              )}
            </div>

            {/* Sonraki Kelime Button */}
            <button
              onClick={handleNext}
              autoFocus
              className="w-full py-3 min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <span>Sonraki Kelime</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
