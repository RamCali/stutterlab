"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AudioWaveform,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Volume2,
} from "lucide-react";

/* ─── Sample exercise data (would come from DB) ─── */
const exercise = {
  id: "gentle-onset-1",
  title: "Gentle Onset Practice",
  technique: "Gentle Onset",
  difficulty: "beginner",
  estimatedTime: "5 min",
  instructions:
    "Read each word slowly. Start with a soft, relaxed voice. Let the air flow before the sound begins. Focus on a smooth, easy start.",
  steps: [
    {
      type: "word" as const,
      content: "Easy",
      hint: "Start with a soft 'ee' sound",
    },
    {
      type: "word" as const,
      content: "Open",
      hint: "Let the 'oh' flow gently",
    },
    {
      type: "word" as const,
      content: "Always",
      hint: "Soft breath before 'aw'",
    },
    {
      type: "phrase" as const,
      content: "I am calm",
      hint: "Connect the words smoothly",
    },
    {
      type: "phrase" as const,
      content: "My voice is steady",
      hint: "Keep airflow continuous",
    },
    {
      type: "sentence" as const,
      content: "I speak at my own comfortable pace.",
      hint: "Gentle onset on 'I', pause naturally at commas",
    },
    {
      type: "sentence" as const,
      content: "Every word I say has value and deserves to be heard.",
      hint: "Maintain light contact throughout",
    },
    {
      type: "paragraph" as const,
      content:
        "The morning sun rose gently over the hills. A light breeze carried the scent of fresh grass across the valley. Birds sang their songs from the treetops, welcoming a new day. Everything felt calm and peaceful.",
      hint: "Take natural pauses at periods. Remember: gentle onset on each sentence start.",
    },
  ],
};

function getStepLabel(type: string) {
  switch (type) {
    case "word":
      return "Word";
    case "phrase":
      return "Phrase";
    case "sentence":
      return "Sentence";
    case "paragraph":
      return "Paragraph";
    default:
      return type;
  }
}

function getStepColor(type: string) {
  switch (type) {
    case "word":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "phrase":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
    case "sentence":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
    case "paragraph":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function ExercisePlayerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [dafEnabled, setDafEnabled] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set()
  );

  const step = exercise.steps[currentStep];
  const totalSteps = exercise.steps.length;
  const progress = Math.round((completedSteps.size / totalSteps) * 100);

  function markComplete() {
    const next = new Set(completedSteps);
    next.add(currentStep);
    setCompletedSteps(next);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ═══ Top Bar ═══ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card">
        <div className="flex items-center gap-3">
          <Link href="/exercises">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-semibold">{exercise.title}</h1>
            <p className="text-[10px] text-muted-foreground">
              {exercise.technique} - {exercise.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            <Clock className="h-3 w-3 mr-1" />
            {exercise.estimatedTime}
          </Badge>
          <Badge
            variant="secondary"
            className="text-[10px] bg-primary/10 text-primary border-0"
          >
            {completedSteps.size}/{totalSteps}
          </Badge>
        </div>
      </div>

      {/* ═══ Progress Bar ═══ */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          {/* Step Progress Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {exercise.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "w-6 bg-primary"
                    : completedSteps.has(i)
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step Type Badge */}
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className={`${getStepColor(step.type)} border-0`}
            >
              {getStepLabel(step.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {/* ═══ Reading Content — Large Text Display ═══ */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="pt-8 pb-8 px-6 md:px-10">
              <p
                className={`leading-relaxed text-center ${
                  step.type === "word"
                    ? "text-4xl md:text-5xl font-bold"
                    : step.type === "phrase"
                    ? "text-2xl md:text-3xl font-semibold"
                    : step.type === "sentence"
                    ? "text-xl md:text-2xl font-medium"
                    : "text-lg md:text-xl leading-loose"
                }`}
              >
                {step.content}
              </p>
            </CardContent>
          </Card>

          {/* Hint */}
          {step.hint && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 text-center">
              <p className="text-xs text-primary font-medium">
                Tip: {step.hint}
              </p>
            </div>
          )}

          {/* Instructions */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {exercise.instructions}
          </p>

          {/* ═══ Waveform Visualization Placeholder ═══ */}
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-[2px] h-16">
                {/* Simulated waveform bars */}
                {Array.from({ length: 60 }, (_, i) => {
                  const height = isRecording
                    ? Math.random() * 100
                    : 10 + Math.sin(i * 0.3) * 8;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording
                          ? "bg-primary"
                          : "bg-muted-foreground/20"
                      }`}
                      style={{ height: `${Math.max(4, height)}%` }}
                    />
                  );
                })}
              </div>
              {isRecording && (
                <p className="text-[10px] text-primary text-center mt-2 font-medium animate-pulse">
                  Recording...
                </p>
              )}
            </CardContent>
          </Card>

          {/* DAF Toggle */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={dafEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setDafEnabled(!dafEnabled)}
              className="text-xs"
            >
              <AudioWaveform className="h-3.5 w-3.5 mr-1.5" />
              DAF {dafEnabled ? "On" : "Off"}
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Volume2 className="h-3.5 w-3.5 mr-1.5" />
              Listen
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Control Bar ═══ */}
      <div className="border-t border-border/60 bg-card px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Previous */}
          <Button
            variant="ghost"
            size="sm"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Redo
          </Button>

          {/* Record Button */}
          <Button
            size="lg"
            className={`rounded-full h-14 w-14 ${
              isRecording
                ? "bg-rose-500 hover:bg-rose-600 animate-pulse"
                : "bg-primary hover:bg-primary/90"
            }`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-primary-foreground" />
            )}
          </Button>

          {/* Next / Complete */}
          <Button
            variant={currentStep === totalSteps - 1 ? "default" : "ghost"}
            size="sm"
            onClick={markComplete}
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Finish
              </>
            ) : (
              <>
                Next
                <SkipForward className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
