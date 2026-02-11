# StutterLab

AI-guided speech training program for people who stutter — daily practice for smoother, more confident speaking.

## Getting Started

```bash
npm install
cp .env.example .env          # fill in required values
npx drizzle-kit push           # apply schema to database
npm run dev                    # http://localhost:3000
```

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Run tests (Vitest)
- `npm run test:watch` — Tests in watch mode

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Drizzle ORM · Neon PostgreSQL · NextAuth v4 (JWT + Google OAuth) · Stripe · Vitest

**AI**: Anthropic SDK (primary LLM) + OpenAI (Whisper transcription) + ElevenLabs (TTS/choral)

## Architecture

```
src/
├── app/
│   ├── app/            # Logged-in user pages (was (app)/, renamed to avoid Next.js conflicts)
│   ├── (auth)/         # Login, signup, onboarding
│   ├── (marketing)/    # Landing, pricing, blog, SEO pages
│   ├── (slp)/          # SLP clinician portal
│   └── api/            # API routes (see below)
├── components/
│   ├── ui/             # shadcn/ui primitives (New York style)
│   └── [feature]/      # Feature-specific components
├── lib/
│   ├── actions/        # Server actions — all UI data mutations
│   ├── auth/           # NextAuth config, helpers, premium checks
│   ├── curriculum/     # 90-day program plans + week mapping
│   ├── db/             # Drizzle schema + migrations
│   ├── gamification/   # XP, levels, achievements
│   ├── exercises/      # Exercise definitions
│   └── stripe/         # Stripe integration
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

**Server actions vs API routes**:
- **Server actions** (`src/lib/actions/`) — app UI mutations (progress, sessions, XP, feared words, CBT)
- **API routes** (`src/app/api/`) — webhooks (Stripe), external clients (mobile), uploads, TTS, speech analysis

API routes by domain: `ai-coach/`, `ai-conversation/`, `analyze-speech/`, `assess-reading/`, `score-shadowing/`, `speech-analysis/` (AI/speech) · `stripe/`, `webhooks/` (payments) · `community/`, `sessions/`, `exercises/`, `feared-words/`, `cbt/` (data) · `tts/`, `upload/`, `voice-journal/` (media) · `mobile/`, `user/`, `auth/`, `report/`, `shadowing/`, `weekly-audit/`

## Key Conventions

- **Server actions** for all UI data mutations — located in `src/lib/actions/`
- **shadcn/ui** (New York style) for all UI components
- **Path alias**: `@/*` → `./src/*`
- **Styling**: Tailwind v4 with inline `@theme` in `src/app/globals.css` (no tailwind.config file). Dark mode default. Teal primary, amber accents.
- **Fonts**: Inter (headings), Roboto (body), Montserrat (taglines)
- **No Prettier** — ESLint only for linting/formatting
- **JSONB columns** (e.g. `profiles.treatmentPath`) — no schema migration needed when extending fields. Validate JSONB shapes with Zod at read/write boundaries.

## Important Patterns

- `ProgramProvider` context (`src/components/navigation/program-context.tsx`) provides `currentDay` to all app pages
- `getDailyPlan(day)` can return `null` — always guard against it
- `getCurrentDay()` is a server action in `src/lib/actions/user-progress.ts`
- **Onboarding**: localStorage is ephemeral scratch space; DB `profiles.treatmentPath` JSONB is source of truth after account creation
- `src/app/app/layout.tsx` (the main app layout) is a **client component** — it only handles the nav shell (sidebar + mobile nav). Server components within pages handle data fetching to avoid waterfalls.
- Premium: Free + Premium ($99/mo or $999/yr) — gate with `PremiumGate` component

## Database

- **ORM**: Drizzle with Neon serverless PostgreSQL
- **Schema**: `src/lib/db/schema.ts`
- **Migrations**: `src/lib/db/migrations/` via `drizzle-kit`
- **Config**: `drizzle.config.ts`

### Database Workflow

```bash
# After modifying schema.ts:
npx drizzle-kit generate        # generate migration SQL
npx drizzle-kit push            # apply to database (dev)
npx drizzle-kit studio          # browse data in browser
```

## Auth

- NextAuth v4 with JWT sessions and Google OAuth
- Config: `src/lib/auth/config.ts`
- Premium checks: `src/lib/auth/premium.ts`
- Custom pages: `/login` (sign in), `/onboarding` (new users)

## Stripe Workflow

- Embedded checkout via `@stripe/react-stripe-js`
- Webhook handler: `src/app/api/stripe/` and `src/app/api/webhooks/`
- Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_PREMIUM_MONTHLY`, `STRIPE_PRICE_ID_PREMIUM_YEARLY`

## Testing

- Vitest + jsdom
- Tests: `src/__tests__/*.test.ts`
- Setup: `src/__tests__/setup.ts`

## Environment

See `.env.example` for all required variables (DATABASE_URL, NextAuth, Google OAuth, Stripe, OpenAI, ElevenLabs, R2 storage, PostHog, Resend).

## Branding

**Never use "therapy" or "treatment"** when describing StutterLab. Use "program", "training", or "practice" instead.
- OK in clinical context: "Treatment plan design" (what SLPs do), "speech therapist" (referring to the profession)
- NOT OK: "AI therapy", "stuttering treatment app", "DAF therapy"
- The `treatmentPath` DB column is internal — keep as-is, no rename needed

## Deploy

Deployed on **Vercel** with **Neon** PostgreSQL.

1. Push to `main` — Vercel auto-deploys
2. Set all `.env.example` vars in Vercel dashboard
3. Update `NEXTAUTH_URL` to production domain
4. Set Stripe webhook endpoint to `https://yourdomain.com/api/webhooks/stripe`
5. Neon branch per preview deploy (optional)
