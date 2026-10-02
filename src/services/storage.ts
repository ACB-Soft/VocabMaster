import { Word, UserStats, NotificationSettings } from '../types/vocab';
import { getInitialWordsWithDefaults } from '../data/initialVocabulary';

const STORAGE_KEY_WORDS = 'vocabmaster_words_v10';
const STORAGE_KEY_STATS = 'vocabmaster_stats_v10';
const STORAGE_KEY_SETTINGS = 'vocabmaster_settings_v10';

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
  static getWords(): Word[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WORDS);
      if (!data) {
        const initial = getInitialWordsWithDefaults();
        this.saveWords(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Error loading words from LocalStorage:', err);
      return getInitialWordsWithDefaults();
    }
  }

  static saveWords(words: Word[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
      this.recalculateLeitnerStats(words);
    } catch (err) {
      console.error('Error saving words to LocalStorage:', err);
    }
  }

  static getStats(): UserStats {
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
      return stats;
    } catch (err) {
      console.error('Error reading stats:', err);
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats: UserStats): void {
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
    } catch (err) {
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

  static recordAnswer(wordId: string, isCorrect: boolean): Word | null {
    const words = this.getWords();
    const stats = this.getStats();
    const wordIndex = words.findIndex((w) => w.id === wordId);
    if (wordIndex === -1) return null;

    const word = words[wordIndex];
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

    const daysToAdd = [0, 1, 2, 5, 10, 30][word.leitnerBox];
    const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    word.lastReviewed = now.toISOString();
    word.nextReview = nextDate.toISOString();

    words[wordIndex] = word;
    this.saveWords(words);

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
    this.saveWords(words);

    const stats = { ...DEFAULT_STATS };
    stats.leitnerCounts = this.computeLeitnerCounts(words);
    this.saveStats(stats);
  }

  private static computeLeitnerCounts(words: Word[]) {
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
