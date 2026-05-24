#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://www.uclass.psychol.ucl.ac.uk";
const RELEASE_DIRS = {
  release1: {
    monologue: "Audio",
  },
  release2: {
    monologue: "Release2/Monologue/AudioOnly",
    reading: "Release2/Reading/AudioOnly",
    conversation: "Release2/Conversation/AudioOnly",
  },
};

const options = parseArgs(process.argv.slice(2));
const release = options.release ?? "release2";
const task = options.task ?? "monologue";
const format = options.format ?? "mp3";
const limit = Number(options.limit ?? 10);
const outDir = path.resolve(options.out ?? path.join("datasets", "uclass-audio"));
const manifestPath = path.resolve(options.manifest ?? path.join(outDir, "manifest.jsonl"));

if (!RELEASE_DIRS[release]) {
  fail("--release must be release1 or release2");
}

if (!RELEASE_DIRS[release][task]) {
  fail(
    release === "release1"
      ? "--task must be monologue for release1"
      : "--task must be monologue, reading, or conversation for release2"
  );
}

if (!["mp3", "wav", "sfs"].includes(format)) {
  fail("--format must be mp3, wav, or sfs");
}

if (!Number.isInteger(limit) || limit < 1) {
  fail("--limit must be a positive integer");
}

const indexUrl = `${BASE_URL}/${RELEASE_DIRS[release][task]}/${format}/`;
console.log(`Fetching UCLASS listing: ${indexUrl}`);

const html = await fetchText(indexUrl);
const links = parseAudioLinks(html, indexUrl, format).slice(0, limit);

if (!links.length) {
  fail(`No .${format} links found at ${indexUrl}`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
const manifest = fs.createWriteStream(manifestPath, "utf8");

let downloaded = 0;
for (const url of links) {
  const filename = decodeURIComponent(path.basename(new URL(url).pathname));
  const localPath = path.join(outDir, release, task, format, filename);
  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  if (!fs.existsSync(localPath)) {
    process.stdout.write(`Downloading ${filename}... `);
    const bytes = await download(url, localPath);
    console.log(`${formatBytes(bytes)}`);
  }

  downloaded++;
  manifest.write(
    JSON.stringify({
      clipId: path.basename(filename, path.extname(filename)),
      clipPath: localPath,
      sourceDataset: "UCLASS",
      sourceRelease: release,
      task,
      format,
      sourceUrl: url,
      labels: {},
    }) + "\n"
  );
}

manifest.end();
console.log(`Wrote ${downloaded} file(s) to ${outDir}`);
console.log(`Wrote manifest to ${manifestPath}`);

function parseAudioLinks(html, indexUrl, format) {
  const links = new Set();
  const pattern = /href\s*=\s*["']?([^"'\s>]+)["']?/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const href = match[1].replace(/&amp;/g, "&");
    if (!href.toLowerCase().endsWith(`.${format}`)) continue;
    links.add(new URL(href, indexUrl).toString());
  }

  return [...links].sort((a, b) =>
    path.basename(new URL(a).pathname).localeCompare(path.basename(new URL(b).pathname))
  );
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function download(url, localPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(localPath, buffer);
  return buffer.byteLength;
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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function fail(message) {
  console.error(message);
  console.error(
    "Usage: node scripts/voice-eval/pull-uclass-audio.mjs [--release release2] [--task monologue] [--format mp3] [--limit 10] [--out datasets/uclass-audio]"
  );
  process.exit(1);
}
