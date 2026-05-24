# xAI Phone Practice Wiring

## What Is Wired

- `POST /api/xai-voice-session`
  - Requires auth and premium.
  - Creates an xAI realtime client secret for browser voice practice.
  - Uses a block-aware prompt and longer server VAD silence window by default.

- `POST /api/phone-practice/call`
  - Requires auth and premium.
  - Validates an E.164 phone number, for example `+14155552671`.
  - Creates an outbound Twilio call when all phone env vars are configured.

- `GET /api/phone-practice/twiml`
  - Returns TwiML that connects Twilio Media Streams to `PHONE_PRACTICE_BRIDGE_WS_URL`.
  - Sends `scenario`, `persona`, `xaiVoice`, and optional locale params to the bridge.
  - Does not use Twilio `<Say>` for the greeting, so the first spoken voice can be the selected scenario voice instead of Twilio's default robotic voice.

## Required Env Vars

```bash
XAI_API_KEY=your-xai-api-key-here
XAI_VOICE_MODEL=grok-2-voice-1212
XAI_VOICE=Eve

# Optional per-scenario xAI voice overrides
VOICE_THERAPIST_XAI=
VOICE_RECEPTIONIST_XAI=
VOICE_BANK_MALE_XAI=
VOICE_FLORIST_FEMALE_XAI=
VOICE_FAST_FOOD_FEMALE_XAI=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

PHONE_PRACTICE_BRIDGE_WS_URL=
PHONE_PRACTICE_BRIDGE_TOKEN=
```

## Important Boundary

Twilio phone calls stream audio over WebSocket. Next.js route handlers do not host the long-lived WebSocket bridge needed to relay Twilio audio to xAI realtime and return assistant audio back to Twilio.

That bridge should be a small Node service that:

1. Accepts Twilio Media Stream WebSocket connections.
2. Opens an xAI realtime WebSocket session.
3. Relays inbound call audio to xAI.
4. Relays xAI output audio back to Twilio.
5. Emits call analytics back into StutterLab after the call ends.

The current app wiring is ready for that bridge through `PHONE_PRACTICE_BRIDGE_WS_URL`.

## Voice Persona Routing

Voice selection is centralized in `src/lib/voice/personas.ts`.

Current scenario mappings:

- `phone-call` -> doctor receptionist
- `ordering-food` -> fast food cashier
- `customer-service` -> bank customer service representative
- `florist` -> local florist
- `job-interview` -> hiring manager
- `small-talk` -> casual acquaintance

The bridge should prefer the `xaiVoice` query param when creating the realtime session. It should also forward `language`, `country`, and `accent` into provider instructions when those params are present.
