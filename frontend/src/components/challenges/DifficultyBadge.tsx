import React from 'react';
import type { ChallengeDifficulty } from '@/types/challenges';

interface DifficultyBadgeProps {
  difficulty: ChallengeDifficulty | string;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ 
  difficulty, 
  className = '' 
}) => {
  const getDifficultyStyles = (diff: ChallengeDifficulty | string) => {
    const normalizedDiff = typeof diff === 'string' ? diff.toLowerCase() : diff.toString();
    
    switch (normalizedDiff) {
      case 'basic':
      case '1':
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
      case '2':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
      case '3':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (diff: ChallengeDifficulty | string) => {
    const normalizedDiff = typeof diff === 'string' ? diff.toLowerCase() : diff.toString();
    
    switch (normalizedDiff) {
      case 'basic':
      case '1':
      case 'easy':
        return 'Basic';
      case 'medium':
      case '2':
        return 'Medium';
      case 'hard':
      case '3':
        return 'Hard';
      default:
        return String(diff);
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyStyles(
        difficulty
      )} ${className}`}
    >
      {getDifficultyLabel(difficulty)}
    </span>
  );
};