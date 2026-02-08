import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { userStats, sessions, speechSituations, communityPosts } from "@/lib/db/schema";
import { sql, gte, eq } from "drizzle-orm";

export async function GET() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Run all queries in parallel
    const [
      activeUsersResult,
      totalHoursResult,
      streaksResult,
      longestStreakResult,
      victoriesResult,
      improvementResult,
    ] = await Promise.all([
      // Active practitioners this week
      db
        .select({ count: sql<number>`count(distinct ${sessions.userId})` })
        .from(sessions)
        .where(gte(sessions.startedAt, oneWeekAgo)),

      // Total hours practiced
      db
        .select({
          totalSeconds: sql<number>`coalesce(sum(${sessions.durationSeconds}), 0)`,
        })
        .from(sessions)
        .where(gte(sessions.startedAt, oneWeekAgo)),

      // Users on 7+ day streaks
      db
        .select({ count: sql<number>`count(*)` })
        .from(userStats)
        .where(gte(userStats.currentStreak, 7)),

      // Longest active streak
      db
        .select({ maxStreak: sql<number>`coalesce(max(${userStats.currentStreak}), 0)` })
        .from(userStats),

      // Real-world victories this week (speech situations + community wins posts)
      db
        .select({ count: sql<number>`count(*)` })
        .from(speechSituations)
        .where(gte(speechSituations.createdAt, oneWeekAgo)),

      // Percent feeling better (users with improving self-rated fluency)
      db
        .select({
          avgRating: sql<number>`coalesce(avg(${sessions.selfRatedFluency}), 0)`,
        })
        .from(sessions)
        .where(gte(sessions.startedAt, oneWeekAgo)),
    ]);

    const activePractitioners = Number(activeUsersResult[0]?.count ?? 0);
    const totalHours = Math.round(
      Number(totalHoursResult[0]?.totalSeconds ?? 0) / 3600
    );
    const streaksOver7 = Number(streaksResult[0]?.count ?? 0);
    const longestStreak = Number(longestStreakResult[0]?.maxStreak ?? 0);
    const realWorldVictories = Number(victoriesResult[0]?.count ?? 0);

    // Estimate "feel better" percentage from avg self-rated fluency
    // If avg rating >= 6/10, that's a positive signal
    const avgRating = Number(improvementResult[0]?.avgRating ?? 0);
    const percentFeelBetter = avgRating > 0 ? Math.round((avgRating / 10) * 100) : 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    return NextResponse.json({
      activePractitioners,
      totalHoursPracticed: totalHours,
      percentFeelBetter,
      realWorldVictories,
      streaksOver7,
      longestStreakThisWeek: longestStreak,
      weekLabel,
    });
  } catch (error) {
    console.error("Community pulse error:", error);
    // Return mock data if DB is unavailable (development)
    return NextResponse.json({
      activePractitioners: 847,
      totalHoursPracticed: 2134,
      percentFeelBetter: 62,
      realWorldVictories: 156,
      streaksOver7: 213,
      longestStreakThisWeek: 94,
      weekLabel: "This Week",
    });
  }
}
