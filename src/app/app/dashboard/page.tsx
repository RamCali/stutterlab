"use client";

import { useState, useEffect } from "react";
import { getDailyPlan, getPhaseInfo } from "@/lib/curriculum/daily-plans";
import { isOnboardingComplete, getOnboardingData } from "@/lib/onboarding/feared-situations";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentDay } from "@/lib/actions/user-progress";
import { PhaseTimeline } from "@/components/dashboard/phase-timeline";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { MilestoneCard } from "@/components/dashboard/milestone-card";
import { WeekProgressStrip } from "@/components/dashboard/week-progress-strip";
import { NorthStarCard } from "@/components/dashboard/north-star";
import { Badge } from "@/components/ui/badge";
import { SLPAuthorityBadge } from "@/components/slp-authority-badge";

export default function DashboardPage() {
  const [onboarded, setOnboarded] = useState(() => isOnboardingComplete());
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    getCurrentDay().then(setCurrentDay).catch(() => {});
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

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
  }

  const progressPercent = Math.min(Math.round((currentDay / 90) * 100), 100);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            Day {currentDay} of 90
          </span>
          <Badge variant="secondary" className="text-xs">
            {phase.label}
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Program Progress
          </span>
          <span className="text-xs font-bold text-primary">
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
