"use server";

import { db } from "@/lib/db/client";
import { microChallengeAttempts, userStats } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { getTodayChallenge } from "@/lib/actions/challenges";
import { ensureUserStats } from "@/lib/actions/user-progress";
import { sql } from "drizzle-orm";

export type MicroChallengeOutcome = "completed" | "partial" | "avoided";

export async function submitMicroChallengeAttempt(data: {
  challengeId?: string;
  challengeTitle: string;
  technique?: string;
  source?: string;
  predictedAnxiety: number;
  actualAnxiety: number;
  outcome: MicroChallengeOutcome;
  reflection?: string;
  voiceNoteUrl?: string;
}) {
  const user = await requireAuth();
  const today = new Date().toISOString().slice(0, 10);

  let challengeId = data.challengeId;
  if (!challengeId) {
    const todayChallenge = await getTodayChallenge();
    challengeId = todayChallenge.challenge.id;
  }

  const xpEarned =
    data.outcome === "completed" ? 50 : data.outcome === "partial" ? 25 : 10;

  const [row] = await db
    .insert(microChallengeAttempts)
    .values({
      userId: user.id,
      challengeId,
      challengeTitle: data.challengeTitle,
      technique: data.technique ?? null,
      source: data.source ?? "app",
      predictedAnxiety: data.predictedAnxiety,
      actualAnxiety: data.actualAnxiety,
      outcome: data.outcome,
      reflection: data.reflection ?? null,
      voiceNoteUrl: data.voiceNoteUrl ?? null,
      xpEarned,
      attemptDate: today,
    })
    .returning();

  await ensureUserStats(user.id);
  await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${xpEarned}`,
    })
    .where(eq(userStats.userId, user.id));

  return { success: true, attempt: row, xpEarned };
}

export async function getTodayMicroChallengeAttempt() {
  const user = await requireAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [row] = await db
    .select()
    .from(microChallengeAttempts)
    .where(
      and(
        eq(microChallengeAttempts.userId, user.id),
        eq(microChallengeAttempts.attemptDate, today)
      )
    )
    .orderBy(desc(microChallengeAttempts.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getMicroChallengeHistory(limit = 14) {
  const user = await requireAuth();
  return db
    .select()
    .from(microChallengeAttempts)
    .where(eq(microChallengeAttempts.userId, user.id))
    .orderBy(desc(microChallengeAttempts.createdAt))
    .limit(limit);
}
