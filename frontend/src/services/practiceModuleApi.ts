import { api } from '@/services/api';
import type {
  PracticeQuestion,
  PracticeQuestionFilters,
  PaginatedPracticeQuestions,
  PracticeProgress,
  PracticeAttempt,
  PracticeStats,
} from '@/types/practice';

export interface PracticeQuestionQueryParams {
  topicIds?: number[];
  difficulties?: string[];
  questionTypes?: string[];
  search?: string;
  page?: number;
  limit?: number;
  includeAttemptStats?: boolean;
  onlyBookmarked?: boolean;
  onlyUnattempted?: boolean;
}

export interface SubmitPracticeAttemptRequest {
  questionId: string;
  selectedOptionIds?: string[];
  givenText?: string;
  timeSpent: number; // in milliseconds
}

export interface SubmitPracticeAttemptResponse {
  isCorrect: boolean;
  matchPercentage?: number;
  correctAnswer?: string;
  explanation?: string;
  timeSpent: number;
}

export class PracticeModuleApi {
  // Get practice questions with filters and pagination
  static async getQuestions(
    params: PracticeQuestionQueryParams = {}
  ): Promise<PaginatedPracticeQuestions> {
    const queryParams = new URLSearchParams();

    if (params.topicIds?.length) {
      queryParams.append('topicIds', params.topicIds.join(','));
    }
    if (params.difficulties?.length) {
      queryParams.append('difficulties', params.difficulties.join(','));
    }
    if (params.questionTypes?.length) {
      queryParams.append('questionTypes', params.questionTypes.join(','));
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.includeAttemptStats !== undefined) {
      queryParams.append('includeAttemptStats', params.includeAttemptStats.toString());
    }
    if (params.onlyBookmarked) {
      queryParams.append('onlyBookmarked', 'true');
    }
    if (params.onlyUnattempted) {
      queryParams.append('onlyUnattempted', 'true');
    }

    const response = await api.get(`/practice/questions?${queryParams.toString()}`);
    return response.data.data;
  }

  // Get a single question with full details
  static async getQuestion(questionId: string): Promise<PracticeQuestion> {
    debugger
    const response = await api.get(`/practice/questions/${questionId}`);
    return response.data.data;
  }

  // Submit a practice attempt
  static async submitAttempt(
    request: SubmitPracticeAttemptRequest
  ): Promise<SubmitPracticeAttemptResponse> {
    // Convert frontend format to backend format
    let answer = '';
    if (request.selectedOptionIds?.length) {
      answer = request.selectedOptionIds.join(',');
    } else if (request.givenText) {
      answer = request.givenText;
    }

    const response = await api.post(`/practice/questions/${request.questionId}/attempt`, {
      answer,
      timeSpent: request.timeSpent,
    });
    return response.data.data;
  }

  // Get user's practice progress summary
  static async getProgress(): Promise<PracticeProgress> {
    const response = await api.get('/practice/progress');
    return response.data.data;
  }

  // Get detailed practice statistics
  static async getStats(): Promise<PracticeStats> {
    const response = await api.get('/practice/stats');
    return response.data.data;
  }

  // Toggle bookmark for a question
  static async toggleBookmark(questionId: string): Promise<{ isBookmarked: boolean }> {
    const response = await api.post(`/practice/bookmark/${questionId}`);
    return response.data.data;
  }

  // Get user's practice attempts for a question
  static async getQuestionAttempts(questionId: string): Promise<PracticeAttempt[]> {
    const response = await api.get(`/practice/questions/${questionId}/attempts`);
    return response.data.data;
  }

  // Get user's recent practice attempts
  static async getRecentAttempts(limit: number = 10): Promise<PracticeAttempt[]> {
    const response = await api.get(`/practice/attempts/recent?limit=${limit}`);
    return response.data.data;
  }

  // Get practice recommendations based on performance
  static async getRecommendations(): Promise<{
    weakTopics: Array<{ topicId: number; topicName: string; questionCount: number }>;
    suggestedQuestions: PracticeQuestion[];
  }> {
    const response = await api.get('/practice/recommendations');
    return response.data.data;
  }

  // Get session review data
  static async getSessionReview(sessionId: string): Promise<any> {
    const response = await api.get(`/practice/${sessionId}/review`);
    return response.data.data;
  }
}

export default PracticeModuleApi;