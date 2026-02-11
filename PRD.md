# StutterLab — Product Requirements Document

**Version:** 1.0
**Date:** February 9, 2026
**Author:** Ram Gangisetty
**Status:** MVP with active development

---

## 1. Product Overview

### Vision
StutterLab is the world's first browser-based, SLP-designed stuttering treatment platform that combines clinical-grade audio therapy (DAF/FAF), AI-powered conversation practice, and a structured 90-day curriculum — making evidence-based stuttering treatment accessible 24/7 without downloads, waiting rooms, or $150-250/session SLP fees.

### Tagline
**"The Science of Happy Talking"**

### Target Audience
- **Primary:** Adults (18+) who stutter seeking daily practice tools between SLP sessions or as standalone treatment
- **Secondary:** Speech-Language Pathologists (SLPs) looking for a patient practice platform with progress visibility
- **Tertiary:** Parents of children who stutter (future roadmap)

### Problem Statement
- 70+ million people worldwide stutter (~1% of the global population)
- Stuttering treatment works but requires daily practice (20-30 min/day)
- Private SLP sessions cost $150-250 each; most insurance provides limited coverage
- No modern app makes daily structured practice easy, measurable, and engaging
- Existing tools offer isolated features (just DAF, or just exercises) — none combine the full treatment stack

### Solution
A comprehensive web platform that gives users their "SLP in their pocket" — combining:
1. Browser-based audio therapy (DAF, FAF, Choral Speaking, Metronome)
2. AI conversation simulators for real-world scenario practice
3. A structured 90-day curriculum progressing from foundation to mastery
4. Gamification (XP, streaks, achievements, challenges) for habit formation
5. Clinical progress tracking with standardized %SS assessments
6. CBT/Mindfulness tools for speech anxiety management
7. Community features for peer support and accountability

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 with Turbopack |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM v0.45 |
| Auth | NextAuth.js v4.24 (Google, GitHub, Discord, Microsoft, Email/Password) |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| Payments | Stripe (subscriptions, embedded checkout, customer portal) |
| Audio | Web Audio API (native — no external audio libraries) |
| Charts | Recharts v3.7 |
| PDF | jsPDF |
| Blog | MDX via gray-matter + reading-time |
| Hosting | Vercel |
| Validation | Zod v4.3 |

---

## 3. Information Architecture

### Route Groups
| Group | Purpose | Layout |
|-------|---------|--------|
| `(app)` | Logged-in user experience | Program sidebar + mobile week nav |
| `(marketing)` | Public-facing pages | Marketing header + footer |
| `(auth)` | Login/signup flows | Minimal auth layout |

