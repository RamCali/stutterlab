"use server";

import { db } from "@/lib/db/client";
import { earlyAccessSignups } from "@/lib/db/schema";

async function syncToKlaviyo(email: string, source: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/klaviyo/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
  } catch {
    // Don't block signup if Klaviyo sync fails
  }
}

export async function joinEarlyAccess(email: string, source = "early-access") {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    await db
      .insert(earlyAccessSignups)
      .values({ email: trimmed })
      .onConflictDoNothing();

    // Sync to Klaviyo in background
    syncToKlaviyo(trimmed, source);

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
