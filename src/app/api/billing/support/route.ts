import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/helpers";
import { getSubscription } from "@/lib/auth/premium";
import { getResend } from "@/lib/email/client";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logError, logInfo } from "@/lib/observability/logger";

const supportSchema = z.object({
  reason: z.enum(["billing_question", "refund_request", "suspicious_charge"]),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const rate = checkRateLimit(`billing-support:${user.id}`, 5, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many billing support requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = supportSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid support request" }, { status: 400 });
    }

    const sub = await getSubscription(user.id);
    const supportEmail =
      process.env.BILLING_SUPPORT_EMAIL ||
      process.env.SUPPORT_EMAIL ||
      "support@stutterlab.com";
    const fromEmail =
      process.env.BILLING_SUPPORT_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "StutterLab <support@stutterlab.com>";

    const payload = {
      userId: user.id,
      userEmail: user.email ?? "unknown",
      reason: parsed.data.reason,
      message: parsed.data.message,
      stripeCustomerId: sub?.stripeCustomerId ?? null,
      stripeSubscriptionId: sub?.stripeSubscriptionId ?? null,
      plan: sub?.plan ?? null,
      status: sub?.status ?? null,
    };

    if (process.env.RESEND_API_KEY) {
      await getResend().emails.send({
        from: fromEmail,
        to: supportEmail,
        subject: `Billing support: ${parsed.data.reason}`,
        text: [
          `Reason: ${payload.reason}`,
          `User: ${payload.userEmail}`,
          `User ID: ${payload.userId}`,
          `Stripe customer: ${payload.stripeCustomerId ?? "none"}`,
          `Stripe subscription: ${payload.stripeSubscriptionId ?? "none"}`,
          `Plan/status: ${payload.plan ?? "none"} / ${payload.status ?? "none"}`,
          "",
          payload.message,
        ].join("\n"),
      });
    } else {
      logInfo("billing.support.email_skipped", {
        reason: parsed.data.reason,
        hasSubscription: Boolean(sub),
      });
    }

    logInfo("billing.support.submitted", {
      reason: parsed.data.reason,
      hasSubscription: Boolean(sub),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logError("billing.support.failure", error);
    return NextResponse.json(
      { error: "Could not send billing support request" },
      { status: 500 }
    );
  }
}
