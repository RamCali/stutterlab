import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { logError, measureAsync } from "@/lib/observability/logger";
import { getProviderVoice, getServerVoicePersona } from "@/lib/voice/server-personas";

const DEFAULT_MODEL = "gpt-realtime";
const DEFAULT_VOICE = "alloy";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for voice conversations" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`openai-realtime-session:${user.id}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many voice sessions. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI Realtime is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const scenario = typeof body.scenario === "string" ? body.scenario : undefined;
    const therapistMode = body.therapistMode === true;
    const language = typeof body.language === "string" ? body.language : "";
    const country = typeof body.country === "string" ? body.country : "";
    const accent = typeof body.accent === "string" ? body.accent : "";
    const persona = getServerVoicePersona(scenario, therapistMode);
    const model = process.env.OPENAI_REALTIME_MODEL || DEFAULT_MODEL;
    const voice = getProviderVoice("openai", persona) || DEFAULT_VOICE;

    const response = await measureAsync(
      "provider.openai.realtime_session",
      { provider: "openai", endpoint: "realtime_session", model },
      () =>
        fetchWithTimeout(
          "https://api.openai.com/v1/realtime/client_secrets",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              session: {
                type: "realtime",
                model,
                instructions: [
                  persona.scenarioPrompt,
                  `Voice persona: ${persona.label}. Role: ${persona.role}. Pace: ${persona.pace}. Affect: ${persona.affect}.`,
                  language || country || accent
                    ? `Locale adaptation: preferred language=${language || "unspecified"}, country/region=${country || "unspecified"}, accent/dialect=${accent || "unspecified"}. Use local phrasing where appropriate without stereotyping.`
                    : "",
                  "Keep spoken turns concise and natural. Ask one question at a time.",
                  "Do not mention stuttering, blocks, or techniques during roleplay.",
                ].filter(Boolean).join("\n"),
                audio: {
                  output: { voice },
                },
              },
            }),
          },
          8000,
          "OpenAI Realtime session"
        )
    );

    if (!response.ok) {
      logError("provider.openai.realtime_session.bad_status", undefined, {
        status: response.status,
      });
      return NextResponse.json(
        { error: "Failed to initialize OpenAI voice session" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      provider: "openai",
      model,
      voice,
      persona: persona.id,
      clientSecret: data.value,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logError("provider.openai.realtime_session.error", error);
    return NextResponse.json(
      { error: "Failed to create OpenAI voice session" },
      { status: 500 }
    );
  }
}
