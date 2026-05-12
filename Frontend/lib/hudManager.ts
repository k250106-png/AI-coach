/**
 * Advanced HUD Manager - Real-time Metrics Display
 * Provides live feedback on: WPM, filler words, STAR compliance, confidence
 * Uses Web Audio API for microphone level visualization
 */

export interface HUDMetrics {
  wpm: number;
  fillerCount: number;
  fillerList: string[];
  confidence: number;
  elapsedSeconds: number;
  wordCount: number;
  averageWordLength: number;
  voiceEnergy: number; // 0-1
  starStatus: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
  };
  warnings: string[];
}

interface HUDConfig {
  language: 'en-US' | 'ur-PK';
  silenceTimeoutSec?: number;
  fillerWarningThreshold?: number;
  wpmWarningZones?: { slow: number; fast: number };
}

export class HUDManager {
  private config: HUDConfig;
  private metrics: HUDMetrics;
  private recordingStartTime: number | null = null;
  private lastSpeechTime: number | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  
  // Filler word detection
  private englishFillers = [
    'um', 'uh', 'ah', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of',
    'kind of', 'i mean', 'you see', 'well', 'so', 'then', 'obviously', 'anyway', 'right',
    'definitely', 'basically', 'actually', 'honestly', 'frankly',
  ];
  
  private urduFillers = [
    'matlab', 'yaani', 'uh', 'hmm', 'na', 'acha', 'bhai', 'yaar', 'dekho', 'suno',
  ];

  // Action verbs for STAR detection
  private actionVerbs = [
    'built', 'created', 'designed', 'developed', 'implemented', 'launched', 'led', 'managed',
    'optimized', 'improved', 'enhanced', 'solved', 'fixed', 'delivered', 'achieved',
    'accomplished', 'orchestrated', 'architected', 'automated', 'accelerated',
  ];

  // STAR framework keywords
  private starKeywords = {
    situation: [
      'situation', 'context', 'background', 'challenge', 'problem', 'scenario', 'was',
      'facing', 'encountered', 'came across', 'realized',
    ],
    task: [
      'task', 'responsibility', 'goal', 'objective', 'needed to', 'had to', 'required',
      'asked', 'told', 'assigned', 'took on',
    ],
    action: [
      'action', 'approach', 'process', 'method', 'did', 'implemented', 'used', 'applied',
      'tried', 'developed', 'created', 'built', 'led', 'managed', 'worked',
    ],
    result: [
      'result', 'outcome', 'achieved', 'improved', 'increased', 'decreased', 'saved',
      'generated', 'reduced', 'delivered', 'accomplished', 'metrics', '%', 'delivered',
    ],
  };

  constructor(config: HUDConfig) {
    this.config = config;
    this.metrics = this.getDefaultMetrics();
  }

  /**
   * Initialize audio context for microphone level monitoring
   */
  public async initializeAudioContext(stream: MediaStream): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  /**
   * Start recording and metric calculation
   */
  public startRecording(): void {
    this.recordingStartTime = Date.now();
    this.lastSpeechTime = Date.now();
  }

  /**
   * Update metrics based on live transcript
   */
  public updateTranscript(transcript: string): HUDMetrics {
    if (!this.recordingStartTime) {
      return this.metrics;
    }

    const elapsed = (Date.now() - this.recordingStartTime) / 1000;
    const words = transcript.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // Calculate WPM (words per minute)
    const wpm = elapsed > 0 ? Math.round((wordCount / elapsed) * 60) : 0;

    // Count filler words
    const fillers = this.detectFillers(transcript);

    // Detect STAR components
    const starStatus = this.detectSTAR(transcript);

    // Calculate average word length
    const totalChars = words.reduce((sum, w) => sum + w.length, 0);
    const avgWordLength = wordCount > 0 ? totalChars / wordCount : 0;

    // Get voice energy level
    const voiceEnergy = this.getVoiceEnergy();

    // Generate warnings
    const warnings = this.generateWarnings(wpm, fillers.length, starStatus, voiceEnergy);

    this.metrics = {
      wpm,
      fillerCount: fillers.length,
      fillerList: fillers,
      confidence: this.calculateConfidence(wpm, fillers.length, starStatus),
      elapsedSeconds: Math.round(elapsed),
      wordCount,
      averageWordLength: Math.round(avgWordLength * 100) / 100,
      voiceEnergy,
      starStatus,
      warnings,
    };

    this.lastSpeechTime = Date.now();
    return this.metrics;
  }

