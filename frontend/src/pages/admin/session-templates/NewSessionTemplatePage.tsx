import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SessionTemplateForm } from './SessionTemplateForm';
import { adminSessionTemplatesApi } from '@/services/admin/sessionTemplatesApi';
import { sessionTemplatesQueryKeys } from '@/hooks/useSessionTemplates';

export const NewSessionTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Session Template</h1>
          <p className="text-gray-600 mt-1">Define the base settings. You can refine questions/challenges later.</p>
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
          onSubmit={async (values) => {
            try {
              const res = await adminSessionTemplatesApi.createSessionTemplate(values);
              await queryClient.invalidateQueries({ queryKey: sessionTemplatesQueryKeys.lists() });
              navigate('/admin/session-templates');
            } catch (e: any) {
              const msg = e?.response?.data?.message || e?.message || 'Failed to create template';
              alert(msg);
            }
          }}
          submitLabel="Create"
        />
      </div>
    </div>
  );
};

export default NewSessionTemplatePage;
