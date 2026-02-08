"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Wind,
  Hand,
  Timer,
  Pause,
  Undo2,
  ArrowUpRight,
  Shield,
  Zap,
  AudioWaveform,
} from "lucide-react";

const techniques = [
  {
    name: "Gentle Onset",
    category: "Fluency Shaping",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    description: "Begin words with a soft, easy airflow rather than a hard glottal attack. Reduces blocks on initial sounds.",
    when: "Use on words starting with vowels or when you feel tension building before speaking.",
    evidence: "Speech restructuring shows large effect sizes (d = 0.75–1.63). Targets the brain region connecting speech planning to execution.",
    science: "Neuroimaging shows reduced white matter integrity in the left rolandic operculum in people who stutter. Gentle onset helps bypass the hard-attack pattern by establishing airflow before phonation.",
  },
  {
    name: "Light Articulatory Contact",
    category: "Fluency Shaping",
    icon: Hand,
    color: "text-green-500",
    bg: "bg-green-500/10",
    description: "Touch your articulators (lips, tongue, teeth) lightly when forming consonants instead of pressing hard.",
    when: "Use on plosive sounds like /p/, /b/, /t/, /d/, /k/, /g/ where you tend to block.",
    evidence: "Reduces the physical tension that maintains stuttering blocks. Addresses the behavioral component of the ABC model of stuttering.",
    science: "Elevated dopamine in the striatum disrupts speech motor timing. Light contact reduces the muscular over-preparation that creates blocks.",
  },
  {
    name: "Prolonged Speech",
    category: "Fluency Shaping",
    icon: Timer,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Stretch vowel sounds and blend words together for continuous, flowing speech.",
    when: "Start at very slow rates (60 SPM) and gradually increase to natural speaking rate.",
    evidence: "Shown to reduce stuttering by 90%+ in clinical trials. Continuous phonation activates different neural pathways.",
    science: "Similar to why singing eliminates stuttering for most people — continuous airflow and steady rhythm bypass the basal ganglia timing disruption that causes disfluency.",
  },
  {
    name: "Pausing Strategy",
    category: "Fluency Shaping",
    icon: Pause,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: "Insert natural pauses between phrases. Reduces time pressure and gives you time to plan.",
    when: "Use in conversations, presentations, or any time you feel rushed.",
    evidence: "Reduces anticipatory anxiety and allows better speech motor planning. Interrupts the cognitive 'word-scanning' cycle.",
    science: "The brain's constant scanning for difficult words increases communicative pressure. Pausing interrupts this cycle and allows the speech motor system to reset.",
  },
  {
    name: "Cancellation",
    category: "Stuttering Modification",
    icon: Undo2,
    color: "text-red-500",
    bg: "bg-red-500/10",
    description: "After stuttering on a word, pause, then say it again using a modification technique.",
    when: "Use after a stutter to build awareness and practice voluntary control.",
    evidence: "Evidence-based stuttering modification approach. Builds desensitization and voluntary control over speech motor patterns.",
    science: "Neuroplasticity research shows that consciously re-attempting a word with a new motor plan strengthens alternative neural pathways in the left hemisphere.",
  },
  {
    name: "Pull-Out",
    category: "Stuttering Modification",
    icon: ArrowUpRight,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    description: "While in a stutter, consciously slow down and ease out of the block smoothly.",
    when: "Use mid-stutter. Requires awareness of when you are stuttering in real-time.",
    evidence: "More advanced than cancellation. Gives real-time control over stuttering moments without stopping speech.",
    science: "Trains the brain to shift from right-hemisphere compensation back to left-hemisphere speech motor control in real-time.",
  },
  {
    name: "Preparatory Set",
    category: "Stuttering Modification",
    icon: Shield,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    description: "Before saying a feared word, pre-plan your articulatory position and use gentle onset.",
    when: "Use when you anticipate a stutter on an upcoming word.",
    evidence: "The most proactive modification technique. Prevents stuttering before it occurs by pre-setting the speech motor plan.",
    science: "Addresses why people stutter more on their own name — names can't be substituted, increasing communicative pressure. Preparatory set provides an alternative motor plan.",
  },
  {
    name: "Voluntary Stuttering",
    category: "Desensitization",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    description: "Intentionally stutter on easy words to reduce fear, shame, and avoidance behaviors.",
    when: "Use in low-stress situations first, then gradually in more challenging settings.",
    evidence: "Reduces the emotional impact of stuttering (d = 0.56–0.65) and breaks the avoidance cycle.",
    science: "Lack of social judgment reduces the brain's threat response — that's why you can talk to pets without stuttering. Voluntary stuttering deliberately lowers this threat signal.",
  },
  {
    name: "DAF / FAF",
    category: "Auditory Feedback",
    icon: AudioWaveform,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Altered auditory feedback disrupts the feedback loop that maintains stuttering, triggering a choral effect that increases fluency.",
    when: "Use during practice sessions or real-world speaking with headphones.",
    evidence: "DAF alone reduces stuttering 60-80%. Combined DAF+FAF can reach 80%+ reduction.",
    science: "A slight delay or pitch shift triggers the 'choral effect' — the brain processes your altered voice as another speaker, engaging unison-speech pathways that bypass the stuttering circuit.",
  },
];

export default function TechniquesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Technique Reference
        </h1>
        <p className="text-muted-foreground mt-1">
          Quick reference for all evidence-based speech techniques
        </p>
      </div>

      <div className="space-y-4">
        {techniques.map((tech) => (
          <Card key={tech.name}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${tech.bg} flex-shrink-0 mt-0.5`}>
                  <tech.icon className={`h-5 w-5 ${tech.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{tech.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {tech.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tech.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs">
                      <span className="font-medium">When to use: </span>
                      <span className="text-muted-foreground">{tech.when}</span>
                    </p>
                    <p className="text-xs">
                      <span className="font-medium">Evidence: </span>
                      <span className="text-muted-foreground">{tech.evidence}</span>
                    </p>
                    {tech.science && (
                      <p className="text-xs mt-1.5 p-2 rounded bg-primary/5 border border-primary/10">
                        <span className="font-medium text-primary">The science: </span>
                        <span className="text-muted-foreground">{tech.science}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
