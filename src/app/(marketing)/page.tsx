import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  AudioWaveform,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ClipboardList,
  Flame,
  Heart,
  Mic,
  Phone,
  PhoneOff,
  MessageSquareOff,
  Monitor,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
  BarChart3,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SuccessStoriesLanding } from "@/components/community/success-stories";

const painPoints = [
  {
    icon: PhoneOff,
    pain: "Letting calls go to voicemail",
    solve: "Practice with our Phone Call Simulator until calling feels routine",
  },
  {
    icon: MessageSquareOff,
    pain: "Staying quiet when you have the best idea in the room",
    solve: "Build meeting confidence with AI-powered presentation practice",
  },
  {
    icon: X,
    pain: "Saying \"water\" because you can't say \"coffee\"",
    solve: "Conquer trigger words with the Feared Words Trainer",
  },
  {
    icon: Target,
    pain: "Rehearsing one sentence 10 times before you say it",
    solve: "Rewire your speech patterns with clinically-proven DAF",
  },
];

const features = [
  {
    icon: AudioWaveform,
    title: "Audio Lab",
    pain: "You've been told to \"just slow down.\" That's not how it works.",
    description:
      "DAF, FAF, Choral Speaking & Metronome — the same clinical tools SLPs use, in your browser. Delayed Auditory Feedback alone reduces stuttering by up to 80% in clinical studies.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Phone,
    title: "Phone Call Simulator",
    pain: "Phone calls are the #1 feared situation for people who stutter.",
    description:
      "Practice calling the doctor, ordering takeout, handling customer service — with an AI that responds naturally. Fail safely. Build real confidence.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI Conversation Practice",
    pain: "You can't practice a job interview with a YouTube video.",
    description:
      "Adaptive AI conversations for interviews, dates, meetings, presentations. It listens to you speak, detects your patterns, and adjusts difficulty in real time.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Calendar,
    title: "Feared Words Trainer",
    pain: "Everyone has \"those words.\" The ones you rearrange entire sentences to avoid.",
    description:
      "Add your personal trigger words. Practice them with gentle onset, cancellation, and pull-out techniques until they lose their power over you.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: BookOpen,
    title: "90-Day Curriculum",
    pain: "Random exercises don't work. You need a structured program.",
    description:
      "10 minutes a day. Each session builds on the last — from breathing basics to real-world phone calls. Designed by an SLP, not a product manager.",
    color: "text-brand-amber dark:text-brand-amber",
    bg: "bg-brand-amber/10",
  },
  {
    icon: Heart,
    title: "CBT & Mindfulness",
    pain: "Stuttering is 50% motor, 50% anxiety. Most apps ignore the anxiety.",
    description:
      "Thought records to reframe catastrophic thinking. Guided breathing for pre-call anxiety. Prediction testing to prove your fears wrong.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Trophy,
    title: "Real-World Challenges",
    pain: "Practicing alone is safe. But fluency lives in the real world.",
    description:
      "Daily micro-missions: order at a counter, greet a stranger, make a phone call. Earn XP, build streaks, and prove to yourself it gets easier.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Mic,
    title: "Voice Journal & Analytics",
    pain: "\"Am I actually getting better, or does it just feel that way?\"",
    description:
      "Record yourself daily. AI tracks your fluency rate, speech patterns, and anxiety trends over time. See the proof in your own data.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
];

const testimonials = [
  {
    quote:
      "I used to let every call go to voicemail. After 3 weeks with the phone simulator, I called my insurance company myself for the first time in years. I cried after.",
    name: "Alex M.",
    detail: "Premium member, 3 months",
    stars: 5,
  },
  {
    quote:
      "Day 47. My wife noticed the improvement before I did. The daily curriculum keeps me accountable in a way nothing else has.",
    name: "James R.",
    detail: "47-day streak",
    stars: 5,
  },
  {
    quote:
      "I'm an SLP and this fills a massive gap. My patients practice between sessions and I can see exactly where they're struggling. Game changer for my practice.",
    name: "Dr. Sarah K., CCC-SLP",
    detail: "Recommends to patients",
    stars: 5,
  },
  {
    quote:
      "My name is my hardest word. The Feared Words trainer helped me practice saying \"Marcus\" until it stopped being terrifying. That alone was worth it.",
    name: "Marcus T.",
    detail: "Premium member, 6 weeks",
    stars: 5,
  },
];

const pricingFeatures = [
  "Full Audio Lab (DAF + FAF + Choral + Metronome)",
  "90-day SLP-designed curriculum",
  "Unlimited AI conversations & phone simulator",
  "Feared Words Trainer",
  "CBT & Mindfulness module",
  "Real-world challenges with XP & streaks",
  "Voice Journal with AI fluency scoring",
  "Clinical progress reports",
];

const faqs = [
  {
    q: "Can an app really help with stuttering?",
    a: "StutterLab uses the same evidence-based techniques (DAF, gentle onset, cancellation, CBT) that SLPs use in clinical sessions. The difference is you can practice them every day, not once a week. Research consistently shows that practice frequency is the #1 predictor of fluency improvement.",
  },
  {
    q: "Will this replace my speech therapist?",
    a: "No — and it's not designed to. StutterLab is the practice tool between sessions. Think of it like how physical therapy apps don't replace your PT, but they make sure you do your exercises every day. Many SLPs recommend StutterLab to their patients.",
  },
  {
    q: "I've tried other apps. They didn't work.",
    a: "Most speech apps offer breathing exercises and call it training. StutterLab has a 90-day clinical curriculum, real-time AI conversation practice, DAF/FAF, feared word desensitization, and CBT — the full toolkit, not a fraction of it.",
  },
  {
    q: "What if I don't have time?",
    a: "Each session is 10 minutes. That's shorter than a coffee break. The curriculum is designed for busy professionals who can't spend an hour on speech exercises. Consistency beats duration — 10 minutes daily beats 60 minutes weekly.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ═══ Hero ═══ */}
      <section className="relative py-24 md:py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative flex flex-col items-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-primary/10 text-primary border-0 text-sm px-4 py-1.5"
          >
            AI-powered speech training for people who stutter — designed by an SLP
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center leading-tight">
            Built for people who stutter.
            <br />
            <span className="text-primary">By an SLP who gets it.</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-6 text-center max-w-xl">
            Evidence-based tools to help you speak with less fear and more freedom — 10 minutes a day.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground/80">
            {[
              "Letting calls go to voicemail",
              "Swapping words to avoid blocks",
              "Staying quiet when you have the best idea",
            ].map((item) => (
              <span key={item} className="italic">&ldquo;{item}&rdquo;</span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            If any of these sound familiar — you&apos;re in the right place.
          </p>
          <div className="mt-8">
            <Button size="lg" className="px-10 text-lg h-13" asChild>
              <Link href="/signup">
                Start Your 7-Day Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-base text-muted-foreground">
            {[
              "Private 24/7 training",
              "Evidence-based",
              "Full refund within 7 days",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <a href="#not-for-everyone" className="underline underline-offset-2 hover:text-foreground transition-colors">
              StutterLab is not for everyone.
            </a>
          </p>
        </div>
      </section>

      {/* ═══ "Sound Familiar?" — Pain point recognition ═══ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Sound Familiar?
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-lg mx-auto">
              If any of these hit home, you&apos;re in the right place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {painPoints.map((pp) => (
              <Card key={pp.pain} className="border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-destructive/10 flex-shrink-0">
                          <pp.icon className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">{pp.pain}</p>
                          <div className="flex items-center gap-2 mt-2.5">
                            <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <p className="text-sm text-primary font-medium">
                              {pp.solve}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ See Inside StutterLab — Product Preview ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              <Monitor className="h-3.5 w-3.5 mr-1.5" />
              See Inside StutterLab
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Daily Practice Dashboard
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-lg mx-auto">
              A structured 10-minute routine — right in your browser.
            </p>
          </div>

          {/* Main app mockup */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-lg">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">stutterlab.com/app/today</span>
                </div>
              </div>
              {/* App content mockup */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Day progress */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Day 12 of 90</p>
                    <h3 className="text-xl font-bold mt-0.5">Gentle Onset + Phone Practice</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-bold">12</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-bold">340 XP</span>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "33%" }} />
                </div>
                {/* Task list */}
                <div className="space-y-3">
                  {[
                    { label: "Gentle Onset Warm-up", time: "5 min", done: true, icon: AudioWaveform },
                    { label: "Phone Call Simulator — Doctor's Office", time: "3 min", active: true, icon: Phone },
                    { label: "Feared Words Practice", time: "2 min", done: false, icon: Target },
                  ].map((task) => (
                    <div
                      key={task.label}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.active
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        task.done
                          ? "bg-primary border-primary"
                          : task.active
                            ? "border-primary"
                            : "border-muted-foreground/30"
                      }`}>
                        {task.done && <Check className="h-3 w-3 text-primary-foreground" />}
                        {task.active && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <task.icon className={`h-4 w-4 flex-shrink-0 ${
                        task.done ? "text-primary" : task.active ? "text-primary" : "text-muted-foreground/50"
                      }`} />
                      <span className={`text-base flex-1 ${task.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                        {task.label}
                      </span>
                      <span className="text-sm text-muted-foreground">{task.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            {[
              {
                icon: Headphones,
                title: "Audio Lab",
                description: "DAF, FAF, Choral Speaking — clinical tools in your browser",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: BarChart3,
                title: "Progress Analytics",
                description: "AI-tracked fluency rate, speech patterns, and anxiety trends",
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                icon: Brain,
                title: "AI Conversations",
                description: "Job interviews, phone calls, meetings — adaptive difficulty",
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
              },
            ].map((card) => (
              <Card key={card.title} className="border-border/60">
                <CardContent className="pt-6 pb-5">
                  <div className={`inline-flex p-2.5 rounded-lg ${card.bg} mb-3`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <h4 className="font-semibold text-base">{card.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Not For Everyone ═══ */}
      <section id="not-for-everyone" className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            StutterLab Is Not For Everyone
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-8">
            We&apos;d rather be honest upfront than waste your time.
          </p>
          <div className="space-y-3 max-w-lg mx-auto">
            {[
              {
                title: "Children",
                detail: "StutterLab is designed for adults. Pediatric stuttering requires direct SLP supervision.",
              },
              {
                title: "People looking for a quick fix",
                detail: "There is no magic cure for stuttering. This is a 90-day training program that requires real effort.",
              },
              {
                title: "People who can\u2019t commit to 10 minutes a day",
                detail: "Consistency is everything. If you can\u2019t practice daily, this won\u2019t work.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60">
                <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                </div>
              </div>
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
              <Timer className="h-3.5 w-3.5 mr-1.5" />
              10 Minutes a Day
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              A Real Training Program.
              <br />
              Not Another Meditation App.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Day 1: Feel the Difference",
                description:
                  "Try DAF in your first session. Most people feel an immediate change in their speech. It\u2019s not magic \u2014 it\u2019s neuroscience. Your brain responds to altered auditory feedback by slowing and smoothing your speech patterns.",
                icon: Sparkles,
              },
              {
                step: "2",
                title: "Days 2\u201314: Build Your Toolkit",
                description:
                  "Learn gentle onset, pausing, light contact. Practice conversations with AI. Complete your first real-world challenge. By Day 14, you\u2019ll have 5 techniques you can use anywhere \u2014 not just in the app.",
                icon: Flame,
              },
              {
                step: "3",
                title: "Days 15\u201390: Transform",
                description:
                  "Advanced AI scenarios: job interviews, phone calls, presentations. Feared Words mastery. CBT for speech anxiety. By Day 90, you won\u2019t need us anymore. That\u2019s the point.",
                icon: TrendingUp,
              },
            ].map((step) => (
              <div key={step.step}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-xl">{step.title}</h3>
                <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features — Pain-point-led ═══ */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Clinical-Grade Tools
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything Your SLP Uses.
              <br />
              Available 24/7 in Your Browser.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/60 hover:border-primary/30 transition-all group"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`inline-flex p-2.5 rounded-lg ${feature.bg} group-hover:scale-105 transition-transform flex-shrink-0`}
                    >
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-base text-foreground/60 dark:text-foreground/50 mt-1">
                        {feature.pain}
                      </p>
                      <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Social Proof ═══ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              &ldquo;I Wish I Had This 10 Years Ago&rdquo;
            </h2>
            <p className="text-lg text-muted-foreground mt-3">
              Trusted by adults who stutter and recommended by SLPs nationwide.
            </p>
          </div>
          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {[
              { stat: "4.9/5", label: "Average rating" },
              { stat: "90 days", label: "Full curriculum" },
              { stat: "24/7", label: "AI available anytime" },
              { stat: "SLP-built", label: "By a licensed clinician" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{item.stat}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0">
                <CardContent className="pt-6 pb-5">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">
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

      {/* ═══ Real Stories ═══ */}
      <SuccessStoriesLanding />

      {/* ═══ The Science ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Evidence-Based
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              This Isn&apos;t Positive Thinking.
              <br />
              It&apos;s Neuroscience.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stat: "80%",
                label: "fluency improvement with DAF",
                detail:
                  "Delayed Auditory Feedback is one of the most-studied interventions in stuttering research. It changes how your brain processes speech in real time.",
              },
              {
                stat: "70M",
                label: "people worldwide stutter",
                detail:
                  "You\u2019re not broken. Stuttering is a neurological difference affecting 1% of the population. Consistent practice works because of neuroplasticity.",
              },
              {
                stat: "10 min",
                label: "daily practice changes brain structure",
                detail:
                  "fMRI studies show that consistent speech practice literally rewires the neural pathways responsible for fluency. Frequency matters more than duration.",
              },
            ].map((item) => (
              <Card key={item.label} className="border-border/60 text-center">
                <CardContent className="pt-8 pb-6">
                  <p className="text-5xl font-bold text-primary">{item.stat}</p>
                  <p className="text-base font-semibold mt-2">{item.label}</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {item.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Founder / Clinical Authority ═══ */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <Image
                src="/RamGangisetty.jpg"
                alt="Ram Gangisetty, M.S., CCC-SLP — Founder of StutterLab"
                width={288}
                height={384}
                className="w-72 h-96 rounded-2xl object-cover object-top border border-primary/10"
              />
            </div>
            <div>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-0"
              >
                <Shield className="h-3 w-3 mr-1" />
                Why This Exists
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                &ldquo;My Patients Needed a Way to Practice Between Sessions&rdquo;
              </h2>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                I built StutterLab because I watched my clients make incredible progress in our
                sessions — then come back a week later having lost momentum. They didn&apos;t need
                more willpower. They needed a tool that put clinical-grade practice in their pocket.
              </p>
              <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
                Every exercise, every AI conversation prompt, every progression in this
                curriculum is built on peer-reviewed fluency shaping and stuttering modification
                research. This isn&apos;t a wellness app with a speech theme.
                It&apos;s a training program.
              </p>
              <div className="mt-6 space-y-1">
                <p className="text-lg font-semibold">Ram Gangisetty, M.S., CCC-SLP</p>
                <p className="text-base text-muted-foreground">
                  Licensed Speech-Language Pathologist
                </p>
                <p className="text-base text-muted-foreground">
                  Specializing in fluency disorders and stuttering
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Pricing ═══ */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Less Than One SLP Session.
              <br />
              Every Day for a Month.
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-lg mx-auto">
              A single private SLP session costs $150-250.
              StutterLab gives you SLP-designed practice every day.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="border-primary border-2 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-sm">
                  7-Day Free Trial
                </Badge>
              </div>
              <CardContent className="pt-8 pb-6">
                <h3 className="font-semibold text-xl">StutterLab</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">$99</span>
                  <span className="text-muted-foreground text-base">
                    /month
                  </span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  $999/year — save $189
                </p>
                <p className="text-base text-muted-foreground mt-2">
                  Full access to everything. 7 days free.
                </p>
                <Button className="w-full mt-6" size="lg" asChild>
                  <Link href="/signup">Start 7-Day Free Trial</Link>
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {pricingFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-base"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ FAQ — Accordion ═══ */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Questions You Might Have
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ For SLPs — Enhanced ═══ */}
      <section id="for-slps" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-5">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Built for Your Patients.
                <br />
                Designed for Your Workflow.
              </h2>
              <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                Your patients need to practice between sessions. StutterLab gives them
                a structured, evidence-based daily routine — and gives you visibility
                into their progress.
              </p>
              <Button size="lg" className="mt-6 px-8" asChild>
                <Link href="/signup">
                  Learn About SLP Plans
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: ClipboardList,
                  title: "Prescribe exercises",
                  description: "Assign specific techniques and track completion between visits",
                },
                {
                  icon: BarChart3,
                  title: "Review AI analysis",
                  description: "See AI-tracked fluency data, speech rate, and disfluency patterns",
                },
                {
                  icon: TrendingUp,
                  title: "Track outcomes",
                  description: "Monitor progress over the 90-day program with clinical reports",
                },
                {
                  icon: Users,
                  title: "Patient compliance",
                  description: "Daily streaks and gamification keep patients engaged between sessions",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">{item.title}</p>
                    <p className="text-base text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            You Have Something to Say.
            <br />
            <span className="text-primary">The World Needs to Hear It.</span>
          </h2>
          <p className="text-muted-foreground mt-6 text-xl leading-relaxed max-w-xl mx-auto">
            That idea in the meeting. That joke on the date. That &ldquo;hi&rdquo;
            to the stranger. Your voice matters — and you can train it to show up when you need it.
          </p>
          <div className="mt-10">
            <Button size="lg" className="px-10 text-lg h-13" asChild>
              <Link href="/signup">
                Start 7-Day Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            7 days free. Cancel anytime.
          </p>
        </div>
      </section>
    </>
  );
}
