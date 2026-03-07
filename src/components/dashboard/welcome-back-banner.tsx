"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import {
  getReturningUserStatus,
  type ReturningUserStatus,
} from "@/lib/actions/user";

const DISMISS_KEY = "stutterlab_welcome_back_dismissed";

function getDismissedTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return null;
  return parseInt(raw, 10) || null;
}

function setDismissedTimestamp(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

function buildMessage(status: ReturningUserStatus): {
  headline: string;
  body: string;
} {
  const name = status.userName ? `, ${status.userName}` : "";
  const days = status.daysSinceLastPractice;

  let daysText: string;
  if (days >= 30) {
    const weeks = Math.round(days / 7);
    daysText = `${weeks} week${weeks !== 1 ? "s" : ""}`;
  } else {
    daysText = `${days} day${days !== 1 ? "s" : ""}`;
  }

  const headline = `Welcome back${name}!`;

  let body: string;
  if (status.streakWasLost && status.previousStreak >= 3) {
    body = `You were away for ${daysText}. You had a ${status.previousStreak}-day streak before — impressive! Your streak will restart from today. Let's build it back, one day at a time.`;
  } else if (days >= 14) {
    body = `It's been ${daysText} since your last practice. No worries — what matters is you're here now. Pick up where you left off on Day ${status.currentDay} of 90.`;
  } else {
    body = `You've been away for ${daysText}. Great to see you again! You're on Day ${status.currentDay} of 90 — let's keep going.`;
  }

  return { headline, body };
}

export function WelcomeBackBanner() {
  const [status, setStatus] = useState<ReturningUserStatus | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    getReturningUserStatus()
      .then((result) => {
        if (!result.isReturning) return;

        // Check if already dismissed for this return period
        const dismissedAt = getDismissedTimestamp();
        if (dismissedAt) {
          // Estimate when the last practice was in epoch ms
          const lastPracticeMs =
            Date.now() - result.daysSinceLastPractice * 86400000;
          // If dismissed after last practice, still dismissed for this absence
          if (dismissedAt > lastPracticeMs) return;
        }

        setStatus(result);
        setDismissed(false);
      })
      .catch(() => {});
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setDismissedTimestamp();
  }, []);

  if (dismissed || !status) return null;

  const { headline, body } = buildMessage(status);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{headline}</h3>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-0.5"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {body}
            </p>
            <Button size="sm" className="mt-3" onClick={handleDismiss}>
              Let&apos;s go
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
