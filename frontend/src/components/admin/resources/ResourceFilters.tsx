import React from 'react';
import { ResourceKind, ResourceDifficulty, ResourceFilters as ResourceFiltersType } from '@/types/resources';
import { Topic } from '@/services/admin/topicsApi';
import { Search, Filter, X, Book, Video, FileText, Star } from 'lucide-react';

interface ResourceFiltersProps {
  filters: ResourceFiltersType;
  topics: Topic[];
  onFiltersChange: (filters: ResourceFiltersType) => void;
  onClearFilters: () => void;
}

const kindIcons = {
  [ResourceKind.Book]: Book,
  [ResourceKind.Video]: Video,
  [ResourceKind.Article]: FileText,
};

const kindLabels = {
  [ResourceKind.Book]: 'Books',
  [ResourceKind.Video]: 'Videos',
  [ResourceKind.Article]: 'Articles',
};

const difficultyLabels = {
  [ResourceDifficulty.Basic]: 'Basic',
  [ResourceDifficulty.Medium]: 'Medium',
  [ResourceDifficulty.Hard]: 'Hard',
};

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  topics,
  onFiltersChange,
  onClearFilters,
}) => {
  const hasActiveFilters = !!(
    filters.search ||
    filters.kind ||
    filters.difficulty ||
    filters.topicId ||
    filters.minRating
  );

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined, page: 1 });
  };

  const handleKindChange = (kind: ResourceKind | undefined) => {
    onFiltersChange({ ...filters, kind, page: 1 });
  };

  const handleDifficultyChange = (difficulty: ResourceDifficulty | undefined) => {
    onFiltersChange({ ...filters, difficulty, page: 1 });
  };

  const handleTopicChange = (topicId: number | undefined) => {
    onFiltersChange({ ...filters, topicId, page: 1 });
  };

  const handleMinRatingChange = (minRating: number | undefined) => {
    onFiltersChange({ ...filters, minRating, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({ ...filters, sort });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search resources by title, author, or description..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Resource Kind Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Type:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleKindChange(undefined)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                !filters.kind
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {Object.values(ResourceKind).map((kind) => {
              const IconComponent = kindIcons[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleKindChange(kind)}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filters.kind === kind
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-3 w-3" />
                  {kindLabels[kind]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Difficulty:</span>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleDifficultyChange(e.target.value as ResourceDifficulty || undefined)}
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            {Object.values(ResourceDifficulty).map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficultyLabels[difficulty]}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Topic:</span>
          <select
            value={filters.topicId || ''}
            onChange={(e) => handleTopicChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Min Rating:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleMinRatingChange(undefined)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                !filters.minRating
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Any
            </button>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleMinRatingChange(rating)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  filters.minRating === rating
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Star className="h-3 w-3" />
                {rating}+
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-medium text-gray-600">Sort by:</span>
          <select
            value={filters.sort || 'createdAt_desc'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Search: "{filters.search}"
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.kind && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Type: {kindLabels[filters.kind]}
              <button
                type="button"
                onClick={() => handleKindChange(undefined)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.difficulty && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Difficulty: {difficultyLabels[filters.difficulty]}
              <button
                type="button"
                onClick={() => handleDifficultyChange(undefined)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.topicId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Topic: {topics.find(t => t.id === filters.topicId)?.name}
              <button
                type="button"
                onClick={() => handleTopicChange(undefined)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.minRating && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Min Rating: {filters.minRating}+
              <button
                type="button"
                onClick={() => handleMinRatingChange(undefined)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};