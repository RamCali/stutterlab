"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Brain,
  AudioWaveform,
  Wind,
  Hand,
  Timer,
  Users,
  Heart,
  Mic,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Crown,
  HelpCircle,
} from "lucide-react";

const modules = [
  {
    id: 1,
    title: "Understanding Stuttering",
    description: "What causes stuttering, how it develops, and why it varies day to day.",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    lessons: 4,
    isPremium: false,
  },
  {
    id: 2,
    title: "The Audio Lab Explained",
    description: "How DAF, FAF, choral speaking, and metronome work to reduce stuttering.",
    icon: AudioWaveform,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    lessons: 3,
    isPremium: false,
  },
  {
    id: 3,
    title: "Breathing for Speech",
    description: "Diaphragmatic breathing, airflow management, and pre-speech preparation.",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    lessons: 3,
    isPremium: false,
  },
  {
    id: 4,
    title: "Gentle Onset & Light Contact",
    description: "Reduce tension at the start of words. The foundation of fluency shaping.",
    icon: Hand,
    color: "text-green-500",
    bg: "bg-green-500/10",
    lessons: 3,
    isPremium: false,
  },
  {
    id: 5,
    title: "Pacing & Pausing",
    description: "Slow down, use natural pauses, and reduce time pressure during speech.",
    icon: Timer,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    lessons: 2,
    isPremium: false,
  },
  {
    id: 6,
    title: "Stuttering Modification",
    description: "Cancellation, pull-out, and preparatory set — learn to stutter more easily and openly.",
    icon: Mic,
    color: "text-red-500",
    bg: "bg-red-500/10",
    lessons: 4,
    isPremium: true,
  },
  {
    id: 7,
    title: "Managing Speech Anxiety",
    description: "CBT techniques, thought records, and building confidence in speaking situations.",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    lessons: 5,
    isPremium: true,
  },
  {
    id: 8,
    title: "Desensitization & Acceptance",
    description: "Voluntary stuttering, self-disclosure, and ACT-based acceptance approaches.",
    icon: Users,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    lessons: 3,
    isPremium: true,
  },
  {
    id: 9,
    title: "Real-World Practice",
    description: "Transferring techniques from practice to phone calls, meetings, and conversations.",
    icon: BookOpen,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    lessons: 4,
    isPremium: true,
  },
  {
    id: 10,
    title: "Maintenance & Relapse Prevention",
    description: "How to keep your gains, handle setbacks, and build a long-term speaking plan.",
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    lessons: 3,
    isPremium: true,
  },
];

// Lesson content for expandable modules
const lessonContent: Record<number, { title: string; content: string }[]> = {
  1: [
    {
      title: "It's Neurological, Not Psychological",
      content: "Stuttering is a neurodevelopmental disorder — not caused by anxiety, nervousness, or parenting styles. Approximately 70% of the variance is attributed to genetics. Specific gene mutations (GNPTAB, GNPTG, NAGPA) affect brain cell trafficking. Neuroimaging (fMRI, PET scans) consistently shows structural and functional differences in the brains of people who stutter.",
    },
    {
      title: "What's Happening in Your Brain",
      content: "People who stutter show reduced white matter integrity in the left rolandic operculum — the area connecting speech planning and execution. There's also hyperactivity in the right hemisphere, which researchers believe is a compensatory mechanism. Additionally, elevated dopamine levels in the striatum disrupt speech motor timing. Understanding this removes blame and shame — it's brain wiring, not willpower.",
    },
    {
      title: "The ABC Model of Stuttering",
      content: "Clinicians describe stuttering's impact through three dimensions: Affective (feelings of shame, guilt, frustration), Behavioral (blocks, repetitions, prolongations, plus secondary behaviors like eye blinking or jaw tension), and Cognitive (negative self-talk and constant 'scanning' for difficult words to swap for easier ones). Effective treatment addresses all three, not just the physical stuttering.",
    },
    {
      title: "Prevalence & Recovery",
      content: "About 5-8% of children experience stuttering during development. 75-80% recover naturally — especially girls (the childhood ratio is 2:1 boys to girls, but the adult ratio shifts to 4:1 because girls recover more often). About 1% of the global adult population — roughly 70 million people — stutter chronically. Key persistence risk factors: family history, male gender, and stuttering for more than 12 months.",
    },
  ],
};