### App Pages (`/src/app/(app)/`)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Home Dashboard | "Day N of 90" greeting, phase timeline, today's task checklist, milestone countdown, week progress strip, north star goal |
| `/ai-practice` | AI Simulator Grid | 9 scenario cards (phone call, job interview, ordering food, class presentation, small talk, shopping, asking directions, customer service, meeting intro) with usage gating |
| `/ai-practice/[scenario]` | AI Conversation | Text or voice mode conversation with Claude. Real-time voice analysis, live coach overlay, performance report on end. Saves XP + session data |
| `/audio-lab` | Audio Lab | DAF (0-300ms delay), FAF (pitch shift ±12 semitones), Choral Speaking, Metronome (40-208 BPM). Saveable presets. Real-time input level visualization |
| `/exercises` | Exercise Library | Filterable grid of guided exercises (reading, gentle onset, light contact, prolonged speech, breathing, pausing, cancellation, pull-out, prep set, voluntary stuttering, tongue twisters, phone number reading). Difficulty levels, duration, premium badges |
| `/techniques` | Technique Library | 6 fluency shaping + 6 stuttering modification techniques with descriptions, when-to-use guidance, and evidence citations |
| `/learn` | Learning Modules | Educational content about stuttering science, brain & speech, technique deep-dives. Premium modules gated |
| `/feared-words` | Feared Words Dashboard | Add/manage trigger words, track mastery progress, phoneme analysis. Synced to DB |
| `/feared-words/practice/[wordId]` | Word Practice | Targeted desensitization for individual feared words |
| `/mindfulness` | Mindfulness & CBT Hub | Breathing exercises (4-7-8, Box, Diaphragmatic), Pre-Speaking Toolkit (2-min calm down, pre-presentation, phone call prep), Guided Meditations, CBT exercises (thought records, cognitive distortions, anxiety ladder) |
| `/mindset` | CBT Thought Records | Create/review thought records, behavioral experiments, prediction testing |
| `/mindset/traps` | Thinking Traps | Cognitive distortion identification and reframing |
| `/mindset/new-thought` | New Thought Record | CBT thought record creation form |
| `/mindset/predictions/[id]` | Prediction Testing | Anxiety prediction vs. reality tracking |
| `/shadowing` | Shadowing Practice | Listen-and-repeat exercises with scoring (rhythm, technique, pace). Earn stars + XP |
| `/practice` | Daily Practice Hub | Central practice session launcher tied to daily plan tasks |
| `/progress` | Progress Dashboard | Session history, fluency trends, technique breakdown, anxiety before/after charts, streak stats, XP progression, feared words mastery. Real data from DB |
| `/progress/assess` | Monthly Assessment | Standardized reading passage with %SS scoring, severity rating, fluency score. Generates shareable PDF report |
| `/progress/report` | Performance Report | Detailed coaching insights, speaking rate trends, XP breakdown, technique effectiveness |
| `/voice-journal` | Voice Journal | Record + transcribe speech samples, emotional tagging, disfluency mapping, fluency scoring |
| `/challenges` | Daily Challenges | 15 real-world missions (phone calls, social interactions, ordering, presentations) with XP rewards, difficulty levels, and actionable tips |
| `/community` | Community Hub | Posts (techniques, wins, support, Q&A, resources), "I Did It" victory wall, accountability buddy pairing, community challenges |
| `/find-slp` | Find an SLP | Directory to browse and connect with Speech-Language Pathologists |
| `/settings` | User Settings | Profile, subscription management, preferences, theme toggle |

### Marketing Pages (`/src/app/(marketing)/`)

| Route | Page | SEO Target |
|-------|------|------------|
| `/` | Landing Page | Brand + conversion |
| `/stuttering-treatment` | Treatment Guide | "stuttering treatment" (3K monthly searches) |
| `/stuttering-therapy-app` | App Comparison | "stuttering therapy app", "best stuttering app" |
| `/ai-stuttering-therapy` | AI Therapy | "AI stuttering therapy", "AI speech analysis" |
| `/speech-therapy-for-stuttering` | Therapy Guide | "speech therapy for stuttering" (13.5K monthly) |
| `/stuttering-exercises` | Exercise Guide | "stuttering exercises", "fluency exercises" |
| `/blog` | Blog Index | Content marketing hub |
| `/blog/[slug]` | Blog Post | Long-tail keywords per article |
| `/pricing` | Pricing Page | Plan comparison |
| `/about` | About Page | Team, mission, company story |
| `/for-slps` | SLP Partnership | SLP referral channel |

### API Routes (`/src/app/api/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai-conversation` | POST | Claude-powered AI conversation for practice scenarios |
| `/api/analyze-speech` | POST | AI speech analysis (disfluency detection, fingerprinting) |
| `/api/assess-reading` | POST | Clinical reading passage assessment with %SS scoring |
| `/api/score-shadowing` | POST | Score shadowing attempt (rhythm, technique, pace) |
| `/api/shadowing` | GET | Get shadowing clips and content |
| `/api/tts` | POST | Text-to-speech for choral speaking content |
| `/api/cbt/*` | CRUD | Thought records, predictions, behavioral experiments |
| `/api/community/*` | CRUD | Posts, comments, victories, buddy pairings, challenges |
| `/api/feared-words/*` | CRUD | Feared word management and practice tracking |
| `/api/report/*` | GET/POST | Monthly clinical reports, shareable PDF generation |
| `/api/user/onboarding` | GET/POST | Onboarding data persistence (treatmentPath JSONB) |
| `/api/stripe/checkout` | POST | Create Stripe checkout session (accepts plan + interval) |
| `/api/stripe/webhook` | POST | Handle Stripe events (subscription lifecycle) |
| `/api/stripe/portal` | GET | Redirect to Stripe customer portal |
| `/api/stripe/session-status` | GET | Verify checkout completion |

---

## 4. Core Features

### 4.1 Onboarding / Speech Assessment (8 Steps)

Users complete an 8-step "Speech Assessment" that produces personalized severity and confidence scores, determines their stuttering profile, and customizes their 90-day program emphasis.

