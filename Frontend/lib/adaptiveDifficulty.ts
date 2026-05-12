/**
 * Adaptive Difficulty System
 * Adjusts question difficulty based on real-time performance
 */

import { DifficultyLevel } from './difficultyProgression';

export interface AdaptivePerformance {
  avgScore: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendedAction: 'escalate' | 'maintain' | 'regress';
  reason: string;
}

/**
 * Adaptive difficulty manager
 */
export class AdaptiveDifficultyEngine {
  private scores: number[] = [];
  private questionCount: number = 0;
  private currentDifficulty: DifficultyLevel = 'STANDARD';

  /**
   * Record answer score
   */
  recordScore(score: number): AdaptivePerformance {
    this.scores.push(score);
    this.questionCount++;

    const performance = this.analyzePerformance();
    this.adjustDifficulty(performance);

    return performance;
  }

  /**
   * Analyze performance and identify trend
   */
  private analyzePerformance(): AdaptivePerformance {
    if (this.scores.length === 0) {
      return {
        avgScore: 0,
        trend: 'stable',
        recommendedAction: 'maintain',
        reason: 'Insufficient data',
      };
    }

    const avgScore = this.calculateAverage(this.scores);

    // Determine trend (last 3 questions vs previous 3)
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (this.scores.length >= 6) {
      const recentAvg = this.calculateAverage(this.scores.slice(-3));
      const previousAvg = this.calculateAverage(this.scores.slice(-6, -3));

      if (recentAvg > previousAvg + 5) trend = 'improving';
      else if (recentAvg < previousAvg - 5) trend = 'declining';
    }

    // Recommend action
    let recommendedAction: 'escalate' | 'maintain' | 'regress';
    let reason: string;

    if (avgScore >= 80 && trend === 'improving') {
      recommendedAction = 'escalate';
      reason = 'Excellent performance - ready for harder questions';
    } else if (avgScore < 40 || trend === 'declining') {
      recommendedAction = 'regress';
      reason = 'Struggling - practice easier questions to build foundation';
    } else {
      recommendedAction = 'maintain';
      reason = 'Steady performance - continue at current level';
    }

    return {
      avgScore: Math.round(avgScore),
      trend,
      recommendedAction,
      reason,
    };
  }

  /**
   * Adjust difficulty based on performance
   */
  private adjustDifficulty(performance: AdaptivePerformance): void {
    const difficultySequence: DifficultyLevel[] = ['WARM_UP', 'STANDARD', 'HARD', 'STRETCH'];
    const currentIndex = difficultySequence.indexOf(this.currentDifficulty);

    if (performance.recommendedAction === 'escalate' && currentIndex < difficultySequence.length - 1) {
      this.currentDifficulty = difficultySequence[currentIndex + 1];
    } else if (performance.recommendedAction === 'regress' && currentIndex > 0) {
      this.currentDifficulty = difficultySequence[currentIndex - 1];
    }
  }

  /**
   * Get current difficulty
   */
  getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  /**
   * Get recommended difficulty for next question
   */
  getNextDifficulty(): DifficultyLevel {
    const performance = this.analyzePerformance();

    if (this.questionCount % 3 === 0) {
      // Check every 3 questions
      if (performance.recommendedAction === 'escalate') {
        const difficultySequence: DifficultyLevel[] = ['WARM_UP', 'STANDARD', 'HARD', 'STRETCH'];
        const currentIndex = difficultySequence.indexOf(this.currentDifficulty);
        if (currentIndex < difficultySequence.length - 1) {
          return difficultySequence[currentIndex + 1];
        }
      } else if (performance.recommendedAction === 'regress') {
        const difficultySequence: DifficultyLevel[] = ['WARM_UP', 'STANDARD', 'HARD', 'STRETCH'];
        const currentIndex = difficultySequence.indexOf(this.currentDifficulty);
        if (currentIndex > 0) {
          return difficultySequence[currentIndex - 1];
        }
      }
    }

    return this.currentDifficulty;
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    totalQuestions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    currentDifficulty: DifficultyLevel;
  } {
    if (this.scores.length === 0) {
      return {
        totalQuestions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        currentDifficulty: this.currentDifficulty,
      };
    }

    return {
      totalQuestions: this.scores.length,
      averageScore: Math.round(this.calculateAverage(this.scores)),
      highestScore: Math.max(...this.scores),
      lowestScore: Math.min(...this.scores),
      currentDifficulty: this.currentDifficulty,
    };
  }

  /**
   * Private helper: calculate average
   */
  private calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Reset
   */
  reset(): void {
    this.scores = [];
    this.questionCount = 0;
    this.currentDifficulty = 'STANDARD';
  }
}
