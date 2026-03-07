import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | StutterLab",
  description:
    "Read the terms and conditions for using StutterLab, the AI-powered speech training platform for people who stutter.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-muted-foreground mb-12">
        Last updated: March 6, 2026
      </p>

      <div className="prose prose-invert prose-teal max-w-none space-y-8">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using StutterLab (&quot;the Service&quot;), operated
            at{" "}
            <Link href="https://www.stutterlab.com" className="text-primary hover:underline">
              www.stutterlab.com
            </Link>
            , you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree to these Terms, do not use
            the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            StutterLab is an AI-powered speech training platform designed for
            people who stutter. The Service provides a structured 90-day
            program with daily exercises, AI speech coaching, progress tracking,
            and community features to help users build speaking confidence.
          </p>
          <p className="mt-3 font-semibold text-foreground">
            StutterLab is not a medical service, therapy, or substitute for
            professional speech-language pathology treatment.
          </p>
          <p className="mt-2">
            Our program is designed as a self-guided training tool informed by
            evidence-based techniques. For clinical speech assessment and
            treatment, consult a licensed speech-language pathologist (SLP).
          </p>
        </Section>

        <Section title="3. Accounts &amp; Registration">
          <p>
            To use StutterLab, you must create an account using Google OAuth.
            You are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Maintaining the security of your Google account</li>
            <li>All activity that occurs under your account</li>
            <li>
              Providing accurate information during onboarding
            </li>
          </ul>
          <p className="mt-2">
            You must be at least 13 years old to create an account. If you are
            under 18, you must have parental or guardian consent.
          </p>
        </Section>

        <Section title="4. Free Trial &amp; Subscription">
          <h3 className="text-lg font-semibold mt-4 mb-2">Free Trial</h3>
          <p>
            StutterLab offers a 7-day free trial. A valid payment method is
            required to start the trial. If you do not cancel before the trial
            ends, your subscription will automatically begin and you will be
            charged.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Premium Subscription
          </h3>
          <p>
            StutterLab Premium is available at $99/month or $999/year. Your
            subscription will automatically renew at the end of each billing
            period unless you cancel. Prices are subject to change with
            reasonable notice.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            Cancellation &amp; Refunds
          </h3>
          <p>
            You may cancel your subscription at any time through the Service.
            Upon cancellation, you will retain access until the end of your
            current billing period. Refunds are handled on a case-by-case
            basis — contact us at{" "}
            <a
              href="mailto:support@stutterlab.com"
              className="text-primary hover:underline"
            >
              support@stutterlab.com
            </a>{" "}
            if you believe you are entitled to a refund.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable laws
            </li>
            <li>
              Share your account credentials or allow others to access your
              account
            </li>
            <li>
              Attempt to reverse-engineer, decompile, or extract source code
              from the Service
            </li>
            <li>
              Interfere with or disrupt the Service or its infrastructure
            </li>
            <li>
              Use automated tools (bots, scrapers) to access the Service
            </li>
            <li>
              Upload malicious content, viruses, or harmful code
            </li>
            <li>
              Misuse the AI coaching features to generate content unrelated to
              speech training
            </li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content, exercises, curriculum, branding, and software
            comprising StutterLab are owned by StutterLab and protected by
            copyright and intellectual property laws. You may not copy,
            reproduce, distribute, or create derivative works from our content
            without written permission.
          </p>
          <p className="mt-2">
            Your speech recordings and personal practice data remain your
            property. By using the Service, you grant us a limited license to
            process this data solely to provide and improve the Service.
          </p>
        </Section>

        <Section title="7. AI-Generated Content">
          <p>
            StutterLab uses artificial intelligence to provide speech coaching,
            feedback, and practice scenarios. AI-generated content is provided
            for training purposes only and:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              Is not a substitute for advice from a licensed speech-language
              pathologist
            </li>
            <li>May occasionally be inaccurate or inappropriate</li>
            <li>
              Should not be relied upon for medical or clinical decisions
            </li>
          </ul>
        </Section>

        <Section title="8. Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            , which describes how we collect, use, and protect your data. By
            using StutterLab, you consent to our data practices as described in
            the Privacy Policy.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We do not guarantee that:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>The Service will be uninterrupted or error-free</li>
            <li>
              The Service will produce specific speech outcomes or improvements
            </li>
            <li>
              AI-generated feedback will be accurate in all cases
            </li>
          </ul>
          <p className="mt-2">
            Speech improvement varies by individual. Results depend on
            consistent practice, individual speech patterns, and many other
            factors.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, StutterLab and its
            officers, directors, employees, and agents shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of data, loss of
            profits, or personal injury arising from your use of the Service.
          </p>
          <p className="mt-2">
            Our total liability for any claim arising from or related to the
            Service shall not exceed the amount you have paid to StutterLab in
            the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            We reserve the right to suspend or terminate your account at any
            time for violation of these Terms or for any other reason at our
            sole discretion. Upon termination:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Your access to the Service will be revoked</li>
            <li>
              Your data will be handled in accordance with our Privacy Policy
            </li>
            <li>
              No refund will be issued for the current billing period unless
              required by law
            </li>
          </ul>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. We will notify you of
            material changes by posting the updated Terms on this page and
            updating the &quot;Last updated&quot; date. Your continued use of
            the Service after changes constitutes acceptance of the updated
            Terms.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the United States. Any disputes arising from these Terms
            or the Service shall be resolved through binding arbitration in
            accordance with applicable arbitration rules.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have questions about these Terms, contact us at:
          </p>
          <p className="mt-2">
            <a
              href="mailto:support@stutterlab.com"
              className="text-primary hover:underline"
            >
              support@stutterlab.com
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
