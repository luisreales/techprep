import { useQuery } from '@tanstack/react-query';
import { usePracticeModuleStore } from '@/stores/practiceModuleStore';
import PracticeModuleApi from '@/services/practiceModuleApi';

export const usePracticeQuestions = () => {
  const {
    topicIds,
    difficulties,
    questionTypes,
    searchTerm,
    page,
    limit,
  } = usePracticeModuleStore();

  return useQuery({
    queryKey: [
      'practiceQuestions',
      {
        topicIds,
        difficulties,
        questionTypes,
        searchTerm,
        page,
        limit,
      },
    ],
    queryFn: () =>
      PracticeModuleApi.getQuestions({
        topicIds: topicIds.length > 0 ? topicIds : undefined,
        difficulties: difficulties.length > 0 ? difficulties : undefined,
        questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
        search: searchTerm || undefined,
        page,
        limit,
        includeAttemptStats: true,
      }),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};