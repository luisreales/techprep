export enum QuestionType {
  SingleChoice = 1,
  MultiChoice = 2,
  Written = 3
}

export enum DifficultyLevel {
  Basic = 1,
  Intermediate = 2,
  Advanced = 3
}

// Display labels for question types
export const questionTypeLabels = {
  [QuestionType.SingleChoice]: 'Single Choice',
  [QuestionType.MultiChoice]: 'Multiple Choice',
  [QuestionType.Written]: 'Written'
} as const;

// Display labels for difficulty levels
export const difficultyLevelLabels = {
  [DifficultyLevel.Basic]: 'Basic',
  [DifficultyLevel.Intermediate]: 'Intermediate',
  [DifficultyLevel.Advanced]: 'Advanced'
} as const;

// Color classes for badges
export const questionTypeBadgeColors = {
  [QuestionType.SingleChoice]: 'bg-blue-100 text-blue-800',
  [QuestionType.MultiChoice]: 'bg-purple-100 text-purple-800',
  [QuestionType.Written]: 'bg-green-100 text-green-800'
} as const;

export const difficultyLevelBadgeColors = {
  [DifficultyLevel.Basic]: 'bg-gray-100 text-gray-800',
  [DifficultyLevel.Intermediate]: 'bg-yellow-100 text-yellow-800',
  [DifficultyLevel.Advanced]: 'bg-red-100 text-red-800'
} as const;

// Icons for types (using Lucide React icons)
export const questionTypeIcons = {
  [QuestionType.SingleChoice]: 'CheckCircle',
  [QuestionType.MultiChoice]: 'CheckSquare',
  [QuestionType.Written]: 'FileText'
} as const;

export const difficultyLevelIcons = {
  [DifficultyLevel.Basic]: 'Circle',
  [DifficultyLevel.Intermediate]: 'AlertCircle', 
  [DifficultyLevel.Advanced]: 'AlertTriangle'
} as const;