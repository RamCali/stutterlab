import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanForPriceId } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import type { PlanTier } from "@/lib/auth/premium";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      // Determine plan from metadata or Stripe price ID
      let plan: PlanTier = (session.metadata?.plan as PlanTier) || "pro";

      // Verify plan from actual Stripe subscription data
      let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      let subStatus: "active" | "trialing" | "canceled" | "past_due" | "incomplete" = "active";
      if (session.subscription) {
        try {
          const sub = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId) {
            plan = getPlanForPriceId(priceId);
          }
          if (sub.items.data[0]?.current_period_end) {
            periodEnd = new Date(sub.items.data[0].current_period_end * 1000);
          }
          if (sub.status === "trialing") {
            subStatus = "trialing";
          }
        } catch {
          // Fall back to metadata plan
        }
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
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : sub.status === "trialing" ? "trialing" : "canceled";
      const periodEnd = sub.items?.data?.[0]?.current_period_end;

      // Check if plan changed (e.g. upgrade/downgrade)
      const priceId = sub.items?.data?.[0]?.price?.id;
      const plan = priceId ? getPlanForPriceId(priceId) : undefined;

      await db
        .update(subscriptions)
        .set({
          status,
          ...(plan ? { plan } : {}),
          ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
        })
        .where(eq(subscriptions.userId, userId));
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await db
        .update(subscriptions)
        .set({ status: "canceled", plan: "free" })
        .where(eq(subscriptions.userId, userId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
