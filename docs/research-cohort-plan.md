# Cohort Study / Pilot Plan (Pre-“Validated Program” Marketing)

StutterLab uses **evidence-based techniques**; the **app protocol** is not yet validated by an independent trial. Do not use “validated program” in marketing until this plan (or equivalent) is completed.

## Primary question

Does adults who stutter using StutterLab for **≥10 min/day over 12 weeks** show clinically meaningful change on self-reported impact and structured speech samples, compared to waitlist or treatment-as-usual?

## Outcomes (pre-registered)

| Measure | When | Notes |
|---------|------|--------|
| OASES-S (or full OASES) | Baseline, week 6, week 12 | Primary impact endpoint |
| %SS on standardized passage | Baseline, week 12 | Secondary; blinded rating if possible |
| Avoidance / situations attempted | Weekly in-app | Behavioral experiments + challenges |
| Adherence | Daily | Minutes practiced, streak |

## Design options

1. **Waitlist RCT** (n≈40–60): 6-week waitlist → 6-week active; strongest evidence, slower enrollment.
2. **Single-arm cohort** (n≈50–100): Pre/post with transparent effect sizes; faster; weaker causality.

## Inclusion

- Adults 18+, developmental stuttering, English primary for passage task.
- Exclude: neurogenic stuttering only, active SLP intensive program in same window (document as covariate).

## Analysis

- Intent-to-treat; report adherence separately.
- Effect sizes (Cohen’s d) on OASES and %SS; confidence intervals.
- Subgroup: anxiety-heavy vs technique-ready profiles.

## Ethics & operations

- IRB or ethics review before recruitment.
- Clear consent: app is practice support, not diagnosis or sole treatment.
- Data export from `oases_check_ins`, `behavioral_predictions`, session logs (de-identified).

## Go/no-go for marketing claims

| Milestone | Allowed copy |
|-----------|----------------|
| Cohort pre/post published (preprint OK) | “Pilot study showed…” with specific numbers |
| RCT positive primary endpoint | “Clinically studied program” with citation |
| Neither | “Built from peer-reviewed techniques” only |

## Engineering checklist (already started)

- [x] OASES-style check-ins (`oases_check_ins` table)
- [x] Behavioral experiment logging (`behavioral_predictions` table)
- [x] Export pipeline for research CSV (`/api/user/research-export`, Settings UI)
- [x] Consent flag on profile (`treatment_path.researchDataConsent`)
