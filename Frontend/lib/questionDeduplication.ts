/**
 * Question Deduplication System
 * Prevents candidates from seeing the same question twice
 */

import { InterviewType } from './interviewTypes';

type InterviewRole = string;

interface QuestionRecord {
  id: string;
  text: string;
  role: InterviewRole;
  type: InterviewType;
  difficulty: 'WARM_UP' | 'STANDARD' | 'HARD' | 'STRETCH';
  timestamp: number;
  sessionId: string;
  answered: boolean;
}

/**
 * Generate question hash for deduplication
 */
export function generateQuestionHash(question: string): string {
  // Simple hash: normalize question and create checksum
  const normalized = question.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Calculate similarity between two questions (0-100)
 */
export function calculateQuestionSimilarity(question1: string, question2: string): number {
  const q1 = question1.toLowerCase().split(/\s+/);
  const q2 = question2.toLowerCase().split(/\s+/);

  const q1Set = new Set(q1);
  const q2Set = new Set(q2);

  // Jaccard similarity
  const intersection = new Set([...q1Set].filter(x => q2Set.has(x)));
  const union = new Set([...q1Set, ...q2Set]);

  const similarity = (intersection.size / union.size) * 100;
  return Math.round(similarity);
}

/**
 * Question deduplication manager
 */
export class QuestionDeduplicator {
  private questionHistory: QuestionRecord[] = [];
  private similarityThreshold: number = 70; // 70% similarity = duplicate

  /**
   * Add question to history
   */
  addQuestion(
    text: string,
    role: InterviewRole,
    type: InterviewType,
    difficulty: string,
    sessionId: string
  ): void {
    this.questionHistory.push({
      id: generateQuestionHash(text),
      text,
      role,
      type,
      difficulty: difficulty as any,
      timestamp: Date.now(),
      sessionId,
      answered: false,
    });
  }

  /**
   * Check if question is a duplicate
   */
  isDuplicate(
    question: string,
    role: InterviewRole,
    type: InterviewType,
    userId: string
  ): boolean {
    // Only check history from same user, role, type
    const relevant = this.questionHistory.filter(q => q.role === role && q.type === type);

    for (const record of relevant) {
      const similarity = calculateQuestionSimilarity(question, record.text);

      if (similarity >= this.similarityThreshold) {
        // Additional check: if question was answered recently (< 30 days), it's a duplicate
        const daysSinceAnswered = (Date.now() - record.timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceAnswered < 30) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get similar questions from history
   */
  getSimilarQuestions(
    question: string,
    threshold: number = 60
  ): Array<{ question: string; similarity: number }> {
    return this.questionHistory
      .map(record => ({
        question: record.text,
        similarity: calculateQuestionSimilarity(question, record.text),
      }))
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Get unique questions for role/type in recent sessions
   */
  getRecentUniqueQuestions(
    role: InterviewRole,
    type: InterviewType,
    daysBack: number = 30
  ): number {
    const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
    const recent = this.questionHistory.filter(
      q => q.role === role && q.type === type && q.timestamp > cutoff
    );

    // Count unique questions (based on hash)
    const uniqueHashes = new Set(recent.map(q => q.id));
    return uniqueHashes.size;
  }

  /**
   * Clear old history (> 90 days)
   */
  cleanOldHistory(): void {
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    this.questionHistory = this.questionHistory.filter(q => q.timestamp > cutoff);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalQuestions: number;
    uniqueQuestions: number;
    roleCounts: Record<string, number>;
  } {
    const uniqueHashes = new Set(this.questionHistory.map(q => q.id));
    const roleCounts: Record<string, number> = {};

    for (const record of this.questionHistory) {
      roleCounts[record.role] = (roleCounts[record.role] || 0) + 1;
    }

    return {
      totalQuestions: this.questionHistory.length,
      uniqueQuestions: uniqueHashes.size,
      roleCounts,
    };
  }

  /**
   * Export/import history (for persistence)
   */
  exportHistory(): string {
    return JSON.stringify(this.questionHistory);
  }

  /**
   * Import history from Firebase/storage
   */
  importHistory(jsonData: string): void {
    try {
      this.questionHistory = JSON.parse(jsonData);
    } catch (error) {
      console.error('Failed to import question history:', error);
    }
  }
}

/**
 * Global deduplicator instance
 */
export const deduplicator = new QuestionDeduplicator();
