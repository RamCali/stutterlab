# StutterLab Product Outline

> **Target:** Adults 18+ who stutter. Web app (Next.js). SLP-designed.
> **Core insight:** Stuttering treatment works but requires daily practice. No modern app makes that easy.

---

## The Problem

Adults who stutter have evidence-based techniques available (d = 0.75-1.63) but no way to practice daily between SLP sessions. Existing apps (Stamurai, Stutter Stars) lack peer-reviewed validation and modern UX.

## The Product (One Sentence)

A daily speech practice app that gives adults who stutter SLP-designed exercises, an AI coach, and progress tracking — in under 10 minutes a day.

---

## Feature Map: What to Build and When

### MVP (Launch)

These are the minimum features needed to deliver value on day one. Nothing else ships until these work well.

| # | Feature | What It Does | Why It's Essential |
|---|---------|-------------|-------------------|
| 1 | **Onboarding (4 screens)** | Who is this for? / Severity / Goals / Personalized plan | Tailors experience; captures user profile |
| 2 | **Daily Practice (4 steps)** | Morning check-in, technique exercise, real-world challenge, evening reflection | The core loop. This IS the product. |
| 3 | **Technique Library** | 6-8 guided exercises: easy onset, light contact, prolonged speech, pausing, cancellations, pull-outs | Evidence-based content (d = 0.75-1.63). Text + audio. |
| 4 | **Streak Tracker** | Daily streak counter with calendar view | #1 retention mechanic across all comparable apps |
| 5 | **Evidence Badges** | Each technique shows its evidence level and citation | Core differentiator. Builds trust. |
| 6 | **Progress Dashboard** | Simple charts: days practiced, self-rated confidence over time | Users need to see improvement |
| 7 | **Auth + Profile** | Sign up / log in, basic profile (age, severity, goals) | Required infrastructure |
| 8 | **Paywall** | Hard paywall with 7-day free trial. Full access during trial, then $9.99/mo or $59.99/yr | Revenue from day one |

**MVP scope: 4 screens (onboarding) + 4 tabs (Home, Practice, Progress, Profile). That's it.**

### V1.1 (Month 2-3)

Add only after MVP is stable and users are retaining.

| # | Feature | Why Now |
|---|---------|---------|
| 9 | **AI Speech Coach** | Chat companion for situational advice. High user expectation. Uses Claude API with SLP-designed system prompt. |
| 10 | **Panic Button** | Breathing exercise + quick technique when user is mid-block. Accessible from anywhere via FAB. |
| 11 | **Push notifications** | Practice reminders. "Time for your 5-minute practice." |
| 12 | **Audio-guided exercises** | Professional voice recordings for each technique. Users want to listen, not read. |

### V2 (Month 4-6)

| # | Feature | Why Later |
|---|---------|-----------|
| 13 | **Community feed** | "Wins" sharing. Needs moderation system, content policy, and enough users to feel alive. |
| 14 | **Speaking Calendar** | Log upcoming scary events (interviews, presentations). Coach prepares you. |
| 15 | **Widgets** | Home screen streak + daily tip. Passive retention. Requires native wrapper (Capacitor/PWA). |
| 16 | **Dark mode** | Quality-of-life. Evening practice sessions. |

### V3+ (Future / Only If Validated)

These are ideas from research, NOT commitments. Only build if user data supports them.

| Feature | Condition to Build |
|---------|--------------------|
| Audio Lab (DAF/FAF) | Mixed evidence. Only if users request it AND we can show individual benefit. |
| SLP/Clinician dashboard | Only if SLP referral pipeline is active |
| Family plan / Kids mode | Only if preschool parent segment grows |
| Video technique demos | Only if text + audio completion rates are low |
| Speech Trivia / gamification | Only if retention drops below target |
| Hourly affirmation widgets | Only if basic widget drives measurable engagement |
| Podcast-style lessons | Only if blog/content marketing is working |
| Bedtime wind-down | Only if evening usage pattern exists in data |
| Send Encouragement cards | Only if community feature has traction |
| Multiple theme skins | Cosmetic. Only after core UX is polished. |
| Offline access | Only if users report connectivity issues |
| Lifetime pricing tier | Only after annual subscription conversion is healthy |

---

## What We Are NOT Building at Launch

Saying no to these keeps the app lean:

- No kids/preschool mode (adults 18+ only at launch)
- No SLP dashboard
- No DAF/FAF audio lab (mixed evidence, complex to build)
- No community features (needs critical mass)
- No widgets (needs native wrapper)
- No video content
- No multiple skins/themes
- No gamification beyond streaks

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 + React 19 | Already set up. App Router. |
| Styling | Tailwind 4 + shadcn/ui | Already set up. Dark theme ready. |
| Database | Neon.tech (Postgres) + Drizzle ORM | Already set up. Serverless. |
| Auth | NextAuth.js or Clerk | Standard. |
| AI Coach | Claude API (Sonnet) | Fast, SLP system prompt, affordable. |
| Payments | Stripe | Web billing. Subscription + trial. |
| Hosting | Vercel | Zero-config with Next.js. |

---

## Database Entities (MVP)

```
User         → id, email, name, age_group, severity, goals, created_at
Technique    → id, name, description, evidence_level, effect_size, citation, audio_url
DailyPlan    → id, user_id, date, step_1_done, step_2_done, step_3_done, step_4_done
CheckIn      → id, user_id, date, confidence_rating (1-10), intention, reflection
Streak       → id, user_id, current_streak, best_streak, last_practice_date
Subscription → id, user_id, stripe_id, plan, status, trial_end
```

---

## Screens (MVP)

```
Onboarding:     /onboarding          (4-step wizard)
Home:           /dashboard           (today's 4 steps + streak)
Practice:       /practice/[id]       (guided technique exercise)
Progress:       /progress            (charts + streak calendar)
Profile:        /profile             (settings, subscription, evidence prefs)
Paywall:        /upgrade             (free vs premium comparison)
```

**4 bottom nav tabs:** Home | Practice | Progress | Profile

---

## Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| D1 retention | >40% | Users come back the next day |
| D7 retention | >20% | Habit is forming |
| D30 retention | >10% | Daily practice is sticking |
| Avg streak length | >7 days | Core loop works |
| Trial-to-paid conversion | >5% | Paywall is effective |
| Avg session time | 5-10 min | Right dose — not too long |

---

## Document Index

| File | Contents |
|------|----------|
| [BRANDING.md](BRANDING.md) | Colors, typography, spacing, elevation, UI components, voice & tone |
| [MARKETING.md](MARKETING.md) | SEO, keywords, channels, physical outreach, partnership targets |
| [EVIDENCE_BASED_PRACTICES.md](EVIDENCE_BASED_PRACTICES.md) | Treatment efficacy table, evidence by age group, onboarding notes |
| [stuttering-treatment-evidence.md](stuttering-treatment-evidence.md) | Full research references (25 citations) |
| [app-inspiration.md](app-inspiration.md) | Competitive analysis, UI patterns, design deep dives |
