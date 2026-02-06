"use server";

import { db } from "@/lib/db/client";
import { thoughtRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getThoughtRecords() {
  const user = await requireAuth();

  return db
    .select()
    .from(thoughtRecords)
    .where(eq(thoughtRecords.userId, user.id))
    .orderBy(desc(thoughtRecords.createdAt))
    .limit(50);
}

export async function createThoughtRecord(data: {
  situation: string;
  automaticThought: string;
  emotions: string[];
  evidenceFor?: string;
  evidenceAgainst?: string;
  balancedThought?: string;
}) {
  const user = await requireAuth();

  const [record] = await db
    .insert(thoughtRecords)
    .values({
      userId: user.id,
      situation: data.situation.trim(),
      automaticThought: data.automaticThought.trim(),
      emotions: data.emotions,
      evidenceFor: data.evidenceFor?.trim() ?? null,
      evidenceAgainst: data.evidenceAgainst?.trim() ?? null,
      balancedThought: data.balancedThought?.trim() ?? null,
    })
    .returning();

  return record;
}
