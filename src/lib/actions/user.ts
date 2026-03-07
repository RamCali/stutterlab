"use server";

import { db } from "@/lib/db/client";
import { profiles, userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getOrCreateProfile() {
  const user = await requireAuth();

  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      displayName: user.name ?? "",
    })
    .returning();

  return profile;
}

export async function getOrCreateStats() {
  const user = await requireAuth();

  const existing = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [stats] = await db
    .insert(userStats)
    .values({ userId: user.id })
    .returning();

  return stats;
}

export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  stutteringSeverity?: "mild" | "moderate" | "severe";
}) {
  const user = await requireAuth();

  await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  return { success: true };
}

export async function getDashboardData() {
  const user = await requireAuth();

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return {
    stats: stats ?? {
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      level: 1,
      totalExercisesCompleted: 0,
      totalPracticeSeconds: 0,
      achievements: [],
      lastPracticeDate: null,
    },
    profile: profile[0] ?? null,
  };
}

/** Check DB onboarding status + return data to hydrate localStorage */
export async function checkOnboardingStatus(): Promise<{
  onboardingCompleted: boolean;
  onboardingData: {
    name: string;
    severity: "mild" | "moderate" | "severe" | null;
    fearedSituations: string[];
    speechChallenges: string[];
    northStarGoal: string;
    confidenceRatings: Record<string, number>;
    avoidanceBehaviors: string[];
    stutteringTypes: string[];
    speakingFrequency: string | null;
    stutterFrequency: string | null;
    stutterDuration: string | null;
    stutterImpact: string | null;
    severityScore: number | null;
    confidenceScore: number | null;
  } | null;
}> {
  const user = await requireAuth();

  const [profile] = await db
    .select({
      onboardingCompleted: profiles.onboardingCompleted,
      displayName: profiles.displayName,
      stutteringSeverity: profiles.stutteringSeverity,
      treatmentPath: profiles.treatmentPath,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile || !profile.onboardingCompleted) {
    return { onboardingCompleted: false, onboardingData: null };
  }

  const tp = (profile.treatmentPath as Record<string, unknown>) || {};

  return {
    onboardingCompleted: true,
    onboardingData: {
      name: (profile.displayName as string) || "",
      severity: profile.stutteringSeverity ?? null,
      fearedSituations: (tp.fearedSituations as string[]) || [],
      speechChallenges: (tp.speechChallenges as string[]) || [],
      northStarGoal: (tp.northStarGoal as string) || "",
      confidenceRatings: (tp.confidenceRatings as Record<string, number>) || {},
      avoidanceBehaviors: (tp.avoidanceBehaviors as string[]) || [],
      stutteringTypes: (tp.stutteringTypes as string[]) || [],
      speakingFrequency: (tp.speakingFrequency as string) || null,
      stutterFrequency: (tp.stutterFrequency as string) || null,
      stutterDuration: (tp.stutterDuration as string) || null,
      stutterImpact: (tp.stutterImpact as string) || null,
      severityScore: (tp.severityScore as number) || null,
      confidenceScore: (tp.confidenceScore as number) || null,
    },
  };
}

export interface ReturningUserStatus {
  isReturning: boolean;
  daysSinceLastPractice: number;
  previousStreak: number;
  streakWasLost: boolean;
  currentDay: number;
  userName: string | null;
}

/** Compute returning-user context from lastPracticeDate */
export async function getReturningUserStatus(): Promise<ReturningUserStatus> {
  const user = await requireAuth();

  const [stats] = await db
    .select({
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      lastPracticeDate: userStats.lastPracticeDate,
      currentDay: userStats.currentDay,
    })
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  const [profile] = await db
    .select({ displayName: profiles.displayName })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const userName = profile?.displayName ?? null;

  if (!stats || !stats.lastPracticeDate) {
    return {
      isReturning: false,
      daysSinceLastPractice: 0,
      previousStreak: 0,
      streakWasLost: false,
      currentDay: stats?.currentDay ?? 1,
      userName,
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastPractice = new Date(
    stats.lastPracticeDate.getFullYear(),
    stats.lastPracticeDate.getMonth(),
    stats.lastPracticeDate.getDate()
  );
  const daysSinceLastPractice = Math.floor(
    (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isReturning = daysSinceLastPractice >= 3;
  const streakWasLost =
    isReturning && stats.longestStreak > stats.currentStreak;

  return {
    isReturning,
    daysSinceLastPractice,
    previousStreak: stats.longestStreak,
    streakWasLost,
    currentDay: stats.currentDay,
    userName,
  };
}
