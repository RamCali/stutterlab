import { db } from "@/lib/db/client";
import {
  microChallengeAttempts,
  momentLogs,
  oasesCheckIns,
  profiles,
  sessions,
  userStats,
  weeklyReviews,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export interface SlpSharePackData {
  generatedAt: string;
  displayName: string;
  severity: string | null;
  currentStreak: number;
  longestStreak: number;
  totalPracticeMinutes: number;
  recentOases: { date: string; impactScore: number }[];
  recentMoments: { technique: string; severity: number; helped: boolean | null; date: string }[];
  recentChallenges: {
    title: string;
    outcome: string;
    predictedAnxiety: number;
    actualAnxiety: number | null;
    date: string;
  }[];
  latestWeeklyReview: {
    topWin: string;
    targetSituation: string;
    weekStart: string;
  } | null;
  sessionCount30d: number;
}

export async function buildSlpSharePack(userId: string): Promise<SlpSharePackData> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const oases = await db
    .select()
    .from(oasesCheckIns)
    .where(eq(oasesCheckIns.userId, userId))
    .orderBy(desc(oasesCheckIns.checkInDate))
    .limit(6);

  const moments = await db
    .select()
    .from(momentLogs)
    .where(eq(momentLogs.userId, userId))
    .orderBy(desc(momentLogs.createdAt))
    .limit(10);

  const challenges = await db
    .select()
    .from(microChallengeAttempts)
    .where(eq(microChallengeAttempts.userId, userId))
    .orderBy(desc(microChallengeAttempts.createdAt))
    .limit(10);

  const [weekly] = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.userId, userId))
    .orderBy(desc(weeklyReviews.createdAt))
    .limit(1);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.startedAt))
    .limit(100);

  const sessionCount30d = recentSessions.filter(
    (s) => s.startedAt && s.startedAt >= thirtyDaysAgo
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    displayName: profile?.displayName ?? "StutterLab member",
    severity: profile?.stutteringSeverity ?? null,
    currentStreak: stats?.currentStreak ?? 0,
    longestStreak: stats?.longestStreak ?? 0,
    totalPracticeMinutes: Math.round((stats?.totalPracticeSeconds ?? 0) / 60),
    recentOases: oases.map((o) => ({
      date: o.checkInDate,
      impactScore: o.impactScore,
    })),
    recentMoments: moments.map((m) => ({
      technique: m.technique,
      severity: m.severity,
      helped: m.helped,
      date: m.createdAt.toISOString(),
    })),
    recentChallenges: challenges.map((c) => ({
      title: c.challengeTitle,
      outcome: c.outcome,
      predictedAnxiety: c.predictedAnxiety,
      actualAnxiety: c.actualAnxiety,
      date: c.attemptDate,
    })),
    latestWeeklyReview: weekly
      ? {
          topWin: weekly.topWin,
          targetSituation: weekly.targetSituation,
          weekStart: weekly.weekStart,
        }
      : null,
    sessionCount30d,
  };
}
