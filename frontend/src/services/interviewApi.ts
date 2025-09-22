import { api } from './api';
import {
  InterviewSessionDto,
  StartInterviewDto,
  SubmitAnswerDto,
  AuditEventDto,
  CertificateDto,
  UserCreditsDto,
  CreditTopUpDto,
  CreditLedgerDto,
  PaginatedResponse,
  ApiResponse
} from '@/types/practiceInterview';

export const interviewApi = {
  // Start a new interview session
  async startInterview(data: StartInterviewDto) {
    const response = await api.post<ApiResponse<InterviewSessionDto>>('/interview/start', data);
    return response.data;
  },

  // Submit an answer during interview
  async submitAnswer(sessionId: string, data: SubmitAnswerDto) {
    const response = await api.post<ApiResponse<object>>(
      `/interview/sessions/${sessionId}/answers`,
      data
    );
    return response.data;
  },

  // Submit/complete the interview session
  async submitInterview(sessionId: string) {
    const response = await api.post<ApiResponse<InterviewSessionDto>>(
      `/interview/sessions/${sessionId}/submit`
    );
    return response.data;
  },

  // Get current interview session
  async getSession(sessionId: string) {
    const response = await api.get<ApiResponse<InterviewSessionDto>>(
      `/interview/sessions/${sessionId}`
    );
    return response.data;
  },

  // Get user's interview sessions history
  async getMySessions(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<InterviewSessionDto>>>(
      `/interview/my-sessions?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  // Record audit event (focus loss, tab switch, etc.)
  async recordAuditEvent(sessionId: string, data: AuditEventDto) {
    const response = await api.post<ApiResponse<object>>(
      `/interview/sessions/${sessionId}/audit`,
      data
    );
    return response.data;
  },

  // Get certificate for completed interview
  async getCertificate(sessionId: string) {
    const response = await api.get<ApiResponse<CertificateDto>>(
      `/interview/sessions/${sessionId}/certificate`
    );
    return response.data;
  }
};

export const creditsApi = {
  // Get user's credit information
  async getUserCredits() {
    const response = await api.get<ApiResponse<UserCreditsDto>>('/credits');
    return response.data;
  },

  // Add credits to user account
  async addCredits(data: CreditTopUpDto) {
    const response = await api.post<ApiResponse<object>>('/credits/add', data);
    return response.data;
  },

  // Check if user has sufficient credits
  async checkSufficientCredits(requiredCredits: number) {
    const response = await api.get<ApiResponse<boolean>>(
      `/credits/check?required=${requiredCredits}`
    );
    return response.data;
  },

  // Get credit transaction history
  async getCreditHistory(page = 1, pageSize = 10) {
    const response = await api.get<ApiResponse<PaginatedResponse<CreditLedgerDto>>>(
      `/credits/history?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  }
};

export { interviewApi as default };
