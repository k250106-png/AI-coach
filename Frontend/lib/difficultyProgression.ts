/**
 * Question Difficulty Progression System
 * Implements: warm-up → standard → hard → stretch flow
 */

export type DifficultyLevel = 'WARM_UP' | 'STANDARD' | 'HARD' | 'STRETCH';

interface DifficultyProgressionStatus {
  currentLevel: DifficultyLevel;
  questionsAnswered: number;
  averageScore: number;
  shouldEscalate: boolean;
  shouldRegress: boolean;
}

const DIFFICULTY_THRESHOLDS = {
  WARM_UP: { min: 0, max: 100, escalateScore: 75 },
  STANDARD: { min: 0, max: 100, escalateScore: 70 },
  HARD: { min: 0, max: 100, escalateScore: 65 },
  STRETCH: { min: 0, max: 100, escalateScore: 50 },
};

const DIFFICULTY_SEQUENCE: DifficultyLevel[] = ['WARM_UP', 'STANDARD', 'HARD', 'STRETCH'];

export class DifficultyProgression {
  private currentLevel: DifficultyLevel = 'WARM_UP';
  private scores: number[] = [];
  private questionsAnswered = 0;
  private regressionCount = 0;

  /**
   * Get the current difficulty level
   */
  getCurrentLevel(): DifficultyLevel {
    return this.currentLevel;
  }

  /**
   * Record a score and determine if we should escalate/regress
   */
  recordScore(score: number): {
    nextLevel: DifficultyLevel;
    escalated: boolean;
    regressed: boolean;
    averageScore: number;
  } {
    this.scores.push(score);
    this.questionsAnswered++;

    const averageScore = this.calculateAverageScore();
    const currentIndex = DIFFICULTY_SEQUENCE.indexOf(this.currentLevel);

    let escalated = false;
    let regressed = false;

    // Check if we should escalate (only after 3 questions at current level)
    if (this.questionsAnswered % 3 === 0 && averageScore >= DIFFICULTY_THRESHOLDS[this.currentLevel].escalateScore) {
      if (currentIndex < DIFFICULTY_SEQUENCE.length - 1) {
        this.currentLevel = DIFFICULTY_SEQUENCE[currentIndex + 1];
        this.questionsAnswered = 0; // Reset for new level
        this.regressionCount = 0;
        escalated = true;
      }
    }
    // Check if we should regress (score too low)
    else if (score < 30 && currentIndex > 0) {
      this.currentLevel = DIFFICULTY_SEQUENCE[currentIndex - 1];
      this.questionsAnswered = 0;
      this.regressionCount++;
      regressed = true;
    }

    return {
      nextLevel: this.currentLevel,
      escalated,
      regressed,
      averageScore,
    };
  }

  /**
   * Calculate average score for current level
   */
  private calculateAverageScore(): number {
    if (this.scores.length === 0) return 0;
    const sum = this.scores.reduce((a, b) => a + b, 0);
    return sum / this.scores.length;
  }

  /**
   * Get progression status
   */
  getStatus(): DifficultyProgressionStatus {
    return {
      currentLevel: this.currentLevel,
      questionsAnswered: this.questionsAnswered,
      averageScore: this.calculateAverageScore(),
      shouldEscalate:
        this.questionsAnswered % 3 === 0 &&
        this.calculateAverageScore() >= DIFFICULTY_THRESHOLDS[this.currentLevel].escalateScore,
      shouldRegress: false,
    };
  }

  /**
   * Get difficulty-adjusted prompt for question generation
   */
  getPromptModifier(): string {
    const modifiers = {
      WARM_UP: 'Start with a simple, introductory question to warm up the candidate.',
      STANDARD:
        'Ask a standard-level question appropriate for someone with 1-3 years of experience in this role.',
      HARD: 'Ask a challenging question appropriate for someone with 5+ years of experience or senior level.',
      STRETCH:
        'Ask a very difficult, corner-case question that would challenge even experienced professionals.',
    };
    return modifiers[this.currentLevel];
  }

  /**
   * Reset progression (for new session)
   */
  reset(): void {
    this.currentLevel = 'WARM_UP';
    this.scores = [];
    this.questionsAnswered = 0;
    this.regressionCount = 0;
  }
}

export const difficultyConfig = {
  WARM_UP: {
    description: 'Warm-up questions to get comfortable',
    expectedDuration: '1-2 minutes',
    scoreWeight: 0.5,
  },
  STANDARD: {
    description: 'Standard interview questions',
    expectedDuration: '2-3 minutes',
    scoreWeight: 1.0,
  },
  HARD: {
    description: 'Advanced, challenging questions',
    expectedDuration: '3-5 minutes',
    scoreWeight: 1.5,
  },
  STRETCH: {
    description: 'Expert-level, corner-case questions',
    expectedDuration: '5-7 minutes',
    scoreWeight: 2.0,
  },
};
