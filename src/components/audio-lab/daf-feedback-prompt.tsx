"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type DafResponseRating,
  setDafResponseRating,
} from "@/lib/audio/daf-responder";

interface DafFeedbackPromptProps {
  onDone: () => void;
}

const OPTIONS: { value: DafResponseRating; label: string }[] = [
  { value: "helps", label: "Yes, it helped" },
  { value: "neutral", label: "Somewhat / not sure" },
  { value: "no_help", label: "No, not really" },
];

export function DafFeedbackPrompt({ onDone }: DafFeedbackPromptProps) {
  function handleRate(rating: DafResponseRating) {
    setDafResponseRating(rating);
    onDone();
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="pt-5 pb-4 space-y-3">
        <p className="text-sm font-medium">Did DAF help during this session?</p>
        <p className="text-xs text-muted-foreground">
          Your answer personalizes future practice — we de-emphasize Audio Lab if
          DAF consistently doesn&apos;t help you.
        </p>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => handleRate(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={onDone}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
