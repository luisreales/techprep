import { http } from '@/utils/axios';

export interface Topic {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicsListResponse {
  success: boolean;
  data: Topic[];
  message: string;
}

export const topicsApi = {
  list: async (): Promise<TopicsListResponse> => {
    const response = await http.get('/topics');
    return response.data;
  },
};