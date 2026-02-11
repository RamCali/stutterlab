"use server";

import { db } from "@/lib/db/client";
import {
  aiConversations,
  fearedWords,
  speechSituations,
  sessions,
} from "@/lib/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

/* ─── AI Conversation Analytics ─── */

export interface AIConversationSummary {
  id: string;
  scenarioType: string;
  fluencyScore: number | null;
  durationSeconds: number | null;
  techniquesUsed: string[];
  completedAt: Date;
}

export async function getAIConversationAnalytics() {
  const user = await requireAuth();

  const conversations = await db
    .select({
      id: aiConversations.id,
      scenarioType: aiConversations.scenarioType,
      fluencyScore: aiConversations.fluencyScore,
      durationSeconds: aiConversations.durationSeconds,
      techniquesUsed: aiConversations.techniquesUsed,
      completedAt: aiConversations.completedAt,
    })
    .from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(desc(aiConversations.completedAt))
    .limit(50);

  // Compute averages
  const withScores = conversations.filter(
    (c) => c.fluencyScore != null
  );
  const avgFluency =
    withScores.length > 0
      ? Math.round(
          withScores.reduce((s, c) => s + (c.fluencyScore ?? 0), 0) /
            withScores.length
        )
      : null;

  // Fluency trend (last 10 conversations)
  const recentTrend = withScores.slice(0, 10).reverse().map((c) => ({
    date: c.completedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: Math.round(c.fluencyScore ?? 0),
    scenario: c.scenarioType,
  }));

  // Scenario breakdown
  const scenarioCounts: Record<
    string,
    { count: number; avgScore: number; totalScore: number }
  > = {};
  for (const c of conversations) {
    const key = c.scenarioType;
    if (!scenarioCounts[key]) {
      scenarioCounts[key] = { count: 0, avgScore: 0, totalScore: 0 };
    }
    scenarioCounts[key].count++;
    if (c.fluencyScore != null) {
      scenarioCounts[key].totalScore += c.fluencyScore;
    }
  }
  for (const key of Object.keys(scenarioCounts)) {
    const s = scenarioCounts[key];
    s.avgScore = s.count > 0 ? Math.round(s.totalScore / s.count) : 0;
  }

  // Technique frequency across all conversations
  const techniqueTotals: Record<string, number> = {};
  for (const c of conversations) {
    const techs = c.techniquesUsed as string[] | null;
    if (techs) {
      for (const t of techs) {
        techniqueTotals[t] = (techniqueTotals[t] || 0) + 1;
      }
    }
  }

  // Total practice time from AI conversations
  const totalAIMinutes = Math.round(
    conversations.reduce((s, c) => s + (c.durationSeconds ?? 0), 0) / 60
  );

  return {
    totalConversations: conversations.length,
    avgFluency,
    totalAIMinutes,
    recentTrend,
    scenarioBreakdown: Object.entries(scenarioCounts).map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: data.avgScore,
    })),
    techniqueFrequency: Object.entries(techniqueTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    recentConversations: conversations.slice(0, 10).map((c) => ({
      id: c.id,
      scenarioType: c.scenarioType,
      fluencyScore: c.fluencyScore,
      durationSeconds: c.durationSeconds,
      completedAt: c.completedAt,
    })),
  };
}

/* ─── Feared Words Analytics ─── */

export async function getFearedWordsAnalytics() {
  const user = await requireAuth();

  const words = await db
    .select()
    .from(fearedWords)
    .where(eq(fearedWords.userId, user.id));

  const total = words.length;
  const mastered = words.filter((w) => w.mastered).length;
  const byDifficulty = {
    easy: words.filter((w) => w.difficulty === "easy").length,
    medium: words.filter((w) => w.difficulty === "medium").length,
    hard: words.filter((w) => w.difficulty === "hard").length,
  };

  const totalPracticeReps = words.reduce(
    (s, w) => s + w.practiceCount,
    0
  );

  return {
    total,
    mastered,
    masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
    byDifficulty,
    totalPracticeReps,
    words: words.map((w) => ({
      word: w.word,
      difficulty: w.difficulty,
      practiceCount: w.practiceCount,
      mastered: w.mastered,
    })),
  };
}

/* ─── Anxiety Trend Analytics ─── */

export async function getAnxietyTrend() {
  const user = await requireAuth();

  const situations = await db
    .select({
      anxietyBefore: speechSituations.anxietyBefore,
      anxietyAfter: speechSituations.anxietyAfter,
      fluencyRating: speechSituations.fluencyRating,
      situationType: speechSituations.situationType,
      createdAt: speechSituations.createdAt,
    })
    .from(speechSituations)
    .where(eq(speechSituations.userId, user.id))
    .orderBy(desc(speechSituations.createdAt))
    .limit(30);

  if (situations.length === 0) return null;

  // Compute averages
  const withAnxiety = situations.filter(
    (s) => s.anxietyBefore != null && s.anxietyAfter != null
  );
  const avgReduction =
    withAnxiety.length > 0
      ? withAnxiety.reduce(
          (s, si) => s + ((si.anxietyBefore ?? 0) - (si.anxietyAfter ?? 0)),
          0
        ) / withAnxiety.length
      : 0;

  // Trend data (oldest first)
  const trend = [...situations].reverse().map((s) => ({
    date: s.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    before: s.anxietyBefore ?? 0,
    after: s.anxietyAfter ?? 0,
    fluency: s.fluencyRating ?? 0,
  }));

  // By situation type
  const byType: Record<
    string,
    { count: number; avgReduction: number; totalReduction: number }
  > = {};
  for (const s of withAnxiety) {
    const type = s.situationType;
    if (!byType[type]) {
      byType[type] = { count: 0, avgReduction: 0, totalReduction: 0 };
    }
    byType[type].count++;
    byType[type].totalReduction +=
      (s.anxietyBefore ?? 0) - (s.anxietyAfter ?? 0);
  }
  for (const key of Object.keys(byType)) {
    byType[key].avgReduction = byType[key].count > 0
      ? Math.round((byType[key].totalReduction / byType[key].count) * 10) / 10
      : 0;
  }

  return {
    totalSituations: situations.length,
    avgAnxietyReduction: Math.round(avgReduction * 10) / 10,
    trend,
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.count,
      avgReduction: data.avgReduction,
    })),
  };
}
