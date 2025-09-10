import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Resource } from '@/types';

export const useResourcesQuery = (params?: { topicId?: number }) =>
  useQuery({
    queryKey: ['resources', params],
    queryFn: async (): Promise<Resource[]> => {
      const res = await apiClient.getResources(params);
      return res.data ?? [];
    },
    staleTime: 1000 * 60,
  });
