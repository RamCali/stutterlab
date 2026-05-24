#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [datasetRoot, outputPath] = process.argv.slice(2);

if (!datasetRoot || !outputPath) {
  console.error(
    "Usage: node scripts/voice-eval/build-uclass-manifest.mjs <uclass-root> <output-jsonl>"
  );
  process.exit(1);
}

const root = path.resolve(datasetRoot);
const audioFiles = listFiles(root)
  .filter((file) => /\.(mp3|wav|flac|m4a)$/i.test(file))
  .sort();

if (!audioFiles.length) {
  console.error(`No UCLASS audio files found under ${root}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
const out = fs.createWriteStream(outputPath, "utf8");

for (const audioPath of audioFiles) {
  const relativePath = path.relative(root, audioPath);
  const filename = path.basename(audioPath);
  const clipId = path.basename(filename, path.extname(filename));
  const parts = relativePath.split(path.sep);
  const metadata = parseUclassFilename(clipId);
  const stats = fs.statSync(audioPath);
  const durationSeconds = await probeDuration(audioPath);

  out.write(
    JSON.stringify({
      clipId,
      clipPath: audioPath,
      sourceDataset: "UCLASS",
      sourceRelease: parts[0] ?? null,
      task: parts[1] ?? null,
      format: path.extname(filename).slice(1).toLowerCase(),
      bytes: stats.size,
      durationSeconds,
      speaker: metadata,
      labels: {},
      review: {
        stutteringLikely: true,
        needsHumanTranscript: true,
      },
    }) + "\n"
  );
}

out.end();
console.log(`Wrote ${audioFiles.length} UCLASS audio file(s) to ${outputPath}`);

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

function parseUclassFilename(clipId) {
  const match = clipId.match(/^([FM])_(\d+)(?:_(\d+))?_(\d+)y(?:(\d+)m)?_(\d+)$/i);
  if (!match) return null;

  const [, sex, speakerId, speakerVariant, years, months, recording] = match;
  return {
    sex: sex.toUpperCase() === "F" ? "female" : "male",
    speakerId,
    speakerVariant: speakerVariant ?? null,
    ageYears: Number(years),
    ageMonths: months ? Number(months) : 0,
    recording: Number(recording),
  };
}

function probeDuration(audioPath) {
  return new Promise((resolve) => {
    const child = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      audioPath,
    ]);

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("error", () => resolve(null));
    child.on("close", (code) => {
      if (code !== 0) return resolve(null);
      const duration = Number(stdout.trim());
      resolve(Number.isFinite(duration) ? Number(duration.toFixed(3)) : null);
    });
  });
}
