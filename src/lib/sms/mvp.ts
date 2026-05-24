import { fetchWithTimeout } from "@/lib/observability/timeout";

const E164_PHONE_RE = /^\+[1-9]\d{7,14}$/;

export type MvpSmsConfig = {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  status: {
    mvpMode: boolean;
    twilioAccountSid: boolean;
    twilioAuthToken: boolean;
    fromNumber: boolean;
  };
};

export function isValidE164PhoneNumber(phoneNumber: string) {
  return E164_PHONE_RE.test(phoneNumber);
}

export function getMvpSmsConfig(): MvpSmsConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const fromNumber =
    process.env.TWILIO_SMS_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER || "";
  const mvpMode = process.env.SMS_MVP_VOIP_ENABLED === "true";

  return {
    enabled: Boolean(mvpMode && accountSid && authToken && fromNumber),
    accountSid,
    authToken,
    fromNumber,
    status: {
      mvpMode,
      twilioAccountSid: Boolean(accountSid),
      twilioAuthToken: Boolean(authToken),
      fromNumber: Boolean(fromNumber),
    },
  };
}

export function buildMvpWelcomeSms() {
  return [
    "Hi, this is StutterLab.",
    "During our MVP, we will use this number for practice reminders and account updates.",
    "Please save it as StutterLab so you recognize future texts.",
    "Reply STOP to opt out.",
  ].join(" ");
}

function twilioAuthHeader(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export async function sendMvpSms(to: string, body: string) {
  const config = getMvpSmsConfig();

  if (!config.enabled) {
    return {
      ok: false as const,
      status: 503,
      error: "MVP SMS is not configured",
      configured: config.status,
    };
  }

  const form = new URLSearchParams({
    To: to,
    From: config.fromNumber,
    Body: body,
  });

  const response = await fetchWithTimeout(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: twilioAuthHeader(config.accountSid, config.authToken),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
    8000,
    "Twilio MVP SMS"
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "Failed to send MVP SMS";

    return {
      ok: false as const,
      status: response.status,
      error: message,
      configured: config.status,
    };
  }

  return {
    ok: true as const,
    sid: payload.sid as string | undefined,
    status: payload.status as string | undefined,
    fromNumber: config.fromNumber,
  };
}
