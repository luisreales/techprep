import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, Settings, Users, Clock, Target, ChevronDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { practiceModuleApi } from '@/services/practiceModuleApi';

export interface PracticeConfigData {
  name: string;
  topicIds: number[]; // Changed to support multiple topics
  levels: string[];
  questionCount: number;
}

interface PracticeSessionConfigProps {
  onStartPractice: (config: PracticeConfigData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 40, 50];
const DIFFICULTY_LEVELS = [
  { value: 'basic', label: 'Basic', color: 'text-green-600 bg-green-50' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-600 bg-red-50' }
];

export const PracticeSessionConfig: React.FC<PracticeSessionConfigProps> = ({
  onStartPractice,
  onCancel,
  isLoading = false
}) => {
  const [sessionName, setSessionName] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [errors, setErrors] = useState<{sessionName?: string; topics?: string; levels?: string}>({});
  const [topicsDropdownOpen, setTopicsDropdownOpen] = useState(false);
  const [levelsDropdownOpen, setLevelsDropdownOpen] = useState(false);
  const topicsDropdownRef = useRef<HTMLDivElement>(null);
  const levelsDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch topics for selection
  const { data: topicsResponse } = useQuery({
    queryKey: ['topics'],
    queryFn: () => fetch('/api/topics').then(res => res.json())
  });

  const topics = topicsResponse?.data || [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topicsDropdownRef.current && !topicsDropdownRef.current.contains(event.target as Node)) {
        setTopicsDropdownOpen(false);
      }
      if (levelsDropdownRef.current && !levelsDropdownRef.current.contains(event.target as Node)) {
        setLevelsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
    // Clear level error when user makes a selection
    if (errors.levels) {
      setErrors(prev => ({ ...prev, levels: undefined }));
    }
  };

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
    // Clear topic error when user makes a selection
    if (errors.topics) {
      setErrors(prev => ({ ...prev, topics: undefined }));
    }
  };

  const handleSessionNameChange = (value: string) => {
    setSessionName(value);
    // Clear session name error when user types
    if (errors.sessionName) {
      setErrors(prev => ({ ...prev, sessionName: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {sessionName?: string; topics?: string; levels?: string} = {};

    // Validate session name (mandatory, max 50 words)
    if (!sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    } else {
      const wordCount = sessionName.trim().split(/\s+/).length;
      if (wordCount > 50) {
        newErrors.sessionName = 'Session name cannot exceed 50 words';
      }
    }

    // Validate topics (mandatory, at least one must be selected)
    if (selectedTopicIds.length === 0) {
      newErrors.topics = 'At least one topic must be selected';
    }

    // Validate levels (mandatory, at least one must be selected)
    if (selectedLevels.length === 0) {
      newErrors.levels = 'At least one difficulty level must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartPractice = () => {
    console.log('⚡ "Start Practice" button clicked in config modal');
    console.log('📋 Current configuration:', {
      sessionName,
      selectedTopicIds,
      selectedLevels,
      questionCount
    });

    // Validate form before proceeding
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    const config = {
      name: sessionName.trim(),
      topicIds: selectedTopicIds,
      levels: selectedLevels,
      questionCount
    };
    console.log('✨ Calling onStartPractice with config:', config);

    onStartPractice(config);
  };

  const isValidConfig = sessionName.trim().length > 0 && selectedTopicIds.length > 0 && selectedLevels.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configure Practice Session</h2>
          <p className="text-gray-600">Set your preferences to start practicing</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Session Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Settings className="w-4 h-4" />
            Session Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => handleSessionNameChange(e.target.value)}
            placeholder="Enter a name for this practice session (max 50 words)"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.sessionName ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.sessionName && (
            <p className="text-red-500 text-xs mt-1">{errors.sessionName}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Required field - maximum 50 words
          </p>
        </div>

        {/* Topic Selection - Compact Dropdown */}
        <div ref={topicsDropdownRef} className="relative">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Target className="w-4 h-4" />
            Topics <span className="text-red-500">*</span>
          </label>

          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setTopicsDropdownOpen(!topicsDropdownOpen)}
            className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
              errors.topics ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <span className="text-sm text-gray-700">
              {selectedTopicIds.length === 0 ? 'Select topics...' : `${selectedTopicIds.length} topic(s) selected`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              topicsDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Selected Topics Display */}
          {selectedTopicIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTopicIds.map(topicId => {
                const topic = topics.find((t: any) => t.id === topicId);
                return (
                  <span
                    key={topicId}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {topic?.name || `Topic ${topicId}`}
                    <button
                      type="button"
                      onClick={() => handleTopicToggle(topicId)}
                      className="hover:bg-blue-200 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Dropdown Menu */}
          {topicsDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {topics.map((topic: any) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    handleTopicToggle(topic.id);
                    // Don't close dropdown to allow multiple selections
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    selectedTopicIds.includes(topic.id) ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                  }`}
                >
                  <span>{topic.name}</span>
                  {selectedTopicIds.includes(topic.id) && (
                    <span className="text-blue-600 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {errors.topics && (
            <p className="text-red-500 text-xs mt-1">{errors.topics}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Required - Select the topics you want to practice
          </p>
        </div>

        {/* Question Count */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Users className="w-4 h-4" />
            Number of Questions
          </label>
          <div className="grid grid-cols-5 gap-2">
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  questionCount === count
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Levels - Compact Dropdown */}
        <div ref={levelsDropdownRef} className="relative">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Clock className="w-4 h-4" />
            Difficulty Levels <span className="text-red-500">*</span>
          </label>

          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setLevelsDropdownOpen(!levelsDropdownOpen)}
            className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
              errors.levels ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <span className="text-sm text-gray-700">
              {selectedLevels.length === 0 ? 'Select difficulty levels...' : `${selectedLevels.length} level(s) selected`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              levelsDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Selected Levels Display */}
          {selectedLevels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLevels.map(levelValue => {
                const level = DIFFICULTY_LEVELS.find(l => l.value === levelValue);
                return (
                  <span
                    key={levelValue}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                      level?.color || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {level?.label || levelValue}
                    <button
                      type="button"
                      onClick={() => handleLevelToggle(levelValue)}
                      className="hover:bg-opacity-80 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Dropdown Menu */}
          {levelsDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => {
                    handleLevelToggle(level.value);
                    // Don't close dropdown to allow multiple selections
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    selectedLevels.includes(level.value) ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {level.label}
                    <span className={`px-2 py-1 rounded-full text-xs ${level.color}`}>
                      {level.label}
                    </span>
                  </span>
                  {selectedLevels.includes(level.value) && (
                    <span className="text-blue-600 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {errors.levels && (
            <p className="text-red-500 text-xs mt-1">{errors.levels}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Required - Select the difficulty levels you want to practice
          </p>
        </div>

        {/* Compact Summary - Only show when form is ready */}
        {sessionName && selectedTopicIds.length > 0 && selectedLevels.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
            <div className="text-sm text-blue-800">
              <span className="font-medium">{sessionName}</span> • {questionCount} questions • {selectedTopicIds.length} topic(s) • {selectedLevels.length} level(s)
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleStartPractice}
          disabled={!isValidConfig || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Start Practice
            </>
          )}
        </button>
      </div>
    </div>
  );
};