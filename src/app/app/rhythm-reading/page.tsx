"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mic,
  Square,
  Music,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useMetronome } from "@/hooks/useMetronome";
import { useDafAudio } from "@/hooks/useDafAudio";
import { getExerciseById } from "@/lib/exercises/exercise-data";
import { CoachingPanel } from "@/components/coaching/coaching-panel";
import { completeExercise } from "@/lib/actions/exercises";
import { useRouter } from "next/navigation";

const BPM_PRESETS = [
  { label: "Slow", bpm: 60 },
  { label: "Moderate", bpm: 80 },
  { label: "Natural", bpm: 100 },
];

export default function RhythmReadingPage() {
  const router = useRouter();
  const exercise = getExerciseById("rhythm-reading")!;
  const practiceItems = exercise.practiceItems!;
  const contentLevels = Object.keys(practiceItems);

  const [contentLevel, setContentLevel] = useState(contentLevels[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [showInstructions, setShowInstructions] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  const sessionStartRef = useRef(0);

  // Initialize session start time on mount
  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);
  const metronome = useMetronome({ initialBpm: 60 });
  const audio = useDafAudio();

  const items = (practiceItems as Record<string, string[]>)[contentLevel] ?? [];
  const currentItem = items[currentIndex];
  const itemsToComplete = Math.min(5, items.length);
  const allDone = completedItems.size >= itemsToComplete;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  async function startSession() {
    metronome.start();
    await audio.start();
  }

  function stopSession() {
    metronome.stop();
    audio.stop();
    setCompletedItems((prev) => new Set(prev).add(currentIndex));
  }

  async function handleComplete() {
    if (saving) return;
    setSaving(true);
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    try {
      const result = await completeExercise({
        exerciseId: "rhythm-reading",
        exerciseType: "rhythm_reading",
        durationSeconds,
      });
      setXpEarned(result.xp);
      setCompleted(true);
    } catch (err) {
      console.error("Failed to save:", err);
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
          <p className="text-muted-foreground">Rhythm Reading</p>
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between">
          <Link href="/app/exercises">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-500/10">
              <Music className="h-4 w-4 text-rose-500" />
            </div>
            <span className="font-medium text-sm">Rhythm Reading</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
            Beginner
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Instructions */}
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

        {/* Coaching Panel */}
        <div className="mb-4">
          <CoachingPanel tips={exercise.coachingTips} rubric={exercise.feedbackRubric} />
        </div>

        {/* BPM Controls */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Tempo</span>
              <Badge variant="outline" className="text-xs font-mono">
                {metronome.bpm} BPM
              </Badge>
            </div>
            <div className="flex gap-2 mb-3">
              {BPM_PRESETS.map((preset) => (
                <Button
                  key={preset.bpm}
                  variant={metronome.bpm === preset.bpm ? "default" : "outline"}
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => metronome.setBpm(preset.bpm)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <input
              type="range"
              min={40}
              max={160}
              step={5}
              value={metronome.bpm}
              onChange={(e) => metronome.setBpm(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </CardContent>
        </Card>

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

        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-xs">
            {completedItems.size}/{itemsToComplete} items
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">{contentLevel}</span>
        </div>

        {/* Reading content with beat pulse */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Step dots */}
          {items.length > 0 && (
            <div className="flex gap-1.5 mb-6">
              {items.slice(0, Math.min(items.length, 10)).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-6 bg-rose-500"
                      : completedItems.has(i)
                      ? "w-2 bg-rose-500/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Beat pulse indicator */}
          {metronome.isPlaying && (
            <div className="mb-4">
              <div
                key={metronome.beatCount}
                className="h-8 w-8 rounded-full bg-rose-500 animate-ping opacity-75"
              />
            </div>
          )}

          {/* Text to read */}
          <div className="max-w-lg text-center mb-6">
            {currentItem ? (
              <p
                className={`font-medium leading-relaxed ${
                  contentLevel === "poems"
                    ? "text-xl italic"
                    : contentLevel === "sentences"
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
          {/* Waveform */}
          <div className="flex items-end justify-center gap-[2px] h-16 mb-3">
            {audio.bars.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  audio.isActive ? "bg-rose-500" : "bg-muted"
                }`}
                style={{ height: `${Math.max(height, 3)}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-6">
            <span className="text-sm font-mono text-muted-foreground w-12 text-right">
              {formatTime(audio.elapsedSeconds)}
            </span>

            {audio.isActive ? (
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14"
                onClick={stopSession}
              >
                <Square className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-full h-14 w-14 bg-rose-500 hover:bg-rose-600"
                onClick={startSession}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}

            <span className="text-xs text-muted-foreground w-12">
              {audio.isActive ? (
                <span className="text-rose-500 animate-pulse flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  REC
                </span>
              ) : (
                "Ready"
              )}
            </span>
          </div>

          {audio.micError && (
            <p className="text-center text-sm text-red-400 mt-2">{audio.micError}</p>
          )}

          {metronome.isPlaying && (
            <p className="text-center text-xs text-rose-500 mt-2 flex items-center justify-center gap-1">
              <Music className="h-3 w-3" />
              Metronome: {metronome.bpm} BPM
            </p>
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
