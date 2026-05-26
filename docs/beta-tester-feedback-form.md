# StutterLab Beta Tester Feedback

**Program:** Free full access for 4–6 weeks · honest feedback required · no testimonial obligation  
**Contact:** _[your email]_ · **Feedback due:** _[date]_

Copy questions into Google Forms, Typeform, or email. Ask testers to reply **after session 1** and again **after week 1**.

---

## Screening (before access)

| Field | Response |
|-------|----------|
| Name | |
| Email (account) | |
| Age 18+? | Yes / No |
| Stutters or avoids speaking situations? | Brief description |
| Can do 3 practice sessions in week 1? | Yes / No |
| OK with optional 20-min video call? | Yes / No |

---

## After first session (same day)

**Tester ID / email:** ______________________  
**Date:** ______________________  
**Device:** iOS / Android / Desktop · Browser: ______________________

1. **What were you trying to do when you opened the app?**  
   _[free text]_

2. **How many minutes until you actually spoke or used the microphone?**  
   _[ ] < 2 · [ ] 2–5 · [ ] 5–10 · [ ] 10+ · [ ] Never_

3. **In one sentence, what is this app for?**  
   _[free text]_

4. **Was anything confusing or blocking?** (onboarding, paywall, mic permission, “what’s next”)  
   _[free text]_

5. **Was the first session worth your time?**  
   _[ ] 👍 Yes · [ ] 👎 No_

6. **If 👎, what would have made it worth it?**  
   _[free text]_

7. **Screenshot or screen recording?** (optional)  
   _[link]_

---

## After week 1

**Tester ID / email:** ______________________  
**Date:** ______________________  
**Sessions completed this week:** _[ ] 0 · [ ] 1 · [ ] 2 · [ ] 3+_

1. **Did you come back on days 2–3? Why or why not?**  
   _[free text]_

2. **Most valuable feature this week**  
   _[ ] Daily practice · [ ] AI scenarios · [ ] Audio Lab (DAF/FAF) · [ ] Feared words · [ ] Progress/report · [ ] Other: ___

3. **Most skippable or least useful**  
   _[free text]_

4. **What would make you open the app tomorrow?**  
   _[free text]_

5. **After a week of use, $99/month feels:**  
   _[ ] Too cheap · [ ] Fair · [ ] Too expensive · [ ] Way too expensive_

6. **Would you recommend to a friend who stutters?** (0–10 NPS)  
   _[ 0 – 10 ]_

7. **One thing we should fix before anyone pays**  
   _[free text]_

8. **One thing we should definitely keep**  
   _[free text]_

---

## Exit interview guide (20 min, optional)

Use after week 2–4 or when tester churns early.

1. Think-aloud: open app cold → complete one practice (don’t coach).
2. “Show me where you’d go tomorrow for your next session.”
3. “What would you tell a friend this app does?”
4. Only then show paywall: “Knowing the full program, does $99/month match what you experienced?”
5. “Would you pay? What would you pay?”

**Facilitator notes**

| Time to first speak | Blocker | Quote worth keeping |
|---------------------|---------|---------------------|
| | | |

---

## Cohort tracker (internal)

| # | Name | Access granted | Session 1 done | Week-1 form | NPS | $99 fair? | Blocker |
|---|------|----------------|----------------|-------------|-----|-----------|---------|
| 1 | | | | | | | |
| 2 | | | | | | | |

**Beta success targets** (see [MARKETING.md](../MARKETING.md#free-beta-tester-program-get-users--feedback-before-paid-scale)):

- Median time to first speak **< 5 min** (check `product_events`: `first_speak_completed`)
- ≥50% complete **≥3 sessions** in week 1
- ≥70% 👍 on session 1
- <20% cannot complete session 1 due to blockers

---

## Funnel queries (product_events)

```sql
-- Activation: onboarding → first practice complete
SELECT COUNT(DISTINCT o.user_id) AS onboarded,
       COUNT(DISTINCT p.user_id) AS first_practice
FROM product_events o
LEFT JOIN product_events p
  ON p.user_id = o.user_id AND p.event_name = 'first_practice_completed'
WHERE o.event_name = 'onboarding_complete'
  AND o.created_at > NOW() - INTERVAL '30 days';

-- Median minutes: onboarding → first speak
SELECT percentile_cont(0.5) WITHIN GROUP (
  ORDER BY (s.context->>'secondsSinceOnboarding')::float / 60
)
FROM product_events s
WHERE s.event_name = 'first_speak_completed'
  AND s.context ? 'secondsSinceOnboarding';
```

Event names: `onboarding_complete`, `dashboard_viewed`, `first_action_started`, `first_practice_started`, `first_speak_completed`, `first_practice_completed`, `practice_session_started`, `practice_session_completed`, `paywall_viewed`.
