import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import type { ChallengeFilters as ChallengeFiltersType, ChallengeLanguage, ChallengeDifficulty } from '@/types/challenges';

interface ChallengeFiltersProps {
  filters: ChallengeFiltersType;
  onFiltersChange: (filters: ChallengeFiltersType) => void;
  availableTags?: string[];
  className?: string;
}

export const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  className = ''
}) => {
  const handleFilterChange = <K extends keyof ChallengeFiltersType>(
    key: K,
    value: ChallengeFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.language ||
    filters.difficulty ||
    filters.tags?.length ||
    filters.hasSolution !== undefined
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Language Filter */}
        <select
          value={filters.language || ''}
          onChange={(e) => handleFilterChange('language', e.target.value ? parseInt(e.target.value) as ChallengeLanguage : undefined)}
          className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All languages</option>
          <option value="1">C#</option>
          <option value="2">JavaScript</option>
          <option value="3">TypeScript</option>
          <option value="4">Python</option>
          <option value="5">Java</option>
          <option value="6">Go</option>
          <option value="7">Rust</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value ? parseInt(e.target.value) as ChallengeDifficulty : undefined)}
          className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All difficulties</option>
          <option value="1">Basic</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>

        {/* Has Solution Filter */}
        <select
          value={filters.hasSolution === true ? 'true' : filters.hasSolution === false ? 'false' : ''}
          onChange={(e) => handleFilterChange('hasSolution', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All challenges</option>
          <option value="true">With solution</option>
          <option value="false">Without solution</option>
        </select>
      </div>

      {/* Tags Filter - if available */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tags?.includes(tag) || false;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = isSelected
                      ? currentTags.filter((t) => t !== tag)
                      : [...currentTags, tag];
                    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};