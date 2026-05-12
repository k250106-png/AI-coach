/**
 * Interview Orchestrator - Coordinates all interview systems
 * Manages STT, TTS, state machine, session saving, HUD
 */

import { STTManager, type STTState } from './sttManager';
import { TTSManager, type TTSState } from './ttsManager';
import { InterviewStateMachine, type InterviewState } from './interviewStateMachine';
import { SessionManager, type SessionData, type SessionAnswer } from './sessionManager';
import { HUDManager, type HUDMetrics } from './hudManager';

export interface InterviewOrchestratorConfig {
  sessionId: string;
  userId: string;
  roleId: string;
  language: 'en-US' | 'ur-PK';
  wsUrl: string;
  apiBaseUrl: string;
}

export interface InterviewCallbacks {
  onStateChange?: (state: InterviewState) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  onHUDUpdate?: (metrics: HUDMetrics) => void;
  onAnswerComplete?: (answer: SessionAnswer) => void;
  onSessionComplete?: () => void;
  onError?: (error: Error) => void;
  onWarning?: (message: string) => void;
}

export class InterviewOrchestrator {
  private config: InterviewOrchestratorConfig;
  private callbacks: InterviewCallbacks;

  private sttManager: STTManager | null = null;
  private ttsManager: TTSManager | null = null;
  private stateMachine: InterviewStateMachine;
  private sessionManager: SessionManager | null = null;
  private hudManager: HUDManager | null = null;

  private currentQuestion: string = '';
  private currentAnswer: string = '';
  private questionStartTime: number = 0;
  private currentQuestionId: string = '';

  constructor(config: InterviewOrchestratorConfig, callbacks: InterviewCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.stateMachine = new InterviewStateMachine({
      onStateChange: (state) => this.handleStateChange(state),
    });

    this.initialize();
  }

  /**
   * Initialize all systems
   */
  private initialize(): void {
    // Initialize STT
    this.sttManager = new STTManager(
      {
        language: this.config.language,
        wsUrl: this.config.wsUrl,
        silenceTimeout: 2500,
      },
      {
        onResult: (result) => this.handleSTTResult(result),
        onError: (error) => this.callbacks.onError?.(error),
        onStateChange: (state) => this.handleSTTStateChange(state),
      }
    );

    // Initialize TTS
    this.ttsManager = new TTSManager(
      {
        language: this.config.language,
      },
      {
        onEnd: () => this.transitionToWaitingUser(),
        onError: (error) => this.callbacks.onError?.(error),
      }
    );

    // Initialize HUD
    this.hudManager = new HUDManager({
      language: this.config.language,
      fillerWarningThreshold: 3,
      wpmWarningZones: { slow: 100, fast: 170 },
    });

    // Initialize Session Manager
    const sessionData: SessionData = {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      roleId: this.config.roleId,
      language: this.config.language,
      startedAt: new Date().toISOString(),
      answers: [],
    };

    this.sessionManager = new SessionManager(
      {
        apiBaseUrl: this.config.apiBaseUrl,
        sessionId: this.config.sessionId,
        userId: this.config.userId,
      },
      sessionData
    );
  }

  /**
   * Start interview (ask first question)
   */
  public async startInterview(question: string): Promise<void> {
    this.currentQuestion = question;
    this.currentQuestionId = `Q${Date.now()}`;
    this.questionStartTime = Date.now();

    // Transition to QUESTION_ASKED state
    this.stateMachine.transitionTo('QUESTION_ASKED');

    // Speak the question using TTS
    if (this.ttsManager) {
      await this.ttsManager.speak(question);
    }
  }

  /**
   * Get next question and repeat cycle
   */
  public async askNextQuestion(question: string): Promise<void> {
    // Move to next question
    this.currentQuestion = question;
    this.currentQuestionId = `Q${Date.now()}`;
    this.questionStartTime = Date.now();
    this.currentAnswer = '';

    // Transition state machine
    this.stateMachine.transitionTo('QUESTION_ASKED');

    // Ask question
    if (this.ttsManager) {
      await this.ttsManager.speak(question);
    }
  }

  /**
   * Handle STT result
   */
  private handleSTTResult(result: any): void {
    if (result.isFinal) {
      this.currentAnswer += (this.currentAnswer ? ' ' : '') + result.transcript;
    } else {
      // Interim result for live display
      const interim = result.transcript;
      this.callbacks.onTranscriptUpdate?.(this.currentAnswer + ' ' + interim);
    }

    // Update HUD with live metrics
    if (this.hudManager) {
      const metrics = this.hudManager.updateTranscript(this.currentAnswer);
      this.callbacks.onHUDUpdate?.(metrics);
    }
  }

  /**
   * Handle STT state changes
   */
  private handleSTTStateChange(state: STTState): void {
    if (state === 'PERMISSION_DENIED') {
      this.callbacks.onError?.(
        new Error('Microphone permission denied. Enable it in browser settings.')
      );
    } else if (state === 'NOT_SUPPORTED') {
      this.callbacks.onWarning?.(
        'Web Speech API not supported. Using text input fallback.'
      );
    }
  }

