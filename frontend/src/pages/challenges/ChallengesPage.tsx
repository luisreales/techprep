import React, { useState } from 'react';
import { useChallengesQuery } from '@/hooks/useChallengesQuery';
import { ChallengeCard } from './ChallengeCard';

export const ChallengesPage: React.FC = () => {
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const { data: challenges = [], isLoading } = useChallengesQuery();

  const filtered = challenges.filter(
    (c) => (!language || c.language === language) && (!difficulty || c.difficulty === difficulty),
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl">Code Challenges</h2>
      <div className="flex gap-2">
        <input
          className="border p-1"
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <input
          className="border p-1"
          placeholder="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : filtered.length ? (
        <div className="space-y-4">
          {filtered.map((ch) => (
            <ChallengeCard key={ch.id} challenge={ch} />
          ))}
        </div>
      ) : (
        <p>No challenges found</p>
      )}
    </div>
  );
};
