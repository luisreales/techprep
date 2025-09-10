import React from 'react';
import { PracticeCard } from '@/components/practice/PracticeCard';
import { useSessionStore } from '@/stores/sessionStore';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';
import { usePracticeEngine } from '@/hooks/usePracticeEngine';

export const PracticePage: React.FC = () => {
  const { topicId, level } = useSessionStore();
  const { data: questions = [], isLoading, isError } = useQuestionsQuery({
    topicId: topicId ?? undefined,
    level: level ?? undefined,
  });

  const engine = usePracticeEngine(questions, { sessionId: 'local' });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading questions</p>;
  if (!questions.length) return <p>No questions available</p>;

  return (
    <div className="p-4 space-y-4">
      <header className="flex justify-between items-center">
        <h2 className="text-xl">Practice</h2>
        <p>
          {engine.index + 1}/{engine.total}
        </p>
      </header>
      {engine.currentQuestion && (
        <PracticeCard
          question={engine.currentQuestion}
          onSubmit={engine.submit}
          onNext={engine.next}
        />
      )}
    </div>
  );
};
