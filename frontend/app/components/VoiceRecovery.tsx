/**
 * Voice Recovery Component
 * 
 * Uses Web Speech API to convert voice to text for account recovery
 * Provides fallback to text input if voice recognition is unavailable
 * 
 * Browser Support:
 * - Chrome/Edge: Full support
 * - Safari: Partial support (macOS 10.15+, iOS 13+)
 * - Firefox: Not supported (uses fallback)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Card from './Card';

interface VoiceRecoveryProps {
  onTranscript: (text: string) => void;
  method: 'email' | 'phone';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function VoiceRecovery({
  onTranscript,
  method,
  placeholder,
  disabled = false,
  className = '',
}: VoiceRecoveryProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [useTextFallback, setUseTextFallback] = useState(false);
  const [textInput, setTextInput] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      initializeRecognition(SpeechRecognition);
    } else {
      setIsSupported(false);
      setUseTextFallback(true);
      setError('Voice recognition not supported in this browser. Please use text input.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeRecognition = (SpeechRecognition: any) => {
    try {
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true; // Keep listening until stopped
      recognition.interimResults = true; // Show interim results
      recognition.lang = 'en-US'; // Set language
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
          setTranscript(finalTranscriptRef.current.trim());
          setInterimTranscript('');
          
          // Automatically stop after getting final result for identifier input
          if (method === 'email' || method === 'phone') {
            // Process the final transcript
            onTranscript(finalTranscriptRef.current.trim());
          }
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setError('No microphone found. Please check your microphone settings.');
            setUseTextFallback(true);
            break;
          case 'not-allowed':
            setError('Microphone permission denied. Please enable microphone access.');
            setUseTextFallback(true);
            break;
          case 'network':
            setError('Network error. Please check your connection.');
            break;
          case 'aborted':
            // User stopped, don't show error
            break;
          default:
            setError(`Recognition error: ${event.error}. Please use text input.`);
            setUseTextFallback(true);
        }
        
        setIsListening(false);
      };

      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsSupported(false);
      setUseTextFallback(true);
      setError('Failed to initialize voice recognition. Please use text input.');
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || disabled) return;

    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      finalTranscriptRef.current = '';
      
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition. Please use text input.');
      setUseTextFallback(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Process final transcript
      if (finalTranscriptRef.current.trim()) {
        onTranscript(finalTranscriptRef.current.trim());
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTranscript(textInput.trim());
    }
  };

  const handleUseTextFallback = () => {
    setUseTextFallback(true);
    stopListening();
  };

  const handleUseVoice = () => {
    setUseTextFallback(false);
    setTextInput('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Input */}
      {!useTextFallback && isSupported && (
        <Card className="border-2 border-brand-primary-500/30">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-dark-text-primary mb-1">
                  Voice Input
                </h3>
                <p className="text-sm text-dark-text-secondary">
                  Speak your {method === 'email' ? 'email address' : 'phone number'} clearly
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseTextFallback}
              >
                Use Text
              </Button>
            </div>

            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="p-4 bg-dark-bg-tertiary rounded-lg border border-dark-border-primary">
                <div className="text-sm text-dark-text-tertiary mb-1">Transcript:</div>
                <div className="text-dark-text-primary font-mono">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-dark-text-tertiary italic">
                      {interimTranscript}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-brand-error-500/10 border border-brand-error-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-brand-error-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-brand-error-500">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUseTextFallback}
                      className="mt-2"
                    >
                      Switch to Text Input
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Controls */}
            <div className="flex items-center gap-3">
              {!isListening ? (
                <Button
                  variant="primary"
                  onClick={startListening}
                  disabled={disabled}
                  className="flex-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Start Voice Input
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={stopListening}
                  className="flex-1"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse"></div>
                    Listening... Click to Stop
                  </div>
                </Button>
              )}

              {(transcript || interimTranscript) && (
                <Button
                  variant="ghost"
                  onClick={clearTranscript}
                  title="Clear transcript"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Listening Indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-primary-500">
                <div className="w-2 h-2 rounded-full bg-brand-primary-500 animate-pulse"></div>
                <span>Listening... Speak now</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Text Fallback */}
      {useTextFallback && (
        <Card>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-dark-text-primary mb-1">
                  Text Input
                </h3>
                <p className="text-sm text-dark-text-secondary">
                  Enter your {method === 'email' ? 'email address' : 'phone number'}
                </p>
              </div>
              {isSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUseVoice}
                  disabled={disabled}
                >
                  Use Voice
                </Button>
              )}
            </div>

            {/* Text Input */}
            <div>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={placeholder || (method === 'email' ? 'your.email@example.com' : '+1234567890')}
                className="w-full px-4 py-3 bg-dark-bg-tertiary border border-dark-border-primary rounded-lg text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || disabled}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Browser Not Supported */}
      {!isSupported && !useTextFallback && (
        <Card className="bg-brand-warning-500/10 border-brand-warning-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-warning-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-dark-text-primary mb-1">
                Voice Input Not Available
              </h4>
              <p className="text-sm text-dark-text-secondary mb-3">
                Your browser doesn't support voice recognition. Please use text input instead.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseTextFallback(true)}
              >
                Use Text Input
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
