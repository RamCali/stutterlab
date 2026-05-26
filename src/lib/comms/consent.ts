/**
 * SMS and phone-call consent stored in profiles.treatment_path JSONB.
 */

export const CONTACT_PHONE_KEY = "contactPhoneNumber";
export const SMS_CONSENT_KEY = "smsConsent";
export const SMS_CONSENTED_AT_KEY = "smsConsentedAt";
export const PHONE_CALL_CONSENT_KEY = "phoneCallConsent";
export const PHONE_CALL_CONSENTED_AT_KEY = "phoneCallConsentedAt";

export interface CommsConsentState {
  contactPhoneNumber: string | null;
  smsConsent: boolean;
  smsConsentedAt: string | null;
  phoneCallConsent: boolean;
  phoneCallConsentedAt: string | null;
}

export function parseCommsConsent(
  treatmentPath: Record<string, unknown> | null | undefined,
): CommsConsentState {
  const tp = treatmentPath ?? {};
  return {
    contactPhoneNumber:
      typeof tp[CONTACT_PHONE_KEY] === "string" ? tp[CONTACT_PHONE_KEY] : null,
    smsConsent: tp[SMS_CONSENT_KEY] === true,
    smsConsentedAt:
      typeof tp[SMS_CONSENTED_AT_KEY] === "string" ? tp[SMS_CONSENTED_AT_KEY] : null,
    phoneCallConsent: tp[PHONE_CALL_CONSENT_KEY] === true,
    phoneCallConsentedAt:
      typeof tp[PHONE_CALL_CONSENTED_AT_KEY] === "string"
        ? tp[PHONE_CALL_CONSENTED_AT_KEY]
        : null,
  };
}

export type CommsConsentInput = {
  contactPhoneNumber?: string | null;
  smsConsent?: boolean;
  phoneCallConsent?: boolean;
};

export function commsConsentPatch(input: CommsConsentInput): Record<string, unknown> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};

  if (input.contactPhoneNumber !== undefined) {
    const trimmed = input.contactPhoneNumber?.trim() ?? "";
    patch[CONTACT_PHONE_KEY] = trimmed || null;
  }

  if (input.smsConsent !== undefined) {
    patch[SMS_CONSENT_KEY] = input.smsConsent;
    patch[SMS_CONSENTED_AT_KEY] = input.smsConsent ? now : null;
  }

  if (input.phoneCallConsent !== undefined) {
    patch[PHONE_CALL_CONSENT_KEY] = input.phoneCallConsent;
    patch[PHONE_CALL_CONSENTED_AT_KEY] = input.phoneCallConsent ? now : null;
  }

  return patch;
}

export function validateCommsConsentInput(input: {
  contactPhoneNumber: string;
  smsConsent: boolean;
  phoneCallConsent: boolean;
  isValidE164: (phone: string) => boolean;
}): string | null {
  const phone = input.contactPhoneNumber.trim();
  const wantsContact = input.smsConsent || input.phoneCallConsent;

  if (!phone && !wantsContact) return null;

  if (wantsContact && !phone) {
    return "Enter your mobile number to enable texts or practice calls.";
  }

  if (phone && !input.isValidE164(phone)) {
    return "Use international format, like +14155552671.";
  }

  if (phone && !wantsContact) {
    return "Choose at least one way we may reach you, or clear your number.";
  }

  return null;
}
