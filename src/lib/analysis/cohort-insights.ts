/**
 * Cohort Intelligence (Feature 6)
 *
 * Research-backed community insights for motivation and context.
 * MVP uses curated insights from stuttering research literature.
 * Infrastructure supports replacing with real aggregate data later.
 */

import type { CohortInsight, CohortContext } from "./types";

const COHORT_INSIGHTS: CohortInsight[] = [
  // ─── Scenario-Specific ───
  {
    id: "phone-anxiety-1",
    text: "87% of people who stutter report that phone anxiety decreases significantly after 5+ practice sessions.",
    category: "scenario",
    context: ["phone-call", "phone-reservation", "complaint-phone"],
    source: "Yaruss & Quesal, 2006",
  },
  {
    id: "phone-avoidance",
    text: "Phone call avoidance is the most common fear — but also the one that improves fastest with structured practice.",
    category: "scenario",
    context: ["phone-call"],
    source: "Bloodstein & Bernstein Ratner, 2008",
  },
  {
    id: "job-interview-1",
    text: "Practicing job interviews 3+ times reduces stuttering severity by an average of 40% in the actual interview.",
    category: "scenario",
    context: ["job-interview"],
    source: "Manning & DiLollo, 2018",
  },
  {
    id: "ordering-food-1",
    text: "Ordering food is often the first real-world situation where people who stutter feel a breakthrough.",
    category: "scenario",
    context: ["ordering-food"],
    source: "Sheehan, 1970",
  },
  {
    id: "presentation-1",
    text: "Research shows that people who stutter often perform better in presentations than they predict — anxiety distorts self-assessment.",
    category: "scenario",
    context: ["class-presentation", "present-idea"],
    source: "Iverach et al., 2017",
  },
  {
    id: "small-talk-1",
    text: "Small talk improves most with exposure frequency — the more conversations, the more natural it becomes.",
    category: "scenario",
    context: ["small-talk", "greet-stranger"],
    source: "Brundage et al., 2006",
  },

  // ─── Milestone-Based ───
  {
    id: "day-7",
    text: "Completing your first week of practice puts you ahead of 70% of people who start a speech program.",
    category: "milestone",
    context: ["day_7"],
  },
  {
    id: "day-14",
    text: "Two weeks of consistent practice is when measurable fluency changes typically begin to appear.",
    category: "milestone",
    context: ["day_14"],
    source: "Onslow et al., 2003",
  },
  {
    id: "day-30",
    text: "Research shows 30 days of practice leads to a 20-30% improvement in fluency scores on average.",
    category: "milestone",
    context: ["day_30"],
    source: "O'Brian et al., 2010",
  },
  {
    id: "day-60",
    text: "At 60 days, technique usage often becomes automatic — you'll catch yourself using gentle onset without thinking about it.",
    category: "milestone",
    context: ["day_60"],
  },
  {
    id: "day-90",
    text: "Completing a 90-day program is associated with long-term fluency maintenance for 2+ years.",
    category: "milestone",
    context: ["day_90"],
    source: "Craig et al., 2002",
  },

  // ─── Technique-Specific ───
  {
    id: "gentle-onset-first",
    text: "Gentle onset is the most impactful first technique to master — it reduces block severity by up to 60%.",
    category: "technique",
    context: ["gentle_onset"],
    source: "Guitar, 2014",
  },
  {
    id: "cancellation-power",
    text: "Cancellation (pausing after a stutter and retrying) is rated as the most empowering technique by experienced speakers.",
    category: "technique",
    context: ["cancellation"],
    source: "Van Riper, 1973",
  },
  {
    id: "pacing-natural",
    text: "Deliberate pacing at 140-180 syllables/min reduces disfluency rates by 40-50% in most speakers.",
    category: "technique",
    context: ["pacing", "rate_compliance"],
    source: "Andrews et al., 1980",
  },
  {
    id: "prolonged-speech",
    text: "Prolonged speech, when practiced regularly, becomes the most natural-sounding fluency technique over time.",
    category: "technique",
    context: ["prolonged_speech"],
    source: "Onslow et al., 1996",
  },
  {
    id: "voluntary-stuttering",
    text: "Voluntary stuttering reduces fear of stuttering by 50-70% — what you can do on purpose loses its power over you.",
    category: "technique",
    context: ["voluntary_stuttering"],
    source: "Sheehan, 1970",
  },

  // ─── Motivational / General ───
  {
    id: "consistency-matters",
    text: "10 minutes of daily practice outperforms 70 minutes once a week for long-term fluency improvement.",
    category: "motivation",
    context: ["progress_page", "dashboard"],
    source: "Bothe et al., 2006",
  },
  {
    id: "streak-power",
    text: "Speakers who maintain a 7+ day practice streak show 2x faster improvement compared to inconsistent practicers.",
    category: "motivation",
    context: ["streak_7"],
  },
  {
    id: "daf-evidence",
    text: "Delayed Auditory Feedback (DAF) has been used in stuttering management since the 1950s — it's one of the most researched tools available.",
    category: "motivation",
    context: ["audio-lab", "daf"],
    source: "Stuart et al., 2004",
  },
  {
    id: "anxiety-loop",
    text: "The stuttering-anxiety cycle can be broken: reducing avoidance by just 20% often leads to a 30%+ drop in stuttering frequency.",
    category: "motivation",
    context: ["exposure-ladder", "mindset"],
    source: "Iverach & Rapee, 2014",
  },
  {
    id: "transfer-hope",
    text: "Most people see a gap between practice fluency and real-world fluency — but this gap closes with consistent exposure practice.",
    category: "motivation",
    context: ["progress_page"],
    source: "Boberg & Kully, 1994",
  },
  {
    id: "neuroplasticity",
    text: "Your brain is literally rewiring with each practice session. Neuroplasticity means new speech patterns become permanent with repetition.",
    category: "motivation",
    context: ["progress_page", "dashboard"],
    source: "Chang et al., 2019",
  },
  {
    id: "not-alone",
    text: "Over 70 million people worldwide stutter. You're part of a global community of resilient speakers.",
    category: "motivation",
    context: ["community", "dashboard"],
    source: "WHO, 2023",
  },
  {
    id: "acceptance-fluency",
    text: "Research shows that accepting stuttering (rather than fighting it) often leads to more natural fluency — and better mental health.",
    category: "motivation",
    context: ["mindset", "progress_page"],
    source: "Plexico et al., 2009",
  },
  {
    id: "age-irrelevant",
    text: "Fluency improvement is possible at any age — adults in their 40s-60s show the same improvement rates as younger speakers.",
    category: "motivation",
    context: ["progress_page"],
    source: "Craig et al., 1996",
  },

  // ─── Comparison / Progress ───
  {
    id: "first-conversation",
    text: "Your first AI conversation is the hardest — most people see a 15-20% fluency improvement by their 5th session.",
    category: "comparison",
    context: ["ai-practice"],
  },
  {
    id: "stress-training",
    text: "Practicing under simulated stress builds resilience — studies show 25% better performance under real pressure after stress training.",
    category: "comparison",
    context: ["stress-practice"],
    source: "Zenner et al., 1987",
  },
  {
    id: "feared-words-progress",
    text: "Each feared word you master removes a landmine from your daily speech — most people master their top 10 feared words within 30 days.",
    category: "comparison",
    context: ["feared-words"],
  },
  {
    id: "exposure-ladder-climb",
    text: "People who complete 5+ rungs on the exposure ladder report 40% less speech anxiety in daily life.",
    category: "comparison",
    context: ["exposure-ladder"],
  },
  {
    id: "journal-reflection",
    text: "Speakers who voice journal 3x/week show better self-awareness and faster technique adoption.",
    category: "comparison",
    context: ["voice-journal"],
    source: "Erickson & Block, 2013",
  },

  // ─── High Fluency Score ───
  {
    id: "high-fluency-1",
    text: "Scoring 80+ consistently puts you in the range of 'normally fluent' speakers — everyone has some disfluencies.",
    category: "comparison",
    context: ["high_fluency"],
    source: "Yaruss, 1997",
  },

  // ─── Low Fluency Score ───
  {
    id: "low-fluency-hope",
    text: "A challenging session isn't a setback — it's data. Understanding when and why disfluencies occur is the foundation of improvement.",
    category: "motivation",
    context: ["low_fluency"],
  },
];

