"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  DeepgramStreamingClient,
  type DeepgramClientConfig,
} from "@/lib/audio/DeepgramStreamingClient";

interface UseDeepgramSTTOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onUtteranceEnd?: () => void;
  onError?: (error: string) => void;
  config?: Partial<DeepgramClientConfig>;
}

interface UseDeepgramSTTReturn {
  start: () => Promise<boolean>;
  stop: () => void;
  isListening: boolean;
  /** Combined final + current interim transcript */
  transcript: string;
  /** Only finalized transcript text */
  finalTranscript: string;
  /** MediaStream for AnalyserNode / waveform visualization */
  stream: MediaStream | null;
  error: string | null;
}

export function useDeepgramSTT(
  options: UseDeepgramSTTOptions = {}
): UseDeepgramSTTReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<DeepgramStreamingClient | null>(null);
  const finalRef = useRef("");
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const start = useCallback(async () => {
    // Reset state
    setError(null);
    setTranscript("");
    setFinalTranscript("");
    finalRef.current = "";

    const client = new DeepgramStreamingClient(
      {
        onTranscript: (event) => {
          if (event.isFinal) {
            finalRef.current += event.text + " ";
            setFinalTranscript(finalRef.current.trim());
            setTranscript(finalRef.current.trim());
          } else {
            setTranscript((finalRef.current + event.text).trim());
          }
          optionsRef.current.onTranscript?.(event.text, event.isFinal);
        },
        onUtteranceEnd: () => {
          optionsRef.current.onUtteranceEnd?.();
        },
        onError: (msg) => {
          setError(msg);
          optionsRef.current.onError?.(msg);
        },
        onOpen: () => {
          setIsListening(true);
        },
        onClose: () => {
          setIsListening(false);
          setStream(null);
        },
      },
      optionsRef.current.config
    );

    clientRef.current = client;
    const success = await client.start();

    if (success) {
      setStream(client.getStream());
    } else {
      setIsListening(false);
    }

    return success;
  }, []);

  const stop = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stop();
      clientRef.current = null;
    }
    setIsListening(false);
    setStream(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.stop();
        clientRef.current = null;
      }
    };
  }, []);

  return {
    start,
    stop,
    isListening,
    transcript,
    finalTranscript,
    stream,
    error,
  };
}