  /**
   * Detect filler words in transcript
   */
  private detectFillers(text: string): string[] {
    const normalized = text.toLowerCase();
    const fillers = this.config.language === 'ur-PK' ? this.urduFillers : this.englishFillers;
    const foundFillers: string[] = [];

    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = normalized.match(regex);
      if (matches) {
        foundFillers.push(...matches.map((m) => m.toLowerCase()));
      }
    }

    return foundFillers;
  }

  /**
   * Detect STAR components in transcript
   */
  private detectSTAR(text: string): HUDMetrics['starStatus'] {
    const normalized = text.toLowerCase();

    const hasSituation = this.starKeywords.situation.some((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(normalized)
    );

    const hasTask = this.starKeywords.task.some((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(normalized)
    );

    const hasAction = this.starKeywords.action.some((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(normalized)
    ) || this.actionVerbs.some((verb) =>
      new RegExp(`\\b${verb}\\b`, 'i').test(normalized)
    );

    const hasResult = this.starKeywords.result.some((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(normalized)
    );

    return { hasSituation, hasTask, hasAction, hasResult };
  }

  /**
   * Get microphone volume level (0-1)
   */
  private getVoiceEnergy(): number {
    if (!this.analyser) return 0;

    try {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // Calculate RMS (root mean square) as energy level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      return Math.min(1, rms / 256); // Normalize to 0-1
    } catch {
      return 0;
    }
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(
    wpm: number,
    fillerCount: number,
    starStatus: HUDMetrics['starStatus']
  ): number {
    let score = 50; // Base score

    // WPM score (optimal: 120-150)
    const wpmScore = Math.max(0, 100 - Math.abs(wpm - 135) / 1.5);
    score += wpmScore * 0.2;

    // Filler score (fewer is better, optimal: 0-2)
    const fillerScore = Math.max(0, 100 - fillerCount * 10);
    score += fillerScore * 0.3;

    // STAR completion score
    const starCount = Object.values(starStatus).filter(Boolean).length;
    const starScore = (starCount / 4) * 100;
    score += starScore * 0.5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Generate real-time warnings
   */
  private generateWarnings(
    wpm: number,
    fillerCount: number,
    starStatus: HUDMetrics['starStatus'],
    voiceEnergy: number
  ): string[] {
    const warnings: string[] = [];

    // WPM warnings
    const slowThreshold = this.config.wpmWarningZones?.slow || 90;
    const fastThreshold = this.config.wpmWarningZones?.fast || 170;

    if (wpm < slowThreshold && wpm > 0) {
      warnings.push('Speaking too slowly - try to speed up');
    } else if (wpm > fastThreshold) {
      warnings.push('Speaking too fast - take a breath');
    }

    // Filler word warnings
    const fillerThreshold = this.config.fillerWarningThreshold || 3;
    if (fillerCount > fillerThreshold) {
      warnings.push(`Too many filler words (${fillerCount}) - focus on clarity`);
    }

    // STAR warnings
    if (!starStatus.hasSituation) {
      warnings.push('Missing: Situation - describe the context');
    }
    if (!starStatus.hasTask) {
      warnings.push('Missing: Task - explain your role');
    }
    if (!starStatus.hasAction) {
      warnings.push('Missing: Action - describe what you did');
    }
    if (!starStatus.hasResult) {
      warnings.push('Missing: Result - quantify the outcome');
    }

    // Voice energy warning
    if (voiceEnergy < 0.1) {
      warnings.push('Microphone too quiet - speak louder');
    }

    return warnings;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): HUDMetrics {
    return this.metrics;
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.recordingStartTime = null;
    this.lastSpeechTime = null;
    this.metrics = this.getDefaultMetrics();
  }

  /**
   * Get default metrics object
   */
  private getDefaultMetrics(): HUDMetrics {
    return {
      wpm: 0,
      fillerCount: 0,
      fillerList: [],
      confidence: 0,
      elapsedSeconds: 0,
      wordCount: 0,
      averageWordLength: 0,
      voiceEnergy: 0,
      starStatus: {
        hasSituation: false,
        hasTask: false,
        hasAction: false,
        hasResult: false,
      },
      warnings: [],
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
