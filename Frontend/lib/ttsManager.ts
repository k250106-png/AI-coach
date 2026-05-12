/**
 * TTS Manager - Text-to-Speech with State Machine
 * Prevents microphone/voice overlap through strict state management
 * Supports Web Speech Synthesis API with streaming and voice options
 */

export type TTSState = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'CANCELLED';

interface TTSConfig {
  language: 'en-US' | 'ur-PK' | string;
  voiceName?: string;
  pitch?: number; // 0.1 to 2.0
  rate?: number; // 0.1 to 10.0, default 1.0
  volume?: number; // 0 to 1.0
}

interface TTSVoicePreset {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: 'professional' | 'friendly' | 'strict';
  language: string;
}

interface TTSCallbacks {
  onStateChange?: (state: TTSState) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onWarning?: (message: string) => void;
}

export class TTSManager {
  private state: TTSState = 'IDLE';
  private config: TTSConfig;
  private callbacks: TTSCallbacks;
  
  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean = false;
  
  private queue: Array<{ text: string; priority: number }> = [];
  private isProcessingQueue: boolean = false;
  private muteState: boolean = false;

  // Voice presets
  private readonly VOICE_PRESETS: TTSVoicePreset[] = [
    { id: 'prof-male', name: 'Professional Male', gender: 'male', tone: 'professional', language: 'en-US' },
    { id: 'prof-female', name: 'Professional Female', gender: 'female', tone: 'professional', language: 'en-US' },
    { id: 'strict', name: 'Strict Interviewer', gender: 'male', tone: 'strict', language: 'en-US' },
    { id: 'friendly', name: 'Friendly Recruiter', gender: 'female', tone: 'friendly', language: 'en-US' },
    { id: 'urdu-male', name: 'اردو - نر', gender: 'male', tone: 'professional', language: 'ur-PK' },
    { id: 'urdu-female', name: 'اردو - ماں', gender: 'female', tone: 'professional', language: 'ur-PK' },
  ];

  constructor(config: TTSConfig, callbacks: TTSCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.initializeSupport();
  }

