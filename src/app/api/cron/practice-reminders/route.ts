import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { userNotificationPrefs, users, userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendMvpSms } from "@/lib/sms/mvp";
import { getResend } from "@/lib/email/client";

/** Cron: POST with Authorization: Bearer CRON_SECRET */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await db.select().from(userNotificationPrefs);
  let smsSent = 0;
  let emailSent = 0;
  const now = new Date();
  const hour = now.getUTCHours();

  for (const pref of prefs) {
    if (!pref.dailyReminders) continue;
    if (pref.reminderHour !== hour) continue;

    const last = pref.lastReminderSentAt;
    if (last && now.getTime() - last.getTime() < 20 * 60 * 60 * 1000) continue;

    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, pref.userId))
      .limit(1);

    const streak = stats?.currentStreak ?? 0;
    const body = `StutterLab: Time for today's speaking rep (${streak} day streak). ~10 min — you've got this.`;

    if (pref.smsEnabled && pref.phoneE164) {
      const result = await sendMvpSms(pref.phoneE164, body);
      if (result.ok) smsSent++;
    }

    if (pref.dailyReminders && process.env.RESEND_API_KEY) {
      const [user] = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, pref.userId))
        .limit(1);

      if (user?.email) {
        try {
          await getResend().emails.send({
            from:
              process.env.RESEND_FROM_EMAIL || "StutterLab <noreply@stutterlab.com>",
            to: user.email,
            subject: "Your daily StutterLab practice reminder",
            text: body,
          });
          emailSent++;
        } catch {
          // skip failed email
        }
      }
    }

    await db
      .update(userNotificationPrefs)
      .set({ lastReminderSentAt: now, updatedAt: now })
      .where(eq(userNotificationPrefs.userId, pref.userId));
  }

  return NextResponse.json({ ok: true, smsSent, emailSent, checked: prefs.length });
}
