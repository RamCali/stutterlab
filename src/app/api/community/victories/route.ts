import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { communityVictories, userStats } from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";
import { desc, sql, eq } from "drizzle-orm";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";

const ANONYMOUS_NAMES = [
  "Blue Phoenix", "Silver Fox", "Calm River", "Steady Oak",
  "Bright Star", "Gentle Wave", "Bold Eagle", "Warm Sun",
  "Swift Wind", "Strong Mountain", "Quiet Storm", "Rising Tide",
];

const victorySchema = z.object({
  victoryType: z
    .enum([
      "phone_call",
      "meeting",
      "order",
      "presentation",
      "conversation",
      "asked_help",
    ])
    .or(z.string().min(1).max(40)),
  description: z.string().max(500).optional(),
});

/** GET — fetch recent victories */
export async function GET() {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const victories = await db
      .select()
      .from(communityVictories)
      .orderBy(desc(communityVictories.createdAt))
      .limit(20);

    return NextResponse.json({ victories });
  } catch {
    return NextResponse.json({ victories: [] });
  }
}

/** POST — log a new victory */
export async function POST(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;
    const { userId } = access;

    const rate = checkRateLimit(`victory-post:${userId}`, 10, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many victories. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = victorySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid victory" }, { status: 400 });
    }
    const { victoryType, description } = parsed.data;

    const anonymousName =
      ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];

    const [victory] = await db
      .insert(communityVictories)
      .values({
        userId,
        anonymousName,
        victoryType,
        description: description || null,
      })
      .returning();

    // Award 10 XP for logging a victory
    await db
      .update(userStats)
      .set({
        totalXp: sql`${userStats.totalXp} + 10`,
      })
      .where(eq(userStats.userId, userId));

    return NextResponse.json({ victory });
  } catch (error) {
    console.error("Victory POST error:", error);
    return NextResponse.json({ error: "Failed to log victory" }, { status: 500 });
  }
}
