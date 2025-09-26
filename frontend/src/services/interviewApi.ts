import { http } from '@/utils/axios';

export interface StartInterviewRequest {
  assignmentId: number;
}

export interface StartInterviewResponse {
  interviewSessionId: string;
}

export interface RunnerQuestionDto {
  questionId: string;
  type: 'single' | 'multiple' | 'written';
  text: string;
  options?: Array<{ id: string; text: string }>;
  topic: string;
  level: string;
  index: number;
  total: number;
}

export interface RunnerStateDto {
  interviewSessionId: string;
  currentQuestionIndex: number;
  totalItems: number;
  questions: RunnerQuestionDto[];
}

export interface SubmitItem {
  questionId: string;
  type: 'single' | 'multiple' | 'written';
  optionIds?: string[];
  text?: string;
  timeMs: number;
}

export interface SubmitInterviewRequest {
  questions: SubmitItem[];
}

export interface SummarySlice {
  key: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface InterviewSummaryDto {
  interviewSessionId: string;
  startedAt: string;
  submittedAt: string;
  totalItems: number;
  correctCount: number;
  incorrectCount: number;
  totalTimeSec: number;
  byTopic: SummarySlice[];
  byType: SummarySlice[];
  byLevel: SummarySlice[];
}

export interface RetakeResponse {
  newInterviewSessionId: string;
  numberAttemps: number;
}

export interface ReviewQuestion {
  questionId: string;
  questionText: string;
  type: string;
  givenText?: string;
  selectedOptions: string[];
  isCorrect: boolean;
  matchPercent?: number;
  timeMs: number;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
}

export interface ReviewResponse {
  sessionId: string;
  questions: ReviewQuestion[];
}

export const interviewApi = {
  start: async (assignmentId: number): Promise<StartInterviewResponse> => {
    debugger
    const response = await http.post<StartInterviewResponse>('/interviews/sessions', { assignmentId });
    return response.data;
  },

  getRunner: async (sessionId: string): Promise<RunnerStateDto> => {
    const response = await http.get<RunnerStateDto>(`/interviews/sessions/${sessionId}/runner`);
    return response.data;
  },

  submit: async (
    sessionId: string,
    payload: SubmitInterviewRequest
  ): Promise<InterviewSummaryDto> => {
    const response = await http.post<InterviewSummaryDto>(
      `/interviews/sessions/${sessionId}/submit`,
      payload
    );
    return response.data;
  },

  summary: async (sessionId: string): Promise<InterviewSummaryDto> => {
    const response = await http.get<InterviewSummaryDto>(`/interviews/sessions/${sessionId}/summary`);
    return response.data;
  },

  retake: async (sessionId: string): Promise<RetakeResponse> => {
    const response = await http.post<RetakeResponse>(`/interviews/sessions/${sessionId}/retake`, {});
    return response.data;
  },

  review: async (sessionId: string): Promise<ReviewResponse> => {
    const response = await http.get<ReviewResponse>(`/interviews/sessions/${sessionId}/review`);
    return response.data;
  },
};
