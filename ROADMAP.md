# StutterLab — Development Roadmap

## Current Status: UI Prototype (40% complete)

**What's working:**
- Full UI for 18 pages with warm dark theme
- Audio Lab (DAF, Metronome, Choral) — fully functional in-browser
- 90-day curriculum engine generating all daily plans
- Exercise player with step progression and reading mode
- Landing page with $99/year pricing
- Dark mode toggle with localStorage persistence
- Database schema (15 tables, ready for migration)

**What's placeholder/static:**
- All user data is hardcoded (stats, progress, streak = 0)
- Forms don't submit (settings, add feared word, etc.)
- AI features not connected (conversations, speech analysis)
- No authentication — anyone can access everything
- No payment/subscription enforcement
- Community is empty shell
- Voice journal has no recording interface

---

## Phase 1: Foundation (Auth + Database + Core APIs)

### What I Need From You

| Item | Why | How to Get It |
|------|-----|---------------|
| **Neon.tech database URL** | Connect the schema to a real Postgres DB | Create a project at [neon.tech](https://neon.tech), copy the connection string |
| **Google OAuth credentials** | Google sign-in on auth pages | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 |
| **NextAuth secret** | Encrypt session tokens | Run `openssl rand -base64 32` in terminal |

### Tasks
- [ ] Set up `.env` with real Neon database URL
- [ ] Run Drizzle migrations to create all 15 tables
- [ ] Implement NextAuth with Google OAuth + email/password
- [ ] Build auth pages: `/login`, `/signup`, `/forgot-password`
- [ ] Add auth middleware to protect `(app)` and `(slp)` routes
- [ ] Wire up `/api/user/profile` — load/save user profile from DB
- [ ] Wire up Settings page — save display name, notifications, etc.
- [ ] Implement session tracking — start/stop/duration/exercise type
- [ ] Wire dashboard stats to real user data (streak, XP, exercises)

---

## Phase 2: Exercise System + Progress Tracking

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Nothing** | Uses existing DB + frontend | Already have everything needed |

### Tasks
- [ ] Seed exercise library into database (30+ exercises already defined)
- [ ] Build `/api/exercises` — fetch exercises with filters
- [ ] Build `/api/sessions` — create/complete sessions, log XP
- [ ] Wire exercise player to record completions + XP to DB
- [ ] Implement daily plan progress — track which day user is on
- [ ] Wire feared words to DB — add/remove/practice count
- [ ] Wire challenges to DB — daily/weekly with XP rewards
- [ ] Implement streak logic (consecutive days with ≥1 completion)
- [ ] Build progress charts with real session data (Recharts)
- [ ] Implement GitHub-style practice heatmap from real data
- [ ] Wire achievement badge system (50+ achievements)

---

## Phase 3: Voice Recording + Voice Journal

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Cloudflare R2 credentials** | Store audio recordings | [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → Create bucket `stutterlab-recordings` |

**Alternative:** UploadThing (simpler setup, free tier)

### Tasks
- [ ] Build audio recording component (MediaRecorder API)
- [ ] Implement upload to R2/UploadThing
- [ ] Build `/voice-journal/new` page — record, tag emotion, save
- [ ] Wire voice journal timeline to DB
- [ ] Add playback for recorded entries
- [ ] Build fluency trend chart from journal entries
- [ ] Add recording to exercise player (save practice recordings)

---

## Phase 4: AI Features (Speech Analysis + Conversations)

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **OpenAI API key** | Whisper (speech-to-text) + GPT for conversation AI | [platform.openai.com](https://platform.openai.com) → API Keys |
| **OR Claude API key** | Alternative for conversation AI (recommended) | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| **ElevenLabs API key** (optional) | Premium TTS for choral speaking voices | [elevenlabs.io](https://elevenlabs.io) → Profile → API Keys |

### Tasks
- [ ] Build `/api/speech-analysis` — Whisper transcription endpoint
- [ ] Implement disfluency detection algorithm (blocks, prolongations, repetitions)
- [ ] Build Stutter Fingerprint radar visualization from analysis data
- [ ] Build `/api/ai-conversation` — streaming LLM conversation
- [ ] Create AI conversation UI with real-time chat bubbles
- [ ] Build phone call simulator (ring animation → AI voice → conversation)
- [ ] Implement real-time technique reminders during conversations
- [ ] Post-conversation fluency scoring
- [ ] AI-detected feared words (auto-suggest from session analysis)
- [ ] Weekly AI coaching report generation
- [ ] FAF AudioWorklet implementation (real pitch shifting)
- [ ] ElevenLabs integration for premium choral voices (optional)

---

## Phase 5: Payments (Stripe)

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Stripe secret key** | Process subscriptions | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys |
| **Stripe publishable key** | Client-side Stripe.js | Same location |
| **Stripe webhook secret** | Verify webhook events | Stripe Dashboard → Developers → Webhooks → Add endpoint |
| **Create 2 Stripe products** | Pro ($99/yr) and SLP ($79/mo) | Stripe Dashboard → Products → Add product |

### Tasks
- [ ] Build `/api/webhooks/stripe` — handle subscription events
- [ ] Implement Stripe Checkout for Pro tier ($99/year)
- [ ] Implement Stripe Checkout for SLP tier ($79/mo)
- [ ] Build subscription status check middleware
- [ ] Gate premium features (full Audio Lab, AI, unlimited exercises)
- [ ] Build upgrade prompt component (shown when free users hit limits)
- [ ] Handle trial expiration, cancellation, reactivation
- [ ] Add subscription management in Settings page

---

## Phase 6: Community

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Nothing for basic forum** | Uses DB for posts/comments | Already have schema |
| **Ably or Pusher key** (optional) | Real-time practice rooms | [ably.com](https://ably.com) or [pusher.com](https://pusher.com) |

### Tasks
- [ ] Build `/api/community/posts` — CRUD for forum posts
- [ ] Build `/api/community/comments` — threaded comments
- [ ] Implement upvoting + bookmarking
- [ ] Build practice partner matching (by severity, timezone, goals)
- [ ] Build group practice rooms (WebRTC or Ably for audio)
- [ ] Content moderation system (report/flag)
- [ ] User profiles with opt-in stats sharing

---

## Phase 7: SLP Portal

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Daily.co or LiveKit API key** | Telehealth video sessions | [daily.co](https://daily.co) → Get API Key |

### Tasks
- [ ] Build SLP registration + credential verification flow
- [ ] Build SLP dashboard (`/slp/dashboard`)
- [ ] Build patient management — view connected patients
- [ ] Exercise prescription — SLP assigns homework to patients
- [ ] Auto-generated PDF progress reports
- [ ] Telehealth video integration
- [ ] In-session Audio Lab remote control
- [ ] SOAP note templates
- [ ] Appointment scheduling

---

## Phase 8: Polish + Launch

### What I Need From You
| Item | Why | How to Get It |
|------|-----|---------------|
| **Resend API key** | Transactional emails (welcome, reminders) | [resend.com](https://resend.com) → API Keys |
| **PostHog API key** | Analytics + feature flags | [posthog.com](https://posthog.com) → Project Settings |
| **Custom domain** | `stutterlab.com` or similar | Buy domain, add to Vercel |

### Tasks
- [ ] Build onboarding flow (severity assessment → personalized path)
- [ ] Smart notifications (practice reminders via email)
- [ ] SEO optimization (meta tags, OG images, sitemap)
- [ ] PWA support (service worker, offline exercises)
- [ ] Accessibility audit (WCAG 2.1 AA, screen readers, keyboard nav)
- [ ] Error boundaries + loading states
- [ ] Rate limiting on API routes
- [ ] GDPR: data export + account deletion implementation
- [ ] Educational content (write actual lesson content for 10 modules)

---

## API Keys / Services Summary

| Service | Purpose | Cost | Priority |
|---------|---------|------|----------|
| **Neon.tech** | Database | Free tier (0.5 GB) | Phase 1 — REQUIRED |
| **Google OAuth** | Sign in with Google | Free | Phase 1 — REQUIRED |
| **Cloudflare R2** | Audio file storage | Free tier (10 GB) | Phase 3 |
| **OpenAI** | Whisper + GPT | Pay-per-use (~$0.006/min Whisper) | Phase 4 |
| **Stripe** | Payments | 2.9% + $0.30 per transaction | Phase 5 — REQUIRED for revenue |
| **ElevenLabs** | Premium TTS | $5/mo starter | Phase 4 (optional) |
| **Ably/Pusher** | Real-time rooms | Free tier available | Phase 6 (optional) |
| **Daily.co** | Telehealth video | Free tier (10K min/mo) | Phase 7 |
| **Resend** | Email | Free tier (100/day) | Phase 8 |
| **PostHog** | Analytics | Free tier (1M events) | Phase 8 |

---

## Recommended Build Order

**Immediate next step:** Get a Neon.tech database URL so I can wire up auth and real data.

1. **Phase 1** (Auth + DB) — ~2 sessions → App has real users + login
2. **Phase 2** (Exercises + Progress) — ~2 sessions → Core loop works, data persists
3. **Phase 5** (Stripe) — ~1 session → Revenue starts flowing
4. **Phase 3** (Voice Recording) — ~1 session → Voice journal works
5. **Phase 4** (AI) — ~2-3 sessions → Speech analysis + AI conversations
6. **Phase 6** (Community) — ~2 sessions → Forums + practice partners
7. **Phase 7** (SLP Portal) — ~3 sessions → B2B revenue channel
8. **Phase 8** (Polish) — ~2 sessions → Launch ready
