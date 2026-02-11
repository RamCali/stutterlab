import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  Bot,
  Brain,
  Check,
  Fingerprint,
  MessageSquare,
  Mic,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";
import { createMetadata, jsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "AI Stuttering Therapy - Smart Speech Analysis & Practice",
  description:
    "StutterLab uses AI to analyze your speech patterns, map your stutter fingerprint, simulate real-world conversations, and adapt your therapy in real-time.",
  path: "/ai-stuttering-therapy",
});

const aiFeatures = [
  {
    icon: Fingerprint,
    title: "AI Stutter Fingerprint",
    description:
      "Our AI listens to your speech and builds an objective map of your disfluency patterns — blocks, prolongations, repetitions, and interjections. Watch it transform as you improve.",
    highlight: true,
  },
  {
    icon: Phone,
    title: "Phone Call Simulator",
    description:
      "Practice the most anxiety-inducing scenarios with an AI partner that adapts to your fluency level. Order food, call the doctor, handle job interviews.",
    highlight: false,
  },
  {
    icon: MessageSquare,
    title: "AI Conversation Practice",
    description:
      "Have natural conversations with an AI that understands stuttering. Practice casual talk, small talk, presentations, and social scenarios.",
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Adaptive Difficulty",
    description:
      "The AI adjusts exercise difficulty based on your real performance. Struggling? It eases up. Excelling? It challenges you with harder scenarios.",
    highlight: false,
  },
  {
    icon: Target,
    title: "Technique Effectiveness",
    description:
      "AI tracks which techniques work best for YOU — gentle onset vs. prolonged speech vs. light contact — and recommends your optimal strategy.",
    highlight: false,
  },
  {
    icon: Bot,
    title: "Weekly AI Coaching Report",
    description:
      "Every week, receive a personalized report analyzing your progress, highlighting strengths, and suggesting focus areas for the next week.",
    highlight: false,
  },
];

const howAiHelps = [
  {
    step: "1",
    title: "Record Your Speech",
    description:
      "Read a passage, have a conversation, or practice a real-world scenario. Your audio stays private.",
  },
  {
    step: "2",
    title: "AI Analyzes Patterns",
    description:
      "Advanced speech analysis detects disfluencies, measures speaking rate, and identifies your specific patterns.",
  },
  {
    step: "3",
    title: "Get Personalized Feedback",
    description:
      "See exactly where disfluencies occur, which techniques help most, and how your fluency is trending over time.",
  },
];

export default function AiStutteringTherapyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "WebPage",
          name: "AI Stuttering Therapy - StutterLab",
          description:
            "AI-powered stuttering therapy with speech analysis, conversation simulation, and adaptive treatment.",
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
            AI-Powered Stuttering Help Program

            <Check className="h-3.5 w-3.5 mr-1.5" />
            Developed by Licensed Speech-Language Pathologists
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Practice the Conversations{" "}
            <span className="text-primary">That Scare You</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Order food. Call the doctor. Nail the interview. StutterLab&apos;s AI
            simulates real-world scenarios so you walk in prepared — not
            paralyzed. Available 24/7, right in your browser.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Try AI Therapy Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/stuttering-treatment">Learn About Treatment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How AI helps */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              How AI Helps Your Stuttering
            </h2>
            <p className="text-muted-foreground mt-3">
              Objective analysis. Personalized practice. Measurable progress.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howAiHelps.map((step) => (
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

      {/* AI Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              AI Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Six Ways AI Powers Your Therapy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiFeatures.map((feature) => (
              <Card
                key={feature.title}
                className={`border-0 hover:border-primary/30 transition-shadow ${
                  feature.highlight ? "ring-1 ring-primary/30" : ""
                }`}
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

      {/* AI vs Traditional */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            AI + Human Expertise
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
            AI doesn&apos;t replace your Speech-Language Pathologist — it
            supercharges your practice between sessions. StutterLab gives your
            SLP real data on your daily practice, and gives you 24/7 access to
            guided exercises and conversation practice.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  What AI Does Best
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Objective disfluency measurement</li>
                  <li>24/7 unlimited practice partner</li>
                  <li>Real-time fluency tracking</li>
                  <li>Adaptive difficulty adjustment</li>
                  <li>Pattern recognition across sessions</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  What Your SLP Does Best
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Professional diagnosis</li>
                  <li>Treatment plan design</li>
                  <li>Emotional support & counseling</li>
                  <li>Technique refinement</li>
                  <li>Context-aware guidance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <CtaSection
        title="Stop Letting Stuttering Choose Your Words"
        description="Practice any conversation, any time. Build the confidence to say what you actually mean."
        primaryCta="Try AI Therapy Free"
      />
    </>
  );
}
