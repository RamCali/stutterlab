"use server";

import { db } from "@/lib/db/client";
import { userStats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureUserStats } from "@/lib/actions/user-progress";

/* ─── XP Schedule ─── */

export type XpAction =
  | "exercise_complete"
  | "ai_conversation"
  | "daily_challenge"
  | "weekly_challenge"
  | "voice_journal"
  | "feared_word_practice"
  | "thought_record"
  | "daily_plan_complete"
  | "streak_bonus"
  | "weekly_audit";

const XP_BASE: Record<XpAction, number> = {
  exercise_complete: 15,
  ai_conversation: 30,
  daily_challenge: 75,
  weekly_challenge: 150,
  voice_journal: 15,
  feared_word_practice: 10,
  thought_record: 15,
  daily_plan_complete: 50,
  streak_bonus: 5,
  weekly_audit: 100,
};

export async function calculateXpForAction(
  action: XpAction,
  durationSeconds?: number
): Promise<number> {
  const base = XP_BASE[action];

  // Duration bonus for time-based activities
  if (durationSeconds && (action === "exercise_complete" || action === "ai_conversation")) {
    const durationBonus = Math.round((durationSeconds / 60) * 5);
    return Math.max(base, base + durationBonus);
  }

  return base;
}

/* ─── Award XP ─── */

export async function awardXp(
  userId: string,
  amount: number,
  source: string
): Promise<{ newTotal: number; leveledUp: boolean; newLevel: number }> {
  await ensureUserStats(userId);

  const [before] = await db
    .select({ totalXp: userStats.totalXp, level: userStats.level })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const oldLevel = before?.level ?? 1;

  const [updated] = await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${amount}`,
    })
    .where(eq(userStats.userId, userId))
    .returning({ totalXp: userStats.totalXp });

  const newTotal = updated?.totalXp ?? amount;
  const newLevel = (await getLevelForXp(newTotal)).level;

  if (newLevel > oldLevel) {
    await db
      .update(userStats)
      .set({ level: newLevel })
      .where(eq(userStats.userId, userId));
  }

  return {
    newTotal,
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
}

/* ─── Level System ─── */

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number; // 0-100
}

const LEVEL_TITLES = [
  "Beginner",        // 1
  "Getting Started",  // 2
  "Warming Up",       // 3
  "Building Momentum",// 4
  "Finding Your Voice",// 5
  "Confident Speaker", // 6
  "Fluency Builder",   // 7
  "Technique Master",  // 8
  "Speech Warrior",    // 9
  "Fluency Champion",  // 10
  "Voice Virtuoso",    // 11
  "Communication Pro",  // 12
  "Speech Legend",       // 13
];

function xpRequiredForLevel(level: number): number {
  // Progressive curve: each level needs more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 500...
  if (level <= 1) return 0;
  return Math.round(50 * Math.pow(level - 1, 1.8));
}

export async function getLevelForXp(totalXp: number): Promise<LevelInfo> {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp && level < LEVEL_TITLES.length) {
    level++;
  }

  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const xpInLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return {
    level,
    title: LEVEL_TITLES[level - 1] || LEVEL_TITLES[LEVEL_TITLES.length - 1],
    currentXp: totalXp,
    xpForCurrentLevel: currentLevelXp,
    xpForNextLevel: nextLevelXp,
    progress,
  };
}

/* ─── Get User Gamification Stats ─── */

export async function getUserGamificationStats(userId: string) {
  await ensureUserStats(userId);

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) {
    return {
      totalXp: 0,
      level: await getLevelForXp(0),
      currentStreak: 0,
      longestStreak: 0,
      achievements: [] as string[],
      totalExercisesCompleted: 0,
      totalPracticeSeconds: 0,
    };
  }

  return {
    totalXp: stats.totalXp,
    level: await getLevelForXp(stats.totalXp),
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    achievements: (stats.achievements as string[]) || [],
    totalExercisesCompleted: stats.totalExercisesCompleted,
    totalPracticeSeconds: stats.totalPracticeSeconds,
  };
}
