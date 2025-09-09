import { ApiResponse } from '../types/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: data.message || response.statusText,
            details: data,
          },
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
          details: error,
        },
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Topic endpoints
  async getTopics() {
    return this.request('/topics');
  }

  async getActiveTopics() {
    return this.request('/topics/active');
  }

  async getTopicById(id: number) {
    return this.request(`/topics/${id}`);
  }

  async createTopic(data: { name: string; description?: string }) {
    return this.request('/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTopic(id: number, data: { name: string; description?: string }) {
    return this.request(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTopic(id: number) {
    return this.request(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  // Question endpoints
  async getQuestions(filters?: {
    topicId?: number;
    type?: string;
    level?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString();
    return this.request(`/questions${query ? `?${query}` : ''}`);
  }

  async getQuestionById(id: string) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(data: any) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: string, data: any) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Interview Session endpoints
  async startSession(data: {
    topicId: number;
    mode: string;
    questionCount: number;
  }) {
    return this.request('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSession(id: string) {
    return this.request(`/sessions/${id}`);
  }

  async submitAnswer(sessionId: string, data: {
    questionId: string;
    writtenAnswer?: string;
    selectedOptionIds: string[];
  }) {
    return this.request(`/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finishSession(id: string) {
    return this.request(`/sessions/${id}/finish`, {
      method: 'POST',
    });
  }

  async getUserSessions(userId?: string) {
    return this.request(`/sessions${userId ? `?userId=${userId}` : ''}`);
  }

  // File upload endpoints
  async uploadExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/import/excel', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;