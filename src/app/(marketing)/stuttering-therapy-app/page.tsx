import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  Check,
  Heart,
  LineChart,
  Mic,
  Phone,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";
import { createMetadata, jsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Best Stuttering Therapy App (AI-Powered)",
  description:
    "StutterLab is the #1 AI-powered stuttering therapy app. Combines DAF, FAF, speech analysis, daily exercises, and phone call practice. Free to start.",
  path: "/stuttering-therapy-app",
});

const comparisons = [
  {
    feature: "DAF + FAF Audio Therapy",
    stutterlab: true,
    others: "Rare",
  },
  {
    feature: "AI Speech Analysis",
    stutterlab: true,
    others: "No",
  },
  {
    feature: "90-Day Structured Curriculum",
    stutterlab: true,
    others: "No",
  },
  {
    feature: "Phone Call Simulator",
    stutterlab: true,
    others: "No",
  },
  {
    feature: "Feared Words Trainer",
    stutterlab: true,
    others: "No",
  },
  {
    feature: "CBT & Mindfulness",
    stutterlab: true,
    others: "No",
  },
  {
    feature: "SLP Dashboard",
    stutterlab: true,
    others: "Rare",
  },
  {
    feature: "Browser-Based (No Download)",
    stutterlab: true,
    others: "No",
  },
];

const appFeatures = [
  {
    icon: AudioWaveform,
    title: "Audio Lab",
    description:
      "DAF + FAF + Choral Speaking + Metronome in one browser-based tool.",
  },
  {
    icon: Brain,
    title: "AI Stutter Fingerprint",
    description:
      "Maps your personal stuttering patterns and tracks improvement objectively.",
  },
  {
    icon: Phone,
    title: "Phone Call Simulator",
    description:
      "Practice real-world phone scenarios with an adaptive AI conversation partner.",
  },
  {
    icon: BookOpen,
    title: "90-Day Curriculum",
    description:
      "Structured daily exercises that build from basics to real-world confidence.",
  },
  {
    icon: Heart,
    title: "CBT & Mindfulness",
    description:
      "Address speaking anxiety with thought records, breathing exercises, and ACT.",
  },
  {
    icon: Calendar,
    title: "Feared Words Trainer",
    description:
      "Identify and desensitize your specific trigger words with targeted practice.",
  },
  {
    icon: LineChart,
    title: "Progress Analytics",
    description:
      "Detailed charts showing fluency trends, practice streaks, and technique effectiveness.",
  },
  {
    icon: Stethoscope,
    title: "SLP Connection",
    description:
      "Connect with Speech-Language Pathologists who can monitor and guide your therapy.",
  },
];

const reviews = [
  {
    quote:
      "The phone call simulator changed everything. I practice before real calls and my anxiety dropped massively.",
    name: "Alex M.",
    detail: "3 months on StutterLab",
    stars: 5,
  },
  {
    quote:
      "Day 60 of the curriculum. My wife noticed the improvement before I did. The daily structure keeps me accountable.",
    name: "James R.",
    detail: "Pro member",
    stars: 5,
  },
  {
    quote:
      "As an SLP, this fills the between-sessions gap perfectly. I can track my patients' practice and progress.",
    name: "Dr. Sarah K., CCC-SLP",
    detail: "SLP plan",
    stars: 5,
  },
];

export default function StutteringTherapyAppPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "SoftwareApplication",
          name: "StutterLab",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web browser",
          description:
            "AI-powered stuttering therapy app with DAF, FAF, speech analysis, and structured daily practice.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "127",
          },
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
            #1 AI-Powered Stuttering Therapy App
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Speak Without Fear{" "}
            <span className="text-primary">at Work, on Dates, on the Phone</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            How many calls have you let go to voicemail? How many ideas stayed
            in your head? StutterLab gives you a private space to practice the
            conversations that matter — and the confidence to have them for real.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Try Free for 7 Days
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/app/audio-lab">Try Audio Lab Free</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              4.8/5 from 127+ users
            </span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need in One App
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              No more juggling multiple tools. StutterLab is the complete
              stuttering therapy toolkit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {appFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 hover:border-primary/30 transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="inline-flex p-2.5 rounded-md bg-primary/10 mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">
              How StutterLab Compares
            </h2>
            <p className="text-muted-foreground mt-3">
              Most speech apps focus on one thing. StutterLab does it all.
            </p>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 px-6 py-3 text-sm font-semibold">
              <span>Feature</span>
              <span className="text-center text-primary">StutterLab</span>
              <span className="text-center text-muted-foreground">
                Other Apps
              </span>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 px-6 py-3 text-sm ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/20"
                }`}
              >
                <span>{row.feature}</span>
                <span className="text-center">
                  {row.stutterlab ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  ) : (
                    "No"
                  )}
                </span>
                <span className="text-center text-muted-foreground">
                  {row.others}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">What Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card key={r.name} className="border-0">
                <CardContent className="pt-6 pb-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing quick look */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="text-muted-foreground mt-3">
            Start free. Upgrade to Pro for $99/year ($8.25/month).
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/#pricing">See All Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaSection
        title="Your Stutter Doesn't Define Your Career"
        description="Practice the meetings, interviews, and phone calls that matter. Build confidence that follows you into every room."
        primaryCta="Get Started Free"
      />
    </>
  );
}
