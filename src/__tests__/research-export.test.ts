import { describe, it, expect } from "vitest";
import {
  pseudonymizeUserId,
  pushRow,
  rowsToCsv,
  type ResearchExportRow,
} from "@/lib/research/export-csv";
import {
  parseResearchConsent,
  researchConsentPatch,
} from "@/lib/research/consent";

describe("research export csv", () => {
  it("escapes commas and quotes", () => {
    const rows: ResearchExportRow[] = [
      { section: "test", field: "note", value: 'He said "hello", then left' },
    ];
    const csv = rowsToCsv(rows);
    expect(csv).toContain('"He said ""hello"", then left"');
  });

  it("builds stable pseudonym ids", () => {
    const a = pseudonymizeUserId("user-abc");
    const b = pseudonymizeUserId("user-abc");
    const c = pseudonymizeUserId("user-xyz");
    expect(a).toBe(b);
    expect(a).toMatch(/^SL-/);
    expect(a).not.toBe(c);
  });

  it("pushRow stringifies values", () => {
    const rows: ResearchExportRow[] = [];
    pushRow(rows, "meta", "count", 42);
    expect(rows[0].value).toBe("42");
  });
});

describe("research consent", () => {
  it("parses consent from treatment path", () => {
    expect(
      parseResearchConsent({ researchDataConsent: true, researchDataConsentedAt: "2026-01-01" }),
    ).toEqual({ consented: true, consentedAt: "2026-01-01" });
  });

  it("clears consent timestamp when opted out", () => {
    expect(researchConsentPatch(false).researchDataConsentedAt).toBeNull();
    expect(researchConsentPatch(true).researchDataConsent).toBe(true);
  });
});
