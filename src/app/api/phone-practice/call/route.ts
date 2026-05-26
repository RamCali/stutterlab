import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { logError, measureAsync } from "@/lib/observability/logger";
import { getVoiceMetadata } from "@/lib/voice/server-personas";
import { getMvpSmsConfig } from "@/lib/sms/mvp";
import { hasPhoneCallConsentForNumber } from "@/lib/actions/comms";

const E164_PHONE_RE = /^\+[1-9]\d{7,14}$/;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
}

function twilioAuthHeader(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const hasPremium = await isPremium(user.id);
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for phone practice" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(`phone-practice-call:${user.id}`, 6, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many practice calls. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber : "";
    const scenario = typeof body.scenario === "string" ? body.scenario : "phone-call";
    const blockAware = body.blockAware !== false;
    const language = typeof body.language === "string" ? body.language : "";
    const country = typeof body.country === "string" ? body.country : "";
    const accent = typeof body.accent === "string" ? body.accent : "";
    const voiceMeta = getVoiceMetadata(scenario);

    if (!E164_PHONE_RE.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number must be in E.164 format, like +14155552671" },
        { status: 400 }
      );
    }

    const consented = await hasPhoneCallConsentForNumber(phoneNumber);
    if (!consented) {
      return NextResponse.json(
        {
          error:
            "Phone-call consent is required. Enable practice calls in Settings or during onboarding.",
        },
        { status: 403 }
      );
    }

    const appUrl = getAppUrl();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const bridgeUrl = process.env.PHONE_PRACTICE_BRIDGE_WS_URL;
    const mvpSms = getMvpSmsConfig();

    if (!appUrl || !accountSid || !authToken || !fromNumber || !bridgeUrl) {
      return NextResponse.json(
        {
          error: "Phone practice is not configured",
          configured: {
            appUrl: Boolean(appUrl),
            twilioAccountSid: Boolean(accountSid),
            twilioAuthToken: Boolean(authToken),
            twilioFromNumber: Boolean(fromNumber),
            phoneBridge: Boolean(bridgeUrl),
            xaiApiKey: Boolean(process.env.XAI_API_KEY),
          },
        },
        { status: 503 }
      );
    }

    const twimlUrl = new URL("/api/phone-practice/twiml", appUrl);
    twimlUrl.searchParams.set("scenario", scenario);
    twimlUrl.searchParams.set("blockAware", String(blockAware));
    if (language) twimlUrl.searchParams.set("language", language);
    if (country) twimlUrl.searchParams.set("country", country);
    if (accent) twimlUrl.searchParams.set("accent", accent);

    const form = new URLSearchParams({
      To: phoneNumber,
      From: fromNumber,
      Url: twimlUrl.toString(),
      Method: "GET",
    });

    const response = await measureAsync(
      "provider.twilio.practice_call",
      { provider: "twilio", endpoint: "calls_create" },
      () =>
        fetchWithTimeout(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
          {
            method: "POST",
            headers: {
              Authorization: twilioAuthHeader(accountSid, authToken),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form,
          },
          8000,
          "Twilio practice call"
        )
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      let twilioMessage = "";
      try {
        const parsed = JSON.parse(errorBody);
        twilioMessage =
          typeof parsed.message === "string" ? parsed.message : "";
      } catch {
        twilioMessage = errorBody.slice(0, 240);
      }

      logError("provider.twilio.practice_call.bad_status", undefined, {
        status: response.status,
        twilioMessage,
      });
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development" && twilioMessage
              ? twilioMessage
              : "Failed to start phone practice call",
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      provider: "twilio+xai",
      callSid: data.sid,
      status: data.status,
      scenario,
      persona: voiceMeta.persona.id,
      voice: voiceMeta.voices.xai,
      mvpContact:
        mvpSms.enabled && mvpSms.fromNumber === fromNumber
          ? {
              bestEffort: true,
              contactName: "StutterLab",
              fromNumber,
            }
          : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logError("provider.twilio.practice_call.error", error);
    return NextResponse.json(
      { error: "Failed to create phone practice call" },
      { status: 500 }
    );
  }
}
