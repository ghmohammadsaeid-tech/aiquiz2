export type Difficulty = 'آسان' | 'متوسط' | 'سخت';

export interface Question {
  id: number;
  q: string;
  o: string[];
  a: number;
  c: string;
  difficulty: Difficulty;
  dateAdded?: string;
  source?: string;
}

export type CardType = 'standard' | 'cloze' | 'formula' | 'media';

export interface ReviewHistory {
  date: string;
  quality: number;
  timeSpent: number;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  example?: string;
  category: string;
  difficulty: string;
  createdAt: number;
  lastReviewed?: number;
  dueDate: string; // ISO YYYY-MM-DD
  interval: number; // Days
  easeFactor: number;
  repetitions: number;
  type: CardType;
  tags: string[];
  errorCount: number;
  mediaUrl?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate?: string;
  totalReviews: number;
  badges: string[];
  dailyGoal: number;
}

export type View = 'dashboard' | 'exam' | 'flashcards' | 'bank' | 'ai' | 'settings' | 'stats';
export type Language = 'fa' | 'en' | 'ku' | 'ar';

export interface ExamState {
  active: boolean;
  currentQuestion: number;
  answers: (number | null)[];
  questions: Question[];
  config: {
    count: number;
    difficulty: string;
    randomize: boolean;
    showAnswers: boolean;
  };
}