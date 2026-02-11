"use server";

import { db } from "@/lib/db/client";
import { thoughtRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

interface ThoughtRecordSync {
  situation: string;
  automaticThought: string;
  emotions: { name: string; intensity: number }[];
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
}

export async function syncThoughtRecordToDb(record: ThoughtRecordSync) {
  const user = await requireAuth();

  await db.insert(thoughtRecords).values({
    userId: user.id,
    situation: record.situation,
    automaticThought: record.automaticThought,
    emotions: record.emotions,
    evidenceFor: record.evidenceFor,
    evidenceAgainst: record.evidenceAgainst,
    balancedThought: record.balancedThought,
  });
}

export async function getThoughtRecordsFromDb() {
  const user = await requireAuth();

  return db
    .select()
    .from(thoughtRecords)
    .where(eq(thoughtRecords.userId, user.id));
}
