import { useQuery } from '@tanstack/react-query';
import { adminSessionTemplatesApi, type SessionTemplateFilters } from '@/services/admin/sessionTemplatesApi';

export const sessionTemplatesQueryKeys = {
  all: ['admin', 'session-templates'] as const,
  lists: () => [...sessionTemplatesQueryKeys.all, 'list'] as const,
  list: (filters: SessionTemplateFilters) => [...sessionTemplatesQueryKeys.lists(), filters] as const,
};

export const useSessionTemplatesList = (filters: SessionTemplateFilters = {}) => {
  return useQuery({
    queryKey: sessionTemplatesQueryKeys.list(filters),
    queryFn: () => adminSessionTemplatesApi.getSessionTemplates(filters),
    keepPreviousData: true,
  });
};

