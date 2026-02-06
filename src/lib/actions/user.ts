"use server";

import { db } from "@/lib/db/client";
import { profiles, userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getOrCreateProfile() {
  const user = await requireAuth();

  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      displayName: user.name ?? "",
    })
    .returning();

  return profile;
}

export async function getOrCreateStats() {
  const user = await requireAuth();

  const existing = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [stats] = await db
    .insert(userStats)
    .values({ userId: user.id })
    .returning();

  return stats;
}

export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  stutteringSeverity?: "mild" | "moderate" | "severe";
}) {
  const user = await requireAuth();

  await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  return { success: true };
}

export async function getDashboardData() {
  const user = await requireAuth();

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return {
    stats: stats ?? {
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      level: 1,
      totalExercisesCompleted: 0,
      totalPracticeSeconds: 0,
      achievements: [],
      lastPracticeDate: null,
    },
    profile: profile[0] ?? null,
  };
}
