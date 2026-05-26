# Daily Practice Backlog

StutterLab is positioned as **daily speech practice** (Headspace-style habit), not a fixed 90-day course.

## Completed

- [x] Product reframe, evidence tiers, marketing audit, personalization, DAF sequencing
- [x] iOS curriculum strings — daily practice positioning (`DailyPlans.swift`, `WeekInfo.swift`)
- [x] Audio Lab: DAF helpfulness prompt + `recordDafPracticeSession()` + mixed-evidence copy
- [x] Evidence badges on all Learn modules (`learn-modules.ts`)
- [x] Behavioral experiments card on Progress + DB (`behavioral_predictions`)
- [x] OASES check-ins: localStorage + DB (`oases_check_ins`) + sync on save
- [x] Cohort / pilot RCT planning doc (`docs/research-cohort-plan.md`)
- [x] Blog MDX dose alignment (`best-stuttering-exercises`, `speech-therapy-at-home`, `can-ai-help-stuttering`)

## Remaining

- [ ] Run migration: `npx drizzle-kit push` (or apply `0005_outcomes_tracking.sql` on Neon)
- [x] Audio Lab: FAF/choral/metronome mixed-evidence badges
- [x] Research export pipeline + consent flag (`Settings → Privacy & Data`, `/api/user/research-export`)
- [ ] Admin/cohort bulk export (aggregate across consented users — future)
