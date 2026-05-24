#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const RAW_BASE =
  "https://raw.githubusercontent.com/apple/ml-stuttering-events-dataset/main";
const STUTTER_LABELS = ["Block", "Prolongation", "SoundRep", "WordRep"];

const options = parseArgs(process.argv.slice(2));
const dataset = options.dataset ?? "SEP-28k";
const limit = Number(options.limit ?? 25);
const minVotes = Number(options.minVotes ?? 2);
const outDir = path.resolve(options.out ?? path.join("datasets", "sep28k-clips"));
const manifestPath = path.resolve(options.manifest ?? path.join(outDir, "manifest.jsonl"));

if (!Number.isInteger(limit) || limit < 1) {
  fail("--limit must be a positive integer");
}

if (!Number.isFinite(minVotes) || minVotes < 1) {
  fail("--min-votes must be a positive number");
}

if (!["SEP-28k", "fluencybank"].includes(dataset)) {
  fail("--dataset must be SEP-28k or fluencybank");
}

await assertFfmpeg();

const labelsFile = dataset === "SEP-28k" ? "SEP-28k_labels.csv" : "fluencybank_labels.csv";
const episodesFile =
  dataset === "SEP-28k" ? "SEP-28k_episodes.csv" : "fluencybank_episodes.csv";

console.log(`Fetching ${dataset} metadata from Apple ml-stuttering-events-dataset...`);
const [labelsCsv, episodesCsv] = await Promise.all([
  fetchText(`${RAW_BASE}/${labelsFile}`),
  fetchText(`${RAW_BASE}/${episodesFile}`),
]);

const episodes = parseEpisodes(episodesCsv);
const selected = parseCsv(labelsCsv)
  .filter((row) => stutterScore(row) >= minVotes)
  .slice(0, limit)
  .map((row) => {
    const episode = episodes.get(episodeKey(row.Show, row.EpId));
    return episode ? { row, episode } : null;
  })
  .filter(Boolean);

if (!selected.length) {
  fail("No matching clips found. Try lowering --min-votes.");
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
const manifest = fs.createWriteStream(manifestPath, "utf8");

let ok = 0;
let failed = 0;

for (const item of selected) {
  const { row, episode } = item;
  const clipId = `${row.Show}_${row.EpId}_${row.ClipId}`;
  const clipPath = path.join(outDir, row.Show, String(row.EpId), `${clipId}.wav`);
  fs.mkdirSync(path.dirname(clipPath), { recursive: true });

  if (!fs.existsSync(clipPath)) {
    const startSeconds = Number(row.Start) / 16000;
    const durationSeconds = (Number(row.Stop) - Number(row.Start)) / 16000;
    process.stdout.write(`Extracting ${clipId}... `);

    const result = await runFfmpeg([
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      String(startSeconds),
      "-i",
      episode.url,
      "-t",
      String(durationSeconds),
      "-ac",
      "1",
      "-ar",
      "16000",
      "-y",
      clipPath,
    ]);

    if (!result.ok) {
      failed++;
      console.log("failed");
      console.error(result.stderr.trim() || `ffmpeg exited with ${result.code}`);
      continue;
    }

    console.log("done");
  }

  ok++;
  manifest.write(
    JSON.stringify({
      clipId,
      clipPath,
      sourceDataset: dataset,
      sourceUrl: episode.url,
      show: row.Show,
      episode: row.EpId,
      clipIndex: Number(row.ClipId),
      labels: {
        block: numberish(row.Block),
        prolongation: numberish(row.Prolongation),
        soundRep: numberish(row.SoundRep),
        wordRep: numberish(row.WordRep),
        interjection: numberish(row.Interjection),
        noStutteredWords: numberish(row.NoStutteredWords),
        naturalPause: numberish(row.NaturalPause),
        poorAudioQuality: numberish(row.PoorAudioQuality),
        difficultToUnderstand: numberish(row.DifficultToUnderstand),
      },
    }) + "\n"
  );
}

manifest.end();
console.log(`Wrote ${ok} clip(s) to ${outDir}`);
console.log(`Wrote manifest to ${manifestPath}`);
if (failed) {
  console.log(`${failed} clip(s) failed, usually because an old podcast URL is unavailable.`);
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i++;
    }
  }
  return parsed;
}

function parseEpisodes(csv) {
  const episodes = new Map();
  for (const cells of parseCsvRows(csv)) {
    if (cells.length < 5) continue;
    const show = cells[cells.length - 2]?.trim();
    const epId = cells[cells.length - 1]?.trim();
    const url = cells.find((cell) => /^https?:\/\//i.test(cell.trim()))?.trim();
    if (!show || !epId || !url) continue;
    episodes.set(episodeKey(show, epId), { show, epId, url });
  }
  return episodes;
}

function parseCsv(csv) {
  const rows = parseCsvRows(csv);
  const headers = rows.shift()?.map((header) => header.trim());
  if (!headers) return [];
  return rows.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""]))
  );
}

function parseCsvRows(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function stutterScore(row) {
  return STUTTER_LABELS.reduce((total, label) => total + numberish(row[label]), 0);
}

function numberish(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function episodeKey(show, epId) {
  return `${String(show).trim()}::${String(epId).trim()}`;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function assertFfmpeg() {
  const result = await run("ffmpeg", ["-version"]);
  if (!result.ok) {
    fail("ffmpeg is required to extract clips. Install it, then rerun this script.");
  }
}

function runFfmpeg(args) {
  return run("ffmpeg", args);
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      resolve({ ok: false, code: null, stderr: error.message });
    });
    child.on("close", (code) => {
      resolve({ ok: code === 0, code, stderr });
    });
  });
}

function fail(message) {
  console.error(message);
  console.error(
    "Usage: node scripts/voice-eval/pull-sep28k-clips.mjs [--limit 25] [--min-votes 2] [--out ~/datasets/sep28k-clips]"
  );
  process.exit(1);
}
