import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { PracticeMode, Question, QuestionType, DifficultyLevel } from '@/types/api';

const STORAGE_KEY = 'techprep.practice.sessionState';

interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  topicId: number;
  topicName: string;
  questionCount: number;
  difficulty: DifficultyLevel;
  estimatedTime: number;
}

interface CurrentSession {
  sessionId: string;
  mode: PracticeMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  startTime: Date;
  sessionName: string;
}

interface LocationState {
  sessionId?: string;
  mode?: PracticeMode;
  sessionData?: SessionTemplate;
}

interface StoredPracticeState {
  sessionData: SessionTemplate;
  mode: PracticeMode;
  sessionId?: string;
}

const readStoredSessionState = (): StoredPracticeState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredPracticeState;
  }
  catch {
    return null;
  }
};


const Practice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LocationState) ?? {};
  const storedState = useMemo(readStoredSessionState, []);

  const [sessionTemplate, setSessionTemplate] = useState<SessionTemplate | null>(() =>
    locationState.sessionData ?? storedState?.sessionData ?? null
  );

  const [sessionMode, setSessionMode] = useState<PracticeMode>(() =>
    locationState.mode ?? storedState?.mode ?? PracticeMode.Study
  );

  const [requestedSessionId, setRequestedSessionId] = useState<string | undefined>(() =>
    locationState.sessionId ?? storedState?.sessionId
  );

  const [session, setSession] = useState<CurrentSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; matchPercentage?: number; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const createSessionAndFetchQuestions = useCallback(async (sessionData: SessionTemplate, mode: PracticeMode) => {
    try {
      setIsLoadingQuestions(true);

      // Create a session in the backend
      const sessionResponse = await apiClient.createSession({
        topicId: sessionData.topicId,
        level: sessionData.difficulty.toLowerCase(),
        mode: mode === PracticeMode.Study ? 'Study' : 'Interview',
        questionCount: sessionData.questionCount
      });

      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error('Failed to create session');
      }

      const realSessionId = sessionResponse.data.sessionId;

      // Fetch questions based on session data
      const questionsResponse = await apiClient.getQuestions({
        topicId: sessionData.topicId,
        level: sessionData.difficulty.toLowerCase()
      });

      if (questionsResponse.success && questionsResponse.data) {
        // Limit to the number of questions specified in the session
        const limitedQuestions = questionsResponse.data.slice(0, sessionData.questionCount);
        return { questions: limitedQuestions, sessionId: realSessionId };
      }

      return { questions: [], sessionId: realSessionId };
    } catch (error) {
      console.error('Failed to create session or fetch questions:', error);
      return { questions: [], sessionId: null };
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (sessionTemplate) {
      const payload: StoredPracticeState = {
        sessionData: sessionTemplate,
        mode: sessionMode,
        sessionId: requestedSessionId,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [sessionTemplate, sessionMode, requestedSessionId]);

  useEffect(() => {
    if (locationState.sessionData) {
      setSessionTemplate(locationState.sessionData);
    }

    if (locationState.mode) {
      setSessionMode(locationState.mode);
    }

    if (locationState.sessionId) {
      setRequestedSessionId(locationState.sessionId);
    }
  }, [locationState.sessionData, locationState.mode, locationState.sessionId]);

  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionTemplate) {
        setSession(null);
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const mode = sessionMode || PracticeMode.Study;
        const providedSessionId = requestedSessionId;

        if (session && session.sessionId === providedSessionId && session.mode === mode) {
          return;
        }

        let questions: Question[] = [];
        let realSessionId = providedSessionId || `session-${Date.now()}`;
        const sessionName = sessionTemplate.name || 'Practice Session';

        console.log('Creating session with data:', sessionTemplate);
        const result = await createSessionAndFetchQuestions(sessionTemplate, mode);
        questions = result.questions;
        if (result.sessionId) {
          realSessionId = result.sessionId;
        }
        console.log('Session created, got questions:', questions.length);

        const sessionData: CurrentSession = {
          sessionId: realSessionId,
          mode,
          questions,
          currentQuestionIndex: 0,
          answers: {},
          startTime: new Date(),
          sessionName,
        };
        setSession(sessionData);
        setRequestedSessionId(realSessionId);
        if (sessionMode !== mode) {
          setSessionMode(mode);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setIsLoadingQuestions(false);
        navigate('/interviews');
      }
    };

    initializeSession();
  }, [createSessionAndFetchQuestions, navigate, requestedSessionId, sessionMode, sessionTemplate, session]);

  const currentQuestion = session
    ? session.questions[session.currentQuestionIndex]
    : undefined;

  const handleSingleChoice = (optionId: string) => {
    setSelectedOptions([optionId]);
    setCurrentAnswer(optionId);
    
    if (session?.mode === PracticeMode.Study) {
      // Show immediate feedback in study mode
      const option = currentQuestion?.options.find(opt => opt.id === optionId);
      setFeedback({
        isCorrect: option?.isCorrect || false,
        message: option?.isCorrect ? 'Correct!' : 'Incorrect. Try again or click Next to see the answer.'
      });
    }
  };

  const handleMultiChoice = (optionId: string) => {
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    
    setSelectedOptions(newSelected);
    setCurrentAnswer(newSelected);

    if (session?.mode === PracticeMode.Study) {
      // Show immediate feedback for multi-choice
      const correctOptions = currentQuestion?.options.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
      const isPartiallyCorrect = newSelected.some(id => correctOptions.includes(id));
      const isFullyCorrect = correctOptions.length === newSelected.length && 
        correctOptions.every(id => newSelected.includes(id));
      
      setFeedback({
        isCorrect: isFullyCorrect,
        message: isFullyCorrect ? 'Correct!' : 
          isPartiallyCorrect ? 'Partially correct. Keep selecting.' : 
          'Some selections are incorrect.'
      });
    }
  };

  const handleWrittenAnswer = (text: string) => {
    setWrittenAnswer(text);
    setCurrentAnswer(text);
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion || !currentAnswer) return;

    setIsLoading(true);

    try {
      // Calculate time spent on this question
      const timeSpent = Date.now() - session.startTime.getTime();

      // Prepare answer data
      let answerString = '';
      let matchPercentage: number | undefined;

      if (currentQuestion.type === QuestionType.SingleChoice) {
        answerString = currentAnswer as string;
        const selectedOption = currentQuestion.options.find(opt => opt.id === currentAnswer);
        matchPercentage = selectedOption?.isCorrect ? 100 : 0;
      } else if (currentQuestion.type === QuestionType.MultiChoice) {
        answerString = (currentAnswer as string[]).join(',');
        const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        const selectedOptions = currentAnswer as string[];
        const isFullyCorrect = correctOptions.length === selectedOptions.length &&
          correctOptions.every(id => selectedOptions.includes(id));
        matchPercentage = isFullyCorrect ? 100 : 0;
      } else if (currentQuestion.type === QuestionType.Written) {
        answerString = currentAnswer as string;
        // For written answers, we'll use a placeholder match percentage
        // In a real implementation, this would be calculated by the backend text matching engine
        matchPercentage = 65; // Placeholder
      }

      // Submit answer to backend
      await apiClient.submitAnswer(session.sessionId, {
        questionId: currentQuestion.id,
        answer: answerString,
        timeSpentMs: timeSpent,
        matchPercentage
      });

      // Store answer in local session state
      const updatedSession = {
        ...session,
        answers: {
          ...session.answers,
          [currentQuestion.id]: currentAnswer
        }
      };
      setSession(updatedSession);

      // Show feedback for study mode
      if (session.mode === PracticeMode.Study) {
        if (currentQuestion.type === QuestionType.Written) {
          setFeedback({
            isCorrect: false,
            matchPercentage: matchPercentage,
            message: 'Your explanation covers some key points but could be more comprehensive.'
          });
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setFeedback({
        isCorrect: false,
        message: 'Failed to save answer. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;

    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });

      // Reset answer state
      setCurrentAnswer(null);
      setSelectedOptions([]);
      setWrittenAnswer('');
      setFeedback(null);
    } else {
      // Session complete, finish session in backend and navigate to results
      try {
        await apiClient.finishSession(session.sessionId);
        navigate('/session-results', { state: { session } });
      } catch (error) {
        console.error('Failed to finish session:', error);
        // Still navigate to results even if backend call fails
        navigate('/session-results', { state: { session } });
      }
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const getFeedbackColor = () => {
      if (!feedback) return '';
      if (feedback.isCorrect) return 'bg-green-500';
      if (feedback.matchPercentage && feedback.matchPercentage > 70) return 'bg-yellow-400';
      return 'bg-red-500';
    };

    return (
      <div className="bg-[var(--card-background)] rounded-2xl shadow-xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{currentQuestion.text}</h2>
          <div className={`w-6 h-6 rounded-full ${getFeedbackColor()}`}></div>
        </div>
        
        <p className="text-[var(--text-secondary)] mb-6">
          {currentQuestion.type === QuestionType.SingleChoice ? 'Select the correct answer from the options below.' :
           currentQuestion.type === QuestionType.MultiChoice ? 'Select all that apply.' :
           'Provide a concise explanation in the text area below.'}
        </p>

        {currentQuestion.type === QuestionType.SingleChoice && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedOptions.includes(option.id)
                    ? feedback?.isCorrect && selectedOptions.includes(option.id) && option.isCorrect
                      ? 'bg-green-50 border-green-500'
                      : feedback && selectedOptions.includes(option.id) && !option.isCorrect
                      ? 'bg-red-50 border-red-500'
                      : 'bg-[var(--primary-color-light)] border-[var(--primary-color)]'
                    : 'border-[var(--border-color)] hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="single-choice"
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleSingleChoice(option.id)}
                  className="h-5 w-5 text-[var(--primary-color)] border-gray-300 focus:ring-[var(--primary-color)]"
                />
                <span className="ml-4 text-[var(--text-primary)]">{option.text}</span>
                {feedback && selectedOptions.includes(option.id) && option.isCorrect && (
                  <div className="ml-auto flex items-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span className="text-sm font-semibold hidden sm:inline">Correct</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === QuestionType.MultiChoice && (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedOptions.includes(option.id)
                    ? 'bg-[var(--primary-color-light)] border-[var(--primary-color)]'
                    : 'border-[var(--border-color)] hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleMultiChoice(option.id)}
                  className="h-5 w-5 rounded text-[var(--primary-color)] border-gray-300 focus:ring-[var(--primary-color)]"
                />
                <span className="ml-4 text-[var(--text-primary)]">{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === QuestionType.Written && (
          <div>
            <textarea
              value={writtenAnswer}
              onChange={(e) => handleWrittenAnswer(e.target.value)}
              className="w-full p-4 rounded-lg border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition"
              placeholder="Your answer here..."
              rows={6}
            />
          </div>
        )}

        {feedback && (
          <div className={`mt-4 p-3 rounded-lg border text-sm ${
            feedback.isCorrect ? 'bg-green-50 border-green-200 text-green-800' :
            feedback.matchPercentage && feedback.matchPercentage > 70 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p>
              <span className="font-bold">
                {feedback.isCorrect ? 'Correct!' : 
                 feedback.matchPercentage ? `${feedback.matchPercentage}% Match.` : 
                 'Incorrect.'}
              </span>
              {' '}{feedback.message}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!sessionTemplate) {
    // Auto-create a demo practice session
    const demoSessionTemplate: SessionTemplate = {
      id: 'demo-practice-session',
      name: 'Demo Practice Session',
      description: 'A practice session with sample questions to test the evaluation engine',
      topicId: 1,
      topicName: 'General Programming',
      questionCount: 5,
      difficulty: DifficultyLevel.Intermediate,
      estimatedTime: 15
    };

    // Set the demo template and let the effect handle initialization
    setTimeout(() => {
      setSessionTemplate(demoSessionTemplate);
      setSessionMode(PracticeMode.Study);
    }, 100);

    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Starting Practice Session</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Initializing a demo practice session with sample questions.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session || isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">
            {isLoadingQuestions ? 'Loading practice questions...' : 'Initializing session...'}
          </p>
        </div>
      </div>
    );
  }

  // Show message if no questions available
  if (session.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl">quiz</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Questions Available</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            No questions found for this topic and difficulty level. Please try a different session.
          </p>
          <button
            onClick={() => navigate('/interviews')}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {session.sessionName}
                </h2>
                <span className="text-sm text-[var(--text-secondary)]">
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </span>
              </div>
              <span className="px-3 py-1 bg-[var(--primary-color-light)] text-[var(--primary-color)] rounded-full font-medium">
                {session.mode === PracticeMode.Study ? 'Study Mode' : 'Interview Mode'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          {renderQuestion()}

          {/* Action Buttons */}
          <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-end gap-4">
              {session.mode === PracticeMode.Study && currentQuestion?.type !== QuestionType.Written && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !currentAnswer}
                  className="px-6 py-3 rounded-lg text-[var(--text-secondary)] font-bold bg-gray-100 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              )}
              
              {currentQuestion?.type === QuestionType.Written && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !writtenAnswer.trim()}
                  className="px-6 py-3 rounded-lg text-[var(--text-secondary)] font-bold bg-gray-100 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                >
                  {isLoading ? 'Evaluating...' : 'Submit Answer'}
                </button>
              )}
              
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-lg text-white font-bold bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
              >
                {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish' : 'Next'}
                <span className="material-symbols-outlined text-base align-middle ml-1">
                  {session.currentQuestionIndex === session.questions.length - 1 ? 'check' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Practice;
