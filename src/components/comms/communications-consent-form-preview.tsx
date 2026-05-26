"use client";

import { useState } from "react";
import { CommunicationsConsentForm } from "@/components/comms/communications-consent-form";

/** Interactive preview for the public /sms-consent page (client-only). */
export function CommunicationsConsentFormPreview() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneCallConsent, setPhoneCallConsent] = useState(false);

  return (
    <CommunicationsConsentForm
      phoneNumber={phoneNumber}
      onPhoneNumberChange={setPhoneNumber}
      smsConsent={smsConsent}
      onSmsConsentChange={setSmsConsent}
      phoneCallConsent={phoneCallConsent}
      onPhoneCallConsentChange={setPhoneCallConsent}
      compact
    />
  );
}
