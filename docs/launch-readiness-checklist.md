# Launch Readiness Checklist

## Must Be Green

- `npm test`
- `npm run lint`
- `npm run build`
- `/api/health`
- `/api/billing/config`

## First Session

- User can sign up without confusion.
- Adult-only positioning is clear before onboarding begins.
- Checkout clearly says Stripe + StutterLab.
- User can start first AI practice.
- User can complete first task manually.
- User can recover if the AI mishears them.
- User reaches report/next task after completion.

## Clinical Framing To-Do

### Scope And Safety

- [x] Add a clear adult-only note to marketing, signup, onboarding, and clinical report surfaces.
- [x] Review all copy for adult-only scope before launch.
- [x] Remove or avoid child-specific guidance in the current product:
  - No preschool-age guidance.
  - No parent/caregiver child-development module.
  - No age-of-onset guidance written for children.
  - No language implying StutterLab assesses pediatric fluency disorders.
- [x] Update AI clinical safety rules:
  - Do not diagnose stuttering, cluttering, or any fluency disorder.
  - Do not claim to determine whether a user's disfluencies are typical or atypical.
  - Do not promise cure or fluency elimination.
  - Encourage a licensed SLP when speech concerns cause significant work, school, relationship, or daily-life impact.

### Learn Content

- [x] Add an in-app Learn module: `Typical vs. Atypical Disfluencies for Adults`.
- [x] Define typical-like disfluencies in adult-friendly language:
  - Fillers and interjections, such as `um`, `uh`, and occasional `like`.
  - Whole-word or phrase repetitions.
  - Revisions, restarts, and thinking pauses.
- [x] Define stuttering-like disfluencies in adult-friendly language:
  - Blocks where speech temporarily stops.
  - Prolongations where a sound is stretched.
  - Sound or syllable repetitions.
  - Speech-linked tension or secondary behaviors.
- [x] Add a cluttering-aware note without diagnosing:
  - Fast or irregular speech rate.
  - Unusual pauses.
  - Reduced clarity or omitted syllables.
  - User may not notice the pattern until others mention it.

### Onboarding

- [x] Ask how long the user has experienced fluency difficulties.
- [x] Ask whether the user avoids words, calls, introductions, meetings, ordering, or presentations.
- [x] Ask whether physical behaviors happen during speech, such as eye blinking, mouth tension, looking away, or covering the mouth.
- [x] Ask whether the user experiences fast or hard-to-understand speech.
- [x] Ask whether stuttering or cluttering runs in the family.
- [x] Save adult fluency context fields with onboarding data.
- [x] Use the new context fields to personalize the recommended practice emphasis.
- [x] Dashboard task reasons reflect onboarding-specific practice focus.

### Reports And Insights

- [x] Update clinical reports to group detected patterns:
  - Typical-like: fillers, revisions, phrase repetitions, pauses.
  - Stuttering-like: blocks, prolongations, sound repetitions, syllable repetitions.
  - Cluttering-like indicators: high rate, unusual pausing, reduced clarity signals when available.
- [x] Add report copy that says categories are practice insights, not a diagnosis.
- [x] Add a plain-language explanation for each pattern group.
- [x] Show whether each pattern group is increasing, decreasing, or stable across reports when history exists.

### Practice Personalization

- [x] Map blocks to cancellation, pull-out, and airflow reset practice.
- [x] Map prolongations to gentle onset and light contact practice.
- [x] Map repetitions to pacing, rhythm reading, and deliberate pausing practice.
- [x] Map fillers/interjections to pause practice and message-focused speaking.
- [x] Map fast or unclear speech to rate control, over-articulation, shadowing, and metronome practice.
- [x] Map avoidance patterns to exposure ladder, AI roleplay, CBT thought records, and self-disclosure practice.

### SLP Referral Prompts

- [x] Add referral prompts to `Find SLP` and reports when users report longstanding or worsening fluency concerns.
- [x] Add referral prompts when users report strong avoidance.
- [x] Add referral prompts when users report secondary physical behaviors.
- [x] Add referral prompts when users report significant work, social, or emotional impact.
- [x] Add referral prompts when reports show possible cluttering-like patterns.

## Billing Trust

- [x] Billing support route uses billing-specific inbox env vars:
  - `BILLING_SUPPORT_EMAIL`
  - `BILLING_SUPPORT_FROM_EMAIL`
  - fallback to `SUPPORT_EMAIL` / `RESEND_FROM_EMAIL`
