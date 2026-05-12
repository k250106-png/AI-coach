/**
 * Session Manager - Incremental Session Saving
 * Saves each Q&A pair immediately to prevent data loss on close/crash
 * Also handles beforeunload for last-chance save
 */

import axios from 'axios';

export interface SessionAnswer {
  questionId: string;
  question: string;
  answer: string;
  confidence: number;
  wpm: number;
  fillerCount: number;
  panicFlag: boolean;
  starStatus: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
  };
  score: number;
  feedback: string;
  timestamp: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  roleId: string;
  language: 'en-US' | 'ur-PK';
  startedAt: string;
  answers: SessionAnswer[];
  finalScore?: number;
  strengths?: string[];
  improvements?: string[];
}

interface SessionManagerConfig {
  apiBaseUrl: string;
  sessionId: string;
  userId: string;
}

export class SessionManager {
  private config: SessionManagerConfig;
  private sessionData: SessionData;
  private saveQueue: SessionAnswer[] = [];
  private isSaving: boolean = false;
  private saveBatchSize: number = 1; // Save immediately
  private autosaveInterval: number | null = null;

  constructor(config: SessionManagerConfig, initialSessionData: SessionData) {
    this.config = config;
    this.sessionData = initialSessionData;
    this.setupBeforeUnloadListener();
  }

  /**
   * Add answer to session and save immediately
   */
  public async addAnswer(answer: SessionAnswer): Promise<boolean> {
    try {
      // Add to local session
      this.sessionData.answers.push(answer);

      // Save immediately to backend
      const saved = await this.saveAnswer(answer);

      if (!saved) {
        console.warn('Failed to save answer to backend, queuing for retry');
        this.saveQueue.push(answer);
      }

      return saved;
    } catch (error) {
      console.error('Error adding answer:', error);
      this.saveQueue.push(answer);
      return false;
    }
  }

  /**
   * Save single answer to backend
   */
  private async saveAnswer(answer: SessionAnswer): Promise<boolean> {
    try {
      const url = `${this.config.apiBaseUrl}/api/firebase/sessions/${this.config.sessionId}/questions`;

      const response = await axios.post(url, {
        questionId: answer.questionId,
        question: answer.question,
        answer: answer.answer,
        confidence: answer.confidence,
        wpm: answer.wpm,
        fillerCount: answer.fillerCount,
        panic: answer.panicFlag,
        starMissing: !(
          answer.starStatus.hasSituation &&
          answer.starStatus.hasTask &&
          answer.starStatus.hasAction &&
          answer.starStatus.hasResult
        ),
        score: answer.score,
        starStatus: answer.starStatus,
        createdAt: answer.timestamp,
      });

      return response.data.ok === true;
    } catch (error) {
      console.error('Error saving answer:', error);
      return false;
    }
  }

  /**
   * Save queued answers (for retry after connection restored)
   */
  public async flushQueue(): Promise<void> {
    if (this.isSaving || this.saveQueue.length === 0) {
      return;
    }

    this.isSaving = true;

    try {
      const batch = this.saveQueue.slice(0, this.saveBatchSize);

      for (const answer of batch) {
        const saved = await this.saveAnswer(answer);
        if (saved) {
          this.saveQueue.shift();
        } else {
          break; // Stop if one fails
        }
      }
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Finalize session (save final score, strengths, improvements)
   */
  public async finalizeSession(
    finalScore: number,
    strengths: string[],
    improvements: string[]
  ): Promise<boolean> {
    try {
      // Flush any remaining queued answers first
      await this.flushQueue();

      const url = `${this.config.apiBaseUrl}/api/firebase/sessions/${this.config.sessionId}/finalize`;

      const response = await axios.patch(url, {
        finalScore,
        strengths,
        improvements,
        transcript: this.sessionData.answers.map((a) => ({
          sender: 'user',
          text: a.answer,
          timestamp: a.timestamp,
        })),
        metricsTimeline: this.sessionData.answers.map((a) => ({
          questionId: a.questionId,
          confidence: a.confidence,
          wpm: a.wpm,
          fillerCount: a.fillerCount,
          panic: a.panicFlag,
          starMissing: !(
            a.starStatus.hasSituation &&
            a.starStatus.hasTask &&
            a.starStatus.hasAction &&
            a.starStatus.hasResult
          ),
          score: a.score,
          starStatus: a.starStatus,
          createdAt: a.timestamp,
        })),
      });

      return response.data.ok === true;
    } catch (error) {
      console.error('Error finalizing session:', error);
      return false;
    }
  }

  /**
   * Get session data
   */
  public getSessionData(): SessionData {
    return this.sessionData;
  }

  /**
   * Get answer count
   */
  public getAnswerCount(): number {
    return this.sessionData.answers.length;
  }

  /**
   * Setup beforeunload listener for last-chance save
   */
  private setupBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', async (event) => {
      // Synchronous flush attempt (may not complete)
      if (this.saveQueue.length > 0) {
        event.preventDefault();
        event.returnValue = '';
        // Try to save with a short timeout
        try {
          await Promise.race([
            this.flushQueue(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Save timeout')), 2000)
            ),
          ]);
        } catch (error) {
          console.warn('Last-chance save failed:', error);
        }
      }
    });
  }

  /**
   * Get save queue status
   */
  public getQueueStatus(): { pending: number; isSaving: boolean } {
    return {
      pending: this.saveQueue.length,
      isSaving: this.isSaving,
    };
  }

  /**
   * Clean up
   */
  public destroy(): void {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
  }
}
