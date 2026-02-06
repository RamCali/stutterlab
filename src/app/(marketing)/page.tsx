import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Flame,
  Globe,
  Heart,
  LineChart,
  Mic,
  Phone,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: AudioWaveform,
    title: "Audio Lab",
    description:
      "Combine DAF, FAF, Choral Speaking & Metronome in one browser-based tool. No downloads needed.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI Stutter Fingerprint",
    description:
      "Objective disfluency detection that maps your personal stuttering patterns and tracks improvement.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Phone,
    title: "Phone Call Simulator",
    description:
      "Practice the most anxiety-inducing scenarios with an adaptive AI partner. Build real confidence.",
    color: "text-primary dark:text-primary",
    bg: "bg-primary/10 dark:bg-primary/15",
  },
  {
    icon: BookOpen,
    title: "90-Day Curriculum",
    description:
      "Structured daily exercises that progressively build your fluency — from gentle onset to real-world conversations.",
    color: "text-brand-amber dark:text-brand-amber",
    bg: "bg-brand-amber/10 dark:bg-brand-amber/15",
  },
  {
    icon: Heart,
    title: "CBT & Mindfulness",
    description:
      "Address speaking anxiety with thought records, guided breathing, meditation, and ACT exercises.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Calendar,
    title: "Feared Words Trainer",
    description:
      "Identify and conquer your specific trigger words with personalized desensitization exercises.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Users,
    title: "Community & Practice Partners",
    description:
      "Join group practice rooms, find a practice partner, celebrate wins, and feel less alone.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: Stethoscope,
    title: "SLP Connection",
    description:
      "Find and connect with Speech-Language Pathologists. They can monitor progress and guide your therapy.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const stats = [
  { value: "80%", label: "Stuttering reduction with DAF+FAF" },
  { value: "90", label: "Days of structured curriculum" },
  { value: "100%", label: "Browser-based — zero downloads" },
  { value: "24/7", label: "AI-powered practice anytime" },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core tools",
    features: [
      "DAF tool in Audio Lab",
      "3 exercises per day",
      "Basic progress tracking",
      "Community (read-only)",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "per year",
    monthlyNote: "Just $8.25/month",
    description: "The complete stuttering treatment toolkit",
    features: [
      "Full Audio Lab (DAF + FAF + Choral + Metronome)",
      "90-day structured daily curriculum",
      "AI Stutter Fingerprint analysis",
      "AI Conversation & Phone Call Simulator",
      "Voice Journal with fluency tracking",
      "Feared Words Trainer",
      "CBT & Mindfulness module",
      "Real-World Challenges",
      "Full community + practice partners",
      "Weekly AI coaching report",
      "7-day free trial",
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: true,
  },
  {
    name: "SLP",
    price: "$79",
    period: "per seat/month",
    description: "For Speech-Language Pathologists",
    features: [
      "Everything in Pro",
      "Patient management dashboard",
      "Prescribe exercises & homework",
      "Progress reports (PDF export)",
      "Telehealth video sessions",
      "SOAP note templates",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    quote:
      "The phone call simulator alone is worth it. I used to dread calling the doctor — now I practice beforehand and it makes a huge difference.",
    name: "Alex M.",
    detail: "Pro member for 3 months",
  },
  {
    quote:
      "The daily curriculum keeps me accountable. Day 47 and my streak is still going. My wife noticed the improvement before I did.",
    name: "James R.",
    detail: "47-day streak",
  },
  {
    quote:
      "As an SLP, this fills a massive gap. My patients practice between sessions and I can track their progress in real time.",
    name: "Dr. Sarah K., CCC-SLP",
    detail: "SLP member",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Navigation ═══ */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <AudioWaveform className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">StutterLab</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#for-slps"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For SLPs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ═══ Hero Section ═══ */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge
            variant="secondary"
            className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            The First Browser-Based Stuttering Treatment Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Your Speech,{" "}
            <span className="text-primary">Your Pace,</span>
            <br />
            Your Power
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Combine DAF + FAF audio therapy, AI speech analysis, a 90-day
            structured curriculum, and real-world conversation practice. All in
            your browser. No downloads. No waiting.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/audio-lab">Try Audio Lab Free</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need to Build Fluency
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A comprehensive toolkit built on evidence-based speech therapy,
              powered by AI, designed for real results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 hover:border-primary/30 transition-shadow group"
              >
                <CardContent className="pt-6">
                  <div
                    className={`inline-flex p-2.5 rounded-md ${feature.bg} mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
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

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Three Steps to Better Fluency
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Take Your Assessment",
                description:
                  "A brief onboarding questionnaire personalizes your 90-day treatment path based on your severity, goals, and triggers.",
                icon: Shield,
              },
              {
                step: "2",
                title: "Practice Daily",
                description:
                  "Follow your daily plan: warm-up, exercises, Audio Lab sessions, AI conversations, and voice journaling — all in 25 minutes.",
                icon: Flame,
              },
              {
                step: "3",
                title: "See Real Results",
                description:
                  "Watch your Stutter Fingerprint transform over time. Connect with an SLP for professional guidance when needed.",
                icon: TrendingUp,
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold mb-5">
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

      {/* ═══ Social Proof / Testimonials ═══ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Real People, Real Progress
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0">
                <CardContent className="pt-6 pb-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.detail}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Invest in Your Voice
            </h2>
            <p className="text-muted-foreground mt-3">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlighted
                    ? "border-primary border-2 shadow-lg relative"
                    : "border-border/60"
                }
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-8 pb-6">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">
                      /{tier.period}
                    </span>
                  </div>
                  {tier.monthlyNote && (
                    <p className="text-xs text-primary font-medium mt-1">
                      {tier.monthlyNote}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                  <Button
                    className="w-full mt-6"
                    size="lg"
                    variant={tier.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{tier.cta}</Link>
                  </Button>
                  <ul className="mt-6 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ For SLPs Banner ═══ */}
      <section id="for-slps" className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-5">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Are You a Speech-Language Pathologist?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            StutterLab gives your patients a powerful practice tool between
            sessions — and gives you real-time visibility into their progress.
            Prescribe exercises, review AI analysis, and conduct telehealth
            sessions all in one platform.
          </p>
          <Button size="lg" className="mt-6 px-8" asChild>
            <Link href="/signup">
              Learn About SLP Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your Speech?
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Join thousands of adults taking control of their fluency with
            evidence-based tools and AI-powered practice. Your 7-day free trial
            starts now.
          </p>
          <Button size="lg" className="mt-8 px-10" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            No credit card required. Free tier available forever.
          </p>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border/60 py-12 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <AudioWaveform className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">StutterLab</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Evidence-based stuttering treatment, powered by AI, accessible
                from any browser.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#for-slps"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                For SLPs
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="border-t border-border/60 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>&copy; 2026 StutterLab. All rights reserved.</p>
            <p>
              StutterLab is not a substitute for professional diagnosis or
              treatment. Always consult a qualified SLP.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
