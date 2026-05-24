import { NextRequest, NextResponse } from "next/server";
import { getVoiceMetadata } from "@/lib/voice/server-personas";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function appendBridgeParams(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function GET(request: NextRequest) {
  const bridgeUrl = process.env.PHONE_PRACTICE_BRIDGE_WS_URL;
  if (!bridgeUrl) {
    return new NextResponse(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<Response>",
        "<Say>StutterLab phone practice is not configured yet. Please try browser practice in the app.</Say>",
        "</Response>",
      ].join(""),
      {
        status: 503,
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      }
    );
  }

  const scenario = request.nextUrl.searchParams.get("scenario") || "phone-call";
  const blockAware = request.nextUrl.searchParams.get("blockAware") || "true";
  const language = request.nextUrl.searchParams.get("language") || "";
  const country = request.nextUrl.searchParams.get("country") || "";
  const accent = request.nextUrl.searchParams.get("accent") || "";
  const token = process.env.PHONE_PRACTICE_BRIDGE_TOKEN || "";
  const voiceMeta = getVoiceMetadata(scenario);
  const streamUrl = appendBridgeParams(bridgeUrl, {
    scenario,
    blockAware,
    language,
    country,
    accent,
    persona: voiceMeta.persona.id,
    xaiVoice: voiceMeta.voices.xai,
    token,
  });

  const twiml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<Response>",
    "<Connect>",
    `<Stream url="${xmlEscape(streamUrl)}" />`,
    "</Connect>",
    "</Response>",
  ].join("");

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