| Step | Screen | Data Collected |
|------|--------|----------------|
| 0 | Welcome + Name | `name` |
| 1 | Severity + Stuttering Types | `severity` (mild/moderate/severe), `stutteringTypes` (blocks, repetitions, prolongations, interjections) |
| 2 | Confidence Rating | `confidenceRatings` — rate 8 situations 1-5 (phone calls, ordering food, job interviews, presentations, small talk, asking directions, doctor appointments, meeting new people) |
| 3 | Feared Situations | `fearedSituations` — select from predefined list |
| 4 | Feared Words | `fearedWords` — enter specific trigger words |
| 5 | Avoidance Behaviors + Speaking Frequency | `avoidanceBehaviors` (word substitution, avoiding phone calls, etc.), `speakingFrequency` |
| 6 | Speech Goals / North Star | `goals` — user's personal speaking goal |
| 7 | Results Screen | Displays: severity score (1-100), confidence score (1-100), profile type, personalized 90-day roadmap preview, "Begin Your Program" CTA |

**Scoring Algorithm** (`src/lib/onboarding/scoring.ts`):
- **Severity Score (1-100):** Base from self-report (mild=25, moderate=50, severe=75), adjusted by stuttering types count, avoidance behaviors, speaking frequency
- **Confidence Score (1-100):** Average of situation confidence ratings (1-5) scaled to 0-100
- **Profile Types:** `avoidance-heavy` | `anxiety-heavy` | `technique-ready` | `balanced`
- **Recommended Emphasis:** Weights for fluency shaping vs. stuttering modification vs. CBT

**Storage:** localStorage (client) + `profiles.treatmentPath` JSONB column (server)

---

### 4.2 90-Day Curriculum System

The structured program is the product's backbone — 90 daily plans across 5 phases, progressing from breathing fundamentals to real-world mastery.

#### Phase Structure

| Phase | Days | Label | Focus |
|-------|------|-------|-------|
| 1 | 1-14 | Foundation | Breathing, gentle onset, basic DAF exposure |
| 2 | 15-30 | Building Blocks | Light contact, prolonged speech, FAF introduction, feared words |
| 3 | 31-50 | Technique Integration | Cancellation, pull-out, choral speaking, AI conversation intro |
| 4 | 51-70 | Real-World Practice | Phone simulators, job interviews, advanced feared words, anxiety toolkit |
| 5 | 71-90 | Mastery & Maintenance | All techniques mixed, presentations, SLP connection, community mentoring |
| 6 | 91+ | Adaptive Maintenance | Personalized plans based on technique outcome data — infinite continuation |

#### Daily Plan Structure
Each day includes 5-8 tasks with:
- **Title + Subtitle** (e.g., "Breathing Warmup — 4-7-8 Breathing (3 min)")
- **Duration** (2-15 min per task, ~25 min total)
- **Type** (warmup, exercise, audio-lab, journal, ai, mindfulness, learn, challenge, feared-words)
- **Navigation link** (routes to the appropriate feature page)
- **Premium flag** (some tasks require paid subscription)
- **Daily affirmation** (20 neuroscience-backed messages, rotating)

#### Week Mapping (`src/lib/curriculum/weeks.ts`)
- Days 1-90 → Weeks 1-13 (7 days each, Week 13 = 6 days)
- Week titles and milestones for each week
- `getWeekForDay()`, `getDaysForWeek()`, `getAllWeeks()`, `getWeeksByPhase()`, `getNextMilestone()`

#### Adaptive Engine (Phase 6+)
- Analyzes user's `techniqueOutcomes` table (last 30 sessions)
- Computes per-category stats (fluency shaping vs. modification)
- Generates weighted daily plans favoring the user's most effective approach
- Maintains engagement with increasing difficulty

---

### 4.3 Audio Lab

Browser-based audio processing combining 4 clinical tools via the Web Audio API:

| Tool | Description | Controls |
|------|-------------|----------|
| **DAF** (Delayed Auditory Feedback) | Delays the user's voice by 50-300ms, proven to reduce stuttering up to 80% | Enable/disable, delay slider (ms) |
| **FAF** (Frequency-Altered Feedback) | Shifts pitch by ±12 semitones, triggers the "choral effect" | Enable/disable, semitone slider |
| **Choral Speaking** | AI voice reads text simultaneously with the user | Enable/disable, voice selection |
| **Metronome** | Rhythmic pacing at 40-208 BPM for speech rate control | Enable/disable, BPM slider |

