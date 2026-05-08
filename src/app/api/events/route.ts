import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { productEvents } from "@/lib/db/schema";
import { getUserId } from "@/lib/auth/helpers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logError } from "@/lib/observability/logger";

const eventSchema = z.object({
  eventName: z.string().min(1).max(120),
  context: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateKey = userId ? `events:${userId}` : `events:${ip}`;
    const rate = checkRateLimit(rateKey, 120, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json({ error: "Too many events" }, { status: 429 });
    }

    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    await db.insert(productEvents).values({
      userId,
      eventName: parsed.data.eventName,
      context: parsed.data.context ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("product_event.failure", error);
    return NextResponse.json({ ok: true });
  }
}
