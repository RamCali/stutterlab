import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { getSubscription } from "@/lib/auth/premium";
import { createPortalSession } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireAuth();
    const sub = await getSubscription(user.id);

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    const session = await createPortalSession(sub.stripeCustomerId);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open billing portal";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