**Audio Engine** (`src/lib/audio/AudioEngine.ts`):
- Web Audio API graph: Microphone → AnalyserNode → DelayNode (DAF) → GainNode → output
- Real-time input level visualization
- Saveable presets stored in `audioLabPresets` table

---

### 4.4 AI Situation Simulators

9 real-world conversation scenarios powered by Claude API:

| Scenario | Difficulty | Phone Sim |
|----------|------------|-----------|
| Phone Call | Hard | Yes |
| Job Interview | Hard | No |
| Ordering Food | Medium | No |
| Class Presentation | Hard | No |
| Small Talk | Easy | No |
| Shopping / Returns | Medium | No |
| Asking Directions | Easy | No |
| Customer Service Call | Hard | Yes |
| Meeting Introduction | Medium | No |

**Two Modes:**
1. **Text Mode:** Traditional chat interface with Claude
2. **Voice Mode:** Real-time voice conversation with speech analysis
   - `VoiceConversation` class manages mic input → transcription → Claude → TTS
   - `LiveCoachOverlay` provides real-time technique reminders based on AnalyserNode data
   - Turn-by-turn metrics: disfluency count, speaking rate, techniques used, vocal effort

**Usage Limits:**
- Free/Core: 0 simulations (locked)
- Pro: 1 simulation per week (resets Monday)
- Elite/SLP: Unlimited

**Post-Session:**
- Performance report with coaching insights, rate trend, XP earned
- Session persisted to `aiConversations` table via `saveAIConversation()` server action
- XP awarded (30 base + duration bonus)

---

### 4.5 Gamification System

#### XP & Leveling
| Action | XP |
|--------|-----|
| Exercise complete | 15 (+5 per 10 min) |
| AI conversation | 30 (+duration bonus) |
| Daily challenge | 75 |
| Weekly challenge | 150 |
| Voice journal | 15 |
| Feared word practice | 10 |
| Thought record | 15 |
| Daily plan complete | 50 |
| Streak bonus | 5/day |

**13 Levels:** Beginner (0 XP) → Practitioner → Fluent → Confident → Master → Expert → Guardian → ... (infinite progression, ~500 XP per level after Level 7)

#### Streaks
- `currentStreak` / `longestStreak` tracked in `userStats`
- Resets on missed day (unless streak freeze token used)
- Streak freeze: Premium-only, up to 3 per month
- Displayed in sidebar + mobile header (real data from DB)

#### Achievements (22 total)
Categories: Getting Started (3), Streaks (5), Milestones (14)
Examples: First Steps, Double Digits, Dedicated (7-day streak), On Fire (30-day), Legendary (100-day), Phone Master, Fear Conqueror, Mindset Champion

#### Daily Challenges
- 15 predefined real-world missions in `src/lib/actions/challenges.ts`
- Types: phone call, social interaction, ordering, work presentation, general speaking
- Difficulty: Easy / Medium / Hard with corresponding XP (10-30)
- Actionable tips provided (3-4 per challenge)
- One challenge per day, randomized

---

### 4.6 Feared Words System

- Users add specific words they avoid or struggle with
- Phoneme analysis identifies difficulty patterns
- Practice modes: individual word drills, sentence context, paragraph integration
- Mastery tracking: `practiceCount`, `mastered` boolean, `lastPracticed`
- Synced between localStorage and `fearedWords` DB table
- Analytics: mastery rate, most practiced, phoneme difficulty distribution

---

### 4.7 CBT & Mindfulness

**Breathing Exercises:**
- 4-7-8 Breathing, Box Breathing, Diaphragmatic Breathing
- Pre-Speaking Toolkit: 2-min calm down, pre-presentation, phone call prep
- Animated breathing guide component (`BreathingExercise`)

**Guided Meditation:** (Premium)
- Speaking Confidence, Body Scan for Speech, Self-Acceptance

**CBT Tools:**
- Thought Records: situation → automatic thought → emotions → evidence → balanced thought
- Cognitive Distortion identification (thinking traps)
- Prediction testing: anxiety prediction vs. actual outcome
- Anxiety Ladder: hierarchical feared situation progression
- Synced to `thoughtRecords` and `predictions` DB tables

---

