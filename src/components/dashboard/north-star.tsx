"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getOnboardingData } from "@/lib/onboarding/feared-situations";
import { SPEECH_CHALLENGES } from "@/lib/onboarding/feared-situations";

export function NorthStarCard() {
  const [goal, setGoal] = useState<string>("");
  const [challenges, setChallenges] = useState<string[]>([]);

  useEffect(() => {
    // Read from localStorage first (instant)
    const data = getOnboardingData();
    if (data?.northStarGoal) {
      setGoal(data.northStarGoal);
    }
    if (data?.speechChallenges?.length) {
      setChallenges(data.speechChallenges);
    }

    // Hydrate from DB
    fetch("/api/user/onboarding")
      .then((r) => r.json())
      .then((db) => {
        if (db.northStarGoal) setGoal(db.northStarGoal);
        if (db.speechChallenges?.length) setChallenges(db.speechChallenges);
      })
      .catch(() => {});
  }, []);

  if (!goal) return null;

  const challengeLabels = challenges
    .map((id) => SPEECH_CHALLENGES.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Your North Star
            </p>
            <p className="text-sm font-semibold leading-snug">{goal}</p>
            {challengeLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {challengeLabels.map((c) => (
                  <Badge
                    key={c!.id}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {c!.emoji} {c!.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
