import { db } from "@/lib/db/client";
import { subscriptions, users } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getResend } from "./client";
import { buildTrialReminderEmail } from "./templates/trial-reminder";
import { logInfo } from "@/lib/observability/logger";

export async function sendTrialReminders() {
  if (!process.env.RESEND_API_KEY) {
    logInfo("trial_reminders.email_skipped", {
      reason: "missing_resend_api_key",
    });
    return { sent: 0, skipped: "missing_resend_api_key" };
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find trials ending between 24–48 hours from now (day 6 of trial)
  const trialingSubs = await db
    .select({
      userId: subscriptions.userId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "trialing"),
        gte(subscriptions.currentPeriodEnd, tomorrow),
        lte(subscriptions.currentPeriodEnd, dayAfterTomorrow)
      )
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stutterlab.com";
  const fromEmail =
    process.env.BILLING_SUPPORT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "StutterLab <noreply@stutterlab.com>";
  let sent = 0;

  for (const sub of trialingSubs) {
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, sub.userId))
      .limit(1);

    if (!user?.email) continue;

    const { subject, html } = buildTrialReminderEmail({
      userName: user.name?.split(" ")[0] || "there",
      trialEndDate: sub.currentPeriodEnd!.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      billingAmount: "$99/month",
      manageUrl: `${appUrl}/app/settings`,
    });

    await getResend().emails.send({
      from: fromEmail,
      to: user.email,
      subject,
      html,
    });

    sent++;
  }

  return { sent };
}
