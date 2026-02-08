"use server";

import { db } from "@/lib/db/client";
import { monthlyReports, userStats } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getReportHistory() {
  const user = await requireAuth();

  return db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, user.id))
    .orderBy(desc(monthlyReports.month))
    .limit(24); // up to 2 years of history
}

export async function getLatestReport() {
  const user = await requireAuth();

  const [report] = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, user.id))
    .orderBy(desc(monthlyReports.month))
    .limit(1);

  return report ?? null;
}

export async function getReportByShareToken(shareToken: string) {
  const [report] = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.shareToken, shareToken))
    .limit(1);

  return report ?? null;
}

export async function getBeforeAfterData() {
  const user = await requireAuth();

  const reports = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, user.id))
    .orderBy(desc(monthlyReports.month));

  if (reports.length < 2) return null;

  const first = reports[reports.length - 1];
  const latest = reports[0];

  const firstMonth = new Date(first.month);
  const latestMonth = new Date(latest.month);
  const totalMonths = Math.max(
    1,
    Math.round((latestMonth.getTime() - firstMonth.getTime()) / (30.44 * 86400000))
  );

  // Get session count from userStats
  let totalSessions = reports.length;
  try {
    const [stats] = await db
      .select({ completed: userStats.totalExercisesCompleted })
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);
    if (stats?.completed) totalSessions = stats.completed;
  } catch {
    // Use report count as fallback
  }

  return {
    first: {
      month: firstMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      percentSS: first.percentSS ?? 0,
      severityRating: first.severityRating ?? "normal",
      fluencyScore: first.fluencyScore ?? 0,
      speakingRate: first.speakingRate ?? 0,
    },
    latest: {
      month: latestMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      percentSS: latest.percentSS ?? 0,
      severityRating: latest.severityRating ?? "normal",
      fluencyScore: latest.fluencyScore ?? 0,
      speakingRate: latest.speakingRate ?? 0,
    },
    totalMonths,
    totalSessions,
  };
}

export async function getDaysSinceLastReport(): Promise<number | null> {
  const user = await requireAuth();

  const [report] = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, user.id))
    .orderBy(desc(monthlyReports.createdAt))
    .limit(1);

  if (!report) return null;

  const diff = Date.now() - report.createdAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
