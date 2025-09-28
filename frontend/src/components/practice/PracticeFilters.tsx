import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { usePracticeModuleStore } from '@/stores/practiceModuleStore';
import { PracticeDifficulty, PracticeQuestionType } from '@/types/practice';
import { Filter, RotateCcw } from 'lucide-react';

const difficultyOptions: { label: string; value: PracticeDifficulty }[] = [
  { label: 'Basic', value: 'Basic' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

const typeOptions: { label: string; value: PracticeQuestionType }[] = [
  { label: 'Single Choice', value: 'SingleChoice' },
  { label: 'Multiple Choice', value: 'MultiChoice' },
  { label: 'Written', value: 'Written' },
];

const useTopics = () =>
  useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await apiClient.getTopics();
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

export const PracticeFilters: React.FC = () => {
  const {
    topicIds,
    difficulties,
    questionTypes,
    searchTerm,
    setFilters,
    resetFilters,
    setSearchTerm,
  } = usePracticeModuleStore();

  const { data: topics = [] } = useTopics();
  const [inputValue, setInputValue] = useState(searchTerm);

  // Debounce search input updates
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      if (inputValue !== searchTerm) {
        setSearchTerm(inputValue);
      }
    }, 300);

    return () => window.clearTimeout(handler);
  }, [inputValue, searchTerm, setSearchTerm]);

  const topicMap = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic.name])),
    [topics]
  );

  const toggleValue = <T,>(values: T[], value: T): T[] =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Search
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search by keyword, topic, or tag"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Topics
          </legend>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
              const selected = topicIds.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setFilters({ topicIds: toggleValue(topicIds, topic.id) })}
                  className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium shadow-sm transition ${
                    selected
                      ? 'border-blue-300 bg-blue-100 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {topic.name}
                </button>
              );
            })}
            {!topics.length && <span className="text-xs text-slate-400">No topics available</span>}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Difficulty
          </legend>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => {
              const selected = difficulties.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters({ difficulties: toggleValue(difficulties, option.value) })}
                  className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium shadow-sm transition ${
                    selected
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:text-emerald-600'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question Type
          </legend>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => {
              const selected = questionTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters({ questionTypes: toggleValue(questionTypes, option.value) })}
                  className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium shadow-sm transition ${
                    selected
                      ? 'border-purple-300 bg-purple-100 text-purple-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-200 hover:text-purple-600'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {(topicIds.length || difficulties.length || questionTypes.length) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Active filters:</span>
          {topicIds.map((id) => (
            <span key={`topic-${id}`} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {topicMap.get(id) ?? `Topic ${id}`}
              <button onClick={() => setFilters({ topicIds: topicIds.filter((value) => value !== id) })}>×</button>
            </span>
          ))}
          {difficulties.map((value) => (
            <span key={`difficulty-${value}`} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              {value}
              <button onClick={() => setFilters({ difficulties: difficulties.filter((item) => item !== value) })}>×</button>
            </span>
          ))}
          {questionTypes.map((value) => (
            <span key={`type-${value}`} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-700">
              {value}
              <button onClick={() => setFilters({ questionTypes: questionTypes.filter((item) => item !== value) })}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
