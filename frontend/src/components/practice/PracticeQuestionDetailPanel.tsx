import React, { useEffect, useMemo, useState } from 'react';
import {
  PracticeAttemptResult,
  PracticeQuestionDetail,
  PracticeQuestionOption,
  PracticeRelatedResource,
  SubmitPracticeAttemptRequest,
} from '@/types/practice';
import {
  usePracticeQuestionDetail,
  usePracticeQuestionResources,
  usePracticeBookmarkMutation,
  useSubmitPracticeAttempt,
} from '@/hooks/practice';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle, Loader2, Sparkle, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PracticeQuestionDetailPanelProps {
  questionId: string | null;
  onClose?: () => void;
  sessionMode?: boolean;
  onQuestionComplete?: (result: any) => void;
}

const typeLabel: Record<string, string> = {
  SingleChoice: 'Single Choice',
  MultiChoice: 'Multiple Choice',
  Written: 'Written',
};

const difficultyTone: Record<string, string> = {
  Basic: 'bg-emerald-100 text-emerald-800',
  Intermediate: 'bg-amber-100 text-amber-800',
  Advanced: 'bg-rose-100 text-rose-800',
};

const buildInitialState = (question?: PracticeQuestionDetail | null) => {
  if (!question) {
    return {
      selectedOptionIds: [] as string[],
      writtenAnswer: '',
    };
  }
  return {
    selectedOptionIds: [] as string[],
    writtenAnswer: '',
  };
};

const OptionRow: React.FC<{
  option: PracticeQuestionOption;
  question: PracticeQuestionDetail;
  selected: boolean;
  disabled: boolean;
  onToggle: (optionId: string) => void;
  feedback?: PracticeAttemptResult | null;
}> = ({ option, question, selected, disabled, onToggle, feedback }) => {
  const isMulti = question.type === 'MultiChoice';
  const isSingle = question.type === 'SingleChoice';
  const wasSelected = feedback?.options?.find((item) => item.optionId === option.id)?.wasSelected;
  const isCorrect = feedback?.options?.find((item) => item.optionId === option.id)?.isCorrect;

  const statusClass = feedback
    ? isCorrect
      ? 'border-emerald-400 bg-emerald-50'
      : wasSelected
        ? 'border-rose-300 bg-rose-50'
        : 'border-slate-200'
    : selected
      ? 'border-blue-300 bg-blue-50'
      : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50';

  const icon = feedback
    ? isCorrect
      ? <CheckCircle2 size={18} className="text-emerald-600" />
      : wasSelected
        ? <XCircle size={18} className="text-rose-500" />
        : <Circle size={18} className="text-slate-300" />
    : selected
      ? <CheckCircle2 size={18} className="text-blue-500" />
      : <Circle size={18} className="text-slate-300" />;

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition',
        disabled ? 'cursor-default opacity-70' : '',
        statusClass,
      )}
    >
      <input
        type={isMulti ? 'checkbox' : 'radio'}
        name={`practice-option-${question.id}`}
        value={option.id}
        checked={selected}
        disabled={disabled}
        onChange={() => onToggle(option.id)}
        className="hidden"
      />
      {icon}
      <span className="flex-1 text-slate-700">{option.text}</span>
    </label>
  );
};

