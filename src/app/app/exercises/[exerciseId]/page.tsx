"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Mic,
  Square,
  ChevronLeft,
  ChevronRight,
  AudioWaveform,
  CheckCircle2,
  Lightbulb,
  Crown,
  Sparkles,
} from "lucide-react";
import { getExerciseById } from "@/lib/exercises/exercise-data";
import { readingContent } from "@/lib/practice/daily-session";
import { LiveCoachOverlay } from "@/components/coaching/LiveCoachOverlay";
import { completeExercise } from "@/lib/actions/exercises";

type ContentLevel = string;

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.exerciseId as string;
  const exercise = getExerciseById(exerciseId);

  const [contentLevel, setContentLevel] = useState<ContentLevel>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [dafEnabled, setDafEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [bars, setBars] = useState<number[]>(Array(40).fill(5));
  const [showInstructions, setShowInstructions] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const dafGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionStartRef = useRef(Date.now());

  // Set default content level once exercise is known
  useEffect(() => {
    if (!exercise) return;
    const items = exercise.practiceItems;
    if (items) {
      const levels = Object.keys(items);
      setContentLevel(levels[0]);
    } else {
      setContentLevel("words");
    }
  }, [exercise]);

  // Waveform visualization
  useEffect(() => {
    if (!isRecording) return;
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
  }, [isRecording]);

  // Cleanup on unmount
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

  if (!exercise) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-muted-foreground">Exercise not found.</p>
        <Link href="/exercises">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
        </Link>
      </div>
    );
  }

  // Get practice items for current level
  const practiceSource = exercise.practiceItems ?? readingContent;
  const items: string[] =
    (practiceSource as Record<string, string[]>)[contentLevel] ?? [];
  const contentLevels = Object.keys(practiceSource);
  const currentItem = items[currentIndex];
  const itemsToComplete = Math.min(5, items.length);
  const allDone = completedItems.size >= itemsToComplete;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  async function startRecording() {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      if (dafEnabled) {
        const delay = ctx.createDelay(0.5);
        delay.delayTime.value = 0.07;
        const gain = ctx.createGain();
        gain.gain.value = 0.85;
        source.connect(delay);
        delay.connect(gain);
        gain.connect(ctx.destination);
        delayNodeRef.current = delay;
        dafGainRef.current = gain;
      }
    } catch {
      ctx.close();
      audioCtxRef.current = null;
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

  async function handleComplete() {
    if (saving || !exercise) return;
    setSaving(true);
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    try {
      const result = await completeExercise({
        exerciseId: exercise.id,
        exerciseType: exercise.techniqueId ?? exercise.id,
        durationSeconds,
      });
      setXpEarned(result.xp);
      setCompleted(true);
    } catch (err) {
      console.error("Failed to save exercise:", err);
    }
    setSaving(false);
  }

  // Completion screen
  if (completed) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Exercise Complete!</h2>
          <p className="text-muted-foreground">{exercise.title}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-amber-500">+{xpEarned} XP</span>
        </div>
        <Button onClick={() => router.push("/app/exercises")} className="mt-4">
          Back to Exercises
        </Button>
      </div>
    );
  }

  const Icon = exercise.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between">
          <Link href="/exercises">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${exercise.bg}`}>
              <Icon className={`h-4 w-4 ${exercise.color}`} />
            </div>
            <span className="font-medium text-sm">{exercise.title}</span>
            {exercise.isPremium && (
              <Badge variant="outline" className="text-[10px]">
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                PRO
              </Badge>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              exercise.difficulty === "Beginner"
                ? "bg-green-500/10 text-green-600"
                : exercise.difficulty === "Intermediate"
                ? "bg-amber-500/10 text-amber-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {exercise.difficulty}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Instructions (collapsible) */}
        {showInstructions && (
          <Card className="mb-4">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">How to practice</p>
              </div>
              <ol className="space-y-1.5 ml-6">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs w-full"
                onClick={() => setShowInstructions(false)}
              >
                Got it — start practicing
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content level picker */}
        {contentLevels.length > 1 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Level:</span>
            <div className="flex gap-1">
              {contentLevels.map((level) => (
                <Button
                  key={level}
                  variant={contentLevel === level ? "default" : "ghost"}
                  size="sm"
                  className="text-xs capitalize h-7 px-2.5"
                  onClick={() => {
                    setContentLevel(level);
                    setCurrentIndex(0);
                    setCompletedItems(new Set());
                  }}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Progress + DAF toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {completedItems.size}/{itemsToComplete} items
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

        {/* Reading content area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Step dots */}
          {items.length > 0 && (
            <div className="flex gap-1.5 mb-6">
              {items.slice(0, Math.min(items.length, 10)).map((_, i) => (
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
          )}

          {/* Text to read */}
          <div className="max-w-lg text-center mb-6">
            {currentItem ? (
              <p
                className={`font-medium leading-relaxed ${
                  contentLevel === "words"
                    ? "text-4xl"
                    : contentLevel === "phrases" || contentLevel === "easy"
                    ? "text-2xl"
                    : contentLevel === "sentences" || contentLevel === "medium"
                    ? "text-xl"
                    : "text-base"
                }`}
              >
                {currentItem}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No content available for this level.
              </p>
            )}
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
              onClick={() =>
                setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))
              }
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

          {/* Live Coach Overlay (for technique exercises) */}
          {exercise.coachConfig && (
            <LiveCoachOverlay
              analyserNode={analyserRef.current}
              enabled={isRecording}
              config={exercise.coachConfig}
            />
          )}

          {/* Complete button */}
          {allDone && (
            <div className="mt-4 text-center">
              <Button onClick={handleComplete} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Complete Exercise"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
