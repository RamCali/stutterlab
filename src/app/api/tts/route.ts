import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // ElevenLabs TTS (high quality, natural voice)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (apiKey) {
      const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

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
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
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
