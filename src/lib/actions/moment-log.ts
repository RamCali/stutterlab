"use server";

import { db } from "@/lib/db/client";
import { momentLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function saveMomentLog(data: {
  technique: string;
  severity: number;
  context?: string;
  notes?: string;
  helped?: boolean;
}) {
  const user = await requireAuth();
  const [row] = await db
    .insert(momentLogs)
    .values({
      userId: user.id,
      technique: data.technique,
      severity: Math.min(5, Math.max(1, data.severity)),
      context: data.context ?? null,
      notes: data.notes ?? null,
      helped: data.helped ?? null,
    })
    .returning();
  return { success: true, id: row.id };
}

export async function getRecentMomentLogs(limit = 10) {
  const user = await requireAuth();
  return db
    .select()
    .from(momentLogs)
    .where(eq(momentLogs.userId, user.id))
    .orderBy(desc(momentLogs.createdAt))
    .limit(limit);
}
