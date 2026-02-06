import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NotebookPen,
  Wind,
  Hand,
  Timer,
  Pause,
  RotateCcw,
  ArrowRight,
  Target,
  Brain,
  Heart,
  Volume2,
} from "lucide-react";

const techniques = [
  {
    title: "Gentle Onset",
    icon: Wind,
    category: "Fluency Shaping",
    evidence: "Strong",
    description: "Start the first sound of a word softly and gradually increase to normal volume. Reduces blocks on initial sounds.",
    howTo: "Begin speaking with a soft, breathy voice and gradually transition to normal volume. Focus on vowel-starting words first, then consonants.",
    bestFor: "Blocks at the beginning of words, hard starts",
  },
  {
    title: "Light Articulatory Contact",
    icon: Hand,
    category: "Fluency Shaping",
    evidence: "Strong",
    description: "Use minimal pressure when your tongue, lips, and jaw make contact during speech. Prevents getting 'stuck' on sounds.",
    howTo: "When producing consonants like /b/, /p/, /t/, /d/, /k/, /g/, barely touch the articulators together instead of pressing hard.",
    bestFor: "Blocks on stop consonants, jaw tension",
  },
  {
    title: "Prolonged Speech",
    icon: Timer,
    category: "Fluency Shaping",
    evidence: "Strong",
    description: "Stretch out vowels and consonants to slow your speaking rate. Creates smoother, more continuous speech.",
    howTo: "Extend each sound slightly longer than normal, connecting sounds smoothly together. Gradually increase speed as fluency improves.",
    bestFor: "General fluency improvement, establishing a baseline",
  },
  {
    title: "Pausing Strategies",
    icon: Pause,
    category: "Fluency Shaping",
    evidence: "Moderate",
    description: "Insert natural pauses between phrases and thought groups. Gives you time to prepare the next phrase and maintain airflow.",
    howTo: "Pause at natural phrase boundaries (commas, periods, between ideas). Take a breath during each pause.",
    bestFor: "Running out of breath, rushing through speech",
  },
  {
    title: "Cancellation",
    icon: RotateCcw,
    category: "Stuttering Modification",
    evidence: "Strong",
    description: "After a stutter, pause deliberately, then restart the word using a modification technique. Breaks the cycle of struggle.",
    howTo: "When you stutter: 1) Stop completely. 2) Pause 2-3 seconds. 3) Replay the stutter mentally. 4) Say the word again with light contact or prolongation.",
    bestFor: "Building awareness, reducing avoidance",
  },
  {
    title: "Pull-Out",
    icon: ArrowRight,
    category: "Stuttering Modification",
    evidence: "Strong",
    description: "Modify the stutter while it's happening by easing out of the tension. Shows you can control the stutter mid-moment.",
    howTo: "When you feel yourself stuttering: 1) Don't stop. 2) Slowly reduce the tension. 3) Stretch the sound out smoothly. 4) Continue into the next sound.",
    bestFor: "Prolongations, blocks, reducing severity",
  },
  {
    title: "Preparatory Set",
    icon: Target,
    category: "Stuttering Modification",
    evidence: "Strong",
    description: "Before saying a word you expect to stutter on, pre-plan how you'll say it using a modification technique.",
    howTo: "1) Identify the feared word. 2) Decide which technique to use (gentle onset, light contact, prolongation). 3) Mentally rehearse. 4) Execute with the planned technique.",
    bestFor: "Feared words, anticipatory anxiety",
  },
  {
    title: "DAF (Delayed Auditory Feedback)",
    icon: Volume2,
    category: "Altered Auditory Feedback",
    evidence: "Strong",
    description: "Hear your voice with a 50-70ms delay through headphones. Naturally slows speech rate and reduces stuttering by 60-80%.",
    howTo: "Use the StutterLab Audio Lab with headphones. Start at 70ms delay, practice reading aloud. Gradually reduce delay as fluency improves.",
    bestFor: "Speed control, establishing fluency baseline",
  },
  {
    title: "CBT for Speech Anxiety",
    icon: Brain,
    category: "Psychological",
    evidence: "Strong",
    description: "Cognitive Behavioral Therapy helps identify and challenge negative thoughts about speaking that increase anxiety and stuttering.",
    howTo: "Use thought records to identify automatic negative thoughts (e.g., 'Everyone will judge me'). Challenge them with evidence. Build balanced alternative thoughts.",
    bestFor: "Social anxiety, avoidance behavior, feared situations",
  },
  {
    title: "Acceptance & Commitment Therapy",
    icon: Heart,
    category: "Psychological",
    evidence: "Emerging (Strong)",
    description: "Focus on accepting stuttering as part of your experience while committing to valued actions. Reduces struggle and avoidance.",
    howTo: "Practice mindful awareness of stuttering without judgment. Define what matters to you in communication. Take valued action despite discomfort.",
    bestFor: "Reducing shame, increasing authentic communication",
  },
];

const evidenceColors: Record<string, string> = {
  Strong: "bg-green-500/10 text-green-600",
  Moderate: "bg-yellow-500/10 text-yellow-700",
  "Emerging (Strong)": "bg-blue-500/10 text-blue-600",
};

export default function TechniquesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <NotebookPen className="h-6 w-6 text-primary" />
          Technique Reference
        </h1>
        <p className="text-muted-foreground mt-1">
          Evidence-based techniques for managing stuttering. Learn when and how to use each one.
        </p>
      </div>

      <div className="space-y-4">
        {techniques.map((technique) => (
          <Card key={technique.title}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                  <technique.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{technique.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {technique.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${evidenceColors[technique.evidence]}`}
                    >
                      Evidence: {technique.evidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {technique.description}
                  </p>
                  <div className="mt-3 p-3 rounded-lg bg-muted/30">
                    <p className="text-xs font-medium mb-1">How to practice:</p>
                    <p className="text-xs text-muted-foreground">{technique.howTo}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Best for:</span> {technique.bestFor}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
