"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getDailyPlan,
  focusDailyPlanForMvp,
  personalizeDailyPlan,
} from "@/lib/curriculum/daily-plans";
import {
  isOnboardingComplete,
  getOnboardingData,
  saveOnboardingData,
} from "@/lib/onboarding/feared-situations";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { seedFearedWords } from "@/lib/feared-words/store";
import { getCurrentDay } from "@/lib/actions/user-progress";
import { checkOnboardingStatus } from "@/lib/actions/user";
import { checkHasActiveSubscription } from "@/lib/auth/premium";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { NorthStarCard } from "@/components/dashboard/north-star";
import { WelcomeBackBanner } from "@/components/dashboard/welcome-back-banner";
import { SLPAuthorityBadge } from "@/components/slp-authority-badge";

export default function DashboardPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] =
    useState<ReturnType<typeof getOnboardingData>>(null);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);

      const localOnboarded = isOnboardingComplete();
      const localData = getOnboardingData();
      setOnboarded(localOnboarded);
      setOnboardingData(localData);
      setCheckingOnboarding(!localOnboarded);

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
              const nextData = {
                completed: true,
                name: result.onboardingData.name,
                fearedSituations: result.onboardingData.fearedSituations,
                fearedWords: result.onboardingData.fearedWords,
                wordReflection: result.onboardingData.wordReflection,
                painPoints: result.onboardingData.painPoints,
                severity: result.onboardingData.severity,
                speechChallenges: result.onboardingData.speechChallenges,
                northStarGoal: result.onboardingData.northStarGoal,
                preferredPracticeTime:
                  result.onboardingData.preferredPracticeTime ?? undefined,
                practicePace: result.onboardingData.practicePace ?? undefined,
                coachingTone: result.onboardingData.coachingTone ?? undefined,
                commitmentReason: result.onboardingData.commitmentReason,
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
                fluencyPersistence:
                  result.onboardingData.fluencyPersistence ?? undefined,
                physicalBehaviors: result.onboardingData.physicalBehaviors,
                fastOrUnclearSpeech:
                  result.onboardingData.fastOrUnclearSpeech ?? undefined,
                familyHistory: result.onboardingData.familyHistory ?? undefined,
                referralGuidance:
                  result.onboardingData.referralGuidance ?? undefined,
                severityScore: result.onboardingData.severityScore ?? undefined,
                confidenceScore:
                  result.onboardingData.confidenceScore ?? undefined,
              };
              // Hydrate localStorage from DB
              saveOnboardingData(nextData);
              seedFearedWords(result.onboardingData.fearedWords);
              setOnboardingData(nextData);
              setOnboarded(true);
            }
          })
          .catch(() => {})
          .finally(() => setCheckingOnboarding(false));
      }
    });
  }, [router]);

  const dailyPlan = focusDailyPlanForMvp(
    personalizeDailyPlan(getDailyPlan(currentDay)!, onboardingData)
  );
  const h = new Date().getHours();
  const name = onboardingData?.name ? `, ${onboardingData.name}` : "";
  const greeting =
    h < 12
      ? `Good morning${name}!`
      : h < 17
        ? `Good afternoon${name}!`
        : `Good evening${name}!`;

  // Wait for DB check before showing onboarding flow (avoids flash)
  if (!hydrated || checkingOnboarding) return null;

  if (!onboarded) {
    return (
      <OnboardingFlow
        onComplete={(data) => {
          if (data) setOnboardingData(data);
          setOnboarded(true);
        }}
      />
    );
  }

  return (
    <div className="px-4 py-4 md:p-6 max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{greeting}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm md:text-base text-muted-foreground">
            Day {currentDay}
          </span>
        </div>
      </div>

      {/* Welcome Back (shows only for returning users after 3+ day gap) */}
      <WelcomeBackBanner />

      {/* Today's Tasks */}
      <TodaysTasks dailyPlan={dailyPlan} currentDay={currentDay} />

      {/* North Star Goal */}
      <NorthStarCard />

      {/* SLP Authority */}
      <SLPAuthorityBadge variant="card" />
    </div>
  );
}
