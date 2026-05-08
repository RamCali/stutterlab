import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { communityVictories } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";

const celebrateSchema = z.object({
  victoryId: z.string().uuid(),
});

/** POST — celebrate (heart) a victory */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit(`victory-celebrate:${userId}`, 60, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many celebrations. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = celebrateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid victory" }, { status: 400 });
    }

    await db
      .update(communityVictories)
      .set({
        celebrateCount: sql`${communityVictories.celebrateCount} + 1`,
      })
      .where(eq(communityVictories.id, parsed.data.victoryId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Celebrate error:", error);
    return NextResponse.json({ error: "Failed to celebrate" }, { status: 500 });
  }
}
