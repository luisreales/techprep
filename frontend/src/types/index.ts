export type Level = 'basic' | 'medium' | 'hard';

export type QuestionType = 'single' | 'multi' | 'written';

export interface Topic {
  id: number;
  name: string;
  description?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  topicId: number;
  level: Level;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  officialAnswer?: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer?: string;
  selectedOptionIds?: string[];
  matchPercentage?: number;
}

export interface Resource {
  id: string;
  topicId: number;
  title: string;
  url: string;
}

export interface Session {
  id: string;
  topicId: number;
  level: Level;
  mode: 'study' | 'interview';
  questions: Question[];
  answers: SessionAnswer[];
  startedAt: string;
  completedAt?: string;
}

export interface SessionAnswer {
  questionId: string;
  isCorrect: boolean;
  answer?: string;
  selectedOptionIds?: string[];
  matchPercentage?: number;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: Level;
  language: string;
  solution?: string;
}
