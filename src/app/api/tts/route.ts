import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getProviderVoice, getServerVoicePersona } from "@/lib/voice/server-personas";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!(await isPremium(user.id))) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const rate = checkRateLimit(`tts:${user.id}`, 60, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many text-to-speech requests. Please try again later." },
        { status: 429 }
      );
    }

    const { text, voiceId, scenario, therapistMode } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // ElevenLabs TTS (high quality, natural voice)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (apiKey) {
      const persona = getServerVoicePersona(
        typeof scenario === "string" ? scenario : undefined,
        therapistMode === true
      );
      const defaultVoiceId = getProviderVoice("elevenLabsTts", persona);
      const stability =
        persona.pace === "brisk" ? 0.38 : persona.pace === "slow" ? 0.7 : 0.55;
      const style = persona.pace === "brisk" ? 0.35 : 0.15;

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || defaultVoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
              stability,
              similarity_boost: 0.75,
              style,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      }
      console.error("ElevenLabs error:", await response.text());
    }

    // No TTS service configured — client will use browser speechSynthesis
    return NextResponse.json(
      { error: "TTS service not configured" },
      { status: 503 }
    );
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "TTS service error" },
      { status: 500 }
    );
  }
}
