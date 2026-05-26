# Feature Backlog: In-the-Moment → Platform & Habit

Audited against the repo (May 2026). Status key:

| Status | Meaning |
|--------|---------|
| ✅ Done | Shipped and usable |
| 🔧 Partial | Exists but gaps vs. target experience |
| ❌ Todo | Not built |

---

## 1. In-the-moment support

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Panic / block toolkit (FAB) | 🔧 Partial | Web: `src/components/panic-button.tsx` (“Quick Calm” FAB) — box breathing + gentle-onset copy. iOS: `PanicButtonView.swift` / `BoxBreathingView.swift`. Mindfulness: `mindfulness/page.tsx` (2-min calm-down, 4-7-8, box). | No **post-block log**; no **pick-one technique** menu (cancellation, pull-out, voluntary stutter); gentle-onset UI is buried (dialog opens straight into breathing). Consider: log moment → severity, context, what helped. |
| Watch / lock-screen widget | ❌ Todo | Mentioned in `PRODUCT_OUTLINE.md` only. Compact community widgets are in-app, not OS widgets. | Native WidgetKit (iOS) / Glance when mobile wrapper ships. Streak + today’s intention + “2-min rep”. |
| Siri / Shortcuts (“I’m about to speak”) | ❌ Todo | — | iOS App Intents: intention + cue word + optional metronome/DAF for responders. |

---

## 2. Real-world practice

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Speaking calendar → auto micro-plan | ❌ Todo | `presentation-mode/page.tsx` = DAF/metronome presets for live speaking, **not** a calendar. | DB: upcoming events (interview, standup, date). T-3 / T-1 / day-of plan from `personalization` + feared situations + exposure ladder. |
| Micro-challenges with proof | 🔧 Partial | Curriculum micro-challenges (`daily-plans.ts`); `/app/challenges` + `lib/actions/challenges.ts`; community `DailyMicroChallenge`; exposure ladder logs anxiety before/after (`exposure-ladder/page.tsx`). | Unify one flow: optional voice note, did it / avoided / partial, feeds progress + personalization (not honor-system checkbox only). |
| Partner / accountability | ✅ Done | `buddy_pairings` table, `/api/community/buddy`, `AccountabilityBuddy` on community. | Improve real matchmaking (today can simulate buddy); optional share weekly intention with buddy. |
| Location / context reminders | ❌ Todo | Settings notification toggles are **local UI state only** (not persisted / no push). | Smart reminders: “no real-world rep in 4 days”, “event tomorrow” — needs notification backend + user prefs in DB. |

---

## 3. Measurement that feels useful

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Weekly speaking-confidence pulse | 🔧 Partial | `progress/weekly-audit` (%SS reading focus); OASES-S (`oases-check-in-card.tsx`); dashboard check-ins; evening reflection in daily loop. | **30-second** weekly review: top win, top avoidance, one target situation → **auto-set next week’s** exposure + challenge. |
| Stuttering-specific dashboards | 🔧 Partial | Progress page: streaks, XP, assessments, exposure, feared words, OASES, behavioral experiments, transfer-gap analysis. | Hero metrics: **avoidance index**, situations attempted, technique use in the wild, feared-word success — single “how am I doing?” view. |
| Before/after clips (private) | ✅ Done | Monthly assessment (`progress/assess`), `BeforeAfterPrompt`, shareable clinical reports (`ClinicalReport.tsx`, `/report/[token]`). | Optional scripted bi-weekly clip; emphasize self-comparison UX; keep opt-in. |

---

## 4. Personalization & dose

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Adaptive daily plan | ✅ Done | `lib/curriculum/personalization.ts`, `adaptive-engine.ts`, onboarding emphasis profiles. | Shrink plan on skip streaks; “minimum viable day” (see §8). |
| Technique “stack” per user | 🔧 Partial | Emphasis weights (fluency / modification / CBT); technique library + evidence badges. | Surface **“Your 3 go-to techniques”** after ~2 weeks from session + exposure data. |
| DAF/FAF personalized | 🔧 Partial | `daf-responder.ts`, `shouldDeemphasizeDaf()`, Audio Lab helpfulness prompt, day-6+ intro in plans. | Proactive: “DAF helped 4/5 times → suggest before calls” + hide/de-emphasize for non-responders in UI, not only plan filtering. |

---

## 5. AI that earns daily opens

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Scenario library from onboarding | 🔧 Partial | `ai-practice/page.tsx` + `getPrioritizedScenarioIds()`; phone + conversation scenarios. | Generate scenarios from **feared situations + feared words** dynamically; not only static list reorder. |
| Debrief after AI call | 🔧 Partial | `performance-report.tsx`, Harrison coaching context in `harrison-observations.ts`. | Structured debrief: avoidance? → **create tomorrow’s micro-challenge** in DB. |
| AI scope + SLP escalation | 🔧 Partial | Prompts: not a clinician (`xai/voice.ts`); `/app/find-slp`. | In-product escalation when distress/avoidance flags high (CBT trap detection → find SLP CTA). |

