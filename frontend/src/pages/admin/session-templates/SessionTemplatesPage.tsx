import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSessionTemplatesList, sessionTemplatesQueryKeys } from '@/hooks/useSessionTemplates';
import { adminSessionTemplatesApi, type SessionTemplateFilters } from '@/services/admin/sessionTemplatesApi';
import { useQueryClient } from '@tanstack/react-query';

export const SessionTemplatesPage: React.FC = () => {
  const [filters, setFilters] = useState<SessionTemplateFilters>({ page: 1, pageSize: 20 });
  const debounced = useMemo(() => filters, [filters]);
  const { data, isLoading, error } = useSessionTemplatesList(debounced);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (confirmDeleteId != null) {
      await adminSessionTemplatesApi.deleteSessionTemplate(confirmDeleteId);
      setConfirmDeleteId(null);
      await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Session Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage session templates for practice and interviews</p>
        </div>
        <div className="w-full sm:w-auto">
          <Link
            to="/admin/session-templates/new"
            className="inline-flex items-center justify-center w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            New Template
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load templates: {error.message}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : !data?.templates?.length ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No templates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-end p-4" />
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.templates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">{t.mode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.totalItems}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/session-templates/${t.id}/preview`)}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/session-templates/${t.id}/edit`)}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            await adminSessionTemplatesApi.duplicateSessionTemplate(t.id);
                            await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
                          }}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Duplicate
                        </button>
                        {t.status !== 'published' ? (
                          <button
                            onClick={async () => {
                              try {
                                setBusyId(t.id);
                                await adminSessionTemplatesApi.publishSessionTemplate(t.id);
                                await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
                              } catch (e: any) {
                                alert(e?.response?.data?.message || 'Failed to publish');
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            disabled={busyId === t.id}
                            className="px-3 py-1.5 rounded-md border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            {busyId === t.id ? 'Publishing…' : 'Publish'}
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                setBusyId(t.id);
                                await adminSessionTemplatesApi.unpublishSessionTemplate(t.id);
                                await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
                              } catch (e: any) {
                                alert(e?.response?.data?.message || 'Failed to set draft');
                              } finally {
                                setBusyId(null);
                              }
                            }}
                            disabled={busyId === t.id}
                            className="px-3 py-1.5 rounded-md border border-yellow-600 text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                          >
                            {busyId === t.id ? 'Updating…' : 'Set Draft'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-3 py-1.5 rounded-md border border-red-600 text-red-700 hover:bg-red-50"
                        >
                          Delete
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
      {confirmDeleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this session template? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-md border border-red-600 text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTemplatesPage;
