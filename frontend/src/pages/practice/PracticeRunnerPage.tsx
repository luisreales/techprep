// PracticeRunnerPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Save,
  Edit,
  RotateCcw,
  SkipForward,
  X,
  CheckCircle,
  XCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import PracticeModuleApi, { type SubmitPracticeAttemptRequest } from '@/services/practiceModuleApi';

interface PracticeQuestion {
  id: string;
  text: string;
  type: 'SingleChoice' | 'MultiChoice' | 'Written';
  level: string;
  topicId?: number;
  topicName?: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
}

interface PracticeAnswer {
  type: 'single' | 'multiple' | 'written';
  optionIds?: string[];
  text?: string;
  timeMs: number;
  submitted: boolean;
}

interface PracticeFeedback {
  isCorrect: boolean;
  matchPercentage?: number;
  correctAnswer?: string;
  explanation?: string;
  relatedResources?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
    description: string;
  }>;
}

interface PracticeRunnerPageProps {
  sessionId?: string;
}

export const PracticeRunnerPage: React.FC<PracticeRunnerPageProps> = ({ sessionId: propSessionId }) => {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId = propSessionId || paramSessionId || 'demo-session';
  const questions = location.state?.questions as PracticeQuestion[] || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    // Initialize with the session's current question index if available
    return location.state?.sessionData?.currentIndex || 0;
  });
  const [answers, setAnswers] = useState<Map<string, PracticeAnswer>>(new Map());
  const [feedback, setFeedback] = useState<Map<string, PracticeFeedback>>(new Map());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;
  const currentFeedback = currentQuestion ? feedback.get(currentQuestion.id) : null;

  // Initialize question start time when component mounts or question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Update session progress when question index changes
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch(`/api/practice/${sessionId}/update-progress`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentQuestionIndex: currentQuestionIndex
          })
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    // Only update progress if we have questions and sessionId
    if (questions.length > 0 && sessionId && currentQuestionIndex >= 0) {
      updateProgress();
    }
  }, [currentQuestionIndex, sessionId, questions.length]);

  // Answer handlers
  const handleSingleChoice = useCallback((optionId: string) => {
    if (!currentQuestion || currentAnswer?.submitted) return;

    const newAnswer: PracticeAnswer = {
      type: 'single',
      optionIds: [optionId],
      timeMs: Date.now() - questionStartTime,
      submitted: false
    };

    setAnswers(prev => new Map(prev).set(currentQuestion.id, newAnswer));
  }, [currentQuestion, currentAnswer, questionStartTime]);

  const handleMultipleChoice = useCallback((optionId: string, checked: boolean) => {
    if (!currentQuestion || currentAnswer?.submitted) return;

    const currentOptionIds = currentAnswer?.optionIds || [];
    const newOptionIds = checked
      ? [...currentOptionIds, optionId]
      : currentOptionIds.filter(id => id !== optionId);

    const newAnswer: PracticeAnswer = {
      type: 'multiple',
      optionIds: newOptionIds,
      timeMs: Date.now() - questionStartTime,
      submitted: false
    };

    setAnswers(prev => new Map(prev).set(currentQuestion.id, newAnswer));
  }, [currentQuestion, currentAnswer, questionStartTime]);

  const handleWrittenAnswer = useCallback((text: string) => {
    if (!currentQuestion || currentAnswer?.submitted) return;

    const newAnswer: PracticeAnswer = {
      type: 'written',
      text,
      timeMs: Date.now() - questionStartTime,
      submitted: false
    };

    setAnswers(prev => new Map(prev).set(currentQuestion.id, newAnswer));
  }, [currentQuestion, currentAnswer, questionStartTime]);

  // Submit answer and get immediate feedback
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !currentAnswer || currentAnswer.submitted || submitting) return;

    setSubmitting(true);
    try {
      const request: SubmitPracticeAttemptRequest = {
        questionId: currentQuestion.id,
        selectedOptionIds: currentAnswer.optionIds,
        givenText: currentAnswer.text,
        timeSpent: currentAnswer.timeMs
      };

      const result = await PracticeModuleApi.submitAttempt(request);

      // Mark answer as submitted
      const submittedAnswer: PracticeAnswer = {
        ...currentAnswer,
        submitted: true
      };
      setAnswers(prev => new Map(prev).set(currentQuestion.id, submittedAnswer));

      // Store feedback
      const practiceFeedback: PracticeFeedback = {
        isCorrect: result.isCorrect,
        matchPercentage: result.matchPercentage,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        relatedResources: result.relatedResources || []
      };
      setFeedback(prev => new Map(prev).set(currentQuestion.id, practiceFeedback));

    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, currentAnswer, submitting]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Mark session as completed before navigating to review
      try {
        setLoading(true);
        // Call the complete endpoint
        const response = await fetch(`/api/practice/${sessionId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('Session marked as completed successfully');
        } else {
          console.error('Failed to mark session as completed');
        }
      } catch (error) {
        console.error('Error completing session:', error);
      } finally {
        setLoading(false);
      }

      // Navigate to practice review (similar to interview review)
      navigate(`/practice/review/${sessionId}`);
    }
  }, [currentQuestionIndex, questions.length, navigate, sessionId]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleClear = useCallback(() => {
    if (!currentQuestion) return;

    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.delete(currentQuestion.id);
      return newAnswers;
    });

    setFeedback(prev => {
      const newFeedback = new Map(prev);
      newFeedback.delete(currentQuestion.id);
      return newFeedback;
    });
  }, [currentQuestion]);

  const handleRetry = useCallback(() => {
    if (!currentQuestion) return;

    // Reset answer and feedback for this question
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.delete(currentQuestion.id);
      return newAnswers;
    });

    setFeedback(prev => {
      const newFeedback = new Map(prev);
      newFeedback.delete(currentQuestion.id);
      return newFeedback;
    });

    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  // Exit handlers
  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleExitConfirm = () => {
    navigate('/practice');
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate total time spent
  const totalTimeSpent = Array.from(answers.values()).reduce((total, answer) => total + answer.timeMs, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading practice session...</div>
      </div>
    );
  }

  // Error or no questions state
  if (error || !currentQuestion || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No questions available'}</p>
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = currentAnswer?.submitted;
  const hasAnswer = currentAnswer && (currentAnswer.optionIds?.length || currentAnswer.text);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Practice Mode</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Total Time: {formatTime(totalTimeSpent)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex space-x-2">
            {currentQuestion.topicName && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {currentQuestion.topicName}
              </span>
            )}
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {currentQuestion.level}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              {currentQuestion.type}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">{currentQuestion.text}</h2>

        {/* Single Choice */}
        {currentQuestion.type === 'SingleChoice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.id}
                  checked={currentAnswer?.optionIds?.includes(option.id) || false}
                  onChange={() => handleSingleChoice(option.id)}
                  disabled={isAnswered}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={isAnswered ? 'text-gray-500' : ''}>{option.text}</span>
                {/* Show correct/incorrect indicators after submission */}
                {isAnswered && currentFeedback && (
                  <span className="ml-auto">
                    {option.isCorrect && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!option.isCorrect && currentAnswer?.optionIds?.includes(option.id) && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === 'MultiChoice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={currentAnswer?.optionIds?.includes(option.id) || false}
                  onChange={(e) => handleMultipleChoice(option.id, e.target.checked)}
                  disabled={isAnswered}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={isAnswered ? 'text-gray-500' : ''}>{option.text}</span>
                {/* Show correct/incorrect indicators after submission */}
                {isAnswered && currentFeedback && (
                  <span className="ml-auto">
                    {option.isCorrect && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!option.isCorrect && currentAnswer?.optionIds?.includes(option.id) && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        {/* Written Answer */}
        {currentQuestion.type === 'Written' && (
          <textarea
            value={currentAnswer?.text || ''}
            onChange={(e) => handleWrittenAnswer(e.target.value)}
            disabled={isAnswered}
            placeholder="Type your answer here..."
            className={`w-full h-32 p-3 border rounded-md resize-none ${
              isAnswered ? 'bg-gray-50 text-gray-500' : ''
            }`}
          />
        )}
      </div>

      {/* Feedback Section */}
      {isAnswered && currentFeedback && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {currentFeedback.isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <h3 className={`text-lg font-semibold ${
              currentFeedback.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {currentFeedback.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            {currentFeedback.matchPercentage && (
              <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {currentFeedback.matchPercentage}% match
              </span>
            )}
          </div>

          {currentFeedback.explanation && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
              <p className="text-gray-700">{currentFeedback.explanation}</p>
            </div>
          )}

          {currentFeedback.correctAnswer && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Correct Answer</h4>
              <p className="text-gray-700">{currentFeedback.correctAnswer}</p>
            </div>
          )}

          {currentFeedback.relatedResources && currentFeedback.relatedResources.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Related Resources
              </h4>
              <div className="space-y-2">
                {currentFeedback.relatedResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-blue-900">{resource.title}</h5>
                      {resource.description && (
                        <p className="text-sm text-blue-700">{resource.description}</p>
                      )}
                      <span className="text-xs text-blue-600 uppercase">{resource.type}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        {/* Exit */}
        <button
          onClick={handleExitClick}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="flex flex-wrap gap-3">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Submit Answer */}
          {!isAnswered && hasAnswer && (
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit'}</span>
            </button>
          )}

          {/* Retry */}
          {isAnswered && (
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              <Edit className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}

          {/* Clear */}
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            <SkipForward className="w-4 h-4" />
            <span>Skip</span>
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <span>{isLastQuestion ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Exit Practice Session?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? Your progress will be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExitCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExitConfirm}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Exit Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