export const PracticeQuestionDetailPanel: React.FC<PracticeQuestionDetailPanelProps> = ({ questionId, onClose }) => {
  const { data: question, isLoading, isFetching } = usePracticeQuestionDetail(questionId);
  const { data: relatedResources } = usePracticeQuestionResources(questionId);
  const bookmarkMutation = usePracticeBookmarkMutation(questionId);
  const submitAttempt = useSubmitPracticeAttempt(questionId);

  const [showHint, setShowHint] = useState(false);
  const [{ selectedOptionIds, writtenAnswer }, setResponseState] = useState(() => buildInitialState(question));
  const [attemptResult, setAttemptResult] = useState<PracticeAttemptResult | null>(null);

  useEffect(() => {
    setResponseState(buildInitialState(question));
    setAttemptResult(null);
    setShowHint(false);
  }, [questionId, question?.id]);

  const isAttempting = submitAttempt.isPending;
  const hasFeedback = Boolean(attemptResult);

  const handleToggleOption = (optionId: string) => {
    if (!question || isAttempting || hasFeedback) {
      return;
    }

    if (question.type === 'SingleChoice') {
      setResponseState((prev) => ({ ...prev, selectedOptionIds: prev.selectedOptionIds.includes(optionId) ? [] : [optionId] }));
    } else {
      setResponseState((prev) => ({
        ...prev,
        selectedOptionIds: prev.selectedOptionIds.includes(optionId)
          ? prev.selectedOptionIds.filter((id) => id !== optionId)
          : [...prev.selectedOptionIds, optionId],
      }));
    }
  };

  // // 👇 aquí defines el computedStats
  // const computedStats = useMemo(() => {
  //   if (!question) return { totalAttempts: 0, accuracy: 0 };
  //   const total = question.attemptCount ?? question.attempts?.length ?? 0;
  //   if (!total) return { totalAttempts: 0, accuracy: 0 };

  //   const correct = (question.attempts ?? []).filter(a => a.isCorrect).length;
  //   const accuracy = (correct / total) * 100;
  //   return { totalAttempts: total, accuracy };
  // }, [question]);

  const { combinedResources, computedStats } = useMemo(() => {
    // ---- resources ----
    const attemptResources = attemptResult?.relatedResources ?? [];
    const fallback = relatedResources ?? [];
    const dedup = new Map<string, PracticeRelatedResource>();
    [...attemptResources, ...fallback].forEach((resource) => {
      dedup.set(resource.id, resource);
    });
    const combinedResources = Array.from(dedup.values());

    // ---- stats ----
    let totalAttempts = 0;
    let accuracy = 0;
    if (question) {
      totalAttempts = question.attemptCount ?? question.attempts?.length ?? 0;
      if (totalAttempts > 0) {
        const correct = (question.attempts ?? []).filter((a: any) => a.isCorrect).length;
        accuracy = (correct / totalAttempts) * 100;
      }
    }

    return {
      combinedResources,
      computedStats: { totalAttempts, accuracy }
    };
  }, [attemptResult?.relatedResources, relatedResources, question]);

  if (!questionId || isLoading) return null;

  const handleSubmit = () => {
    if (!question) {
      return;
    }

    const payload: SubmitPracticeAttemptRequest = {
      questionId: question.id,
      selectedOptionIds,
      givenText: question.type === 'Written' ? writtenAnswer.trim() : undefined,
      timeSpent: 0, // TODO: Implement time tracking
    };

    submitAttempt.mutate(payload, {
      onSuccess: (result) => {
        setAttemptResult(result);
      },
    });
  };

  const handleTryAgain = () => {
    setAttemptResult(null);
    setResponseState(buildInitialState(question));
    setShowHint(false);
  };

  const toggleBookmark = () => {
    if (!question) {
      return;
    }
    bookmarkMutation.mutate(question.id);
  };


  if (!questionId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        Select a question to get started.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white/70">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="animate-spin text-blue-500" size={18} /> Loading question…
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        Question unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        {onClose && (
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {question.topicName}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyTone[question.level] ?? 'bg-slate-100 text-slate-600'}`}>
                {question.level}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">
                {typeLabel[question.type] ?? question.type}
              </span>
               {/* Display accuracy stats */}
                {computedStats.totalAttempts > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                    {computedStats.accuracy.toFixed(1)}% accuracy
                  </span>
                )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{question.text}</h2>
          </div>
          <button
            type="button"
            onClick={toggleBookmark}
            disabled={bookmarkMutation.isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition',
              question.isBookmarked
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600',
            )}
          >
            {question.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {question.isBookmarked ? 'Bookmarked' : 'Save'}
          </button>
        </div>

        {question.type === 'Written' ? (
          <div className="mt-4 space-y-3">
            <textarea
              value={writtenAnswer}
              onChange={(event) => setResponseState((prev) => ({ ...prev, writtenAnswer: event.target.value }))}
              disabled={isAttempting || hasFeedback}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Write your answer here"
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {question.options.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                question={question}
                selected={selectedOptionIds.includes(option.id)}
                disabled={isAttempting || hasFeedback}
                onToggle={handleToggleOption}
                feedback={attemptResult}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {question.hintSummary && (
            <button
              type="button"
              onClick={() => setShowHint((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <Sparkle size={16} /> {showHint ? 'Hide hint' : 'Show hint'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAttempting || hasFeedback}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isAttempting && <Loader2 className="animate-spin" size={16} />} Submit answer
          </button>
          {hasFeedback && (
            <button
              type="button"
              onClick={handleTryAgain}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              Try again
            </button>
          )}
        </div>

        {showHint && question.hintSummary && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-700">
            {question.hintSummary}
          </div>
        )}

        {attemptResult && (
          <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              {attemptResult.isCorrect ? (
                <CheckCircle2 className="text-emerald-500" size={20} />
              ) : (
                <XCircle className="text-rose-500" size={20} />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {attemptResult.isCorrect ? 'Great job!' : 'Not quite yet'}
                </p>
                <p className="text-xs text-slate-500">
                  Attempt {attemptResult.attemptNumber} • {attemptResult.scorePercentage?.toFixed(1) ?? '0'}% score
                </p>
              </div>
            </div>
            {attemptResult.correctAnswer && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
                <span className="font-semibold">Correct answer:</span> {attemptResult.correctAnswer}
              </div>
            )}
            {attemptResult.explanationText && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-800">Explanation</p>
                <p className="mt-1 whitespace-pre-line">{attemptResult.explanationText}</p>
                {attemptResult.difficultyExplanation && (
                  <p className="mt-2 text-xs text-slate-500">Why this is {question.level}: {attemptResult.difficultyExplanation}</p>
                )}
              </div>
            )}
            {attemptResult.learningObjectives?.length ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Learning objectives</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {attemptResult.learningObjectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {combinedResources.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Learn more</p>
          <div className="mt-3 space-y-2">
            {combinedResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="line-clamp-1">{resource.title}</span>
                <span className="text-xs text-slate-400">{resource.difficulty ?? 'All levels'}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
