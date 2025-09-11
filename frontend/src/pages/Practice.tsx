import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionType, DifficultyLevel, PracticeMode, Question, QuestionOption } from '@/types/api';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface CurrentSession {
  sessionId: string;
  mode: PracticeMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  startTime: Date;
}

const Practice: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; matchPercentage?: number; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock questions for demonstration
  const mockQuestions: Question[] = [
    {
      id: '1',
      topicId: 1,
      topicName: 'Data Structures',
      text: 'What is the Big O notation for the best-case time complexity of Bubble Sort?',
      type: QuestionType.SingleChoice,
      level: DifficultyLevel.Intermediate,
      options: [
        { id: '1a', text: 'O(n²)', isCorrect: false, orderIndex: 0 },
        { id: '1b', text: 'O(n log n)', isCorrect: false, orderIndex: 1 },
        { id: '1c', text: 'O(n)', isCorrect: true, orderIndex: 2 }
      ],
      learningResources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      topicId: 2,
      topicName: 'Programming Concepts',
      text: 'Which of the following are examples of linear data structures?',
      type: QuestionType.MultiChoice,
      level: DifficultyLevel.Basic,
      options: [
        { id: '2a', text: 'Array', isCorrect: true, orderIndex: 0 },
        { id: '2b', text: 'Tree', isCorrect: false, orderIndex: 1 },
        { id: '2c', text: 'Stack', isCorrect: true, orderIndex: 2 },
        { id: '2d', text: 'Graph', isCorrect: false, orderIndex: 3 }
      ],
      learningResources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      topicId: 3,
      topicName: 'JavaScript',
      text: 'Explain the difference between `let`, `const`, and `var` in JavaScript.',
      type: QuestionType.Written,
      level: DifficultyLevel.Intermediate,
      officialAnswer: 'var is function-scoped and can be redeclared, let is block-scoped and cannot be redeclared, const is block-scoped and immutable',
      options: [],
      learningResources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Initialize session with mock data
    const sessionData: CurrentSession = {
      sessionId: 'mock-session-' + Date.now(),
      mode: location.state?.mode || PracticeMode.Study,
      questions: mockQuestions,
      currentQuestionIndex: 0,
      answers: {},
      startTime: new Date()
    };
    setSession(sessionData);
  }, [location.state]);

  const currentQuestion = session?.questions[session.currentQuestionIndex];

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
    if (!session || !currentQuestion) return;

    setIsLoading(true);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store answer in session
      const updatedSession = {
        ...session,
        answers: {
          ...session.answers,
          [currentQuestion.id]: currentAnswer
        }
      };
      setSession(updatedSession);
      
      // Show feedback for written answers in study mode
      if (currentQuestion.type === QuestionType.Written && session.mode === PracticeMode.Study) {
        setFeedback({
          isCorrect: false,
          matchPercentage: 65,
          message: 'Your explanation covers some key points but is missing details about block scope vs. function scope.'
        });
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
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
      // Session complete, navigate to results
      navigate('/session-results', { state: { session } });
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

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-4">
              <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
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