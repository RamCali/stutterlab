"use server";

import { db } from "@/lib/db/client";
import { userNotificationPrefs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export type NotificationPrefsInput = {
  dailyReminders?: boolean;
  weeklyProgress?: boolean;
  newExercises?: boolean;
  smartReminders?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
  phoneE164?: string | null;
  smsEnabled?: boolean;
};

export async function getNotificationPrefs() {
  const user = await requireAuth();
  const [row] = await db
    .select()
    .from(userNotificationPrefs)
    .where(eq(userNotificationPrefs.userId, user.id))
    .limit(1);

  if (row) return row;

  const [created] = await db
    .insert(userNotificationPrefs)
    .values({ userId: user.id })
    .returning();
  return created;
}

export async function updateNotificationPrefs(prefs: NotificationPrefsInput) {
  const user = await requireAuth();
  await getNotificationPrefs();

  const [updated] = await db
    .update(userNotificationPrefs)
    .set({
      ...prefs,
      updatedAt: new Date(),
    })
    .where(eq(userNotificationPrefs.userId, user.id))
    .returning();

  return { success: true, prefs: updated };
}
