import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { logError, measureAsync } from "@/lib/observability/logger";

export async function POST() {
  try {
    const user = await requireAuth();

    const rate = checkRateLimit(`deepgram-session:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many speech sessions. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram not configured" },
        { status: 503 }
      );
    }

    const response = await measureAsync(
      "provider.deepgram.token_grant",
      { provider: "deepgram", endpoint: "auth_grant" },
      () =>
        fetchWithTimeout(
          "https://api.deepgram.com/v1/auth/grant",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ttl_seconds: 60 }),
          },
          8000,
          "Deepgram token grant"
        )
    );

    if (!response.ok) {
      logError("provider.deepgram.token_grant.bad_status", undefined, {
        status: response.status,
      });
      return NextResponse.json(
        { error: "Failed to initialize speech service" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Deepgram session error:", error);
    return NextResponse.json(
      { error: "Failed to create speech session" },
      { status: 500 }
    );
  }
}
