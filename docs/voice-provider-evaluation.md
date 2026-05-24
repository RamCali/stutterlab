# Voice Provider Evaluation

Goal: pick the voice stack that makes users feel understood, especially when they block, repeat, prolong, pause, or speak with anxiety.

## Decision

Use **Deepgram STT + app AI response + TTS** as the primary voice stack for stutter-sensitive recognition.

Rationale from the UCLASS benchmark:

- Deepgram completed 82 / 82 UCLASS monologue files with 0 empty transcripts.
- Deepgram median latency was 563ms, p95 967ms.
- OpenAI completed 74 / 82 in the same run because quota errors interrupted 8 files.
- OpenAI median latency on attempted files was 2,528ms, p95 3,778ms.
- Deepgram preserved more disfluency evidence, for example repeated words such as `last last last` and `for for`, while OpenAI often cleaned those into fluent text.

Use OpenAI for post-session summarization/coaching where clean semantic understanding matters more than preserving repetitions. Keep ElevenLabs for TTS and as a fallback conversation path.

## Providers Tested

- Deepgram STT + app AI response + TTS
- OpenAI transcription for post-session analysis
- ElevenLabs Conversational AI as fallback/voice UX option
- OpenAI Realtime as future optional experiment

## Test Set

Canonical public corpus:

- UCLASS Release 2 monologue MP3 archive: https://www.uclass.psychol.ucl.ac.uk/
- Local manifest: `datasets/uclass-audio/uclass-manifest.jsonl`
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

## Current Voice Path

- `/api/deepgram-session` grants short-lived Deepgram tokens.
- `DeepgramStreamingClient` streams microphone audio to Deepgram Nova-3.
- `VoiceConversation` sends user turns through the app AI route and speaks responses with TTS.
- ElevenLabs remains a fallback and TTS provider, not the primary recognition path.
- Voice persona routing lives in `src/lib/voice/personas.ts`.
- Provider-specific voice names/IDs are resolved server-side in `src/lib/voice/server-personas.ts`.
- Phone calls no longer start with Twilio `<Say>`; the selected scenario voice should be the first voice the user hears.

## Natural Voice Plan

StutterLab uses two voice categories:

- **Therapist guide voice:** constant, calm, slow, warm. Used for guidance and regulation.
- **Scenario role voices:** realistic voices that match the setting, such as bank customer service, florist, fast food cashier, receptionist, hiring manager, or retail associate.

Each persona defines role, gender, pace, affect, scenario prompt, first message, and provider env var names. This lets the product mimic real life without leaking therapy language into roleplay.

## Internationalization Plan

Voice routes accept optional `language`, `country`, and `accent` fields. Phone practice forwards these to the bridge as query params.

Next product step: add user profile settings for preferred language, country/region, and accent/dialect, then pass those values into browser and phone practice automatically.

## Local Evaluation Workflow

1. Pull UCLASS audio locally:
   - `node scripts/voice-eval/pull-uclass-audio.mjs --release release2 --task monologue --format mp3 --limit 100 --out datasets/uclass-audio --manifest datasets/uclass-audio/manifest.jsonl`
2. Build a manifest:
   - `node scripts/voice-eval/build-uclass-manifest.mjs datasets/uclass-audio datasets/uclass-audio/uclass-manifest.jsonl`
3. Run provider transcription scripts:
   - `node scripts/voice-eval/transcribe-manifest.mjs --manifest datasets/uclass-audio/uclass-manifest.jsonl --provider deepgram --out datasets/uclass-audio/deepgram-full-results.jsonl`
4. Summarize results:
   - `node scripts/voice-eval/summarize-transcriptions.mjs datasets/uclass-audio/deepgram-full-results.jsonl`
5. Compare providers using failure rate, empty transcript rate, latency, and human review of repetition preservation.

Note: public stuttering clip datasets often include labels but not perfect word-level reference transcripts, so human review or a smaller manually transcribed benchmark set is still required for true WER.
