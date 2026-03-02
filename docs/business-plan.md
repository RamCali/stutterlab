# StutterLab Business Plan

## Vision

A clinical-grade digital speech training platform that addresses the significant gap in the SLP market. Beyond basic breathing exercises — incorporating DAF, AI-powered conversation simulators, and CBT modules — positioning as a premium "digital clinic" rather than a wellness app.

---

## 1. Revenue Model — Path to $1M ARR

### The Churn Cliff Problem

At $99/mo, a user who completes the 90-day program and leaves generates **~$297 lifetime value**. To sustain $1M ARR with 3-month lifespans, you'd need to acquire ~280 new users every month — that's a treadmill, not a flywheel.

**The 90-day program isn't the business — it's the acquisition hook.** Nobody "graduates" from stuttering. The program teaches techniques, but users need ongoing practice to maintain fluency — especially in high-stakes situations (new job, presentations, dating). The real revenue comes from a blended model across multiple segments.

### Realistic Blended Revenue Mix

| Segment | Users | Price | Annual Revenue |
|---------|-------|-------|---------------|
| Active program (months 1-3) | 400 | $99/mo | $475K |
| Maintenance (post-90 day) | 800 | $24/mo | $230K |
| SLP Pro licenses | 50 clinics | $199/mo | $120K |
| Annual plans | 200 | $999/yr | $200K |
| **Total** | | | **~$1.025M** |

No single segment carries the whole number. The 90-day structure is a marketing *strength* ("Transform your speech in 90 days"), but Day 91 must feel like a beginning, not an ending.

### Market Context

- ~70 million people worldwide stutter (~1% of population)
- ~3 million in the US alone
- Capturing ~1,450 total users across all segments is an attainable early-stage target

---

## 2. Strategic Growth Levers

### Lever 1: B2B Provider Model (Priority — pursue first)

Partner with SLP private practices and clinics. Offer a "Pro" dashboard where therapists can assign homework and track client progress between sessions.

- **Revenue model**: Per-seat or per-clinic licensing
- **Why first**: Shorter sales cycle than enterprise, each SLP brings multiple clients, builds clinical credibility
- **Product gap**: Needs SLP dashboard, client assignment flow, progress sharing

### Lever 2: Enterprise / Employer Route (Phase 2)

Position StutterLab as a professional development benefit for HR departments (like Headspace or Grammarly for speech).

- **Target**: Companies with communication-heavy roles (sales, leadership, customer service)
- **Revenue model**: High-volume annual contracts
- **Note**: Different GTM motion from B2B — longer sales cycle, different buyer persona, requires compliance/security features (SSO, audit logs)

### Lever 3: Tiered Pricing for Specific Outcomes

| Tier | Price | Description |
|------|-------|-------------|
| Maintenance | $24/mo | Post-graduation access to AI simulators + Audio Lab |
| Core (current) | $99/mo | Full 90-day program + all features |
| Annual | $999/yr | Core program with 2-month discount — locks in commitment upfront |
| Bootcamp | $499 one-time | High-intensity 90-day sprint with limited human feedback |

**Key insight**: The maintenance tier is nearly pure margin — content already exists, just extending access for graduates. If 50% of graduates stay at $24/mo, effective LTV jumps from $297 to **$585+**.

### Lever 4: Post-90-Day Retention — Solving the Churn Cliff

The curriculum must evolve beyond 90 days so "graduation" is a milestone, not an exit:

- **Days 1–90**: Core curriculum (current)
- **Days 91–180**: Advanced scenarios — leadership meetings, public speaking, phone calls
- **Days 181+**: Specialty modules — job interviews, dating, presentations
- **Ongoing**: Monthly new AI conversation scenarios, community challenges, refresher drills

This turns a "course" into an **ongoing platform** without padding content. Users who finish the core program transition into maintenance with fresh material every month.

---

## 3. Competitive Moat

### AI Data Flywheel (aspirational — requires investment)

As more users record their speech, the AI's ability to provide nuanced fluency scoring improves. This proprietary data makes the tool harder to replicate.

**Current state**: Speech analysis uses Whisper transcription + heuristic disfluency counting (`src/lib/audio/speech-metrics.ts`). Not yet a trained model.

**To become a real moat**: Need to invest in custom ML models trained on stuttered speech data (with user consent). This is a medium-term R&D investment, not a day-one advantage.

### The "Practice Gap" Solution

Traditional speech training is expensive ($150-200/session) and infrequent (1x/week). StutterLab is the "Peloton for Speech" — providing the equipment and the daily habit. This solves the biggest pain point: lack of consistent, high-quality practice between SLP sessions.

### Clinical Depth

90-day structured curriculum designed with SLP methodology — not a generic meditation-style app. DAF/AAF, exposure ladder, block-aware AI, CBT integration — features competitors would need years to replicate.

---

## 4. Go-To-Market Strategy — Builder Mode to Distribution Mode

In the health-tech space, **authority** is the primary currency. For a $99/mo premium product, generic social media ads won't cut it — this requires a high-trust, multi-channel approach.

### Phase 1: "Trust-First" Organic Engine (Months 1–3)

Establish StutterLab as the definitive evidence-based resource before spending on ads.

#### Vertical SEO & "The Gap" Content

- Target high-intent long-tail keywords competitors ignore:
  - *"How to manage stuttering in job interviews"*
  - *"Phone call anxiety exercises for adults"*
  - *"DAF settings for stuttering"*
  - *"Speech exercises between SLP sessions"*
