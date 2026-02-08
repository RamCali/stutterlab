import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireAuth();
    const session = await createCheckoutSession(user.id, user.email!);
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
