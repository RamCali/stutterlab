"use server";

import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import {
  parseResearchConsent,
  researchConsentPatch,
  type ResearchConsentState,
} from "@/lib/research/consent";
import { buildResearchExportCsvForUser } from "@/lib/research/build-export";

export async function getResearchConsent(): Promise<ResearchConsentState> {
  const user = await requireAuth();
  const [profile] = await db
    .select({ treatmentPath: profiles.treatmentPath })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return parseResearchConsent(
    (profile?.treatmentPath as Record<string, unknown>) ?? {},
  );
}

export async function setResearchConsent(consented: boolean) {
  const user = await requireAuth();
  const [profile] = await db
    .select({ treatmentPath: profiles.treatmentPath })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const existing = (profile?.treatmentPath as Record<string, unknown>) ?? {};
  const merged = { ...existing, ...researchConsentPatch(consented) };

  await db
    .update(profiles)
    .set({ treatmentPath: merged, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  return parseResearchConsent(merged);
}

/** Used by API route — prefer buildResearchExportCsvForUser from build-export.ts in routes */
export async function buildResearchExportCsv() {
  const user = await requireAuth();
  return buildResearchExportCsvForUser(user.id);
}
