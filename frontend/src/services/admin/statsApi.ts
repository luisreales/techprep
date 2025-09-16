import { http } from '@/utils/axios';

export interface AdminStats {
  users: number;
  questions: number;
  topics: number;
  sessions: number;
  sessionTemplates: number;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
  message?: string;
}

export const adminStatsApi = {
  async get(): Promise<AdminStats> {
    const response = await http.get<AdminStatsResponse>('/admin/stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to load admin stats');
    }
    return response.data.data;
  },
};

