"use server";

import { db } from "@/lib/db/client";
import { userStats, techniqueOutcomes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import type { TechniqueCategory } from "@/lib/curriculum/technique-categories";

export interface CategoryStats {
  category: TechniqueCategory;
  sessionCount: number;
  avgConfidenceDelta: number;
  avgFluencyRating: number;
}

export interface TechniqueOutcomeSummary {
  fluencyShaping: CategoryStats;
  modification: CategoryStats;
  recommendedWeight: number; // 0-1, proportion for fluency shaping (1 - this = modification)
  totalSessions: number;
}

/** Get the user's current curriculum day */
export async function getCurrentDay(): Promise<number> {
  const user = await requireAuth();

  const [stats] = await db
    .select({ currentDay: userStats.currentDay })
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  return stats?.currentDay ?? 1;
}

/** Increment currentDay by 1 after completing a daily session */
export async function advanceDay(): Promise<number> {
  const user = await requireAuth();

  // Ensure stats row exists
  await ensureUserStats(user.id);

  const [updated] = await db
    .update(userStats)
    .set({
      currentDay: sql`${userStats.currentDay} + 1`,
    })
    .where(eq(userStats.userId, user.id))
    .returning({ currentDay: userStats.currentDay });

  return updated?.currentDay ?? 1;
}

/** Ensure a userStats row exists for the given userId */
export async function ensureUserStats(userId: string) {
  const [existing] = await db
    .select({ id: userStats.id })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!existing) {
    await db.insert(userStats).values({ userId });
  }
}

/**
 * Aggregate the last 30 technique outcomes into per-category stats.
 * Used by the adaptive engine to weight technique selection.
 */
export async function getUserOutcomeSummary(): Promise<TechniqueOutcomeSummary> {
  const user = await requireAuth();

  const outcomes = await db
    .select()
    .from(techniqueOutcomes)
    .where(eq(techniqueOutcomes.userId, user.id))
    .orderBy(desc(techniqueOutcomes.createdAt))
    .limit(30);

  const fsOutcomes = outcomes.filter((o) => o.category === "fluency_shaping");
  const modOutcomes = outcomes.filter(
    (o) => o.category === "stuttering_modification"
  );

  const fluencyShaping = computeCategoryStats("fluency_shaping", fsOutcomes);
  const modification = computeCategoryStats(
    "stuttering_modification",
    modOutcomes
  );

  // Compute recommended weight for fluency shaping
  let recommendedWeight = 0.5; // default: balanced
  if (fluencyShaping.sessionCount >= 3 && modification.sessionCount >= 3) {
    const fsDelta = fluencyShaping.avgConfidenceDelta;
    const modDelta = modification.avgConfidenceDelta;
    const diff = fsDelta - modDelta;

    if (diff > 1.5) {
      recommendedWeight = 0.7; // fluency shaping clearly better
    } else if (diff < -1.5) {
      recommendedWeight = 0.3; // modification clearly better
    } else {
      // Scale between 0.4 and 0.6 based on difference
      recommendedWeight = 0.5 + diff * 0.067; // ~0.1 shift per 1.5 points
      recommendedWeight = Math.max(0.3, Math.min(0.7, recommendedWeight));
    }
  }

  return {
    fluencyShaping,
    modification,
    recommendedWeight,
    totalSessions: outcomes.length,
  };
}

function computeCategoryStats(
  category: TechniqueCategory,
  outcomes: (typeof techniqueOutcomes.$inferSelect)[]
): CategoryStats {
  if (outcomes.length === 0) {
    return {
      category,
      sessionCount: 0,
      avgConfidenceDelta: 0,
      avgFluencyRating: 0,
    };
  }

  const deltas = outcomes
    .map((o) => o.confidenceDelta)
    .filter((d): d is number => d !== null);
  const ratings = outcomes
    .map((o) => o.selfRatedFluency)
    .filter((r): r is number => r !== null);

  return {
    category,
    sessionCount: outcomes.length,
    avgConfidenceDelta:
      deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0,
    avgFluencyRating:
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0,
  };
}
