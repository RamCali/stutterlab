import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { communityVictories, userStats } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { desc, sql, eq } from "drizzle-orm";

const ANONYMOUS_NAMES = [
  "Blue Phoenix", "Silver Fox", "Calm River", "Steady Oak",
  "Bright Star", "Gentle Wave", "Bold Eagle", "Warm Sun",
  "Swift Wind", "Strong Mountain", "Quiet Storm", "Rising Tide",
];

/** GET — fetch recent victories */
export async function GET() {
  try {
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
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { victoryType, description } = await req.json();

    if (!victoryType) {
      return NextResponse.json({ error: "victoryType is required" }, { status: 400 });
    }

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
