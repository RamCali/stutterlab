# Paid In-App Community Plan

## Positioning

StutterLab Community is a private member layer included with every active or trialing StutterLab Premium subscription. It is part of the paid offer, not a separate add-on. It should feel like a practice club, not a social network: small wins, accountability, technique discussion, and real-world exposure support.

## MVP Scope

- Premium gate on `/app/community`.
- Community access is included in StutterLab Premium.
- Database-backed member posts with categories:
  - Wins & Milestones
  - Techniques
  - Support
  - Q&A
  - Resources
- Existing community modules remain part of the member experience:
  - Weekly community pulse
  - I Did It wall
  - Community challenges
  - Daily micro-challenge
  - Accountability buddy
  - Streak shields
  - Victory feed
- Posts use member aliases rather than full public identities.
- Community write endpoints require an active or trialing subscription.

## Safety Rules

- Community guidance must avoid diagnosis, cure promises, and medical claims.
- Members can share personal experience, not prescribe treatment.
- Add reporting/moderation before growth beyond early paid users.
- Keep audio/video sharing opt-in only.
- Make SLP referral copy visible when members describe severe impact, crisis language, or worsening symptoms.

## Next Build Phases

1. [x] Comments and reactions persisted in the database.
2. [x] Report post/comment flow with admin moderation queue foundation.
3. [x] Member profile privacy settings: alias, avatar, optional bio, hidden email.
4. [x] Live practice rooms:
   - Start with scheduled small groups.
   - Add room capacity and host controls.
   - Record nothing by default.
5. [ ] Guided cohorts:
   - Weekly orientation thread.
   - Day 1, Day 7, Day 30 accountability check-ins.
   - Monthly member challenge tied to the 90-day curriculum.
6. [x] Admin tools foundation:
   - Pin posts.
   - Remove content.
   - Suspend community access without canceling billing.
   - Export moderation logs.

The admin tools foundation currently includes report capture and an admin-only open-report API guarded by `COMMUNITY_ADMIN_EMAILS`. Pin/remove/suspend/export still need an admin UI before broad launch.

## Offer Copy

Add to pricing and landing pages:

> Private member community included with Premium for wins, accountability, technique questions, and real-world speaking challenges.

For higher-conversion paywall copy:

> You do not have to practice alone. Premium includes a private StutterLab community built around daily wins, accountability, and low-pressure speaking challenges.

## Metrics

- Community activation: first post, victory, challenge join, or buddy match within 7 days.
- Weekly active community members.
- Post-to-comment ratio.
- Victory posts per active subscriber.
- Buddy match requests per active subscriber.
- Retention lift for community-active users vs. non-community-active users.
