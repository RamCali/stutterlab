import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { userStats } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, sql } from "drizzle-orm";

/** GET — fetch current user's stats */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ stats: null });
    }

    let [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    // Auto-create if missing
    if (!stats) {
      [stats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();
    }

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ stats: null });
  }
}

/** POST — update stats (add XP, update streak, etc.) */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, value } = await req.json();

    let [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (!stats) {
      [stats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();
    }

    switch (action) {
      case "add_xp":
        await db
          .update(userStats)
          .set({ totalXp: sql`${userStats.totalXp} + ${value || 0}` })
          .where(eq(userStats.userId, userId));
        break;

      case "record_practice": {
        const today = new Date();
        const lastPractice = stats.lastPracticeDate;
        let newStreak = stats.currentStreak;

        if (lastPractice) {
          const daysSinceLast = Math.floor(
            (today.getTime() - lastPractice.getTime()) / 86400000
          );
          if (daysSinceLast === 1) {
            newStreak += 1;
          } else if (daysSinceLast > 1) {
            // Check for streak freeze
            if (stats.streakFreezeTokens > 0 && daysSinceLast === 2) {
              newStreak += 1;
              await db
                .update(userStats)
                .set({
                  streakFreezeTokens: sql`${userStats.streakFreezeTokens} - 1`,
                })
                .where(eq(userStats.userId, userId));
            } else {
              newStreak = 1;
            }
          }
          // Same day = no change to streak
        } else {
          newStreak = 1;
        }

        await db
          .update(userStats)
          .set({
            currentStreak: newStreak,
            longestStreak: sql`GREATEST(${userStats.longestStreak}, ${newStreak})`,
            lastPracticeDate: today,
            totalPracticeSeconds: sql`${userStats.totalPracticeSeconds} + ${value || 0}`,
            totalExercisesCompleted: sql`${userStats.totalExercisesCompleted} + 1`,
          })
          .where(eq(userStats.userId, userId));
        break;
      }

      case "use_streak_shield":
        if (stats.streakFreezeTokens > 0) {
          await db
            .update(userStats)
            .set({
              streakFreezeTokens: sql`${userStats.streakFreezeTokens} - 1`,
            })
            .where(eq(userStats.userId, userId));
        }
        break;

      case "gift_streak_shield": {
        // Gift a shield to another user (value = target userId)
        if (stats.streakFreezeTokens > 0 && value) {
          await db
            .update(userStats)
            .set({
              streakFreezeTokens: sql`${userStats.streakFreezeTokens} - 1`,
            })
            .where(eq(userStats.userId, userId));

          // Give to recipient
          await db
            .update(userStats)
            .set({
              streakFreezeTokens: sql`${userStats.streakFreezeTokens} + 1`,
            })
            .where(eq(userStats.userId, value));
        }
        break;
      }
    }

    // Return updated stats
    const [updated] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    return NextResponse.json({ stats: updated });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
  }
}
