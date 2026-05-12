/**
 * Custom hooks for interview functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/components/ui/Toast';

interface InterviewState {
  questions: string[];
  currentQuestionIndex: number;
  answers: string[];
  scores: number[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage interview flow
 */
export function useInterviewFlow(role: string, level: string) {
  const { showError, showLoading } = useToast();
  const [state, setState] = useState<InterviewState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    scores: [],
    loading: false,
    error: null,
  });

  const generateQuestion = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const response = await apiClient.generateQuestion({
        role,
        level,
        previous_topics: state.questions,
      });

      setState(s => ({
        ...s,
        questions: [...s.questions, response.question],
        loading: false,
      }));

      return response.question;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to generate question';
      setState(s => ({ ...s, error: errorMessage, loading: false }));
      showError(errorMessage);
      throw error;
    }
  }, [role, level, state.questions, showError]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (state.questions.length === 0) {
        showError('No question available');
        return;
      }

      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const currentQuestion = state.questions[state.currentQuestionIndex];

        const response = await apiClient.evaluateAnswer({
          question: currentQuestion,
          answer,
          role,
          level,
        });

        setState(s => ({
          ...s,
          answers: [...s.answers, answer],
          scores: [...s.scores, response.score],
          currentQuestionIndex: s.currentQuestionIndex + 1,
          loading: false,
        }));

        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to evaluate answer';
        setState(s => ({ ...s, error: errorMessage, loading: false }));
        showError(errorMessage);
        throw error;
      }
    },
    [state.questions, state.currentQuestionIndex, role, level, showError]
  );

  const reset = useCallback(() => {
    setState({
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      scores: [],
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    generateQuestion,
    submitAnswer,
    reset,
  };
}

/**
 * Hook to track upload progress
 */
export function useUploadProgress() {
  const { showSuccess, showError } = useToast();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setProgress(0);

      try {
        const response = await apiClient.uploadResume(file);

        setProgress(100);
        showSuccess('Resume uploaded successfully!');

        return response;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Upload failed';
        showError(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [showSuccess, showError]
  );

  return { uploadFile, progress, isUploading };
}
