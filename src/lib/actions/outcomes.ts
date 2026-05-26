"use server";

import { db } from "@/lib/db/client";
import { behavioralPredictions, oasesCheckIns } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { desc, eq } from "drizzle-orm";

export async function saveOasesCheckInToDb(input: {
  checkInDate: string;
  scores: Record<string, number>;
  impactScore: number;
}) {
  const user = await requireAuth();

  const rows = await db
    .select()
    .from(oasesCheckIns)
    .where(eq(oasesCheckIns.userId, user.id));

  const sameDay = rows.find((r) => r.checkInDate === input.checkInDate);
  if (sameDay) {
    await db
      .update(oasesCheckIns)
      .set({
        scores: input.scores,
        impactScore: input.impactScore,
      })
      .where(eq(oasesCheckIns.id, sameDay.id));
    return { ok: true as const };
  }

  await db.insert(oasesCheckIns).values({
    userId: user.id,
    checkInDate: input.checkInDate,
    scores: input.scores,
    impactScore: input.impactScore,
  });

  return { ok: true as const };
}

export async function getOasesCheckInsFromDb() {
  const user = await requireAuth();
  return db
    .select()
    .from(oasesCheckIns)
    .where(eq(oasesCheckIns.userId, user.id))
    .orderBy(desc(oasesCheckIns.checkInDate));
}

export async function syncBehavioralPredictionToDb(input: {
  clientId: string;
  situation: string;
  prediction: string;
  confidenceLevel: number;
  anxietyBefore: number;
  completed?: boolean;
  anxietyAfter?: number | null;
  actualOutcome?: string | null;
  completedAt?: string | null;
  createdAt?: string;
}) {
  const user = await requireAuth();

  const existing = await db
    .select()
    .from(behavioralPredictions)
    .where(eq(behavioralPredictions.userId, user.id));

  const match = existing.find((r) => r.clientId === input.clientId);

  if (match) {
    await db
      .update(behavioralPredictions)
      .set({
        situation: input.situation,
        prediction: input.prediction,
        confidenceLevel: input.confidenceLevel,
        anxietyBefore: input.anxietyBefore,
        anxietyAfter: input.anxietyAfter ?? null,
        actualOutcome: input.actualOutcome ?? null,
        completed: input.completed ?? match.completed,
        completedAt: input.completedAt
          ? new Date(input.completedAt)
          : match.completedAt,
      })
      .where(eq(behavioralPredictions.id, match.id));
    return { ok: true as const };
  }

  await db.insert(behavioralPredictions).values({
    userId: user.id,
    clientId: input.clientId,
    situation: input.situation,
    prediction: input.prediction,
    confidenceLevel: input.confidenceLevel,
    anxietyBefore: input.anxietyBefore,
    anxietyAfter: input.anxietyAfter ?? null,
    actualOutcome: input.actualOutcome ?? null,
    completed: input.completed ?? false,
    completedAt: input.completedAt ? new Date(input.completedAt) : null,
    createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
  });

  return { ok: true as const };
}

export async function getBehavioralPredictionsFromDb() {
  const user = await requireAuth();
  return db
    .select()
    .from(behavioralPredictions)
    .where(eq(behavioralPredictions.userId, user.id))
    .orderBy(desc(behavioralPredictions.createdAt));
}

export type BehavioralExperimentStats = {
  total: number;
  completed: number;
  pending: number;
  anxietyImprovedCount: number;
};

export async function getBehavioralExperimentStats(): Promise<BehavioralExperimentStats> {
  const user = await requireAuth();
  const rows = await db
    .select()
    .from(behavioralPredictions)
    .where(eq(behavioralPredictions.userId, user.id));

  const completed = rows.filter((r) => r.completed);
  const predictionsWorseThanReality = completed.filter((r) => {
    if (r.anxietyBefore == null || r.anxietyAfter == null) return false;
    return r.anxietyAfter < r.anxietyBefore;
  }).length;

  return {
    total: rows.length,
    completed: completed.length,
    pending: rows.length - completed.length,
    anxietyImprovedCount: predictionsWorseThanReality,
  };
}
