import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  AlertCircle,
  Trash2,
  RotateCcw,
  X,
  Eye
} from 'lucide-react';
import { type RowSelectionState } from '@tanstack/react-table';
import { 
  useChallengesAdmin, 
  useCreateChallenge, 
  useUpdateChallenge, 
  useDeleteChallenge,
  useBulkDeleteChallenges,
  useExportChallenges,
  useTags
} from '@/hooks/useChallenges';
import type { ChallengeListParams, ChallengeListItem, ChallengeDetail, ChallengeCreate, ChallengeUpdate } from '@/types/challenges';
import { ChallengesTable } from './ChallengesTable';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import { DifficultyBadge } from '@/components/challenges/DifficultyBadge';
import { LanguageBadge } from '@/components/challenges/LanguageBadge';
import { TagBadge } from '@/components/challenges/TagBadge';

export const ChallengesPage: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<ChallengeListParams>({
    page: 1,
    pageSize: 25,
  });
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});
  const [showForm, setShowForm] = React.useState(false);
  const [editingChallenge, setEditingChallenge] = React.useState<ChallengeDetail | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<ChallengeListItem | null>(null);
  const [viewingChallenge, setViewingChallenge] = React.useState<ChallengeListItem | null>(null);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1,
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries
  const { data: challengesResponse, isLoading: challengesLoading } = useChallengesAdmin(filters);
  const { data: availableTags } = useTags();

  // Mutations
  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge();
  const deleteChallenge = useDeleteChallenge();
  const bulkDeleteChallenges = useBulkDeleteChallenges();
  const exportChallenges = useExportChallenges();

  // Data
  const challenges = challengesResponse?.challenges || [];
  const pagination = challengesResponse?.pagination;

  // Handlers
  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setShowForm(true);
  };

  const handleEditChallenge = (challenge: ChallengeListItem) => {
    // Convert list item to detail for editing
    const challengeDetail: ChallengeDetail = {
      ...challenge,
      prompt: '', // Will be loaded from API
      hasSolution: challenge.hasSolution,
      officialSolution: undefined,
      testsJson: undefined,
      topics: [], // Will be loaded from API
      topicIds: [],
    };
    setEditingChallenge(challengeDetail);
    setShowForm(true);
  };

  const handleViewChallenge = (challenge: ChallengeListItem) => {
    setViewingChallenge(challenge);
  };

  const handleDeleteChallenge = (challenge: ChallengeListItem) => {
    setShowDeleteConfirm(challenge);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteChallenge.mutateAsync(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async (challenges: ChallengeListItem[]) => {
    const ids = challenges.map(c => c.id);
    await bulkDeleteChallenges.mutateAsync(ids);
    setSelectedRows({});
  };

  const handleSubmitForm = async (data: ChallengeCreate | ChallengeUpdate) => {
    if (editingChallenge) {
      await updateChallenge.mutateAsync({
        id: editingChallenge.id,
        payload: data as ChallengeUpdate,
      });
    } else {
      await createChallenge.mutateAsync(data as ChallengeCreate);
    }
    setShowForm(false);
  };

  const handleFilterChange = (key: keyof ChallengeListParams, value: any) => {
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
      pageSize: 25,
    });
  };

  const handleExportSelected = () => {
    const selectedIds = Object.keys(selectedRows).map(index => challenges[parseInt(index)]?.id).filter(Boolean);
    exportChallenges.mutate(selectedIds.length > 0 ? selectedIds : undefined);
  };

  const hasActiveFilters = !!(filters.language || filters.difficulty || filters.hasSolution !== undefined || searchTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Challenges Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage coding challenges for users to practice with
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportSelected}
            disabled={exportChallenges.isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportChallenges.isPending ? 'Exporting...' : 'Export'}
          </button>
          <button
            onClick={handleCreateChallenge}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Challenge
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
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Language Filter */}
          <select
            value={filters.language || ''}
            onChange={(e) => handleFilterChange('language', e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All languages</option>
            <option value="1">C#</option>
            <option value="2">JavaScript</option>
            <option value="3">TypeScript</option>
            <option value="4">Python</option>
            <option value="5">Java</option>
            <option value="6">Go</option>
            <option value="7">Rust</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All difficulties</option>
            <option value="1">Basic</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>

          {/* Has Solution Filter */}
          <select
            value={filters.hasSolution === true ? 'true' : filters.hasSolution === false ? 'false' : ''}
            onChange={(e) => handleFilterChange('hasSolution', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All challenges</option>
            <option value="true">With solution</option>
            <option value="false">Without solution</option>
          </select>
        </div>
      </div>

      {/* Challenges Table */}
      <ChallengesTable
        data={challenges}
        loading={challengesLoading}
        onEdit={handleEditChallenge}
        onView={handleViewChallenge}
        onDelete={handleDeleteChallenge}
        onBulkDelete={handleBulkDelete}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Challenge Form */}
      <ChallengeForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        challenge={editingChallenge}
        onSubmit={handleSubmitForm}
        availableTags={availableTags}
        loading={createChallenge.isPending || updateChallenge.isPending}
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
                    Delete Challenge
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this challenge? This action cannot be undone.
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {showDeleteConfirm.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <LanguageBadge language={showDeleteConfirm.language} />
                        <DifficultyBadge difficulty={showDeleteConfirm.difficulty} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteChallenge.isPending}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {deleteChallenge.isPending && (
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

      {/* View Challenge Modal */}
      {viewingChallenge && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">View Challenge</h3>
                <button
                  onClick={() => setViewingChallenge(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {viewingChallenge.title}
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <LanguageBadge language={viewingChallenge.language} />
                    <DifficultyBadge difficulty={viewingChallenge.difficulty} />
                    {viewingChallenge.hasSolution && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Has Solution
                      </span>
                    )}
                  </div>
                  
                  {viewingChallenge.tags && viewingChallenge.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {viewingChallenge.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(viewingChallenge.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => {
                      handleEditChallenge(viewingChallenge);
                      setViewingChallenge(null);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Edit Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};