import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | StutterLab",
  description:
    "Learn how StutterLab collects, uses, and protects your personal data. Your privacy and speech data security are our top priorities.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-muted-foreground mb-12">
        Last updated: March 6, 2026
      </p>

      <div className="prose prose-invert prose-teal max-w-none space-y-8">
        <Section title="1. Introduction">
          <p>
            StutterLab (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the website{" "}
            <Link href="https://www.stutterlab.com" className="text-primary hover:underline">
              www.stutterlab.com
            </Link>{" "}
            and associated mobile applications (the &quot;Service&quot;). We are
            committed to protecting your privacy, especially given the sensitive
            nature of speech and health-related data. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our Service.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Account Information
          </h3>
          <p>
            When you create an account via Google OAuth, we receive your name,
            email address, and profile picture from Google. We do not receive or
            store your Google password.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Speech &amp; Practice Data
          </h3>
          <p>
            To provide personalized speech training, we may collect:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Audio recordings of your practice sessions</li>
            <li>
              Speech metrics (speaking rate, disfluency counts, fluency scores)
            </li>
            <li>
              Exercise completions, streak data, and progress through the
              90-day program
            </li>
            <li>
              Self-reported data such as feared words, anxiety levels, and
              cognitive behavioral thought records
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Onboarding &amp; Profile Data
          </h3>
          <p>
            During onboarding, you may provide information about your stuttering
            patterns, goals, and preferences. This data is stored securely and
            used solely to customize your training program.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Payment Information
          </h3>
          <p>
            Payments are processed by Stripe. We do not store your credit card
            number, CVV, or full billing details. Stripe handles all payment
            data in accordance with PCI-DSS standards. We retain only your
            Stripe customer ID and subscription status.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Usage &amp; Analytics Data
          </h3>
          <p>
            We collect anonymized usage data via PostHog to understand how
            users interact with StutterLab. This includes page views, feature
            usage, device type, and browser information. This data is not linked
            to your speech recordings.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Deliver the Service:</strong> Personalize your daily
              training plan, track progress, award XP and achievements, and
              provide AI-powered speech coaching
            </li>
            <li>
              <strong>Improve the Service:</strong> Analyze aggregated,
              de-identified data to improve our curriculum, exercises, and AI
              models
            </li>
            <li>
              <strong>Communicate with you:</strong> Send account-related
              emails such as trial reminders, subscription confirmations, and
              important updates
            </li>
            <li>
              <strong>Ensure security:</strong> Detect fraud, abuse, and
              unauthorized access
            </li>
          </ul>
          <p className="mt-4">
            We will <strong>never</strong> sell your personal data or speech
            recordings to third parties.
          </p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>
            We use the following third-party services to operate StutterLab.
            Each processes data only as necessary to provide their service:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Google OAuth</strong> — Authentication
            </li>
            <li>
              <strong>Stripe</strong> — Payment processing
            </li>
            <li>
              <strong>Neon (PostgreSQL)</strong> — Database hosting
            </li>
            <li>
              <strong>Vercel</strong> — Application hosting
            </li>
            <li>
              <strong>Cloudflare R2</strong> — Audio recording storage
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> — AI speech coaching and
              conversation analysis
            </li>
            <li>
              <strong>Deepgram</strong> — Speech-to-text transcription
            </li>
            <li>
              <strong>ElevenLabs</strong> — Text-to-speech and conversational
              AI for practice scenarios
            </li>
            <li>
              <strong>PostHog</strong> — Product analytics (anonymized)
            </li>
            <li>
              <strong>Resend</strong> — Transactional email
            </li>
          </ul>
        </Section>

        <Section title="5. Data Storage &amp; Security">
          <p>
            Your data is stored on secure, encrypted servers. Audio recordings
            are stored in Cloudflare R2 with encryption at rest. Database
            connections use SSL/TLS encryption. We implement
            industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Encrypted data in transit (HTTPS/TLS) and at rest</li>
            <li>JWT-based session authentication</li>
            <li>Environment variable isolation for API keys and secrets</li>
            <li>Regular security reviews of dependencies</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data and practice history for as long as your
            account is active. Audio recordings are retained for the duration of
            your subscription to enable progress tracking and AI analysis. If
            you delete your account, we will delete your personal data and
            audio recordings within 30 days, except where retention is required
            by law.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Access</strong> your personal data stored by StutterLab
            </li>
            <li>
              <strong>Correct</strong> inaccurate personal data
            </li>
            <li>
              <strong>Delete</strong> your account and associated data
            </li>
            <li>
              <strong>Export</strong> your practice data
            </li>
            <li>
              <strong>Opt out</strong> of non-essential analytics
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@stutterlab.com"
              className="text-primary hover:underline"
            >
              privacy@stutterlab.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            StutterLab is not intended for children under 13. We do not
            knowingly collect personal information from children under 13. If
            you believe a child under 13 has provided us with personal data,
            please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            We use essential cookies for authentication and session management.
            We use PostHog for analytics, which may set cookies to track
            anonymized usage patterns. We do not use third-party advertising
            cookies.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the updated policy on this page
            and updating the &quot;Last updated&quot; date. Your continued use
            of the Service after changes constitutes acceptance of the updated
            policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions about this Privacy Policy or your data,
            contact us at:
          </p>
          <p className="mt-2">
            <a
              href="mailto:privacy@stutterlab.com"
              className="text-primary hover:underline"
            >
              privacy@stutterlab.com
            </a>
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
