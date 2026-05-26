"use server";

import { getUserId } from "@/lib/auth/helpers";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  commsConsentPatch,
  parseCommsConsent,
  type CommsConsentInput,
  type CommsConsentState,
} from "@/lib/comms/consent";
import { isValidE164PhoneNumber } from "@/lib/sms/mvp";

export async function getCommsConsent(): Promise<CommsConsentState> {
  const userId = await getUserId();
  if (!userId) {
    return parseCommsConsent(null);
  }

  const [profile] = await db
    .select({ treatmentPath: profiles.treatmentPath })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return parseCommsConsent(
    (profile?.treatmentPath as Record<string, unknown>) ?? {},
  );
}

export async function setCommsConsent(
  input: CommsConsentInput,
): Promise<CommsConsentState> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [profile] = await db
    .select({ treatmentPath: profiles.treatmentPath })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const existing = (profile?.treatmentPath as Record<string, unknown>) ?? {};
  const merged = { ...existing, ...commsConsentPatch(input) };

  await db
    .update(profiles)
    .set({ treatmentPath: merged, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  return parseCommsConsent(merged);
}

export async function hasSmsConsentForNumber(phoneNumber: string): Promise<boolean> {
  const state = await getCommsConsent();
  return (
    state.smsConsent &&
    state.contactPhoneNumber === phoneNumber.trim() &&
    isValidE164PhoneNumber(phoneNumber.trim())
  );
}

export async function hasPhoneCallConsentForNumber(
  phoneNumber: string,
): Promise<boolean> {
  const state = await getCommsConsent();
  return (
    state.phoneCallConsent &&
    state.contactPhoneNumber === phoneNumber.trim() &&
    isValidE164PhoneNumber(phoneNumber.trim())
  );
}
