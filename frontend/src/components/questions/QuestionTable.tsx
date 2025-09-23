import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Tag,
  Folder
} from 'lucide-react';
import { EnhancedQuestion } from '@/services/questionBankApi';

interface QuestionTableProps {
  questions: EnhancedQuestion[];
  selectedQuestions: string[];
  onQuestionSelect: (questionId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onPreview: (question: EnhancedQuestion) => void;
  onQuestionEdit: (question: EnhancedQuestion) => void;
  onQuestionDuplicate: (question: EnhancedQuestion) => void;
  onQuestionAnalytics: (question: EnhancedQuestion) => void;
  onQuestionDelete: (question: EnhancedQuestion) => void;
}

type SortField = 'text' | 'type' | 'level' | 'createdAt' | 'stats.totalAttempts' | 'stats.averageScore';
type SortDirection = 'asc' | 'desc';

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  selectedQuestions,
  onQuestionSelect,
  onSelectAll,
  onPreview,
  onQuestionEdit,
  onQuestionDuplicate,
  onQuestionAnalytics,
  onQuestionDelete
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case 'text':
        aValue = a.text.toLowerCase();
        bValue = b.text.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'level':
        aValue = a.level;
        bValue = b.level;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'stats.totalAttempts':
        aValue = a.stats.totalAttempts;
        bValue = b.stats.totalAttempts;
        break;
      case 'stats.averageScore':
        aValue = a.stats.averageScore;
        bValue = b.stats.averageScore;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = questions.length > 0 && selectedQuestions.length === questions.length;
  const someSelected = selectedQuestions.length > 0 && selectedQuestions.length < questions.length;

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

  const difficultyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('text')}
              >
                <div className="flex items-center gap-1">
                  Question
                  {getSortIcon('text')}
                </div>
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('level')}
              >
                <div className="flex items-center gap-1">
                  Level
                  {getSortIcon('level')}
                </div>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories & Tags
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stats.totalAttempts')}
              >
                <div className="flex items-center gap-1">
                  Attempts
                  {getSortIcon('stats.totalAttempts')}
                </div>
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stats.averageScore')}
              >
                <div className="flex items-center gap-1">
                  Avg Score
                  {getSortIcon('stats.averageScore')}
                </div>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedQuestions.map((question) => (
              <tr
                key={question.id}
                className={`hover:bg-gray-50 ${
                  selectedQuestions.includes(question.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={(e) => onQuestionSelect(question.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {question.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        ID: {question.id.slice(0, 8)}...
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {question.estimatedTimeMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
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
                </td>

                <td className="px-4 py-4">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                    {question.level}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {question.categories?.slice(0, 2).map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                        >
                          <Folder size={10} />
                          {category.name}
                        </span>
                      ))}
                      {question.categories && question.categories.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                          +{question.categories.length - 2}
                        </span>
                      )}
                      {(!question.categories || question.categories.length === 0) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                          <Folder size={10} />
                          {question.topicName || 'Unknown Topic'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {question.tags?.slice(0, 2).map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          <Tag size={10} />
                          {tag.name}
                        </span>
                      ))}
                      {question.tags && question.tags.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded">
                          +{question.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      difficultyColors[question.cognitiveLoad] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {question.cognitiveLoad}
                    </span>
                    <div className="text-xs text-gray-500">
                      {question.stats?.difficultyRating != null
                        ? `${question.stats.difficultyRating.toFixed(1)}/5`
                        : 'N/A'}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {question.stats?.totalAttempts ?? 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {question.stats?.correctAttempts != null ? `${question.stats.correctAttempts} correct` : 'No attempts'}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-green-600">
                    {question.stats?.averageScore != null ? `${question.stats.averageScore.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: {question.stats?.averageTimeSpent != null ? `${Math.round(question.stats.averageTimeSpent)}s` : 'N/A'}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {question.isVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-xs">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle size={14} />
                        <span className="text-xs">Pending</span>
                      </div>
                    )}
                    <span className={`text-xs ${question.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {question.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onPreview(question)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onQuestionEdit(question)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onQuestionDuplicate(question)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => onQuestionAnalytics(question)}
                      className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title="Analytics"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button
                      onClick={() => onQuestionDelete(question)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default QuestionTable;
