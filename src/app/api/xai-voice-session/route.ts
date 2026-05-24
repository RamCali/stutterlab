import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logError } from "@/lib/observability/logger";
import {
  XAI_REALTIME_WEBSOCKET_URL,
  createXaiClientSecret,
  getXaiVoiceModel,
} from "@/lib/xai/voice";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for xAI voice practice" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`xai-voice-session:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many voice sessions. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "xAI Voice is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const scenario = typeof body.scenario === "string" ? body.scenario : "phone-call";
    const blockAware = body.blockAware !== false;
    const stressLevel =
      typeof body.stressLevel === "number" ? body.stressLevel : undefined;
    const language = typeof body.language === "string" ? body.language : undefined;
    const country = typeof body.country === "string" ? body.country : undefined;
    const accent = typeof body.accent === "string" ? body.accent : undefined;

    const { response, session } = await createXaiClientSecret(apiKey, {
      scenario,
      blockAware,
      stressLevel,
      language,
      country,
      accent,
    });

    if (!response.ok) {
      logError("provider.xai.voice_session.bad_status", undefined, {
        status: response.status,
      });
      return NextResponse.json(
        { error: "Failed to initialize xAI voice session" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      provider: "xai",
      model: getXaiVoiceModel(),
      voice: session.voice,
      websocketUrl: XAI_REALTIME_WEBSOCKET_URL,
      clientSecret: data.value,
      expiresAt: data.expires_at,
      session,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logError("provider.xai.voice_session.error", error);
    return NextResponse.json(
      { error: "Failed to create xAI voice session" },
      { status: 500 }
    );
  }
}
