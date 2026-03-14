"use server";

import { db } from "@/lib/db/client";
import {
  aiConversations,
  fearedWords,
  speechSituations,
  sessions,
  speechAnalyses,
  monthlyReports,
  userStats,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import {
  extractDisfluencyWords,
  mapDisfluenciesToPhonemes,
  computeDifficultyScore,
} from "@/lib/analysis/phoneme-mapper";
import {
  computeTechniqueMastery,
  getTechniqueRecommendations,
  computeOverallMasteryScore,
} from "@/lib/analysis/technique-tracker";
import { analyzePatterns } from "@/lib/analysis/predictive-coach";
import { detectTransferGaps } from "@/lib/analysis/transfer-gap";

import { generatePhonemeTargetedPractice as genPractice } from "@/lib/analysis/phoneme-word-bank";
import type {
  PhonemeHeatmapData,
  TechniqueHistory,
  CoachingInsight,
  TransferReport,
  SessionScorecard,
  SessionComparison,
  PhonemeDifficulty,
} from "@/lib/analysis/types";

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

/* ─── Feature 1: Phoneme Heatmap ─── */

export async function getPhonemeHeatmap(): Promise<PhonemeHeatmapData> {
  const user = await requireAuth();

  // Fetch disfluency data from two sources
  const [analyses, conversations] = await Promise.all([
    db
      .select({
        triggerPhonemes: speechAnalyses.triggerPhonemes,
        analyzedAt: speechAnalyses.analyzedAt,
      })
      .from(speechAnalyses)
      .where(eq(speechAnalyses.userId, user.id))
      .orderBy(desc(speechAnalyses.analyzedAt))
      .limit(50),
    db
      .select({
        disfluencyMoments: aiConversations.disfluencyMoments,
        completedAt: aiConversations.completedAt,
      })
      .from(aiConversations)
      .where(eq(aiConversations.userId, user.id))
      .orderBy(desc(aiConversations.completedAt))
      .limit(50),
  ]);

  // Split into recent (last 14 days) vs older for trend computation
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  interface PhonemeAgg {
    attempts: number; disfluencyCount: number; words: Set<string>; lastSeen: Date;
    recentAttempts: number; recentDisfluencies: number;
    olderAttempts: number; olderDisfluencies: number;
  }

  const phonemeMap = new Map<string, PhonemeAgg>();

  const getOrCreate = (phoneme: string, date: Date): PhonemeAgg => {
    return phonemeMap.get(phoneme) || {
      attempts: 0, disfluencyCount: 0, words: new Set<string>(), lastSeen: date,
      recentAttempts: 0, recentDisfluencies: 0, olderAttempts: 0, olderDisfluencies: 0,
    };
  };

  for (const conv of conversations) {
    const isRecent = conv.completedAt >= twoWeeksAgo;
    const events = extractDisfluencyWords(conv.disfluencyMoments);
    const phonemeAggs = mapDisfluenciesToPhonemes(events);

    for (const [phoneme, agg] of phonemeAggs) {
      const existing = getOrCreate(phoneme, conv.completedAt);
      existing.attempts += agg.attempts;
      existing.disfluencyCount += agg.disfluencyCount;
      if (isRecent) {
        existing.recentAttempts += agg.attempts;
        existing.recentDisfluencies += agg.disfluencyCount;
      } else {
        existing.olderAttempts += agg.attempts;
        existing.olderDisfluencies += agg.disfluencyCount;
      }
      for (const w of agg.words) existing.words.add(w);
      if (conv.completedAt > existing.lastSeen) existing.lastSeen = conv.completedAt;
      phonemeMap.set(phoneme, existing);
    }
  }

  // Also merge data from speechAnalyses.triggerPhonemes
  for (const analysis of analyses) {
    const isRecent = analysis.analyzedAt >= twoWeeksAgo;
    const raw = analysis.triggerPhonemes;
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const phoneme = typeof item === "string" ? item : (item as Record<string, unknown>)?.phoneme;
        if (typeof phoneme !== "string") continue;

        const existing = getOrCreate(phoneme, analysis.analyzedAt);
        existing.attempts += 1;
        existing.disfluencyCount += 1;
        if (isRecent) {
          existing.recentAttempts += 1;
          existing.recentDisfluencies += 1;
        } else {
          existing.olderAttempts += 1;
          existing.olderDisfluencies += 1;
        }
        if (analysis.analyzedAt > existing.lastSeen) existing.lastSeen = analysis.analyzedAt;
        phonemeMap.set(phoneme, existing);
      }
    }
  }

  // Compute trend by comparing recent vs older disfluency rates
  function computeTrend(d: PhonemeAgg): "improving" | "stable" | "worsening" {
    if (d.olderAttempts < 2 || d.recentAttempts < 2) return "stable";
    const recentRate = d.recentDisfluencies / d.recentAttempts;
    const olderRate = d.olderDisfluencies / d.olderAttempts;
    const diff = olderRate - recentRate;
    if (diff > 0.1) return "improving";
    if (diff < -0.1) return "worsening";
    return "stable";
  }

  // Build phoneme difficulty array
  const phonemes: PhonemeDifficulty[] = [];
  for (const [phoneme, data] of phonemeMap) {
    phonemes.push({
      phoneme,
      totalAttempts: data.attempts,
      disfluencyCount: data.disfluencyCount,
      difficultyScore: computeDifficultyScore(data.disfluencyCount, data.attempts),
      trend: computeTrend(data),
      lastSeen: data.lastSeen.toISOString(),
      triggerWords: [...data.words].slice(0, 10),
    });
  }

  // Sort by difficulty
  phonemes.sort((a, b) => b.difficultyScore - a.difficultyScore);

  return {
    phonemes,
    topDifficult: phonemes.slice(0, 5).map((p) => p.phoneme),
    totalAnalyzed: analyses.length + conversations.length,
    lastUpdated: new Date().toISOString(),
  };
}

