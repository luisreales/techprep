import { http } from '@/utils/axios';
import { ApiResponse } from '@/types/api';
import type {
  Topic,
  Question,
  Session,
  SessionAnswer,
  CodeChallenge,
  Resource,
} from '@/types';

export const apiClient = {
  setToken(token: string | null) {
    if (token) {
      http.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete http.defaults.headers.common.Authorization;
    }
  },

  // Auth
  async login(email: string, password: string) {
    const { data } = await http.post<ApiResponse>("/auth/login", { email, password });
    return data;
  },
  async register(user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const { data } = await http.post<ApiResponse>("/auth/register", user);
    return data;
  },
  async refreshToken(refreshToken: string) {
    const { data } = await http.post<ApiResponse>("/auth/refresh", { refreshToken });
    return data;
  },
  async forgotPassword(email: string) {
    const { data } = await http.post<ApiResponse>("/auth/forgot-password", { email });
    return data;
  },
  async resetPassword(token: string, password: string) {
    const { data } = await http.post<ApiResponse>("/auth/reset-password", { token, password });
    return data;
  },

  // Topics
  async getTopics() {
    const { data } = await http.get<ApiResponse<Topic[]>>('/topics');
    return data;
  },

  // Questions
  async getQuestions(params?: {
    topicId?: number;
    level?: string;
    type?: string;
  }) {
    const { data } = await http.get<ApiResponse<Question[]>>('/questions', { params });
    return data;
  },

  // Sessions
  async startSession(payload: { topicId: number; mode: string; questionCount: number }) {
    const { data } = await http.post<ApiResponse<Session>>('/sessions', payload);
    return data;
  },
  async submitAnswer(sessionId: string, answer: SessionAnswer) {
    const { data } = await http.post<ApiResponse>(`/sessions/${sessionId}/answers`, answer);
    return data;
  },
  async getSessionSummary(sessionId: string) {
    const { data } = await http.get<ApiResponse<Session>>(`/sessions/${sessionId}/summary`);
    return data;
  },

  // Import
  async importQuestions(file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await http.post<ApiResponse>(
      '/imports/questions/excel',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  // Extras
  async getChallenges() {
    const { data } = await http.get<ApiResponse<CodeChallenge[]>>('/codechallenges');
    return data;
  },
  async getResources(params?: { topicId?: number }) {
    const { data } = await http.get<ApiResponse<Resource[]>>('/resources', { params });
    return data;
  },
};
