import type { EvidenceTier } from "./technique-evidence";

/** Evidence tier per Learn module (by module id) */
export const LEARN_MODULE_EVIDENCE: Record<number, EvidenceTier> = {
  1: "strong", // stuttering neuroscience / prevalence
  2: "mixed", // DAF/FAF/choral
  3: "moderate", // breathing as component (not sole treatment)
  4: "strong", // fluency shaping
  5: "strong", // pacing/pausing
  6: "moderate", // stuttering modification
  7: "strong", // CBT for speech anxiety
  8: "moderate", // desensitization / ACT
  9: "moderate", // transfer / real-world
  10: "moderate", // maintenance
  11: "emerging", // disfluency typing (practice guidance)
};
