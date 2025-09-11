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
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesDifficulty = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
    const matchesLanguage = languageFilter === 'All' || challenge.language === languageFilter;
    return matchesDifficulty && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col min-h-screen justify-between">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <button className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-slate-100">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="flex-1 text-center text-xl font-bold tracking-tight text-gray-900">
              Code Challenges
            </h1>
            <div className="w-10"></div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-3 p-4 pt-2">
            {/* Language Filter */}
            <div className="relative flex-1">
              <button
                className="flex h-10 w-full items-center justify-center gap-x-2 rounded-lg bg-gray-100 px-4"
                onClick={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  setShowDifficultyDropdown(false);
                }}
              >
                <p className="text-sm font-medium text-gray-900">
                  {languageFilter === 'All' ? 'Language' : languageFilter}
                </p>
                <span className="material-symbols-outlined text-xl text-gray-600">expand_more</span>
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {(['All', 'Python', 'Java', 'JavaScript', 'C++'] as LanguageFilter[]).map((language) => (
                    <button
                      key={language}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
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
                className="flex h-10 w-full items-center justify-center gap-x-2 rounded-lg bg-gray-100 px-4"
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowLanguageDropdown(false);
                }}
              >
                <p className="text-sm font-medium text-gray-900">
                  {difficultyFilter === 'All' ? 'Difficulty' : difficultyFilter}
                </p>
                <span className="material-symbols-outlined text-xl text-gray-600">expand_more</span>
              </button>
              
              {showDifficultyDropdown && (
                <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((difficulty) => (
                    <button
                      key={difficulty}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
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
        </header>

        {/* Main Content */}
        <main className="flex-grow bg-white p-4">
          <div className="space-y-3">
            {filteredChallenges.map((challenge) => (
              <a
                key={challenge.id}
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
                href={challenge.href}
              >
                <div className="flex-grow">
                  <p className="text-base font-semibold text-gray-900">
                    {challenge.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyBadgeClasses(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">
                      {challenge.language}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-2xl text-gray-600">
                  chevron_right
                </span>
              </a>
            ))}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No challenges found matching your filters.</p>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <footer className="sticky bottom-0 border-t border-slate-200 bg-white pb-3">
          <nav className="flex justify-around pt-2">
            <a className="flex flex-col items-center justify-end gap-1 text-center text-gray-600" href="#">
              <span className="material-symbols-outlined">home</span>
              <p className="text-xs font-medium">Home</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-center text-[#137fec]" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                code
              </span>
              <p className="text-xs font-medium">Challenges</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-center text-gray-600" href="#">
              <span className="material-symbols-outlined">description</span>
              <p className="text-xs font-medium">Practice</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-center text-gray-600" href="#">
              <span className="material-symbols-outlined">person</span>
              <p className="text-xs font-medium">Profile</p>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default Challenges;