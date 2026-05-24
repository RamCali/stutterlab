#!/usr/bin/env node
import fs from "node:fs";

const [resultsPath] = process.argv.slice(2);

if (!resultsPath) {
  console.error("Usage: node scripts/voice-eval/summarize-transcriptions.mjs <results-jsonl>");
  process.exit(1);
}

const rows = fs
  .readFileSync(resultsPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

if (!rows.length) {
  console.error(`No rows found in ${resultsPath}`);
  process.exit(1);
}

const failures = rows.filter((row) => row.error);
const empty = rows.filter((row) => !row.error && !String(row.transcript ?? "").trim());
const latencies = rows
  .filter((row) => Number.isFinite(Number(row.latencyMs)))
  .map((row) => Number(row.latencyMs))
  .sort((a, b) => a - b);

const byProvider = groupBy(rows, (row) => row.provider ?? "unknown");

console.log(
  JSON.stringify(
    {
      total: rows.length,
      providers: Object.fromEntries(
        Object.entries(byProvider).map(([provider, providerRows]) => [
          provider,
          {
            total: providerRows.length,
            failures: providerRows.filter((row) => row.error).length,
            emptyTranscripts: providerRows.filter(
              (row) => !row.error && !String(row.transcript ?? "").trim()
            ).length,
          },
        ])
      ),
      failureRate: rate(failures.length, rows.length),
      emptyTranscriptRate: rate(empty.length, rows.length),
      latencyMs: {
        median: percentile(latencies, 0.5),
        p95: percentile(latencies, 0.95),
      },
    },
    null,
    2
  )
);

function groupBy(rows, keyFn) {
  return rows.reduce((groups, row) => {
    const key = keyFn(row);
    groups[key] ??= [];
    groups[key].push(row);
    return groups;
  }, {});
}

function rate(count, total) {
  return total ? Number((count / total).toFixed(3)) : 0;
}

function percentile(values, p) {
  if (!values.length) return null;
  const index = Math.min(values.length - 1, Math.ceil(values.length * p) - 1);
  return values[index];
}
