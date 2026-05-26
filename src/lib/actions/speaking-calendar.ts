"use server";

import { db } from "@/lib/db/client";
import { speakingEvents } from "@/lib/db/schema";
import { and, asc, eq, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import {
  buildMicroPlanForEvent,
  type SpeakingEventType,
  type EventMicroPlan,
} from "@/lib/speaking-calendar/micro-plan";

export async function createSpeakingEvent(data: {
  title: string;
  eventType: SpeakingEventType;
  eventDate: string;
  notes?: string;
}) {
  const user = await requireAuth();
  const eventDate = new Date(data.eventDate);
  const microPlan = buildMicroPlanForEvent(data.title, data.eventType, eventDate);

  const [row] = await db
    .insert(speakingEvents)
    .values({
      userId: user.id,
      title: data.title,
      eventType: data.eventType,
      eventDate,
      notes: data.notes ?? null,
      microPlan,
    })
    .returning();

  return { success: true, event: row };
}

export async function getUpcomingSpeakingEvents() {
  const user = await requireAuth();
  const now = new Date();
  return db
    .select()
    .from(speakingEvents)
    .where(and(eq(speakingEvents.userId, user.id), gte(speakingEvents.eventDate, now)))
    .orderBy(asc(speakingEvents.eventDate))
    .limit(20);
}

export async function deleteSpeakingEvent(eventId: string) {
  const user = await requireAuth();
  await db
    .delete(speakingEvents)
    .where(and(eq(speakingEvents.id, eventId), eq(speakingEvents.userId, user.id)));
  return { success: true };
}
