/**
 * Example: Using InterviewOrchestrator
 * This demonstrates how to integrate all the new systems
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { InterviewOrchestrator, type InterviewCallbacks } from '@/lib/interviewOrchestrator';
import type { HUDMetrics } from '@/lib/hudManager';
import { InterviewState } from '@/lib/interviewStateMachine';

export default function InterviewPageExample() {
  const orchestratorRef = useRef<InterviewOrchestrator | null>(null);
  
  const [state, setState] = useState<InterviewState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [metrics, setMetrics] = useState<HUDMetrics | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('Tell me about yourself.');
  const [questionCount, setQuestionCount] = useState(1);
  const [totalQuestions] = useState(5);

  // Initialize orchestrator
  useEffect(() => {
    const callbacks: InterviewCallbacks = {
      onStateChange: (newState) => {
        setState(newState);
        setIsRecording(newState === 'RECORDING');
      },
      onTranscriptUpdate: (text) => {
        setTranscript(text);
      },
      onHUDUpdate: (hudMetrics) => {
        setMetrics(hudMetrics);
      },
      onAnswerComplete: (answer) => {
        console.log('Answer saved:', answer);
      },
      onError: (err) => {
        setError(err.message);
      },
      onWarning: (msg) => {
        console.warn(msg);
      },
    };

    const orchestrator = new InterviewOrchestrator(
      {
        sessionId: 'session-' + Date.now(),
        userId: 'user-123',
        roleId: 'role-123',
        language: 'en-US',
        wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/stt',
        apiBaseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
      },
      callbacks
    );

    orchestratorRef.current = orchestrator;

    return () => {
      orchestrator.destroy();
    };
  }, []);

  // Start first question
  const handleStartInterview = async () => {
    if (!orchestratorRef.current) return;
    
    setError(null);
    try {
      await orchestratorRef.current.startInterview(currentQuestion);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    if (!orchestratorRef.current) return;
    
    setError(null);
    try {
      await orchestratorRef.current.startRecording();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    if (!orchestratorRef.current) return;
    
    try {
      await orchestratorRef.current.stopRecording();
      
      // Move to next question or complete
      if (questionCount < totalQuestions) {
        const nextQuestions = [
          'Tell me about a challenging project.',
          'How do you handle failure?',
          'What is your greatest strength?',
          'Where do you see yourself in 5 years?',
        ];
        
        setQuestionCount(questionCount + 1);
        setCurrentQuestion(nextQuestions[questionCount - 1] || 'Any final questions?');
        setTranscript('');
        
        // Small delay before asking next question
        setTimeout(() => {
          orchestratorRef.current?.askNextQuestion(nextQuestions[questionCount - 1] || 'Any final questions?');
        }, 1500);
      } else {
        // Complete interview
        await orchestratorRef.current.completeSession(78, 
          ['Good communication', 'Strong technical knowledge'],
          ['More specific examples needed', 'Too many filler words']
        );
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Replay question
  const handleReplayQuestion = async () => {
    if (!orchestratorRef.current) return;
    await orchestratorRef.current.replayQuestion();
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (!orchestratorRef.current) return;
    const isMuted = orchestratorRef.current.toggleMute();
    console.log('TTS muted:', isMuted);
  };

  const getStateColor = (s: InterviewState): string => {
    const colors: Record<InterviewState, string> = {
      'IDLE': 'bg-gray-200',
      'QUESTION_ASKED': 'bg-blue-200',
      'WAITING_USER': 'bg-yellow-200',
      'RECORDING': 'bg-red-200',
      'PROCESSING': 'bg-purple-200',
      'FEEDBACK': 'bg-green-200',
      'COMPLETED': 'bg-emerald-200',
    };
    return colors[s] || 'bg-gray-200';
  };

  const getWpmColor = (wpm: number): string => {
    if (wpm === 0) return 'text-gray-500';
    if (wpm < 100) return 'text-yellow-600';
    if (wpm > 170) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Interview</h1>
          <p className="text-gray-600">
            Question {questionCount} of {totalQuestions}
          </p>
        </div>

        {/* State Indicator */}
        <div className={`${getStateColor(state)} p-4 rounded-lg mb-6 font-semibold text-gray-900`}>
          Interview State: <span className="uppercase">{state}</span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Question Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question</h2>
          <p className="text-lg text-gray-700">{currentQuestion}</p>
          <button
            onClick={handleReplayQuestion}
            disabled={state !== 'WAITING_USER' && state !== 'IDLE'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔊 Replay Question
          </button>
        </div>

        {/* Live Transcript */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h2>
          <div className="bg-gray-50 p-4 rounded min-h-24 text-gray-700">
            {transcript || <span className="text-gray-400">Your answer will appear here...</span>}
          </div>
        </div>

        {/* HUD Metrics */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">WPM</div>
                <div className={`text-2xl font-bold ${getWpmColor(metrics.wpm)}`}>
                  {metrics.wpm}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.wpm < 100 ? '(slow)' : metrics.wpm > 170 ? '(fast)' : '(good)'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Fillers</div>
                <div className={`text-2xl font-bold ${metrics.fillerCount > 3 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.fillerCount}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Confidence</div>
                <div className="text-2xl font-bold text-blue-600">{metrics.confidence}%</div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Elapsed</div>
                <div className="text-2xl font-bold text-gray-700">{metrics.elapsedSeconds}s</div>
              </div>
            </div>

            {/* STAR Status */}
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <div className="text-sm font-semibold text-gray-900 mb-2">STAR Components</div>
              <div className="flex gap-2">
                {Object.entries(metrics.starStatus).map(([component, present]) => (
                  <div
                    key={component}
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      present ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {component.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {metrics.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded">
                <div className="text-sm font-semibold text-gray-900 mb-2">Nudges</div>
                {metrics.warnings.map((warning, i) => (
                  <div key={i} className="text-sm text-yellow-900 mb-1">
                    • {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4 flex-wrap">
            {state === 'IDLE' && (
              <button
                onClick={handleStartInterview}
                className="px-6 py-3 bg-green-500 text-white rounded font-semibold hover:bg-green-600"
              >
                Start Interview
              </button>
            )}

            {(state === 'WAITING_USER' || state === 'IDLE') && (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3 bg-red-500 text-white rounded font-semibold hover:bg-red-600"
              >
                🎤 Start Speaking
              </button>
            )}

            {state === 'RECORDING' && (
              <button
                onClick={handleStopRecording}
                className="px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600"
              >
                ⏹️ Stop Speaking
              </button>
            )}

            <button
              onClick={handleToggleMute}
              className="px-6 py-3 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600"
            >
              🔇 Toggle Mute
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>State Machine ensures microphone and speaker never activate simultaneously.</p>
            <p className="mt-1">Each answer is saved immediately to prevent data loss.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
