"use server";

import { db } from "@/lib/db/client";
import { subscriptions, aiConversations } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export type PlanTier = "free" | "core" | "pro" | "elite" | "slp";

/** Plan hierarchy: all paid plans are now equivalent ("Premium") */
const PLAN_RANK: Record<string, number> = {
  free: 0,
  core: 1,
  pro: 1,
  elite: 1,
  slp: 1,
};

/** AI simulation limits per week by plan — Premium gets unlimited */
const AI_SIMS_PER_WEEK: Record<string, number> = {
  free: 0,
  core: Infinity,
  pro: Infinity,
  elite: Infinity,
  slp: Infinity,
};

/** Get the user's current plan tier */
export async function getUserPlan(userId: string): Promise<PlanTier> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return "free";

  const validStatuses = ["active", "trialing"];
  if (
    !validStatuses.includes(sub.status) ||
    (sub.currentPeriodEnd && sub.currentPeriodEnd <= new Date())
  ) {
    return "free";
  }

  return (sub.plan as PlanTier) || "free";
}

/** Check if user has at least the given plan tier */
export async function hasMinPlan(userId: string, minPlan: PlanTier): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return PLAN_RANK[plan] >= PLAN_RANK[minPlan];
}

/** Check if user has any paid plan (core, pro, or elite) */
export async function isPremium(userId: string): Promise<boolean> {
  return hasMinPlan(userId, "core");
}

/** Check if user is on trial */
export async function isInTrial(userId: string): Promise<boolean> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return false;

  return (
    sub.status === "trialing" &&
    !!sub.currentPeriodEnd &&
    sub.currentPeriodEnd > new Date()
  );
}

/** Get trial days left */
export async function getTrialDaysLeft(userId: string): Promise<number> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub || sub.status !== "trialing" || !sub.currentPeriodEnd) return 0;

  const msLeft = sub.currentPeriodEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

/** Get subscription record */
export async function getSubscription(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return sub ?? null;
}

/** Check AI simulation usage for the current week */
export async function getAISimUsage(userId: string): Promise<{
  used: number;
  limit: number;
  canStart: boolean;
  plan: PlanTier;
}> {
  const plan = await getUserPlan(userId);
  const limit = AI_SIMS_PER_WEEK[plan] ?? 0;

  // Elite/SLP: always allowed
  if (limit === Infinity) {
    return { used: 0, limit: Infinity, canStart: true, plan };
  }

  // Count sessions this week (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceMonday);
  weekStart.setHours(0, 0, 0, 0);

  const sessions = await db
    .select({ id: aiConversations.id })
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.userId, userId),
        gte(aiConversations.completedAt, weekStart)
      )
    );

  const used = sessions.length;

  return {
    used,
    limit,
    canStart: used < limit,
    plan,
  };
}

/** Auth-wrapped version for client components to call as a server action */
export async function checkAISimUsage(): Promise<{
  used: number;
  limit: number;
  canStart: boolean;
  plan: PlanTier;
}> {
  const user = await requireAuth();
  return getAISimUsage(user.id);
}
