import React, { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Tag,
  Folder,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { EnhancedQuestion } from '@/services/questionBankApi';

interface QuestionCardProps {
  question: EnhancedQuestion;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onPreview: (question: EnhancedQuestion) => void;
  onEdit: (question: EnhancedQuestion) => void;
  onDuplicate: (question: EnhancedQuestion) => void;
  onAnalytics: (question: EnhancedQuestion) => void;
  onDelete: (question: EnhancedQuestion) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onDuplicate,
  onAnalytics,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const categories = question.categories ?? [];
  const tags = question.tags ?? [];
  const sources = question.sources ?? [];

  const difficultyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const toPascalCase = (value: string) => {
    if (!value) return '';
    if (value.includes('_')) {
      return value
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const normalizeType = (type: string) => {
    const trimmed = type?.trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    if (lower === 'singlechoice' || lower === 'single_choice') return 'SingleChoice';
    if (lower === 'multichoice' || lower === 'multi_choice') return 'MultiChoice';
    if (lower === 'written') return 'Written';
    return toPascalCase(trimmed);
  };

  const typeLabels: Record<string, string> = {
    SingleChoice: 'Single Choice',
    MultiChoice: 'Multiple Choice',
    Written: 'Written'
  };

  const typeColors: Record<string, string> = {
    SingleChoice: 'bg-blue-100 text-blue-700',
    MultiChoice: 'bg-purple-100 text-purple-700',
    Written: 'bg-green-100 text-green-700'
  };

  const bloomsColors = {
    remember: 'bg-blue-100 text-blue-800',
    understand: 'bg-green-100 text-green-800',
    apply: 'bg-yellow-100 text-yellow-800',
    analyze: 'bg-orange-100 text-orange-800',
    evaluate: 'bg-red-100 text-red-800',
    create: 'bg-purple-100 text-purple-800'
  };

  const formatScore = (score: number) => {
    return score ? `${score.toFixed(1)}%` : 'N/A';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
      selected ? 'border-blue-500 shadow-md' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  difficultyColors[question.cognitiveLoad] || 'bg-gray-100 text-gray-800'
                }`}>
                  {question.cognitiveLoad}
                </span>

                {(() => {
                  const normalized = normalizeType(question.type);
                  return (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        typeColors[normalized] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {typeLabels[normalized] || normalized}
                    </span>
                  );
                })()}

                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                  {question.level}
                </span>

                {question.isVerified && (
                  <CheckCircle size={14} className="text-green-500" title="Verified" />
                )}
              </div>

              <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                {question.text}
              </h3>

              {/* Categories and Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.slice(0, 2).map(category => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                  >
                    <Folder size={10} />
                    {category.name}
                  </span>
                ))}
                {categories.length > 2 && (
                  <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                    +{categories.length - 2} more
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    <Tag size={10} />
                    {tag.name}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onPreview(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={14} />
                  Preview
                </button>
                <button
                  onClick={() => {
                    onEdit(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onAnalytics(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart3 size={14} />
                  Analytics
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Bloom's Taxonomy & Cognitive Load */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-gray-400" />
            <span className={`px-2 py-1 text-xs rounded-full ${
              bloomsColors[question.bloomsTaxonomy] || 'bg-gray-100 text-gray-800'
            }`}>
              {question.bloomsTaxonomy}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} />
            <span>{question.estimatedTimeMinutes}m</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Attempts:</span>
              <span className="font-medium">{question.stats?.totalAttempts ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium text-green-600">
                {question.stats?.averageScore != null ? formatScore(question.stats.averageScore) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Time:</span>
              <span className="font-medium">
                {question.stats?.averageTimeSpent != null ? formatTime(question.stats.averageTimeSpent) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">
                {question.stats?.difficultyRating != null ? `${question.stats.difficultyRating.toFixed(1)}/5` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ExternalLink size={14} />
              <span>
                {sources.length} source{sources.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onPreview(question)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => onAnalytics(question)}
            className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg flex items-center justify-center gap-2"
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
