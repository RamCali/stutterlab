# Voice Evaluation Scaffold

This folder is for local provider testing against stuttered-speech clips.

Canonical dataset:

- https://www.kaggle.com/datasets/vudominhgiang/uclass-stuttered-speech-clips-sep-28k-format

Do not commit downloaded audio files. Keep datasets in `~/datasets`, `/tmp`, or another local path outside the repo.

## Build A Manifest

```bash
node scripts/voice-eval/build-manifest.mjs \
  ~/datasets/uclass-stuttered-speech-clips-sep-28k-format \
  /tmp/uclass-manifest.jsonl
```

The manifest is JSONL and includes audio paths plus any SEP-28k-style labels found in CSV metadata.

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