### 4.8 Shadowing Practice

- Listen to model audio clips → repeat with same rhythm/technique
- AI scoring: rhythm match, technique accuracy, pace match → star rating (1-5)
- XP earned per attempt
- Technique-specific clips (gentle onset, prolonged speech, light contact)
- Data stored in `shadowingScores` table

---

### 4.9 Community

- **Posts:** 5 categories (techniques, wins, support, Q&A, resources) with upvotes + comments
- **"I Did It" Victory Wall:** Public celebrations of real-world speaking wins (phone call, meeting, order, presentation, conversation, asked for help)
- **Accountability Buddy:** Anonymous pairing with shared streak visibility
- **Community Challenges:** 30-day collaborative goals with shared XP rewards
- **Micro-Challenge Completions:** Daily quests with technique focus

---

### 4.10 Progress & Clinical Reporting

**Progress Dashboard:**
- Session history (filterable by date range)
- Fluency trend line chart (sessions over time)
- Technique breakdown (fluency shaping vs. modification effectiveness)
- Anxiety before/after comparison chart
- Streak stats + XP progression
- Feared words mastery rate

**Monthly Clinical Assessment:**
- Standardized reading passage
- %SS (percent stuttered syllables) calculation
- Severity rating: normal / mild / moderate / severe
- Speaking rate (syllables per minute)
- Fluency score (0-100)
- Shareable PDF report via unique `shareToken`
- Historical comparison across months

**Analytics (Premium):**
- AI conversation insights (scenario performance, disfluency trends)
- Feared words mastery analytics
- Anxiety trend analysis over time

---

## 5. Database Schema

### Tables (25 total)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, name, email, role (user/slp) |
| `profiles` | Extended user data | userId, treatmentPath (JSONB), displayName, avatarUrl, stutteringSeverity, goals |
| `subscriptions` | Stripe subscriptions | userId, stripeCustomerId, plan (free/core/pro/elite/slp), status, currentPeriodEnd |
| `sessions` | Practice sessions | userId, exerciseType, toolsUsed, selfRatedFluency, aiFluencyScore, confidenceBefore/After |
| `exercises` | Exercise catalog | title, type, technique, difficulty, instructions, contentJson, isPremium |
| `exerciseCompletions` | Completion records | userId, exerciseId, xpEarned, aiFeedback |
| `techniqueOutcomes` | A/B testing data | userId, category, confidenceDelta, completionRate, selfRatedFluency |
| `aiConversations` | AI practice sessions | userId, scenarioType, messages (JSONB), fluencyScore, disfluencyMoments, durationSeconds |
| `voiceJournalEntries` | Voice recordings | userId, transcription, fluencyScore, emotionalTag, disfluencyMap |
| `speechAnalyses` | Speech fingerprints | userId, speakingRate, stutteredSyllablesPercent, stutterFingerprintJson |
| `userStats` | Gamification hub | userId, currentStreak, longestStreak, totalXp, level, achievements (JSONB), currentDay |
| `fearedWords` | Trigger word tracking | userId, word, phoneme, difficulty, practiceCount, mastered |
| `thoughtRecords` | CBT records | userId, situation, automaticThought, emotions (JSONB), balancedThought |
| `predictions` | Anxiety testing | userId, prediction, anxietyBefore/After, actualOutcome |
| `speechSituations` | Real-world logging | userId, situationType, anxietyBefore/After, fluencyRating, techniquesUsed |
| `communityPosts` | Forum posts | userId, category, title, content, upvotes, commentCount |
| `communityComments` | Post comments | postId, userId, content |
| `communityVictories` | "I Did It" wall | userId, victoryType, description, celebrateCount |
| `buddyPairings` | Accountability pairs | userAId, userBId, sharedStreak, status |
| `communityChallenges` | Group challenges | title, targetValue, currentValue, xpReward, participantCount |
| `monthlyReports` | Clinical assessments | userId, percentSS, severityRating, fluencyScore, analysisJson, shareToken |
| `shadowingScores` | Shadowing results | userId, clipId, overallScore, rhythmMatch, techniqueAccuracy, stars, xpEarned |
| `audioLabPresets` | Saved audio configs | userId, name, dafEnabled, dafDelayMs, fafEnabled, fafSemitones, metronomeBpm |
| `slpConnections` | SLP-patient links | slpUserId, patientUserId, status, assignedExercises |
| `microChallengeCompletions` | Daily quest records | userId, challengeDate, challengeTitle, xpEarned |

