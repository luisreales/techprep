import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Grid3X3,
  List,
  BarChart3,
  Settings,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  Folder,
  Copy
} from 'lucide-react';
import { questionBankApi, EnhancedQuestion, QuestionFilters, QuestionBankStats } from '@/services/questionBankApi';
import { useNotification } from '@/hooks/useNotification';
import QuestionCard from '@/components/questions/QuestionCard';
import QuestionTable from '@/components/questions/QuestionTable';
import QuestionFiltersPanel from '@/components/questions/QuestionFiltersPanel';
import QuestionBankStatsPanel from '@/components/questions/QuestionBankStatsPanel';
import CreateQuestionModal from '@/components/questions/CreateQuestionModal';
import ImportQuestionsModal from '@/components/questions/ImportQuestionsModal';
import BulkActionsToolbar from '@/components/questions/BulkActionsToolbar';
import QuestionPreviewModal from '@/components/questions/QuestionPreviewModal';

type AnalyticsState = {
  loading: boolean;
  data: any;
};

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    pageSize: 20
  });
  const [stats, setStats] = useState<QuestionBankStats | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<EnhancedQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<EnhancedQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<EnhancedQuestion | null>(null);
  const [questionToDuplicate, setQuestionToDuplicate] = useState<EnhancedQuestion | null>(null);
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({ loading: false, data: null });
  const [analyticsQuestion, setAnalyticsQuestion] = useState<EnhancedQuestion | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    loadQuestions();
    loadStats();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionBankApi.getQuestions(filters);
      if (response.success) {
        setQuestions(response.data.questions);
        setTotalCount(response.data.totalCount);
      } else {
        showNotification('Error loading questions', 'error');
      }
    } catch (error) {
      showNotification('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await questionBankApi.getQuestionBankStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    setSelectedQuestions(prev =>
      selected
        ? [...prev, questionId]
        : prev.filter(id => id !== questionId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedQuestions(selected ? questions.map(q => q.id) : []);
  };

  const handleQuestionCreated = (newQuestion: EnhancedQuestion) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setTotalCount(prev => prev + 1);
    showNotification('Question created successfully', 'success');
  };

  const handleQuestionUpdated = (updatedQuestion: EnhancedQuestion) => {
    setQuestions(prev =>
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    showNotification('Question updated successfully', 'success');
  };

  const handleQuestionDeleted = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setTotalCount(prev => prev - 1);
    setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    showNotification('Question deleted successfully', 'success');
  };

  const handlePreviewQuestion = (question: EnhancedQuestion) => {
    setPreviewQuestion(question);
  };

  const handleEditQuestion = (question: EnhancedQuestion) => {
    setEditingQuestion(question);
  };

  const handleDuplicateQuestion = (question: EnhancedQuestion) => {
    setQuestionToDuplicate(question);
  };

  const handleAnalyticsQuestion = async (question: EnhancedQuestion) => {
    setAnalyticsQuestion(question);
    setAnalyticsState({ loading: true, data: null });

    try {
      const response = await questionBankApi.getQuestionAnalytics(question.id);
      if (response.success) {
        setAnalyticsState({ loading: false, data: response.data });
      } else {
        setAnalyticsState({ loading: false, data: null });
        showNotification('Analytics unavailable for this question', 'error');
      }
    } catch (error) {
      setAnalyticsState({ loading: false, data: null });
      showNotification('Failed to load analytics', 'error');
    }
  };

  const handleDeleteRequest = (question: EnhancedQuestion) => {
    setQuestionToDelete(question);
  };

  const handleDeleteConfirmed = async () => {
    if (!questionToDelete) return;

    try {
      const response = await questionBankApi.deleteQuestion(questionToDelete.id);
      if (response.success) {
        handleQuestionDeleted(questionToDelete.id);
      } else {
        showNotification('Failed to delete question', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete question', 'error');
    } finally {
      setQuestionToDelete(null);
    }
  };

  const handleDeleteCancelled = () => {
    setQuestionToDelete(null);
  };

  const handleDuplicateCancelled = () => {
    setQuestionToDuplicate(null);
  };

  const handleDuplicateConfirmed = async () => {
    if (!questionToDuplicate) return;

    try {
      const response = await questionBankApi.duplicateQuestion(questionToDuplicate.id);
      if (response.success && response.data) {
        await loadQuestions();
        await loadStats();
        showNotification('Question duplicated successfully', 'success');
      } else {
        showNotification('Failed to duplicate question', 'error');
      }
    } catch (error) {
      showNotification('Failed to duplicate question', 'error');
    } finally {
      setQuestionToDuplicate(null);
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedQuestions.map(id => questionBankApi.deleteQuestion(id)));
          setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
          setTotalCount(prev => prev - selectedQuestions.length);
          showNotification(`${selectedQuestions.length} questions deleted`, 'success');
          break;
        case 'update':
          await questionBankApi.bulkUpdateQuestions(selectedQuestions, data);
          await loadQuestions();
          showNotification(`${selectedQuestions.length} questions updated`, 'success');
          break;
        case 'export':
          const blob = await questionBankApi.exportQuestions({
            ...filters,
            questionIds: selectedQuestions
          }, data.format);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `questions.${data.format}`;
          a.click();
          URL.revokeObjectURL(url);
          showNotification('Questions exported successfully', 'success');
          break;
      }
      setSelectedQuestions([]);
    } catch (error) {
      showNotification(`Failed to ${action} questions`, 'error');
    }
  };

  const handleExportAll = async (format: 'json' | 'excel' | 'csv') => {
    try {
      const blob = await questionBankApi.exportQuestions(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `question-bank.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Questions exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export questions', 'error');
    }
  };

  const totalPages = Math.ceil(totalCount / (filters.pageSize || 20));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Question Bank</h1>
          <p className="text-gray-600">
            Manage your comprehensive question collection with advanced categorization and analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <BarChart3 size={16} />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg flex items-center gap-2"
          >
            <Upload size={16} />
            Import
          </button>

          <div className="relative">
            <button className="px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
            {/* Export dropdown would go here */}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <QuestionBankStatsPanel stats={stats} />
      )}

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search questions by text, category, tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Filter size={16} />
            Filters
          </button>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <List size={16} />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Grid3X3 size={16} />
              Grid
            </button>
          </div>

          <button
            onClick={loadQuestions}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <BulkActionsToolbar
              selectedCount={selectedQuestions.length}
              onAction={handleBulkAction}
            />
          )}

          {/* Questions List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin" size={24} />
              <span className="ml-2">Loading questions...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || Object.keys(filters).length > 2
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first question'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Question
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <QuestionTable
                  questions={questions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  onSelectAll={handleSelectAll}
                  onPreview={handlePreviewQuestion}
                  onQuestionEdit={handleEditQuestion}
                  onQuestionDuplicate={handleDuplicateQuestion}
                  onQuestionAnalytics={handleAnalyticsQuestion}
                  onQuestionDelete={handleDeleteRequest}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {questions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      selected={selectedQuestions.includes(question.id)}
                      onSelect={(selected) => handleQuestionSelect(question.id, selected)}
                      onPreview={handlePreviewQuestion}
                      onEdit={handleEditQuestion}
                      onDuplicate={handleDuplicateQuestion}
                      onAnalytics={handleAnalyticsQuestion}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
                    {Math.min((filters.page || 1) * (filters.pageSize || 20), totalCount)} of{' '}
                    {totalCount} questions
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                      disabled={(filters.page || 1) <= 1}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-1">
                      Page {filters.page || 1} of {totalPages}
                    </span>

                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                      disabled={(filters.page || 1) >= totalPages}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuestionModal
          onClose={() => setShowCreateModal(false)}
          onQuestionCreated={handleQuestionCreated}
        />
      )}

      {editingQuestion && (
        <CreateQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}

      <ImportQuestionsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          loadQuestions();
          loadStats();
        }}
      />

      {previewQuestion && (
        <QuestionPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative mt-20 w-full max-w-5xl">
            <QuestionFiltersPanel
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

      {questionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-800 line-clamp-2">“{questionToDelete.text}”</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteCancelled}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {questionToDuplicate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Copy size={18} /> Duplicate Question
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to duplicate this question?
              </p>
              <p className="text-sm text-gray-800 line-clamp-2">“{questionToDuplicate.text}”</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDuplicateCancelled}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateConfirmed}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {analyticsQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Question Analytics</h3>
                <p className="text-sm text-gray-600">{analyticsQuestion.text}</p>
              </div>
              <button
                onClick={() => {
                  setAnalyticsQuestion(null);
                  setAnalyticsState({ loading: false, data: null });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {analyticsState.loading ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  Loading analytics...
                </div>
              ) : analyticsState.data ? (
                <pre className="bg-gray-50 text-sm text-gray-800 rounded-lg p-4 overflow-auto">
                  {JSON.stringify(analyticsState.data, null, 2)}
                </pre>
              ) : (
                <div className="text-sm text-gray-500">
                  No analytics data available for this question.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
