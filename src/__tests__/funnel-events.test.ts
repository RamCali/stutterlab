import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackProductEvent } = vi.hoisted(() => ({
  trackProductEvent: vi.fn(),
}));

vi.mock("@/lib/analytics/client", () => ({
  trackProductEvent,
}));

import {
  getSecondsSinceOnboarding,
  markOnboardingCompleted,
  trackFunnelEvent,
  trackFunnelEventOnce,
  trackFirstActionStarted,
} from "@/lib/analytics/funnel-events";

describe("funnel-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("records onboarding timestamp and seconds since", () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    markOnboardingCompleted();
    vi.spyOn(Date, "now").mockReturnValue(now + 120_000);
    expect(getSecondsSinceOnboarding()).toBe(120);
  });

  it("fires once-only events a single time", () => {
    markOnboardingCompleted();
    trackFunnelEventOnce("onboarding_complete", { step: 9 });
    trackFunnelEventOnce("onboarding_complete", { step: 9 });
    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      "onboarding_complete",
      expect.objectContaining({ step: 9, secondsSinceOnboarding: 0 })
    );
  });

  it("fires repeatable events every call", () => {
    trackFunnelEvent("practice_session_started", { day: 1 });
    trackFunnelEvent("practice_session_started", { day: 2 });
    expect(trackProductEvent).toHaveBeenCalledTimes(2);
  });

  it("dedupes first_action_started by surface in event name key", () => {
    trackFirstActionStarted("practice");
    trackFirstActionStarted("ai");
    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      "first_action_started",
      expect.objectContaining({ surface: "practice" })
    );
  });
});
