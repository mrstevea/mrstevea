"use client";

// FlavorForge — Voice input hook using Web Speech API

import { useState, useRef, useCallback } from "react";

interface VoiceInputOptions {
  onResult:  (transcript: string) => void;
  onError?:  (err: string) => void;
  language?: string;
}

interface VoiceInputReturn {
  isListening:  boolean;
  isSupported:  boolean;
  startListening: () => void;
  stopListening:  () => void;
  transcript:   string;
}

export function useVoiceInput({
  onResult,
  onError,
  language = "en-US",
}: VoiceInputOptions): VoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.("Voice input not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang              = language;
    recognition.continuous        = false;
    recognition.interimResults    = false;
    recognition.maxAlternatives   = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.trim();
      setTranscript(result);
      onResult(result);
    };

    recognition.onerror = (event) => {
      const msg = event.error === "no-speech"
        ? "No speech detected. Please try again."
        : `Voice error: ${event.error}`;
      onError?.(msg);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [isSupported, language, onResult, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening, transcript };
}
