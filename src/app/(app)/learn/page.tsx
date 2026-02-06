import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Atom,
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageCircle,
  Microscope,
  Puzzle,
  Shield,
  Sparkles,
  Users,
  Volume2,
  Zap,
} from "lucide-react";

/* ─── Educational Content Modules ─── */
const modules = [
  {
    id: "what-is-stuttering",
    title: "What Is Stuttering?",
    description:
      "Understand the basics: types of disfluency, prevalence, and why stuttering is not your fault.",
    icon: Lightbulb,
    color: "bg-primary/10 text-primary",
    lessons: 4,
    readTime: "12 min",
    free: true,
  },
  {
    id: "brain-science",
    title: "The Brain Science of Stuttering",
    description:
      "How the basal ganglia, supplementary motor area, and auditory feedback loops relate to disfluency.",
    icon: Brain,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    lessons: 5,
    readTime: "15 min",
    free: true,
  },
  {
    id: "speech-anatomy",
    title: "Speech Anatomy & Mechanics",
    description:
      "Learn how your diaphragm, larynx, vocal folds, tongue, and lips work together to produce speech.",
    icon: Microscope,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    lessons: 6,
    readTime: "18 min",
    free: false,
  },
  {
    id: "types-of-stuttering",
    title: "Types of Stuttering",
    description:
      "Blocks, prolongations, repetitions (part-word and whole-word), interjections, and revisions explained.",
    icon: Puzzle,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    lessons: 4,
    readTime: "10 min",
    free: true,
  },
  {
    id: "daf-faf-science",
    title: "How DAF & FAF Work",
    description:
      "The science behind Delayed and Frequency Altered Feedback — why hearing your voice differently reduces stuttering by 60-80%.",
    icon: Volume2,
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    lessons: 3,
    readTime: "8 min",
    free: true,
  },
  {
    id: "fluency-shaping",
    title: "Fluency Shaping Techniques",
    description:
      "Gentle onset, continuous phonation, light articulatory contact, and prolonged speech — the core techniques explained.",
    icon: Activity,
    color: "bg-sage-100 text-sage-600 dark:bg-sage-500/10 dark:text-sage-500",
    lessons: 6,
    readTime: "20 min",
    free: false,
  },
  {
    id: "stuttering-modification",
    title: "Stuttering Modification (Van Riper)",
    description:
      "Cancellation, pull-out, and preparatory set — learn to modify moments of stuttering rather than avoid them.",
    icon: Shield,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lessons: 5,
    readTime: "15 min",
    free: false,
  },
  {
    id: "anxiety-connection",
    title: "The Anxiety-Stuttering Connection",
    description:
      "How speaking anxiety and anticipation amplify disfluency — and what CBT, ACT, and mindfulness can do about it.",
    icon: Heart,
    color: "bg-warm-100 text-warm-600 dark:bg-warm-500/10 dark:text-warm-500",
    lessons: 4,
    readTime: "12 min",
    free: false,
  },
  {
    id: "social-dynamics",
    title: "Social Dynamics & Disclosure",
    description:
      "When and how to disclose your stutter, handling listener reactions, and building speaking confidence in social settings.",
    icon: Users,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    lessons: 4,
    readTime: "10 min",
    free: false,
  },
  {
    id: "covert-stuttering",
    title: "Covert (Hidden) Stuttering",
    description:
      "Word substitution, avoidance behaviors, and the exhausting effort of hiding a stutter. You are not alone.",
    icon: MessageCircle,
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    lessons: 3,
    readTime: "8 min",
    free: true,
  },
];

/* ─── Quick Facts ─── */
const quickFacts = [
  { stat: "1%", label: "of the world population stutters" },
  { stat: "70M+", label: "people who stutter worldwide" },
  { stat: "80%", label: "reduction with DAF + FAF therapy" },
  { stat: "5:1", label: "male-to-female ratio in adults" },
];

export default function LearnPage() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Understand Your Stuttering
        </h1>
        <p className="text-muted-foreground mt-1">
          Knowledge is power. Learn the science behind stuttering and the
          techniques that help — written by speech-language pathologists.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickFacts.map((fact) => (
          <Card key={fact.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl md:text-2xl font-bold text-primary">
                {fact.stat}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                {fact.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Module */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-[10px] mb-2"
              >
                Start Here
              </Badge>
              <h3 className="font-semibold">
                New to StutterLab? Start with &ldquo;What Is Stuttering?&rdquo;
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Understanding your stuttering is the first step toward managing
                it. This 12-minute module covers the basics every adult who
                stutters should know.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Educational Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card
                key={mod.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.color} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{mod.title}</h3>
                        {mod.free ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          >
                            Free
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Pro
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {mod.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {mod.readTime} read
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Research References */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Atom className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                Evidence-Based & Research-Backed
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                All educational content is reviewed by licensed SLPs and
                references peer-reviewed research from the Journal of Fluency
                Disorders, ASHA, and the Stuttering Foundation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
