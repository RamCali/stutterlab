# Voice Provider Evaluation

Goal: pick the voice stack that makes users feel understood, especially when they block, repeat, prolong, pause, or speak with anxiety.

## Providers To Test

- ElevenLabs Conversational AI
- OpenAI Realtime
- Deepgram STT + Anthropic response + TTS
- OpenAI transcription for post-session analysis

## Test Set

Canonical public corpus:

- UCLASS Stuttered Speech Clips in SEP-28k format: https://www.kaggle.com/datasets/vudominhgiang/uclass-stuttered-speech-clips-sep-28k-format
- Download locally with Kaggle credentials, then point the evaluation scaffold at the dataset root.
- Do not commit raw audio clips to this repo.

Collect consented samples across:

- Repetitions: "b-b-b-burger"
- Prolongations: "ssssoup"
- Blocks and long silence
- Fast speech
- Quiet speech
- Noisy room
- Phone speaker
- Headphones
- iOS Safari
- Android Chrome
- Desktop Chrome/Safari

Qualitative YouTube review links:

- https://youtu.be/k0Y5Q-Miew8?si=eQZR5f9gmsycapB7
- https://youtu.be/gzb-uFv5z8g?si=uTQomN3QA6Mo6i80

## Metrics

- Word error rate on stuttered speech
- Label coverage by stutter type: block, prolongation, sound repetition, word repetition, interjection
- Turn-taking false interrupts
- Empty transcript rate
- Latency to first response
- Completion rate by scenario
- User-rated "felt understood" score
- Cost per 10-minute session
- Provider failure rate

## Minimum Bar For Launch

- First scenario completion rate above 85%.
- Empty transcript rate below 5%.
- Median voice turn latency below 1.5 seconds.
- No provider key exposed to the browser.
- Manual fallback available on every voice task.

## Current Migration Path

- Keep ElevenLabs as the existing production path.
- Use `/api/openai-realtime-session` to issue OpenAI Realtime ephemeral client secrets.
- A/B test OpenAI Realtime behind a feature flag before switching defaults.

## Local Evaluation Workflow

1. Download the Kaggle dataset outside the repo, for example:
   - `~/datasets/uclass-stuttered-speech-clips-sep-28k-format`
2. Build a manifest:
   - `node scripts/voice-eval/build-manifest.mjs ~/datasets/uclass-stuttered-speech-clips-sep-28k-format /tmp/uclass-manifest.jsonl`
3. Run provider-specific transcription scripts against the manifest.
4. Store provider outputs as JSONL with:
   - `clipPath`
   - `provider`
   - `transcript`
   - `latencyMs`
   - `error`
5. Compare providers using empty transcript rate, latency, and human review on stutter-heavy clips.

Note: public stuttering clip datasets often include labels but not perfect word-level reference transcripts, so human review or a smaller manually transcribed benchmark set is still required for true WER.