- Already have SEO pages: `/ai-speech-training`, `/stuttering-program`, `/stuttering-practice-app`
- Expand into a full content library — research-backed articles establishing clinical authority

#### Founder-Led Authority

- Leverage M.S., CCC-SLP credentials and LinkedIn (https://www.linkedin.com/in/ramgangisetty/)
- Publish a **"State of Stuttering Tech 2026" whitepaper** — positions StutterLab as the category thought leader
- LinkedIn deep-dive series on why traditional speech training fails to provide daily practice
- Podcast appearances on health tech and SLP-focused shows

#### The "Shadow" Community — First 100 Users

- Join (don't pitch) existing communities: Reddit r/stutter, Discord servers, NSA groups
- Find first 100 "Beta" users who provide:
  - Testimonials and reviews
  - "Before & After" AI fluency reports for the landing page
  - Product feedback to refine PMF
- **Stuttering Foundation / NSA partnerships**: Sponsor events, offer free access programs

### Phase 2: "B2B2C" Referral Loop (Months 3–6)

Individual acquisition is expensive. Partner with "gatekeepers" for bulk acquisition.

#### The SLP "Co-Pilot" Program

- Reach out to private SLP practices
- Offer a **free provider dashboard** where SLPs can "prescribe" StutterLab to their patients
- Solves their biggest problem: clients not practicing between weekly sessions
- Goal: Each SLP partner brings 5-20 clients
- Partner with SLP influencers and professional organizations (ASHA)

#### University Partnerships

- Partner with graduate SLP programs (start with alma mater)
- Offer StutterLab as a supplemental tool for clinical practicums
- Builds a pipeline of future SLPs who enter the workforce already recommending the tool
- Long-term brand loyalty play

#### Disability-Inclusive Influencer Marketing

- Partner with "Stuttering Creators" on TikTok and YouTube
- Authentic storytelling: using the Phone Simulator to make a real-world call
- 10x more effective than polished brand ads
- Video case studies of 90-day transformations

### Phase 3: "Professional Growth" Sales Motion (Months 6+)

Move from "practice tool" to "empowerment platform" — justifies the $99/mo price point.

#### Corporate DEI/ERG Outreach

- Target large tech companies with Disability Employee Resource Groups (ERGs)
- Position as a professional development tool for employees improving meeting presence and leadership communication
- Different GTM from B2B — longer sales cycle, requires compliance/security features (SSO, audit logs)
- High-volume annual contracts

#### Performance-Based Ads

- Highly targeted LinkedIn and Google Ads focused on **career milestones**:
  - *"Don't let a stutter hold back your promotion"*
  - *"AI Interview Prep for People Who Stutter"*
- Google Ads on high-intent keywords ("speech training app", "stuttering help")
- Retargeting website visitors who didn't convert
- Target CAC < $200 (2-month payback at $99/mo)

#### The "Freemium" Hook

- Offer the **Audio Lab (DAF/FAF)** for free or low cost
- Users experience the immediate physical effect on their speech
- Natural upsell to the full 90-day curriculum
- Lowers acquisition friction while showcasing clinical depth

### $1M ARR Execution Checklist

| Metric | Goal | Strategy |
|--------|------|----------|
| User Count | ~850 active subs | Focus on professional adults (higher LTV) |
| Churn Rate | < 5% monthly | 90-day curriculum engagement + maintenance tier |
| CAC | < $200 | Lower through SLP referrals and organic SEO |
| Expansion Revenue | +20% | Maintenance tier ($19/mo) after 90-day graduation |

---

## 5. Market Expansion

### Phase 1 (Current): Adults who stutter — English-speaking markets

### Phase 2: Adolescent / Teen Market

- Adds significant TAM but requires investment:
  - COPPA compliance (under 13)
  - Parental consent flows
  - Age-appropriate UX and gamification
  - Data handling / privacy requirements
- This is a regulatory investment, not just a feature add

### Phase 3: Multi-Language Support

- Expand to Spanish, Hindi, Mandarin — multiplies TAM significantly
- Requires language-specific speech analysis models
- Curriculum localization (not just translation)

### Phase 4: Adjacent Conditions

- Social anxiety / public speaking fear (much larger TAM)
- Accent modification
- Voice rehabilitation post-surgery

---

## 6. Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| 90-day program creates churn cliff | Maintenance tier ($24/mo) + post-90-day advanced curriculum (Days 91-180, 181+) + monthly new scenarios. Target 50%+ graduation-to-maintenance conversion |
| Relying on single revenue segment | Blended model: no segment > 50% of total ARR. Active program, maintenance, SLP Pro, and annual plans each contribute |
| Data flywheel claim is premature | Invest in custom ML models once user base > 1,000; until then, compete on curriculum depth |
| Enterprise sales cycle is long | Focus B2B/SLP first, build case studies before approaching enterprise |
| Teen market compliance burden | Defer until core adult market is profitable |
| Competitor with bigger budget copies features | Moat is in clinical depth + data + SLP relationships, not individual features |

---

## 7. Milestones

| Milestone | Target | Key Metric |
|-----------|--------|------------|
| Product-Market Fit | 100 paying users | >70% 30-day retention |
| Retention Validated | 200 paying users | >50% graduation-to-maintenance conversion |
| Early Traction | 500 paying users (blended) | <5% monthly churn, maintenance tier live |
| $1M ARR | ~1,450 users across segments | No segment >50% of revenue |
| Series A Ready | 2,500+ total users | B2B revenue >30%, LTV:CAC >3:1 |

---

*Last updated: March 2026*