  /**
   * Check browser support for Speech Synthesis API
   */
  private initializeSupport(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoicePreferences();
    } else {
      this.isSupported = false;
      this.callbacks.onWarning?.(
        'Speech Synthesis not supported. Using text-only mode.'
      );
    }
  }

  /**
   * Load user voice preferences from localStorage
   */
  private loadVoicePreferences(): void {
    try {
      const saved = localStorage.getItem('tts_preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.config.pitch = prefs.pitch || this.config.pitch || 1.0;
        this.config.rate = prefs.rate || this.config.rate || 1.0;
        this.config.volume = prefs.volume || this.config.volume || 1.0;
      }
    } catch (error) {
      console.warn('Failed to load TTS preferences:', error);
    }
  }

  /**
   * Save user voice preferences to localStorage
   */
  private saveVoicePreferences(): void {
    try {
      localStorage.setItem('tts_preferences', JSON.stringify({
        pitch: this.config.pitch,
        rate: this.config.rate,
        volume: this.config.volume,
      }));
    } catch (error) {
      console.warn('Failed to save TTS preferences:', error);
    }
  }

  /**
   * Speak text
   */
  public async speak(text: string): Promise<void> {
    if (!this.isSupported) {
      this.callbacks.onWarning?.('TTS not supported in your browser');
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.synth?.cancel();

        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Configuration
        this.utterance.lang = this.config.language || 'en-US';
        this.utterance.pitch = this.config.pitch || 1.0;
        this.utterance.rate = this.config.rate || 1.0;
        this.utterance.volume = this.config.volume || 1.0;

        // Try to set voice
        if (this.config.voiceName) {
          const voice = this.findVoiceByName(this.config.voiceName);
          if (voice) {
            this.utterance.voice = voice;
            this.currentVoice = voice;
          }
        }

        // Event handlers
        this.utterance.onstart = () => {
          this.setState('SPEAKING');
          this.callbacks.onStart?.();
        };

        this.utterance.onend = () => {
          this.setState('IDLE');
          this.callbacks.onEnd?.();
          resolve();
        };

        this.utterance.onerror = (event) => {
          this.setState('IDLE');
          const errorMap: Record<string, string> = {
            'network': 'Network error during speech synthesis',
            'synthesis-unavailable': 'Speech synthesis service unavailable',
            'synthesis-failed': 'Speech synthesis failed',
            'audio-busy': 'Audio output is busy',
            'audio-hardware-unavailable': 'Audio hardware unavailable',
          };
          const errorMessage = errorMap[event.error] || `TTS error: ${event.error}`;
          this.callbacks.onError?.(new Error(errorMessage));
          reject(new Error(errorMessage));
        };

        // Speak
        if (!this.muteState && this.synth) {
          this.synth.speak(this.utterance);
        } else if (this.muteState) {
          // Simulate speaking without audio for muted mode
          this.setState('SPEAKING');
          setTimeout(() => {
            this.setState('IDLE');
            this.callbacks.onEnd?.();
            resolve();
          }, text.split(' ').length * 300); // ~3 words per second
        }
      } catch (error) {
        this.setState('IDLE');
        this.callbacks.onError?.(error as Error);
        reject(error);
      }
    });
  }

  /**
   * Speak multiple sentences sequentially
   * Breaks text at sentence boundaries for more natural delivery
   */
  public async speakStreaming(text: string): Promise<void> {
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      if (this.state === 'CANCELLED') {
        break;
      }
      await this.speak(sentence);
      // Small pause between sentences
      await this.delay(300);
    }
  }

  /**
   * Split text into sentences for streaming
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries (. ! ?)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Pause speech
   */
  public pause(): void {
    if (this.synth && this.state === 'SPEAKING') {
      this.synth.pause();
      this.setState('PAUSED');
    }
  }

  /**
   * Resume speech
   */
  public resume(): void {
    if (this.synth && this.state === 'PAUSED') {
      this.synth.resume();
      this.setState('SPEAKING');
    }
  }

  /**
   * Stop speech
   */
  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.setState('IDLE');
    }
  }

  /**
   * Toggle mute state (prevents audio output but continues timing)
   */
  public setMute(muted: boolean): void {
    this.muteState = muted;
    localStorage.setItem('tts_mute', String(muted));
  }

  /**
   * Get mute state
   */
  public getMute(): boolean {
    return this.muteState;
  }

  /**
   * Set speech rate (0.1 to 10.0)
   */
  public setRate(rate: number): void {
    this.config.rate = Math.max(0.1, Math.min(10.0, rate));
    this.saveVoicePreferences();
  }

  /**
   * Set pitch (0.1 to 2.0)
   */
  public setPitch(pitch: number): void {
    this.config.pitch = Math.max(0.1, Math.min(2.0, pitch));
    this.saveVoicePreferences();
  }

  /**
   * Set volume (0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1.0, volume));
    this.saveVoicePreferences();
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Find voice by name
   */
  private findVoiceByName(name: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    return voices.find((v) => v.name === name) || null;
  }

  /**
   * Get voice presets
   */
  public getVoicePresets(): TTSVoicePreset[] {
    return this.VOICE_PRESETS;
  }

  /**
   * Select voice preset
   */
  public selectPreset(presetId: string): void {
    const preset = this.VOICE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      this.config.voiceName = preset.name;
      this.config.language = preset.language;
      
      // Adjust rate/pitch based on tone
      if (preset.tone === 'strict') {
        this.config.rate = 0.95; // Slightly slower, more deliberate
        this.config.pitch = 1.1; // Slightly higher pitch
      } else if (preset.tone === 'friendly') {
        this.config.rate = 1.05; // Slightly faster, more engaging
        this.config.pitch = 1.0; // Natural pitch
      } else {
        this.config.rate = 1.0;
        this.config.pitch = 1.0;
      }
      
      this.saveVoicePreferences();
    }
  }

  /**
   * Get current state
   */
  public getState(): TTSState {
    return this.state;
  }

  /**
   * Check if TTS is supported
   */
  public isSupported_(): boolean {
    return this.isSupported;
  }

  /**
   * Set state and call callback
   */
  private setState(newState: TTSState): void {
    if (newState !== this.state) {
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Destructor
   */
  public destroy(): void {
    this.stop();
  }
}
