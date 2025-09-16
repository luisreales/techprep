import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminSessionTemplatesApi } from '@/services/admin/sessionTemplatesApi';

export const PreviewSessionTemplatePage: React.FC = () => {
  const { id } = useParams();
  const templateId = Number(id);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'session-templates', 'detail', templateId],
    queryFn: () => adminSessionTemplatesApi.getSessionTemplate(templateId),
    enabled: !!templateId,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !data) return <div className="p-6">Failed to load template.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preview: {data.name}</h1>
        <p className="text-gray-600 mt-1">Mode: {data.mode} • Status: {data.status}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">General</h2>
          <div className="text-gray-700 text-sm mt-2">
            <div>Random Order: {data.randomOrder ? 'Yes' : 'No'}</div>
            <div>Time Limit: {data.timeLimitMin ?? 'None'}</div>
            <div>Written Threshold: {data.thresholdWritten}%</div>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Items</h2>
          <div className="text-gray-700 text-sm mt-2">
            <div>Total Items: {data.items.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSessionTemplatePage;
