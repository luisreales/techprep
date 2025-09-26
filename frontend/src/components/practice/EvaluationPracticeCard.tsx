import React, { useState } from 'react';
import { CheckCircle, XCircle, BookOpen, Timer, ArrowRight } from 'lucide-react';
import { sessionsApi, type AnswerSubmission, type AnswerResult } from '@/services/sessionsApi';
import type { Question } from '@/types';

interface Props {
  question: Question;
  sessionId: string;
  mode: 'practice' | 'interview';
  onComplete: (result?: AnswerResult) => void;
  onNext?: () => void;
}

export const EvaluationPracticeCard: React.FC<Props> = ({
  question,
  sessionId,
  mode,
  onComplete,
  onNext
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [startTime] = useState(Date.now());

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => {
      if (question.type === 'single_choice') {
        return checked ? [optionId] : [];
      } else {
        return checked
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId);
      }
    });
  };

  const handleSubmit = async () => {
    const timeMs = Date.now() - startTime;
    setLoading(true);

    try {
      let submission: AnswerSubmission;

      switch (question.type) {
        case 'single_choice':
          submission = {
            questionId: question.id,
            answerType: 'single_choice',
            options: selectedOptions,
            timeMs
          };
          break;
        case 'multi_choice':
          submission = {
            questionId: question.id,
            answerType: 'multi_choice',
            options: selectedOptions,
            timeMs
          };
          break;
        case 'written':
          submission = {
            questionId: question.id,
            answerType: 'written',
            text: textAnswer,
            timeMs
          };
          break;
        default:
          return;
      }

      const response = await sessionsApi.submitInterviewAnswer(sessionId, submission);

      if (response.success && response.data) {
        setResult(response.data);
        onComplete(response.data);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      // Still call onComplete to allow progression
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAnswer = () => {
    if (!selectedOptions.length && !textAnswer) return false;
    if (question.type === 'written') return textAnswer.trim().length > 0;
    return selectedOptions.length > 0;
  };

  const renderQuestionInput = () => {
    if (result && mode === 'interview') return null; // Hide input for interview mode after submission

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.id}
                  name="single-choice"
                  value={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      case 'multi_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      case 'written':
        return (
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const renderFeedback = () => {
    if (!result || mode === 'interview') return null;

    return (
      <div className="mt-4 bg-white border border-gray-200 rounded-lg border-l-4 border-l-blue-500">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            {result.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={`font-medium ${
              result.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            {result.matchPercent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {result.matchPercent.toFixed(1)}% match
              </span>
            )}
          </div>

          {result.explanation && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Explanation:</h4>
              <p className="text-sm text-gray-600">{result.explanation}</p>
            </div>
          )}

          {result.resources && result.resources.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Additional Resources:
              </h4>
              <div className="space-y-1">
                {result.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 block"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{question.text}</h3>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {question.type?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {renderQuestionInput()}

        <div className="flex gap-3 pt-4">
          {!result && (
            <button
              onClick={handleSubmit}
              disabled={loading || !getSelectedAnswer()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-24"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}

          {(result || mode === 'interview') && onNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-24 flex items-center"
            >
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>

        {renderFeedback()}
      </div>
    </div>
  );
};