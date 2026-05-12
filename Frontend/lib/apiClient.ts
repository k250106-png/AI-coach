/**
 * Centralized API client for backend communication
 * Handles authentication, error handling, and rate limiting
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true, // Send cookies
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        const axiosError = error as AxiosError;
        console.error('API Error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate interview question
   */
  async generateQuestion(payload: {
    role: string;
    level: string;
    topic?: string;
    previous_topics?: string[];
  }) {
    try {
      const response = await this.client.post('/api/interview/generate-question', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Evaluate answer
   */
  async evaluateAnswer(payload: {
    question: string;
    answer: string;
    role: string;
    level: string;
  }) {
    try {
      const response = await this.client.post('/api/interview/evaluate-answer', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload resume
   */
  async uploadResume(file: File) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await this.client.post('/api/interview/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await this.client.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get interview sessions
   */
  async getInterviewSessions(limit = 10, offset = 0) {
    try {
      const response = await this.client.get('/api/interview/sessions', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
