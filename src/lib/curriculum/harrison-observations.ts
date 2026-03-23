/**
 * Harrison's Thirteen Observations about People Who Stutter
 *
 * Based on John Harrison's work on the Stuttering Hexagon —
 * stuttering as a system of behaviors, emotions, perceptions,
 * beliefs, intentions, and physiology, not just a speech problem.
 *
 * These observations inform:
 * - Daily reflection prompts (journal tasks)
 * - AI coaching debrief context
 * - CBT thought record connections
 * - Mindfulness check-in themes
 */

export interface HarrisonObservation {
  id: number;
  /** Core observation */
  observation: string;
  /** Reflection prompt for journal/mindfulness tasks */
  reflectionPrompt: string;
  /** Short label for UI */
  label: string;
  /** Which phases this observation is most relevant to */
  phases: number[];
  /** Connected CBT thinking trap, if any */
  cbtConnection?: string;
}

export const HARRISON_OBSERVATIONS: HarrisonObservation[] = [
  {
    id: 1,
    observation:
      "We have difficulty letting go, not just in our speech, but across the board — in what we feel and in what we're willing to risk.",
    reflectionPrompt:
      "Was there a moment today where you held back — not just in speech, but in expressing a feeling or taking a risk? What would letting go have looked like?",
    label: "Letting Go",
    phases: [3, 4, 5],
    cbtConnection: "All-or-nothing thinking — believing you must control everything or it all falls apart.",
  },
  {
    id: 2,
    observation:
      "We are not grounded. We don't have a strong sense of who we are, because we are overly concerned with other people's opinion of us.",
    reflectionPrompt:
      "Did you make a decision today based on what you wanted — or on what you thought someone else expected? How did that feel?",
    label: "Being Grounded",
    phases: [3, 4, 5],
    cbtConnection: "Mind reading — assuming you know what others think about you.",
  },
  {
    id: 3,
    observation:
      "Because we are obsessively focused on pleasing others, we constantly worry about what people think of our behavior, our thoughts, our beliefs — everything concerning our personal identity and self-worth.",
    reflectionPrompt:
      "Think of a conversation today. Were you focused on your message, or on how you were being perceived? What shifts when you focus on the message instead?",
    label: "People-Pleasing",
    phases: [3, 4, 5],
    cbtConnection: "Personalization — taking responsibility for others' reactions.",
  },
  {
    id: 4,
    observation:
      "We have a narrow self-image. It does not encompass all of who we are. And we constantly try to squeeze ourselves into this narrow self-image.",
    reflectionPrompt:
      "List three things about yourself that have nothing to do with how you speak. How does it feel to define yourself beyond your speech?",
    label: "Expanding Self-Image",
    phases: [3, 4, 5],
    cbtConnection: "Labeling — reducing your entire identity to one characteristic.",
  },
  {
    id: 5,
    observation:
      "We lack self-assertiveness. We see every self-assertive act as an aggressive act, and this helps to create a stressful world.",
    reflectionPrompt:
      "Was there a moment today where you wanted to speak up but didn't? What would assertive (not aggressive) look like in that situation?",
    label: "Self-Assertiveness",
    phases: [3, 4, 5],
    cbtConnection: "Catastrophizing — believing that speaking up will lead to terrible consequences.",
  },
  {
    id: 6,
    observation:
      "We have a great deal of misinformation about what constitutes acceptable speaking behavior. When we speak with aliveness in our voice, we see ourselves as coming off too strong, too overpowering.",
    reflectionPrompt:
      "Record yourself speaking with energy about something you love. Listen back. Does it really sound 'too much' — or does it sound alive?",
    label: "Speaking with Aliveness",
    phases: [3, 4, 5],
    cbtConnection: "Emotional reasoning — feeling like you're too much, so believing it must be true.",
  },
  {
    id: 7,
    observation:
      "Hand-in-hand with our fear of looking too powerful, we see ourselves as powerless. As victims. As helpless.",
    reflectionPrompt:
      "Name one thing you did today that took courage — even something small. You chose to act. That's power, not helplessness.",
    label: "Reclaiming Power",
    phases: [3, 4, 5],
    cbtConnection: "Discounting the positive — ignoring evidence of your own agency and strength.",
  },
  {
    id: 8,
    observation:
      "We see life as a performance. This is related to our need to please others.",
    reflectionPrompt:
      "In your last conversation, were you communicating or performing? What would it feel like to just talk — without an audience in your head?",
    label: "Communicating vs. Performing",
    phases: [3, 4, 5],
    cbtConnection: "Should statements — 'I should sound fluent' turns every conversation into a test.",
  },
  {
    id: 9,
    observation:
      "Because we see life as a performance, we are afraid to make mistakes because of how we might be judged.",
    reflectionPrompt:
      "What's the worst that actually happened the last time you stuttered in front of someone? Compare that to what you feared would happen.",
    label: "Fear of Mistakes",
    phases: [3, 4, 5],
    cbtConnection: "Fortune telling — predicting negative outcomes that rarely materialize.",
  },
  {
    id: 10,
    observation:
      "Because we're afraid to make mistakes, we're afraid of responsibility and making decisions.",
    reflectionPrompt:
      "Did you avoid making a decision today to avoid speaking up? What would it look like to decide quickly and trust yourself?",
    label: "Decision-Making",
    phases: [4, 5],
    cbtConnection: "Catastrophizing — believing a wrong decision will lead to catastrophe.",
  },
  {
    id: 11,
    observation:
      "Because we've run from ourselves, we have little self-knowledge. Consequently, we tend to obsess on what is visible — our imperfect speech — and blame all our problems on it.",
    reflectionPrompt:
      "If your stutter disappeared tomorrow, what problems would still be there? What does that tell you about the real sources of stress in your life?",
    label: "Beyond Speech",
    phases: [3, 4, 5],
    cbtConnection: "Magnification — blowing up one aspect of life until it blocks everything else.",
  },
  {
    id: 12,
    observation:
      "Because of everything previously mentioned, we see ourselves as basically different from other human beings.",
    reflectionPrompt:
      "Think of someone you admire who has a visible imperfection or challenge. Does it make them less human — or more? Apply that same compassion to yourself.",
    label: "Common Humanity",
    phases: [3, 4, 5],
    cbtConnection: "Overgeneralization — 'I stutter, therefore I am fundamentally different from everyone.'",
  },
  {
    id: 13,
    observation:
      "Thus, it is not surprising that we've had few, if any, positive speaking experiences.",
    reflectionPrompt:
      "Recall one positive speaking moment — any time you connected with someone through your words. Hold onto that. It's proof that good moments exist.",
    label: "Positive Speaking Memories",
    phases: [3, 4, 5],
    cbtConnection: "Mental filter — only remembering the bad moments and filtering out the good ones.",
  },
];

