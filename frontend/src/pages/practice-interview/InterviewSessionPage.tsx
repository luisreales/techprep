import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Shield, Eye, Camera } from 'lucide-react';
import {
  useInterviewSession,
  useSubmitInterviewAnswer,
  useSubmitInterview,
  useRecordAuditEvent
} from '@/hooks/usePracticeInterview';
import { SubmitAnswerDto, AuditEventType, SessionStatus } from '@/types/practiceInterview';

export const InterviewSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading } = useInterviewSession(sessionId!);
  const submitAnswerMutation = useSubmitInterviewAnswer();
  const submitInterviewMutation = useSubmitInterview();
  const recordAuditMutation = useRecordAuditEvent();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

  // Mock questions - in real app, this would come from the session data
  const questions = [
    {
      id: '1',
      text: 'Explain the concept of closures in JavaScript and provide an example.',
      type: 'written',
      options: []
    },
    {
      id: '2',
      text: 'What is the time complexity of binary search?',
      type: 'single_choice',
      options: [
        { id: 'a', text: 'O(n)', isCorrect: false },
        { id: 'b', text: 'O(log n)', isCorrect: true },
        { id: 'c', text: 'O(n log n)', isCorrect: false },
        { id: 'd', text: 'O(n²)', isCorrect: false }
      ]
    },
    {
      id: '3',
      text: 'Which of the following are principles of Object-Oriented Programming?',
      type: 'multi_choice',
      options: [
        { id: 'a', text: 'Encapsulation', isCorrect: true },
        { id: 'b', text: 'Inheritance', isCorrect: true },
        { id: 'c', text: 'Compilation', isCorrect: false },
        { id: 'd', text: 'Polymorphism', isCorrect: true }
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Security monitoring
  const recordAuditEvent = useCallback(async (eventType: AuditEventType, meta?: Record<string, any>) => {
    if (sessionId) {
      try {
        await recordAuditMutation.mutateAsync({
          sessionId,
          data: { eventType, meta }
        });
      } catch (error) {
        console.error('Failed to record audit event:', error);
      }
    }
  }, [sessionId, recordAuditMutation]);

  // Focus monitoring
  useEffect(() => {
    const handleFocusLoss = () => {
      setFocusLossCount(prev => prev + 1);
      setSecurityWarnings(prev => [...prev, 'Focus lost - please keep your attention on the interview']);
      recordAuditEvent(AuditEventType.FocusLoss, { timestamp: new Date().toISOString() });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLoss();
      }
    };

    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleFocusLoss);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recordAuditEvent]);

  // Fullscreen monitoring
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && session?.data) {
        setSecurityWarnings(prev => [...prev, 'Fullscreen mode exited - please return to fullscreen']);
        recordAuditEvent(AuditEventType.FullscreenExit, { timestamp: new Date().toISOString() });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [session, recordAuditEvent]);

  // Copy/Paste blocking
  useEffect(() => {
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const eventType = e.type === 'copy' ? AuditEventType.CopyAttempt : AuditEventType.PasteAttempt;
      setSecurityWarnings(prev => [...prev, `${e.type.charAt(0).toUpperCase() + e.type.slice(1)} blocked - not allowed during interview`]);
      recordAuditEvent(eventType, { timestamp: new Date().toISOString() });
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [recordAuditEvent]);

  // DevTools detection (basic)
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        setSecurityWarnings(prev => [...prev, 'Developer tools detected - please close them']);
        recordAuditEvent(AuditEventType.DevToolsOpen, { timestamp: new Date().toISOString() });
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, [recordAuditEvent]);

  // Initialize session
  useEffect(() => {
    if (session?.data) {
      setCurrentQuestionIndex(session.data.currentQuestionIndex || 0);
      setTimeRemaining(3600); // 1 hour example

      // Request fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
      }
    }
  }, [session]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleSubmitInterview();
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
      await submitAnswerMutation.mutateAsync({ sessionId, data: answerData });

      // Move to next question or complete interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOptions([]);
        setTextAnswer('');
        setStartTime(new Date());
      } else {
        handleSubmitInterview();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleSubmitInterview = async () => {
    if (!sessionId) return;

    try {
      await submitInterviewMutation.mutateAsync(sessionId);

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      navigate(`/interview/sessions/${sessionId}/results`);
    } catch (error) {
      console.error('Failed to submit interview:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeRemaining) return 'text-gray-600';
    if (timeRemaining < 300) return 'text-red-600'; // Last 5 minutes
    if (timeRemaining < 600) return 'text-yellow-600'; // Last 10 minutes
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
          <p className="mt-3">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (!session?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p>Interview session not found</p>
          <button
            onClick={() => navigate('/interview')}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  if (session.data.status === SessionStatus.Completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold mb-4">Interview Completed</h2>
          <p className="text-gray-300 mb-6">Your interview has been completed and submitted for evaluation.</p>
          <button
            onClick={() => navigate(`/interview/sessions/${sessionId}/results`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Security Warning Bar */}
      {securityWarnings.length > 0 && (
        <div className="bg-red-600 px-6 py-2">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">
              Security Alert: {securityWarnings[securityWarnings.length - 1]}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Interview Session
            </h1>
            <p className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {timeRemaining && (
              <div className={`flex items-center gap-2 ${getTimeColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye className="w-4 h-4" />
              <span>Focus Lost: {focusLossCount}</span>
            </div>

            {!isFullscreen && (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Not Fullscreen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-medium mb-6">
            {currentQuestion.text}
          </h2>

          {/* Answer Input */}
          {currentQuestion.type === 'written' ? (
            <div>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type={currentQuestion.type === 'single_choice' ? 'radio' : 'checkbox'}
                    name="answer"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleAnswerSelect(option.id, currentQuestion.type === 'multi_choice')}
                    className="mr-3 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-white">{option.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-200 font-medium mb-1">Interview Security Active</p>
              <ul className="text-blue-300 space-y-1">
                <li>• Copy/paste is disabled</li>
                <li>• Focus changes are monitored</li>
                <li>• Fullscreen mode is required</li>
                <li>• All activities are logged</li>
              </ul>
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
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitAnswerMutation.isPending
              ? 'Submitting...'
              : currentQuestionIndex === questions.length - 1
                ? 'Complete Interview'
                : 'Next Question'
            }
          </button>
        </div>

        {/* Security Warnings */}
        {securityWarnings.length > 0 && (
          <div className="mt-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
            <h3 className="text-red-200 font-medium mb-2">Security Warnings</h3>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {securityWarnings.slice(-3).map((warning, index) => (
                <p key={index} className="text-red-300 text-sm">• {warning}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSessionPage;