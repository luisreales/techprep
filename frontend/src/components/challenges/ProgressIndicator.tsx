import React from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  hasAttempted: boolean;
  isCompleted: boolean;
  bestScore?: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  hasAttempted,
  isCompleted,
  bestScore,
  className = ''
}) => {
  if (isCompleted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-green-700">Completed</span>
        {bestScore !== undefined && (
          <span className="text-sm text-gray-500">({bestScore}%)</span>
        )}
      </div>
    );
  }

  if (hasAttempted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-medium text-yellow-700">In Progress</span>
        {bestScore !== undefined && (
          <span className="text-sm text-gray-500">({bestScore}%)</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Circle className="h-5 w-5 text-gray-400" />
      <span className="text-sm text-gray-500">Not Started</span>
    </div>
  );
};