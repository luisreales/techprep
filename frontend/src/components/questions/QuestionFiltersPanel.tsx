import React, { useState, useEffect, useRef } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  RefreshCw,
  Tag,
  Folder,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';
import {
  QuestionFilters,
  questionBankApi,
  QuestionCategory,
  QuestionDifficulty,
  QuestionTag
} from '@/services/questionBankApi';

interface QuestionFiltersPanelProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  onClose?: () => void;
}

const QuestionFiltersPanel: React.FC<QuestionFiltersPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [difficulties, setDifficulties] = useState<QuestionDifficulty[]>([]);
  const [tags, setTags] = useState<QuestionTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, difficultiesRes, tagsRes] = await Promise.all([
        questionBankApi.getCategories(),
        questionBankApi.getDifficulties(),
        questionBankApi.getTags()
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (difficultiesRes.success) setDifficulties(difficultiesRes.data || []);
      if (tagsRes.success) setTags(tagsRes.data || []);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const normalizeArrayValue = (key: keyof QuestionFilters, value: any) => {
    if (typeof value !== 'string') return value;
    if (key === 'types') {
      switch (value) {
        case 'single_choice':
        case 'SingleChoice':
          return 'SingleChoice';
        case 'multi_choice':
        case 'MultiChoice':
          return 'MultiChoice';
        case 'written':
        case 'Written':
          return 'Written';
      }
    }
    if (key === 'levels') {
      switch (value) {
        case 'basic':
        case 'Basic':
          return 'Basic';
        case 'intermediate':
        case 'Intermediate':
          return 'Intermediate';
        case 'advanced':
        case 'Advanced':
          return 'Advanced';
      }
    }
    if (key === 'bloomsTaxonomy') {
      return value.toLowerCase();
    }
    if (key === 'cognitiveLoad') {
      return value.toLowerCase();
    }
    return value;
  };

  const arrayIncludesNormalized = (array: any[], key: keyof QuestionFilters, value: any) => {
    const normalizedValue = normalizeArrayValue(key, value);
    return array.map(item => normalizeArrayValue(key, item)).includes(normalizedValue);
  };

  const handleArrayFilterToggle = (key: keyof QuestionFilters, value: number | string) => {
    const currentArray = (filters[key] as any[]) || [];
    const normalizedValue = normalizeArrayValue(key, value);
    const normalizedArray = currentArray.map(item => normalizeArrayValue(key, item));

    const exists = normalizedArray.includes(normalizedValue);
    const newArray = exists
      ? normalizedArray.filter(item => item !== normalizedValue)
      : [...normalizedArray, normalizedValue];

    onFiltersChange({ [key]: newArray.length > 0 ? newArray : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: undefined,
      difficulties: undefined,
      tags: undefined,
      types: undefined,
      levels: undefined,
      bloomsTaxonomy: undefined,
      cognitiveLoad: undefined,
      isVerified: undefined,
      timeRange: undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count++;
    if (filters.difficulties?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.types?.length) count++;
    if (filters.levels?.length) count++;
    if (filters.bloomsTaxonomy?.length) count++;
    if (filters.cognitiveLoad?.length) count++;
    if (filters.isVerified !== undefined) count++;
    if (filters.timeRange) count++;
    return count;
  };

  const CheckboxOption: React.FC<{
    checked: boolean;
    onToggle: () => void;
    label: string;
    count?: number;
    color?: string;
  }> = ({ checked, onToggle, label, count, color }) => (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      {color && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  );

  const FilterDropdown: React.FC<{
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    active?: boolean;
  }> = ({ label, icon, children, active }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
            active
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {icon}
          <span>{label}</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 mt-2 min-w-[240px] max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin" size={20} />
          <span className="ml-2 text-gray-600">Loading filters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearFilters}
              type="button"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X size={14} />
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X size={14} />
              Close
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            label="Question Type"
            icon={<Filter size={16} />}
            active={Boolean(filters.types?.length)}
          >
            {[
              { value: 'SingleChoice', label: 'Single Choice' },
              { value: 'MultiChoice', label: 'Multiple Choice' },
              { value: 'Written', label: 'Written' }
            ].map(type => (
              <CheckboxOption
                key={type.value}
                checked={arrayIncludesNormalized(filters.types || [], 'types', type.value)}
                onToggle={() => handleArrayFilterToggle('types', type.value)}
                label={type.label}
              />
            ))}
          </FilterDropdown>

          <FilterDropdown
            label="Difficulty Level"
            icon={<Star size={16} />}
            active={Boolean(filters.levels?.length)}
          >
            {[
              { value: 'Basic', label: 'Basic' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' }
            ].map(level => (
              <CheckboxOption
                key={level.value}
                checked={arrayIncludesNormalized(filters.levels || [], 'levels', level.value)}
                onToggle={() => handleArrayFilterToggle('levels', level.value)}
                label={level.label}
              />
            ))}
          </FilterDropdown>

          <FilterDropdown
            label="Categories"
            icon={<Folder size={16} />}
            active={Boolean(filters.categories?.length)}
          >
            {categories.length === 0 ? (
              <p className="text-xs text-gray-500">No categories available</p>
            ) : (
              categories.map(category => (
                <CheckboxOption
                  key={category.id}
                  checked={arrayIncludesNormalized(filters.categories || [], 'categories', category.id)}
                  onToggle={() => handleArrayFilterToggle('categories', category.id)}
                  label={category.name}
                />
              ))
            )}
          </FilterDropdown>

          <FilterDropdown
            label="Difficulty Ratings"
            icon={<Star size={16} />}
            active={Boolean(filters.difficulties?.length)}
          >
            {difficulties.length === 0 ? (
              <p className="text-xs text-gray-500">No difficulty ratings</p>
            ) : (
              difficulties.map(difficulty => (
                <CheckboxOption
                  key={difficulty.id}
                  checked={arrayIncludesNormalized(filters.difficulties || [], 'difficulties', difficulty.id)}
                  onToggle={() => handleArrayFilterToggle('difficulties', difficulty.id)}
                  label={`${difficulty.name} (Level ${difficulty.level})`}
                  color={difficulty.color}
                />
              ))
            )}
          </FilterDropdown>

          <FilterDropdown
            label="Tags"
            icon={<Tag size={16} />}
            active={Boolean(filters.tags?.length)}
          >
            {tags.length === 0 ? (
              <p className="text-xs text-gray-500">No tags available</p>
            ) : (
              tags.map(tag => (
                <CheckboxOption
                  key={tag.id}
                  checked={arrayIncludesNormalized(filters.tags || [], 'tags', tag.id)}
                  onToggle={() => handleArrayFilterToggle('tags', tag.id)}
                  label={tag.name}
                  color={tag.color}
                />
              ))
            )}
          </FilterDropdown>

          <FilterDropdown
            label="Estimated Time"
            icon={<Clock size={16} />}
            active={Boolean(filters.timeRange)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="120"
                  value={filters.timeRange?.[0] ?? ''}
                  onChange={(e) => {
                    const min = Number.isNaN(parseInt(e.target.value, 10)) ? 0 : parseInt(e.target.value, 10);
                    const max = filters.timeRange?.[1] ?? 60;
                    handleFilterChange('timeRange', [min, max]);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="120"
                  value={filters.timeRange?.[1] ?? ''}
                  onChange={(e) => {
                    const max = Number.isNaN(parseInt(e.target.value, 10)) ? 60 : parseInt(e.target.value, 10);
                    const min = filters.timeRange?.[0] ?? 0;
                    handleFilterChange('timeRange', [min, max]);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-500">min</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: '< 5m', range: [0, 5] },
                  { label: '5-15m', range: [5, 15] },
                  { label: '15-30m', range: [15, 30] },
                  { label: '> 30m', range: [30, 120] }
                ].map(({ label, range }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleFilterChange('timeRange', range)}
                    className={`px-2 py-1 text-xs rounded border ${
                      filters.timeRange?.[0] === range[0] && filters.timeRange?.[1] === range[1]
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </FilterDropdown>

          <FilterDropdown
            label="Bloom's Taxonomy"
            icon={<Star size={16} />}
            active={Boolean(filters.bloomsTaxonomy?.length)}
          >
            {['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].map(level => (
              <CheckboxOption
                key={level}
                checked={arrayIncludesNormalized(filters.bloomsTaxonomy || [], 'bloomsTaxonomy', level)}
                onToggle={() => handleArrayFilterToggle('bloomsTaxonomy', level)}
                label={level.charAt(0).toUpperCase() + level.slice(1)}
              />
            ))}
          </FilterDropdown>

          <FilterDropdown
            label="Cognitive Load"
            icon={<Star size={16} />}
            active={Boolean(filters.cognitiveLoad?.length)}
          >
            {['low', 'medium', 'high'].map(load => (
              <CheckboxOption
                key={load}
                checked={arrayIncludesNormalized(filters.cognitiveLoad || [], 'cognitiveLoad', load)}
                onToggle={() => handleArrayFilterToggle('cognitiveLoad', load)}
                label={load.charAt(0).toUpperCase() + load.slice(1)}
              />
            ))}
          </FilterDropdown>

          <FilterDropdown
            label="Status"
            icon={<CheckCircle size={16} />}
            active={filters.isVerified !== undefined}
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="verification"
                  checked={filters.isVerified === true}
                  onChange={() => handleFilterChange('isVerified', true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="verification"
                  checked={filters.isVerified === false}
                  onChange={() => handleFilterChange('isVerified', false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Unverified only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="verification"
                  checked={filters.isVerified === undefined}
                  onChange={() => handleFilterChange('isVerified', undefined)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">All questions</span>
              </label>
            </div>
          </FilterDropdown>
        </div>
      </div>
    </div>
  );
};

export default QuestionFiltersPanel;
