// PracticeRunnerPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Timer, ArrowLeft } from 'lucide-react';
import { EvaluationPracticeCard } from '@/components/practice/EvaluationPracticeCard';
import { sessionsApi, type AnswerResult } from '@/services/sessionsApi';
import { apiClient } from '@/services/api';
import type { Question } from '@/types';
import { DifficultyLevel } from '@/types/api';

interface PracticeRunnerPageProps {
  sessionId?: string;
}

export const PracticeRunnerPage: React.FC<PracticeRunnerPageProps> = ({ sessionId: propSessionId }) => {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionId = propSessionId || paramSessionId || 'demo-session';
  const sessionData = location.state?.sessionData as
    | {
        id?: string | number;
        name?: string;
        // from Interviews list mapping
        questionCount?: number;
        difficulty?: DifficultyLevel;
        // any other fields are ignored here
      }
    | undefined;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [feedback, setFeedback] = useState<Record<string, AnswerResult>>({});
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentFeedback = currentQuestion ? feedback[currentQuestion.id] : undefined;
  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  useEffect(() => {
    loadQuestions();
    // start time for the first question after loading completes (see below)
    // setQuestionStartTime(Date.now()) will be called after questions are set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, JSON.stringify(sessionData)]);

  useEffect(() => {
    if (questions.length) {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, questions.length]);

  const sanitize = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '')
      )
    );

  const mapDifficulty = (d?: DifficultyLevel) => {
    // If your questions API expects a string, map here.
    // If it expects numeric enum, just return d.
    // We'll pass the numeric enum by default (safer with your existing codebase).
    return d;
  };

  const loadQuestions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      /**
       * STRATEGY
       * 1) If you have a sessions endpoint that generates questions from a PracticeInterview template,
       *    use it first (commented example below).
       * 2) Fallback to generic bank: apiClient.getQuestions(params) WITHOUT topics.
       */

      // --- Option A: If you already have a generator via sessionsApi, uncomment and use:
      // if (sessionData?.id) {
      //   const gen = await sessionsApi.generatePracticeFromTemplate({
      //     templateId: sessionData.id,
      //     mode: 'practice',
      //     count: sessionData.questionCount ?? 10,
      //   });
      //   const itemsA: Question[] = gen?.data?.questions ?? gen?.questions ?? [];
      //   if (itemsA.length) {
      //     setQuestions(itemsA);
      //     setCurrentIndex(0);
      //     setQuestionStartTime(Date.now());
      //     setLoading(false);
      //     return;
      //   }
      // }

      // --- Option B: Fallback to your existing questions API (no topics)
      const rawParams = {
        level: mapDifficulty(sessionData?.difficulty), // keep it if your API filters by level
        count: sessionData?.questionCount ?? 10,
        // DO NOT send topicId here (you requested no topics)
      };

      const params = sanitize(rawParams);
      const resp = await apiClient.getQuestions(params);

      const list: Question[] = Array.isArray(resp?.data)
        ? resp.data
        : resp?.data?.items ?? resp?.data?.results ?? [];

      const finalCount = sessionData?.questionCount ?? 10;
      const picked = list.slice(0, Math.max(1, finalCount));

      if (!picked.length) {
        setQuestions([]);
        setErrorMsg('No questions available for this configuration.');
      } else {
        setQuestions(picked);
        setCurrentIndex(0);
        setQuestionStartTime(Date.now());
      }
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setQuestions([]);
      setErrorMsg(err?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionComplete = (result?: AnswerResult) => {
    if (!currentQuestion || !result) return;
    setFeedback((prev) => ({ ...prev, [currentQuestion.id]: result }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      navigate(`/practice/summary/${sessionId}`);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // Empty/error state
  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-3">
          <p className="font-semibold">No questions to display.</p>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Practice Session</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Timer className="h-4 w-4" />
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card with Evaluation */}
      <div className="mb-6">
        <EvaluationPracticeCard
          question={currentQuestion}
          sessionId={sessionId}
          mode="practice"
          onComplete={handleQuestionComplete}
          onNext={nextQuestion}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Exit Practice
        </button>
      </div>
    </div>
  );
};
