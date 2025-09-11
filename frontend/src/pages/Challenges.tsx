import React, { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  href: string;
}

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type LanguageFilter = 'All' | 'Python' | 'Java' | 'JavaScript' | 'C++';

const Challenges: React.FC = () => {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('All');
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Reverse a String',
      difficulty: 'Easy',
      language: 'Python',
      href: '#'
    },
    {
      id: '2',
      title: 'Binary Search',
      difficulty: 'Medium',
      language: 'Java',
      href: '#'
    },
    {
      id: '3',
      title: 'Dynamic Programming',
      difficulty: 'Hard',
      language: 'C++',
      href: '#'
    },
    {
      id: '4',
      title: 'Palindrome Check',
      difficulty: 'Easy',
      language: 'JavaScript',
      href: '#'
    },
    {
      id: '5',
      title: 'Merge Sorted Lists',
      difficulty: 'Medium',
      language: 'Python',
      href: '#'
    },
    {
      id: '6',
      title: 'Graph Traversal',
      difficulty: 'Hard',
      language: 'Java',
      href: '#'
    }
  ];

  const getDifficultyBadgeClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-600';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'Hard':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesDifficulty = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
    const matchesLanguage = languageFilter === 'All' || challenge.language === languageFilter;
    return matchesDifficulty && matchesLanguage;
  });

  return (
    <div className="space-y-6">
        {/* Filter Buttons */}
        <div className="flex gap-3">
            {/* Language Filter */}
            <div className="relative flex-1">
              <button
                className="flex h-10 w-full items-center justify-center gap-x-2 rounded-lg bg-[var(--primary-color-light)] px-4"
                onClick={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowDifficultyDropdown(false);
                }}
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {languageFilter === 'All' ? 'Language' : languageFilter}
                </p>
                <span className="material-symbols-outlined text-xl text-[var(--text-secondary)]">expand_more</span>
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-12 left-0 right-0 bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                  {(['All', 'Python', 'Java', 'JavaScript', 'C++'] as LanguageFilter[]).map((language) => (
                    <button
                      key={language}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg text-[var(--text-primary)]"
                      onClick={() => {
                        setLanguageFilter(language);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty Filter */}
            <div className="relative flex-1">
              <button
                className="flex h-10 w-full items-center justify-center gap-x-2 rounded-lg bg-[var(--primary-color-light)] px-4"
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowLanguageDropdown(false);
                }}
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {difficultyFilter === 'All' ? 'Difficulty' : difficultyFilter}
                </p>
                <span className="material-symbols-outlined text-xl text-[var(--text-secondary)]">expand_more</span>
              </button>
              
              {showDifficultyDropdown && (
                <div className="absolute top-12 left-0 right-0 bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg shadow-lg z-20">
                  {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((difficulty) => (
                    <button
                      key={difficulty}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg text-[var(--text-primary)]"
                      onClick={() => {
                        setDifficultyFilter(difficulty);
                        setShowDifficultyDropdown(false);
                      }}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* Main Content */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="space-y-3">
            {filteredChallenges.map((challenge) => (
              <a
                key={challenge.id}
                className="flex items-center gap-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] p-4 transition-all hover:shadow-md"
                href={challenge.href}
              >
                <div className="flex-grow">
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    {challenge.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyBadgeClasses(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {challenge.language}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-2xl text-[var(--text-secondary)]">
                  chevron_right
                </span>
              </a>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">No challenges found matching your filters.</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Challenges;