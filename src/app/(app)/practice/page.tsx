"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionStepper } from "@/components/practice/session-stepper";
import { BreatheStep } from "@/components/practice/breathe-step";
import { TechniqueStep } from "@/components/practice/technique-step";
import { SpeakStep } from "@/components/practice/speak-step";
import { ReflectStep } from "@/components/practice/reflect-step";
import {
  getAdaptiveTechnique,
  getContentLevel,
  getScenarioForDay,
} from "@/lib/practice/daily-session";
import {
  getActiveWords,
  getTrainingItems,
  getCurrentTrainingLevel,
} from "@/lib/feared-words/store";
import { getCurrentDay, advanceDay, getUserOutcomeSummary } from "@/lib/actions/user-progress";
import { completeSession } from "@/lib/actions/exercises";
import type { TechniqueOutcomeSummary } from "@/lib/actions/user-progress";

export default function PracticePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [outcomes, setOutcomes] = useState<TechniqueOutcomeSummary | null>(null);
  const [confidenceBefore, setConfidenceBefore] = useState(5);
  const [saving, setSaving] = useState(false);
  const sessionStartRef = useRef(Date.now());

  // Fetch real currentDay and outcomes on mount
  useEffect(() => {
    getCurrentDay().then(setCurrentDay).catch(() => {});
    getUserOutcomeSummary().then(setOutcomes).catch(() => {});
  }, []);

  const technique = getAdaptiveTechnique(currentDay, outcomes);
  const baseContentLevel = getContentLevel(currentDay);
  const scenario = getScenarioForDay(currentDay);

  // Use feared words in technique step when available
  const activeFearedWords = getActiveWords();
  const targetWord = activeFearedWords.length > 0 ? activeFearedWords[0] : null;
  const fearedWordLevel = targetWord ? getCurrentTrainingLevel(targetWord) : null;
  const fearedWordItems = targetWord ? getTrainingItems(targetWord.id, fearedWordLevel!) : undefined;
  const contentLevel = fearedWordLevel ?? baseContentLevel;

  function handleStepComplete() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }

  async function handleSessionComplete(
    mood: string,
    note: string,
    fluencyRating: number,
    confidenceAfter: number
  ) {
    if (saving) return;
    setSaving(true);

    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);

    try {
      await completeSession({
        techniqueId: technique.id,
        techniqueCategory: technique.category,
        durationSeconds,
        confidenceBefore,
        confidenceAfter,
        selfRatedFluency: fluencyRating,
        contentLevel,
        mood,
        note,
      });
      await advanceDay();
    } catch (err) {
      console.error("Failed to save session:", err);
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-background">
        <div className="flex items-center justify-between mb-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">
            Day {currentDay} — {technique.name}
          </span>
          {currentStep > 0 && currentStep < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStepComplete}
              className="text-xs"
            >
              Skip
            </Button>
          )}
          {currentStep === 0 && <div className="w-12" />}
          {currentStep === 3 && <div className="w-12" />}
        </div>
        <SessionStepper currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {currentStep === 0 && (
          <BreatheStep
            onComplete={handleStepComplete}
            confidenceBefore={confidenceBefore}
            onConfidenceChange={setConfidenceBefore}
          />
        )}
        {currentStep === 1 && (
          <TechniqueStep
            technique={technique}
            contentLevel={contentLevel}
            items={fearedWordItems}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 2 && (
          <SpeakStep
            scenario={scenario}
            onComplete={handleStepComplete}
          />
        )}
        {currentStep === 3 && (
          <ReflectStep onComplete={handleSessionComplete} />
        )}
      </div>
    </div>
  );
}