const faqs = [
  { q: "Is stuttering caused by nervousness or anxiety?", a: "No. Stuttering is a neurodevelopmental disorder with ~70% genetic basis. However, stress can increase muscle tension which may temporarily worsen disfluency." },
  { q: "Can stuttering be cured?", a: "There is no 'cure' in the medical sense, but evidence-based treatments show significant efficacy. Speech restructuring shows large effect sizes (d = 0.75–1.63), and many adults achieve substantial improvement." },
  { q: "Why can I sing without stuttering?", a: "Singing uses different neural pathways — continuous airflow and a steady rhythm bypass the basal ganglia timing disruption that causes disfluency." },
  { q: "Why do I stutter more on my name?", a: "Names cannot be substituted for synonyms, which increases 'communicative pressure.' The brain can't fall back on word-swapping strategies." },
  { q: "Why can I talk to my pet without stuttering?", a: "Lack of social judgment reduces the 'threat' response in the brain. The amygdala's fear circuit is less activated, which reduces the tension that triggers blocks." },
  { q: "Does alcohol help with stuttering?", a: "No. It may reduce inhibition but usually impairs motor control. It's not a treatment strategy." },
  { q: "Is stuttering related to intelligence?", a: "Absolutely not. Research shows zero correlation between IQ and stuttering." },
  { q: "Should people finish my sentences for me?", a: "No. This increases communicative pressure and can be frustrating. Maintaining eye contact and giving time is more helpful." },
  { q: "Can stuttering start in adulthood?", a: "Yes, usually due to brain injury or stroke (called 'neurogenic stuttering'). This is distinct from childhood-onset stuttering." },
  { q: "Does talking more help or hurt?", a: "Talking more helps. Avoidant behavior — avoiding calls, swapping words, staying silent — usually worsens the emotional impact of stuttering over time." },
  { q: "Does caffeine affect stuttering?", a: "Some people report increased tension due to caffeine's stimulant nature, which can temporarily increase disfluency. It varies person to person." },
  { q: "Do most children outgrow it?", a: "Yes — 75-80% recover naturally, especially with early intervention. Persistence risk factors include family history, male gender, and stuttering beyond 12 months." },
];

export default function LearnPage() {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Learn
        </h1>
        <p className="text-muted-foreground mt-1">
          10 evidence-based modules covering everything from breathing to real-world confidence
        </p>
      </div>

      {/* Science banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Backed by neuroscience.</span>{" "}
            Stuttering is a neurodevelopmental disorder with ~70% genetic basis. fMRI studies show
            structural differences in speech motor areas. Every technique in this app targets these
            specific neural pathways.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {modules.map((mod) => {
          const lessons = lessonContent[mod.id];
          const isExpanded = expandedModule === mod.id;

          return (
            <Card
              key={mod.id}
              className={`transition-colors ${isExpanded ? "border-primary/50" : "hover:border-primary/50"} ${lessons ? "cursor-pointer" : ""}`}
            >
              <CardContent className="py-4">
                <div
                  className="flex items-center gap-4"
                  onClick={() => lessons && setExpandedModule(isExpanded ? null : mod.id)}
                >
                  <div className={`p-2.5 rounded-lg ${mod.bg} flex-shrink-0`}>
                    <mod.icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Module {mod.id}</span>
                      {mod.isPremium && (
                        <Badge variant="outline" className="text-[10px]">
                          <Crown className="h-2.5 w-2.5 mr-0.5" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{mod.lessons} lessons</span>
                    {lessons ? (
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded lesson content */}
                {isExpanded && lessons && (
                  <div className="mt-4 pl-14 space-y-3">
                    {lessons.map((lesson, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium mb-1">
                          Lesson {i + 1}: {lesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {lesson.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="pt-4">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Science-backed answers to common questions about stuttering
        </p>
        <div className="space-y-2">
          {(showAllFaqs ? faqs : faqs.slice(0, 5)).map((faq, i) => (
            <Card key={i}>
              <CardContent className="py-3">
                <p className="text-sm font-medium mb-1">{faq.q}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {faqs.length > 5 && (
          <button
            onClick={() => setShowAllFaqs(!showAllFaqs)}
            className="mt-3 text-xs text-primary hover:underline"
          >
            {showAllFaqs ? "Show less" : `Show all ${faqs.length} questions`}
          </button>
        )}
      </div>
    </div>
  );
}
