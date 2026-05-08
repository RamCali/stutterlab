import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { logError, measureAsync } from "@/lib/observability/logger";

export async function POST() {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for voice conversations" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`elevenlabs-session:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many voice sessions. Please try again later." },
        { status: 429 }
      );
    }

    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs Conversational AI not configured" },
        { status: 503 }
      );
    }

    const response = await measureAsync(
      "provider.elevenlabs.signed_url",
      { provider: "elevenlabs", endpoint: "signed_url" },
      () =>
        fetchWithTimeout(
          `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
          {
            headers: {
              "xi-api-key": apiKey,
            },
          },
          8000,
          "ElevenLabs signed URL"
        )
    );

    if (!response.ok) {
      logError("provider.elevenlabs.signed_url.bad_status", undefined, {
        status: response.status,
      });
      return NextResponse.json(
        { error: "Failed to initialize voice session" },
        { status: 502 }
      );
    }

    const { signed_url } = await response.json();
    return NextResponse.json({ signedUrl: signed_url });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("ElevenLabs session error:", error);
    return NextResponse.json(
      { error: "Failed to create voice session" },
      { status: 500 }
    );
  }
}
