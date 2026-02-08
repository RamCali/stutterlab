import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  communityChallenges,
  challengeParticipants,
  userStats,
} from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { eq, sql, and, gte } from "drizzle-orm";

/** GET — fetch active challenges */
export async function GET() {
  try {
    const now = new Date();
    const challenges = await db
      .select()
      .from(communityChallenges)
      .where(gte(communityChallenges.endDate, now));

    // Check user participation
    const userId = await getUserId();
    let userParticipation: Record<string, number> = {};

    if (userId && challenges.length > 0) {
      const participations = await db
        .select()
        .from(challengeParticipants)
        .where(eq(challengeParticipants.userId, userId));

      for (const p of participations) {
        userParticipation[p.challengeId] = p.contribution;
      }
    }

    return NextResponse.json({
      challenges: challenges.map((c) => ({
        ...c,
        userContribution: userParticipation[c.id] || 0,
        joined: c.id in userParticipation,
      })),
    });
  } catch {
    // Return default challenges if DB unavailable
    return NextResponse.json({
      challenges: [
        {
          id: "default-1",
          title: "10,000 Practice Hours Together",
          description: "Community-wide practice time goal",
          targetValue: 10000,
          currentValue: 6847,
          xpReward: 500,
          participantCount: 423,
          userContribution: 0,
          joined: false,
        },
        {
          id: "default-2",
          title: "1,000 Active Streaks",
          description: "Get 1000 members on 7+ day streaks",
          targetValue: 1000,
          currentValue: 213,
          xpReward: 300,
          participantCount: 213,
          userContribution: 0,
          joined: false,
        },
        {
          id: "default-3",
          title: "5,000 Real-World Victories",
          description: "Log 5000 real-world speaking wins",
          targetValue: 5000,
          currentValue: 1892,
          xpReward: 400,
          participantCount: 847,
          userContribution: 0,
          joined: false,
        },
      ],
    });
  }
}

/** POST — join a challenge or contribute */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId, contribution } = await req.json();

    // Check if already participating
    const [existing] = await db
      .select()
      .from(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      // Update contribution
      await db
        .update(challengeParticipants)
        .set({
          contribution: sql`${challengeParticipants.contribution} + ${contribution || 1}`,
        })
        .where(eq(challengeParticipants.id, existing.id));
    } else {
      // Join the challenge
      await db.insert(challengeParticipants).values({
        challengeId,
        userId,
        contribution: contribution || 1,
      });

      // Increment participant count
      await db
        .update(communityChallenges)
        .set({
          participantCount: sql`${communityChallenges.participantCount} + 1`,
        })
        .where(eq(communityChallenges.id, challengeId));
    }

    // Increment challenge progress
    await db
      .update(communityChallenges)
      .set({
        currentValue: sql`${communityChallenges.currentValue} + ${contribution || 1}`,
      })
      .where(eq(communityChallenges.id, challengeId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Challenge error:", error);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}
