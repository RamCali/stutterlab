"use server";

import { db } from "@/lib/db/client";
import { microChallengeCompletions, userStats } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";
import { ensureUserStats } from "@/lib/actions/user-progress";

/* ─── Daily Challenge Definitions ─── */

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: "phone" | "social" | "ordering" | "work" | "general";
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  icon: string;
  tips: string[];
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  // Easy
  {
    id: "order-coffee",
    title: "Order a Coffee",
    description: "Go to a coffee shop and order your drink by speaking to the barista.",
    category: "ordering",
    difficulty: "easy",
    xpReward: 50,
    icon: "☕",
    tips: ["Take a breath before ordering", "Use gentle onset on the first word", "It's okay to pause"],
  },
  {
    id: "greet-stranger",
    title: "Greet a Stranger",
    description: "Say hello or good morning to someone you pass by today.",
    category: "social",
    difficulty: "easy",
    xpReward: 40,
    icon: "👋",
    tips: ["A simple 'hi' or 'good morning' counts", "Smile — it relaxes your vocal cords"],
  },
  {
    id: "ask-directions",
    title: "Ask for Directions",
    description: "Ask someone for directions to a nearby place, even if you know the way.",
    category: "social",
    difficulty: "easy",
    xpReward: 50,
    icon: "🗺️",
    tips: ["Start with 'Excuse me...'", "Use the prolonged speech technique on the first syllable"],
  },
  {
    id: "read-aloud-5",
    title: "Read Aloud for 5 Minutes",
    description: "Read a book, article, or website out loud for 5 minutes.",
    category: "general",
    difficulty: "easy",
    xpReward: 30,
    icon: "📖",
    tips: ["Read at a comfortable pace", "Focus on smooth airflow", "Pause at commas and periods"],
  },
  {
    id: "introduce-yourself",
    title: "Introduce Yourself",
    description: "Introduce yourself to someone new today — your name, what you do.",
    category: "social",
    difficulty: "easy",
    xpReward: 50,
    icon: "🤝",
    tips: ["Practice your intro once before", "Gentle onset on your name", "Eye contact shows confidence"],
  },

  // Medium
  {
    id: "phone-call-simple",
    title: "Make a Phone Call",
    description: "Call a business to ask about their hours or a product.",
    category: "phone",
    difficulty: "medium",
    xpReward: 75,
    icon: "📞",
    tips: ["Write down what you'll say first", "Take 3 breaths before dialing", "You control the pace"],
  },
  {
    id: "order-food-restaurant",
    title: "Order at a Restaurant",
    description: "Order your meal by speaking directly to the server. No pointing at the menu!",
    category: "ordering",
    difficulty: "medium",
    xpReward: 75,
    icon: "🍽️",
    tips: ["Order what you WANT, not what's easy to say", "Pause between items", "Gentle onset technique"],
  },
  {
    id: "small-talk-coworker",
    title: "Small Talk with a Coworker",
    description: "Start a casual conversation with a coworker about their weekend or a recent event.",
    category: "work",
    difficulty: "medium",
    xpReward: 75,
    icon: "💬",
    tips: ["Ask open-ended questions", "Listen actively", "It's a conversation, not a performance"],
  },
  {
    id: "return-item",
    title: "Return or Exchange an Item",
    description: "Return or exchange something at a store. Explain the reason out loud.",
    category: "ordering",
    difficulty: "medium",
    xpReward: 80,
    icon: "🏪",
    tips: ["Plan your explanation beforehand", "You have every right to return items", "Speak at your pace"],
  },
  {
    id: "ask-question-meeting",
    title: "Ask a Question in a Meeting",
    description: "Raise your hand and ask a question during a meeting or class.",
    category: "work",
    difficulty: "medium",
    xpReward: 100,
    icon: "🙋",
    tips: ["Write your question down first", "Start with a breath", "Your question matters"],
  },

  // Hard
  {
    id: "phone-reservation",
    title: "Make a Reservation by Phone",
    description: "Call a restaurant and make a dinner reservation for yourself or friends.",
    category: "phone",
    difficulty: "hard",
    xpReward: 100,
    icon: "📱",
    tips: ["Have the date/time/party size ready", "Spell your name if needed — take your time", "This gets easier every time"],
  },
  {
    id: "present-idea",
    title: "Present an Idea at Work",
    description: "Share an idea or suggestion during a team meeting.",
    category: "work",
    difficulty: "hard",
    xpReward: 125,
    icon: "💡",
    tips: ["Outline your idea in 3 points", "Slow, controlled breathing before speaking", "Your ideas deserve to be heard"],
  },
  {
    id: "complaint-phone",
    title: "Make a Complaint by Phone",
    description: "Call a company about an issue with a product or service you received.",
    category: "phone",
    difficulty: "hard",
    xpReward: 100,
    icon: "📋",
    tips: ["Write down your main points", "Be assertive but calm", "You deserve good service"],
  },
  {
    id: "story-group",
    title: "Tell a Story to a Group",
    description: "Tell a story or anecdote to 3+ people. Could be friends, family, or colleagues.",
    category: "social",
    difficulty: "hard",
    xpReward: 125,
    icon: "🎭",
    tips: ["Pick a story you know well", "Use pauses for dramatic effect", "Eye contact with different listeners"],
  },
  {
    id: "voicemail",
    title: "Leave a Voicemail",
    description: "Call someone and intentionally leave a voicemail with your name and message.",
    category: "phone",
    difficulty: "hard",
    xpReward: 100,
    icon: "📨",
    tips: ["Plan: name, reason, callback number", "Speak slowly and clearly", "It's okay to pause"],
  },
];

/* ─── Get Daily Challenge ─── */

export async function getDailyChallengeForDay(day: number): Promise<DailyChallenge> {
  const index = (day - 1) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

export async function getTodayChallenge() {
  const user = await requireAuth();
  await ensureUserStats(user.id);

  const [stats] = await db
    .select({ currentDay: userStats.currentDay })
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  const day = stats?.currentDay ?? 1;
  const challenge = await getDailyChallengeForDay(day);

  // Check if already completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completions = await db
    .select()
    .from(microChallengeCompletions)
    .where(
      and(
        eq(microChallengeCompletions.userId, user.id),
        gte(microChallengeCompletions.completedAt, today)
      )
    );

  return {
    challenge,
    completed: completions.length > 0,
    completedToday: completions.length,
  };
}

/* ─── Complete Challenge ─── */

export async function completeDailyChallenge(challengeId: string) {
  const user = await requireAuth();
  await ensureUserStats(user.id);

  const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) throw new Error("Challenge not found");

  // Record completion
  await db.insert(microChallengeCompletions).values({
    userId: user.id,
    challengeDate: new Date().toISOString().split("T")[0],
    challengeTitle: challenge.title,
    technique: challenge.category,
    xpEarned: challenge.xpReward,
  });

  // Award XP
  await db
    .update(userStats)
    .set({
      totalXp: sql`${userStats.totalXp} + ${challenge.xpReward}`,
    })
    .where(eq(userStats.userId, user.id));

  return { xp: challenge.xpReward };
}

/* ─── Get Challenge History ─── */

export async function getChallengeHistory(limit = 30) {
  const user = await requireAuth();

  const completions = await db
    .select()
    .from(microChallengeCompletions)
    .where(eq(microChallengeCompletions.userId, user.id))
    .orderBy(microChallengeCompletions.completedAt)
    .limit(limit);

  return completions;
}

