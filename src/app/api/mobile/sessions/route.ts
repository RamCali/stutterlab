import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sessions, userStats } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { ensureUserStats } from "@/lib/actions/user-progress";

/**
 * POST /api/mobile/sessions
 * Save a practice session and update streak/XP.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    await ensureUserStats(user.id);

    // Insert the session
    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        exerciseType: body.exerciseType ?? "daily_session",
        durationSeconds: body.durationSeconds ?? 0,
        selfRatedFluency: body.fluencyScore ?? null,
        confidenceBefore: body.confidenceBefore ?? null,
        confidenceAfter: body.confidenceAfter ?? null,
        notes: body.notes ?? null,
      })
      .returning();

    // Calculate XP: 10 XP/min, minimum 5
    const minutes = Math.max(1, (body.durationSeconds ?? 0) / 60);
    const xpEarned = Math.max(5, Math.round(minutes * 10));

    // Update stats: XP, practice time, exercises, streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);

    let newStreak = stats?.currentStreak ?? 0;
    let longestStreak = stats?.longestStreak ?? 0;

    if (stats?.lastPracticeDate) {
      const lastDate = new Date(stats.lastPracticeDate);
      const lastDay = new Date(
        lastDate.getFullYear(),
        lastDate.getMonth(),
        lastDate.getDate()
      );
      const diffDays = Math.floor(
        (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // diffDays === 0 means already practiced today
    } else {
      newStreak = 1;
    }
    longestStreak = Math.max(longestStreak, newStreak);

    await db
      .update(userStats)
      .set({
        totalXp: sql`${userStats.totalXp} + ${xpEarned}`,
        totalPracticeSeconds: sql`${userStats.totalPracticeSeconds} + ${body.durationSeconds ?? 0}`,
        totalExercisesCompleted: sql`${userStats.totalExercisesCompleted} + ${body.exercisesCompleted ?? 1}`,
        currentStreak: newStreak,
        longestStreak,
        lastPracticeDate: now,
      })
      .where(eq(userStats.userId, user.id));

    return NextResponse.json({
      sessionId: session.id,
      xpEarned,
      currentStreak: newStreak,
      longestStreak,
    });
  } catch (error) {
    console.error("Mobile sessions POST error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mobile/sessions
 * Get recent practice sessions.
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const recentSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.startedAt))
      .limit(30);

    return NextResponse.json({ sessions: recentSessions });
  } catch (error) {
    console.error("Mobile sessions GET error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
