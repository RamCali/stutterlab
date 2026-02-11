import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  Baby,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  Heart,
  Mic,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";
import { createMetadata, jsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Speech Therapy for Stuttering - Complete Guide & Tools",
  description:
    "Everything you need to know about speech therapy for stuttering. Evidence-based techniques for kids and adults. Practice at home with StutterLab's browser-based tools.",
  path: "/speech-therapy-for-stuttering",
});

const therapyTypes = [
  {
    icon: AudioWaveform,
    title: "Fluency Shaping",
    description:
      "Teaches a new, more fluent way of speaking through techniques like gentle onset, light contact, and controlled breathing.",
    forWhom: "Kids & Adults",
  },
  {
    icon: Brain,
    title: "Stuttering Modification",
    description:
      "Helps you manage moments of stuttering with techniques like cancellation, pull-out, and preparatory set.",
    forWhom: "Teens & Adults",
  },
  {
    icon: Mic,
    title: "Auditory Feedback (DAF/FAF)",
    description:
      "Altered auditory feedback has been shown to reduce stuttering by up to 80%. StutterLab provides both DAF and FAF in-browser.",
    forWhom: "Kids & Adults",
  },
  {
    icon: Heart,
    title: "Cognitive Behavioral Therapy (CBT)",
    description:
      "Addresses the anxiety, avoidance, and negative thought patterns that often accompany stuttering.",
    forWhom: "Teens & Adults",
  },
  {
    icon: BookOpen,
    title: "Acceptance & Commitment (ACT)",
    description:
      "Helps you accept stuttering as part of your experience while building confidence to speak in all situations.",
    forWhom: "Teens & Adults",
  },
  {
    icon: GraduationCap,
    title: "Lidcombe Program",
    description:
      "A parent-delivered behavioral treatment for young children who stutter, with strong research backing.",
    forWhom: "Children (2-6)",
  },
];

const faq = [
  {
    q: "When should I see a speech therapist for stuttering?",
    a: "If stuttering persists for more than 6 months, causes frustration or avoidance, or runs in your family, consult an SLP. Early intervention is key for children.",
  },
  {
    q: "How long does speech therapy for stuttering take?",
    a: "Treatment varies. Many people see improvement within 3-6 months of consistent practice. StutterLab's 90-day curriculum is designed for daily 25-minute sessions.",
  },
  {
    q: "Can adults benefit from speech therapy for stuttering?",
    a: "Absolutely. Adults can significantly improve fluency and reduce speaking anxiety with the right combination of techniques and consistent practice.",
  },
  {
    q: "Can I practice speech therapy at home?",
    a: "Yes. StutterLab provides all the tools you need — DAF/FAF, structured exercises, AI practice partners, and progress tracking — right in your browser.",
  },
  {
    q: "Is speech therapy for stuttering covered by insurance?",
    a: "Many insurance plans cover speech therapy. Check with your provider. StutterLab is a complementary tool — not a replacement for professional SLP care.",
  },
];

export default function SpeechTherapyForStutteringPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
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
            Complete Guide to Stuttering Speech Therapy
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Speech Therapy for Stuttering:{" "}
            <span className="text-primary">What Works</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Understand the evidence-based approaches to stuttering therapy, find
            the right treatment for you or your child, and practice at home with
            StutterLab.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Practicing Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/app/find-slp">Find an SLP Near You</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What is speech therapy for stuttering */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center">
            What Is Speech Therapy for Stuttering?
          </h2>
          <p className="text-muted-foreground mt-4 text-center max-w-3xl mx-auto leading-relaxed">
            Speech therapy for stuttering is delivered by certified
            Speech-Language Pathologists (SLPs) and focuses on two goals:
            increasing fluency and building confidence in communication.
            Treatment combines motor speech techniques (how you produce sounds)
            with cognitive approaches (how you think and feel about speaking).
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="border-0">
              <CardContent className="pt-6 flex items-start gap-3">
                <Baby className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">For Children</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Early intervention (ages 2-6) has the best outcomes.
                    Parent-involved programs like Lidcombe show strong results.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="pt-6 flex items-start gap-3">
                <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">For Adults</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adults benefit from fluency shaping, stuttering
                    modification, CBT, and daily practice with real-world
                    scenarios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Types of therapy */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              Treatment Approaches
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Types of Speech Therapy for Stuttering
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapyTypes.map((therapy) => (
              <Card
                key={therapy.title}
                className="border-0 hover:border-primary/30 transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="inline-flex p-2.5 rounded-md bg-primary/10 mb-4">
                    <therapy.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{therapy.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {therapy.description}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-3 text-xs bg-muted"
                  >
                    {therapy.forWhom}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Practice at home */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-5">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            Practice Speech Therapy at Home
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Between sessions with your SLP, consistent daily practice is what
            drives lasting improvement. StutterLab gives you professional-grade
            tools in your browser — DAF/FAF audio therapy, structured exercises,
            AI conversation practice, and objective progress tracking.
          </p>
          <Button size="lg" className="mt-6 px-8" asChild>
            <Link href="/signup">
              Try StutterLab Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Start Speech Therapy Practice Today"
        description="Complement your SLP sessions with daily AI-powered practice. Free to start."
      />
    </>
  );
}
