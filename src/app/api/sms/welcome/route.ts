import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { hasSmsConsentForNumber } from "@/lib/actions/comms";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logError, measureAsync } from "@/lib/observability/logger";
import {
  buildMvpWelcomeSms,
  isValidE164PhoneNumber,
  sendMvpSms,
} from "@/lib/sms/mvp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const rate = checkRateLimit(`sms-welcome:${user.id}`, 3, 60 * 60 * 1000);

    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many text setup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    if (!isValidE164PhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number must be in E.164 format, like +14155552671" },
        { status: 400 }
      );
    }

    const consented = await hasSmsConsentForNumber(phoneNumber);
    if (!consented) {
      return NextResponse.json(
        {
          error:
            "SMS consent is required. Enable text messages in Settings or during onboarding.",
        },
        { status: 403 }
      );
    }

    const result = await measureAsync(
      "provider.twilio.mvp_welcome_sms",
      { provider: "twilio", endpoint: "messages_create" },
      () => sendMvpSms(phoneNumber, buildMvpWelcomeSms())
    );

    if (!result.ok) {
      logError("provider.twilio.mvp_welcome_sms.bad_status", undefined, {
        status: result.status,
        configured: JSON.stringify(result.configured),
      });

      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "development"
              ? result.error
              : "Could not send the setup text yet",
          configured: result.configured,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      ok: true,
      messageSid: result.sid,
      status: result.status,
      fromNumber: result.fromNumber,
      bestEffort: true,
      contactName: "StutterLab",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logError("provider.twilio.mvp_welcome_sms.error", error);
    return NextResponse.json(
      { error: "Could not send the setup text yet" },
      { status: 500 }
    );
  }
}
