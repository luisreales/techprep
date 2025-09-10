import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Topic } from '@/types';

export const useTopicsQuery = () =>
  useQuery({
    queryKey: ['topics'],
    queryFn: async (): Promise<Topic[]> => {
      const res = await apiClient.getTopics();
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
