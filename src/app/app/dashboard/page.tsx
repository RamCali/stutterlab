"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDailyPlan, getPhaseInfo } from "@/lib/curriculum/daily-plans";
import {
  isOnboardingComplete,
  getOnboardingData,
  saveOnboardingData,
} from "@/lib/onboarding/feared-situations";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentDay } from "@/lib/actions/user-progress";
import { checkOnboardingStatus } from "@/lib/actions/user";
import { checkHasActiveSubscription } from "@/lib/auth/premium";
import { PhaseTimeline } from "@/components/dashboard/phase-timeline";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { MilestoneCard } from "@/components/dashboard/milestone-card";
import { WeekProgressStrip } from "@/components/dashboard/week-progress-strip";
import { NorthStarCard } from "@/components/dashboard/north-star";
import { WelcomeBackBanner } from "@/components/dashboard/welcome-back-banner";
import { Badge } from "@/components/ui/badge";
import { SLPAuthorityBadge } from "@/components/slp-authority-badge";

export default function DashboardPage() {
  const router = useRouter();
  const localOnboarded = isOnboardingComplete();
  const [onboarded, setOnboarded] = useState(localOnboarded);
  const [checkingOnboarding, setCheckingOnboarding] = useState(!localOnboarded);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    getCurrentDay().then(setCurrentDay).catch(() => {});
    checkHasActiveSubscription()
      .then((active) => {
        if (!active) router.replace("/checkout/trial");
      })
      .catch(() => {});

    // Fix desync: if localStorage says not onboarded, check DB
    if (!localOnboarded) {
      checkOnboardingStatus()
        .then((result) => {
          if (result.onboardingCompleted && result.onboardingData) {
            // Hydrate localStorage from DB
            saveOnboardingData({
              completed: true,
              name: result.onboardingData.name,
              fearedSituations: result.onboardingData.fearedSituations,
              severity: result.onboardingData.severity,
              speechChallenges: result.onboardingData.speechChallenges,
              northStarGoal: result.onboardingData.northStarGoal,
              confidenceRatings: result.onboardingData.confidenceRatings,
              avoidanceBehaviors: result.onboardingData.avoidanceBehaviors,
              stutteringTypes: result.onboardingData.stutteringTypes,
              speakingFrequency:
                result.onboardingData.speakingFrequency ?? undefined,
              stutterFrequency:
                result.onboardingData.stutterFrequency ?? undefined,
              stutterDuration:
                result.onboardingData.stutterDuration ?? undefined,
              stutterImpact: result.onboardingData.stutterImpact ?? undefined,
              severityScore: result.onboardingData.severityScore ?? undefined,
              confidenceScore:
                result.onboardingData.confidenceScore ?? undefined,
            });
            setOnboarded(true);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingOnboarding(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailyPlan = getDailyPlan(currentDay)!;
  const phase = getPhaseInfo(currentDay);

  const onboardingData = getOnboardingData();
  const userName = onboardingData?.name;

  const greeting = (() => {
    const h = new Date().getHours();
    const name = userName ? `, ${userName}` : "";
    if (h < 12) return `Good morning${name}!`;
    if (h < 17) return `Good afternoon${name}!`;
    return `Good evening${name}!`;
  })();

  // Wait for DB check before showing onboarding flow (avoids flash)
  if (checkingOnboarding) return null;

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
  }

  const progressPercent = Math.min(Math.round((currentDay / 90) * 100), 100);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base text-muted-foreground">
            Day {currentDay} of 90
          </span>
          <Badge variant="secondary" className="text-sm">
            {phase.label}
          </Badge>
        </div>
      </div>

      {/* Welcome Back (shows only for returning users after 3+ day gap) */}
      <WelcomeBackBanner />

      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Program Progress
          </span>
          <span className="text-sm font-bold text-primary">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Phase Timeline */}
      <PhaseTimeline currentDay={currentDay} />

      {/* Today's Tasks */}
      <TodaysTasks dailyPlan={dailyPlan} currentDay={currentDay} />

      {/* Next Milestone */}
      <MilestoneCard currentDay={currentDay} />

      {/* Week Progress */}
      <WeekProgressStrip currentDay={currentDay} />

      {/* North Star Goal */}
      <NorthStarCard />

      {/* SLP Authority */}
      <SLPAuthorityBadge variant="card" />
    </div>
  );
}
