# Launch Readiness Checklist

## Must Be Green

- `npm test`
- `npm run lint`
- `npm run build`
- `/api/health`
- `/api/billing/config`

## First Session

- User can sign up without confusion.
- Checkout clearly says Stripe + StutterLab.
- User can start first AI practice.
- User can complete first task manually.
- User can recover if the AI mishears them.
- User reaches report/next task after completion.

## Billing Trust

- Reminder: choose a real support inbox and set it as `SUPPORT_EMAIL`.
- `RESEND_API_KEY` configured or another support transport is active.
- Billing support form tested.
- Stripe webhook tested.
- Trial reminder email tested.
- Cancellation path visible in settings.
- Stripe product catalog verified:
  - Monthly product: `$99/m`, recurring per month.
  - Yearly product: `$999`, recurring per year.
  - Monthly price ID: `price_1T6wSKDQ3dxBuCnuMRyOOnFL`
  - Yearly price ID: `price_1T6wVRDQ3dxBuCnufvCpwEXH`
  - Confirm these exact IDs are configured in production env as `STRIPE_PRICE_ID_PREMIUM_MONTHLY` and `STRIPE_PRICE_ID_PREMIUM_YEARLY`.

## Voice Reliability

- Deepgram token grant works.
- ElevenLabs signed URL works.
- OpenAI Realtime client secret route works if enabled.
- Provider timeout logs show no repeated failures.
- Empty transcript and manual summary events are tracked.

## Security

- GTM disabled unless audited.
- API keys are not returned to the browser.
- AI endpoints require auth and premium checks.
- Public endpoints have rate limits.
- User-submitted XP/scores are not trusted.

## Product Metrics

- Checkout started/completed/incomplete events.
- Voice session started/provider fallback/failed events.
- AI task completed/manual summary events.
- Scenario completion rate by scenario.
- First-session completion rate.

## Analytics

- Google Analytics account verified:
  - Account: `StutterLab` (`388607762`)
  - Property/App: `StutterLab` (`529646881`)
- GTM remains disabled until audited and explicitly set via `NEXT_PUBLIC_GTM_ID`.
