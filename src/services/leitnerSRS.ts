import { Word, QuizQuestion, QuizModeType } from '../types/vocab';

export class LeitnerSRS {
  static getPriorityQueue(words: Word[], limit: number = 20): Word[] {
    const now = new Date();

    const sorted = [...words].sort((a, b) => {
      const aDue = a.nextReview ? new Date(a.nextReview).getTime() <= now.getTime() : true;
      const bDue = b.nextReview ? new Date(b.nextReview).getTime() <= now.getTime() : true;

      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;

      if (a.leitnerBox !== b.leitnerBox) {
        return a.leitnerBox - b.leitnerBox;
      }

      if (a.timesIncorrect !== b.timesIncorrect) {
        return b.timesIncorrect - a.timesIncorrect;
      }

      return Math.random() - 0.5;
    });

    return sorted.slice(0, limit);
  }

  static generateQuestion(targetWord: Word, allWords: Word[], mode: QuizModeType): QuizQuestion {
    let prompt = '';
    let correctAnswer = '';

    if (mode === 'EN_TO_TR') {
      prompt = targetWord.word;
      correctAnswer = targetWord.translation;
    } else {
      prompt = targetWord.translation;
      correctAnswer = targetWord.word;
    }

    const distractors = this.getDistractors(targetWord, allWords, mode, 3);
    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    let explanation = `"${targetWord.word}" = ${targetWord.translation}`;
    if (targetWord.exampleEn && targetWord.exampleTr) {
      explanation += `\nÖrnek: "${targetWord.exampleEn}" (${targetWord.exampleTr})`;
    }

    return {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      word: targetWord,
      questionType: mode,
      prompt,
      correctAnswer,
      options,
      explanation
    };
  }

  private static getDistractors(
    targetWord: Word,
    allWords: Word[],
    mode: QuizModeType,
    count: number
  ): string[] {
    const isTurkishChoice = mode === 'EN_TO_TR';
    const candidates = allWords.filter((w) => w.id !== targetWord.id);
    const samePartCandidates = candidates.filter(
      (w) => w.partOfSpeech === targetWord.partOfSpeech
    );

    const pool = samePartCandidates.length >= count ? samePartCandidates : candidates;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const distractors: string[] = [];
    const targetVal = isTurkishChoice ? targetWord.translation : targetWord.word;

    for (const item of shuffled) {
      const val = isTurkishChoice ? item.translation : item.word;
      if (val !== targetVal && !distractors.includes(val)) {
        distractors.push(val);
        if (distractors.length >= count) break;
      }
    }

    while (distractors.length < count) {
      const dummy = isTurkishChoice
        ? `Seçenek ${distractors.length + 1}`
        : `Option ${distractors.length + 1}`;
      if (!distractors.includes(dummy)) {
        distractors.push(dummy);
      }
    }

    return distractors;
  }
}
