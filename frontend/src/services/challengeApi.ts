import { http } from '@/utils/axios';
import { ApiResponse } from '@/types/api';
import {
  ChallengeListItem,
  ChallengeDetail,
  ChallengeCreate,
  ChallengeUpdate,
  ChallengeAttempt,
  ChallengeAttemptCreate,
  ChallengeFilters,
  ChallengePagination,
  ChallengesResponse,
  ChallengeResponse,
  Tag,
  TagCreate,
  TagUpdate,
} from '@/types/challenges';

// Request/Response interfaces for API consistency
export interface ChallengeListParams extends ChallengeFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'difficulty' | 'language' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ChallengeListResponse {
  success: boolean;
  data: {
    challenges: ChallengeListItem[];
    pagination: ChallengePagination;
  };
  message: string;
}

export interface ChallengeDetailResponse {
  success: boolean;
  data: ChallengeDetail;
  message: string;
}

export interface ChallengeAttemptResponse {
  success: boolean;
  data: ChallengeAttempt;
  message: string;
}

export interface ChallengeAttemptsResponse {
  success: boolean;
  data: ChallengeAttempt[];
  message: string;
}

export interface TagsResponse {
  success: boolean;
  data: Tag[];
  message: string;
}

export interface TagResponse {
  success: boolean;
  data: Tag;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// Public API (no authentication required for basic challenge access)
export const challengeApi = {
  // Public endpoints - list challenges without solutions
  list: async (params?: ChallengeListParams): Promise<ChallengeListResponse> => {
    const response = await http.get('/code-challenges', { params });
    return response.data;
  },

  // Get challenge details without solution
  get: async (id: number): Promise<ChallengeDetailResponse> => {
    const response = await http.get(`/code-challenges/${id}`);
    return response.data;
  },

  // Submit attempt for a challenge
  submitAttempt: async (
    challengeId: number,
    payload: ChallengeAttemptCreate
  ): Promise<ChallengeAttemptResponse> => {
    const response = await http.post(`/code-challenges/${challengeId}/attempts`, payload);
    return response.data;
  },

  // Get user's attempts for all challenges
  getUserAttempts: async (): Promise<ChallengeAttemptsResponse> => {
    const response = await http.get('/code-challenges/attempts');
    return response.data;
  },

  // Get user's latest attempt for a specific challenge
  getLatestAttempt: async (challengeId: number): Promise<ChallengeAttemptResponse> => {
    const response = await http.get(`/code-challenges/${challengeId}/attempts/latest`);
    return response.data;
  },
};

// Admin API (requires admin authentication)
export const challengeAdminApi = {
  // Admin CRUD operations
  list: async (params?: ChallengeListParams): Promise<ChallengeListResponse> => {
    const response = await http.get('/admin/code-challenges', { params });
    return response.data;
  },

  get: async (id: number): Promise<ChallengeDetailResponse> => {
    const response = await http.get(`/admin/code-challenges/${id}`);
    return response.data;
  },

  create: async (payload: ChallengeCreate): Promise<ChallengeDetailResponse> => {
    const response = await http.post('/admin/code-challenges', payload);
    return response.data;
  },

  update: async (id: number, payload: ChallengeUpdate): Promise<ChallengeDetailResponse> => {
    const response = await http.put(`/admin/code-challenges/${id}`, payload);
    return response.data;
  },

  remove: async (id: number): Promise<DeleteResponse> => {
    const response = await http.delete(`/admin/code-challenges/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkDelete: async (ids: number[]): Promise<DeleteResponse> => {
    const response = await http.delete('/admin/code-challenges/bulk', { data: { ids } });
    return response.data;
  },

  // Export challenges
  export: async (ids?: number[]): Promise<Blob> => {
    const response = await http.post(
      '/admin/code-challenges/export',
      { ids },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Tag management
  tags: {
    list: async (): Promise<TagsResponse> => {
      const response = await http.get('/admin/code-challenges/tags');
      return response.data;
    },

    create: async (payload: TagCreate): Promise<TagResponse> => {
      const response = await http.post('/admin/code-challenges/tags', payload);
      return response.data;
    },

    update: async (id: number, payload: TagUpdate): Promise<TagResponse> => {
      const response = await http.put(`/admin/code-challenges/tags/${id}`, payload);
      return response.data;
    },

    remove: async (id: number): Promise<DeleteResponse> => {
      const response = await http.delete(`/admin/code-challenges/tags/${id}`);
      return response.data;
    },
  },

  // Statistics and analytics
  getStats: async () => {
    const response = await http.get('/admin/code-challenges/stats');
    return response.data;
  },

  // Get challenge usage analytics
  getAnalytics: async (challengeId: number, dateRange?: { start: string; end: string }) => {
    const response = await http.get(`/admin/code-challenges/${challengeId}/analytics`, {
      params: dateRange,
    });
    return response.data;
  },
};

// Utility functions for API calls
export const challengeApiUtils = {
  // Build query parameters for filtering
  buildParams: (filters: ChallengeFilters, pagination?: { page: number; pageSize: number }) => {
    const params: Record<string, unknown> = {};

    if (filters.language) params.language = filters.language;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    if (filters.search) params.search = filters.search;
    if (filters.hasSolution !== undefined) params.hasSolution = filters.hasSolution;
    if (filters.topicIds && filters.topicIds.length > 0) params.topicIds = filters.topicIds.join(',');

    if (pagination) {
      params.page = pagination.page;
      params.pageSize = pagination.pageSize;
    }

    return params;
  },

  // Handle API errors consistently
  handleError: (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return axiosError.response?.data?.message || 'An error occurred';
    }
    return 'Network error occurred';
  },

  // Validate challenge data before API calls
  validateChallengeCreate: (data: ChallengeCreate): string[] => {
    const errors: string[] = [];

    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.language?.trim()) errors.push('Language is required');
    if (!data.difficulty?.trim()) errors.push('Difficulty is required');
    if (!data.prompt?.trim()) errors.push('Prompt is required');

    // Validate test JSON if provided
    if (data.testsJson) {
      try {
        JSON.parse(data.testsJson);
      } catch {
        errors.push('Invalid test JSON format');
      }
    }

    return errors;
  },

  validateChallengeUpdate: (data: ChallengeUpdate): string[] => {
    return challengeApiUtils.validateChallengeCreate(data as ChallengeCreate);
  },

  // Format challenge data for display
  formatChallengeForDisplay: (challenge: ChallengeDetail | ChallengeListItem) => {
    return {
      ...challenge,
      formattedCreatedAt: new Date(challenge.createdAt).toLocaleDateString(),
      difficultyLabel: challenge.difficulty,
      languageLabel: challenge.language,
    };
  },

  // Check if user has attempted a challenge
  hasAttempted: (attempts: ChallengeAttempt[], challengeId: number): boolean => {
    return attempts.some(attempt => attempt.challengeId === challengeId);
  },

  // Get best score for a challenge
  getBestScore: (attempts: ChallengeAttempt[], challengeId: number): number | undefined => {
    const challengeAttempts = attempts.filter(attempt => attempt.challengeId === challengeId);
    if (challengeAttempts.length === 0) return undefined;

    return Math.max(...challengeAttempts.map(attempt => attempt.score || 0));
  },

  // Get completion status
  isCompleted: (attempts: ChallengeAttempt[], challengeId: number): boolean => {
    return attempts.some(
      attempt => attempt.challengeId === challengeId && attempt.markedSolved === true
    );
  },
};

// Query keys for TanStack Query
export const challengeQueryKeys = {
  all: ['challenges'] as const,
  lists: () => [...challengeQueryKeys.all, 'list'] as const,
  list: (params: ChallengeListParams) => [...challengeQueryKeys.lists(), params] as const,
  details: () => [...challengeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...challengeQueryKeys.details(), id] as const,
  attempts: () => [...challengeQueryKeys.all, 'attempts'] as const,
  userAttempts: () => [...challengeQueryKeys.attempts(), 'user'] as const,
  challengeAttempts: (challengeId: number) => [...challengeQueryKeys.attempts(), challengeId] as const,
  latestAttempt: (challengeId: number) => [...challengeQueryKeys.challengeAttempts(challengeId), 'latest'] as const,
  tags: () => [...challengeQueryKeys.all, 'tags'] as const,
  stats: () => [...challengeQueryKeys.all, 'stats'] as const,
  analytics: (challengeId: number) => [...challengeQueryKeys.all, 'analytics', challengeId] as const,
} as const;

// Default values for API calls
export const challengeApiDefaults = {
  pagination: {
    page: 1,
    pageSize: 20,
  },
  filters: {},
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
} as const;