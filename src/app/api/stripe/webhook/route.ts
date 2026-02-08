import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

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

      await db
        .insert(subscriptions)
        .values({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan: "pro",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: "pro",
            status: "active",
            currentPeriodEnd: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ),
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
      await db
        .update(subscriptions)
        .set({
          status,
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
