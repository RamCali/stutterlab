# Voice Evaluation Scaffold

This folder is for local provider testing against stuttered-speech clips.

Canonical dataset:

- https://www.kaggle.com/datasets/vudominhgiang/uclass-stuttered-speech-clips-sep-28k-format
- Apple SEP-28k source metadata/scripts: https://github.com/apple/ml-stuttering-events-dataset/
- UCLASS archive: https://www.uclass.psychol.ucl.ac.uk/

Do not commit downloaded audio files. Keep datasets in `~/datasets`, `/tmp`, or another local path outside the repo.

## Pull SEP-28k Clips From Apple Metadata

Apple does not commit audio to the repo. It publishes annotation CSVs and podcast/FluencyBank media URLs. This importer fetches the CSV metadata, picks clips with stuttering-event votes, and asks `ffmpeg` to extract only the annotated 3-second WAV segments.

```bash
node scripts/voice-eval/pull-sep28k-clips.mjs \
  --limit 25 \
  --min-votes 2 \
  --out ~/datasets/sep28k-clips \
  --manifest /tmp/sep28k-manifest.jsonl
```

Useful options:

- `--limit 100` changes how many clips to attempt.
- `--min-votes 1` includes lower-confidence stuttering labels.
- `--dataset fluencybank` uses the FluencyBank metadata instead of SEP-28k.

Some older podcast URLs are no longer reachable, so failed clips can happen.

## Pull UCLASS Audio

UCLASS exposes direct audio listings for Release 1 and Release 2. MP3 is the lightest format for provider smoke tests; WAV is much larger.

```bash
node scripts/voice-eval/pull-uclass-audio.mjs \
  --release release2 \
  --task monologue \
  --format mp3 \
  --limit 25 \
  --out datasets/uclass-audio \
  --manifest datasets/uclass-audio/manifest.jsonl
```

Useful options:

- `--task reading` or `--task conversation` for Release 2.
- `--release release1` for the first UCLASS release.
- `--format wav` when uncompressed audio matters and you have disk space.

UCLASS is useful for research/provider evaluation, but check the UCL/UCLB license path before commercial model training or redistribution.

## Build A UCLASS Manifest

```bash
node scripts/voice-eval/build-uclass-manifest.mjs \
  datasets/uclass-audio \
  datasets/uclass-audio/uclass-manifest.jsonl
```

The UCLASS manifest is JSONL and includes local audio paths, release/task/format, file size, duration from `ffprobe`, and speaker metadata parsed from filenames when possible.

## Run Transcription Evaluation

Add one provider key to `.env` first:

```bash
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
```

Then run a small provider test:

```bash
node scripts/voice-eval/transcribe-manifest.mjs \
  --manifest datasets/uclass-audio/uclass-manifest.jsonl \
  --provider openai \
  --out datasets/uclass-audio/openai-results.jsonl \
  --limit 5
```

OpenAI defaults to `gpt-4o-mini-transcribe`. Deepgram defaults to `nova-3`:

```bash
node scripts/voice-eval/transcribe-manifest.mjs \
  --manifest datasets/uclass-audio/uclass-manifest.jsonl \
  --provider deepgram \
  --out datasets/uclass-audio/deepgram-results.jsonl \
  --limit 5
```

Summarize results:

```bash
node scripts/voice-eval/summarize-transcriptions.mjs \
  datasets/uclass-audio/openai-results.jsonl
```

OpenAI transcription uploads are limited to 25 MB per file. The current UCLASS MP3 samples are comfortably below that; WAV conversation files may not be.

## Provider Output Format

Provider scripts should write JSONL:

```json
{"clipPath":"/path/to/audio.wav","provider":"deepgram","transcript":"...","latencyMs":812,"error":null}
```

Recommended metrics:

- Empty transcript rate
- Median/p95 latency
- Failure rate
- Manual review by stutter type
- WER on a smaller manually transcribed benchmark subset
