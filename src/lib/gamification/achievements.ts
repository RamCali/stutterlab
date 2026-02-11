"use server";

import { db } from "@/lib/db/client";
import { userStats } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureUserStats } from "@/lib/actions/user-progress";

/* ─── Achievement Definitions ─── */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  check: (stats: AchievementCheckStats) => boolean;
}

export interface AchievementCheckStats {
  totalExercisesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  totalPracticeSeconds: number;
  aiConversationCount?: number;
  journalCount?: number;
  fearedWordsMastered?: number;
  thoughtRecordCount?: number;
  weeklyAuditCount?: number;
  stressSessionCount?: number;
  stressLevel3HighFluency?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Getting Started
  {
    id: "first_steps",
    title: "First Steps",
    description: "Complete your first exercise",
    emoji: "🎯",
    xpReward: 25,
    check: (s) => s.totalExercisesCompleted >= 1,
  },
  {
    id: "warm_up",
    title: "Warm Up",
    description: "Complete 5 exercises",
    emoji: "🌅",
    xpReward: 50,
    check: (s) => s.totalExercisesCompleted >= 5,
  },
  {
    id: "ten_sessions",
    title: "Double Digits",
    description: "Complete 10 exercises",
    emoji: "🔟",
    xpReward: 75,
    check: (s) => s.totalExercisesCompleted >= 10,
  },

