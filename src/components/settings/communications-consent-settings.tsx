"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { CommunicationsConsentForm } from "@/components/comms/communications-consent-form";
import { validateCommsConsentInput } from "@/lib/comms/consent";
import { getCommsConsent, setCommsConsent } from "@/lib/actions/comms";
import { isValidE164PhoneNumber } from "@/lib/sms/mvp";

type SmsSetupStatus = "idle" | "sending" | "sent" | "error";

type CommunicationsConsentSettingsProps = {
  onSmsSetup?: (phoneNumber: string) => Promise<void>;
  smsSetupStatus?: SmsSetupStatus;
  smsSetupMessage?: string;
};

export function CommunicationsConsentSettings({
  onSmsSetup,
  smsSetupStatus = "idle",
  smsSetupMessage = "",
}: CommunicationsConsentSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneCallConsent, setPhoneCallConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCommsConsent()
      .then((state) => {
        setPhoneNumber(state.contactPhoneNumber ?? "");
        setSmsConsent(state.smsConsent);
        setPhoneCallConsent(state.phoneCallConsent);
      })
      .catch(() => setError("Could not load communication preferences."))
      .finally(() => setLoading(false));
  }, []);

  async function savePreferences() {
    const validationError = validateCommsConsentInput({
      contactPhoneNumber: phoneNumber,
      smsConsent,
      phoneCallConsent,
      isValidE164: isValidE164PhoneNumber,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const state = await setCommsConsent({
        contactPhoneNumber: phoneNumber.trim() || null,
        smsConsent,
        phoneCallConsent,
      });
      setPhoneNumber(state.contactPhoneNumber ?? "");
      setSmsConsent(state.smsConsent);
      setPhoneCallConsent(state.phoneCallConsent);
      setSaved(true);
    } catch {
      setError("Could not save communication preferences.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendSetupText() {
    if (!onSmsSetup || !smsConsent) return;
    const validationError = validateCommsConsentInput({
      contactPhoneNumber: phoneNumber,
      smsConsent: true,
      phoneCallConsent,
      isValidE164: isValidE164PhoneNumber,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await setCommsConsent({
        contactPhoneNumber: phoneNumber.trim(),
        smsConsent: true,
        phoneCallConsent,
      });
      await onSmsSetup(phoneNumber.trim());
    } catch {
      setError("Save your preferences before sending a setup text.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading communication preferences...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium">Texts &amp; practice calls</p>
          <p className="text-xs text-muted-foreground">
            Consent is required before we text or call your phone.{" "}
            <Link href="/sms-consent" className="text-primary hover:underline">
              View disclosure
            </Link>
          </p>
        </div>
      </div>

      <CommunicationsConsentForm
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        smsConsent={smsConsent}
        onSmsConsentChange={setSmsConsent}
        phoneCallConsent={phoneCallConsent}
        onPhoneCallConsentChange={setPhoneCallConsent}
        error={error}
        compact
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={() => void savePreferences()}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            "Saved"
          ) : (
            "Save preferences"
          )}
        </Button>

        {onSmsSetup && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              saving ||
              smsSetupStatus === "sending" ||
              !smsConsent ||
              !phoneNumber.trim()
            }
            onClick={() => void handleSendSetupText()}
          >
            {smsSetupStatus === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send setup text"
            )}
          </Button>
        )}
      </div>

      {smsSetupMessage && (
        <p
          className={`text-sm ${
            smsSetupStatus === "error" ? "text-destructive" : "text-emerald-500"
          }`}
        >
          {smsSetupMessage}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        The first text asks you to save StutterLab as a contact and includes STOP
        opt-out language.
      </p>
    </div>
  );
}
