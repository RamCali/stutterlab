"use client";

export function trackProductEvent(
  eventName: string,
  context?: Record<string, unknown>
) {
  try {
    navigator.sendBeacon?.(
      "/api/events",
      new Blob([JSON.stringify({ eventName, context })], {
        type: "application/json",
      })
    );
  } catch {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, context }),
      keepalive: true,
    }).catch(() => {});
  }
}