---

## 6. Authentication & Authorization

### Authentication
- **NextAuth.js v4.24** with Drizzle ORM adapter
- **OAuth Providers:** Google, GitHub, Discord, Microsoft
- **Email/Password:** With verification tokens
- **Session:** Server-side with JWT tokens

### Authorization Matrix

| Feature | Free | Premium (Core/Pro/Elite) | SLP |
|---------|------|--------------------------|-----|
| Dashboard + Curriculum | Full | Full | Full |
| Audio Lab | DAF only | Full (DAF+FAF+Choral+Metronome) | Full |
| Exercises | 3/day (free tier) | Unlimited + premium exercises | Full |
| AI Simulators | Locked | Pro: 1/week, Elite: Unlimited | Unlimited |
| Learning Modules | Module 1-5 | All modules | All |
| Feared Words | Full | Full | Full |
| Mindfulness/Breathing | Free exercises only | All + guided meditations + CBT | Full |
| Community | Read-only | Full (post, comment, buddy, challenges) | Full |
| Monthly Assessment | Locked | Full with PDF export | Full |
| Analytics Dashboard | Basic | Advanced (AI insights, feared words mastery, anxiety trends) | Full |
| Voice Journal | Limited | Full | Full |
| Challenges | View only | Full with XP rewards | Full |

### Premium Gating Implementation
- `PremiumGate` component: wraps protected content with `requiredPlan` + `currentPlan` props
- Upgrade CTA with embedded Stripe checkout (monthly/yearly toggle)
- `checkAISimUsage()` server action for AI simulation rate limiting
- `hasMinPlan(userId, minPlan)` utility for server-side checks

---

## 7. Stripe Integration & Pricing

### Pricing Model

| Plan | Monthly | Yearly | AI Sims |
|------|---------|--------|---------|
| Free | $0 | $0 | 0 |
| Premium | $99/mo | $999/yr (save $189) | Unlimited |

### Checkout Flow
1. User clicks upgrade → `PremiumGate` opens `EmbeddedCheckoutDialog`
2. Client sends `POST /api/stripe/checkout` with `{ interval: "month" | "year" }`
3. Server creates Stripe checkout session via `createCheckoutSession()`
4. Embedded Stripe form collects payment
5. On success → redirect to `/checkout/return?session_id={id}`
6. Webhook (`POST /api/stripe/webhook`) processes events:
   - `checkout.session.completed` → Insert/update subscription with plan + status
   - `customer.subscription.updated` → Update plan/status/period from Stripe price ID
   - `customer.subscription.deleted` → Set plan=free, status=canceled
7. Subscription management via Stripe Customer Portal

### Environment Variables
```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_PREMIUM_MONTHLY
STRIPE_PRICE_ID_PREMIUM_YEARLY
```

### 7-Day Free Trial
- All new subscribers get 7-day free trial (no credit card required for signup, card required for trial activation)
- Trial status tracked via `subscription.status = "trialing"`
- `getTrialDaysLeft()` utility for trial countdown display

---

## 8. Marketing & SEO Strategy

### Landing Page Conversion Elements
- **Hero:** "Speak Without Fear at Work, on Dates, on the Phone"
- **Stats bar:** 80% reduction with DAF+FAF | 90-day curriculum | 100% browser-based | 24/7 AI
- **8 feature cards** with icons and descriptions
- **3-step "How It Works":** Assessment → Daily Practice → Real Results
- **3 testimonials** (Alex M., James R., Dr. Sarah K. CCC-SLP)
- **Founder story:** Ram Gangisetty, M.S., CCC-SLP with evidence-based credibility
- **Pricing comparison:** "One SLP session = $150-250. StutterLab = $99/month."
- **SLP partnership banner**
- **Final CTA:** "What Would You Say If Stuttering Wasn't in the Way?"

### SEO Strategy
- 5 high-value keyword landing pages with schema.org markup
- Blog content targeting long-tail keywords (exercises, AI therapy, home practice)
- Schema types used: SoftwareApplication, FAQPage, HowTo, MedicalWebPage, WebPage
- OpenGraph + Twitter Card metadata on every page
- Canonical URLs, sitemap.xml, robots.txt

