import React from 'react';
import { Clock, CheckCircle, Code, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ChallengeAttempt } from '@/types/challenges';

interface AttemptHistoryProps {
  attempts: ChallengeAttempt[];
  challengeId: number;
  className?: string;
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  attempts,
  challengeId,
  className = ''
}) => {
  const challengeAttempts = attempts
    .filter(attempt => attempt.challengeId === challengeId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  if (challengeAttempts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Code className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h3>
        <p className="text-gray-500">Start coding to see your attempt history here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Attempts</h3>
      
      <div className="space-y-3">
        {challengeAttempts.map((attempt) => (
          <div
            key={attempt.id}
            className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex-shrink-0">
              {attempt.markedSolved ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {attempt.markedSolved ? 'Completed' : 'In Progress'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span title={new Date(attempt.startedAt).toLocaleString()}>
                    {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                {attempt.score !== undefined && (
                  <span className="font-medium">
                    Score: <span className={attempt.score >= 80 ? 'text-green-600' : attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {attempt.score}%
                    </span>
                  </span>
                )}
                
                {attempt.finishedAt && (
                  <span>
                    Duration: {formatDistanceToNow(
                      new Date(attempt.startedAt),
                      { to: new Date(attempt.finishedAt) }
                    )}
                  </span>
                )}
              </div>
              
              {attempt.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 truncate" title={attempt.notes}>
                    {attempt.notes.length > 100 ? `${attempt.notes.substring(0, 100)}...` : attempt.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {challengeAttempts.length > 5 && (
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all attempts ({challengeAttempts.length})
          </button>
        </div>
      )}
    </div>
  );
};