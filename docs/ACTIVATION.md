# StutterLab Activation Definition (Day 1 → Day 7)

This is the single source of truth for what "an activated user" means and which
PostHog events measure it. Event names live in `src/lib/analytics.ts` (`EVENTS`).

## North Star

**Weekly Practicing Users (WPU)** — users who complete ≥3 practice sessions in a
rolling 7-day window. Everything below exists to convert signups into WPUs,
because WPUs are who convert to paid and who retain.

## The Aha Moment (Day 1)

> The user speaks aloud, gets objective AI feedback on their speech, and sees a
> concrete next step — within **10 minutes of signup**.

Not reading content. Not browsing features. **Speaking and being measured.**
DAF is the strongest candidate for the magic moment: it produces an immediate,
visceral fluency change in the first session. The Day-1 flow should funnel new
users into either a DAF reading session or a short AI conversation.

## Activation Milestones

| Milestone | Definition | Event | Target window |
|---|---|---|---|
| M0 Signup | Account created | `signup_completed` | — |
| M1 Setup | Onboarding finished (treatment path chosen) | `onboarding_completed` | Day 0 |
| M2 Aha | First practice session started (DAF, AI convo, or exercise) | `first_practice_started` | Day 0, <10 min from signup |
| M3 Proof | First practice completed w/ feedback shown | `practice_completed` (first) | Day 0–1 |
| M4 Habit seed | 3 practice sessions completed | `practice_completed` ×3 | Day 0–7 |
| M5 Streak | 3-day streak reached | `streak_day_reached` (day=3) | Day 0–7 |

**Activated user = M4 within 7 days of signup.**

## Funnel Targets (initial benchmarks — revise with real data)

- M0 → M1 (onboarding completion): **≥80%**
- M1 → M2 (same-session first practice): **≥60%**
- M2 → M3 (complete first session): **≥75%**
- M3 → M4 (3 sessions in week 1): **≥35%**
- Day-7 retention of activated users: **≥50%**

## Monetization checkpoints

| Event | Fires when |
|---|---|
| `paywall_viewed` | PremiumGate blocks a feature |
| `checkout_started` | Stripe checkout opened |
| `subscription_activated` | Webhook confirms payment |

Key analysis: paywall conversion **by activation status**. Expect activated
users (M4) to convert at a multiple of non-activated users — that ratio
justifies investing in activation before investing in paywall tuning.

## Instrumentation status

- ✅ PostHog client initialized (`src/components/analytics/posthog-provider.tsx`)
- ✅ Pageviews + user identification (App Router-aware)
- ✅ Event taxonomy defined (`src/lib/analytics.ts`)
- ⬜ Wire `track(EVENTS.ONBOARDING_COMPLETED)` at end of onboarding flow
- ⬜ Wire `track(EVENTS.FIRST_PRACTICE_STARTED / PRACTICE_COMPLETED)` in practice surfaces (DAF reading, AI practice, exercises)
- ⬜ Wire paywall + checkout events in `PremiumGate` and Stripe checkout
- ⬜ Server-side `subscription_activated` from Stripe webhook (needs `posthog-node`)
- ⬜ Build the PostHog funnel dashboard (M0→M4) + WPU insight

## Weekly review ritual

Every Monday, look at exactly four numbers: signups, % activated (M4),
WPU count, paywall→paid conversion. If activation is below target, fix the
Day-0 flow before touching anything else.
