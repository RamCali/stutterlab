import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { shadowingScores, userStats } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";

const shadowingScoreSchema = z.object({
  clipId: z.string().min(1).max(120),
  technique: z.string().min(1).max(80),
  overallScore: z.number().int().min(0).max(100),
  rhythmMatch: z.number().int().min(0).max(100),
  techniqueAccuracy: z.number().int().min(0).max(100),
  paceMatch: z.number().int().min(0).max(100),
  stars: z.number().int().min(1).max(3),
  feedback: z.string().max(500).optional(),
  techniqueNotes: z.string().max(500).optional(),
});

/** GET — fetch user's shadowing scores */
export async function GET() {
  try {
    const user = await requireAuth();

    const scores = await db
      .select()
      .from(shadowingScores)
      .where(eq(shadowingScores.userId, user.id))
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
    const user = await requireAuth();

    const parsed = shadowingScoreSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
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
    } = parsed.data;
    const xpEarned = stars * 15;

    const [score] = await db
      .insert(shadowingScores)
      .values({
        userId: user.id,
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
      })
      .returning();

    // Award XP
    await db
      .update(userStats)
      .set({
        totalXp: sql`${userStats.totalXp} + ${xpEarned}`,
      })
      .where(eq(userStats.userId, user.id));

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Shadowing score error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
