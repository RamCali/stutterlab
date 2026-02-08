"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wind } from "lucide-react";
import { BreathingExercise } from "@/components/breathing-exercise";
import { getOnboardingData } from "@/lib/onboarding/feared-situations";

const BOX_BREATHING = {
  name: "Box Breathing",
  inhale: 4,
  hold: 4,
  exhale: 4,
  holdAfter: 4,
};

export function PanicButton() {
  const [open, setOpen] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const userName = getOnboardingData()?.name;

  function handleOpen() {
    setOpen(true);
    setShowBreathing(true);
  }

  function handleClose() {
    setOpen(false);
    setShowBreathing(false);
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Quick calm breathing exercise"
      >
        <Wind className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-center text-lg font-semibold">
            Quick Calm
          </DialogTitle>

          {showBreathing ? (
            <div className="py-4">
              <BreathingExercise
                pattern={BOX_BREATHING}
                totalCycles={2}
                userName={userName || undefined}
                onComplete={handleClose}
              />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <Button
                className="w-full h-16 text-base"
                onClick={() => setShowBreathing(true)}
              >
                <Wind className="h-5 w-5 mr-2" />
                Start Box Breathing
              </Button>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium text-sm">Gentle Onset Guide</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Breathe in slowly through your nose</li>
                  <li>Start with a soft &ldquo;h&rdquo; sound</li>
                  <li>Let the word flow out gently</li>
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
