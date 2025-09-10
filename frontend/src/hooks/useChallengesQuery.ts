import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { CodeChallenge } from '@/types';

export const useChallengesQuery = () =>
  useQuery({
    queryKey: ['challenges'],
    queryFn: async (): Promise<CodeChallenge[]> => {
      const res = await apiClient.getChallenges();
      return res.data ?? [];
    },
    staleTime: 1000 * 60,
  });
