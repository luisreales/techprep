import React from 'react';
import { usePracticeProgress } from '@/hooks/practice';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

export const PracticeStatsHeader: React.FC = () => {
  const { data: progressResponse, isLoading } = usePracticeProgress();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!progressResponse) {
    return null;
  }

  // Map the API response to expected format
  const progress = {
    totalAttempts: progressResponse.totalAttempts || 0,
    correctAttempts: progressResponse.correctAttempts || 0,
    accuracy: progressResponse.accuracy || 0,
    totalSessions: progressResponse.totalSessions || 0,
    completedSessions: progressResponse.completedSessions || 0,
  };

  const stats = [
    {
      label: 'Questions Attempted',
      value: progress.totalAttempts.toLocaleString(),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Accuracy',
      value: `${Math.round(progress.accuracy)}%`,
      icon: TrendingUp,
      color: progress.accuracy >= 80 ? 'text-green-600' : progress.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600',
      bgColor: progress.accuracy >= 80 ? 'bg-green-100' : progress.accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100',
    },
    {
      label: 'Practice Sessions',
      value: progress.completedSessions.toString(),
      icon: Zap,
      color: progress.completedSessions >= 5 ? 'text-orange-600' : 'text-gray-600',
      bgColor: progress.completedSessions >= 5 ? 'bg-orange-100' : 'bg-gray-100',
    },
    {
      label: 'Correct Answers',
      value: progress.correctAttempts.toLocaleString(),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2', stat.bgColor)}>
                <Icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Practice Progress Summary */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Practice Progress</span>
          <span>
            {progress.completedSessions} / {progress.totalSessions} sessions completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, progress.totalSessions > 0 ? (progress.completedSessions / progress.totalSessions) * 100 : 0)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};