  // Streaks
  {
    id: "streak_3",
    title: "Consistent",
    description: "3-day practice streak",
    emoji: "🔥",
    xpReward: 30,
    check: (s) => s.currentStreak >= 3 || s.longestStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Dedicated",
    description: "7-day practice streak",
    emoji: "⚡",
    xpReward: 75,
    check: (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    id: "streak_14",
    title: "Two Weeks Strong",
    description: "14-day practice streak",
    emoji: "💪",
    xpReward: 150,
    check: (s) => s.currentStreak >= 14 || s.longestStreak >= 14,
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "30-day practice streak",
    emoji: "⭐",
    xpReward: 300,
    check: (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
  },
  {
    id: "streak_60",
    title: "Unstoppable",
    description: "60-day practice streak",
    emoji: "🏆",
    xpReward: 500,
    check: (s) => s.currentStreak >= 60 || s.longestStreak >= 60,
  },
  {
    id: "streak_90",
    title: "Program Graduate",
    description: "90-day practice streak",
    emoji: "🎓",
    xpReward: 1000,
    check: (s) => s.currentStreak >= 90 || s.longestStreak >= 90,
  },

  // Volume
  {
    id: "fifty_sessions",
    title: "Half Century",
    description: "Complete 50 exercises",
    emoji: "🎯",
    xpReward: 150,
    check: (s) => s.totalExercisesCompleted >= 50,
  },
  {
    id: "century",
    title: "Century",
    description: "Complete 100 exercises",
    emoji: "💯",
    xpReward: 300,
    check: (s) => s.totalExercisesCompleted >= 100,
  },

  // Practice Time
  {
    id: "hour_one",
    title: "First Hour",
    description: "Practice for 1 hour total",
    emoji: "⏱️",
    xpReward: 50,
    check: (s) => s.totalPracticeSeconds >= 3600,
  },
  {
    id: "five_hours",
    title: "Dedicated Practitioner",
    description: "Practice for 5 hours total",
    emoji: "📚",
    xpReward: 150,
    check: (s) => s.totalPracticeSeconds >= 18000,
  },
  {
    id: "ten_hours",
    title: "Time Investor",
    description: "Practice for 10 hours total",
    emoji: "🕐",
    xpReward: 250,
    check: (s) => s.totalPracticeSeconds >= 36000,
  },

  // AI Conversations
  {
    id: "brave_caller",
    title: "Brave Caller",
    description: "Complete your first AI conversation",
    emoji: "📞",
    xpReward: 50,
    check: (s) => (s.aiConversationCount ?? 0) >= 1,
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Complete 10 AI conversations",
    emoji: "🦋",
    xpReward: 150,
    check: (s) => (s.aiConversationCount ?? 0) >= 10,
  },
  {
    id: "conversation_pro",
    title: "Conversation Pro",
    description: "Complete 25 AI conversations",
    emoji: "🗣️",
    xpReward: 300,
    check: (s) => (s.aiConversationCount ?? 0) >= 25,
  },

  // Feared Words
  {
    id: "word_warrior",
    title: "Word Warrior",
    description: "Master your first feared word",
    emoji: "⚔️",
    xpReward: 50,
    check: (s) => (s.fearedWordsMastered ?? 0) >= 1,
  },
  {
    id: "word_conqueror",
    title: "Word Conqueror",
    description: "Master 10 feared words",
    emoji: "👑",
    xpReward: 200,
    check: (s) => (s.fearedWordsMastered ?? 0) >= 10,
  },

  // Journaling
  {
    id: "journaler",
    title: "Journaler",
    description: "Record 7 voice journals",
    emoji: "📝",
    xpReward: 75,
    check: (s) => (s.journalCount ?? 0) >= 7,
  },

  // XP Milestones
  {
    id: "xp_500",
    title: "Rising Star",
    description: "Earn 500 XP",
    emoji: "🌟",
    xpReward: 25,
    check: (s) => s.totalXp >= 500,
  },
  {
    id: "xp_2000",
    title: "Shining Bright",
    description: "Earn 2,000 XP",
    emoji: "✨",
    xpReward: 50,
    check: (s) => s.totalXp >= 2000,
  },
  {
    id: "xp_5000",
    title: "XP Legend",
    description: "Earn 5,000 XP",
    emoji: "🏅",
    xpReward: 100,
    check: (s) => s.totalXp >= 5000,
  },

  // Weekly Clinical Audits
  {
    id: "clinical_scholar",
    title: "Clinical Scholar",
    description: "Complete your first weekly clinical audit",
    emoji: "🔬",
    xpReward: 75,
    check: (s) => (s.weeklyAuditCount ?? 0) >= 1,
  },
  {
    id: "month_of_measurement",
    title: "Month of Measurement",
    description: "Complete 4 weekly clinical audits",
    emoji: "📊",
    xpReward: 200,
    check: (s) => (s.weeklyAuditCount ?? 0) >= 4,
  },
  {
    id: "quarter_tracker",
    title: "Quarter Tracker",
    description: "Complete 12 weekly clinical audits",
    emoji: "📈",
    xpReward: 500,
    check: (s) => (s.weeklyAuditCount ?? 0) >= 12,
  },

  // Stress Simulator
  {
    id: "pressure_proof",
    title: "Pressure Proof",
    description: "Complete 5 stress simulator sessions",
    emoji: "🧊",
    xpReward: 150,
    check: (s) => (s.stressSessionCount ?? 0) >= 5,
  },
  {
    id: "ice_under_fire",
    title: "Ice Under Fire",
    description: "Score 80+ fluency in a Level 3 stress session",
    emoji: "🔥",
    xpReward: 300,
    check: (s) => s.stressLevel3HighFluency === true,
  },
];

/* ─── Check & Unlock ─── */

export async function checkAndUnlockAchievements(
  userId: string,
  extraStats?: Partial<AchievementCheckStats>
): Promise<AchievementDef[]> {
  await ensureUserStats(userId);

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) return [];

  const currentAchievements = (stats.achievements as string[]) || [];

  const checkStats: AchievementCheckStats = {
    totalExercisesCompleted: stats.totalExercisesCompleted,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalXp: stats.totalXp,
    totalPracticeSeconds: stats.totalPracticeSeconds,
    ...extraStats,
  };

  const newlyUnlocked: AchievementDef[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (currentAchievements.includes(achievement.id)) continue;

    if (achievement.check(checkStats)) {
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    const updatedAchievements = [
      ...currentAchievements,
      ...newlyUnlocked.map((a) => a.id),
    ];

    const totalXpReward = newlyUnlocked.reduce((s, a) => s + a.xpReward, 0);

    await db
      .update(userStats)
      .set({
        achievements: updatedAchievements,
        totalXp: sql`${userStats.totalXp} + ${totalXpReward}`,
      })
      .where(eq(userStats.userId, userId));
  }

  return newlyUnlocked;
}

/* ─── Get All Achievement Status ─── */

export async function getAchievementStatus(userId: string) {
  await ensureUserStats(userId);

  const [stats] = await db
    .select({ achievements: userStats.achievements })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  const unlocked = (stats?.achievements as string[]) || [];

  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlocked.includes(a.id),
    check: undefined, // Don't serialize functions
  }));
}
