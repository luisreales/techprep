import { useQuery } from '@tanstack/react-query';
import PracticeModuleApi from '@/services/practiceModuleApi';

export const usePracticeQuestionDetail = (questionId: string | null) => {
  return useQuery({
    queryKey: ['practiceQuestion', questionId],
    queryFn: () => PracticeModuleApi.getQuestion(questionId!),
    enabled: !!questionId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};