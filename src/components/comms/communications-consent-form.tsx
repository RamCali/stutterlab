"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CommunicationsConsentFormProps = {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  smsConsent: boolean;
  onSmsConsentChange: (checked: boolean) => void;
  phoneCallConsent: boolean;
  onPhoneCallConsentChange: (checked: boolean) => void;
  error?: string | null;
  compact?: boolean;
};

function ConsentCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
      />
      <span className="text-sm leading-relaxed text-muted-foreground">{label}</span>
    </label>
  );
}

export function CommunicationsConsentForm({
  phoneNumber,
  onPhoneNumberChange,
  smsConsent,
  onSmsConsentChange,
  phoneCallConsent,
  onPhoneCallConsentChange,
  error,
  compact = false,
}: CommunicationsConsentFormProps) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <Label htmlFor="contact-phone" className="text-sm font-medium">
          Mobile number
        </Label>
        <Input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange(event.target.value)}
          placeholder="+14155552671"
          className="mt-1.5 h-10"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Use your country code (E.164 format). Required only if you opt in below.
        </p>
      </div>

      <ConsentCheckbox
        id="sms-consent"
        checked={smsConsent}
        onChange={onSmsConsentChange}
        label={
          <>
            I agree to receive automated <strong className="text-foreground">text messages</strong>{" "}
            from StutterLab about practice reminders and account updates. Message frequency varies.
            Msg &amp; data rates may apply. Reply <strong className="text-foreground">STOP</strong>{" "}
            to opt out. Reply <strong className="text-foreground">HELP</strong> for help. See our{" "}
            <Link href="/sms-consent" className="text-primary hover:underline">
              SMS consent policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </>
        }
      />

      <ConsentCheckbox
        id="phone-call-consent"
        checked={phoneCallConsent}
        onChange={onPhoneCallConsentChange}
        label={
          <>
            I agree to receive automated <strong className="text-foreground">practice phone calls</strong>{" "}
            from StutterLab to this number for speech training features (for example, AI phone
            practice). Call frequency varies. Standard call rates may apply. You can withdraw consent
            in Settings. See our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </>
        }
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