### Content Pillars
1. **Exercises** — DIY guides, technique tutorials, progressions
2. **Treatment** — Therapy approaches, home practice, clinical backing
3. **Technology** — AI in speech therapy, app features, innovation
4. **Personal Stories** — User testimonials, success journeys (future)
5. **Research** — Study summaries, evidence deep-dives (future)

### Published Blog Posts
1. "8 Best Stuttering Exercises You Can Practice Daily" (Exercises)
2. "Can AI Help Stuttering? How AI Is Changing Speech Therapy" (Technology)
3. "Speech Therapy at Home: How to Practice Between Sessions" (Treatment)

---

## 9. Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Obsidian Night | #0B0E14 | Primary background |
| Deep Slate | #1A1F26 | Card surfaces |
| Clarity Teal | #48C6B3 | Primary accent (CTA, links, active states) |
| Sunset Amber | #FFB347 | Secondary accent (warnings, highlights, streaks) |
| Fluency Green | #00E676 | Success states (achievements, completions) |

### Typography
| Element | Font | Weight |
|---------|------|--------|
| Headings | Inter | Bold (700) |
| Body | Roboto | Regular (400) |
| Tagline | Montserrat | Light Italic |

### UI Components (shadcn/ui)
Card, Button (4 variants), Badge (3 variants), Input, Textarea, Select, Switch, Slider, Progress, Tabs, Dialog, Sheet, Dropdown, Tooltip

### Icons
Lucide React — consistent 24px icon set across all UI

### Dark Mode
Enabled by default. Elevation conveyed through white overlay opacity (0-16%) rather than shadows.

---

## 10. Navigation

### Desktop Sidebar (Program Navigator)
```
[Logo: StutterLab]
[Streak 🔥 + XP ⚡ from DB]

Phase 1: Foundation
  ▸ Week 1 ✓ (completed, collapsed)
  ▾ Week 2 (current, expanded)
    Day 8 ✓
    Day 9 ✓
    Day 10 ● (today, highlighted)
    Day 11 🔒
    Day 12 🔒
    Day 13 🔒
    Day 14 🔒
Phase 2: Building Blocks
  ▸ Week 3 🔒
  ...
────────────────────
[Progress]  [Settings]
[Theme Toggle]
```

- Accordion-style weeks grouped by 5 phases
- Current week auto-expanded
- Completed weeks: teal checkmark, expandable for review
- Future weeks: locked, dimmed
- Days link to `/practice?day=N`

### Mobile Navigation
- Horizontal day strip (M-T-W-T-F-S-S) for current week
- Completed = checkmark, current = highlighted ring, future = dimmed
- Bottom action bar: Today's Session | Progress | Settings

---

## 11. Success Metrics

### User Engagement
- DAU/MAU ratio (target: >25%)
- Average session duration (target: 20-30 min)
- Streak maintenance (target: >30% users with 7+ day streaks)
- Feature adoption rates (Audio Lab, AI Practice, Community)

### Clinical Outcomes
- %SS reduction month-over-month
- Fluency score improvement (0-100)
- Confidence rating delta (before vs. after sessions)
- Self-reported quality of life (future survey)

### Business Metrics
- MRR (Monthly Recurring Revenue)
- Free → paid conversion rate (target: >5%)
- Churn rate (target: <8% monthly)
- Trial → paid conversion rate
- LTV/CAC ratio (target: >3:1)

### Retention Targets
- D1: >40%
- D7: >20%
- D30: >10%

---

## 12. Future Roadmap

### Near-Term (Planned / Partially Implemented)
- SLP Dashboard (patient management, exercise assignment, progress monitoring)
- Live Practice Rooms (audio group sessions)
- Weekly/global XP leaderboards
- Push notifications for streak reminders

### Medium-Term
- Native iOS/Android apps (API structure prepared)
- Advanced AI speech fingerprinting with disfluency pattern mapping
- Video analysis (jaw/tongue tension detection)
- Relapse prevention module (post-90-day)

### Long-Term
- Wearable integration (heart rate, stress detection)
- Family plan / Kids mode
- SLP telehealth sessions built into the platform
- Multilingual support
- Research partnerships for clinical validation studies

---

## 13. Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...

# App
NEXT_PUBLIC_APP_URL=https://stutterlab.com
NEXT_PUBLIC_SITE_URL=https://stutterlab.com
```

---

*Document generated from codebase analysis — February 9, 2026*
