import { describe, expect, it } from "vitest";
import {
  commsConsentPatch,
  parseCommsConsent,
  validateCommsConsentInput,
} from "@/lib/comms/consent";

const validE164 = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);

describe("comms consent", () => {
  it("parses consent from treatment path", () => {
    expect(
      parseCommsConsent({
        contactPhoneNumber: "+14155552671",
        smsConsent: true,
        smsConsentedAt: "2026-05-25T00:00:00.000Z",
        phoneCallConsent: false,
      }),
    ).toEqual({
      contactPhoneNumber: "+14155552671",
      smsConsent: true,
      smsConsentedAt: "2026-05-25T00:00:00.000Z",
      phoneCallConsent: false,
      phoneCallConsentedAt: null,
    });
  });

  it("clears consent timestamps when opted out", () => {
    const patch = commsConsentPatch({ smsConsent: false, phoneCallConsent: false });
    expect(patch.smsConsentedAt).toBeNull();
    expect(patch.phoneCallConsentedAt).toBeNull();
  });

  it("requires consent when a phone number is provided", () => {
    expect(
      validateCommsConsentInput({
        contactPhoneNumber: "+14155552671",
        smsConsent: false,
        phoneCallConsent: false,
        isValidE164: validE164,
      }),
    ).toBe("Choose at least one way we may reach you, or clear your number.");
  });

  it("allows empty skip", () => {
    expect(
      validateCommsConsentInput({
        contactPhoneNumber: "",
        smsConsent: false,
        phoneCallConsent: false,
        isValidE164: validE164,
      }),
    ).toBeNull();
  });
});
