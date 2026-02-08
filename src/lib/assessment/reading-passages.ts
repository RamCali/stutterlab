/**
 * Standardized reading passages for clinical %SS assessment.
 *
 * These passages are widely used in speech-language pathology for
 * consistent stuttering measurement across sessions.
 */

export interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  syllableCount: number;
  estimatedDurationSeconds: number;
  difficulty: "easy" | "moderate" | "challenging";
  description: string;
}

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: "rainbow",
    title: "The Rainbow Passage",
    text: `When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.`,
    syllableCount: 127,
    estimatedDurationSeconds: 60,
    difficulty: "moderate",
    description:
      "The most widely used standardized passage in speech-language pathology. Contains a good mix of phonemes and sentence structures.",
  },
  {
    id: "grandfather",
    title: "The Grandfather Passage",
    text: `You wished to know all about my grandfather. Well, he is nearly ninety-three years old. He dresses himself in an old black frock coat, usually with several buttons missing. A long beard clings to his chin, giving those who observe him a pronounced feeling of the utmost respect. When he speaks, his voice is just a bit cracked and quivers a bit. Twice each day he plays skillfully and with zest upon a small organ. Except in the winter when the snow or ice prevents, he slowly takes a short walk in the open air each day. We have often urged him to walk more and smoke less, but he always answers, "Banana oil!" Grandfather likes to be modern in his language.`,
    syllableCount: 160,
    estimatedDurationSeconds: 75,
    difficulty: "moderate",
    description:
      "A classic passage used for speech assessment. Contains varied sentence lengths and natural conversational rhythms.",
  },
  {
    id: "caterpillar",
    title: "The Caterpillar Passage",
    text: `Do you like amusement parks? Well, I sure do. To amuse myself, I went twice last spring. My most memorable moment was riding on the caterpillar, which is a gigantic roller coaster high above the ground. When I saw how high the caterpillar went, I knew it was for me. After waiting in line for thirty minutes, I made it to the front where the man strapped me in with a seat belt and a harness. I knew from that moment on, I was going to be okay.`,
    syllableCount: 112,
    estimatedDurationSeconds: 50,
    difficulty: "easy",
    description:
      "An accessible passage with shorter sentences. Good for initial assessments or users with more severe stuttering.",
  },
];

export function getPassage(id: string): ReadingPassage | undefined {
  return READING_PASSAGES.find((p) => p.id === id);
}
