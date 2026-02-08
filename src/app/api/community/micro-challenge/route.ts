import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { microChallengeCompletions, userStats } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, and, sql } from "drizzle-orm";

/** GET — check if today's micro-challenge is completed */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ completed: false });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const [completion] = await db
      .select()
      .from(microChallengeCompletions)
      .where(
        and(
          eq(microChallengeCompletions.userId, userId),
          eq(microChallengeCompletions.challengeDate, today)
        )
      )
      .limit(1);

    return NextResponse.json({ completed: !!completion });
  } catch {
    return NextResponse.json({ completed: false });
  }
}

/** POST — complete today's micro-challenge */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeTitle, technique } = await req.json();
    const today = new Date().toISOString().slice(0, 10);

    // Check if already completed today
    const [existing] = await db
      .select()
      .from(microChallengeCompletions)
      .where(
        and(
          eq(microChallengeCompletions.userId, userId),
          eq(microChallengeCompletions.challengeDate, today)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ alreadyCompleted: true });
    }

    const xpEarned = 10;

    await db.insert(microChallengeCompletions).values({
      userId,
      challengeDate: today,
      challengeTitle,
      technique,
      xpEarned,
    });

    // Award XP
    await db
      .update(userStats)
      .set({
        totalXp: sql`${userStats.totalXp} + ${xpEarned}`,
      })
      .where(eq(userStats.userId, userId));

    return NextResponse.json({ ok: true, xpEarned });
  } catch (error) {
    console.error("Micro-challenge error:", error);
    return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 });
  }
}