export async function generatePhonemeTargetedPractice(
  phonemes: string[]
): Promise<string[]> {
  return genPractice(phonemes, 8);
}

/* ─── Feature 2: Technique Mastery ─── */

export async function getTechniqueMastery(): Promise<TechniqueHistory> {
  const user = await requireAuth();

  const conversations = await db
    .select({
      techniquesUsed: aiConversations.techniquesUsed,
      completedAt: aiConversations.completedAt,
    })
    .from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(desc(aiConversations.completedAt))
    .limit(100);

  const mastery = computeTechniqueMastery(
    conversations.map((c) => ({
      techniquesUsed: c.techniquesUsed,
      completedAt: c.completedAt,
    }))
  );

  const recommendations = getTechniqueRecommendations(mastery);
  const overallMasteryScore = computeOverallMasteryScore(mastery);

  return { techniques: mastery, recommendations, overallMasteryScore };
}

/* ─── Feature 4: Predictive Coaching ─── */

export async function getCoachingInsights(): Promise<CoachingInsight> {
  const user = await requireAuth();

  const [recentSessions, recentConversations, recentSituations, stats] =
    await Promise.all([
      db
        .select({
          startedAt: sessions.startedAt,
          aiFluencyScore: sessions.aiFluencyScore,
          exerciseType: sessions.exerciseType,
          durationSeconds: sessions.durationSeconds,
        })
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .orderBy(desc(sessions.startedAt))
        .limit(60),
      db
        .select({
          scenarioType: aiConversations.scenarioType,
          fluencyScore: aiConversations.fluencyScore,
          stressLevel: aiConversations.stressLevel,
          completedAt: aiConversations.completedAt,
        })
        .from(aiConversations)
        .where(eq(aiConversations.userId, user.id))
        .orderBy(desc(aiConversations.completedAt))
        .limit(30),
      db
        .select({
          situationType: speechSituations.situationType,
          anxietyBefore: speechSituations.anxietyBefore,
          fluencyRating: speechSituations.fluencyRating,
          createdAt: speechSituations.createdAt,
        })
        .from(speechSituations)
        .where(eq(speechSituations.userId, user.id))
        .orderBy(desc(speechSituations.createdAt))
        .limit(20),
      db
        .select({
          currentStreak: userStats.currentStreak,
          lastPracticeDate: userStats.lastPracticeDate,
        })
        .from(userStats)
        .where(eq(userStats.userId, user.id))
        .limit(1),
    ]);

  return analyzePatterns({
    sessions: recentSessions,
    conversations: recentConversations,
    situations: recentSituations,
    currentStreak: stats[0]?.currentStreak ?? 0,
    lastPracticeDate: stats[0]?.lastPracticeDate ?? null,
  });
}

/* ─── Feature 5: Session Comparison ─── */

export async function getSessionComparison(
  scenarioType: string
): Promise<SessionComparison> {
  const user = await requireAuth();

  const conversations = await db
    .select({
      sessionScorecard: aiConversations.sessionScorecard,
      completedAt: aiConversations.completedAt,
    })
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.userId, user.id),
        eq(aiConversations.scenarioType, scenarioType)
      )
    )
    .orderBy(desc(aiConversations.completedAt))
    .limit(20);

  // Compute averages across all scorecards
  const scorecards = conversations
    .map((c) => c.sessionScorecard as SessionScorecard | null)
    .filter((s): s is SessionScorecard => s != null);

  const averages: Record<string, number> = {};
  if (scorecards.length > 0) {
    // Get dimension names from the first scorecard
    const dimNames = scorecards[0].dimensions.map((d) => d.name);
    for (const name of dimNames) {
      const scores = scorecards
        .map((s) => s.dimensions.find((d) => d.name === name)?.score)
        .filter((s): s is number => s != null);
      averages[name] =
        scores.length > 0
          ? scores.reduce((s, v) => s + v, 0) / scores.length
          : 0;
    }
  }

  // Previous session (the most recent completed scorecard, excluding current)
  const previousSession =
    scorecards.length >= 2 ? scorecards[1] : null;

  return {
    averages,
    previousSession,
    totalSessionsForScenario: conversations.length,
  };
}

/* ─── Feature 7: Transfer Gap Detection ─── */

export async function getTransferGaps(): Promise<TransferReport | null> {
  const user = await requireAuth();

  const [conversations, situations, reports] = await Promise.all([
    db
      .select({
        fluencyScore: aiConversations.fluencyScore,
        stressLevel: aiConversations.stressLevel,
        techniquesUsed: aiConversations.techniquesUsed,
        completedAt: aiConversations.completedAt,
      })
      .from(aiConversations)
      .where(eq(aiConversations.userId, user.id))
      .orderBy(desc(aiConversations.completedAt))
      .limit(50),
    db
      .select({
        fluencyRating: speechSituations.fluencyRating,
        anxietyBefore: speechSituations.anxietyBefore,
        anxietyAfter: speechSituations.anxietyAfter,
        techniquesUsed: speechSituations.techniquesUsed,
        createdAt: speechSituations.createdAt,
      })
      .from(speechSituations)
      .where(eq(speechSituations.userId, user.id))
      .limit(30),
    db
      .select({
        fluencyScore: monthlyReports.fluencyScore,
        createdAt: monthlyReports.createdAt,
      })
      .from(monthlyReports)
      .where(eq(monthlyReports.userId, user.id))
      .limit(10),
  ]);

  // Need minimum data to detect gaps
  if (conversations.length < 5) return null;

  return detectTransferGaps({ conversations, situations, reports });
}
