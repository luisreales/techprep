import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, RotateCcw } from 'lucide-react';
import { api } from '@/services/api';

interface PracticeSessionFiltersProps {
  onFiltersChange: (filters: { topicId?: number; status?: string }) => void;
}

export const PracticeSessionFilters: React.FC<PracticeSessionFiltersProps> = ({ onFiltersChange }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Fetch topics for selection
  const { data: topicsResponse } = useQuery({
    queryKey: ['topics'],
    queryFn: () => api.get('/topics').then(res => res.data)
  });

  const topics = topicsResponse?.data || [];

  const statusOptions = [
    { value: '', label: 'All Sessions' },
    { value: 'NotStarted', label: 'Not Started' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];

  const handleTopicChange = (topicId: number | undefined) => {
    setSelectedTopicId(topicId);
    onFiltersChange({ topicId, status: selectedStatus });
  };

  const handleStatusChange = (status: string | undefined) => {
    setSelectedStatus(status);
    onFiltersChange({ topicId: selectedTopicId, status });
  };

  const resetFilters = () => {
    setSelectedTopicId(undefined);
    setSelectedStatus(undefined);
    onFiltersChange({});
  };

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
        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Topic
          </label>
          <select
            value={selectedTopicId || ''}
            onChange={(e) => handleTopicChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All Topics</option>
            {topics.map((topic: any) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => handleStatusChange(e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedTopicId || selectedStatus) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Active filters:</span>
          {selectedTopicId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {topics.find((t: any) => t.id === selectedTopicId)?.name || `Topic ${selectedTopicId}`}
              <button onClick={() => handleTopicChange(undefined)}>×</button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700">
              {statusOptions.find(s => s.value === selectedStatus)?.label}
              <button onClick={() => handleStatusChange(undefined)}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};