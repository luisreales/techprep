import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SessionTemplateForm } from './SessionTemplateForm';
import { adminSessionTemplatesApi } from '@/services/admin/sessionTemplatesApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionTemplatesQueryKeys } from '@/hooks/useSessionTemplates';

export const EditSessionTemplatePage: React.FC = () => {
  const { id } = useParams();
  const templateId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'session-templates', 'detail', templateId],
    queryFn: () => adminSessionTemplatesApi.getSessionTemplate(templateId),
    enabled: !!templateId,
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error || !data) {
    return <div className="p-6">Failed to load template.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Session Template</h1>
          <p className="text-gray-600 mt-1">Update the base settings.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/session-templates')}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SessionTemplateForm
          initial={data}
          onSubmit={async (values) => {
            await adminSessionTemplatesApi.updateSessionTemplate(templateId, values);
            await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: ['admin','session-templates','detail', templateId] });
            navigate('/admin/session-templates');
          }}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
};

export default EditSessionTemplatePage;
