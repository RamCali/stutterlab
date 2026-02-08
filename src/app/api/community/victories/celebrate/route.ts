import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { communityVictories } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, sql } from "drizzle-orm";

/** POST — celebrate (heart) a victory */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { victoryId } = await req.json();

    await db
      .update(communityVictories)
      .set({
        celebrateCount: sql`${communityVictories.celebrateCount} + 1`,
      })
      .where(eq(communityVictories.id, victoryId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Celebrate error:", error);
    return NextResponse.json({ error: "Failed to celebrate" }, { status: 500 });
  }
}
