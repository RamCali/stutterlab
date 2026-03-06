"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseDafAudioOptions {
  delayMs?: number;
  gain?: number;
}

interface UseDafAudioReturn {
  start: () => Promise<void>;
  stop: () => void;
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  bars: number[];
  elapsedSeconds: number;
  dafEnabled: boolean;
  setDafEnabled: (enabled: boolean) => void;
  setDelayMs: (ms: number) => void;
  micError: string | null;
}

/**
 * Reusable hook for microphone recording with optional DAF (Delayed Auditory Feedback).
 * Extracted from the exercise detail page for use in multiple exercise types.
 */
export function useDafAudio(options: UseDafAudioOptions = {}): UseDafAudioReturn {
  const { delayMs: initialDelayMs = 70, gain: initialGain = 0.85 } = options;

  const [isActive, setIsActive] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(40).fill(5));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dafEnabled, setDafEnabled] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const dafGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayMsRef = useRef(initialDelayMs);
  const gainRef = useRef(initialGain);

  const setDelayMs = useCallback((ms: number) => {
    delayMsRef.current = ms;
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = ms / 1000;
    }
  }, []);

  // Waveform visualization
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      const segSize = Math.floor(data.length / 40);
      const newBars = Array.from({ length: 40 }, (_, i) => {
        let peak = 0;
        for (let j = i * segSize; j < (i + 1) * segSize && j < data.length; j++) {
          peak = Math.max(peak, Math.abs(data[j]));
        }
        return Math.min(100, peak * 400);
      });
      setBars(newBars);
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  // DAF: reactively connect/disconnect when toggled mid-recording
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const source = sourceRef.current;
    if (!isActive || !ctx || !source) return;

    if (dafEnabled) {
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = delayMsRef.current / 1000;
      const gain = ctx.createGain();
      gain.gain.value = gainRef.current;
      source.connect(delay);
      delay.connect(gain);
      gain.connect(ctx.destination);
      delayNodeRef.current = delay;
      dafGainRef.current = gain;
    }

    return () => {
      if (delayNodeRef.current) {
        delayNodeRef.current.disconnect();
        delayNodeRef.current = null;
      }
      if (dafGainRef.current) {
        dafGainRef.current.disconnect();
        dafGainRef.current = null;
      }
    };
  }, [dafEnabled, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = useCallback(async () => {
    setMicError(null);
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (err) {
      ctx.close();
      audioCtxRef.current = null;
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setMicError("Microphone access denied. Please allow microphone permission in your browser settings.");
      } else if (name === "NotFoundError") {
        setMicError("No microphone found. Please connect a microphone and try again.");
      } else {
        setMicError("Could not access microphone. Please check your browser settings.");
      }
      return;
    }

    setIsActive(true);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    analyserRef.current = null;
    if (delayNodeRef.current) {
      delayNodeRef.current.disconnect();
      delayNodeRef.current = null;
    }
    if (dafGainRef.current) {
      dafGainRef.current.disconnect();
      dafGainRef.current = null;
    }
    sourceRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setBars(Array(40).fill(3));
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return {
    start,
    stop,
    analyserNode: analyserRef.current,
    isActive,
    bars,
    elapsedSeconds,
    dafEnabled,
    setDafEnabled,
    setDelayMs,
    micError,
  };
}
