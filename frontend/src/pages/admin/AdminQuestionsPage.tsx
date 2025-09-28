import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multi_choice' | 'written';
  level: 'basic' | 'intermediate' | 'advanced';
  topicId: number;
  topic?: { id: number; name: string };
  officialAnswer: string;
  usableInPractice: boolean;
  createdAt: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
}

interface AdminQuestionsFilters {
  search: string;
  topicId?: number;
  type?: string;
  level?: string;
  usableInPractice?: boolean;
}

export const AdminQuestionsPage: React.FC = () => {
  const [filters, setFilters] = useState<AdminQuestionsFilters>({
    search: '',
    topicId: undefined,
    type: undefined,
    level: undefined,
    usableInPractice: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch topics for filter dropdown
  const { data: topicsResponse } = useQuery({
    queryKey: ['topics'],
    queryFn: () => fetch('/api/topics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  // Fetch questions with filters
  const { data: questionsResponse, isLoading } = useQuery({
    queryKey: ['admin-questions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.topicId) params.append('topicId', filters.topicId.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.usableInPractice !== undefined) {
        params.append('usableInPractice', filters.usableInPractice.toString());
      }

      const response = await fetch(`/api/questions?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Toggle practice availability mutation
  const togglePracticeMutation = useMutation({
    mutationFn: async ({ questionId, usableInPractice }: { questionId: string; usableInPractice: boolean }) => {
      const response = await fetch(`/api/questions/${questionId}/toggle-practice`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ usableInPractice })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      setSelectedQuestions(prev => prev.filter(id => !prev.includes(questionId)));
    }
  });

  const topics = topicsResponse?.data || [];
  const questions: Question[] = questionsResponse?.data || [];

  const handleFilterChange = (key: keyof AdminQuestionsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      topicId: undefined,
      type: undefined,
      level: undefined,
      usableInPractice: undefined
    });
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'single_choice': return '📝';
      case 'multi_choice': return '☑️';
      case 'written': return '✍️';
      default: return '❓';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions Management</h1>
          <p className="text-gray-600">
            Manage your question bank and configure practice availability
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <select
                  value={filters.topicId || ''}
                  onChange={(e) => handleFilterChange('topicId', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Topics</option>
                  {topics.map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="single_choice">Single Choice</option>
                  <option value="multi_choice">Multiple Choice</option>
                  <option value="written">Written</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={filters.level || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Practice Status and Clear */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Status
                </label>
                <select
                  value={filters.usableInPractice !== undefined ? filters.usableInPractice.toString() : ''}
                  onChange={(e) => handleFilterChange('usableInPractice', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Questions</option>
                  <option value="true">Available in Practice</option>
                  <option value="false">Not Available in Practice</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary & Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {questions.length} questions found
          </span>
          {selectedQuestions.length > 0 && (
            <span className="text-sm text-blue-600">
              {selectedQuestions.length} selected
            </span>
          )}
        </div>

        {selectedQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-green-600 hover:text-green-700">
              Enable in Practice
            </button>
            <button className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-700">
              Disable in Practice
            </button>
            <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">
              No questions match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.length === questions.length && questions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleSelectQuestion(question.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {question.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(question.type)}</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(question.level)}`}>
                        {question.level}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {question.topic?.name || 'No Topic'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePracticeMutation.mutate({
                          questionId: question.id,
                          usableInPractice: !question.usableInPractice
                        })}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          question.usableInPractice
                            ? 'text-green-700 bg-green-100 hover:bg-green-200'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {question.usableInPractice ? (
                          <><CheckCircle className="w-3 h-3" /> Enabled</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Disabled</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-yellow-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestionMutation.mutate(question.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};