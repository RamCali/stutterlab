/**
 * Research participation consent stored in profiles.treatment_path JSONB.
 */

export const RESEARCH_CONSENT_KEY = "researchDataConsent";
export const RESEARCH_CONSENTED_AT_KEY = "researchDataConsentedAt";

export interface ResearchConsentState {
  consented: boolean;
  consentedAt: string | null;
}

export function parseResearchConsent(
  treatmentPath: Record<string, unknown> | null | undefined,
): ResearchConsentState {
  const tp = treatmentPath ?? {};
  return {
    consented: tp[RESEARCH_CONSENT_KEY] === true,
    consentedAt:
      typeof tp[RESEARCH_CONSENTED_AT_KEY] === "string"
        ? tp[RESEARCH_CONSENTED_AT_KEY]
        : null,
  };
}

export function researchConsentPatch(consented: boolean): Record<string, unknown> {
  if (!consented) {
    return {
      [RESEARCH_CONSENT_KEY]: false,
      [RESEARCH_CONSENTED_AT_KEY]: null,
    };
  }
  return {
    [RESEARCH_CONSENT_KEY]: true,
    [RESEARCH_CONSENTED_AT_KEY]: new Date().toISOString(),
  };
}
