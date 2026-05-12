/**
 * Time Pressure & Pacing System
 * Per-question timer with pressure feedback
 */

export interface TimerConfig {
  totalSeconds: number;
  warningThreshold: number; // percent of time remaining
  pressureFeedback: string[];
}

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
  percentComplete: number;
  pressureLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Timer configurations by question type
 */
export const TIMER_CONFIGS: Record<string, TimerConfig> = {
  BEHAVIORAL: {
    totalSeconds: 10 * 60, // 10 minutes for behavioral
    warningThreshold: 25, // Warn at 2.5 min remaining
    pressureFeedback: [
      'Wrap up your answer soon',
      '2 minutes remaining',
      '1 minute left',
      '30 seconds left',
    ],
  },
  TECHNICAL: {
    totalSeconds: 12 * 60, // 12 minutes for technical
    warningThreshold: 20,
    pressureFeedback: [
      'Consider concluding',
      '3 minutes remaining',
      '1 minute remaining',
      '15 seconds left',
    ],
  },
  CODING: {
    totalSeconds: 45 * 60, // 45 minutes for coding
    warningThreshold: 15, // Warn at 6.75 min remaining
    pressureFeedback: [
      'Keep working efficiently',
      '10 minutes left - start wrapping up',
      '5 minutes remaining',
      '2 minutes left',
      '1 minute left',
      '30 seconds',
    ],
  },
  SYSTEM_DESIGN: {
    totalSeconds: 60 * 60, // 60 minutes for system design
    warningThreshold: 10,
    pressureFeedback: [
      'You have plenty of time',
      '30 minutes remaining',
      '15 minutes left',
      '5 minutes remaining',
      '2 minutes left',
    ],
  },
  CASE_STUDY: {
    totalSeconds: 30 * 60, // 30 minutes for case studies
    warningThreshold: 20,
    pressureFeedback: [
      'Halfway through your time',
      '10 minutes remaining',
      '5 minutes left',
      '2 minutes remaining',
      '1 minute left',
    ],
  },
};

/**
 * Time Pressure Manager
 */
export class TimePressureManager {
  private startTime: number = 0;
  private totalSeconds: number;
  private isActive: boolean = false;

  constructor(totalSeconds: number) {
    this.totalSeconds = totalSeconds;
  }

  /**
   * Start the timer
   */
  start(): void {
    this.startTime = Date.now();
    this.isActive = true;
  }

  /**
   * Pause the timer
   */
  pause(): void {
    this.isActive = false;
  }

  /**
   * Resume the timer
   */
  resume(): void {
    this.isActive = true;
  }

  /**
   * Get current timer state
   */
  getState(): TimerState {
    if (!this.isActive || this.startTime === 0) {
      return {
        remainingSeconds: this.totalSeconds,
        isRunning: false,
        isExpired: false,
        percentComplete: 0,
        pressureLevel: 'LOW',
      };
    }

    const elapsedMs = Date.now() - this.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remainingSeconds = Math.max(0, this.totalSeconds - elapsedSeconds);
    const isExpired = remainingSeconds <= 0;

    const percentComplete = ((elapsedSeconds / this.totalSeconds) * 100).toFixed(1);
    const percentRemaining = (remainingSeconds / this.totalSeconds) * 100;

    let pressureLevel: TimerState['pressureLevel'];
    if (percentRemaining > 66) pressureLevel = 'LOW';
    else if (percentRemaining > 33) pressureLevel = 'MEDIUM';
    else if (percentRemaining > 10) pressureLevel = 'HIGH';
    else pressureLevel = 'CRITICAL';

    return {
      remainingSeconds: Math.max(0, remainingSeconds),
      isRunning: this.isActive,
      isExpired,
      percentComplete: parseFloat(percentComplete),
      pressureLevel,
    };
  }

  /**
   * Format time display
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get pressure feedback message
   */
  getPressureFeedback(pressureLevel: TimerState['pressureLevel']): string {
    const messages = {
      LOW: 'You have plenty of time',
      MEDIUM: 'Pace yourself',
      HIGH: 'Hurry up, time is running out',
      CRITICAL: 'TIME UP - Submit your answer',
    };
    return messages[pressureLevel];
  }

  /**
   * Reset timer
   */
  reset(): void {
    this.startTime = 0;
    this.isActive = false;
  }

  /**
   * Get score adjustment for time pressure
   */
  getTimeBonus(scoreWithoutBonus: number): number {
    const state = this.getState();

    // Bonus for completing early
    if (state.percentComplete < 50) {
      return Math.round(scoreWithoutBonus * 0.05); // 5% bonus
    } else if (state.percentComplete < 75) {
      return Math.round(scoreWithoutBonus * 0.02); // 2% bonus
    } else if (state.isExpired) {
      return Math.round(scoreWithoutBonus * -0.1); // 10% penalty for timeout
    }

    return 0;
  }
}

/**
 * Multi-round interview timer
 */
export class MultiRoundTimer {
  private rounds: Array<{ name: string; duration: number; timer: TimePressureManager }> = [];
  private currentRound: number = 0;

  constructor(rounds: Array<{ name: string; duration: number }>) {
    this.rounds = rounds.map(r => ({
      ...r,
      timer: new TimePressureManager(r.duration),
    }));
  }

  startCurrentRound(): void {
    if (this.currentRound < this.rounds.length) {
      this.rounds[this.currentRound].timer.start();
    }
  }

  nextRound(): boolean {
    if (this.currentRound < this.rounds.length - 1) {
      this.currentRound++;
      this.startCurrentRound();
      return true;
    }
    return false;
  }

  getCurrentRound(): { name: string; duration: number; state: TimerState } | null {
    if (this.currentRound >= this.rounds.length) return null;

    const round = this.rounds[this.currentRound];
    return {
      name: round.name,
      duration: round.duration,
      state: round.timer.getState(),
    };
  }

  getTotalTimeUsed(): number {
    let total = 0;
    for (let i = 0; i <= this.currentRound && i < this.rounds.length; i++) {
      const round = this.rounds[i];
      const state = round.timer.getState();
      if (i < this.currentRound) {
        // Completed rounds
        total += round.duration;
      } else {
        // Current round
        total += round.duration - state.remainingSeconds;
      }
    }
    return total;
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.rounds.length;
    return {
      completed: this.currentRound + (this.rounds[this.currentRound]?.timer.getState().isExpired ? 1 : 0),
      total,
      percentage: Number(((this.currentRound / total) * 100).toFixed(1)),
    };
  }
}