---

## 6. Cognitive & acceptance

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Avoidance map | ✅ Done | **Exposure ladder** (`exposure-ladder/page.tsx`, `lib/exposure/exposure-ladder.ts`) — rungs, anxiety logging, unlock levels. | Optional visual “map” of avoided contexts from onboarding; link ladder ↔ feared situations. |
| Values-based goals | 🔧 Partial | Onboarding goals; mindset / behavioral experiments. | Ongoing **values** framing (“speak up in meetings because…”) tied to weekly plan, not one-time onboarding. |
| Shame / identity modules | 🔧 Partial | Learn modules (`learn/page.tsx`); mindset, thought records, traps. | Short dedicated **identity & stigma** track (5-min modules) with evidence badges. |

---

## 7. Professional & community

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| SLP share pack | 🔧 Partial | Shareable assessment reports (`ClinicalReport`, weekly audit share); research self-export (`research-export` API, consent in settings). | One-click **SLP-facing PDF**: streak, OASES trend, exposures, techniques — distinct from de-identified research CSV. |
| Moderated wins feed | ✅ Done | Community: `i-did-it-wall`, victories API, `community/page.tsx`, reporting routes. | Continue moderation tooling; structured win templates. |
| Group practice rooms | ❌ Todo | — | Scheduled 15-min voice rooms; ground rules; premium or cohort feature. |

---

## 8. Platform & habit mechanics

| Item | Status | What exists | Gap / next step |
|------|--------|-------------|-----------------|
| Offline-first daily rep | ❌ Todo | OASES card notes local save when logged out; no service worker / offline session bundle. | Cache today’s audio + technique text; queue completions for sync. |
| Notification intelligence | 🔧 Partial | Settings toggles (daily / weekly / new exercises) — **not wired to push or DB**. Resend used for trial/billing email only. | Persist prefs; web push or SMS practice reminders; contextual copy (event tomorrow, no real-world rep). |
| Gentle streak rules | 🔧 Partial | `streak_freeze_tokens`, auto-consume on 2–3 day gap (`api/user/stats`), community streak shields. | Explicit **minimum viable day** (e.g. 60s counts); recovery UX after lapse; optional streak freeze UI on dashboard. |

---

## Implementation status (May 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| Quick Calm + moment log | ✅ Shipped | `panic-button.tsx`, `moment_logs` table, server actions |
| Speaking calendar | ✅ Shipped | `/app/speaking-calendar`, auto micro-plan JSON |
| Unified micro-challenge | ✅ Shipped | `/app/challenges`, `micro_challenge_attempts` |
| 30-sec weekly review | ✅ Shipped | Progress card, `weekly_reviews`, `nextWeekPlan` in profile |
| Notifications DB + cron | ✅ Shipped | `user_notification_prefs`, `/api/cron/practice-reminders` |
| SLP share pack PDF | ✅ Shipped | Settings button, `/api/user/slp-export` |
| OS widgets + Siri | 🔧 Partial | iOS `StreakWidget.swift`, `QuickCalmIntent.swift` — add Widget target in Xcode |
| Offline daily bundle | 🔧 Partial | `sw.js`, `/api/offline/daily-bundle`, localStorage cache |
| Group practice rooms | 🔧 Partial | `/app/practice-rooms` — scheduling only; no live A/V yet |

**Migration:** run `npx drizzle-kit push` or apply `0006_feature_suite.sql` on Neon.

**Cron:** `POST /api/cron/practice-reminders` with `Authorization: Bearer $CRON_SECRET` (hourly).

---

## Suggested build order (net-new / high-impact)

1. **Enhance Quick Calm** — technique picker + post-block log (small diff, high daily use).
2. **Speaking calendar → micro-plan** — connects program to real life.
3. **Unified micro-challenge completion** — exposure ladder quality bar + dashboard entry.
4. **Weekly 30-sec review → next week plan** — closes the measurement loop.
5. **Notification prefs + smart reminders** — backend + DB first, then push/SMS.
6. **SLP share pack PDF** — hybrid care without building full clinician portal.
7. **OS widgets + Shortcuts** — with iOS app maturity.
8. **Offline session bundle** — when mobile usage justifies it.
9. **Group practice rooms** — after community retention proves out.

---

## Already shipped (do not re-build)

- Quick Calm FAB (web + iOS)
- Daily practice loop + 90-day curriculum
- Techniques + evidence badges
- AI practice + prioritized scenarios
- Feared words
- Exposure ladder (avoidance hierarchy)
- Mindset / CBT / behavioral experiments
- OASES check-ins
- Monthly reading assessment + before/after
- Community wins + accountability buddy + micro-challenges (community)
- Streak freezes / shields
- DAF responder tracking + Audio Lab
- Research export (consent-based)
- Presentation mode (audio tools for live speaking, not calendar)
