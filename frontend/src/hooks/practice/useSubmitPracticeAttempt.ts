import { useMutation, useQueryClient } from '@tanstack/react-query';
import PracticeModuleApi, { SubmitPracticeAttemptRequest } from '@/services/practiceModuleApi';

export const useSubmitPracticeAttempt = (questionId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitPracticeAttemptRequest) => {
      // Use the provided questionId if request doesn't have one
      const requestWithId = {
        ...request,
        questionId: request.questionId || questionId || '',
      };
      return PracticeModuleApi.submitAttempt(requestWithId);
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['practiceQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['practiceQuestion', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['practiceProgress'] });
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] });
      queryClient.invalidateQueries({ queryKey: ['practiceAttempts', variables.questionId] });
    },
  });
};