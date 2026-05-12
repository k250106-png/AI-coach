/**
 * Interview State Machine - Coordinates STT and TTS
 * Prevents microphone/voice overlap by enforcing strict state transitions
 * IDLE → QUESTION_ASKED → WAITING_USER → RECORDING → PROCESSING → FEEDBACK → (repeat)
 */

export type InterviewState = 
  | 'IDLE'
  | 'QUESTION_ASKED' // TTS speaking
  | 'WAITING_USER' // TTS done, waiting for user to start
  | 'RECORDING' // STT active, user speaking
  | 'PROCESSING' // AI processing answer
  | 'FEEDBACK' // Showing STAR nudges
  | 'COMPLETED';

interface InterviewStateCallbacks {
  onStateChange?: (state: InterviewState) => void;
  onMicrophoneActive?: (active: boolean) => void;
  onSpeakerActive?: (active: boolean) => void;
}

export class InterviewStateMachine {
  private state: InterviewState = 'IDLE';
  private callbacks: InterviewStateCallbacks;

  constructor(callbacks: InterviewStateCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Transition to new state with validation
   */
  public transitionTo(newState: InterviewState): boolean {
    const isValidTransition = this.isValidTransition(this.state, newState);

    if (!isValidTransition) {
      console.warn(
        `[InterviewStateMachine] Invalid transition: ${this.state} → ${newState}`
      );
      return false;
    }

    this.state = newState;
    this.callbacks.onStateChange?.(newState);

    // Update mic/speaker active state
    this.updateDeviceState();

    return true;
  }

  /**
   * Validate state transitions
   */
  private isValidTransition(from: InterviewState, to: InterviewState): boolean {
    const validTransitions: Record<InterviewState, InterviewState[]> = {
      IDLE: ['QUESTION_ASKED'],
      QUESTION_ASKED: ['WAITING_USER', 'COMPLETED'],
      WAITING_USER: ['RECORDING', 'QUESTION_ASKED'], // Allow repeat if no response
      RECORDING: ['PROCESSING'],
      PROCESSING: ['FEEDBACK', 'WAITING_USER'], // Can go back if error
      FEEDBACK: ['QUESTION_ASKED', 'COMPLETED'], // Next question or session end
      COMPLETED: ['IDLE'], // Only way out is to reset
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Update device states based on current interview state
   * This is the CRITICAL FIX for preventing mic/voice overlap
   */
  private updateDeviceState(): void {
    const microphoneActive =
      this.state === 'RECORDING' || this.state === 'PROCESSING';
    const speakerActive = this.state === 'QUESTION_ASKED';

    this.callbacks.onMicrophoneActive?.(microphoneActive);
    this.callbacks.onSpeakerActive?.(speakerActive);
  }

  /**
   * Get current state
   */
  public getState(): InterviewState {
    return this.state;
  }

  /**
   * Can microphone record now?
   */
  public canRecord(): boolean {
    return this.state === 'RECORDING' || this.state === 'WAITING_USER';
  }

  /**
   * Can speaker play audio now?
   */
  public canSpeak(): boolean {
    return this.state === 'QUESTION_ASKED';
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.state = 'IDLE';
    this.updateDeviceState();
  }
}
