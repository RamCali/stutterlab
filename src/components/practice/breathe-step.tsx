"use client";

import { BreathingExercise } from "@/components/breathing-exercise";
import { getOnboardingData } from "@/lib/onboarding/feared-situations";

interface BreatheStepProps {
  onComplete: () => void;
  confidenceBefore?: number;
  onConfidenceChange?: (value: number) => void;
}

const BOX_BREATHING = {
  name: "Box Breathing",
  inhale: 4,
  hold: 4,
  exhale: 4,
  holdAfter: 4,
};

export function BreatheStep({ onComplete, confidenceBefore = 5, onConfidenceChange }: BreatheStepProps) {
  const userName = getOnboardingData()?.name;

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8">
      {/* Confidence before rating */}
      {onConfidenceChange && (
        <div className="w-full max-w-xs mb-6">
          <label className="text-sm font-medium mb-2 block text-center">
            How confident do you feel right now?{" "}
            <span className="text-primary font-bold">{confidenceBefore}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={confidenceBefore}
            onChange={(e) => onConfidenceChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Not confident</span>
            <span>Very confident</span>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-6">
        Calm your nervous system with box breathing. Follow the dot around the square.
      </p>
      <BreathingExercise
        pattern={BOX_BREATHING}
        totalCycles={4}
        userName={userName || undefined}
        onComplete={onComplete}
      />
      <button
        onClick={onComplete}
        className="mt-4 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        Skip warm-up
      </button>
    </div>
  );
}
