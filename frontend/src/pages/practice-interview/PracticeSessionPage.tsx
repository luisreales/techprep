import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, Clock, CheckCircle, XCircle, BookOpen, Lightbulb } from 'lucide-react';
import {
  usePracticeSession,
  useSubmitPracticeAnswer,
  useUpdatePracticeSessionState,
  useSubmitPractice,
  usePausePracticeSession,
  useResumePracticeSession
} from '@/hooks/usePracticeInterview';
import { SubmitAnswerDto, SessionStatus, PracticeAnswerDto } from '@/types/practiceInterview';

export const PracticeSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading } = usePracticeSession(sessionId!);
  const submitAnswerMutation = useSubmitPracticeAnswer();
  const updateStateMutation = useUpdatePracticeSessionState();
  const submitPracticeMutation = useSubmitPractice();
  const pauseMutation = usePausePracticeSession();
  const resumeMutation = useResumePracticeSession();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<PracticeAnswerDto | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Mock questions - in real app, this would come from the session data
  const questions = [
    {
      id: '1',
      text: 'What is the difference between let and var in JavaScript?',
      type: 'written',
      options: [],
      hints: ['Think about scope', 'Consider hoisting behavior'],
      sources: ['MDN JavaScript Variables', 'JavaScript: The Good Parts']
    },
    {
      id: '2',
      text: 'Which of the following are valid JavaScript data types?',
      type: 'multi_choice',
      options: [
        { id: 'a', text: 'string', isCorrect: true },
        { id: 'b', text: 'number', isCorrect: true },
        { id: 'c', text: 'float', isCorrect: false },
        { id: 'd', text: 'boolean', isCorrect: true }
      ],
      hints: ['JavaScript has primitive and object types'],
      sources: ['MDN Data Types']
    },
    {
      id: '3',
      text: 'What does the === operator do in JavaScript?',
      type: 'single_choice',
      options: [
        { id: 'a', text: 'Assigns a value', isCorrect: false },
        { id: 'b', text: 'Compares values loosely', isCorrect: false },
        { id: 'c', text: 'Compares values and types strictly', isCorrect: true },
        { id: 'd', text: 'Checks if variable exists', isCorrect: false }
      ],
      hints: ['Think about type coercion'],
      sources: ['MDN Comparison Operators']
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (session?.data) {
      setCurrentQuestionIndex(session.data.currentQuestionIndex || 0);

      // Set up timer if there's a time limit
      if (session.data.assignmentName) { // This would contain timer info in real implementation
        setTimeRemaining(3600); // 1 hour example
      }
    }
  }, [session]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleSubmitPractice();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleAnswerSelect = (optionId: string, isMultiple: boolean) => {
    if (isMultiple) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    const answerData: SubmitAnswerDto = {
      questionId: currentQuestion.id,
      selectedOptionIds: currentQuestion.type === 'written' ? undefined : selectedOptions,
      givenText: currentQuestion.type === 'written' ? textAnswer : undefined,
      timeSpentSec: timeSpent
    };

    try {
      const result = await submitAnswerMutation.mutateAsync({ sessionId, data: answerData });
      if (result.success) {
        setLastAnswer(result.data);
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setLastAnswer(null);
    setSelectedOptions([]);
    setTextAnswer('');
    setStartTime(new Date());

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Update session state
      updateStateMutation.mutate({
        sessionId: sessionId!,
        data: { currentQuestionIndex: nextIndex }
      });
    } else {
      handleSubmitPractice();
    }
  };

  const handleSubmitPractice = async () => {
    if (!sessionId) return;

    try {
      await submitPracticeMutation.mutateAsync(sessionId);
      navigate(`/practice/sessions/${sessionId}/results`);
    } catch (error) {
      console.error('Failed to submit practice:', error);
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;

    try {
      await pauseMutation.mutateAsync(sessionId);
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;

    try {
      await resumeMutation.mutateAsync(sessionId);
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="ml-3 text-gray-600">Loading practice session...</p>
      </div>
    );
  }

  if (!session?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Practice session not found</p>
          <button
            onClick={() => navigate('/practice')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  if (session.data.status === SessionStatus.Paused) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200">
          <Pause className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Paused</h2>
          <p className="text-gray-600 mb-6">Your practice session has been paused. You can resume anytime.</p>
          <div className="space-y-3">
            <button
              onClick={handleResume}
              disabled={resumeMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {resumeMutation.isPending ? 'Resuming...' : 'Resume Practice'}
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Practice Session</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {timeRemaining && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button
              onClick={handlePause}
              disabled={pauseMutation.isPending}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!showFeedback ? (
          /* Question View */
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                {currentQuestion.text}
              </h2>

              {/* Answer Input */}
              {currentQuestion.type === 'written' ? (
                <div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type={currentQuestion.type === 'single_choice' ? 'radio' : 'checkbox'}
                        name="answer"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleAnswerSelect(option.id, currentQuestion.type === 'multi_choice')}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Learning Aids */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <details className="group">
                      <summary className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium">Hints ({currentQuestion.hints.length})</span>
                      </summary>
                      <div className="mt-2 pl-6 space-y-1">
                        {currentQuestion.hints.map((hint, index) => (
                          <p key={index} className="text-sm text-gray-600">• {hint}</p>
                        ))}
                      </div>
                    </details>
                  )}

                  {currentQuestion.sources && currentQuestion.sources.length > 0 && (
                    <details className="group">
                      <summary className="flex items-center gap-2 text-green-600 hover:text-green-700 cursor-pointer">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">Sources ({currentQuestion.sources.length})</span>
                      </summary>
                      <div className="mt-2 pl-6 space-y-1">
                        {currentQuestion.sources.map((source, index) => (
                          <p key={index} className="text-sm text-gray-600">• {source}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  submitAnswerMutation.isPending ||
                  (currentQuestion.type === 'written' && !textAnswer.trim()) ||
                  (currentQuestion.type !== 'written' && selectedOptions.length === 0)
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitAnswerMutation.isPending ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        ) : (
          /* Feedback View */
          <div className="space-y-6">
            {/* Answer Result */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                {lastAnswer?.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h2 className="text-xl font-medium text-gray-900">
                  {lastAnswer?.isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                {lastAnswer?.score && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    Score: {lastAnswer.score}%
                  </span>
                )}
              </div>

              {lastAnswer?.explanation && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Explanation</h3>
                  <p className="text-gray-700">{lastAnswer.explanation}</p>
                </div>
              )}

              {lastAnswer?.suggestedResources && lastAnswer.suggestedResources.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Suggested Resources</h3>
                  <ul className="space-y-1">
                    {lastAnswer.suggestedResources.map((resource, index) => (
                      <li key={index} className="text-sm text-blue-600 hover:text-blue-700">
                        • {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitPractice}
                  disabled={submitPracticeMutation.isPending}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitPracticeMutation.isPending ? 'Completing...' : 'Complete Practice'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSessionPage;