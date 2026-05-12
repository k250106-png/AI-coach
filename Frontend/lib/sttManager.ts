/**
 * STT Manager - Unified Speech-to-Text State Machine
 * Handles Web Speech API with fallback to WebSocket backend
 * Manages browser compatibility, permissions, interim results, silence detection
 */

export type STTState = 'IDLE' | 'CHECKING_SUPPORT' | 'WAITING_PERMISSION' | 'LISTENING' | 'PROCESSING' | 'ERROR' | 'PERMISSION_DENIED' | 'NOT_SUPPORTED';
export type STTMode = 'WEB_SPEECH_API' | 'WEBSOCKET_BACKEND';

interface STTConfig {
  language: 'en-US' | 'ur-PK' | string;
  wsUrl: string;
  mode?: STTMode;
  silenceTimeout?: number; // ms of silence before auto-stop
}

interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface STTCallbacks {
  onStateChange?: (state: STTState) => void;
  onResult?: (result: STTResult) => void;
  onError?: (error: Error) => void;
  onWarning?: (message: string) => void;
}

export class STTManager {
  private state: STTState = 'IDLE';
  private mode: STTMode = 'WEB_SPEECH_API';
  private config: STTConfig;
  private callbacks: STTCallbacks;
  
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private wsSocket: WebSocket | null = null;
  private recognition: any = null; // SpeechRecognition instance
  
  private silenceTimer: number | null = null;
  private lastSpeechTime: number = Date.now();
  private recordingStartTime: number = Date.now();
  private interimTranscript: string = '';
  private wsReconnectAttempts: number = 0;
  private wsMaxReconnectAttempts: number = 3;

  // Analytics
  private wordCount: number = 0;
  private fillerWords: string[] = [];

  constructor(config: STTConfig, callbacks: STTCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.initializeSupport();
  }

  /**
   * Check browser support and initialize appropriate STT mode
   */
  private initializeSupport(): void {
    this.setState('CHECKING_SUPPORT');

    // Check for Web Speech API support
    const webSpeechSupported = this.checkWebSpeechSupport();
    
    if (webSpeechSupported) {
      this.mode = 'WEB_SPEECH_API';
      this.initializeWebSpeechAPI();
    } else {
      this.callbacks.onWarning?.(
        'Web Speech API not supported in your browser. Using text input fallback.'
      );
      this.mode = 'WEBSOCKET_BACKEND';
      this.setState('NOT_SUPPORTED');
    }
  }

  /**
   * Check if Web Speech API is available
   */
  private checkWebSpeechSupport(): boolean {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return false;
    }

    // Browser compatibility check
    const userAgent = navigator.userAgent.toLowerCase();
    const isChromium = /chrome|edge|brave/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);

    // Web Speech API is best supported in Chromium browsers
    if (isChromium) return true;
    if (isFirefox) return false; // Firefox doesn't support Web Speech API
    if (isSafari) return true; // Safari has limited support

    return true; // Default to true for other browsers
  }

  /**
   * Initialize Web Speech API
   */
  private initializeWebSpeechAPI(): void {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.setState('NOT_SUPPORTED');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.language = this.config.language;

    // Event handlers
    this.recognition.onstart = () => {
      console.log('[STT] Web Speech API started');
      this.setState('LISTENING');
      this.lastSpeechTime = Date.now();
      this.recordingStartTime = Date.now();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
          this.lastSpeechTime = Date.now();
          this.resetSilenceTimer();
        } else {
          interim += transcript;
        }

        this.callbacks.onResult?.({
          transcript: event.results[i].isFinal ? transcript : interim,
          isFinal: event.results[i].isFinal,
          confidence,
        });
      }

      if (finalText) {
        this.interimTranscript = '';
        this.startSilenceDetection();
      } else if (interim) {
        this.interimTranscript = interim;
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorMap: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your device.',
        'not-allowed': 'Microphone access denied. Please enable it in browser settings.',
        'network': 'Network error. Check your connection.',
      };

      const errorMessage = errorMap[event.error] || `Speech recognition error: ${event.error}`;
      
      if (event.error === 'not-allowed') {
        this.setState('PERMISSION_DENIED');
      } else {
        this.setState('ERROR');
      }

      this.callbacks.onError?.(new Error(errorMessage));
    };

    this.recognition.onend = () => {
      console.log('[STT] Web Speech API ended');
      this.setState('IDLE');
      this.clearSilenceTimer();
    };
  }

  /**
   * Request microphone permission and start STT
   */
  public async start(): Promise<void> {
    try {
      if (this.state === 'LISTENING') {
        console.warn('STT already listening');
        return;
      }

      this.setState('WAITING_PERMISSION');

      // Request permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.startSilenceDetection();

      if (this.mode === 'WEB_SPEECH_API' && this.recognition) {
        this.recognition.start();
      } else {
        // Fallback to WebSocket backend
        await this.connectWebSocketSTT(stream);
      }
    } catch (error) {
      const err = error as Error;
      
      if (err.name === 'NotAllowedError') {
        this.setState('PERMISSION_DENIED');
        this.callbacks.onError?.(
          new Error('Microphone permission denied. Please enable it in browser settings.')
        );
      } else if (err.name === 'NotFoundError') {
        this.setState('ERROR');
        this.callbacks.onError?.(
          new Error('No microphone found. Please connect a microphone and try again.')
        );
      } else {
        this.setState('ERROR');
        this.callbacks.onError?.(err);
      }

      this.cleanup();
    }
  }

  /**
   * Stop STT
   */
  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.clearSilenceTimer();
    this.cleanup();
    this.setState('IDLE');
  }

  /**
   * Silence detection - auto-stop after N seconds of silence
   */
  private startSilenceDetection(): void {
    this.clearSilenceTimer();
    const silenceTimeout = this.config.silenceTimeout || 2500; // 2.5 seconds

    this.silenceTimer = window.setInterval(() => {
      const timeSinceLastSpeech = Date.now() - this.lastSpeechTime;
      
      if (timeSinceLastSpeech > silenceTimeout && this.state === 'LISTENING') {
        console.log('[STT] Silence detected, auto-stopping');
        this.callbacks.onWarning?.('Silence detected. Finalizing answer...');
        this.stop();
      }
    }, 500);
  }

  private resetSilenceTimer(): void {
    this.lastSpeechTime = Date.now();
    this.clearSilenceTimer();
    if (this.state === 'LISTENING') {
      this.startSilenceDetection();
    }
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      window.clearInterval(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * WebSocket backend STT (fallback)
   */
  private async connectWebSocketSTT(stream: MediaStream): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.wsUrl;
        this.wsSocket = new WebSocket(wsUrl);
        this.wsReconnectAttempts = 0;

        this.wsSocket.onopen = () => {
          this.wsSocket?.send(
            JSON.stringify({ config: { languageCode: this.config.language } })
          );

          const options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
            delete options.mimeType;
          }

          this.mediaRecorder = new MediaRecorder(stream, options);
          this.mediaRecorder.ondataavailable = (chunk) => {
            if (chunk.data.size > 0 && this.wsSocket?.readyState === WebSocket.OPEN) {
              this.wsSocket.send(chunk.data);
            }
          };
          this.mediaRecorder.start(500);
          this.setState('LISTENING');
          resolve();
        };

        this.wsSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.status === 'error') {
            reject(new Error(data.message || 'STT error'));
            return;
          }

          if (data.results?.[0]?.alternatives?.[0]?.transcript) {
            const transcript = data.results[0].alternatives[0].transcript;
            this.callbacks.onResult?.({
              transcript,
              isFinal: data.results[0].isFinal,
              confidence: data.results[0].confidence || 0.8,
            });

            if (data.results[0].isFinal) {
              this.lastSpeechTime = Date.now();
              this.resetSilenceTimer();
            }
          }
        };

        this.wsSocket.onerror = () => {
          if (this.wsReconnectAttempts < this.wsMaxReconnectAttempts) {
            this.wsReconnectAttempts++;
            setTimeout(() => {
              this.connectWebSocketSTT(stream);
            }, 1000 * this.wsReconnectAttempts);
          } else {
            reject(new Error('WebSocket STT connection failed'));
          }
        };

        this.wsSocket.onclose = () => {
          this.cleanup();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current state
   */
  public getState(): STTState {
    return this.state;
  }

  /**
   * Get current mode
   */
  public getMode(): STTMode {
    return this.mode;
  }

  /**
   * Get interim transcript
   */
  public getInterimTranscript(): string {
    return this.interimTranscript;
  }

  /**
   * Get recording duration in seconds
   */
  public getElapsedSeconds(): number {
    return (Date.now() - this.recordingStartTime) / 1000;
  }

  /**
   * Set state and call callback
   */
  private setState(newState: STTState): void {
    if (newState !== this.state) {
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;

    if (this.wsSocket) {
      this.wsSocket.close();
      this.wsSocket = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.clearSilenceTimer();
  }

  /**
   * Destructor
   */
  public destroy(): void {
    this.stop();
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
  }
}
