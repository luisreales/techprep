// Challenge Language enum matching backend ChallengeLanguage
export const enum ChallengeLanguage {
  CSharp = 1,
  JavaScript = 2,
  TypeScript = 3,
  Python = 4,
  Java = 5,
  Go = 6,
  Rust = 7
}

// Challenge Difficulty enum matching backend ChallengeDifficulty
export const enum ChallengeDifficulty {
  Basic = 1,
  Medium = 2,
  Hard = 3
}

// String representations for display
export const ChallengeLanguageLabels: Record<ChallengeLanguage, string> = {
  [ChallengeLanguage.CSharp]: 'C#',
  [ChallengeLanguage.JavaScript]: 'JavaScript',
  [ChallengeLanguage.TypeScript]: 'TypeScript',
  [ChallengeLanguage.Python]: 'Python',
  [ChallengeLanguage.Java]: 'Java',
  [ChallengeLanguage.Go]: 'Go',
  [ChallengeLanguage.Rust]: 'Rust'
};

export const ChallengeDifficultyLabels: Record<ChallengeDifficulty, string> = {
  [ChallengeDifficulty.Basic]: 'Basic',
  [ChallengeDifficulty.Medium]: 'Medium',
  [ChallengeDifficulty.Hard]: 'Hard'
};

// Tag interfaces matching backend TagDto, TagCreateDto, TagUpdateDto
export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name: string;
  color?: string;
}

// Challenge interfaces matching backend DTOs
export interface ChallengeListItem {
  id: number;
  title: string;
  language: string;
  difficulty: string;
  hasSolution: boolean;
  createdAt: string;
  tags: string[];
}

export interface ChallengeDetail {
  id: number;
  title: string;
  language: string;
  difficulty: string;
  prompt: string;
  hasSolution: boolean;
  officialSolution?: string;
  testsJson?: string;
  tags: string[];
  topics: string[];
}

export interface ChallengeCreate {
  title: string;
  language: string;
  difficulty: string;
  prompt: string;
  officialSolution?: string;
  testsJson?: string;
  tags?: string[];
  topicIds?: number[];
}

export interface ChallengeUpdate {
  title: string;
  language: string;
  difficulty: string;
  prompt: string;
  officialSolution?: string;
  testsJson?: string;
  tags?: string[];
  topicIds?: number[];
}

// Attempt interfaces matching backend AttemptDto, AttemptCreateDto
export interface ChallengeAttempt {
  id: string;
  challengeId: number;
  startedAt: string;
  finishedAt?: string;
  markedSolved?: boolean;
  score?: number;
  notes?: string;
}

export interface ChallengeAttemptCreate {
  submittedCode?: string;
  markSolved?: boolean;
  score?: number;
  notes?: string;
}

// Filter and pagination interfaces
export interface ChallengeFilters {
  language?: ChallengeLanguage;
  difficulty?: ChallengeDifficulty;
  tags?: string[];
  search?: string;
  hasSolution?: boolean;
  topicIds?: number[];
}

export interface ChallengePagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Response interfaces
export interface ChallengesResponse {
  challenges: ChallengeListItem[];
  pagination: ChallengePagination;
}

export interface ChallengeResponse {
  challenge: ChallengeDetail;
}

// Challenge status tracking
export interface ChallengeProgress {
  challengeId: number;
  hasAttempted: boolean;
  isCompleted: boolean;
  bestScore?: number;
  lastAttemptedAt?: string;
  completedAt?: string;
}

// Test case interfaces for challenges
export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
}

// Challenge submission interface
export interface ChallengeSubmission {
  challengeId: number;
  code: string;
  language: ChallengeLanguage;
  testResults?: TestResult[];
  passed: boolean;
  score?: number;
  executionTime?: number;
  memoryUsage?: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

// Challenge statistics
export interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  averageScore: number;
  totalAttempts: number;
  favoriteLanguage?: ChallengeLanguage;
  difficultyBreakdown: {
    basic: { total: number; completed: number };
    medium: { total: number; completed: number };
    hard: { total: number; completed: number };
  };
}

// Type guards for runtime type checking
export const isChallengeLanguage = (value: unknown): value is ChallengeLanguage => {
  return typeof value === 'number' && Object.values(ChallengeLanguage).includes(value);
};

export const isChallengeDifficulty = (value: unknown): value is ChallengeDifficulty => {
  return typeof value === 'number' && Object.values(ChallengeDifficulty).includes(value);
};

// Helper functions for type conversion
export const stringToLanguage = (language: string): ChallengeLanguage | undefined => {
  const entry = Object.entries(ChallengeLanguageLabels).find(([, label]) => 
    label.toLowerCase() === language.toLowerCase()
  );
  return entry ? Number(entry[0]) as ChallengeLanguage : undefined;
};

export const stringToDifficulty = (difficulty: string): ChallengeDifficulty | undefined => {
  const entry = Object.entries(ChallengeDifficultyLabels).find(([, label]) => 
    label.toLowerCase() === difficulty.toLowerCase()
  );
  return entry ? Number(entry[0]) as ChallengeDifficulty : undefined;
};

// Default values for filters
export const DEFAULT_CHALLENGE_FILTERS: ChallengeFilters = {};

export const DEFAULT_PAGINATION: ChallengePagination = {
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};