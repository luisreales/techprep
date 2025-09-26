import { http } from '@/utils/axios';
import type { ApiResponse } from '@/types/api';
import type {
  InterviewSessionDto,
  StartInterviewDto,
  SubmitAnswerDto
} from '@/types/practiceInterview';

// Types for the Evaluation Engine
export interface AnswerSubmission {
  questionId: string;
  answerType: 'single_choice' | 'multi_choice' | 'written';
  text?: string;
  options?: string[];
  timeMs: number;
}

export interface AnswerResult {
  accepted: boolean;
  isCorrect?: boolean;
  matchPercent?: number;
  explanation?: string;
  resources?: ResourceInfo[];
}

export interface ResourceInfo {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface SessionSummary {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  totalTimeMs: number;
  startedAt: string;
  finishedAt?: string;
  topicStats: TopicStats[];
  questions?: QuestionSummary[];
}

export interface TopicStats {
  topicId: number;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface QuestionSummary {
  questionId: string;
  questionText: string;
  isCorrect: boolean;
  matchPercent?: number;
  userAnswer: string;
  officialAnswer: string;
  explanation: string;
  resources: ResourceInfo[];
}

export const sessionsApi = {
  // Interview-specific methods
  async startInterview(startDto: StartInterviewDto) {
    const { data } = await http.post<ApiResponse<InterviewSessionDto>>(
      '/interview/start',
      startDto
    );
    return data;
  },

  async startInterviewFromTemplate(templateId: number) {
    try {
      // Use the simplified endpoint that handles assignment creation internally
      const { data } = await http.post<ApiResponse<{ sessionId: string }>>(
        '/interview-sessions/from-template',
        {
          templateId: templateId,
          name: `Direct Interview - Template ${templateId}`,
          description: 'Direct interview session from template'
        }
      );

      if (data.success && data.data) {
        // Get the session details using the new endpoint
        const sessionDetailsResponse = await http.get<ApiResponse<any>>(
          `/interview-sessions/${data.data.sessionId}`
        );

        if (sessionDetailsResponse.data.success && sessionDetailsResponse.data.data) {
          const session = sessionDetailsResponse.data.data;
          // Map the response to match the expected frontend structure
          return {
            success: true,
            data: {
              id: session.id,
              assignmentId: session.assignmentId,
              assignmentName: session.assignment?.template?.name || 'Interview Session',
              status: session.status,
              currentQuestionIndex: session.currentQuestionIndex,
              startedAt: session.startedAt,
              answers: [],
              certificateIssued: false
            },
            message: 'Interview session created successfully'
          };
        } else {
          throw new Error('Failed to retrieve session details');
        }
      } else {
        throw new Error(data.message || 'Failed to start interview');
      }
    } catch (error: any) {
      console.error('Failed to start interview from template:', error);

      // Return error in consistent format
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to start interview'
      };
    }
  },

  async getInterviewSession(sessionId: string) {
    const { data } = await http.get<ApiResponse<InterviewSessionDto>>(
      `/interview/${sessionId}`
    );
    return data;
  },

  async submitInterviewAnswer(sessionId: string, answer: AnswerSubmission) {
    const { data } = await http.post<ApiResponse<AnswerResult>>(
      `/interview-sessions/${sessionId}/answers`,
      answer
    );
    return data;
  },

  async submitInterview(sessionId: string) {
    const { data } = await http.post<ApiResponse<InterviewSessionDto>>(
      `/interview-sessions/${sessionId}/finish`
    );
    return data;
  },

  // Get interview session summary
  async getInterviewSummary(sessionId: string) {
    const { data } = await http.get<ApiResponse<SessionSummary>>(
      `/interview-sessions/${sessionId}/summary`
    );
    return data;
  },

  // Interview session methods
  async createInterviewSession(payload: {
    assignmentId: number;
  }) {
    const { data } = await http.post<ApiResponse<{ sessionId: string }>>(
      '/interview-sessions',
      payload
    );
    return data;
  },

  // Practice session methods
  async createPracticeSession(payload: {
    topicId?: number;
    level?: string;
    questionCount: number;
    assignmentId?: number;
  }) {
    const { data } = await http.post<ApiResponse<{ sessionId: string; questionCount: number; questions: any[] }>>(
      '/practice-sessions',
      payload
    );
    return data;
  },

  async submitInterviewAnswerNew(sessionId: string, answer: AnswerSubmission) {
    const { data } = await http.post<ApiResponse<AnswerResult>>(
      `/interview-sessions/${sessionId}/answers`,
      answer
    );
    return data;
  },

  async submitPracticeAnswer(sessionId: string, answer: AnswerSubmission) {
    const { data } = await http.post<ApiResponse<AnswerResult>>(
      `/practice-sessions/${sessionId}/answers`,
      answer
    );
    return data;
  },

  async finishInterviewSession(sessionId: string) {
    const { data } = await http.post<ApiResponse>(`/interview-sessions/${sessionId}/finish`);
    return data;
  },

  async finishPracticeSession(sessionId: string) {
    const { data } = await http.post<ApiResponse>(`/practice-sessions/${sessionId}/finish`);
    return data;
  },

  async getPracticeSessionSummary(sessionId: string) {
    const { data } = await http.get<ApiResponse<SessionSummary>>(`/practice-sessions/${sessionId}/summary`);
    return data;
  },

  // Get current interview session details (when form opens)
  async getInterviewSessionDetails(sessionId: string) {
    const { data } = await http.get<ApiResponse<any>>(`/interview-sessions/${sessionId}`);
    return data;
  },

  // Get current practice session details (when form opens)
  async getPracticeSessionDetails(sessionId: string) {
    const { data } = await http.get<ApiResponse<any>>(`/practice-sessions/${sessionId}`);
    return data;
  },
};