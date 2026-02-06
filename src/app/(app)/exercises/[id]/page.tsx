"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  AudioWaveform,
  Clock,
  CheckCircle2,
  Volume2,
} from "lucide-react";

/* ─── Reading content by difficulty ─── */
const readingContent = {
  words: [
    "hello", "morning", "water", "today", "happy",
    "beautiful", "sunshine", "together", "wonderful", "practice",
    "breathing", "gentle", "slowly", "natural", "progress",
  ],
  phrases: [
    "Good morning",
    "How are you today",
    "I would like to order",
    "My name is",
    "Thank you very much",
    "Nice to meet you",
    "Can I help you",
    "I'm doing well",
  ],
  sentences: [
    "I am practicing my speech techniques today.",
    "The weather is beautiful this morning.",
    "Could you please help me find the right section?",
    "I'd like to schedule an appointment for next week.",
    "Thank you for your patience and understanding.",
    "I'm working on improving my fluency every day.",
  ],
  paragraphs: [
    "Speaking is a skill that improves with practice. Every time you use your techniques — gentle onset, light contact, or pacing — you build new neural pathways. The key is consistency, not perfection. Some days will feel easier than others, and that is completely normal.",
    "The ocean waves rolled gently onto the shore as the sun began to set. A cool breeze carried the scent of salt and seaweed. Children played near the water's edge while their parents watched from colorful beach chairs. It was the perfect end to a long summer day.",
  ],
};

type Level = "words" | "phrases" | "sentences" | "paragraphs";

export default function ExercisePlayerPage() {
  const [level, setLevel] = useState<Level>("words");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [dafEnabled, setDafEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

  // Real recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated waveform bars
  const [bars, setBars] = useState<number[]>(Array(50).fill(5));

  const items = readingContent[level];
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setBars(Array(50).fill(0).map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(Array(50).fill(5));
    }
  }, [isRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch {
      // Fallback: simulate recording without mic access
      setIsRecording(true);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Mark current item as completed
    setCompletedItems((prev) => new Set(prev).add(currentIndex));
  }

  function nextItem() {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function prevItem() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function changeLevel(newLevel: Level) {
    setLevel(newLevel);
    setCurrentIndex(0);
    setCompletedItems(new Set());
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = Math.round(
    (completedItems.size / items.length) * 100
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Link href="/exercises">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-sm">Reading Exercise</h1>
            <p className="text-xs text-muted-foreground">
              {level.charAt(0).toUpperCase() + level.slice(1)} — Item{" "}
              {currentIndex + 1} of {items.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {progress}% done
          </Badge>
          <Badge
            variant={dafEnabled ? "default" : "outline"}
            className="text-xs cursor-pointer"
            onClick={() => setDafEnabled(!dafEnabled)}
          >
            <AudioWaveform className="h-3 w-3 mr-1" />
            DAF {dafEnabled ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>

      {/* Level Selector */}
      <div className="border-b px-4 py-2 flex gap-2 bg-background/80">
        {(["words", "phrases", "sentences", "paragraphs"] as const).map(
          (l) => (
            <Button
              key={l}
              variant={level === l ? "default" : "ghost"}
              size="sm"
              onClick={() => changeLevel(l)}
              className="text-xs"
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </Button>
          )
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Step Dots */}
        <div className="flex gap-1.5 mb-8">
          {items.map((_, i) => (
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

        {/* Reading Text */}
        <div className="max-w-2xl text-center mb-8">
          <p
            className={`font-medium leading-relaxed ${
              level === "words"
                ? "text-5xl"
                : level === "phrases"
                ? "text-3xl"
                : level === "sentences"
                ? "text-2xl"
                : "text-lg"
            }`}
          >
            {currentItem}
          </p>
          {completedItems.has(currentIndex) && (
            <div className="mt-4 flex items-center justify-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevItem}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextItem}
            disabled={currentIndex === items.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Waveform + Controls */}
      <div className="border-t bg-background p-4">
        {/* Waveform */}
        <div className="flex items-end justify-center gap-[2px] h-12 mb-4">
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

        {/* Timer + Record Button */}
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
      </div>
    </div>
  );
}
