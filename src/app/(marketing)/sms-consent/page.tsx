import type { Metadata } from "next";
import Link from "next/link";
import { CommunicationsConsentForm } from "@/components/comms/communications-consent-form";

export const metadata: Metadata = {
  title: "SMS & Phone Consent | StutterLab",
  description:
    "How StutterLab collects consent for practice reminder texts and automated practice phone calls.",
};

export default function SmsConsentPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-2">
        SMS &amp; Phone Consent
      </h1>
      <p className="text-muted-foreground mb-12">
        Last updated: May 25, 2026
      </p>

      <div className="prose prose-invert prose-teal max-w-none space-y-8">
        <Section title="How you opt in">
          <p>
            StutterLab only sends texts or places practice calls after you give explicit
            consent and provide your mobile number. Consent is collected in two places:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>During onboarding</strong> — optional step before your assessment
              results, using the form below
            </li>
            <li>
              <strong>In Settings → Notifications</strong> — after you create an account at{" "}
              <Link href="/app/settings" className="text-primary hover:underline">
                stutterlab.com/app/settings
              </Link>
            </li>
          </ul>
          <p className="mt-4">
            Consent is not required to use StutterLab. You can skip communications during
            onboarding and enable them later in Settings.
          </p>
        </Section>

        <Section title="Opt-in form (web)">
          <p className="mb-4">
            This is the same disclosure users see when opting in. Checking a box and
            submitting your number constitutes consent for that channel only.
          </p>
          <div className="not-prose rounded-xl border border-border bg-card p-4 sm:p-6">
            <CommunicationsConsentForm
              phoneNumber=""
              onPhoneNumberChange={() => {}}
              smsConsent={false}
              onSmsConsentChange={() => {}}
              phoneCallConsent={false}
              onPhoneCallConsentChange={() => {}}
              compact
            />
            <p className="mt-4 text-xs text-muted-foreground">
              This public page is a read-only reference for carriers and compliance review.
              Live opt-in happens in the authenticated onboarding and settings flows.
            </p>
          </div>
        </Section>

        <Section title="What we send">
          <h3 className="text-lg font-semibold mt-4 mb-2">Text messages</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Practice reminders and streak nudges</li>
            <li>Account and program updates related to your training</li>
            <li>An initial setup message when you enable texts (includes STOP instructions)</li>
          </ul>
          <p className="mt-2 text-sm">
            Message frequency varies with your program activity, typically a few messages per
            week during active use.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Practice phone calls</h3>
          <p>
            When you use Phone Call Simulator or related features, StutterLab may place an
            automated outbound call to the number you provided so you can practice real-world
            conversations. Calls are initiated only when you start a practice session.
          </p>
        </Section>

        <Section title="How to opt out">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Texts:</strong> Reply <strong>STOP</strong> to any message from
              StutterLab, or turn off SMS consent in Settings
            </li>
            <li>
              <strong>Calls:</strong> Turn off phone-call consent in Settings; we will not
              place new practice calls after that
            </li>
            <li>
              For help with messaging, reply <strong>HELP</strong> or email{" "}
              <a href="mailto:support@stutterlab.com" className="text-primary hover:underline">
                support@stutterlab.com
              </a>
            </li>
          </ul>
        </Section>

        <Section title="Related policies">
          <p>
            See our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            for how we store and protect your phone number and communication preferences.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}
