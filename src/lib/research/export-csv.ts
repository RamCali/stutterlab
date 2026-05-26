/**
 * Builds de-identified research export CSV for a single user (self-export).
 */

export interface ResearchExportRow {
  section: string;
  field: string;
  value: string;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(rows: ResearchExportRow[]): string {
  const header = "section,field,value";
  const lines = rows.map(
    (r) =>
      `${escapeCsvCell(r.section)},${escapeCsvCell(r.field)},${escapeCsvCell(r.value)}`,
  );
  return [header, ...lines].join("\n");
}

export function pushRow(
  rows: ResearchExportRow[],
  section: string,
  field: string,
  value: string | number | boolean | Date | null | undefined,
): void {
  rows.push({
    section,
    field,
    value:
      value == null
        ? ""
        : value instanceof Date
          ? value.toISOString()
          : String(value),
  });
}

/** Stable pseudonymous id for exports (not reversible to account) */
export function pseudonymizeUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return `SL-${Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