/**
 * Get a Harrison observation appropriate for a given day and phase.
 * Cycles through observations relevant to the current phase.
 */
export function getHarrisonReflection(
  day: number,
  phase: number
): HarrisonObservation | null {
  const relevant = HARRISON_OBSERVATIONS.filter((o) =>
    o.phases.includes(phase)
  );
  if (relevant.length === 0) return null;
  return relevant[(day - 1) % relevant.length];
}

/**
 * Get a Harrison-informed coaching insight for AI conversation debriefs.
 * Returns a short insight the AI can weave into post-conversation feedback.
 */
export function getHarrisonCoachingInsight(day: number, phase: number): string {
  const observation = getHarrisonReflection(day, phase);
  if (!observation) return "";
  return observation.reflectionPrompt;
}

/**
 * Harrison-inspired affirmations that address the deeper psychological patterns.
 */
export const HARRISON_AFFIRMATIONS = [
  "I can let go — in my speech and in my life. Control isn't safety; it's a cage.",
  "I am grounded in who I am. Other people's opinions don't define my worth.",
  "I speak to communicate, not to perform. There is no audience — just a conversation.",
  "My self-image is bigger than my stutter. I am many things, and speech is just one of them.",
  "Speaking up is not aggression. My voice, my needs, and my ideas deserve space.",
  "When I speak with energy and aliveness, that's not 'too much' — that's me being real.",
  "I am not helpless. Every time I choose to speak, I exercise my power.",
  "Making mistakes while speaking doesn't make me a failure — it makes me human.",
  "I don't need permission to decide, to lead, or to speak first.",
  "My stutter is not the cause of all my problems. I can stop giving it that power.",
  "I am not fundamentally different from other people. Everyone struggles. Everyone has a voice.",
  "I have had positive speaking moments. I will have more. They are not accidents — they are proof.",
];
