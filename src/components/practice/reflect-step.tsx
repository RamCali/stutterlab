"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ReflectStepProps {
  onComplete: (mood: string, note: string, fluencyRating: number, confidenceAfter: number) => void;
}

const MOODS = [
  { value: "rough", emoji: "\uD83D\uDE13", label: "Rough" },
  { value: "okay", emoji: "\uD83D\uDE0A", label: "Okay" },
  { value: "great", emoji: "\uD83C\uDF89", label: "Great" },
];

export function ReflectStep({ onComplete }: ReflectStepProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [fluencyRating, setFluencyRating] = useState(5);
  const [confidenceAfter, setConfidenceAfter] = useState(5);

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8 max-w-md mx-auto w-full">
      <h2 className="text-xl font-semibold mb-2">How did that feel?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quick self-check — no wrong answers.
      </p>

      {/* Fluency self-rating */}
      <div className="w-full mb-6">
        <label className="text-sm font-medium mb-2 block">
          How fluent did you feel? <span className="text-primary font-bold">{fluencyRating}/10</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={fluencyRating}
          onChange={(e) => setFluencyRating(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Very disfluent</span>
          <span>Very fluent</span>
        </div>
      </div>

      {/* Confidence after */}
      <div className="w-full mb-6">
        <label className="text-sm font-medium mb-2 block">
          Confidence level now? <span className="text-primary font-bold">{confidenceAfter}/10</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={confidenceAfter}
          onChange={(e) => setConfidenceAfter(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Not confident</span>
          <span>Very confident</span>
        </div>
      </div>

      {/* Mood selection */}
      <div className="flex gap-4 mb-6">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              selectedMood === mood.value
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any thoughts? (optional)"
        className="w-full h-20 rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
      />

      <Button
        size="lg"
        className="w-full"
        disabled={!selectedMood}
        onClick={() => onComplete(selectedMood!, note, fluencyRating, confidenceAfter)}
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Complete Session
      </Button>
    </div>
  );
}