  /**
   * Handle interview state changes
   */
  private handleStateChange(state: InterviewState): void {
    this.callbacks.onStateChange?.(state);

    // Auto-manage devices based on state
    switch (state) {
      case 'QUESTION_ASKED':
        // TTS is speaking, disable mic
        break;
      case 'WAITING_USER':
        // Question asked, ready for user input
        break;
      case 'RECORDING':
        // User is speaking, no TTS
        break;
      case 'PROCESSING':
        // Evaluating answer, disable both
        break;
    }
  }

  /**
   * User starts speaking (transition from WAITING_USER to RECORDING)
   */
  public async startRecording(): Promise<void> {
    if (!this.stateMachine.canRecord()) {
      this.callbacks.onWarning?.('Cannot start recording in current state');
      return;
    }

    this.currentAnswer = '';
    this.stateMachine.transitionTo('RECORDING');

    // Initialize audio context for HUD
    try {
      if (this.sttManager) {
        await this.sttManager.start();
        
        // Initialize HUD audio visualization
        this.hudManager?.startRecording();
      }
    } catch (error) {
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * User stops speaking (transition to PROCESSING)
   */
  public async stopRecording(): Promise<void> {
    if (this.sttManager) {
      this.sttManager.stop();
    }

    this.stateMachine.transitionTo('PROCESSING');

    // Save answer to session
    await this.saveCurrentAnswer();

    // Signal completion
    this.callbacks.onAnswerComplete?.({
      questionId: this.currentQuestionId,
      question: this.currentQuestion,
      answer: this.currentAnswer,
      confidence: this.hudManager?.getMetrics().confidence || 0,
      wpm: this.hudManager?.getMetrics().wpm || 0,
      fillerCount: this.hudManager?.getMetrics().fillerCount || 0,
      panicFlag: false,
      starStatus: this.hudManager?.getMetrics().starStatus || {
        hasSituation: false,
        hasTask: false,
        hasAction: false,
        hasResult: false,
      },
      score: 0, // Will be set by backend
      feedback: '',
      timestamp: new Date().toISOString(),
    });

    // Move to feedback state
    this.stateMachine.transitionTo('FEEDBACK');
  }

  /**
   * Replay question using TTS
   */
  public async replayQuestion(): Promise<void> {
    if (this.ttsManager) {
      await this.ttsManager.speak(this.currentQuestion);
    }
  }

  /**
   * Toggle TTS mute
   */
  public toggleMute(): boolean {
    if (!this.ttsManager) return false;
    const currentMute = this.ttsManager.getMute();
    this.ttsManager.setMute(!currentMute);
    return !currentMute;
  }

  /**
   * Adjust TTS speed
   */
  public setTTSRate(rate: number): void {
    this.ttsManager?.setRate(rate);
  }

  /**
   * Get current interview state
   */
  public getState(): InterviewState {
    return this.stateMachine.getState();
  }

  /**
   * Get current HUD metrics
   */
  public getMetrics(): HUDMetrics | null {
    return this.hudManager?.getMetrics() || null;
  }

  /**
   * Get current transcript
   */
  public getTranscript(): string {
    return this.currentAnswer;
  }

  /**
   * Save current answer to session
   */
  private async saveCurrentAnswer(): Promise<void> {
    if (!this.sessionManager) return;

    const metrics = this.hudManager?.getMetrics();

    const answer: SessionAnswer = {
      questionId: this.currentQuestionId,
      question: this.currentQuestion,
      answer: this.currentAnswer,
      confidence: metrics?.confidence || 0,
      wpm: metrics?.wpm || 0,
      fillerCount: metrics?.fillerCount || 0,
      panicFlag: false,
      starStatus: metrics?.starStatus || {
        hasSituation: false,
        hasTask: false,
        hasAction: false,
        hasResult: false,
      },
      score: 0,
      feedback: '',
      timestamp: new Date().toISOString(),
    };

    await this.sessionManager.addAnswer(answer);
  }

  /**
   * Transition to WAITING_USER state (after TTS finishes)
   */
  private transitionToWaitingUser(): void {
    this.stateMachine.transitionTo('WAITING_USER');
  }

  /**
   * Complete interview session
   */
  public async completeSession(
    finalScore: number,
    strengths: string[],
    improvements: string[]
  ): Promise<void> {
    if (this.sessionManager) {
      await this.sessionManager.finalizeSession(finalScore, strengths, improvements);
    }

    this.stateMachine.transitionTo('COMPLETED');
    this.callbacks.onSessionComplete?.();
  }

  /**
   * Cleanup on destroy
   */
  public destroy(): void {
    this.sttManager?.destroy();
    this.ttsManager?.destroy();
    this.hudManager?.destroy();
    this.sessionManager?.destroy();
  }
}
