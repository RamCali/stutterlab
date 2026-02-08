# StutterLab - App Design Inspiration

> Inspired by:
> - [Blessed - Daily Verse & Prayer](https://apps.apple.com/us/app/blessed-daily-verse-prayer/id1634567736) (4.9 stars, 99K+ reviews)
> - [Haven - Bible Chat](https://apps.apple.com/us/app/haven-bible-chat/id6503387382) (4.9 stars, 137K+ reviews)
> - [Bible Chat - Daily Devotional](https://apps.apple.com/us/app/bible-chat-daily-devotional/id6448849666) (4.9 stars, 301K+ reviews)
> - [Bible Path - Prayers & Widgets](https://apps.apple.com/us/app/bible-path-prayers-widgets/id6504798650) (4.8 stars, 24K+ reviews)
> - [Pray.com](https://apps.apple.com/us/app/pray-com-bible-daily-prayer/id1161035371) (4.8 stars, 187K+ reviews) -- dark mode reference

---

## Why Blessed Works

Blessed turns a deeply personal, emotional journey (faith) into a **simple daily habit** with a clean modern UI. StutterLab can mirror this exact pattern -- stuttering treatment is also deeply personal, emotional, and benefits from daily consistent practice.

| Blessed | StutterLab Equivalent |
|---|---|
| "4 Daily Steps Closer to God" | "4 Daily Steps to Fluent Confidence" |
| Morning blessing + night prayer | Morning warm-up + evening reflection |
| Bible Chat (AI counselor) | Stutter Coach (AI speech companion) |
| Prayer streaks | Practice streaks |
| Community prayer requests | Community wins & progress shares |
| Emotion-based personalization | Severity/situation-based personalization |

---

## Color Palette & Skins

### Default Theme: "Calm Focus"
| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Soft Teal | `#4AADB5` | Buttons, active states, progress rings |
| Secondary | Warm Coral | `#E87461` | Streaks, celebrations, CTAs |
| Background | Off-White | `#F8F7F4` | Main canvas |
| Surface | Cloud White | `#FFFFFF` | Cards, modals |
| Text Primary | Charcoal | `#2D3142` | Headlines, body |
| Text Secondary | Slate | `#7A7D8B` | Captions, hints |
| Success | Mint Green | `#5CC9A7` | Completed exercises, milestones |
| Accent | Soft Purple | `#7B6FD6` | Premium features, insights |

### Skin: "Night Mode"
| Role | Color | Hex |
|---|---|---|
| Background | Deep Navy | `#1A1B2E` |
| Surface | Dark Slate | `#252740` |
| Primary | Electric Teal | `#5DDDD6` |
| Text Primary | Soft White | `#E8E8EC` |
| Accent | Neon Coral | `#FF7B7B` |

### Skin: "Kids Mode" (Preschool/School-Age)
| Role | Color | Hex |
|---|---|---|
| Background | Cream | `#FFF8ED` |
| Primary | Friendly Blue | `#5B9EF4` |
| Secondary | Sunshine Yellow | `#FFD166` |
| Accent | Playful Pink | `#FF8FAB` |
| Success | Grass Green | `#73D47A` |

### Skin: "Clinical Pro" (SLP-Facing)
| Role | Color | Hex |
|---|---|---|
| Background | Clean White | `#FAFBFC` |
| Primary | Medical Blue | `#3B7DD8` |
| Surface | Light Gray | `#F0F2F5` |
| Accent | Confident Green | `#2E9E6E` |
| Text Primary | True Black | `#1A1A2E` |

### Skin: "Sunset Warmth"
| Role | Color | Hex |
|---|---|---|
| Background | Warm Linen | `#FDF6EC` |
| Primary | Burnt Orange | `#E8804C` |
| Secondary | Dusty Rose | `#C97B84` |
| Accent | Golden | `#D4A853` |
| Text Primary | Espresso | `#3C2A21` |

---

## Modern UI Patterns (Borrowed from Blessed)

### 1. Emotion-Based Onboarding
Blessed asks "How are you feeling?" to personalize content instantly.

**StutterLab version:**
- Screen 1: "Who is this for?" → Me / My child / I'm a clinician
- Screen 2: "How would you describe your stuttering?" → Mild / Moderate / Severe / Not sure
- Screen 3: "What matters most to you?" → Speaking at work / Social confidence / Helping my child / Phone calls / Public speaking
- Screen 4: Personalized daily plan generated

> **Design note:** Large pill-shaped selection buttons, one-tap each screen, soft fade transitions, progress dots at top. No forms. No typing. Just tapping.

### 2. Daily Step Journey (Core Loop)
Blessed uses a "4 steps" daily ritual. StutterLab mirrors this:

```
┌─────────────────────────────────────────┐
│  YOUR DAILY PRACTICE          Day 12 🔥  │
│                                         │
│  ○ ─── ◉ ─── ○ ─── ○                   │
│  Done  Now   Next   Next                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  STEP 2: TECHNIQUE PRACTICE     │    │
│  │                                 │    │
│  │  🎯 Gentle Onset               │    │
│  │  Practice smooth speech starts  │    │
│  │  with guided audio              │    │
│  │                                 │    │
│  │  ⏱ 5 min    📊 Easy            │    │
│  │                                 │    │
│  │  [ Start Practice → ]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Coming up: Real-World Challenge        │
└─────────────────────────────────────────┘
```

**The 4 Daily Steps:**
1. **Morning Check-In** - Rate confidence, set intention (1 min)
2. **Technique Practice** - Guided audio exercise (5 min)
3. **Real-World Challenge** - One speaking task with tips (varies)
4. **Evening Reflection** - Log wins, rate the day (2 min)

### 3. Streak & Habit Gamification
```
┌──────────────────────────────┐
│  🔥 12-Day Streak!           │
│                              │
│  M  T  W  T  F  S  S        │
│  ●  ●  ●  ●  ●  ◐  ○       │
│                              │
│  This week: 5/7 days         │
│  Best streak: 23 days        │
└──────────────────────────────┘
```

### 4. Progress Visualization
```
┌──────────────────────────────────┐
│  YOUR FLUENCY JOURNEY            │
│                                  │
│  Confidence  ████████░░  78%     │
│  Techniques  ██████░░░░  62%     │
│  Real-World  ████░░░░░░  41%     │
│                                  │
│  ↑ 12% improvement this month   │
└──────────────────────────────────┘
```

### 5. Community Feed (Like Blessed's Prayer Community)
```
┌──────────────────────────────────────┐
│  COMMUNITY                           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Sarah M.           2h ago    │    │
│  │ Made a phone call today      │    │
│  │ without avoiding any words!  │    │
│  │ 🎉 47 cheers                 │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ James T.            5h ago   │    │
│  │ Day 30 of practice streak.   │    │
│  │ My coworkers noticed a       │    │
│  │ difference.                  │    │
│  │ 💪 82 cheers                 │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

---

## Typography

| Element | Font Suggestion | Weight | Size |
|---|---|---|---|
| Headlines | SF Pro Display / Inter | Bold (700) | 28-32px |
| Subheadings | SF Pro Display / Inter | Semi-Bold (600) | 20-22px |
| Body | SF Pro Text / Inter | Regular (400) | 16-17px |
| Captions | SF Pro Text / Inter | Regular (400) | 13-14px |
| Buttons | SF Pro Text / Inter | Semi-Bold (600) | 16-18px |
| Stats/Numbers | SF Mono / JetBrains Mono | Bold (700) | 24-36px |

> **Design note:** Blessed uses clean sans-serif throughout. No decorative fonts. Readability is king -- especially important for StutterLab where anxiety reduction matters.

---

## App Icon Concepts

### Option A: "Speech Bubble Flow"
- Rounded square with soft teal-to-purple gradient
- Abstract speech bubble with a gentle wave/flow line through it
- Symbolizes smooth speech, movement, progress

### Option B: "Confident S"
- Monogram "S" in a modern geometric style
- Gradient from teal to coral
- Clean, app-store-friendly, memorable at small sizes

### Option C: "Wave Pattern"
- Sound wave visualization forming a smile shape
- Teal primary with white wave
- Represents both speech and positivity

---

## Marketing Copy & Positioning

### App Store Tagline Options
- "Created by an SLP. Built for your voice."
- "SLP-designed daily speech practice"
- "Your daily path to confident speech"
- "Speak freely. Practice daily. Designed by an SLP."
- "Evidence-based stuttering support in your pocket"

### App Store Description Framework (Blessed-style + SLP authority)
```
Created by a licensed Speech-Language Pathologist who saw a gap:
great clinical techniques exist, but no modern app puts them in
your pocket for daily practice. StutterLab changes that.

DESIGNED BY AN SLP, POWERED BY AI
Every exercise, every AI coaching response, and every technique
in StutterLab is designed and reviewed by a practicing SLP.
This isn't generic wellness -- it's real clinical expertise
made accessible.

BUILD DAILY CONFIDENCE IN 4 SIMPLE STEPS
✦ Morning Check-In: Start your day with intention
✦ Technique Practice: SLP-guided exercises backed by research
✦ Real-World Challenge: Apply skills where it matters
✦ Evening Reflection: Celebrate progress, no matter how small

WHAT MAKES STUTTERLAB DIFFERENT
✦ Created by an SLP: Not a tech company -- a clinician who gets it
✦ Evidence-based: Every technique backed by clinical research
✦ AI Speech Coach: SLP-designed guidance, available 24/7
✦ Community: You're never alone on this journey
✦ Track Progress: See your confidence grow over time

TRUSTED BY THE RESEARCH
StutterLab is built on proven approaches including speech
restructuring (d=0.75-1.63), stuttering modification, and
Acceptance & Commitment Therapy (ACT). We show you the evidence
behind every technique.
```

### Social Proof Format (from Blessed playbook)
> "I used to avoid phone calls. After 30 days with StutterLab, I called my doctor without even thinking about it." -- App Store Review

> "As an SLP, I recommend this to every client. The daily practice between sessions has been a game-changer." -- App Store Review

---

## Subscription Model (Blessed-inspired)

### Free Tier
- 1 daily technique exercise
- Basic progress tracking
- Community access (read-only)
- Limited technique library

### Premium
- **Weekly:** $4.99 (trial hook)
- **Monthly:** $9.99
- **Annual:** $49.99 (best value -- highlight this)

### Premium Features
- Full 4-step daily journey
- AI Speech Coach (unlimited)
- All technique libraries (by age group)
- Audio-guided exercises
- Advanced progress analytics
- Community posting & interaction
- Custom practice reminders
- Offline access
- Family plan (monitor child's progress)

### Paywall Screen Design
```
┌─────────────────────────────────────┐
│                                     │
│     Unlock Your Full Potential      │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ FREE    │ │ PREMIUM │           │
│  │         │ │    ★    │           │
│  │ 1 exercise│ │ Unlimited│          │
│  │ Basic   │ │ AI Coach │           │
│  │ tracking│ │ Community│           │
│  │         │ │ Analytics│           │
│  └─────────┘ └─────────┘           │
│                                     │
│  [ Try 7 Days Free → ]             │
│                                     │
│  Then $49.99/year ($4.17/mo)        │
│  Cancel anytime                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Widget Design (Home Screen)

### Daily Motivation Widget (Small)
```
┌───────────────────┐
│ StutterLab   🔥14 │
│                   │
│ "Your voice       │
│  matters."        │
│                   │
│ Tap to practice → │
└───────────────────┘
```

### Progress Widget (Medium)
```
┌─────────────────────────────────┐
│ StutterLab          Day 14 🔥   │
│                                 │
│ Today's Steps: ● ● ○ ○         │
│ Confidence:    ████████░░ 78%   │
│                                 │
│ Next: Technique Practice (5min) │
└─────────────────────────────────┘
```

---

## Key Design Principles (Learned from Blessed)

1. **Simplicity over features** -- Blessed doesn't overwhelm. 4 steps. That's it. StutterLab should resist feature creep.

2. **Emotion first, information second** -- Ask how they feel before showing content. Personalization creates instant connection.

3. **Daily ritual > one-time tool** -- The app should feel like a daily companion, not a reference manual. Streaks, check-ins, and gentle nudges.

4. **Community heals** -- Blessed's prayer community creates belonging. Stuttering can be isolating -- community features are not optional.

5. **Premium feels generous** -- Free tier should deliver real value. Premium should feel like unlocking a coach, not removing restrictions.

6. **Calm UI reduces anxiety** -- Soft colors, rounded corners, generous whitespace. No sharp edges, no aggressive CTAs. The design itself should feel therapeutic.

7. **Celebrate small wins** -- Confetti animations, streak milestones, encouraging copy. Every completed exercise is a victory.

8. **Trust through transparency** -- Blessed shows pastor credentials. StutterLab shows research citations and evidence levels for every technique.

---

## Animation & Micro-Interactions

- **Card transitions:** Smooth slide-up with spring physics
- **Completion:** Satisfying checkmark animation + subtle haptic
- **Streak milestone:** Confetti burst (5, 10, 25, 50, 100 days)
- **Progress ring:** Animated fill with easing
- **Tab switching:** Crossfade with slight scale
- **Pull to refresh:** Custom speech-wave animation
- **Loading states:** Breathing circle animation (calming)

---

## Competitive Edge Summary

| Feature | Blessed Has It | StutterLab Should Have It |
|---|---|---|
| Daily structured ritual | Yes (4 steps) | Yes (4 steps) |
| Emotion-based personalization | Yes | Yes |
| AI companion | Yes (Bible Chat) | Yes (Speech Coach) |
| Streak gamification | Yes | Yes |
| Community | Yes | Yes |
| Home screen widget | Yes | Yes |
| Audio-guided content | Yes | Yes |
| Evidence/source transparency | Partial | Yes (core differentiator) |
| Age-specific programs | No | Yes (core differentiator) |
| Progress analytics | Basic | Advanced (core differentiator) |
| Offline practice | Unknown | Yes |
| Family/clinician dashboard | No | Yes (core differentiator) |

---

## Additional App Inspiration Deep Dives

---

### Haven - Bible Chat (4.9 stars, 137K reviews)

**What Haven nails:** The AI chat experience. Haven positions its chat as a wise companion -- "ask Haven anything." The conversational UI feels like texting a knowledgeable friend, not interrogating a database.

**Design takeaways for StutterLab:**

| Haven Pattern | StutterLab Application |
|---|---|
| "Step Into the Living Word" (action-oriented CTA) | "Step Into Confident Speech" |
| Hand-picked daily verses | Hand-picked daily technique of the day |
| Chat-first UI with input field always visible | Speech Coach always one tap away |
| Warm earthy tones (purple/cream) | Warm, approachable -- not clinical |
| Streak counter as primary engagement metric | Practice streak front and center |

**Haven's color approach:**
- Cream text on dark: `#F2F2F2` on purple-tinted backgrounds
- Warm, intimate feel -- like a journal, not a textbook
- Purple-to-cream gradient on the icon suggests "sacred + approachable"

**AI Chat UI pattern (adapt for Speech Coach):**
```
┌─────────────────────────────────────────┐
│  Speech Coach                      ···  │
│─────────────────────────────────────────│
│                                         │
│        ┌──────────────────────┐         │
│        │ I have a job interview│         │
│        │ tomorrow and I'm      │         │
│        │ really anxious about  │         │
│        │ stuttering.           │         │
│        └──────────────────────┘         │
│                                         │
│  ┌──────────────────────────┐           │
│  │ That's completely normal. │           │
│  │ Let's prepare together.   │           │
│  │                           │           │
│  │ Here are 3 things that    │           │
│  │ help most for interviews: │           │
│  │                           │           │
│  │ 1. Voluntary stuttering   │           │
│  │    to reduce fear         │           │
│  │ 2. Gentle onset on first  │           │
│  │    words of answers       │           │
│  │ 3. Pausing is power --    │           │
│  │    it reads as thoughtful │           │
│  │                           │           │
│  │ Want to practice a mock   │           │
│  │ interview right now?      │           │
│  └──────────────────────────┘           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Ask your Speech Coach...    🎤  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

> **Key insight from Haven:** The chat isn't just Q&A -- it offers to *do something next* ("Want to practice?"). StutterLab's coach should always end with an actionable next step.

---

### Bible Chat - Daily Devotional (4.9 stars, 301K reviews)

**Why Bible Chat is the #1 faith app (301K reviews!):** It's a feature powerhouse disguised as simplicity. Underneath the clean UI lives an enormous feature set organized so well it never feels overwhelming.

**Feature ideas to steal:**

| Bible Chat Feature | StutterLab Equivalent |
|---|---|
| "Panic Button" (guided breathing for stress) | **Stutter Panic Button** (calm-down + speech reset when stuck) |
| Holy Calendar (Christian observances) | **Speaking Calendar** (upcoming challenges: presentations, calls) |
| "Send a Blessing" (personalized shareable cards) | **Send Encouragement** (share a win or motivational card) |
| Bible Stories for Kids (video) | **Speech Stories for Kids** (animated characters practicing techniques) |
| Bible Trivia game | **Speech Trivia** (fun facts about famous people who stutter) |
| Hourly Affirmations | **Hourly Speech Affirmations** (widget-delivered) |
| Bible Comics | **Illustrated technique guides** (visual, not text-heavy) |
| Multiple Bible versions | **Multiple technique approaches** (let users choose their path) |

**The "Panic Button" -- Critical Feature for StutterLab:**
```
┌─────────────────────────────────────────┐
│                                         │
│           ┌───────────────┐             │
│           │               │             │
│           │   BREATHE     │             │
│           │               │             │
│           │   ●           │             │
│           │  (pulsing)    │             │
│           │               │             │
│           └───────────────┘             │
│                                         │
│     You're doing great. Let's reset.    │
│                                         │
│     ○ ─── ○ ─── ● ─── ○ ─── ○         │
│       In    Hold   Out   Hold           │
│                                         │
│     [ Gentle Onset Practice ]           │
│     [ Positive Self-Talk ]              │
│     [ Call a Speech Buddy ]             │
│                                         │
└─────────────────────────────────────────┘
```

> **Accessible from anywhere in the app via a floating button or shake gesture.** When someone is in a stuttering block mid-conversation, they need help in seconds, not taps.

**Bible Chat's onboarding question:** "Why did you download this app?"
- This is brilliant. The answer shapes the entire experience.
- **StutterLab version:** "What brought you here today?"
  - "I want to stutter less"
  - "I want to feel less anxious about speaking"
  - "I'm helping my child"
  - "A therapist recommended this"
  - "I just want to understand stuttering better"

**Bible Chat's color approach:**
- Soft mint/sage green primary with warm peach accents
- Feels fresh, modern, gender-neutral
- **StutterLab parallel:** Sage + peach could work for an "Earth Tone" skin

### Skin: "Earth Tone" (Inspired by Bible Chat)
| Role | Color | Hex |
|---|---|---|
| Background | Warm White | `#FAFAF5` |
| Primary | Sage Green | `#7BAE7F` |
| Secondary | Soft Peach | `#F5C5A3` |
| Surface | Cream | `#F7F3ED` |
| Text Primary | Dark Olive | `#2C3E2D` |
| Accent | Dusty Lavender | `#A8A0C8` |

**Bible Chat's widget strategy:**
- Lock screen widgets, home screen widgets, hourly affirmations
- This is a **retention power move** -- the app is visible even when not open
- StutterLab should have: daily affirmation widget, streak widget, next practice reminder widget, and a "today's technique tip" widget

---

### Bible Path - Prayers & Widgets (4.8 stars, 24K reviews)

**What Bible Path does differently:** Leans hard into **audio-first** and **widget-first** design. The app wants to be part of your day *without you opening it.*

**Design takeaways for StutterLab:**

**1. Hourly Scripture Widgets → Hourly Speech Widgets**
Bible Path pushes new content to the home/lock screen every hour. StutterLab can do:
- **Morning:** "Today's technique: Prolonged Speech"
- **Midday:** "Quick challenge: Order coffee using gentle onset"
- **Afternoon:** "Did you know? King George VI stuttered and gave wartime speeches"
- **Evening:** "Reflection: What speaking win are you proud of today?"

**2. Audio-First Experience**
Bible Path offers an audio Bible for people who'd rather listen than read. StutterLab parallel:
- **Audio-guided exercises** (follow along with a calm voice)
- **Podcast-style lessons** (learn about techniques while commuting)
- **Bedtime wind-down** (relaxation + speech affirmations for sleep, like Pray.com does)

**3. Watchable Stories → Watchable Technique Demos**
Bible Path has animated Bible stories. StutterLab can have:
- Short animated demos of techniques (gentle onset, prolonged speech, cancellations)
- Real people sharing their stuttering journeys (video testimonials)
- SLP-narrated walkthroughs of exercises

**4. "Personalized to your knowledge level"**
Bible Path tailors content to beginner vs. advanced. StutterLab should ask:
- "How long have you been working on your speech?" → New to this / Some experience / Years of practice
- Then adjust: terminology complexity, exercise difficulty, technique sophistication

**Bible Path's warm palette:**
- Soft yellow/cream `#EBEBD7` backgrounds
- Deep brown/olive `#121008` text
- Feels like aged paper, warmth, trust
- **Inspiration for StutterLab "Parchment" widget theme**

**Lifetime pricing model (from Bible Path):**
Bible Path offers $39.99-$49.99 lifetime access alongside subscriptions. Consider:

| Tier | Price | Notes |
|---|---|---|
| Weekly | $4.99 | Trial conversion hook |
| Monthly | $9.99 | Standard |
| Annual | $49.99 | Best recurring value |
| **Lifetime** | **$149.99** | One-time, premium positioning |

> Lifetime pricing signals confidence in the product and attracts users who hate subscriptions.

---

### Pray.com Dark Mode (4.8 stars, 187K reviews) -- DARK MODE REFERENCE

**Why the user likes Pray.com's dark mode:** Pray.com uses a rich, **purple-tinted dark mode** rather than pure black. It feels luxurious and calming -- like a quiet room at night, not a void. The purple spiritual branding carries through into dark mode as a tint on dark surfaces.

**Pray.com dark mode design philosophy:**
- Dark doesn't mean black -- it means **deep, tinted, atmospheric**
- Purple branding on light mode becomes a purple *glow* in dark mode
- Content cards float with subtle elevation (not just border changes)
- Text is warm white `#E8E5F0` (slightly lavender-tinted), not harsh `#FFFFFF`
- Premium content gets a subtle shimmer/glow effect in dark mode

### Updated Skin: "Deep Night" (Pray.com-Inspired Dark Mode)

| Role | Color | Hex | Notes |
|---|---|---|---|
| Background | Deep Purple-Black | `#0D0B14` | Not pure black -- purple undertone |
| Surface Level 1 | Dark Plum | `#1A1525` | Primary cards, containers |
| Surface Level 2 | Muted Grape | `#241E32` | Elevated cards, modals |
| Surface Level 3 | Soft Aubergine | `#2E2640` | Active states, selected items |
| Primary | Luminous Teal | `#56D9CC` | Buttons, links, progress rings |
| Secondary | Warm Amber | `#F5B862` | Streaks, celebrations, warmth |
| Accent | Soft Violet | `#9B8FD4` | Premium indicators, highlights |
| Text Primary | Lavender White | `#E8E5F0` | Headlines, body text |
| Text Secondary | Muted Lilac | `#8A8499` | Captions, timestamps |
| Text Tertiary | Faded Mauve | `#5C5668` | Disabled, placeholder |
| Success | Glow Green | `#5EDBA5` | Completed states |
| Error | Soft Rose | `#F47B8A` | Error states (not harsh red) |
| Dividers | Ghost Purple | `#2A2438` | Subtle separation lines |
| Overlay | Black 60% | `#0D0B14 @ 60%` | Modal backgrounds |

**Dark mode card styling:**
```
┌─────────────────────────────────────────┐
│ Background: #0D0B14                     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Surface L1: #1A1525             │    │
│  │ border-radius: 16px             │    │
│  │ border: 1px solid #2A2438       │    │
│  │                                 │    │
│  │  DAILY PRACTICE        🔥 12    │    │
│  │  #E8E5F0              #F5B862   │    │
│  │                                 │    │
│  │  Step 2: Gentle Onset           │    │
│  │  #8A8499                        │    │
│  │                                 │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │ Surface L2: #241E32     │    │    │
│  │  │ Progress: ██████░░ 62%  │    │    │
│  │  │ #56D9CC bar on #2A2438  │    │    │
│  │  └─────────────────────────┘    │    │
│  │                                 │    │
│  │  [ Start Practice → ]          │    │
│  │  bg: #56D9CC  text: #0D0B14    │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Dark mode navigation bar:**
```
┌─────────────────────────────────────────┐
│                                         │
│  bg: #1A1525                            │
│  border-top: 1px solid #2A2438          │
│                                         │
│  🏠        📊        💬        👤      │
│  Home    Progress  Community  Profile   │
│  #56D9CC  #8A8499   #8A8499   #8A8499  │
│  (active) (inactive) (inactive)(inactive)│
│                                         │
└─────────────────────────────────────────┘
```

**Dark mode widget designs:**
```
Small Widget (Lock Screen):              Medium Widget (Home Screen):
┌───────────────────┐   ┌─────────────────────────────────┐
│ bg: #1A1525       │   │ bg: #1A1525                     │
│                   │   │ border: 1px #2A2438             │
│ StutterLab  🔥14  │   │                                 │
│ #E8E5F0   #F5B862 │   │ StutterLab          Day 14 🔥   │
│                   │   │ #E8E5F0             #F5B862     │
│ "Your voice       │   │                                 │
│  matters."        │   │ Steps: ● ● ○ ○    78% ████░░   │
│ #9B8FD4           │   │ #56D9CC/#8A8499    #56D9CC     │
│                   │   │                                 │
│ Tap to practice → │   │ Next: Technique Practice (5min) │
│ #56D9CC           │   │ #8A8499                         │
└───────────────────┘   └─────────────────────────────────┘
```

**Why this dark mode works for StutterLab:**
1. **Purple tint = calm, not sterile.** Pure black feels clinical. Purple-black feels like a safe, quiet space -- exactly right for someone practicing speech at night.
2. **Teal on dark purple = high contrast + beauty.** The teal primary pops without being jarring.
3. **Warm amber for streaks/celebrations.** Fire emoji energy without neon harshness.
4. **Three surface levels create depth.** Cards feel like they float, creating hierarchy without drop shadows (which look bad in dark mode).
5. **Lavender-tinted text reduces eye strain.** Pure white on dark is harsh. Slightly tinted white feels softer during evening practice sessions.

---

## Cross-App Pattern Analysis

### What ALL 5 apps have in common (proven patterns):

| Pattern | Blessed | Haven | Bible Chat | Bible Path | Pray.com | StutterLab |
|---|---|---|---|---|---|---|
| AI chat companion | Yes | Core feature | Core feature | Yes | Yes (Pray AI) | Speech Coach |
| Daily structured ritual | 4 steps | Daily verse | Daily plan | Hourly widgets | Daily prayer plan | 4 steps |
| Streaks/gamification | Yes | Yes | Yes | Implicit | Yes | Yes |
| Community features | Prayer feed | Implied | Live discussion | Chat | Prayer groups | Wins feed |
| Audio content | Yes | Implied | Yes | Core feature | Core feature | Guided exercises |
| Widgets | Yes | No | Heavy focus | Core feature | Yes | Heavy focus |
| Personalized onboarding | Emotion-based | Topic-based | Motive-based | Knowledge-level | Goal-based | All of these |
| Premium paywall | 7-day trial | 7-day trial | 7-day trial | Day-1 paywall | Freemium | 7-day trial |
| Age rating | 13+ | 13+ | 4+ | 4+ | 4+ | 4+ (target) |

### Universal pricing sweet spots:
- **Weekly trial:** $4.99-$6.99 (hooks users before they forget)
- **Monthly:** $9.99-$12.99 (standard)
- **Annual:** $29.99-$59.99 (best conversion for engaged users)
- **Lifetime:** $39.99-$149.99 (niche but loved by subscription-fatigued users)

### The 5 features every top app has that StutterLab MUST ship:
1. **AI companion chat** -- Not optional. Every top app has one. Users expect it.
2. **Home screen widget** -- Passive engagement. The app stays visible without being opened.
3. **Streak tracking** -- The single strongest retention mechanic across all 5 apps.
4. **Audio-guided content** -- Users want to listen, not just read. Especially for speech exercises.
5. **"Panic" / quick-access feature** -- Bible Chat's Panic Button proves users need instant help in crisis moments. For stuttering, this is even more critical.

### Design DNA summary:
- **Colors:** Soft, muted, tinted -- never primary saturated colors. Pastels > neons.
- **Corners:** Always rounded (12-20px radius). No sharp edges anywhere.
- **Spacing:** Generous. Let content breathe. White space = calm.
- **Typography:** Clean sans-serif, large sizes, strong hierarchy. Never decorative.
- **Icons:** Thin/light weight, monochrome, consistent stroke width.
- **Animations:** Subtle, purposeful, calming. Never flashy or distracting.
- **Dark mode:** Tinted (not pure black), layered surfaces, warm-shifted text.
