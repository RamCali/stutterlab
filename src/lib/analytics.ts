"use client";

import posthog from "posthog-js";

/**
 * Activation-funnel event names. Keep in sync with docs/ACTIVATION.md —
 * these power the Day 1 → Day 7 dashboards in PostHog.
 */
export const EVENTS = {
  SIGNUP_COMPLETED: "signup_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  FIRST_PRACTICE_STARTED: "first_practice_started",
  PRACTICE_COMPLETED: "practice_completed",
  AI_CONVERSATION_STARTED: "ai_conversation_started",
  STREAK_DAY_REACHED: "streak_day_reached",
  PAYWALL_VIEWED: "paywall_viewed",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export function track(
  event: EventName | string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
