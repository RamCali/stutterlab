import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanForPriceId } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import type { PlanTier } from "@/lib/auth/premium";
import { requireAuth } from "@/lib/auth/helpers";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  await requireAuth();

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    // When checkout is complete, provision the subscription immediately
    // so the user isn't bounced back by the dashboard's subscription check
    if (session.status === "complete" && session.subscription && session.metadata?.userId) {
      const userId = session.metadata.userId;
      let plan: PlanTier = (session.metadata.plan as PlanTier) || "pro";
      let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      let subStatus: "active" | "trialing" = "active";

      try {
        const sub = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = sub.items.data[0]?.price?.id;
        if (priceId) plan = getPlanForPriceId(priceId);
        if (sub.items.data[0]?.current_period_end) {
          periodEnd = new Date(sub.items.data[0].current_period_end * 1000);
        }
        if (sub.status === "trialing") subStatus = "trialing";
      } catch {
        // Fall back to defaults
      }

      await db
        .insert(subscriptions)
        .values({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan,
          status: subStatus,
          currentPeriodEnd: periodEnd,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan,
            status: subStatus,
            currentPeriodEnd: periodEnd,
          },
        });
    }

    return NextResponse.json({ status: session.status });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
