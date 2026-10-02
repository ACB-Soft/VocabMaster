import { Word, UserStats, NotificationSettings } from '../types/vocab';
import { getInitialWordsWithDefaults } from '../data/initialVocabulary';

// Compact progress schema for rock-solid LocalStorage reliability (prevents QuotaExceededError)
interface WordProgress {
  box: 1 | 2 | 3 | 4 | 5;
  rev: number;
  cor: number;
  inc: number;
  str: number;
  last?: string;
  next?: string;
}

const STORAGE_KEY_PROGRESS = 'vocabmaster_progress_v11';
const STORAGE_KEY_CUSTOM = 'vocabmaster_custom_words_v11';
const STORAGE_KEY_WORDS = 'vocabmaster_words_v11';
const STORAGE_KEY_STATS = 'vocabmaster_stats_v11';
const STORAGE_KEY_SETTINGS = 'vocabmaster_settings_v11';

const DEFAULT_STATS: UserStats = {
  totalStudiedDays: 1,
  currentStreak: 1,
  bestStreak: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  dailyGoal: 20,
  dailyProgressCount: 0,
  totalQuizzesTaken: 0,
  totalCorrectAnswers: 0,
  totalIncorrectAnswers: 0,
  leitnerCounts: {
    box1: 0,
    box2: 0,
    box3: 0,
    box4: 0,
    box5: 0
  }
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: '20:00',
  notifyOnStreakLoss: true
};

export class StorageService {
  private static cachedWords: Word[] | null = null;
  private static cachedStats: UserStats | null = null;
  private static isInitialized = false;

