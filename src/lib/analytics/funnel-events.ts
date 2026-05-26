"use client";

import { trackProductEvent } from "@/lib/analytics/client";

const ONBOARDING_AT_KEY = "stutterlab_onboarding_completed_at";

function funnelStorageKey(eventName: string) {
  return `stutterlab_funnel_${eventName}`;
}

export function getSecondsSinceOnboarding(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem(ONBOARDING_AT_KEY);
  if (!raw) return undefined;
  const started = Number(raw);
  if (!Number.isFinite(started)) return undefined;
  return Math.round((Date.now() - started) / 1000);
}

export function markOnboardingCompleted() {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_AT_KEY, String(Date.now()));
}

function withFunnelTiming(context?: Record<string, unknown>) {
  const secondsSinceOnboarding = getSecondsSinceOnboarding();
  if (secondsSinceOnboarding === undefined) {
    return context ?? {};
  }
  return { ...context, secondsSinceOnboarding };
}

/** Fire every time (e.g. each practice session). */
export function trackFunnelEvent(
  eventName: string,
  context?: Record<string, unknown>
) {
  trackProductEvent(eventName, withFunnelTiming(context));
}

/** Fire at most once per browser (per funnel step). */
export function trackFunnelEventOnce(
  eventName: string,
  context?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  const key = funnelStorageKey(eventName);
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "true");
  trackProductEvent(eventName, withFunnelTiming(context));
}

/** First practice, AI, or other core action in the product. */
export function trackFirstActionStarted(surface: string, extra?: Record<string, unknown>) {
  trackFunnelEventOnce("first_action_started", { surface, ...extra });
}
