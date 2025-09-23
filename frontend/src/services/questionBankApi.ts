import { ApiResponse } from '@/types/api';
import { api } from './api';

// Enhanced Question Bank Types
export interface QuestionCategory {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  subcategories?: QuestionCategory[];
  isActive: boolean;
}

export interface QuestionDifficulty {
  id: number;
  name: string;
  level: number;
  description?: string;
  color: string;
}

export interface QuestionTag {
  id: number;
  name: string;
  color: string;
  category?: string;
}

export interface QuestionSource {
  id: number;
  name: string;
  url?: string;
  type: 'book' | 'article' | 'video' | 'documentation' | 'course' | 'other';
  credibility: number; // 1-5 rating
}

export interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  averageScore: number;
  averageTimeSpent: number;
  difficultyRating: number;
  lastUsed?: string;
}

export interface EnhancedQuestion {
  id: string;
  topicId: number;
  topicName?: string;
  text: string;
  type: 'single_choice' | 'multi_choice' | 'written';
  level: 'basic' | 'intermediate' | 'advanced';

  // Enhanced fields
  categories: QuestionCategory[];
  difficulty: QuestionDifficulty;
  tags: QuestionTag[];
  sources: QuestionSource[];

  // Metadata
  estimatedTimeMinutes: number;
  bloomsTaxonomy: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  cognitiveLoad: 'low' | 'medium' | 'high';
  prerequisites: string[];
  learningObjectives: string[];

  // Content
  options?: QuestionOption[];
  officialAnswer: string;
  explanations: QuestionExplanation[];
  hints: string[];

  // Analytics
  stats: QuestionStats;

  // Administrative
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
  version: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
  explanation?: string;
}

export interface QuestionExplanation {
  id: string;
  content: string;
  type: 'correct_answer' | 'why_wrong' | 'concept_explanation' | 'approach_hint';
  targetOptionId?: string;
}

export interface QuestionFilters {
  categories?: number[];
  difficulties?: number[];
  tags?: number[];
  types?: string[];
  levels?: string[];
  bloomsTaxonomy?: string[];
  cognitiveLoad?: string[];
  isVerified?: boolean;
  timeRange?: [number, number]; // [min, max] in minutes
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface QuestionBankStats {
  totalQuestions: number;
  byType: Record<string, number>;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  averageDifficulty: number;
  verificationRate: number;
  recentlyAdded: number;
  needsReview: number;
}

// API Functions
export const questionBankApi = {
  // Questions
  async getQuestions(filters?: QuestionFilters): Promise<ApiResponse<{ questions: EnhancedQuestion[]; totalCount: number }>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/admin/questions?${params.toString()}`);
    return response.data;
  },

  async getQuestion(id: string): Promise<ApiResponse<EnhancedQuestion>> {
    const response = await api.get(`/admin/questions/${id}`);
    return response.data;
  },

  async createQuestion(question: Partial<EnhancedQuestion>): Promise<ApiResponse<EnhancedQuestion>> {
    const response = await api.post('/admin/questions', question);
    return response.data;
  },

  async updateQuestion(id: string, question: Partial<EnhancedQuestion>): Promise<ApiResponse<EnhancedQuestion>> {
    const response = await api.put(`/admin/questions/${id}`, question);
    return response.data;
  },

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/admin/questions/${id}`);
    return response.data;
  },

  async duplicateQuestion(id: string): Promise<ApiResponse<EnhancedQuestion>> {
    const response = await api.post(`/admin/questions/${id}/duplicate`);
    return response.data;
  },

  async bulkUpdateQuestions(questionIds: string[], updates: Partial<EnhancedQuestion>): Promise<ApiResponse<void>> {
    const response = await api.patch('/admin/questions/bulk', { questionIds, updates });
    return response.data;
  },

  // Categories
  async getCategories(): Promise<ApiResponse<QuestionCategory[]>> {
    return api.get('/questions/categories');
  },

  async createCategory(category: Partial<QuestionCategory>): Promise<ApiResponse<QuestionCategory>> {
    return api.post('/questions/categories', category);
  },

  async updateCategory(id: number, category: Partial<QuestionCategory>): Promise<ApiResponse<QuestionCategory>> {
    return api.put(`/questions/categories/${id}`, category);
  },

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/questions/categories/${id}`);
  },

  // Difficulties
  async getDifficulties(): Promise<ApiResponse<QuestionDifficulty[]>> {
    return api.get('/questions/difficulties');
  },

  // Tags
  async getTags(): Promise<ApiResponse<QuestionTag[]>> {
    return api.get('/questions/tags');
  },

  async createTag(tag: Partial<QuestionTag>): Promise<ApiResponse<QuestionTag>> {
    return api.post('/questions/tags', tag);
  },

  async updateTag(id: number, tag: Partial<QuestionTag>): Promise<ApiResponse<QuestionTag>> {
    return api.put(`/questions/tags/${id}`, tag);
  },

  async deleteTag(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/questions/tags/${id}`);
  },

  // Sources
  async getSources(): Promise<ApiResponse<QuestionSource[]>> {
    return api.get('/questions/sources');
  },

  async createSource(source: Partial<QuestionSource>): Promise<ApiResponse<QuestionSource>> {
    return api.post('/questions/sources', source);
  },

  // Analytics
  async getQuestionBankStats(): Promise<ApiResponse<QuestionBankStats>> {
    const response = await api.get('/questions/stats');
    return response.data;
  },

  async getQuestionAnalytics(id: string, dateRange?: { from: string; to: string }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }
    const response = await api.get(`/questions/${id}/analytics?${params.toString()}`);
    return response.data;
  },

  // Import/Export
  async importQuestions(file: File, options?: {
    categoryId?: number;
    skipDuplicates?: boolean;
    autoTag?: boolean;
  }): Promise<ApiResponse<{ imported: number; skipped: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    return api.post('/admin/imports/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async exportQuestions(filters?: QuestionFilters, format: 'json' | 'excel' | 'csv' = 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`/admin/questions/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Validation
  async validateQuestion(question: Partial<EnhancedQuestion>): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    return api.post('/questions/validate', question);
  },

  async checkDuplicates(questionText: string): Promise<ApiResponse<{ duplicates: EnhancedQuestion[] }>> {
    return api.post('/questions/check-duplicates', { text: questionText });
  }
};
