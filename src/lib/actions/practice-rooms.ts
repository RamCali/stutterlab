"use server";

import { db } from "@/lib/db/client";
import { practiceRoomParticipants, practiceRooms } from "@/lib/db/schema";
import { and, asc, count, eq, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

const ANON_NAMES = [
  "Steady River",
  "Calm Oak",
  "Brave Wave",
  "Clear Voice",
  "Grounded Star",
];

function randomAnonName() {
  return ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]!;
}

export async function listUpcomingPracticeRooms() {
  const now = new Date();
  const rooms = await db
    .select()
    .from(practiceRooms)
    .where(and(gte(practiceRooms.scheduledAt, now), eq(practiceRooms.status, "scheduled")))
    .orderBy(asc(practiceRooms.scheduledAt))
    .limit(20);

  const withCounts = await Promise.all(
    rooms.map(async (room) => {
      const [c] = await db
        .select({ n: count() })
        .from(practiceRoomParticipants)
        .where(eq(practiceRoomParticipants.roomId, room.id));
      return { ...room, participantCount: Number(c?.n ?? 0) };
    })
  );
  return withCounts;
}

export async function createPracticeRoom(data: {
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes?: number;
}) {
  const user = await requireAuth();
  const [room] = await db
    .insert(practiceRooms)
    .values({
      hostUserId: user.id,
      title: data.title,
      description: data.description ?? null,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes ?? 15,
    })
    .returning();

  await db.insert(practiceRoomParticipants).values({
    roomId: room.id,
    userId: user.id,
    anonymousName: randomAnonName(),
  });

  return { success: true, room };
}

export async function joinPracticeRoom(roomId: string) {
  const user = await requireAuth();
  const [room] = await db
    .select()
    .from(practiceRooms)
    .where(eq(practiceRooms.id, roomId))
    .limit(1);

  if (!room) return { success: false, error: "Room not found" };

  const [existing] = await db
    .select()
    .from(practiceRoomParticipants)
    .where(
      and(
        eq(practiceRoomParticipants.roomId, roomId),
        eq(practiceRoomParticipants.userId, user.id)
      )
    )
    .limit(1);

  if (existing) return { success: true, alreadyJoined: true };

  const [c] = await db
    .select({ n: count() })
    .from(practiceRoomParticipants)
    .where(eq(practiceRoomParticipants.roomId, roomId));

  if (Number(c?.n ?? 0) >= room.maxParticipants) {
    return { success: false, error: "Room is full" };
  }

  await db.insert(practiceRoomParticipants).values({
    roomId,
    userId: user.id,
    anonymousName: randomAnonName(),
  });

  return { success: true };
}

export async function getPracticeRoomParticipants(roomId: string) {
  await requireAuth();
  return db
    .select({
      anonymousName: practiceRoomParticipants.anonymousName,
      joinedAt: practiceRoomParticipants.joinedAt,
    })
    .from(practiceRoomParticipants)
    .where(eq(practiceRoomParticipants.roomId, roomId))
    .orderBy(asc(practiceRoomParticipants.joinedAt));
}
