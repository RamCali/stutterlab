import Link from "next/link";
import {
  ArrowRight,
  AudioWaveform,
  BookOpen,
  Brain,
  Clock,
  Heart,
  Mic,
  Sparkles,
  Target,
  Volume2,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";
import { createMetadata, jsonLd } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Stuttering Exercises - Daily Practice for Better Fluency",
  description:
    "Free stuttering exercises you can practice daily. Gentle onset, breathing, prolonged speech, light contact, and more. Structured 90-day curriculum included.",
  path: "/stuttering-exercises",
});

const exercises = [
  {
    icon: Wind,
    title: "Diaphragmatic Breathing",
    difficulty: "Beginner",
    duration: "3 min",
    description:
      "Foundation for fluent speech. Learn belly breathing that supports smooth airflow and reduces tension in your speech system.",
    technique: "Breathe in through your nose for 4 counts, filling your belly. Exhale slowly through your mouth for 6 counts. Practice before speaking.",
  },
  {
    icon: Mic,
    title: "Gentle Onset",
    difficulty: "Beginner",
    duration: "5 min",
    description:
      "Start each phrase with a soft, easy voice. Instead of forcing sounds out, let your voice begin gently and build naturally.",
    technique: "Start with vowel sounds (ah, oh, ee). Progress to words starting with vowels, then consonants. Keep your throat relaxed.",
  },
  {
    icon: Volume2,
    title: "Prolonged Speech",
    difficulty: "Beginner",
    duration: "5 min",
    description:
      "Stretch your words slightly, connecting them smoothly. This reduces the pressure that triggers blocks and repetitions.",
    technique: "Read a passage at half speed, stretching vowels. Gradually increase speed while maintaining smooth connections.",
  },
  {
    icon: Target,
    title: "Light Articulatory Contact",
    difficulty: "Intermediate",
    duration: "5 min",
    description:
      "Touch your tongue, lips, and teeth lightly when making sounds. Reduces the physical tension that can trigger blocks.",
    technique: "Focus on consonants like /p/, /b/, /t/, /d/. Say words slowly with the lightest possible contact.",
  },
  {
    icon: AudioWaveform,
    title: "DAF Practice",
    difficulty: "Intermediate",
    duration: "10 min",
    description:
      "Use Delayed Auditory Feedback to hear your voice on a delay. This naturally slows your speech and can reduce stuttering by up to 80%.",
    technique: "Start with 100ms delay. Read passages aloud. Gradually reduce delay as fluency improves.",
  },
  {
    icon: Brain,
    title: "Cancellation",
    difficulty: "Advanced",
    duration: "5 min",
    description:
      "After a stutter, pause, and then repeat the word using your technique. Builds awareness and control over stuttering moments.",
    technique: "When you stutter on a word, stop. Take a breath. Say the word again with gentle onset or prolongation.",
  },
  {
    icon: Clock,
    title: "Pull-Out",
    difficulty: "Advanced",
    duration: "5 min",
    description:
      "During a stuttering moment, ease out of the block smoothly rather than pushing through. A key stuttering modification technique.",
    technique: "When you feel stuck, slow down mid-word. Stretch the sound gently until you can transition to the next sound.",
  },
  {
    icon: Heart,
    title: "Voluntary Stuttering",
    difficulty: "Advanced",
    duration: "5 min",
    description:
      "Deliberately stutter on non-feared words. This reduces fear, builds desensitization, and gives you a sense of control.",
    technique: "Choose easy words and deliberately repeat the first sound 2-3 times. Practice in low-pressure situations first.",
  },
];

const dailyPlan = [
  { time: "2 min", activity: "Diaphragmatic breathing warm-up" },
  { time: "5 min", activity: "Gentle onset + prolonged speech practice" },
  { time: "10 min", activity: "Audio Lab session (DAF/FAF)" },
  { time: "5 min", activity: "AI conversation practice" },
  { time: "3 min", activity: "Voice journal reflection" },
];

export default function StutteringExercisesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@type": "HowTo",
          name: "Stuttering Exercises for Daily Practice",
          description:
            "A collection of evidence-based stuttering exercises for daily practice, from beginner to advanced.",
          step: exercises.map((ex, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: ex.title,
            text: ex.technique,
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
            Free Stuttering Exercises
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            25 Minutes a Day to{" "}
            <span className="text-primary">Speak with Confidence</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The same exercises SLPs use with their patients — structured into a
            daily routine you can do from anywhere. No clinic visits required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Guided Exercises
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/app/audio-lab">Try Audio Lab Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Exercises */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              8 Essential Stuttering Exercises
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Practiced daily, these exercises build the foundation for lasting
              fluency improvement.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exercises.map((exercise) => (
              <Card
                key={exercise.title}
                className="border-0 hover:border-primary/30 transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex p-2.5 rounded-md bg-primary/10 shrink-0">
                      <exercise.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-muted"
                        >
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {exercise.duration}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exercise.description}
                      </p>
                      <div className="mt-3 p-3 rounded-md bg-muted/50">
                        <p className="text-xs font-medium mb-1">How to practice:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {exercise.technique}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Daily plan */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary/10 text-primary border-0"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Daily Plan
            </Badge>
            <h2 className="text-3xl font-bold">
              Sample 25-Minute Daily Practice
            </h2>
            <p className="text-muted-foreground mt-3">
              StutterLab structures this into a guided daily session.
            </p>
          </div>
          <div className="space-y-3">
            {dailyPlan.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border/60"
              >
                <span className="text-sm font-bold text-primary min-w-[50px]">
                  {item.time}
                </span>
                <span className="text-sm">{item.activity}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">
                Start Your Daily Plan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For kids and adults */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Exercises for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">For Kids</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Fun breathing games and activities</li>
                  <li>Gentle onset with simple words</li>
                  <li>Reading practice with DAF support</li>
                  <li>Parent-guided exercises</li>
                  <li>Progress rewards and streaks</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">For Adults</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>All 8 core exercises above</li>
                  <li>AI phone call and conversation practice</li>
                  <li>Feared word desensitization</li>
                  <li>Real-world scenario challenges</li>
                  <li>CBT & mindfulness for speaking anxiety</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <CtaSection
        title="You're Not Broken. You Just Need the Right Practice."
        description="StutterLab structures these exercises into your personalized 90-day plan. See real progress, not just hope."
        primaryCta="Start Free"
      />
    </>
  );
}
