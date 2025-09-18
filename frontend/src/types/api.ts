// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  matchingThreshold: number;
  language?: string;
  theme?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Student = 'Student',
  Admin = 'Admin'
}

// Topic types
export interface Topic {
  id: number;
  name: string;
  description?: string;
  questionCount: number;
  createdAt: string;
}

export interface CreateTopicDto {
  name: string;
  description?: string;
}

export interface UpdateTopicDto {
  name: string;
  description?: string;
}

// Question types
export interface Question {
  id: string;
  topicId: number;
  topicName: string;
  text: string;
  type: QuestionType;
  level: DifficultyLevel;
  officialAnswer?: string;
  options: QuestionOption[];
  learningResources: LearningResource[];
  createdAt: string;
  updatedAt: string;
}

export enum QuestionType {
  SingleChoice = 'single_choice',
  MultiChoice = 'multi_choice',
  Written = 'written'
}

export enum DifficultyLevel {
  Basic = 'basic',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
}

export interface CreateQuestionDto {
  topicId: number;
  text: string;
  type: QuestionType;
  level: DifficultyLevel;
  officialAnswer?: string;
  options: CreateQuestionOptionDto[];
  learningResources: CreateLearningResourceDto[];
}

export interface CreateQuestionOptionDto {
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateLearningResourceDto {
  title: string;
  url: string;
  description?: string;
}

export interface QuestionFilterDto {
  topicId?: number;
  type?: QuestionType;
  level?: DifficultyLevel;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Interview Session types
export interface InterviewSession {
  id: string;
  userId: string;
  topicId: number;
  topicName: string;
  mode: PracticeMode;
  totalQuestions: number;
  completedQuestions: number;
  score?: number;
  startedAt: string;
  finishedAt?: string;
  answers: InterviewAnswer[];
}

export enum PracticeMode {
  Study = 'study',
  Interview = 'interview'
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  questionText: string;
  givenAnswer?: string;
  selectedOptions: string[];
  matchPercentage?: number;
  isCorrect?: boolean;
  answeredAt: string;
}

export interface StartSessionDto {
  topicId: number;
  mode: PracticeMode;
  questionCount: number;
}

export interface SubmitAnswerDto {
  questionId: string;
  writtenAnswer?: string;
  selectedOptionIds: string[];
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Profile types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  language: 'en' | 'es';
  theme: 'light' | 'dark' | 'blue';
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  language: 'en' | 'es';
  theme: 'light' | 'dark' | 'blue';
}

// types/api.ts
export type BackendError = { message: string };

export type AuthOk = {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

// Type guard helpers
export const isBackendError = (v: unknown): v is BackendError =>
  typeof v === 'object' && v !== null && 'message' in v;

export const isAuthOk = (v: unknown): v is AuthOk =>
  typeof v === 'object' &&
  v !== null &&
  'token' in v &&
  'email' in v &&
  'firstName' in v &&
  'lastName' in v;
