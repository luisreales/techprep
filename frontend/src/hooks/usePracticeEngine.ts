import { useState } from 'react';
import type { Question, QuestionAnswer, SessionAnswer } from '@/types';
import { percentMatch } from '@/utils/text';
import { apiClient } from '@/services/api';

interface Options {
  sessionId: string;
  threshold?: number;
}

export const usePracticeEngine = (
  questions: Question[],
  { sessionId, threshold = 0.8 }: Options,
) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SessionAnswer>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[index];

  const submit = async (answer: QuestionAnswer) => {
    if (!currentQuestion) return;
    setSubmitting(true);

    let result: SessionAnswer = { questionId: currentQuestion.id, isCorrect: false };

    if (currentQuestion.type === 'written' && answer.answer) {
      const score = percentMatch(currentQuestion.officialAnswer ?? '', answer.answer);
      result = {
        questionId: currentQuestion.id,
        isCorrect: score >= threshold,
        answer: answer.answer,
        matchPercentage: score,
      };
    } else if (currentQuestion.type === 'multi') {
      const correct = currentQuestion.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
      const selected = answer.selectedOptionIds?.slice().sort() ?? [];
      const isCorrect = JSON.stringify(correct) === JSON.stringify(selected);
      result = { questionId: currentQuestion.id, isCorrect, selectedOptionIds: selected };
    } else if (currentQuestion.type === 'single') {
      const correct = currentQuestion.options.find((o) => o.isCorrect)?.id;
      const isCorrect = correct === answer.selectedOptionIds?.[0];
      result = { questionId: currentQuestion.id, isCorrect, selectedOptionIds: answer.selectedOptionIds };
    }

    await apiClient.submitAnswer(sessionId, result);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: result }));
    setSubmitting(false);
  };

  const next = () => setIndex((i) => Math.min(i + 1, questions.length - 1));

  return { currentQuestion, index, total: questions.length, submit, next, answers, submitting };
};
