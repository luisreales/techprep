import React, { useState } from 'react';
import { PlayCircle, Settings, Users, Clock, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { practiceModuleApi } from '@/services/practiceModuleApi';

export interface PracticeConfigData {
  topicId?: number;
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
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>();
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['basic']);
  const [questionCount, setQuestionCount] = useState(10);

  // Fetch topics for selection
  const { data: topicsResponse } = useQuery({
    queryKey: ['topics'],
    queryFn: () => fetch('/api/topics').then(res => res.json())
  });

  const topics = topicsResponse?.data || [];

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleStartPractice = () => {
    console.log('⚡ "Start Practice" button clicked in config modal');
    console.log('📋 Current configuration:', {
      selectedTopicId,
      selectedLevels,
      questionCount,
      isValidConfig
    });

    if (selectedLevels.length === 0) {
      console.log('❌ No difficulty levels selected');
      alert('Please select at least one difficulty level');
      return;
    }

    const config = {
      topicId: selectedTopicId,
      levels: selectedLevels,
      questionCount
    };
    console.log('✨ Calling onStartPractice with config:', config);

    onStartPractice(config);
  };

  const isValidConfig = selectedLevels.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configure Practice Session</h2>
          <p className="text-gray-600">Set your preferences to start practicing</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Topic Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Target className="w-4 h-4" />
            Topic (Optional)
          </label>
          <select
            value={selectedTopicId || ''}
            onChange={(e) => setSelectedTopicId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Topics</option>
            {topics.map((topic: any) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to practice questions from all topics
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

        {/* Difficulty Levels */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Clock className="w-4 h-4" />
            Difficulty Levels (Select one or more)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleLevelToggle(level.value)}
                className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors text-left ${
                  selectedLevels.includes(level.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{level.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${level.color}`}>
                    {level.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {selectedLevels.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              Please select at least one difficulty level
            </p>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Session Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Topic:</span>{' '}
              {selectedTopicId
                ? topics.find((t: any) => t.id === selectedTopicId)?.name || 'Unknown'
                : 'All Topics'
              }
            </p>
            <p>
              <span className="font-medium">Questions:</span> {questionCount}
            </p>
            <p>
              <span className="font-medium">Levels:</span>{' '}
              {selectedLevels.length > 0
                ? selectedLevels.map(level =>
                    DIFFICULTY_LEVELS.find(l => l.value === level)?.label
                  ).join(', ')
                : 'None selected'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
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