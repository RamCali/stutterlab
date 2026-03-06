"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseMetronomeOptions {
  /** Initial BPM (default: 80) */
  initialBpm?: number;
  /** Tick frequency in Hz (default: 800) */
  tickFrequency?: number;
  /** Tick volume 0-1 (default: 0.3) */
  tickVolume?: number;
}

interface UseMetronomeReturn {
  start: () => void;
  stop: () => void;
  isPlaying: boolean;
  bpm: number;
  setBpm: (bpm: number) => void;
  /** Increments on each beat — use for visual pulse sync */
  beatCount: number;
}

/**
 * Reusable metronome hook with precise audio timing.
 * Extracted from AudioEngine.ts for standalone use in exercises.
 */
export function useMetronome(options: UseMetronomeOptions = {}): UseMetronomeReturn {
  const {
    initialBpm = 80,
    tickFrequency = 800,
    tickVolume = 0.3,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(initialBpm);
  const [beatCount, setBeatCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bpmRef = useRef(initialBpm);

  const playTick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const tickGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = tickFrequency;
    tickGain.gain.value = tickVolume;
    tickGain.gain.setTargetAtTime(0, ctx.currentTime + 0.05, 0.01);

    osc.connect(tickGain);
    tickGain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    setBeatCount((c) => c + 1);
  }, [tickFrequency, tickVolume]);

  const startScheduler = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const intervalMs = 60000 / bpmRef.current;
    playTick();
    intervalRef.current = setInterval(playTick, intervalMs);
  }, [playTick]);

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    setBeatCount(0);
    startScheduler();
    setIsPlaying(true);
  }, [startScheduler]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const setBpm = useCallback(
    (newBpm: number) => {
      const clamped = Math.max(40, Math.min(200, newBpm));
      bpmRef.current = clamped;
      setBpmState(clamped);
      if (isPlaying) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const intervalMs = 60000 / clamped;
        intervalRef.current = setInterval(playTick, intervalMs);
      }
    },
    [isPlaying, playTick]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  return { start, stop, isPlaying, bpm, setBpm, beatCount };
}
