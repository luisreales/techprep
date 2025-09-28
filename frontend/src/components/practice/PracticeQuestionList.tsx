import React from 'react';
import { usePracticeQuestions } from '@/hooks/practice';
import { usePracticeModuleStore } from '@/stores/practiceModuleStore';
import { PracticeQuestion } from '@/types/practice';
import { Clock, BookmarkIcon, CheckCircle2, CircleX } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PracticeQuestionListProps {
  onQuestionSelect?: (question: PracticeQuestion) => void;
  selectedQuestionId?: string | null;
}

const difficultyColors = {
  Basic: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
};

const typeLabels = {
  SingleChoice: 'Single Choice',
  MultiChoice: 'Multiple Choice',
  Written: 'Written',
};

export const PracticeQuestionList: React.FC<PracticeQuestionListProps> = ({
  onQuestionSelect,
  selectedQuestionId,
}) => {
  const { data, isLoading, error } = usePracticeQuestions();
  const { setPage, page } = usePracticeModuleStore();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <CircleX className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load questions</p>
      </div>
    );
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-gray-600">No questions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.questions.map((question) => (
        <div
          key={question.id}
          className={cn(
            'bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md',
            selectedQuestionId === question.id && 'border-blue-500 bg-blue-50'
          )}
          onClick={() => onQuestionSelect?.(question)}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900 line-clamp-2 flex-1 mr-3">
              {question.text}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {question.isBookmarked && (
                <BookmarkIcon className="w-4 h-4 text-blue-500 fill-current" />
              )}
              {question.attemptCount && question.attemptCount > 0 && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  difficultyColors[question.level]
                )}
              >
                {question.level}
              </span>
              <span className="text-gray-600">{typeLabels[question.type]}</span>
              <span className="text-gray-500">Topic: {question.topicName}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              {question.averageTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.round(question.averageTime / 1000)}s</span>
                </div>
              )}
              {question.bestScore !== undefined && (
                <span className="text-green-600 font-medium">
                  {question.bestScore}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {data.total > data.limit && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!data.hasPrev}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {data.page} of {Math.ceil(data.total / data.limit)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data.hasNext}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};