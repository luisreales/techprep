import { http } from '@/utils/axios';
import { ApiResponse } from '@/types/api';

// Types for Session Templates
export interface SessionTemplateListItem {
  id: number;
  name: string;
  mode: 'study' | 'interview';
  status: 'draft' | 'published';
  timeLimitMin?: number;
  totalItems: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionTemplateDetail {
  id: number;
  name: string;
  mode: 'study' | 'interview';
  topics: number[];
  levels: string[];
  randomOrder: boolean;
  timeLimitMin?: number;
  thresholdWritten: number;
  status: 'draft' | 'published';
  questions: QuestionsConfig;
  challenges: ChallengesConfig;
  createdAt: string;
  updatedAt?: string;
  items: SessionTemplateItem[];
}

export interface QuestionsConfig {
  selection: 'auto' | 'manual';
  auto?: AutoQuestionsConfig;
  manualIds: string[];
}

export interface AutoQuestionsConfig {
  single: number;
  multi: number;
  written: number;
  byLevel: Record<string, number>;
}

export interface ChallengesConfig {
  selection: 'auto' | 'manual';
  auto?: AutoChallengesConfig;
  manualIds: number[];
}

export interface AutoChallengesConfig {
  total: number;
  byLevel: Record<string, number>;
  languages: string[];
}

export interface SessionTemplateItem {
  id: number;
  itemType: 'question' | 'challenge';
  itemId: string;
  orderIndex: number;
}

export interface SessionTemplateCreateDto {
  name: string;
  mode: 'study' | 'interview';
  topics: number[];
  levels: string[];
  randomOrder: boolean;
  timeLimitMin?: number;
  thresholdWritten: number;
  questions: QuestionsConfig;
  challenges: ChallengesConfig;
  status: 'draft' | 'published';
}

export interface SessionTemplateUpdateDto {
  name: string;
  mode: 'study' | 'interview';
  topics: number[];
  levels: string[];
  randomOrder: boolean;
  timeLimitMin?: number;
  thresholdWritten: number;
  questions: QuestionsConfig;
  challenges: ChallengesConfig;
  status: 'draft' | 'published';
}

export interface SessionTemplateFilters {
  q?: string;
  status?: 'draft' | 'published';
  mode?: 'study' | 'interview';
  page?: number;
  pageSize?: number;
}

interface SessionTemplatesListResponse {
  templates: SessionTemplateListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const adminSessionTemplatesApi = {
  // List session templates with filters and pagination
  async getSessionTemplates(filters: SessionTemplateFilters = {}): Promise<SessionTemplatesListResponse> {
    const params = new URLSearchParams();
    
    if (filters.q) params.append('q', filters.q);
    if (filters.status) params.append('status', filters.status);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await http.get<ApiResponse<SessionTemplatesListResponse>>(
      `/admin/session-templates?${params.toString()}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch session templates');
    }
    
    return response.data.data;
  },

  // Get session template by ID
  async getSessionTemplate(id: number): Promise<SessionTemplateDetail> {
    const response = await http.get<ApiResponse<SessionTemplateDetail>>(`/admin/session-templates/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch session template');
    }
    
    return response.data.data;
  },

  // Create new session template
  async createSessionTemplate(dto: SessionTemplateCreateDto): Promise<SessionTemplateDetail> {
    const response = await http.post<ApiResponse<SessionTemplateDetail>>('/admin/session-templates', dto);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create session template');
    }
    
    return response.data.data;
  },

  // Update session template
  async updateSessionTemplate(id: number, dto: SessionTemplateUpdateDto): Promise<SessionTemplateDetail> {
    const response = await http.put<ApiResponse<SessionTemplateDetail>>(`/admin/session-templates/${id}`, dto);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update session template');
    }
    
    return response.data.data;
  },

  // Publish session template
  async publishSessionTemplate(id: number): Promise<SessionTemplateDetail> {
    const response = await http.post<ApiResponse<SessionTemplateDetail>>(`/admin/session-templates/${id}/publish`, {});
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to publish session template');
    }
    
    return response.data.data;
  },

  // Unpublish session template
  async unpublishSessionTemplate(id: number): Promise<void> {
    const response = await http.post<ApiResponse<void>>(`/admin/session-templates/${id}/unpublish`, {});
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to set draft');
    }
  },

  // Duplicate session template
  async duplicateSessionTemplate(id: number): Promise<SessionTemplateDetail> {
    const response = await http.post<ApiResponse<SessionTemplateDetail>>(`/admin/session-templates/${id}/duplicate`, {});
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to duplicate session template');
    }
    
    return response.data.data;
  },

  // Delete session template
  async deleteSessionTemplate(id: number): Promise<void> {
    const response = await http.delete<ApiResponse<void>>(`/admin/session-templates/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete session template');
    }
  }
};
