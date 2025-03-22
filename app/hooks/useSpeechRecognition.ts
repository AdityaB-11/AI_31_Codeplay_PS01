"use client";

import { useState, useEffect, useCallback } from 'react';
import { startSpeechRecognition } from '../utils/speechUtils';

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export default function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopRecognitionFn, setStopRecognitionFn] = useState<(() => void) | null>(null);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    if (stopRecognitionFn) {
      stopRecognitionFn();
      setStopRecognitionFn(null);
    }
    setIsListening(false);
  }, [stopRecognitionFn]);

  const startListening = useCallback(() => {
    resetTranscript();
    setError(null);
    setIsListening(true);

    try {
      const stopFn = startSpeechRecognition(
        // On result
        (newTranscript) => {
          setTranscript(newTranscript);
        },
        // On end
        () => {
          setIsListening(false);
          setStopRecognitionFn(null);
        }
      );
      
      setStopRecognitionFn(() => stopFn);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Speech recognition failed to start');
      setIsListening(false);
    }
  }, [resetTranscript]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stopRecognitionFn) {
        stopRecognitionFn();
      }
    };
  }, [stopRecognitionFn]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
} 