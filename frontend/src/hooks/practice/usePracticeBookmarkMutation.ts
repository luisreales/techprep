import { useMutation, useQueryClient } from '@tanstack/react-query';
import PracticeModuleApi from '@/services/practiceModuleApi';

export const usePracticeBookmarkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => PracticeModuleApi.toggleBookmark(questionId),
    onSuccess: (data, questionId) => {
      // Update the specific question's bookmark status
      queryClient.setQueryData(['practiceQuestion', questionId], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            isBookmarked: data.isBookmarked,
          };
        }
        return oldData;
      });

      // Invalidate questions list to refresh bookmark status
      queryClient.invalidateQueries({ queryKey: ['practiceQuestions'] });
    },
  });
};