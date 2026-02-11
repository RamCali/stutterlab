import {
  BookOpen,
  Wind,
  Hand,
  Timer,
  Pause,
  Undo2,
  ArrowUpRight,
  Shield,
  Zap,
  Mic2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CoachingConfig, TechniqueType } from "@/lib/audio/SpeechCoach";

export interface CoachingTip {
  /** What "doing it right" looks like */
  doThis: string;
  /** Common mistake to avoid */
  notThis: string;
}

export interface FeedbackRubric {
  /** What to check after each practice item */
  checkpoints: string[];
  /** What success sounds/feels like */
  successSignal: string;
}

export interface ExerciseDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  isPremium: boolean;
  /** Maps to internal technique ID from daily-session.ts */
  techniqueId: string | null;
  /** Step-by-step instructions shown on the detail page */
  instructions: string[];
  /** Coaching config for LiveCoachOverlay */
  coachConfig?: Partial<CoachingConfig>;
  /** Exercise-specific practice items (overrides default readingContent) */
  practiceItems?: Record<string, string[]>;
  /** Coaching layer: do/don't tips for the technique */
  coachingTips?: CoachingTip[];
  /** Coaching layer: post-practice self-check rubric */
  feedbackRubric?: FeedbackRubric;
}

export const exercises: ExerciseDefinition[] = [
  {
    id: "reading",
    title: "Reading Aloud",
    description:
      "Practice fluency by reading words, phrases, sentences, and paragraphs at your own pace.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    difficulty: "Beginner",
    duration: "5-15 min",
    isPremium: false,
    techniqueId: null,
    instructions: [
      "Choose a content level that feels comfortable.",
      "Tap the mic button to start recording.",
      "Read each item aloud at a natural, comfortable pace.",
      "Focus on smooth airflow — don't rush.",
      "Tap stop when finished, then move to the next item.",
    ],
    practiceItems: {
      words: [
        "hello", "morning", "water", "today", "happy",
        "beautiful", "sunshine", "together", "wonderful", "practice",
        "breathing", "gentle", "slowly", "natural", "progress",
      ],
      phrases: [
        "Good morning",
        "How are you today",
        "I would like to order",
        "My name is",
        "Thank you very much",
        "Nice to meet you",
        "Can I help you",
        "I'm doing well",
      ],
      sentences: [
        "I am practicing my speech techniques today.",
        "The weather is beautiful this morning.",
        "Could you please help me find the right section?",
        "I'd like to schedule an appointment for next week.",
        "Thank you for your patience and understanding.",
        "I'm working on improving my fluency every day.",
      ],
      paragraphs: [
        "Speaking is a skill that improves with practice. Every time you use your techniques — gentle onset, light contact, or pacing — you build new neural pathways. The key is consistency, not perfection. Some days will feel easier than others, and that is completely normal.",
        "The ocean waves rolled gently onto the shore as the sun began to set. A cool breeze carried the scent of salt and seaweed. Children played near the water's edge while their parents watched from colorful beach chairs. It was the perfect end to a long summer day.",
      ],
    },
  },
  {
    id: "gentle-onset",
    title: "Gentle Onset",
    description:
      "Start words with a soft, easy airflow. Reduces blocks on initial sounds.",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    difficulty: "Beginner",
    duration: "5 min",
    isPremium: false,
    techniqueId: "easy_onset",
    instructions: [
      "Take a relaxed breath before each word.",
      "Begin with a soft, breathy airflow — like a gentle sigh.",
      "Let the air flow BEFORE adding voice.",
      "The first sound should feel effortless, almost whispered.",
      "Record yourself and listen — the start should sound smooth.",
    ],
    coachConfig: {
      activeTechniques: ["gentle_onset", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 100, max: 160 },
    },
    coachingTips: [
      { doThis: "Start with a soft sigh of air before adding voice", notThis: "Starting with a hard, sudden vocal attack" },
      { doThis: "Feel a gentle stream of air on your hand before the word", notThis: "Holding your breath and then forcing the word out" },
      { doThis: "The first syllable should sound slightly breathy", notThis: "Whispering the whole word — only the onset is soft" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did air flow before voice started?",
        "Was the first sound relaxed, not forced?",
        "Did you maintain smooth airflow into the rest of the word?",
      ],
      successSignal: "The word begins softly, almost like a sigh, then transitions smoothly to normal volume.",
    },
  },
  {
    id: "light-contact",
    title: "Light Articulatory Contact",
    description:
      "Use minimal tension in your lips, tongue, and jaw when forming sounds.",
    icon: Hand,
    color: "text-green-500",
    bg: "bg-green-500/10",
    difficulty: "Beginner",
    duration: "5 min",
    isPremium: false,
    techniqueId: "light_contact",
    instructions: [
      "Relax your jaw, lips, and tongue before speaking.",
      "When making consonant sounds, use the lightest touch possible.",
      "Think of your articulators as barely brushing their targets.",
      "Avoid pressing your lips tightly for /p/, /b/, /m/ sounds.",
      "Keep your tongue loose and relaxed throughout.",
    ],
    coachConfig: {
      activeTechniques: ["gentle_onset", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 120, max: 180 },
    },
    coachingTips: [
      { doThis: "Barely touch your tongue to the roof of your mouth for /t/, /d/, /n/", notThis: "Pressing hard or creating tension in your tongue" },
      { doThis: "Let your lips loosely touch for /p/, /b/, /m/ sounds", notThis: "Pressing lips tightly together before releasing" },
      { doThis: "Keep your jaw relaxed and slightly open throughout", notThis: "Clenching your jaw between words" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did your consonants feel light, not forceful?",
        "Was your jaw relaxed throughout?",
        "Could you feel minimal contact at articulation points?",
      ],
      successSignal: "Consonants sound clear but effortless — like your mouth is barely working to make them.",
    },
  },
  {
    id: "prolonged-speech",
    title: "Prolonged Speech",
    description:
      "Stretch vowels and blend words together for smoother, more continuous speech.",
    icon: Timer,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    difficulty: "Intermediate",
    duration: "10 min",
    isPremium: true,
    techniqueId: "prolonged_speech",
    instructions: [
      "Stretch each vowel sound slightly longer than normal.",
      "Blend words together — don't stop between them.",
      "Aim for smooth, continuous airflow throughout each phrase.",
      "It should feel like singing in slow motion.",
      "Gradually speed up as you get comfortable.",
    ],
    coachConfig: {
      activeTechniques: ["prolonged_speech", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 80, max: 140 },
    },
    coachingTips: [
      { doThis: "Stretch vowels naturally — like singing in slow motion", notThis: "Stretching consonants or making robotic sounds" },
      { doThis: "Blend words together so speech flows continuously", notThis: "Stopping between each word with a gap" },
      { doThis: "Gradually speed up as you get comfortable", notThis: "Staying at the slowest speed forever — the goal is natural pace" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did your vowels sound elongated but natural?",
        "Did words blend smoothly without gaps?",
        "Was your pace slow but not robotic?",
      ],
      successSignal: "Speech sounds like a smooth, flowing stream — slow but connected, with stretched vowels carrying the rhythm.",
    },
  },
  {
    id: "pausing",
    title: "Pausing Strategy",
    description:
      "Practice natural pauses between phrases. Reduces time pressure and improves pacing.",
    icon: Pause,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    difficulty: "Beginner",
    duration: "5 min",
    isPremium: false,
    techniqueId: "pausing",
    instructions: [
      "Break each sentence into short phrase groups (2-4 words).",
      "Pause naturally between phrases — take a breath.",
      "Don't rush to fill the silence; pauses are powerful.",
      "Use the pause to plan your next phrase.",
      "Aim for a relaxed, conversational rhythm.",
    ],
    coachConfig: {
      activeTechniques: ["pacing", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 120, max: 180 },
    },
    coachingTips: [
      { doThis: "Pause at natural phrase boundaries (commas, breath points)", notThis: "Pausing randomly in the middle of a phrase" },
      { doThis: "Use the pause to take a quick diaphragmatic breath", notThis: "Holding your breath during the pause" },
      { doThis: "Keep pauses short and natural (0.5-1 second)", notThis: "Making pauses so long they feel awkward" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did you pause at natural phrase boundaries?",
        "Did you breathe during pauses?",
        "Did your speech sound conversational, not choppy?",
      ],
      successSignal: "Speech sounds like a confident speaker who pauses deliberately — not rushed, not hesitant.",
    },
  },
  {
    id: "cancellation",
    title: "Cancellation",
    description:
      "After a stutter, pause, then say the word again with modification. Builds control.",
    icon: Undo2,
    color: "text-red-500",
    bg: "bg-red-500/10",
    difficulty: "Intermediate",
    duration: "10 min",
    isPremium: true,
    techniqueId: "cancellation",
    instructions: [
      "Read the word or phrase aloud.",
      "If you stutter, STOP completely. Don't push through.",
      "Pause for 2-3 seconds. Breathe. Relax your articulators.",
      "Analyze what happened — where was the tension?",
      "Say the word again using gentle onset or light contact.",
    ],
    coachConfig: {
      activeTechniques: ["cancellation", "gentle_onset"] as TechniqueType[],
      targetSPM: { min: 100, max: 160 },
    },
    coachingTips: [
      { doThis: "Pause completely after a stutter — full stop, 2-3 seconds", notThis: "Pushing through the stutter without stopping" },
      { doThis: "During the pause, consciously relax your articulators", notThis: "Just waiting tensely without actually releasing tension" },
      { doThis: "Re-attempt the word with gentle onset or light contact", notThis: "Repeating the word the exact same way you stuttered on it" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did you fully stop after the stutter?",
        "Did you consciously relax before re-attempting?",
        "Was the second attempt smoother than the first?",
      ],
      successSignal: "You stutter, pause with purpose, then produce the word smoothly — showing control over the moment.",
    },
  },
  {
    id: "pull-out",
    title: "Pull-Out",
    description:
      "Modify a stutter mid-moment by easing out of the block and finishing the word smoothly.",
    icon: ArrowUpRight,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    difficulty: "Advanced",
    duration: "10 min",
    isPremium: true,
    techniqueId: "pull_out",
    instructions: [
      "Begin reading aloud. When you feel a stutter starting, DON'T stop.",
      "Instead, slow down mid-stutter. Feel the tension.",
      "Consciously ease the tension — relax your jaw, soften your lips.",
      "Slowly slide out of the block into the rest of the word.",
      "Finish the word smoothly, then continue speaking.",
    ],
    coachConfig: {
      activeTechniques: ["pull_out", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 100, max: 160 },
    },
    coachingTips: [
      { doThis: "When you feel a block, slow down instead of stopping", notThis: "Stopping completely — that's cancellation, not pull-out" },
      { doThis: "Consciously release tension mid-stutter (relax jaw, soften lips)", notThis: "Adding more force to push through the block" },
      { doThis: "Slide out of the block into the rest of the word", notThis: "Restarting the word from the beginning" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did you slow down during the block instead of stopping?",
        "Did you release tension while still in the stutter?",
        "Did you finish the word smoothly after easing out?",
      ],
      successSignal: "Mid-stutter, you visibly relax and the word emerges smoothly — like untangling a knot in real-time.",
    },
  },
  {
    id: "preparatory-set",
    title: "Preparatory Set",
    description:
      "Pre-plan your articulatory position before saying a difficult word.",
    icon: Shield,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    difficulty: "Advanced",
    duration: "10 min",
    isPremium: true,
    techniqueId: "preparatory_set",
    instructions: [
      "Look at the word before you say it. Identify the first sound.",
      "Pre-position your articulators (lips, tongue, jaw) LIGHTLY.",
      "Take a relaxed breath.",
      "Begin with gentle onset — soft airflow first, then voice.",
      "Continue into the word smoothly without excess tension.",
    ],
    coachConfig: {
      activeTechniques: ["gentle_onset", "rate_compliance"] as TechniqueType[],
      targetSPM: { min: 100, max: 160 },
    },
    coachingTips: [
      { doThis: "Visualize the mouth position for the first sound before speaking", notThis: "Overthinking it — just a quick mental image is enough" },
      { doThis: "Position your articulators lightly, not tightly", notThis: "Clenching or pressing hard in the preparatory position" },
      { doThis: "Flow directly from the set position into the word with gentle onset", notThis: "Holding the preparatory position too long — it should be brief" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Did you mentally prepare the first sound before starting?",
        "Was your preparatory position light, not tense?",
        "Did you transition smoothly from set to speech?",
      ],
      successSignal: "A brief moment of preparation, then the word flows out smoothly — like a swimmer preparing to dive.",
    },
  },
  {
    id: "voluntary-stuttering",
    title: "Voluntary Stuttering",
    description:
      "Intentionally stutter on easy words to reduce fear and build desensitization.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    difficulty: "Intermediate",
    duration: "10 min",
    isPremium: true,
    techniqueId: "voluntary_stuttering",
    instructions: [
      "Choose easy words that you normally say fluently.",
      "Intentionally repeat the first sound or syllable (e.g., 'b-b-beautiful').",
      "Keep it EASY — no tension, no struggle. This should feel gentle.",
      "The goal is to stutter ON PURPOSE to reduce fear of stuttering.",
      "Practice until it feels boring, not scary.",
    ],
    coachingTips: [
      { doThis: "Choose easy words you're already fluent on", notThis: "Choosing words you actually fear — start with safe words first" },
      { doThis: "Keep the stutter easy, bouncy, and relaxed (b-b-beautiful)", notThis: "Making the voluntary stutter tense or forced" },
      { doThis: "Practice until voluntary stuttering feels boring, not scary", notThis: "Stopping as soon as it feels uncomfortable — lean into it" },
    ],
    feedbackRubric: {
      checkpoints: [
        "Was your voluntary stutter relaxed and easy?",
        "Did you stutter on words you're normally fluent on?",
        "Did the fear/tension decrease over repetitions?",
      ],
      successSignal: "Voluntary stuttering feels like a deliberate choice, not a loss of control — it's boring, not scary.",
    },
    practiceItems: {
      words: [
        "beautiful", "together", "wonderful", "Saturday", "telephone",
        "remember", "adventure", "celebrate", "important", "different",
      ],
      phrases: [
        "It's a beautiful day",
        "Let me think about it",
        "That sounds wonderful",
        "I remember when",
        "Would you like to come along",
        "That's really interesting",
        "I appreciate your help",
        "Let's get together soon",
      ],
    },
  },
  {
    id: "tongue-twisters",
    title: "Tongue Twisters",
    description:
      "Challenge your articulation with graded tongue twisters. Fun and effective practice.",
    icon: Mic2,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    difficulty: "Intermediate",
    duration: "5 min",
    isPremium: false,
    techniqueId: null,
    instructions: [
      "Start slowly — speed is NOT the goal.",
      "Focus on clear, precise articulation of each sound.",
      "Use light contact and gentle onset throughout.",
      "Repeat each tongue twister 3 times, getting smoother each time.",
      "If you trip up, slow down and try again. Have fun with it!",
    ],
    practiceItems: {
      easy: [
        "Red lorry, yellow lorry",
        "She sells seashells by the seashore",
        "How much wood would a woodchuck chuck",
        "Peter Piper picked a peck of pickled peppers",
        "I scream, you scream, we all scream for ice cream",
      ],
      medium: [
        "The thirty-three thieves thought that they thrilled the throne throughout Thursday",
        "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn't very fuzzy, was he?",
        "I saw a kitten eating chicken in the kitchen",
        "A proper copper coffee pot brews proper coffee",
        "Six slippery snails slid slowly seaward",
      ],
      hard: [
        "The sixth sick sheik's sixth sheep's sick",
        "Pad kid poured curd pulled cod",
        "Brisk brave brigadiers brandished broad bright blades",
        "If a dog chews shoes, whose shoes does he choose?",
        "How can a clam cram in a clean cream can?",
      ],
    },
  },
];

export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return exercises.find((ex) => ex.id === id);
}
