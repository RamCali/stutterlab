import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  communityPracticeRooms,
  communityRoomParticipants,
} from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";
import { checkRateLimit } from "@/lib/security/rate-limit";

const roomSchema = z.object({
  title: z.string().trim().min(4).max(80),
  description: z.string().trim().min(10).max(300),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(15).max(90).default(30),
  capacity: z.coerce.number().int().min(2).max(12).default(6),
});

function defaultRooms() {
  const first = new Date(Date.now() + 24 * 60 * 60 * 1000);
  first.setMinutes(0, 0, 0);
  const second = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  second.setMinutes(0, 0, 0);

  return [
    {
      id: "default-room-1",
      title: "Low-pressure introductions",
      description: "Practice saying your name, role, and one small win with other Premium members.",
      scheduledAt: first.toISOString(),
      durationMinutes: 30,
      capacity: 6,
      participantCount: 0,
      status: "scheduled",
      joined: false,
    },
    {
      id: "default-room-2",
      title: "Phone-call warmup circle",
      description: "A small group session for practicing greetings, pauses, and short phone scripts.",
      scheduledAt: second.toISOString(),
      durationMinutes: 30,
      capacity: 6,
      participantCount: 0,
      status: "scheduled",
      joined: false,
    },
  ];
}

export async function GET() {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const now = new Date(Date.now() - 60 * 60 * 1000);
    const rooms = await db
      .select()
      .from(communityPracticeRooms)
      .where(gte(communityPracticeRooms.scheduledAt, now))
      .orderBy(asc(communityPracticeRooms.scheduledAt))
      .limit(20);

    if (rooms.length === 0) {
      return NextResponse.json({ rooms: defaultRooms() });
    }

    const participations = await db
      .select()
      .from(communityRoomParticipants)
      .where(eq(communityRoomParticipants.userId, access.userId));
    const joined = new Set(participations.map((item) => item.roomId));

    return NextResponse.json({
      rooms: rooms.map((room) => ({
        ...room,
        joined: joined.has(room.id),
      })),
    });
  } catch (error) {
    console.error("Community rooms GET error:", error);
    return NextResponse.json({ rooms: defaultRooms() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const rate = checkRateLimit(`community-room:${access.userId}`, 5, 24 * 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many room requests. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const parsed = roomSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    const [room] = await db
      .insert(communityPracticeRooms)
      .values({
        hostUserId: access.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        scheduledAt: new Date(parsed.data.scheduledAt),
        durationMinutes: parsed.data.durationMinutes,
        capacity: parsed.data.capacity,
      })
      .returning();

    return NextResponse.json({ room: { ...room, joined: false } });
  } catch (error) {
    console.error("Community rooms POST error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const parsed = z.object({ roomId: z.string().uuid() }).safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(communityRoomParticipants)
      .where(
        and(
          eq(communityRoomParticipants.roomId, parsed.data.roomId),
          eq(communityRoomParticipants.userId, access.userId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(communityRoomParticipants).values({
        roomId: parsed.data.roomId,
        userId: access.userId,
      });
      await db
        .update(communityPracticeRooms)
        .set({
          participantCount: sql`${communityPracticeRooms.participantCount} + 1`,
        })
        .where(eq(communityPracticeRooms.id, parsed.data.roomId));
    }

    return NextResponse.json({ joined: true });
  } catch (error) {
    console.error("Community room join error:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
