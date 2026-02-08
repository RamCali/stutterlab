"use server";

import { db } from "@/lib/db/client";
import {
  exerciseCompletions,
  userStats,
  sessions,
  techniqueOutcomes,
} from "@/lib/db/schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import type { TechniqueCategory } from "@/lib/curriculum/technique-categories";
import { ensureUserStats } from "@/lib/actions/user-progress";

export async function completeExercise(data: {
  exerciseId: string;
  exerciseType: string;
  durationSeconds: number;
  selfRatedFluency?: number;
}) {
  const user = await requireAuth();
  const xp = calculateXp(data.durationSeconds);

  // Create session
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      exerciseType: data.exerciseType,
      durationSeconds: data.durationSeconds,
      selfRatedFluency: data.selfRatedFluency,
      endedAt: new Date(),
    })
    .returning();

  // Create completion
  await db.insert(exerciseCompletions).values({
    userId: user.id,
    sessionId: session.id,
    exerciseId: data.exerciseId,
    xpEarned: xp,
  });

  // Update user stats
  await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${xp}`,
      totalExercisesCompleted: sql`${userStats.totalExercisesCompleted} + 1`,
      totalPracticeSeconds: sql`${userStats.totalPracticeSeconds} + ${data.durationSeconds}`,
      lastPracticeDate: new Date(),
    })
    .where(eq(userStats.userId, user.id));

  // Update streak
  await updateStreak(user.id);

  return { xp, sessionId: session.id };
}

async function updateStreak(userId: string) {
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastPractice = stats.lastPracticeDate
    ? new Date(
        stats.lastPracticeDate.getFullYear(),
        stats.lastPracticeDate.getMonth(),
        stats.lastPracticeDate.getDate()
      )
    : null;

  let newStreak = stats.currentStreak;

  if (!lastPractice) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor(
      (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // Already practiced today — no change
      return;
    } else if (diffDays === 1) {
      newStreak = stats.currentStreak + 1;
    } else {
      newStreak = 1; // Streak broken
    }
  }

  await db
    .update(userStats)
    .set({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
    })
    .where(eq(userStats.userId, userId));
}

function calculateXp(durationSeconds: number): number {
  // Base: 10 XP per minute, minimum 5 XP
  return Math.max(5, Math.round((durationSeconds / 60) * 10));
}

export async function getRecentSessions(limit = 10) {
  const user = await requireAuth();

  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.startedAt))
    .limit(limit);
}

export async function getTodayCompletions() {
  const user = await requireAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db
    .select()
    .from(exerciseCompletions)
    .where(
      and(
        eq(exerciseCompletions.userId, user.id),
        gte(exerciseCompletions.completedAt, today)
      )
    );
}

/**
 * Complete a full daily practice session.
 * Creates a session, records technique outcome for A/B analysis,
 * and updates user stats (XP, streak, practice time).
 */
export async function completeSession(data: {
  techniqueId: string;
  techniqueCategory: TechniqueCategory;
  durationSeconds: number;
  confidenceBefore?: number;
  confidenceAfter?: number;
  selfRatedFluency?: number;
  contentLevel?: string;
  mood: string;
  note: string;
}) {
  const user = await requireAuth();
  const xp = calculateXp(data.durationSeconds);

  // Ensure stats row exists
  await ensureUserStats(user.id);

  // Create session with new confidence + category fields
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      exerciseType: data.techniqueId,
      techniqueCategory: data.techniqueCategory,
      durationSeconds: data.durationSeconds,
      selfRatedFluency: data.selfRatedFluency,
      confidenceBefore: data.confidenceBefore,
      confidenceAfter: data.confidenceAfter,
      notes: data.note || null,
      endedAt: new Date(),
    })
    .returning();

  // Record technique outcome for A/B analysis
  const confidenceDelta =
    data.confidenceBefore != null && data.confidenceAfter != null
      ? data.confidenceAfter - data.confidenceBefore
      : null;

  await db.insert(techniqueOutcomes).values({
    userId: user.id,
    sessionId: session.id,
    techniqueId: data.techniqueId,
    category: data.techniqueCategory,
    confidenceDelta,
    completionRate: 1.0, // completed session = 100%
    selfRatedFluency: data.selfRatedFluency,
    durationSeconds: data.durationSeconds,
    contentLevel: data.contentLevel,
  });

  // Update user stats
  await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${xp}`,
      totalExercisesCompleted: sql`${userStats.totalExercisesCompleted} + 1`,
      totalPracticeSeconds: sql`${userStats.totalPracticeSeconds} + ${data.durationSeconds}`,
      lastPracticeDate: new Date(),
    })
    .where(eq(userStats.userId, user.id));

  // Update streak
  await updateStreak(user.id);

  return { xp, sessionId: session.id };
}
