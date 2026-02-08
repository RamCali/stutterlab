import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { shadowingScores, userStats } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, sql, desc, and } from "drizzle-orm";

/** GET — fetch user's shadowing scores */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ scores: [] });
    }

    const scores = await db
      .select()
      .from(shadowingScores)
      .where(eq(shadowingScores.userId, userId))
      .orderBy(desc(shadowingScores.createdAt))
      .limit(50);

    return NextResponse.json({ scores });
  } catch {
    return NextResponse.json({ scores: [] });
  }
}

/** POST — save a shadowing score */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      clipId,
      technique,
      overallScore,
      rhythmMatch,
      techniqueAccuracy,
      paceMatch,
      stars,
      feedback,
      techniqueNotes,
      xpEarned,
    } = await req.json();

    const [score] = await db
      .insert(shadowingScores)
      .values({
        userId,
        clipId,
        technique,
        overallScore,
        rhythmMatch,
        techniqueAccuracy,
        paceMatch,
        stars,
        feedback,
        techniqueNotes,
        xpEarned: xpEarned || 0,
      })
      .returning();

    // Award XP
    if (xpEarned > 0) {
      await db
        .update(userStats)
        .set({
          totalXp: sql`${userStats.totalXp} + ${xpEarned}`,
        })
        .where(eq(userStats.userId, userId));
    }

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Shadowing score error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
