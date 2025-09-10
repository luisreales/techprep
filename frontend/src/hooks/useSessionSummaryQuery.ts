import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Session } from '@/types';

export const useSessionSummaryQuery = (sessionId: string) =>
  useQuery({
    queryKey: ['session-summary', sessionId],
    queryFn: async (): Promise<Session> => {
      const res = await apiClient.getSessionSummary(sessionId);
      return res.data as Session;
    },
    enabled: Boolean(sessionId),
  });