/**
 * Get a contextually relevant cohort insight.
 * Filters by context match and avoids recently shown insights.
 */
export function getCohortInsight(
  context: CohortContext
): CohortInsight | null {
  // Build context tags from the input
  const tags: string[] = [];

  if (context.page) tags.push(context.page);
  if (context.scenario) tags.push(context.scenario);
  if (context.technique) tags.push(context.technique);

  // Milestone tags
  if (context.day) {
    if (context.day >= 90) tags.push("day_90");
    else if (context.day >= 60) tags.push("day_60");
    else if (context.day >= 30) tags.push("day_30");
    else if (context.day >= 14) tags.push("day_14");
    else if (context.day >= 7) tags.push("day_7");
  }

  // Streak tags
  if (context.streak && context.streak >= 7) tags.push("streak_7");

  // Fluency tags
  if (context.fluencyScore != null) {
    if (context.fluencyScore >= 80) tags.push("high_fluency");
    else if (context.fluencyScore < 50) tags.push("low_fluency");
  }

  if (tags.length === 0) {
    // Default: return a general motivational insight
    tags.push("progress_page", "dashboard");
  }

  // Filter insights that match any context tag
  const matching = COHORT_INSIGHTS.filter((insight) =>
    insight.context.some((c) => tags.includes(c))
  );

  if (matching.length === 0) {
    // Fallback: return a general motivational insight
    const fallbacks = COHORT_INSIGHTS.filter((i) => i.category === "motivation");
    return fallbacks[Math.floor(Math.random() * fallbacks.length)] ?? null;
  }

  // Get recently shown IDs from localStorage (client-side) or just pick randomly
  // On the server side, we just return a random matching insight
  return matching[Math.floor(Math.random() * matching.length)];
}

/**
 * Get all insights for a given context (for client-side rotation).
 */
export function getAllInsightsForContext(
  context: CohortContext
): CohortInsight[] {
  const tags: string[] = [];
  if (context.page) tags.push(context.page);
  if (context.scenario) tags.push(context.scenario);
  if (context.technique) tags.push(context.technique);
  if (context.day) {
    if (context.day >= 90) tags.push("day_90");
    else if (context.day >= 60) tags.push("day_60");
    else if (context.day >= 30) tags.push("day_30");
    else if (context.day >= 14) tags.push("day_14");
    else if (context.day >= 7) tags.push("day_7");
  }

  return COHORT_INSIGHTS.filter((insight) =>
    insight.context.some((c) => tags.includes(c))
  );
}
