export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'conjunction' | 'preposition' | 'phrasal' | 'other';

export type WordCategory = 
  | 'Önemli İsimler'
  | 'Önemli Fiiller'
  | 'Önemli Sıfatlar'
  | 'Önemli Zarflar'
  | 'Önemli Bağlaçlar'
  | 'Phrasal Verbs'
  | 'Edat Öbekleri'
  | 'Akademik Kelimeler'
  | 'Temel Kelimeler'
  | 'İleri Düzey'
  | 'Özel Yüklenenler';

export interface Word {
  id: string;
  word: string;             // İngilizce Kelime
  translation: string;      // Türkçe Karşılığı
  partOfSpeech: PartOfSpeech;
  category: WordCategory;
  exampleEn?: string;       // İngilizce Örnek Cümle
  exampleTr?: string;       // Türkçe Cümle Çevirisi
  synonyms?: string[];
  antonyms?: string[];
  leitnerBox: 1 | 2 | 3 | 4 | 5; // 1: Yeni/Bilinmeyen, 5: Tam Öğrenildi
  lastReviewed?: string;
  nextReview?: string;
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  streak: number;
  custom?: boolean;
}

export type QuizModeType = 'EN_TO_TR' | 'TR_TO_EN';

export interface QuizQuestion {
  id: string;
  word: Word;
  questionType: QuizModeType;
  prompt: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

export interface UserStats {
  totalStudiedDays: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  dailyGoal: number;
  dailyProgressCount: number;
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  leitnerCounts: {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
  notifyOnStreakLoss: boolean;
}
