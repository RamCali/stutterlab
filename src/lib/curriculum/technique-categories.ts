export type TechniqueCategory = "fluency_shaping" | "stuttering_modification";

/**
 * Canonical classification of all techniques.
 *
 * Fluency Shaping — restructure speech motor patterns (d = 0.75–1.63)
 * Stuttering Modification — stutter more easily, reduce fear (d = 0.56–0.65)
 */
export const TECHNIQUE_CATEGORIES: Record<string, TechniqueCategory> = {
  // Fluency Shaping
  easy_onset: "fluency_shaping",
  gentle_onset: "fluency_shaping",
  light_contact: "fluency_shaping",
  prolonged_speech: "fluency_shaping",
  pausing: "fluency_shaping",
  continuous_phonation: "fluency_shaping",
  // Stuttering Modification
  cancellation: "stuttering_modification",
  pull_out: "stuttering_modification",
  preparatory_set: "stuttering_modification",
  voluntary_stuttering: "stuttering_modification",
};

export const FLUENCY_SHAPING_TECHNIQUES = [
  "easy_onset",
  "light_contact",
  "prolonged_speech",
  "pausing",
] as const;

export const MODIFICATION_TECHNIQUES = [
  "cancellation",
  "pull_out",
  "preparatory_set",
  "voluntary_stuttering",
] as const;

export const ALL_TECHNIQUES = [
  ...FLUENCY_SHAPING_TECHNIQUES,
  ...MODIFICATION_TECHNIQUES,
] as const;

export function getCategoryForTechnique(
  techniqueId: string
): TechniqueCategory | null {
  return TECHNIQUE_CATEGORIES[techniqueId] ?? null;
}