  private static ensureInitialized() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.cleanupOldStorageVersions();
  }

  // Frees up megabytes from orphaned previous storage keys (v1 to v10)
  private static cleanupOldStorageVersions(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      
      // First, attempt to migrate any progress from v10 if available
      try {
        const v10Data = localStorage.getItem('vocabmaster_words_v10');
        if (v10Data && !localStorage.getItem(STORAGE_KEY_PROGRESS)) {
          const oldWords: Word[] = JSON.parse(v10Data);
          const progressMap: Record<string, WordProgress> = {};
          const customWords: Word[] = [];

          for (const w of oldWords) {
            if (w.custom) {
              customWords.push(w);
            }
            if (w.leitnerBox > 1 || w.timesReviewed > 0) {
              progressMap[w.id] = {
                box: w.leitnerBox,
                rev: w.timesReviewed,
                cor: w.timesCorrect,
                inc: w.timesIncorrect,
                str: w.streak,
                last: w.lastReviewed,
                next: w.nextReview
              };
            }
          }
          if (Object.keys(progressMap).length > 0) {
            localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressMap));
          }
          if (customWords.length > 0) {
            localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customWords));
          }
        }
      } catch (e) {
        console.warn('Migration warning:', e);
      }

      // Purge all legacy large word dumps (v1 through v10) to prevent QuotaExceededError
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vocabmaster_') && !key.endsWith('_v11')) {
          keysToRemove.push(key);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    } catch (err) {
      console.warn('Storage cleanup notice:', err);
    }
  }

  static getProgressMap(): Record<string, WordProgress> {
    try {
      this.ensureInitialized();
      const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static saveProgressMap(map: Record<string, WordProgress>): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save compact progress:', e);
    }
  }

  static getCustomWords(): Word[] {
    try {
      this.ensureInitialized();
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveCustomWords(customWords: Word[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customWords));
    } catch (e) {
      console.error('Failed to save custom words:', e);
    }
  }

  static getWords(): Word[] {
    this.ensureInitialized();
    if (this.cachedWords) {
      return this.cachedWords;
    }

    try {
      // 1. Start with initial static words
      const words = getInitialWordsWithDefaults();
      const wordMap = new Map<string, Word>();
      for (const w of words) {
        wordMap.set(w.id, w);
      }

      // 2. Add custom words
      const customWords = this.getCustomWords();
      for (const cw of customWords) {
        wordMap.set(cw.id, cw);
      }

      // 3. Overlay stored user progress
      const progressMap = this.getProgressMap();
      for (const [id, prog] of Object.entries(progressMap)) {
        const word = wordMap.get(id);
        if (word) {
          word.leitnerBox = prog.box;
          word.timesReviewed = prog.rev;
          word.timesCorrect = prog.cor;
          word.timesIncorrect = prog.inc;
          word.streak = prog.str;
          word.lastReviewed = prog.last;
          word.nextReview = prog.next;
        }
      }

      const mergedWords = Array.from(wordMap.values());
      this.cachedWords = mergedWords;

      // Safe background backup to words key if quota allows
      try {
        localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(mergedWords));
      } catch {
        // Safe to ignore because progress map is preserved
      }

      return mergedWords;
    } catch (err) {
      console.error('Error loading words:', err);
      const initial = getInitialWordsWithDefaults();
      this.cachedWords = initial;
      return initial;
    }
  }

  static saveWords(words: Word[]): void {
    this.cachedWords = words;
    try {
      // 1. Extract and save compact progress map
      const progressMap: Record<string, WordProgress> = {};
      const customWords: Word[] = [];

      for (const w of words) {
        if (w.custom) {
          customWords.push(w);
        }
        if (w.leitnerBox > 1 || w.timesReviewed > 0) {
          progressMap[w.id] = {
            box: w.leitnerBox,
            rev: w.timesReviewed,
            cor: w.timesCorrect,
            inc: w.timesIncorrect,
            str: w.streak,
            last: w.lastReviewed,
            next: w.nextReview
          };
        }
      }

      this.saveProgressMap(progressMap);
      this.saveCustomWords(customWords);

      // 2. Attempt full cache
      try {
        localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
      } catch {
        // quota exceeded for full array is non-fatal since progress is saved
      }

      this.recalculateLeitnerStats(words);
    } catch (err) {
      console.error('Error saving words:', err);
    }
  }

  static getStats(): UserStats {
    this.ensureInitialized();
    if (this.cachedStats) {
      return this.cachedStats;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY_STATS);
      if (!data) {
        const words = this.getWords();
        const initialStats = { ...DEFAULT_STATS };
        initialStats.leitnerCounts = this.computeLeitnerCounts(words);
        this.saveStats(initialStats);
        return initialStats;
      }

      const stats: UserStats = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];

      if (stats.lastStudyDate && stats.lastStudyDate !== today) {
        const lastDate = new Date(stats.lastStudyDate);
        const currDate = new Date(today);
        const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          stats.currentStreak = 0;
        }
        stats.dailyProgressCount = 0;
      }

      this.cachedStats = stats;
      return stats;
    } catch (err) {
      console.error('Error reading stats:', err);
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats: UserStats): void {
    this.cachedStats = stats;
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (err) {
      console.error('Error saving stats:', err);
    }
  }

  static getSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }

  /**
   * Records an answer for a word, updates its Leitner box,
   * schedules next review, and persists to storage immediately.
   */
  static recordAnswer(wordId: string, isCorrect: boolean): Word | null {
    const words = this.getWords();
    const stats = this.getStats();
    const wordIndex = words.findIndex((w) => w.id === wordId);
    if (wordIndex === -1) return null;

    const word = { ...words[wordIndex] };
    const now = new Date();

    word.timesReviewed += 1;
    if (isCorrect) {
      word.timesCorrect += 1;
      word.streak += 1;
      word.leitnerBox = Math.min(5, word.leitnerBox + 1) as 1 | 2 | 3 | 4 | 5;
      stats.totalCorrectAnswers += 1;
    } else {
      word.timesIncorrect += 1;
      word.streak = 0;
      word.leitnerBox = Math.max(1, word.leitnerBox - 1) as 1 | 2 | 3 | 4 | 5;
      stats.totalIncorrectAnswers += 1;
    }

    // Leitner intervals: Box 1: immediate, Box 2: 1 day, Box 3: 3 days, Box 4: 7 days, Box 5: 30 days
    const daysToAdd = [0, 0, 1, 3, 7, 30][word.leitnerBox];
    const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    word.lastReviewed = now.toISOString();
    word.nextReview = nextDate.toISOString();

    words[wordIndex] = word;
    this.cachedWords = words;

    // 1. Immediately persist compact word progress
    const progressMap = this.getProgressMap();
    progressMap[word.id] = {
      box: word.leitnerBox,
      rev: word.timesReviewed,
      cor: word.timesCorrect,
      inc: word.timesIncorrect,
      str: word.streak,
      last: word.lastReviewed,
      next: word.nextReview
    };
    this.saveProgressMap(progressMap);

    // 2. Update and persist stats
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastStudyDate !== today) {
      if (stats.lastStudyDate) {
        const lastDate = new Date(stats.lastStudyDate);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          stats.currentStreak += 1;
        } else if (diffDays > 1) {
          stats.currentStreak = 1;
        }
      } else {
        stats.currentStreak = 1;
      }
      stats.lastStudyDate = today;
      stats.totalStudiedDays += 1;
    }

    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    stats.dailyProgressCount += 1;
    stats.totalQuizzesTaken += 1;
    stats.leitnerCounts = this.computeLeitnerCounts(words);

    this.saveStats(stats);

    // Notify any listening components
    try {
      window.dispatchEvent(new CustomEvent('vocabmaster_answer_recorded', { detail: { wordId, box: word.leitnerBox } }));
    } catch {
      // ignore
    }

    return word;
  }

  static addWord(wordData: Omit<Word, 'id' | 'leitnerBox' | 'timesReviewed' | 'timesCorrect' | 'timesIncorrect' | 'streak'>): Word {
    const words = this.getWords();
    const newWord: Word = {
      ...wordData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      leitnerBox: 1,
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      streak: 0,
      custom: true,
      nextReview: new Date().toISOString()
    };
    words.unshift(newWord);
    this.saveWords(words);
    return newWord;
  }

  static importWordsFromCSVOrJSON(content: string, format: 'csv' | 'json'): { added: number; errors: number } {
    let added = 0;
    let errors = 0;
    const existingWords = this.getWords();
    const now = new Date().toISOString();

    if (format === 'json') {
      try {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of list) {
          if (item.word && item.translation) {
            existingWords.unshift({
              id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              word: String(item.word).trim(),
              translation: String(item.translation).trim(),
              partOfSpeech: item.partOfSpeech || 'noun',
              category: item.category || 'Özel Yüklenenler',
              exampleEn: item.exampleEn ? String(item.exampleEn).trim() : undefined,
              exampleTr: item.exampleTr ? String(item.exampleTr).trim() : undefined,
              synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
              antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
              leitnerBox: 1,
              timesReviewed: 0,
              timesCorrect: 0,
              timesIncorrect: 0,
              streak: 0,
              custom: true,
              nextReview: now
            });
            added++;
          } else {
            errors++;
          }
        }
      } catch (e) {
        console.error('JSON import error:', e);
        return { added: 0, errors: 1 };
      }
    } else {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && line.toLowerCase().startsWith('word'))) continue;
        
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0] && parts[1]) {
          existingWords.unshift({
            id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            word: parts[0],
            translation: parts[1],
            partOfSpeech: (parts[2] as any) || 'noun',
            category: (parts[3] as any) || 'Özel Yüklenenler',
            exampleEn: parts[4] || undefined,
            exampleTr: parts[5] || undefined,
            leitnerBox: 1,
            timesReviewed: 0,
            timesCorrect: 0,
            timesIncorrect: 0,
            streak: 0,
            custom: true,
            nextReview: now
          });
          added++;
        } else {
          errors++;
        }
      }
    }

    this.saveWords(existingWords);
    return { added, errors };
  }

  static resetAllProgress(): void {
    const words = this.getWords().map((w) => ({
      ...w,
      leitnerBox: 1 as 1,
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      streak: 0,
      lastReviewed: undefined,
      nextReview: new Date().toISOString()
    }));

    try {
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch {
      // ignore
    }

    this.saveWords(words);

    const stats = { ...DEFAULT_STATS };
    stats.leitnerCounts = this.computeLeitnerCounts(words);
    this.saveStats(stats);
  }

  static computeLeitnerCounts(words: Word[]) {
    const counts = { box1: 0, box2: 0, box3: 0, box4: 0, box5: 0 };
    for (const w of words) {
      if (w.leitnerBox === 1) counts.box1++;
      else if (w.leitnerBox === 2) counts.box2++;
      else if (w.leitnerBox === 3) counts.box3++;
      else if (w.leitnerBox === 4) counts.box4++;
      else if (w.leitnerBox === 5) counts.box5++;
    }
    return counts;
  }

  private static recalculateLeitnerStats(words: Word[]): void {
    const stats = this.getStats();
    stats.leitnerCounts = this.computeLeitnerCounts(words);
    this.saveStats(stats);
  }
}
