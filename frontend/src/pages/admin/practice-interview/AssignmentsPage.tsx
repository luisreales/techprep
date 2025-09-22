import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import {
  useAssignments,
  useDeleteAssignment,
  useTemplates,
  useGroups
} from '@/hooks/usePracticeInterview';
import { TemplateKind, VisibilityType } from '@/types/practiceInterview';

const PAGE_SIZE = 10;

const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [templateFilter, setTemplateFilter] = useState<number | ''>('');
  const [groupFilter, setGroupFilter] = useState<number | ''>('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityType | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data, isLoading, error } = useAssignments({
    page,
    pageSize: PAGE_SIZE,
    templateId: templateFilter || undefined,
    groupId: groupFilter || undefined
  });
  const { data: templatesResponse } = useTemplates({ page: 1, pageSize: 100 });
  const { data: groupsResponse } = useGroups(1, 100);
  const deleteAssignment = useDeleteAssignment();

  const templates = templatesResponse?.data?.data ?? [];
  const groups = groupsResponse?.data?.data ?? [];

  useEffect(() => {
    setPage(1);
  }, [templateFilter, groupFilter, visibilityFilter, searchTerm]);

  const assignments = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesVisibility = !visibilityFilter || assignment.visibility === visibilityFilter;
      const matchesSearch = searchTerm
        ? assignment.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesVisibility && matchesSearch;
    });
  }, [assignments, visibilityFilter, searchTerm]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteAssignment.mutateAsync(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const renderTarget = (assignment: (typeof assignments)[number]) => {
    if (assignment.visibility === VisibilityType.Public) {
      return 'All Students';
    }
    if (assignment.visibility === VisibilityType.Group) {
      return assignment.groupName ? `Group: ${assignment.groupName}` : 'Group';
    }
    if (assignment.visibility === VisibilityType.Private) {
      return assignment.userName ? `User: ${assignment.userName}` : assignment.userId;
    }
    return assignment.visibility;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Manage who can access each practice or interview template.</p>
        </div>
        <Link
          to="/admin/practice-interview/assignments/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Templates</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.kind === TemplateKind.Practice ? 'Practice' : 'Interview'})
                </option>
              ))}
            </select>
          </div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as VisibilityType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Visibility</option>
            <option value={VisibilityType.Public}>Public</option>
            <option value={VisibilityType.Group}>Group</option>
            <option value={VisibilityType.Private}>Private</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load assignments: {error.message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No assignments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Window</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.templateName}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {assignment.templateKind === TemplateKind.Practice ? 'Practice' : 'Interview'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.visibility}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderTarget(assignment)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.startsAt ? new Date(assignment.startsAt).toLocaleString() : '—'}
                      {assignment.endsAt ? ` → ${new Date(assignment.endsAt).toLocaleString()}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.maxAttempts ?? 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/practice-interview/assignments/${assignment.id}/edit`)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(assignment.id)}
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, pagination.totalItems)} of {pagination.totalItems} assignments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">Page {page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Assignment</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this assignment? Users will immediately lose access.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteAssignment.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAssignment.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
