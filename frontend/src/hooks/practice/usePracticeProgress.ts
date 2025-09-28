import { useQuery } from '@tanstack/react-query';
import PracticeModuleApi from '@/services/practiceModuleApi';

export const usePracticeProgress = () => {
  return useQuery({
    queryKey: ['practiceProgress'],
    queryFn: () => PracticeModuleApi.getProgress(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};