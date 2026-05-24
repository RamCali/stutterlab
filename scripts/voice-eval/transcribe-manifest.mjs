#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const options = parseArgs(process.argv.slice(2));
const manifestPath = options.manifest;
const provider = options.provider;
const outPath = options.out;
const limit = options.limit ? Number(options.limit) : Infinity;
const model = options.model;

if (!manifestPath || !provider || !outPath) {
  fail(
    "Usage: node scripts/voice-eval/transcribe-manifest.mjs --manifest <jsonl> --provider <openai|deepgram> --out <jsonl> [--limit 10]"
  );
}

if (!["openai", "deepgram"].includes(provider)) {
  fail("--provider must be openai or deepgram");
}

loadDotEnv();

const rows = fs
  .readFileSync(manifestPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .slice(0, limit);

if (!rows.length) {
  fail(`No manifest rows found in ${manifestPath}`);
}

const apiKey =
  provider === "openai" ? process.env.OPENAI_API_KEY : process.env.DEEPGRAM_API_KEY;
if (!apiKey) {
  fail(
    provider === "openai"
      ? "OPENAI_API_KEY is missing from .env or the shell environment."
      : "DEEPGRAM_API_KEY is missing from .env or the shell environment."
  );
}

fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
const out = fs.createWriteStream(outPath, "utf8");

for (const row of rows) {
  const started = Date.now();
  let result;

  try {
    result =
      provider === "openai"
        ? await transcribeOpenAI(row, apiKey, model ?? "gpt-4o-mini-transcribe")
        : await transcribeDeepgram(row, apiKey, model ?? "nova-3");
  } catch (error) {
    result = {
      transcript: "",
      error: error instanceof Error ? error.message : String(error),
      raw: null,
    };
  }

  out.write(
    JSON.stringify({
      clipId: row.clipId,
      clipPath: row.clipPath,
      provider,
      model: model ?? (provider === "openai" ? "gpt-4o-mini-transcribe" : "nova-3"),
      transcript: result.transcript,
      latencyMs: Date.now() - started,
      error: result.error,
      sourceDataset: row.sourceDataset,
      sourceRelease: row.sourceRelease,
      task: row.task,
      durationSeconds: row.durationSeconds,
    }) + "\n"
  );

  const status = result.error ? `error: ${result.error}` : `${result.transcript.length} chars`;
  console.log(`${row.clipId}: ${status}`);
}

out.end();
console.log(`Wrote ${rows.length} transcription result(s) to ${outPath}`);

async function transcribeOpenAI(row, apiKey, selectedModel) {
  const stats = fs.statSync(row.clipPath);
  if (stats.size > 25 * 1024 * 1024) {
    throw new Error("OpenAI transcription uploads are limited to 25MB per file.");
  }

  const form = new FormData();
  const buffer = fs.readFileSync(row.clipPath);
  form.append("file", new Blob([buffer], { type: mimeType(row.clipPath) }), path.basename(row.clipPath));
  form.append("model", selectedModel);
  form.append(
    "prompt",
    "This is speech from a person who stutters. Preserve repeated sounds, repeated words, fillers, pauses, and partial words when audible."
  );
  form.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.error?.message ?? `${response.status} ${response.statusText}`);
  }

  return {
    transcript: raw?.text ?? "",
    error: null,
    raw,
  };
}

async function transcribeDeepgram(row, apiKey, selectedModel) {
  const buffer = fs.readFileSync(row.clipPath);
  const url = new URL("https://api.deepgram.com/v1/listen");
  url.searchParams.set("model", selectedModel);
  url.searchParams.set("smart_format", "true");
  url.searchParams.set("punctuate", "true");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": mimeType(row.clipPath),
    },
    body: buffer,
  });

  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(raw?.err_msg ?? raw?.message ?? `${response.status} ${response.statusText}`);
  }

  const transcript =
    raw?.results?.channels?.[0]?.alternatives?.[0]?.transcript ??
    raw?.results?.utterances?.map((utterance) => utterance.transcript).join(" ") ??
    "";

  return {
    transcript,
    error: null,
    raw,
  };
}

function loadDotEnv() {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".flac") return "audio/flac";
  return "application/octet-stream";
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) fail(`Unexpected argument: ${arg}`);

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

function fail(message) {
  console.error(message);
  process.exit(1);
}
