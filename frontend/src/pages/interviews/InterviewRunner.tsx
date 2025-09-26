import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Save, Edit, RotateCcw, SkipForward } from 'lucide-react';
import { interviewApi, RunnerStateDto, RunnerQuestionDto, SubmitItem } from '@/services/interviewApi';

interface UserAnswer {
  type: 'single' | 'multiple' | 'written';
  optionIds?: string[];
  text?: string;
  timeMs: number;
  saved: boolean;
}

const InterviewRunner: React.FC = () => {
  const params = useParams<{ id?: string; templateId?: string }>();
  const sessionId = params.id ?? params.templateId;
  const navigate = useNavigate();

  const [runnerState, setRunnerState] = useState<RunnerStateDto | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersUser, setAnswersUser] = useState<Map<string, UserAnswer>>(new Map());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const currentQuestion = runnerState?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answersUser.get(currentQuestion.questionId) : null;

  // Load runner state
  useEffect(() => {
    const loadRunnerState = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        return;
      }

      try {
        console.log('Loading runner state for sessionId:', sessionId);
        const state = await interviewApi.getRunner(sessionId);
        console.log('Runner state loaded successfully:', state);
        setRunnerState(state);
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setQuestionStartTime(Date.now());
      } catch (err) {
        console.error('Failed to load runner state - Full error:', err);
        if (err instanceof Error) {
          setError(`Failed to load interview session: ${err.message}`);
        } else {
          setError(`Failed to load interview session: ${JSON.stringify(err)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRunnerState();
  }, [sessionId]);

  // Update answer in local state
  const updateCurrentAnswer = useCallback((updates: Partial<UserAnswer>) => {
    if (!currentQuestion) return;

    const currentTime = Date.now();
    const timeSpent = currentTime - questionStartTime;

    setAnswersUser(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(currentQuestion.questionId) || {
        type: currentQuestion.type,
        timeMs: 0,
        saved: false
      };

      newAnswers.set(currentQuestion.questionId, {
        ...existing,
        ...updates,
        timeMs: existing.timeMs + timeSpent
      });

      return newAnswers;
    });

    setQuestionStartTime(currentTime);
  }, [currentQuestion, questionStartTime]);

  // Handle single choice selection
  const handleSingleChoice = (optionId: string) => {
    if (currentAnswer?.saved && !isEditMode) return;

    updateCurrentAnswer({
      optionIds: [optionId],
      saved: false
    });
  };

  // Handle multiple choice selection
  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (currentAnswer?.saved && !isEditMode) return;

    const currentOptions = currentAnswer?.optionIds || [];
    const newOptions = checked
      ? [...currentOptions, optionId]
      : currentOptions.filter(id => id !== optionId);

    updateCurrentAnswer({
      optionIds: newOptions,
      saved: false
    });
  };

  // Handle written answer
  const handleWrittenAnswer = (text: string) => {
    if (currentAnswer?.saved && !isEditMode) return;

    updateCurrentAnswer({
      text,
      saved: false
    });
  };

  // Save current answer
  const handleGuardar = () => {
    if (!currentQuestion || !currentAnswer) return;

    updateCurrentAnswer({ saved: true });
    setIsEditMode(false);
  };

  // Enable edit mode
  const handleEditar = () => {
    setIsEditMode(true);
  };

  // Clear current answer
  const handleLimpiar = () => {
    if (!currentQuestion) return;

    updateCurrentAnswer({
      optionIds: [],
      text: '',
      saved: false
    });
    setIsEditMode(false);
  };

  // Skip current question
  const handleSkip = () => {
    if (!currentQuestion) return;

    // Mark as answered with empty response
    updateCurrentAnswer({
      optionIds: [],
      text: '',
      saved: true
    });

    if (currentQuestionIndex < (runnerState?.totalItems || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setIsEditMode(false);
    }
  };

  // Move to next question
  const handleAdelantar = () => {
    if (!currentAnswer?.saved) return;

    if (currentQuestionIndex < (runnerState?.totalItems || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setIsEditMode(false);
    }
  };

  // Submit entire interview
  const handleSubmitInterview = async () => {
    if (!sessionId || !runnerState) return;

    setSubmitting(true);
    try {
      const payload = {
        questions: Array.from(answersUser.entries()).map(([questionId, answer]): SubmitItem => ({
          questionId,
          type: answer.type,
          optionIds: answer.optionIds,
          text: answer.text,
          timeMs: answer.timeMs
        }))
      };

      await interviewApi.submit(sessionId, payload);
      navigate(`/interviews/summary/${sessionId}`);
    } catch (err) {
      setError('Failed to submit interview');
      console.error('Failed to submit interview:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading interview...</div>
      </div>
    );
  }

  if (error || !runnerState || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Interview not found'}</p>
          <button
            onClick={() => navigate('/interviews')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === runnerState.totalItems - 1;
  const canAdvance = currentAnswer?.saved && !isEditMode;
  const isAnswered = currentAnswer?.saved;
  const canEdit = isAnswered && !isEditMode;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Interview Mode</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Total Time: {formatTime(Array.from(answersUser.values()).reduce((total, a) => total + a.timeMs, 0))}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {runnerState.totalItems}
          </span>
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {currentQuestion.topic}
            </span>
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
            style={{ width: `${((currentQuestionIndex + 1) / runnerState.totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">{currentQuestion.text}</h2>

        {/* Single Choice */}
        {currentQuestion.type === 'single' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionKey = option.id ?? `${currentQuestion.questionId}-single-${index}`;
              return (
                <label key={optionKey} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQuestion.questionId}
                    value={option.id}
                    checked={currentAnswer?.optionIds?.includes(option.id) || false}
                  onChange={() => handleSingleChoice(option.id)}
                  disabled={isAnswered && !isEditMode}
                  className="w-4 h-4 text-blue-600"
                />
                  <span className={isAnswered && !isEditMode ? 'text-gray-500' : ''}>{option.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === 'multiple' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionKey = option.id ?? `${currentQuestion.questionId}-multiple-${index}`;
              return (
                <label key={optionKey} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={currentAnswer?.optionIds?.includes(option.id) || false}
                    onChange={(e) => handleMultipleChoice(option.id, e.target.checked)}
                    disabled={isAnswered && !isEditMode}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={isAnswered && !isEditMode ? 'text-gray-500' : ''}>{option.text}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Written Answer */}
        {currentQuestion.type === 'written' && (
          <textarea
            value={currentAnswer?.text || ''}
            onChange={(e) => handleWrittenAnswer(e.target.value)}
            disabled={isAnswered && !isEditMode}
            placeholder="Type your answer here..."
            className={`w-full h-32 p-3 border rounded-md resize-none ${
              isAnswered && !isEditMode ? 'bg-gray-50 text-gray-500' : ''
            }`}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Save */}
        {!isAnswered && (
          <button
            onClick={handleGuardar}
            disabled={!currentAnswer || submitting}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        )}

        {/* Editar */}
        {canEdit && (
          <button
            onClick={handleEditar}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}

        {/* Clear */}
        <button
          onClick={handleLimpiar}
          disabled={submitting}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          disabled={submitting}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip</span>
        </button>

        {/* Next */}
        {!isLastQuestion && (
          <button
            onClick={handleAdelantar}
            disabled={!canAdvance || submitting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Submit Interview */}
        {isLastQuestion && (
          <button
            onClick={handleSubmitInterview}
            disabled={submitting}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Answer'}</span>
          </button>
        )}
      </div>

      {/* Answer Status */}
      {isAnswered && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">
            ✓ Answer saved. Time spent: {formatTime(currentAnswer?.timeMs || 0)}
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewRunner;
