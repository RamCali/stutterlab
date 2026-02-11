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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
