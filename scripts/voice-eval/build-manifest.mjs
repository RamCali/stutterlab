#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const [datasetRoot, outputPath] = process.argv.slice(2);

if (!datasetRoot || !outputPath) {
  console.error(
    "Usage: node scripts/voice-eval/build-manifest.mjs <dataset-root> <output-jsonl>"
  );
  process.exit(1);
}

const root = path.resolve(datasetRoot);
const audioFiles = listFiles(root).filter((file) =>
  /\.(wav|mp3|flac|m4a)$/i.test(file)
);
const csvFiles = listFiles(root).filter((file) => /\.csv$/i.test(file));
const labelsByClipId = new Map();

for (const csvFile of csvFiles) {
  await readCsvLabels(csvFile, labelsByClipId);
}

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
const out = fs.createWriteStream(outputPath, "utf8");

for (const clipPath of audioFiles) {
  const clipId = path.basename(clipPath, path.extname(clipPath));
  const labels = labelsByClipId.get(clipId) ?? {};
  out.write(
    JSON.stringify({
      clipId,
      clipPath,
      labels,
    }) + "\n"
  );
}

out.end();
console.log(
  `Wrote ${audioFiles.length} clips with labels from ${csvFiles.length} CSV file(s) to ${outputPath}`
);

function listFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Dataset root does not exist: ${dir}`);
  }

  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

async function readCsvLabels(csvFile, labelsByClipId) {
  const stream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    if (!headers) {
      headers = cells.map((cell) => cell.trim());
      continue;
    }

    const row = Object.fromEntries(headers.map((header, i) => [header, cells[i]]));
    const clipId =
      row.ClipId ||
      row.clipId ||
      row.clip_id ||
      row.FileName ||
      row.filename ||
      row.file;
    if (!clipId) continue;

    const normalizedClipId = path.basename(String(clipId), path.extname(String(clipId)));
    labelsByClipId.set(normalizedClipId, {
      block: numberish(row.Block),
      prolongation: numberish(row.Prolongation),
      soundRep: numberish(row.SoundRep),
      wordRep: numberish(row.WordRep),
      interjection: numberish(row.Interjection),
      noStutteredWords: numberish(row.NoStutteredWords),
      naturalPause: numberish(row.NaturalPause),
      poorAudioQuality: numberish(row.PoorAudioQuality),
      difficultToUnderstand: numberish(row.DifficultToUnderstand),
      sourceCsv: csvFile,
    });
  }
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function numberish(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}
