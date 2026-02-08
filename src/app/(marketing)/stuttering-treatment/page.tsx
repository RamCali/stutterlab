import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  Brain,
  CheckCircle2,
  Mic,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";
import { createMetadata, jsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "AI Stuttering Treatment That Builds Real-World Confidence",
  description:
    "Evidence-based stuttering treatment combining DAF, FAF, AI speech analysis, and daily structured practice. For kids and adults. Browser-based, no downloads.",
  path: "/stuttering-treatment",
});

const approaches = [
  {
    icon: AudioWaveform,
    title: "Delayed Auditory Feedback (DAF)",
    description:
      "Hear your voice on a slight delay, naturally slowing speech rate and reducing stuttering blocks by up to 80%.",
  },
  {
    icon: Mic,
    title: "Frequency-Altered Feedback (FAF)",
    description:
      "Your voice is pitch-shifted in real-time, creating a choral effect that dramatically improves fluency.",
  },
  {
    icon: Brain,
    title: "AI Speech Analysis",
    description:
      "Objective disfluency detection maps your personal stuttering patterns and tracks measurable improvement over time.",
  },
  {
    icon: Target,
    title: "Fluency Shaping Techniques",
    description:
      "Gentle onset, light articulatory contact, and prolonged speech — practiced daily with structured exercises.",
  },
  {
    icon: Shield,
    title: "Stuttering Modification",
    description:
      "Cancellation, pull-out, and preparatory set techniques help you manage moments of stuttering with confidence.",
  },
  {
    icon: Users,
    title: "Real-World Practice",
    description:
      "AI conversation simulators, phone call practice, and feared-word training prepare you for everyday situations.",
  },
];

const benefits = [
  "Practice phone calls before you make them",
  "Nail job interviews and meetings without dread",
  "Order what you actually want, not what's easy to say",
  "See measurable progress — not just hope",
  "Practice anytime — browser-based, no downloads",
  "Designed with Speech-Language Pathologists",
];

export default function StutteringTreatmentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "MedicalWebPage",
          name: "Stuttering Treatment - StutterLab",
          about: {
            "@type": "MedicalCondition",
            name: "Stuttering",
            alternateName: "Stammering",
          },
          description:
            "Evidence-based stuttering treatment combining DAF, FAF, AI speech analysis, and structured practice.",
          lastReviewed: "2026-01-15",
        })}
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge
            variant="secondary"
            className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Evidence-Based Stuttering Treatment
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Stop Avoiding.{" "}
            <span className="text-primary">Start Speaking.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practice the phone calls, meetings, and conversations that scare
            you — with AI that adapts to your stuttering patterns. Build
            real-world confidence 25 minutes a day, right in your browser.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/stuttering-exercises">Browse Exercises</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What is stuttering */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Understanding Stuttering
          </h2>
          <p className="text-muted-foreground mt-4 text-center max-w-2xl mx-auto leading-relaxed">
            Stuttering affects over 70 million people worldwide — about 1% of
            the global population. It&apos;s a neurological speech disorder, not
            a psychological one. Modern treatment combines fluency-shaping
            techniques, stuttering modification strategies, and cognitive
            approaches — and technology is making these treatments more
            accessible than ever.
          </p>
        </div>
      </section>

      {/* Treatment approaches */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              A Multi-Modal Treatment System
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              StutterLab combines six evidence-based approaches into one daily
              practice system.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {approaches.map((item) => (
              <Card
                key={item.title}
                className="border-0 hover:border-primary/30 transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="inline-flex p-2.5 rounded-md bg-primary/10 mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits checklist */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Why Choose StutterLab for Treatment?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily system */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Daily Treatment Plan
            </h2>
            <p className="text-muted-foreground mt-3">
              25 minutes a day. Structured. Progressive. Measurable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Warm Up",
                description:
                  "Breathing exercises and gentle onset practice to prepare your speech system.",
              },
              {
                step: "2",
                title: "Core Practice",
                description:
                  "Audio Lab sessions with DAF/FAF, technique exercises, and AI conversation practice.",
              },
              {
                step: "3",
                title: "Track & Reflect",
                description:
                  "Voice journal, AI fluency analysis, and progress tracking across your treatment.",
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research backing */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-5">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Backed by Speech Science
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            DAF and FAF have been studied for decades with consistent results.
            Research shows auditory feedback can reduce stuttering frequency by
            up to 80%. Our AI analysis brings objective measurement to track
            your improvement over time.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            StutterLab is designed in consultation with certified
            Speech-Language Pathologists and is not a replacement for
            professional diagnosis or treatment.
          </p>
        </div>
      </section>

      <CtaSection
        title="What Would You Say If Stuttering Wasn't in the Way?"
        description="Your ideas deserve to be heard. Start practicing the conversations that matter — free for 7 days."
        primaryCta="Start Free Trial"
      />
    </>
  );
}
