"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  AudioWaveform,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import type { TechniqueInfo } from "@/lib/practice/daily-session";
import { readingContent } from "@/lib/practice/daily-session";
import { LiveCoachOverlay } from "@/components/coaching/LiveCoachOverlay";
import type { CoachingConfig } from "@/lib/audio/SpeechCoach";

interface TechniqueStepProps {
  technique: TechniqueInfo;
  contentLevel: "words" | "phrases" | "sentences" | "paragraphs";
  onComplete: () => void;
  items?: string[];
}

export function TechniqueStep({
  technique,
  contentLevel,
  onComplete,
  items: propItems,
}: TechniqueStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [dafEnabled, setDafEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [bars, setBars] = useState<number[]>(Array(40).fill(5));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const dafGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const items = propItems ?? readingContent[contentLevel];
  const currentItem = items[currentIndex];
  const progress = Math.round((completedItems.size / items.length) * 100);

  // Map technique to coaching config
  const coachConfig: Partial<CoachingConfig> | undefined = technique.id === "easy_onset"
    ? { activeTechniques: ["gentle_onset", "rate_compliance"], targetSPM: { min: 100, max: 160 } }
    : technique.id === "light_contact"
    ? { activeTechniques: ["gentle_onset", "rate_compliance"], targetSPM: { min: 120, max: 180 } }
    : technique.id === "pausing"
    ? { activeTechniques: ["pacing", "rate_compliance"], targetSPM: { min: 120, max: 180 } }
    : undefined;

  // Waveform visualization — setInterval is more reliable than rAF for React state updates
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);

      // Calculate peak amplitude per bar segment
      const segSize = Math.floor(data.length / 40);
      const newBars = Array.from({ length: 40 }, (_, i) => {
        let peak = 0;
        for (let j = i * segSize; j < (i + 1) * segSize && j < data.length; j++) {
          peak = Math.max(peak, Math.abs(data[j]));
        }
        // Scale: 0.01 (whisper) → ~5%, 0.1 (normal) → ~50%, 0.3 (loud) → 100%
        return Math.min(100, peak * 400);
      });
      setBars(newBars);
    }, 50); // ~20fps

    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      const ctx = new AudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // DAF: route mic audio through a delay node to speakers
      if (dafEnabled) {
        const delay = ctx.createDelay(0.5);
        delay.delayTime.value = 0.07; // 70ms
        const gain = ctx.createGain();
        gain.gain.value = 0.85;
        source.connect(delay);
        delay.connect(gain);
        gain.connect(ctx.destination);
        delayNodeRef.current = delay;
        dafGainRef.current = gain;
      }
    } catch {
      // Continue without mic — still allow practice
    }
    setIsRecording(true);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }

  function stopRecording() {
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setBars(Array(40).fill(3));
    if (timerRef.current) clearInterval(timerRef.current);
    setCompletedItems((prev) => new Set(prev).add(currentIndex));
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const allDone = completedItems.size >= Math.min(5, items.length);

  return (
    <div className="flex flex-col flex-1">
      {/* Technique Tip */}
      <div className="bg-primary/5 rounded-lg p-3 mb-4 flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{technique.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{technique.tip}</p>
        </div>
      </div>

      {/* Progress + DAF toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {completedItems.size}/{Math.min(5, items.length)} items
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">
            {contentLevel}
          </span>
        </div>
        <Badge
          variant={dafEnabled ? "default" : "outline"}
          className="text-xs cursor-pointer"
          onClick={() => setDafEnabled(!dafEnabled)}
        >
          <AudioWaveform className="h-3 w-3 mr-1" />
          DAF {dafEnabled ? "ON" : "OFF"}
        </Badge>
      </div>

      {/* Reading content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Step dots */}
        <div className="flex gap-1.5 mb-6">
          {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-primary"
                  : completedItems.has(i)
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Reading text */}
        <div className="max-w-lg text-center mb-6">
          <p
            className={`font-medium leading-relaxed ${
              contentLevel === "words"
                ? "text-4xl"
                : contentLevel === "phrases"
                ? "text-2xl"
                : contentLevel === "sentences"
                ? "text-xl"
                : "text-base"
            }`}
          >
            {currentItem}
          </p>
          {completedItems.has(currentIndex) && (
            <div className="mt-3 flex items-center justify-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Done</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
            disabled={currentIndex === items.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Waveform + Record */}
      <div className="border-t pt-4">
        <div className="flex items-end justify-center gap-[2px] h-16 mb-3">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                isRecording ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${Math.max(height, 3)}%` }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          <span className="text-sm font-mono text-muted-foreground w-12 text-right">
            {formatTime(elapsedSeconds)}
          </span>

          {isRecording ? (
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-14 w-14"
              onClick={stopRecording}
            >
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-full h-14 w-14"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}

          <span className="text-xs text-muted-foreground w-12">
            {isRecording ? (
              <span className="text-red-500 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                REC
              </span>
            ) : (
              "Ready"
            )}
          </span>
        </div>

        {dafEnabled && (
          <p className="text-center text-xs text-primary mt-2 flex items-center justify-center gap-1">
            <AudioWaveform className="h-3 w-3" />
            DAF Active — 70ms delay
          </p>
        )}

        {/* Live Coach Overlay */}
        <LiveCoachOverlay
          analyserNode={analyserRef.current}
          enabled={isRecording}
          config={coachConfig}
        />

        {/* Complete button */}
        {allDone && (
          <div className="mt-4 text-center">
            <Button onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Continue to Next Step
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
