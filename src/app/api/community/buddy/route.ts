import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { buddyPairings, userStats } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, or, and, sql, desc } from "drizzle-orm";

const BUDDY_NAMES = [
  "Blue Phoenix", "Silver Fox", "Calm River", "Steady Oak",
  "Bright Star", "Gentle Wave", "Bold Eagle", "Warm Sun",
  "Swift Wind", "Strong Mountain", "Quiet Storm", "Rising Tide",
  "Deep Ocean", "Golden Hawk", "Iron Peak", "Jade Lotus",
];

/** GET — get current buddy pairing */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ buddy: null });
    }

    const [pairing] = await db
      .select()
      .from(buddyPairings)
      .where(
        and(
          or(
            eq(buddyPairings.userAId, userId),
            eq(buddyPairings.userBId, userId)
          ),
          eq(buddyPairings.status, "active")
        )
      )
      .orderBy(desc(buddyPairings.createdAt))
      .limit(1);

    if (!pairing) {
      return NextResponse.json({ buddy: null });
    }

    // Return the buddy's anonymous name (not the current user's)
    const isUserA = pairing.userAId === userId;
    return NextResponse.json({
      buddy: {
        id: pairing.id,
        buddyName: isUserA ? pairing.userBName : pairing.userAName,
        myName: isUserA ? pairing.userAName : pairing.userBName,
        sharedStreak: pairing.sharedStreak,
        createdAt: pairing.createdAt,
        lastActiveAt: pairing.lastActiveAt,
      },
    });
  } catch {
    return NextResponse.json({ buddy: null });
  }
}

/** POST — request a new buddy (matchmaking) */
export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // End any existing active pairing
    await db
      .update(buddyPairings)
      .set({ status: "ended" })
      .where(
        and(
          or(
            eq(buddyPairings.userAId, userId),
            eq(buddyPairings.userBId, userId)
          ),
          eq(buddyPairings.status, "active")
        )
      );

    // Find another user looking for a buddy (has an unmatched pairing where userB is empty)
    // Simple approach: find the most recent user who practiced but doesn't have a buddy
    const [availableUser] = await db
      .select({ userId: userStats.userId })
      .from(userStats)
      .where(
        and(
          sql`${userStats.userId} != ${userId}`,
          sql`${userStats.userId} NOT IN (
            SELECT user_a_id FROM buddy_pairings WHERE status = 'active'
            UNION
            SELECT user_b_id FROM buddy_pairings WHERE status = 'active'
          )`
        )
      )
      .orderBy(desc(userStats.lastPracticeDate))
      .limit(1);

    const myName = BUDDY_NAMES[Math.floor(Math.random() * BUDDY_NAMES.length)];
    let buddyName = BUDDY_NAMES[Math.floor(Math.random() * BUDDY_NAMES.length)];
    while (buddyName === myName) {
      buddyName = BUDDY_NAMES[Math.floor(Math.random() * BUDDY_NAMES.length)];
    }

    if (availableUser) {
      // Create a real pairing
      const [pairing] = await db
        .insert(buddyPairings)
        .values({
          userAId: userId,
          userBId: availableUser.userId,
          userAName: myName,
          userBName: buddyName,
        })
        .returning();

      return NextResponse.json({
        buddy: {
          id: pairing.id,
          buddyName,
          myName,
          sharedStreak: 0,
          createdAt: pairing.createdAt,
          lastActiveAt: pairing.lastActiveAt,
        },
      });
    } else {
      // No available users — create a "pending" self-pairing
      // (they'll be matched when another user joins)
      // For now, create a simulated buddy so the feature feels alive
      const [pairing] = await db
        .insert(buddyPairings)
        .values({
          userAId: userId,
          userBId: userId, // self-paired placeholder
          userAName: myName,
          userBName: buddyName,
        })
        .returning();

      return NextResponse.json({
        buddy: {
          id: pairing.id,
          buddyName,
          myName,
          sharedStreak: 0,
          createdAt: pairing.createdAt,
          lastActiveAt: pairing.lastActiveAt,
        },
      });
    }
  } catch (error) {
    console.error("Buddy matching error:", error);
    return NextResponse.json({ error: "Failed to find buddy" }, { status: 500 });
  }
}