- [x] Trial reminder email job skips safely and logs when `RESEND_API_KEY` is missing.
- [x] MVP SMS is gated behind `SMS_MVP_VOIP_ENABLED=true`, uses a Twilio SMS-capable/VoIP number, sends save-as-StutterLab setup copy, and treats delivery as best effort until A2P/branded messaging is registered.
- [x] Cancellation path is visible in settings through Stripe portal copy and button.
- [x] Settings shows an error if the Stripe billing portal cannot be opened.
- [x] `/api/billing/config` reports non-secret readiness booleans for Stripe keys, webhook secret, prices, app URL, support email, and email transport.
- [x] Checkout route returns configuration failures as server errors instead of misleading auth errors.
- [ ] **PROD-ONLY** Choose and verify a real production support inbox (default `support@stutterlab.com` — verify DNS/SPF/DKIM in Resend dashboard).
- [ ] **PROD-ONLY** `RESEND_API_KEY` configured in Vercel (code already gracefully skips if missing — `src/app/api/billing/support/route.ts:52-73`).
- [ ] **PROD-ONLY** Submit billing support form from prod and confirm email lands in the support inbox.
- [ ] **PROD-ONLY** Trigger `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` via Stripe CLI against the prod webhook endpoint (`https://<domain>/api/webhooks/stripe`).
- [ ] **PROD-ONLY** Manually invoke `/api/cron/trial-reminders` with `CRON_SECRET` and confirm reminder email is sent.
- [x] Stripe product catalog verified in production:
  - Monthly product: `$99/m`, recurring per month.
  - Yearly product: `$999`, recurring per year.
  - Monthly price ID: `price_1T6x0dDNMHfgENPYbF8uijgA`
  - Yearly price ID: `price_1T6x0zDNMHfgENPY37Mq3j80`
  - Confirm these exact IDs are configured in production env as `STRIPE_PRICE_ID_PREMIUM_MONTHLY` and `STRIPE_PRICE_ID_PREMIUM_YEARLY`.

## Voice Reliability

- [x] Deepgram token grant route has auth, rate limit, timeout logging, and safe 503/502 errors.
- [x] Deepgram is the primary stutter-sensitive STT path.
- [x] Deepgram UCLASS benchmark remains healthy:
  - 82 / 82 Release 2 monologue MP3s transcribed.
  - Empty transcript rate: 0%.
  - Median latency: 563ms.
  - p95 latency: 967ms.
- [x] ElevenLabs signed URL route has auth, premium check, rate limit, timeout logging, and safe 503/502 errors.
- [x] OpenAI Realtime client secret route has auth, premium check, rate limit, timeout logging, and safe 503/502 errors.
- [x] Provider timeout logs are sanitized and include provider/endpoint/duration fields.
- [x] Empty transcript and manual summary events are tracked.
- [ ] **PROD-ONLY** Deepgram token grant: hit `/api/deepgram-session` from a logged-in prod session and confirm a temp key is returned.
- [ ] **PROD-ONLY** ElevenLabs signed URL: hit `/api/elevenlabs-session` from a logged-in premium prod session and confirm a signed URL is returned.
- [x] OpenAI Realtime client secret route tested if enabled in production.
- [ ] **PROD-ONLY** Run one full AI voice session in prod, then review provider timeout logs in observability (provider/endpoint/duration fields).

## Transcription Quality

- [x] Raw STT used for fluency analysis preserves repetitions and disfluency evidence.
- [x] Cleaned transcripts used for coaching summaries may smooth non-meaningful stutters.
- [x] Repetitions are cleaned for meaning:
  - Keep meaningful repetition when it adds emphasis or intent, such as `Yes, yes`.
  - Remove meaningless repetition when it does not add value, such as `it's, it's`.
- [x] Stutters are usually removed when they do not change meaning.
- [x] Stutters or repetitions that carry emphasis are retained.
- [x] Overused verbal tics such as `you know`, `like`, and `sort of` are edited down while leaving a little natural flavor.
- [x] Retained verbal tics are set off with commas before and after them.
- [x] Example: `Yes, yes, it's, it's very good` becomes `Yes, yes, it's very good`.

## Security

- [x] GTM disabled unless audited and explicitly set with `NEXT_PUBLIC_GTM_ID`.
- [x] API keys are not returned to the browser.
- [x] AI endpoints require auth and premium checks.
- [x] Public endpoints have rate limits.
- [x] User-submitted XP/scores are not trusted.

## Product Metrics

- [x] Checkout started/completed/incomplete events.
- [x] Voice session started/provider fallback/failed events.
- [x] AI task completed/manual summary events.
- [x] Scenario completion rate by scenario.
- [x] First-session completion rate.

## Analytics

- [x] Google Analytics account verified:
  - Account: `StutterLab` (`388607762`)
  - Property/App: `StutterLab` (`529646881`)
- [x] GTM remains disabled until audited and explicitly set via `NEXT_PUBLIC_GTM_ID`.
