import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Save, Edit, RotateCcw, SkipForward, AlertCircle, Timer } from 'lucide-react';
import { practiceInterviewTemplatesApi } from '@/services/practiceInterviewTemplates';
import { interviewApi } from '@/services/interviewApi';
import { http } from '@/utils/axios';
import type { Question } from '@/types';
import type { TemplateDto } from '@/types/practiceInterview';

interface InterviewRunnerPageProps {
  templateId?: string;
}

export const InterviewRunnerPage: React.FC<InterviewRunnerPageProps> = ({ templateId: propTemplateId }) => {
  const { templateId: paramTemplateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const templateId = propTemplateId || paramTemplateId;

  // Don't use navigation state template data since it's incomplete SessionTemplate
  // Always fetch complete TemplateDto from API
  const [template, setTemplate] = useState<TemplateDto | null>(null);
  const [interviewSession, setInterviewSession] = useState<{ sessionId: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string | string[], saved: boolean, timeMs: number }>>({});
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const isAnswered = currentAnswer?.saved || false;
  const canEdit = isAnswered && !isEditMode;
  const isLastQuestion = currentIndex === questions.length - 1;
  const canAdvance = isAnswered && !isEditMode;

  const finishInterview = useCallback(async () => {
    if (!interviewSession) return;

    try {
      setLoading(true);

      // Submit the interview session using new API
      const submitResponse = await interviewApi.submit(interviewSession.sessionId);

      if (submitResponse.success) {
        // Get the interview summary/results
        const summaryResponse = await interviewApi.summary(interviewSession.sessionId);

        if (summaryResponse.success && summaryResponse.data) {
          // Navigate to results page with summary data
          navigate(`/interviews/${interviewSession.sessionId}/results`, {
            state: {
              summary: summaryResponse.data,
              template: template
            }
          });
        } else {
          setErrorMessage('Failed to retrieve interview results');
        }
      } else {
        setErrorMessage('Failed to submit interview');
      }
    } catch (error) {
      console.error('Failed to finish interview:', error);
      setErrorMessage('Failed to finish interview. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [interviewSession, navigate, template]);

  // Update answer with time tracking
  const updateCurrentAnswer = useCallback((value: string | string[]) => {
    if (!currentQuestion) return;

    const currentTime = Date.now();
    const timeSpent = currentTime - questionStartTime;

    setAnswers(prev => {
      const existing = prev[currentQuestion.id] || { value: '', saved: false, timeMs: 0 };
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          value,
          saved: false,
          timeMs: existing.timeMs + timeSpent
        }
      };
    });

    setQuestionStartTime(currentTime);
  }, [currentQuestion, questionStartTime]);

  // Save current answer
  const handleSave = () => {
    if (!currentQuestion || !currentAnswer) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        saved: true
      }
    }));
    setIsEditMode(false);
  };

  // Editar - Enable edit mode
  const handleEditar = () => {
    setIsEditMode(true);
  };

  // Limpiar - Clear current answer
  const handleLimpiar = () => {
    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        value: currentQuestion.type === 'multi' ? [] : '',
        saved: false,
        timeMs: prev[currentQuestion.id]?.timeMs || 0
      }
    }));
    setIsEditMode(false);
  };

  // Skip - Skip current question
  const handleSkip = () => {
    if (!currentQuestion) return;

    // Mark as answered with empty response
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        value: currentQuestion.type === 'multi' ? [] : '',
        saved: true,
        timeMs: prev[currentQuestion.id]?.timeMs || 0
      }
    }));

    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setIsEditMode(false);
    }
  };

  // Adelantar - Move to next question
  const handleAdelantar = () => {
    if (!canAdvance) return;

    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      setIsEditMode(false);
    }
  };

  // Submit entire interview
  const handleSubmitInterview = async () => {
    if (!interviewSession) {
      console.log('No interview session found');
      return;
    }

    console.log('=== SUBMITTING INTERVIEW ===');
    console.log('Interview Session:', interviewSession);
    console.log('All Answers:', answers);
    console.log('Questions:', questions);

    setLoading(true);
    try {
      // Prepare all answers for batch submission
      const submissionAnswers = [];

      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer.saved) {
          const question = questions.find(q => q.id === questionId);
          console.log(`Processing question ${questionId}:`, { question, answer });

          if (question) {
            const submissionAnswer = {
              questionId: question.id,
              type: question.type === 'single' ? 'single_choice' :
                    question.type === 'multi' ? 'multi_choice' : 'written',
              timeMs: answer.timeMs,
              text: question.type === 'written' ?
                    (Array.isArray(answer.value) ? answer.value.join(', ') : answer.value as string) :
                    undefined,
              chosenOptionIds: question.type !== 'written' ?
                               (Array.isArray(answer.value) ? answer.value : [answer.value as string]) :
                               undefined
            };

            submissionAnswers.push(submissionAnswer);
            console.log('Prepared answer for batch submission:', submissionAnswer);
          }
        }
      }

      console.log('Submitting all answers in batch to new API...');
      console.log('API endpoint will be:', `/api/interviews/sessions/${interviewSession.sessionId}/submit`);

      // Submit all answers in one batch call using the new API
      const submitResponse = await interviewApi.submit(interviewSession.sessionId, {
        answers: submissionAnswers
      });

      if (submitResponse.success) {
        console.log('✓ Successfully submitted interview');
        // Navigate to summary page
        navigate(`/interviews/summary/${interviewSession.sessionId}`);
      } else {
        console.error('✗ Failed to submit interview:', submitResponse.message);
        setErrorMessage(submitResponse.message || 'Failed to submit interview');
      }
    } catch (error: unknown) {
      console.error('Failed to submit interview:', error);
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown }; message?: string };
      if (axiosError.response) {
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        console.error('Error headers:', axiosError.response.headers);
      }
      setErrorMessage(`Failed to submit interview: ${axiosError.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsFromTemplate = useCallback(async (template: TemplateDto): Promise<Question[]> => {
    try {
      const { selection } = template;

      // Build query parameters based on template selection criteria
      const params = {
        topics: selection.byTopics.join(','),
        levels: selection.levels.join(','),
        countSingle: selection.countSingle,
        countMulti: selection.countMulti,
        countWritten: selection.countWritten
      };

      // Call the new questions endpoint
      const { data } = await http.get('/questions', { params });

      if (data.success && data.data) {
        setErrorMessage(null); // Clear any previous errors
        return data.data;
      } else {
        // Handle API response with success: false
        const errorMsg = data.message || 'Failed to retrieve questions';
        setErrorMessage(errorMsg);
        return [];
      }
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);

      // Handle axios error response
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to fetch questions from server');
      }

      return [];
    }
  }, []);

  const initializeInterview = useCallback(async () => {
    if (!templateId) {
      setErrorMessage('Template ID is required');
      setInitializing(false);
      return;
    }

    const templateIdNum = parseInt(templateId);
    if (isNaN(templateIdNum)) {
      setErrorMessage('Invalid template ID provided');
      setInitializing(false);
      return;
    }

    setInitializing(true);
    try {
      // Always fetch complete template from API to get full TemplateDto structure
      const templateResponse = await practiceInterviewTemplatesApi.get(templateIdNum);
      if (!templateResponse.success || !templateResponse.data) {
        setErrorMessage('Failed to load interview template');
        throw new Error('Failed to load template');
      }

      const currentTemplate = templateResponse.data;
      setTemplate(currentTemplate);
      setErrorMessage(null); // Clear any previous errors

      // Set timer based on template
      if (currentTemplate?.timers?.totalSec) {
        setTimeRemaining(currentTemplate.timers.totalSec);
      }

      // Create interview session
      console.log('Creating interview session for template:', templateIdNum);
      const sessionResponse = await interviewApi.start({
        templateId: templateIdNum
      });
      console.log('Session response:', sessionResponse);

      if (sessionResponse.success && sessionResponse.data) {
        console.log('Setting interview session:', sessionResponse.data);
        setInterviewSession({ sessionId: sessionResponse.data.sessionId });
      } else {
        console.error('Failed to create session:', sessionResponse.message);
        setErrorMessage(sessionResponse.message || 'Failed to create interview session');
      }

      // Fetch real questions based on template selection criteria
      const realQuestions = await fetchQuestionsFromTemplate(currentTemplate);
      setQuestions(realQuestions);
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      navigate('/interviews');
    } finally {
      setInitializing(false);
    }
  }, [templateId, navigate, fetchQuestionsFromTemplate]);

  useEffect(() => {
    if (templateId) {
      initializeInterview();
    }
  }, [templateId, initializeInterview]);

  // Reset question start time when changing questions
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);


  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        // Show warning when 5 minutes remaining
        if (newTime === 5 * 60) {
          setShowTimeWarning(true);
        }

        // Auto-submit when time runs out
        if (newTime <= 0) {
          clearInterval(timer);
          finishInterview();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finishInterview]);


  const handleAnswer = (value: string | string[]) => {
    if (!currentQuestion || (isAnswered && !isEditMode)) return;

    updateCurrentAnswer(value);
  };


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const disabled = isAnswered && !isEditMode;
    const answerValue = currentAnswer?.value;

    switch (currentQuestion.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.id}
                  name="single-choice"
                  value={option.id}
                  checked={answerValue === option.id}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor={option.id} className={`cursor-pointer ${disabled ? 'text-gray-500' : ''}`}>
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      case 'multi':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={Array.isArray(answerValue) && answerValue.includes(option.id)}
                  disabled={disabled}
                  onChange={(e) => {
                    if (disabled) return;
                    const answerArray = Array.isArray(answerValue) ? answerValue : [];
                    if (e.target.checked) {
                      handleAnswer([...answerArray, option.id]);
                    } else {
                      handleAnswer(answerArray.filter((id: string) => id !== option.id));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor={option.id} className={`cursor-pointer ${disabled ? 'text-gray-500' : ''}`}>
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );

      case 'written':
        return (
          <textarea
            value={answerValue || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            rows={6}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
          />
        );

      default:
        return null;
    }
  };

  if (initializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Initializing interview...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Template not found</p>
          <button
            onClick={() => navigate('/interviews')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 border border-red-200 bg-red-50 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <div className="flex-1">
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-700 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Time Warning */}
      {showTimeWarning && (
        <div className="mb-4 border border-orange-200 bg-orange-50 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
          <p className="text-orange-700">
            Warning: Only 5 minutes remaining! Your interview will auto-submit when time runs out.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{template.name}</h1>
          {template.description && (
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          )}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${
              timeRemaining <= 5 * 60 ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Timer className="h-4 w-4" />
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentQuestion.text}
            </h3>
            {isAnswered && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Saved
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          {renderQuestionInput()}

          {/* New Interview Controls */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* Save */}
            {!isAnswered && (
              <button
                onClick={handleSave}
                disabled={!currentAnswer || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            )}

            {/* Edit */}
            {canEdit && (
              <button
                onClick={handleEditar}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {/* Clear */}
            <button
              onClick={handleLimpiar}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            {/* Skip */}
            {!isLastQuestion && (
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            )}

            {/* Next */}
            {!isLastQuestion && (
              <button
                onClick={handleAdelantar}
                disabled={!canAdvance || loading}
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
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                <span>{loading ? 'Submitting...' : 'Submit Answer'}</span>
              </button>
            )}
          </div>

          {/* Answer Status */}
          {isAnswered && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <p className="text-green-800 text-sm">
                ✓ Answer saved. Time spent: {Math.floor((currentAnswer?.timeMs || 0) / 1000)}s
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="text-center">
        <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <span>Questions answered: {Object.values(answers).filter(a => a.saved).length} / {questions.length}</span>
        </div>
      </div>
    </div>
  );
};