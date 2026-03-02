/**
 * Curated success stories from the stuttering community.
 * These are real stories shared publicly (e.g., Reddit r/Stutter)
 * that demonstrate exposure, cognitive restructuring, and persistence.
 */

export interface SuccessStory {
  id: string;
  /** Display name (anonymized for privacy) */
  name: string;
  title: string;
  /** Where the story was originally shared */
  source: string;
  /** The full story or key excerpt */
  quote: string;
  /** One-line takeaway */
  keyTakeaway: string;
  /** Exposure ladder rungs this story relates to (1-10) */
  relevantExposureRungs: number[];
  /** Searchable tags */
  tags: string[];
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "stutter-to-pilot",
    name: "A fellow stutterer",
    title: "From Stutter to Commercial Pilot",
    source: "r/Stutter community",
    quote:
      "I just passed my Commercial Pilot certification, and honestly, it still feels surreal. I\u2019ve been a lifelong stutterer, and it\u2019s something I\u2019ve battled for as long as I can remember. There were moments growing up when I questioned whether aviation was even realistic for me, especially in a field where communication is everything. Over time, though, I learned something important \u2014 the fear of stuttering is a mile wide and an inch deep. The anticipation is always worse than the moment itself. Aviation has always been my passion, and I decided I wasn\u2019t going to let fear dictate my future. I worked through the uncomfortable radio calls, pushed through the blocks, and kept showing up. Little by little, confidence replaced fear. If you\u2019re hesitating to chase your passion because of a stutter, don\u2019t. Your voice is not your limitation. The fear feels big, but it shrinks every time you lean into it.",
    keyTakeaway:
      "The fear of stuttering is a mile wide and an inch deep. It shrinks every time you lean into it.",
    relevantExposureRungs: [7, 10],
    tags: ["career", "phone-calls", "radio", "aviation", "fear", "exposure"],
  },
];

export function getStoryById(id: string): SuccessStory | undefined {
  return SUCCESS_STORIES.find((s) => s.id === id);
}

export function getStoriesForRung(level: number): SuccessStory[] {
  return SUCCESS_STORIES.filter((s) => s.relevantExposureRungs.includes(level));
}
