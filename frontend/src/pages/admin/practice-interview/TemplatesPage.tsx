import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Copy, Trash2, Play, Clock } from 'lucide-react';
import { useTemplates, useDeleteTemplate, useCloneTemplate } from '@/hooks/usePracticeInterview';
import { TemplateKind, VisibilityType } from '@/types/practiceInterview';

export const TemplatesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKind, setSelectedKind] = useState<TemplateKind | ''>('');
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityType | ''>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, error } = useTemplates({ page, pageSize: 10, kind: selectedKind });
  const deleteTemplateMutation = useDeleteTemplate();
  const cloneTemplateMutation = useCloneTemplate();

  const handleDelete = async () => {
    if (confirmDeleteId) {
      try {
        await deleteTemplateMutation.mutateAsync(confirmDeleteId);
        setConfirmDeleteId(null);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleClone = async (id: number, name: string) => {
    try {
      await cloneTemplateMutation.mutateAsync({ id, name: `${name} (Copy)` });
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const templates = data?.data?.data ?? [];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = !selectedVisibility || template.visibilityDefault === selectedVisibility;
    return matchesSearch && matchesVisibility;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Templates</h1>
          <p className="text-gray-600 mt-1">
            Create and manage templates for practice sessions and interviews
          </p>
        </div>
        <Link
          to="/admin/practice-interview/templates/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedKind}
            onChange={(e) => {
              setSelectedKind(e.target.value as TemplateKind | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value={TemplateKind.Practice}>Practice</option>
            <option value={TemplateKind.Interview}>Interview</option>
          </select>
          <select
            value={selectedVisibility}
            onChange={(e) => {
              setSelectedVisibility(e.target.value as VisibilityType | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Visibility</option>
            <option value={VisibilityType.Public}>Public</option>
            <option value={VisibilityType.Group}>Group</option>
            <option value={VisibilityType.Private}>Private</option>
          </select>
          <div className="flex justify-end">
            <button
            onClick={() => {
              setSearchTerm('');
              setSelectedKind('');
              setSelectedVisibility('');
              setPage(1);
            }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load templates: {error.message}</p>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm || selectedKind || selectedVisibility
                ? 'No templates match your filters'
                : 'No templates found'}
            </p>
            {!searchTerm && !selectedKind && !selectedVisibility && (
              <Link
                to="/admin/practice-interview/templates/new"
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create your first template
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">ID: {template.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.kind === TemplateKind.Practice
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {template.kind === TemplateKind.Practice && <Play className="w-3 h-3 mr-1" />}
                        {template.kind === TemplateKind.Interview && <Clock className="w-3 h-3 mr-1" />}
                        {template.kind}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.visibilityDefault === VisibilityType.Public
                          ? 'bg-blue-100 text-blue-800'
                          : template.visibilityDefault === VisibilityType.Group
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.visibilityDefault}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>
                          Timer: {template.timers.totalSec ? `${Math.round(template.timers.totalSec / 60)} min total` : 'No limit'}
                        </div>
                        <div>
                          Per question: {template.timers.perQuestionSec ? `${Math.round(template.timers.perQuestionSec / 60)} min` : 'No limit'}
                        </div>
                        <div>
                          Singles / Multi / Written: {template.selection.countSingle} / {template.selection.countMulti} / {template.selection.countWritten}
                        </div>
                        <div>
                          Topics: {template.selection.byTopics.length > 0 ? template.selection.byTopics.join(', ') : 'Any'}
                        </div>
                        <div>
                          Levels: {template.selection.levels.length > 0 ? template.selection.levels.join(', ') : 'Any'}
                        </div>
                        <div>Cost: {template.credits.interviewCost} credits</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/practice-interview/templates/${template.id}/preview`)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/practice-interview/templates/${template.id}/edit`)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleClone(template.id, template.name)}
                          disabled={cloneTemplateMutation.isPending}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                          title="Clone"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(template.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Pagination */}
      {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.data.pagination.totalItems)} of{' '}
            {data.data.pagination.totalItems} templates
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {data.data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.data.pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this template? This action cannot be undone and will affect any existing assignments using this template.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTemplateMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteTemplateMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
