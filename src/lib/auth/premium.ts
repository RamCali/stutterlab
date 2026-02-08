"use server";

import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function isPremium(userId: string): Promise<boolean> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return false;

  const validStatuses = ["active", "trialing"];

  return (
    (sub.plan === "pro" || sub.plan === "slp") &&
    validStatuses.includes(sub.status) &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date())
  );
}

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

export async function getSubscription(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return sub ?? null;
}
