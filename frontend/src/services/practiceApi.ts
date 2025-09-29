import { api } from './api';
import {
  PracticeSessionDto,
  StartPracticeDto,
  StartDirectPracticeDto,
  SubmitAnswerDto,
  SessionStateDto,
  PracticeAnswerDto,
  PaginatedResponse,
  ApiResponse
} from '@/types/practiceInterview';

export const practiceApi = {
  // Start a new practice session
  async startPractice(data: StartPracticeDto) {
    const response = await api.post<ApiResponse<PracticeSessionDto>>('/practice/start', data);
    return response.data;
  },

  // Start a direct practice session
  async startDirectPractice(data: StartDirectPracticeDto) {
    const response = await api.post<any>('/practice/start-direct', data);
    return response.data;
  },

  // Submit an answer during practice
  async submitAnswer(sessionId: string, data: SubmitAnswerDto) {
    const response = await api.post<ApiResponse<PracticeAnswerDto>>(
      `/practice/${sessionId}/answer`,
      data
    );
    return response.data;
  },

  // Update session state (current question, etc.)
  async updateSessionState(sessionId: string, data: SessionStateDto) {
    const response = await api.patch<ApiResponse<object>>(
      `/practice/${sessionId}/state`,
      data
    );
    return response.data;
  },

  // Submit/complete the practice session
  async submitPractice(sessionId: string) {
    const response = await api.post<ApiResponse<PracticeSessionDto>>(
      `/practice/${sessionId}/submit`
    );
    return response.data;
  },

  // Get current practice session
  async getSession(sessionId: string) {
    const response = await api.get<ApiResponse<PracticeSessionDto>>(
      `/practice/${sessionId}`
    );
    return response.data;
  },

  // Get user's practice sessions history
  async getMySessions(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<PracticeSessionDto>>>(
      `/practice/my-sessions?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Pause a practice session
  async pauseSession(sessionId: string) {
    const response = await api.post<ApiResponse<PracticeSessionDto>>(
      `/practice/${sessionId}/pause`
    );
    return response.data;
  },

  // Resume a paused practice session
  async resumeSession(sessionId: string) {
    const response = await api.post<ApiResponse<PracticeSessionDto>>(
      `/practice/${sessionId}/resume`
    );
    return response.data;
  },

  // Get practice sessions (filtered for InProgress and Completed only)
  async getPracticeSessions(topicId?: number, status?: string) {
    const params = new URLSearchParams();
    if (topicId) params.append('topicId', topicId.toString());
    if (status) params.append('status', status);

    const response = await api.get<any>(`/practice/sessions?${params.toString()}`);
    return response.data;
  },

  // Complete a practice session
  async completeSession(sessionId: string) {
    const response = await api.post<any>(`/practice/${sessionId}/complete`);
    return response.data;
  },

  // Update session progress
  async updateSessionProgress(sessionId: string, currentQuestionIndex: number) {
    const response = await api.post<any>(`/practice/${sessionId}/update-progress`, {
      currentQuestionIndex
    });
    return response.data;
  }
};

export default practiceApi;
