import React, { useState } from 'react';
import type { CodeChallenge } from '@/types';

interface Props {
  challenge: CodeChallenge;
}

export const ChallengeCard: React.FC<Props> = ({ challenge }) => {
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">{challenge.title}</h3>
      <p className="text-sm text-gray-600">
        {challenge.language} · {challenge.difficulty}
      </p>
      <p className="mt-2">{challenge.description}</p>
      {challenge.solution && showSolution && (
        <pre className="mt-2 p-2 bg-gray-100 overflow-auto">
          <code>{challenge.solution}</code>
        </pre>
      )}
      {challenge.solution && (
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="mt-2 text-blue-500 underline"
        >
          {showSolution ? 'Hide' : 'Show'} solution
        </button>
      )}
    </div>
  );
};
