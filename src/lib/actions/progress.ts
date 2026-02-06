"use server";

import { db } from "@/lib/db/client";
import { sessions, userStats, exerciseCompletions } from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getProgressData() {
  const user = await requireAuth();

  // Get user stats
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  // Get recent sessions (last 30)
  const recentSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.startedAt))
    .limit(30);

  // Get daily practice counts for last 365 days (for heatmap)
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const dailyCounts = await db
    .select({
      date: sql<string>`date(${sessions.startedAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, user.id),
        gte(sessions.startedAt, yearAgo)
      )
    )
    .groupBy(sql`date(${sessions.startedAt})`);

  // Get fluency trend (last 30 sessions with scores)
  const fluencyTrend = await db
    .select({
      date: sql<string>`date(${sessions.startedAt})`,
      score: sessions.selfRatedFluency,
      aiScore: sessions.aiFluencyScore,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, user.id),
        sql`${sessions.selfRatedFluency} is not null`
      )
    )
    .orderBy(sessions.startedAt)
    .limit(30);

  return {
    stats: stats ?? {
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      level: 1,
      achievements: [],
      totalPracticeSeconds: 0,
      totalExercisesCompleted: 0,
    },
    recentSessions,
    dailyCounts: dailyCounts.reduce(
      (acc, row) => {
        acc[row.date] = row.count;
        return acc;
      },
      {} as Record<string, number>
    ),
    fluencyTrend,
  };
}
