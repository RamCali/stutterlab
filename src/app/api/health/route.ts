import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { logError } from "@/lib/observability/logger";
import { getMvpSmsConfig } from "@/lib/sms/mvp";

export async function GET() {
  const mvpSms = getMvpSmsConfig();
  const checks = {
    database: false,
    authSecret: Boolean(process.env.NEXTAUTH_SECRET),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    speechToText: Boolean(process.env.DEEPGRAM_API_KEY),
    voiceAgent: Boolean(process.env.ELEVENLABS_API_KEY),
    openaiRealtime: Boolean(process.env.OPENAI_API_KEY),
    xaiVoice: Boolean(process.env.XAI_API_KEY),
    phonePractice: Boolean(
      process.env.XAI_API_KEY &&
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM_NUMBER &&
        process.env.PHONE_PRACTICE_BRIDGE_WS_URL
    ),
    mvpSms: mvpSms.enabled,
    aiText: Boolean(process.env.ANTHROPIC_API_KEY),
  };

  try {
    await db.select({ ok: sql<number>`1` });
    checks.database = true;
  } catch (error) {
    logError("health.database.failure", error);
  }

  const healthy = checks.database && checks.authSecret && checks.appUrl;

  return NextResponse.json(
    {
      ok: healthy,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
