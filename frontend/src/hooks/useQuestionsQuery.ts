import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Question } from '@/types';

interface Params {
  topicId?: number;
  level?: string;
  type?: string;
}

export const useQuestionsQuery = (params: Params) =>
  useQuery({
    queryKey: ['questions', params],
    queryFn: async (): Promise<Question[]> => {
      const res = await apiClient.getQuestions(params);
      return res.data ?? [];
    },
    enabled: Boolean(params.topicId),
    staleTime: 1000 * 60,
  });
