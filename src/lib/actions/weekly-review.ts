"use server";

import { db } from "@/lib/db/client";
import { profiles, weeklyReviews } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { buildNextWeekPlan, getWeekStartISO } from "@/lib/weekly-review/plan";

export async function getWeeklyReviewStatus() {
  const user = await requireAuth();
  const weekStart = getWeekStartISO();
  const [existing] = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(eq(weeklyReviews.userId, user.id), eq(weeklyReviews.weekStart, weekStart))
    )
    .limit(1);
  return { weekStart, completed: Boolean(existing), review: existing ?? null };
}

export async function saveWeeklyReview(data: {
  topWin: string;
  topAvoidance?: string;
  targetSituation: string;
}) {
  const user = await requireAuth();
  const weekStart = getWeekStartISO();
  const nextWeekPlan = buildNextWeekPlan({
    topWin: data.topWin,
    topAvoidance: data.topAvoidance ?? null,
    targetSituation: data.targetSituation,
  });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const path = (profile?.treatmentPath as Record<string, unknown>) ?? {};
  await db
    .update(profiles)
    .set({
      treatmentPath: {
        ...path,
        nextWeekPlan,
        nextWeekPlanSetAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, user.id));

  const [existing] = await db
    .select({ id: weeklyReviews.id })
    .from(weeklyReviews)
    .where(
      and(eq(weeklyReviews.userId, user.id), eq(weeklyReviews.weekStart, weekStart))
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(weeklyReviews)
      .set({
        topWin: data.topWin,
        topAvoidance: data.topAvoidance ?? null,
        targetSituation: data.targetSituation,
        nextWeekPlan,
      })
      .where(eq(weeklyReviews.id, existing.id))
      .returning();
    return { success: true, review: updated, nextWeekPlan };
  }

  const [row] = await db
    .insert(weeklyReviews)
    .values({
      userId: user.id,
      weekStart,
      topWin: data.topWin,
      topAvoidance: data.topAvoidance ?? null,
      targetSituation: data.targetSituation,
      nextWeekPlan,
    })
    .returning();

  return { success: true, review: row, nextWeekPlan };
}

export async function getLatestWeeklyReview() {
  const user = await requireAuth();
  const [row] = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.userId, user.id))
    .orderBy(desc(weeklyReviews.createdAt))
    .limit(1);
  return row ?? null;
}
