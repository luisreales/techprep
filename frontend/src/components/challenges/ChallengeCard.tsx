import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, Code } from 'lucide-react';
import type { ChallengeListItem } from '@/types/challenges';
import { DifficultyBadge } from './DifficultyBadge';
import { LanguageBadge } from './LanguageBadge';
import { TagBadge } from './TagBadge';
import { ProgressIndicator } from './ProgressIndicator';
import { useChallengeProgress } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: ChallengeListItem;
  showProgress?: boolean;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  showProgress = true,
  className = ''
}) => {
  const { hasAttempted, getBestScore, isCompleted } = useChallengeProgress();
  
  const challengeHasAttempted = hasAttempted(challenge.id);
  const challengeIsCompleted = isCompleted(challenge.id);
  const challengeBestScore = getBestScore(challenge.id);

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className={`block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
            {challenge.title}
          </h3>
          
          <div className="flex items-center gap-3 mb-3">
            <LanguageBadge language={challenge.language} />
            <DifficultyBadge difficulty={challenge.difficulty} />
            {challenge.hasSolution && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <Code className="h-3 w-3 mr-1" />
                Solution
              </span>
            )}
          </div>

          {challenge.tags && challenge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {challenge.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {challenge.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{challenge.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {showProgress && (
          <div className="flex-shrink-0 ml-4">
            <ProgressIndicator
              hasAttempted={challengeHasAttempted}
              isCompleted={challengeIsCompleted}
              bestScore={challengeBestScore}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(challenge.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {challengeIsCompleted && (
            <span className="text-green-600 font-medium">Completed</span>
          )}
          {challengeHasAttempted && !challengeIsCompleted && (
            <span className="text-yellow-600 font-medium">In Progress</span>
          )}
          {!challengeHasAttempted && (
            <span className="text-gray-500">Not Started</span>
          )}
        </div>
      </div>
    </Link>
  );
};