import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { createCheckoutSession } from "@/lib/stripe";
import type { BillingInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    let interval: BillingInterval = "year";
    try {
      const body = await req.json();
      if (body.interval === "month" || body.interval === "year") {
        interval = body.interval;
      }
    } catch {
      // No body or invalid JSON — default to yearly
    }

    const session = await createCheckoutSession(user.id, user.email!, interval);
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = getCheckoutErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}

function getCheckoutErrorStatus(message: string) {
  if (message === "Unauthorized") return 401;
  if (
    message.includes("No price configured") ||
    message.includes("STRIPE_SECRET_KEY") ||
    message.includes("NEXT_PUBLIC_APP_URL") ||
    message.includes("NEXTAUTH_URL")
  ) {
    return 500;
  }
  return 400;
}
