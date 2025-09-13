import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi, QuestionsListParams } from '@/services/admin/questionsApi';
import { topicsApi } from '@/services/admin/topicsApi';
import { Question, QuestionFormData } from '@/schemas/questionSchema';
import { QuestionType, DifficultyLevel, questionTypeLabels, difficultyLevelLabels } from '@/utils/enums';
import { QuestionsTable } from './QuestionsTable';
import { QuestionFormDrawer } from './QuestionFormDrawer';
import { AdminImportDialog } from '@/components/admin/import/AdminImportDialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  AlertCircle,
  Trash2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { type RowSelectionState } from '@tanstack/react-table';

export const QuestionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<QuestionsListParams>({
    page: 1,
    limit: 25,
  });
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<Question | null>(null);
  const [showImportDialog, setShowImportDialog] = React.useState(false);

  // Debounced search
  const debouncedSearchTerm = React.useMemo(() => {
    const handler = setTimeout(() => searchTerm, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Apply search to filters
  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1,
    }));
  }, [searchTerm]);

  // Queries
  const { data: questionsResponse, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionsApi.list(filters),
  });

  const { data: topicsResponse, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: questionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) =>
      questionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: questionsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => questionsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setSelectedRows({});
    },
  });

  // Data
  const questions = questionsResponse?.data?.questions || [];
  const topics = topicsResponse?.data || [];
  const isLoading = questionsLoading || topicsLoading;

  // Handlers
  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setShowDrawer(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowDrawer(true);
  };

  const handleViewQuestion = (question: Question) => {
    // TODO: Implement view-only drawer or modal
    console.log('View question:', question);
  };

  const handleDeleteQuestion = (question: Question) => {
    setShowDeleteConfirm(question);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteMutation.mutateAsync(showDeleteConfirm.id!);
      setShowDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async (questions: Question[]) => {
    const ids = questions.map(q => q.id!);
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleSubmitForm = async (data: QuestionFormData) => {
    if (editingQuestion) {
      await updateMutation.mutateAsync({
        id: editingQuestion.id!,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleFilterChange = (key: keyof QuestionsListParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 25,
    });
  };

  const hasActiveFilters = !!(filters.topicId || filters.type || filters.level || searchTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage questions for practice sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImportDialog(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Topic Filter */}
          <select
            value={filters.topicId || ''}
            onChange={(e) => handleFilterChange('topicId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All types</option>
            {Object.values(QuestionType).map((type) => (
              <option key={type} value={type}>
                {questionTypeLabels[type]}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={filters.level || ''}
            onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All levels</option>
            {Object.values(DifficultyLevel).map((level) => (
              <option key={level} value={level}>
                {difficultyLevelLabels[level]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <QuestionsTable
        data={questions}
        loading={isLoading}
        onEdit={handleEditQuestion}
        onView={handleViewQuestion}
        onDelete={handleDeleteQuestion}
        onBulkDelete={handleBulkDelete}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Form Drawer */}
      <QuestionFormDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        question={editingQuestion}
        topics={topics}
        onSubmit={handleSubmitForm}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Question
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this question? This action cannot be undone.
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {showDeleteConfirm.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {deleteMutation.isPending && (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      <AdminImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['questions'] });
        }}
      />
    </div>
  );
};