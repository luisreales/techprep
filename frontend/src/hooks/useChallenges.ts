import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';
import {
  challengeApi,
  challengeAdminApi,
  challengeQueryKeys,
  challengeApiDefaults,
  challengeApiUtils,
  type ChallengeListParams,
} from '@/services/challengeApi';
import type {
  ChallengeListItem,
  ChallengeDetail,
  ChallengeCreate,
  ChallengeUpdate,
  ChallengeAttempt,
  ChallengeAttemptCreate,
  ChallengeFilters,
  Tag,
  TagCreate,
  TagUpdate,
} from '@/types/challenges';

// Query hooks for fetching data
export const useChallenges = (params: ChallengeListParams = {}) => {
  const queryParams = { ...challengeApiDefaults, ...params };
  
  return useQuery({
    queryKey: challengeQueryKeys.list(queryParams),
    queryFn: async () => {
      const response = await challengeApi.list(queryParams);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch challenges');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useChallenge = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: challengeQueryKeys.detail(id),
    queryFn: async () => {
      const response = await challengeApi.get(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch challenge');
      }
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUserAttempts = () => {
  return useQuery({
    queryKey: challengeQueryKeys.userAttempts(),
    queryFn: async () => {
      const response = await challengeApi.getUserAttempts();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attempts');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLatestAttempt = (challengeId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: challengeQueryKeys.latestAttempt(challengeId),
    queryFn: async () => {
      const response = await challengeApi.getLatestAttempt(challengeId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch latest attempt');
      }
      return response.data;
    },
    enabled: enabled && !!challengeId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry if no attempt exists
  });
};

// Admin query hooks
export const useChallengesAdmin = (params: ChallengeListParams = {}) => {
  const queryParams = { ...challengeApiDefaults, ...params };
  
  return useQuery({
    queryKey: ['admin', ...challengeQueryKeys.list(queryParams)],
    queryFn: async () => {
      const response = await challengeAdminApi.list(queryParams);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch challenges');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useChallengeAdmin = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin', ...challengeQueryKeys.detail(id)],
    queryFn: async () => {
      const response = await challengeAdminApi.get(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch challenge');
      }
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: challengeQueryKeys.tags(),
    queryFn: async () => {
      const response = await challengeAdminApi.tags.list();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tags');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation hooks for data modification
export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      payload,
    }: {
      challengeId: number;
      payload: ChallengeAttemptCreate;
    }) => {
      const response = await challengeApi.submitAttempt(challengeId, payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit attempt');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the attempts cache
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.userAttempts() });
      queryClient.invalidateQueries({ 
        queryKey: challengeQueryKeys.latestAttempt(variables.challengeId) 
      });
      
      // Show success message
      if (data.markedSolved) {
        toast.success('Challenge completed successfully!');
      } else {
        toast.success('Attempt submitted successfully');
      }
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

// Admin mutation hooks
export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChallengeCreate) => {
      // Validate before sending
      const errors = challengeApiUtils.validateChallengeCreate(payload);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await challengeAdminApi.create(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create challenge');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch challenges list
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', ...challengeQueryKeys.lists()] });
      
      toast.success(`Challenge "${data.title}" created successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

export const useUpdateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ChallengeUpdate;
    }) => {
      // Validate before sending
      const errors = challengeApiUtils.validateChallengeUpdate(payload);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await challengeAdminApi.update(id, payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update challenge');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific challenge in cache
      queryClient.setQueryData(challengeQueryKeys.detail(variables.id), data);
      queryClient.setQueryData(['admin', ...challengeQueryKeys.detail(variables.id)], data);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', ...challengeQueryKeys.lists()] });
      
      toast.success(`Challenge "${data.title}" updated successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

export const useDeleteChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await challengeAdminApi.remove(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete challenge');
      }
      return { id, message: response.message };
    },
    onSuccess: (data) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: challengeQueryKeys.detail(data.id) });
      queryClient.removeQueries({ queryKey: ['admin', ...challengeQueryKeys.detail(data.id)] });
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', ...challengeQueryKeys.lists()] });
      
      toast.success('Challenge deleted successfully');
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

export const useBulkDeleteChallenges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await challengeAdminApi.bulkDelete(ids);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete challenges');
      }
      return { ids, message: response.message };
    },
    onSuccess: (data) => {
      // Remove all deleted challenges from cache
      data.ids.forEach(id => {
        queryClient.removeQueries({ queryKey: challengeQueryKeys.detail(id) });
        queryClient.removeQueries({ queryKey: ['admin', ...challengeQueryKeys.detail(id)] });
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', ...challengeQueryKeys.lists()] });
      
      toast.success(`${data.ids.length} challenges deleted successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

// Tag management mutations
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TagCreate) => {
      if (!payload.name?.trim()) {
        throw new Error('Tag name is required');
      }

      const response = await challengeAdminApi.tags.create(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create tag');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Add to tags cache optimistically
      queryClient.setQueryData<Tag[]>(challengeQueryKeys.tags(), (old = []) => {
        return [...old, data];
      });
      
      toast.success(`Tag "${data.name}" created successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TagUpdate;
    }) => {
      if (!payload.name?.trim()) {
        throw new Error('Tag name is required');
      }

      const response = await challengeAdminApi.tags.update(id, payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update tag');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update tag in cache optimistically
      queryClient.setQueryData<Tag[]>(challengeQueryKeys.tags(), (old = []) => {
        return old.map(tag => (tag.id === variables.id ? data : tag));
      });
      
      toast.success(`Tag "${data.name}" updated successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await challengeAdminApi.tags.remove(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete tag');
      }
      return { id, message: response.message };
    },
    onSuccess: (data) => {
      // Remove from tags cache optimistically
      queryClient.setQueryData<Tag[]>(challengeQueryKeys.tags(), (old = []) => {
        return old.filter(tag => tag.id !== data.id);
      });
      
      // Invalidate challenge lists as tags might have changed
      queryClient.invalidateQueries({ queryKey: challengeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', ...challengeQueryKeys.lists()] });
      
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

// Export challenges mutation
export const useExportChallenges = () => {
  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const blob = await challengeAdminApi.export(ids);
      return blob;
    },
    onSuccess: (blob, ids) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ids && ids.length > 0 
        ? `challenges-selected-${new Date().toISOString().split('T')[0]}.xlsx`
        : `challenges-all-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const count = ids ? ids.length : 'all';
      toast.success(`Exported ${count} challenges successfully`);
    },
    onError: (error) => {
      const message = challengeApiUtils.handleError(error);
      toast.error(message);
    },
  });
};

// Custom hooks for common use cases
export const useChallengeProgress = () => {
  const { data: attempts = [] } = useUserAttempts();
  
  return {
    hasAttempted: (challengeId: number) => challengeApiUtils.hasAttempted(attempts, challengeId),
    getBestScore: (challengeId: number) => challengeApiUtils.getBestScore(attempts, challengeId),
    isCompleted: (challengeId: number) => challengeApiUtils.isCompleted(attempts, challengeId),
    totalAttempts: attempts.length,
    completedChallenges: attempts.filter(attempt => attempt.markedSolved).length,
  };
};

export const useChallengeFilters = () => {
  const { data: tags = [] } = useTags();
  
  return {
    availableTags: tags,
    buildFilterParams: challengeApiUtils.buildParams,
  };
};

// Hook for optimistic updates when submitting attempts
export const useOptimisticAttempt = () => {
  const queryClient = useQueryClient();

  const updateOptimistically = (challengeId: number, attempt: Partial<ChallengeAttempt>) => {
    // Update latest attempt optimistically
    queryClient.setQueryData<ChallengeAttempt>(
      challengeQueryKeys.latestAttempt(challengeId),
      (old) => ({
        id: attempt.id || 'temp-' + Date.now(),
        challengeId,
        startedAt: attempt.startedAt || new Date().toISOString(),
        ...old,
        ...attempt,
      })
    );

    // Update user attempts list optimistically
    queryClient.setQueryData<ChallengeAttempt[]>(
      challengeQueryKeys.userAttempts(),
      (old = []) => {
        const filteredOld = old.filter(a => a.challengeId !== challengeId);
        return [
          ...filteredOld,
          {
            id: attempt.id || 'temp-' + Date.now(),
            challengeId,
            startedAt: attempt.startedAt || new Date().toISOString(),
            ...attempt,
          } as ChallengeAttempt,
        ];
      }
    );
  };

  return { updateOptimistically };
};
