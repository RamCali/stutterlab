"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Send,
  Volume2,
  X,
} from "lucide-react";
import type { EchoClip } from "./echo-clip-card";

interface ShadowingRecorderProps {
  clip: EchoClip;
  onSubmit: (recording: Blob) => void;
  onCancel: () => void;
}

type RecordingState = "idle" | "listening" | "recording" | "recorded";

export function ShadowingRecorder({ clip, onSubmit, onCancel }: ShadowingRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [levelPct, setLevelPct] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopLevelMeter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLevelPct(0);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopLevelMeter();
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl, stopLevelMeter]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up level meter
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start level meter
      const dataArray = new Uint8Array(analyser.fftSize);
      function updateLevel() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = (dataArray[i] - 128) / 128;
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setLevelPct(Math.min(100, rms * 300));
        rafRef.current = requestAnimationFrame(updateLevel);
      }
      rafRef.current = requestAnimationFrame(updateLevel);

      // Start MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        setState("recorded");
        stopLevelMeter();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");

      // Timer
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Auto-stop after clip duration + 3s buffer
      setTimeout(() => {
        if (recorder.state === "recording") {
          stopRecording();
        }
      }, (clip.durationSeconds + 3) * 1000);
    } catch {
      // Mic permission denied
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function playOriginal() {
    if (isPlayingOriginal) {
      window.speechSynthesis.cancel();
      setIsPlayingOriginal(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(clip.transcript);
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlayingOriginal(false);
    setIsPlayingOriginal(true);
    window.speechSynthesis.speak(utterance);
  }

  function playRecording() {
    if (!recordingUrl) return;
    if (isPlayingRecording && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingRecording(false);
      return;
    }
    const audio = new Audio(recordingUrl);
    audio.onended = () => setIsPlayingRecording(false);
    audioRef.current = audio;
    setIsPlayingRecording(true);
    audio.play();
  }

  function retake() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingBlob(null);
    setRecordingUrl(null);
    setElapsed(0);
    setState("idle");
  }

  function submit() {
    if (recordingBlob) onSubmit(recordingBlob);
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Card className="border-primary/30">
      <CardContent className="py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Shadow: {clip.title}</h3>
            <p className="text-[10px] text-muted-foreground">
              Technique: {clip.technique} — Listen, then record yourself repeating
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step 1: Listen to original */}
        <div className="mb-4 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[9px]">Step 1</Badge>
            <span className="text-xs font-medium">Listen to the Echo</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 w-8 p-0"
              onClick={playOriginal}
            >
              {isPlayingOriginal ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
            <p className="text-xs text-muted-foreground italic flex-1">
              &ldquo;{clip.transcript}&rdquo;
            </p>
          </div>
        </div>

        {/* Step 2: Record */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-[9px]">Step 2</Badge>
            <span className="text-xs font-medium">
              {state === "recorded" ? "Review Your Recording" : "Record Your Shadow"}
            </span>
          </div>

          {state === "idle" && (
            <div className="text-center py-4">
              <Button size="lg" className="rounded-full h-16 w-16 p-0" onClick={startRecording}>
                <Mic className="h-6 w-6" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Tap to start recording ({clip.durationSeconds}s)
              </p>
            </div>
          )}

          {state === "recording" && (
            <div className="text-center py-4">
              {/* Level meter */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3 mx-auto max-w-xs">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-75"
                  style={{ width: `${levelPct}%` }}
                />
              </div>
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full h-16 w-16 p-0"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recording... {formatTime(elapsed)}
              </p>
            </div>
          )}

          {state === "recorded" && (
            <div className="space-y-3">
              {/* Side by side playback */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={playOriginal}
                >
                  {isPlayingOriginal ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                  Original
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={playRecording}
                >
                  {isPlayingRecording ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                  Your Shadow
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={retake}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retake
                </Button>
                <Button className="flex-1" onClick={submit}>
                  <Send className="h-4 w-4 mr-1" />
                  Submit for Scoring
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
