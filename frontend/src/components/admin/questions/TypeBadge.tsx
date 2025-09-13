import React from 'react';
import { 
  QuestionType, 
  DifficultyLevel, 
  questionTypeLabels, 
  difficultyLevelLabels,
  questionTypeBadgeColors,
  difficultyLevelBadgeColors 
} from '@/utils/enums';

interface TypeBadgeProps {
  type: QuestionType;
  className?: string;
}

interface LevelBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className = '' }) => {
  const colorClass = questionTypeBadgeColors[type];
  const label = questionTypeLabels[type];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = '' }) => {
  const colorClass = difficultyLevelBadgeColors[level];
  const label = difficultyLevelLabels[level];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};