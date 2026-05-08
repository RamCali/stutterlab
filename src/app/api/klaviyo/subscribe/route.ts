import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { logError, measureAsync } from "@/lib/observability/logger";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

const subscribeSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rate = checkRateLimit(`klaviyo:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = subscribeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    const { email, source } = parsed.data;

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      return NextResponse.json({ success: true });
    }

    // Klaviyo Server API — bulk subscribe (creates profile + subscribes + consent)
    const res = await measureAsync(
      "provider.klaviyo.subscribe",
      { provider: "klaviyo", endpoint: "subscribe" },
      () =>
        fetchWithTimeout(
          "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
          {
            method: "POST",
            headers: {
              Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
              "Content-Type": "application/json",
              revision: "2024-10-15",
              Accept: "application/json",
            },
            body: JSON.stringify({
              data: {
                type: "profile-subscription-bulk-create-job",
                attributes: {
                  custom_source: source || "website",
                  profiles: {
                    data: [
                      {
                        type: "profile",
                        attributes: {
                          email,
                          subscriptions: {
                            email: {
                              marketing: {
                                consent: "SUBSCRIBED",
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
                relationships: {
                  list: {
                    data: {
                      type: "list",
                      id: KLAVIYO_LIST_ID,
                    },
                  },
                },
              },
            }),
          },
          8000,
          "Klaviyo subscribe"
        )
    );

    if (!res.ok) {
      logError("provider.klaviyo.subscribe.bad_status", undefined, {
        status: res.status,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Klaviyo subscribe error:", err);
    return NextResponse.json({ success: true });
  }
}
