export interface QuickCalmTechnique {
  id: string;
  name: string;
  steps: string[];
}

export const QUICK_CALM_TECHNIQUES: QuickCalmTechnique[] = [
  {
    id: "box_breathing",
    name: "Box Breathing",
    steps: [
      "Inhale 4 seconds through your nose",
      "Hold 4 seconds",
      "Exhale 4 seconds",
      "Hold 4 seconds — repeat",
    ],
  },
  {
    id: "gentle_onset",
    name: "Gentle Onset",
    steps: [
      "Slow breath in through your nose",
      "Start with a soft \"h\" sound",
      "Let the word flow out gently",
    ],
  },
  {
    id: "light_contact",
    name: "Light Contact",
    steps: [
      "Touch your lips lightly for the first sound",
      "Reduce pressure — don't push through",
      "Keep airflow continuous",
    ],
  },
  {
    id: "cancellation",
    name: "Cancellation",
    steps: [
      "Finish the block without tension",
      "Pause briefly",
      "Say the word again with easy onset",
    ],
  },
  {
    id: "pull_out",
    name: "Pull-Out",
    steps: [
      "Notice tension building mid-word",
      "Ease off pressure while finishing the word",
      "Continue speaking softly",
    ],
  },
  {
    id: "voluntary_stutter",
    name: "Voluntary Stutter",
    steps: [
      "Stutter on purpose once, lightly",
      "This reduces fear of the block",
      "Then continue with gentle onset",
    ],
  },
];
