import { useQuery } from '@tanstack/react-query';
import type { PracticeRelatedResource } from '@/types/practice';

// Mock implementation - you can replace with actual API call
const getMockResources = async (questionId: string): Promise<PracticeRelatedResource[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return [
    {
      id: '1',
      title: 'Official Documentation',
      url: 'https://docs.example.com',
      type: 'documentation',
      description: 'Comprehensive guide to this topic',
      difficulty: 'Intermediate',
    },
    {
      id: '2',
      title: 'Video Tutorial',
      url: 'https://youtube.com/watch?v=example',
      type: 'video',
      description: 'Step-by-step video explanation',
      difficulty: 'Basic',
    },
  ];
};

export const usePracticeQuestionResources = (questionId: string | null) => {
  return useQuery({
    queryKey: ['practiceQuestionResources', questionId],
    queryFn: () => getMockResources(questionId!),
    enabled: !!questionId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });
};