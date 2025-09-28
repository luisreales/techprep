export type PracticeDifficulty = 'Basic' | 'Intermediate' | 'Advanced';
export type PracticeQuestionType = 'SingleChoice' | 'MultiChoice' | 'Written';

export interface PracticeQuestion {
  id: string;
  text: string;
  type: PracticeQuestionType;
  level: PracticeDifficulty;
  topicId: number;
  topicName: string;
  officialAnswer?: string;
  options: PracticeQuestionOption[];
  hintSummary?: string;
  // Practice-specific fields
  attemptCount?: number;
  lastAttemptAt?: string;
  bestScore?: number;
  isBookmarked?: boolean;
  averageTime?: number;
  attempts?: PracticeAttempt[];
}

export interface PracticeQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PracticeAttempt {
  id: string;
  questionId: string;
  userId: string;
  answer: string;
  isCorrect: boolean;
  matchPercentage?: number;
  timeSpent: number;
  createdAt: string;
}

export interface PracticeProgress {
  totalQuestions: number;
  questionsAttempted: number;
  correctAnswers: number;
  averageScore: number;
  totalTimeSpent: number;
  streakCount: number;
  lastActivityAt?: string;
  difficultyBreakdown: {
    [key in PracticeDifficulty]: {
      attempted: number;
      correct: number;
      averageScore: number;
    };
  };
  typeBreakdown: {
    [key in PracticeQuestionType]: {
      attempted: number;
      correct: number;
      averageScore: number;
    };
  };
}

export interface PracticeSession {
  id: string;
  userId: string;
  startedAt: string;
  finishedAt?: string;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalScore: number;
  timeSpent: number;
  filters: {
    topicIds: number[];
    difficulties: PracticeDifficulty[];
    questionTypes: PracticeQuestionType[];
  };
}

export interface PracticeQuestionFilters {
  topicIds?: number[];
  difficulties?: PracticeDifficulty[];
  questionTypes?: PracticeQuestionType[];
  search?: string;
  onlyBookmarked?: boolean;
  onlyUnattempted?: boolean;
}

export interface PaginatedPracticeQuestions {
  questions: PracticeQuestion[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PracticeStats {
  totalQuestions: number;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  currentStreak: number;
  longestStreak: number;
  weakTopics: Array<{
    topicId: number;
    topicName: string;
    accuracy: number;
    questionCount: number;
  }>;
  strongTopics: Array<{
    topicId: number;
    topicName: string;
    accuracy: number;
    questionCount: number;
  }>;
}

// Additional types for the detail panel
export interface PracticeQuestionDetail extends PracticeQuestion {
  resources?: PracticeRelatedResource[];
  attempts?: PracticeAttempt[];
  explanation?: string;
  hints?: string[];
  relatedQuestions?: PracticeQuestion[];
}

export interface PracticeRelatedResource {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'article' | 'video' | 'tutorial';
  description?: string;
  difficulty: PracticeDifficulty;
}

export interface PracticeAttemptResult {
  isCorrect: boolean;
  matchPercentage?: number;
  correctAnswer?: string;
  explanation?: string;
  explanationText?: string;
  timeSpent: number;
  hints?: string[];
  attemptNumber?: number;
  scorePercentage?: number;
  difficultyExplanation?: string;
  learningObjectives?: string[];
  relatedResources?: PracticeRelatedResource[];
  options?: Array<{
    optionId: string;
    wasSelected: boolean;
    isCorrect: boolean;
  }>;
}

export interface SubmitPracticeAttemptRequest {
  questionId: string;
  selectedOptionIds?: string[];
  givenText?: string;
  timeSpent: number;
}