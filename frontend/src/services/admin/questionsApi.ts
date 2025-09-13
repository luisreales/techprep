import { http } from '@/utils/axios';
import { Question } from '@/schemas/questionSchema';

export interface QuestionsListParams {
  page?: number;
  limit?: number;
  topicId?: number;
  type?: 'single_choice' | 'multi_choice' | 'written';
  level?: 'basic' | 'intermediate' | 'advanced';
  search?: string;
}

export interface QuestionsListResponse {
  success: boolean;
  data: {
    questions: Question[];
    total: number;
    page: number;
    totalPages: number;
  };
  message: string;
}

export interface QuestionResponse {
  success: boolean;
  data: Question;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const questionsApi = {
  list: async (params?: QuestionsListParams): Promise<QuestionsListResponse> => {
    const response = await http.get('/admin/questions', { params });
    return response.data;
  },

  get: async (id: string): Promise<QuestionResponse> => {
    const response = await http.get(`/admin/questions/${id}`);
    return response.data;
  },

  create: async (payload: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionResponse> => {
    const response = await http.post('/admin/questions', payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<Question>): Promise<QuestionResponse> => {
    const response = await http.put(`/admin/questions/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<DeleteResponse> => {
    const response = await http.delete(`/admin/questions/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]): Promise<DeleteResponse> => {
    const response = await http.delete('/admin/questions/bulk', { data: { ids } });
    return response.data;
  },

  export: async (ids?: string[]): Promise<Blob> => {
    const response = await http.post('/admin/questions/export', 
      { ids }, 
      { responseType: 'blob' }
    );
    return response.data;
  },
};