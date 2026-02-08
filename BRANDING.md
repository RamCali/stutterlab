# StutterLab Branding Guide

> **"The Science of Happy Talking."**

StutterLab's branding bridges the gap between a high-tech AI **"Lab"** and the warm, human outcome of **"Happy Talking."** The visual identity is dark and sophisticated, with vibrant accents that suggest energy and clarity.

---

## 🎨 Color Palette: "The Fluency Flow"

| Role               | Color Name      | Hex       | Psychological Impact                          |
| ------------------- | --------------- | --------- | --------------------------------------------- |
| Primary Background  | Obsidian Night  | `#0B0E14` | High-end tech feel; reduces eye strain.       |
| Surface / Card      | Deep Slate      | `#1A1F26` | Creates depth for UI elements.                |
| Primary Accent      | Clarity Teal    | `#48C6B3` | Calmness, healing, and medical precision.     |
| Secondary Accent    | Sunset Amber    | `#FFB347` | Warmth, happiness, and human connection.      |
| Success / Action    | Fluency Green   | `#00E676` | Progress, growth, and "go" signals.           |

### Usage Guidelines

- **Obsidian Night `#0B0E14`** — Default page background. Sets the dark-mode foundation across the entire app.
- **Deep Slate `#1A1F26`** — Card surfaces, modals, sidebars, and elevated containers.
- **Clarity Teal `#48C6B3`** — Primary buttons, links, active states, and key interactive elements.
- **Sunset Amber `#FFB347`** — Secondary highlights, progress indicators, and warm call-outs.
- **Fluency Green `#00E676`** — Success states, completion badges, real-time "go" signals, and positive feedback.

---

## 🏛️ Typography

| Role         | Font                        | Weight / Style | Use Case                                          |
| ------------ | --------------------------- | -------------- | ------------------------------------------------- |
| Headers      | **Inter**                   | Bold (700)     | Clean, geometric sans-serif. Modern and accessible. |
| Body         | **Roboto**                  | Regular (400)  | Highly legible for therapy exercises and data logs.  |
| Tagline      | **Montserrat**              | Light Italic   | Adds personality to "Happy Talking" moments.         |

### Type Scale (4px base)

| Token    | Size   | Line Height | Use Case                                |
| -------- | ------ | ----------- | --------------------------------------- |
| `xs`     | 12px   | 16px        | Captions, timestamps, helper text       |
| `sm`     | 14px   | 20px        | Labels, secondary text, metadata        |
| `base`   | 16px   | 24px        | Body text, exercise instructions        |
| `lg`     | 20px   | 28px        | Subheadings, card titles                |
| `xl`     | 24px   | 32px        | Section headings                        |
| `2xl`    | 32px   | 40px        | Page titles                             |
| `3xl`    | 40px   | 48px        | Hero headlines, marketing display       |

### Font Stack (CSS)

```css
--font-heading: 'Inter', system-ui, -apple-system, sans-serif;
--font-body: 'Roboto', system-ui, -apple-system, sans-serif;
--font-tagline: 'Montserrat', system-ui, -apple-system, sans-serif;
```

---

## 📐 Spacing & Layout (4px Base Grid)

All spacing values are multiples of **4px**, ensuring consistent rhythm across every screen.

### Spacing Scale

| Token  | Value | Use Case                                          |
| ------ | ----- | ------------------------------------------------- |
| `0.5`  | 2px   | Borders, fine adjustments (use sparingly)         |
| `1`    | 4px   | Tight inner padding, icon-to-label gaps           |
| `2`    | 8px   | Default inner padding, form element gaps          |
| `3`    | 12px  | Compact card padding, list item spacing           |
| `4`    | 16px  | Standard card padding, input fields               |
| `5`    | 20px  | Comfortable content padding                       |
| `6`    | 24px  | Section padding, group separation                 |
| `8`    | 32px  | Large section gaps, page-level gutters            |
| `10`   | 40px  | Major section breaks                              |
| `12`   | 48px  | Page-level vertical spacing                       |
| `16`   | 64px  | Hero sections, major layout divisions             |

### Layout Guidelines

- **Component internals** — `4px` to `12px` (tokens `1`–`3`)
- **Between components** — `16px` to `24px` (tokens `4`–`6`)
- **Between sections** — `32px` to `64px` (tokens `8`–`16`)
- **Border radius** — `4px` (subtle), `8px` (cards/buttons), `16px` (modals/sheets)

---

## 🪜 Elevation (Dark Theme)

Based on [Material Design dark theme properties](https://m2.material.io/design/color/dark-theme.html#properties). In dark mode, elevation is communicated through **white overlay opacity** on the surface color, not shadows.

### Elevation Scale

| Level | dp  | White Overlay | Resulting Surface                            | Use Case                              |
| ----- | --- | ------------- | -------------------------------------------- | ------------------------------------- |
| 0     | 0   | 0%            | `#0B0E14` (Obsidian Night)                   | Page background                       |
| 1     | 1   | 5%            | `#141820`                                    | Cards at rest, side nav               |
| 2     | 2   | 7%            | `#181C25`                                    | Raised cards, search bar              |
| 3     | 3   | 8%            | `#1A1F28`                                    | Snackbars, sub-menus                  |
| 4     | 4   | 9%            | `#1C212B`                                    | App bar, practice tiles               |
| 6     | 6   | 11%           | `#1F252F`                                    | FAB at rest, bottom nav               |
| 8     | 8   | 12%           | `#212732`                                    | Bottom sheets, menus                  |
| 12    | 12  | 14%           | `#252B36`                                    | FAB pressed, picked-up cards          |
| 16    | 16  | 15%           | `#272D39`                                    | Modal side sheets                     |
| 24    | 24  | 16%           | `#292F3B`                                    | Dialogs, full-screen modals           |

### How It Works

- **Base surface** = `--color-bg-primary` (`#0B0E14`)
- Each elevation level adds a semi-transparent white overlay: `rgba(255, 255, 255, <overlay%>)`
- Higher elements appear **lighter**, creating a natural sense of depth
- **No box-shadows** in dark mode — they're invisible against dark backgrounds

### StutterLab Elevation Mapping

| Component              | Elevation | Overlay |
| ---------------------- | --------- | ------- |
| Page background        | 0dp       | 0%      |
| Stat cards, list items | 1dp       | 5%      |
| Hero / summary card    | 2dp       | 7%      |
| Bottom nav bar         | 6dp       | 11%     |
| Practice tile (hover)  | 8dp       | 12%     |
| Modals, dialogs        | 24dp      | 16%     |
| FAB                    | 6dp rest → 12dp pressed | 11% → 14% |

---

## 📱 Branding Page Concept

### Hero Section

- **Background:** Full-color cafe photograph with a **60% Obsidian Night gradient overlay**.
- **Headline:** _"StutterLab: The Science of Happy Talking."_
- **CTA Button:** Clarity Teal (`#48C6B3`) button — **"Start Your Journey"**

### Feature Highlights (Dark Mode UI)

#### AI Real-Time Feedback
- Cards using **Deep Slate** backgrounds.
- **Fluency Green** wave patterns to visualize real-time speech analysis.

#### Progress Tracking
- Minimalist charts using **Sunset Amber** to show stuttering frequency reduction over time.

### The Emotional Bridge

- **Visual:** High-contrast silhouette placed next to a user testimonial.
- **Copy:** _"Because treatment isn't just about the mechanics of speech — it's about the joy of being heard."_

---

## CSS Custom Properties

```css
:root {
  /* Colors — The Fluency Flow */
  --color-bg-primary: #0B0E14;
  --color-bg-surface: #1A1F26;
  --color-accent-primary: #48C6B3;
  --color-accent-secondary: #FFB347;
  --color-success: #00E676;

  /* Typography — Fonts */
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body: 'Roboto', system-ui, -apple-system, sans-serif;
  --font-tagline: 'Montserrat', system-ui, -apple-system, sans-serif;

  /* Typography — Scale (4px base) */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 40px;

  /* Spacing — Scale (4px base) */
  --space-0-5: 2px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Elevation — White Overlay on #0B0E14 */
  --elevation-0: 0B0E14;               /* 0dp  — page bg */
  --elevation-1: rgba(255,255,255,0.05); /* 1dp  — cards at rest */
  --elevation-2: rgba(255,255,255,0.07); /* 2dp  — raised cards */
  --elevation-3: rgba(255,255,255,0.08); /* 3dp  — snackbars */
  --elevation-4: rgba(255,255,255,0.09); /* 4dp  — app bar */
  --elevation-6: rgba(255,255,255,0.11); /* 6dp  — FAB, bottom nav */
  --elevation-8: rgba(255,255,255,0.12); /* 8dp  — sheets, menus */
  --elevation-12: rgba(255,255,255,0.14); /* 12dp — FAB pressed */
  --elevation-16: rgba(255,255,255,0.15); /* 16dp — modal sheets */
  --elevation-24: rgba(255,255,255,0.16); /* 24dp — dialogs */
}
```

---

## 🧩 UI Components

Patterns derived from the StutterLab mobile reference mockup.

### Top Bar

- **Layout:** Logo (avatar + wordmark) left-aligned, user avatar right-aligned.
- **Logo:** Teal-and-amber silhouette icon beside **"StutterLab"** in `--text-lg` Inter Bold, with an **"AI"** badge in Clarity Teal.
- **Background:** Transparent over `--color-bg-primary`.
- **Padding:** `--space-4` horizontal, `--space-3` vertical.

### Hero / Summary Card

- **Background:** `--color-bg-surface` with `--radius-md` corners.
- **Padding:** `--space-6` all sides.
- **Headline:** `--text-2xl` Inter Bold — e.g. _"Your Fluency Journey Continues!"_
- **Chart area:** Fluency Green (`--color-success`) line on a subtle grid. Axis labels in `--text-xs` at 50% opacity.
- **Key stat callout:** `--text-2xl` in Sunset Amber — e.g. **"25% Reduction This Month"** — with a `--text-sm` amber label beneath.

### Practice Tiles

- **Layout:** Horizontal scroll or equal-width grid (3 columns on mobile).
- **Tile size:** Square-ish, min `96px` wide.
- **Background:** `--color-bg-surface` with `--radius-md`.
- **Icon:** 32px Fluency Green icon, centered.
- **Label:** `--text-sm` Inter Bold, centered below icon with `--space-2` gap.
- **Padding:** `--space-4` all sides.
- **Section heading:** `--text-lg` Inter Bold — e.g. _"Daily Practice"_ — with `--space-6` top margin.

### Bottom Navigation Bar

- **Background:** `--color-bg-surface` with a 1px top border at 10% white opacity.
- **Items:** 4 tabs — Home, Report, Community, Settings.
- **Active state:** Fluency Green icon + label.
- **Inactive state:** 50% white opacity icon + label.
- **Icon size:** 24px. Label: `--text-xs`.
- **Padding:** `--space-2` vertical per item.

### General Card Pattern

- **Background:** `--color-bg-primary` + `--elevation-1` overlay (5% white at rest).
- **Hover / pressed:** Raise to `--elevation-2` (7%) or `--elevation-8` (12%).
- **Border:** 1px solid white at 6% opacity for subtle edge definition.
- **Border radius:** `--radius-md` (8px)
- **Padding:** `--space-4` to `--space-6`
- **Elevation:** White overlay system — no box-shadows. See [Elevation](#-elevation-dark-theme).
- **Spacing between cards:** `--space-4`

### Stat Cards (Analytics Pattern)

Inspired by a data-dense dashboard layout. Each card leads with the number.

**Card anatomy (top to bottom):**

| Layer            | Token / Style                                  | Example                  |
| ---------------- | ---------------------------------------------- | ------------------------ |
| Category label   | `--text-xs` Inter Regular, 50% white opacity   | "Speech Clarity"         |
| Hero metric      | `--text-2xl` Inter Bold, full white             | "25%"                    |
| Delta / subtitle | `--text-xs` Fluency Green or Sunset Amber       | "+12.3% this week"       |
| Inline chart     | Optional — sits below the delta, fills card width | Mini line or bar chart  |
| Action button    | Optional — `--text-sm` bold, accent background  | "SAVE", "DETAILS"        |

**Layout rules:**
- **Grid:** 2-column masonry with `--space-4` gap. Cards can span different heights.
- **Internal spacing:** `--space-4` padding, `--space-1` between label and metric, `--space-2` between metric and delta.
- **Section heading:** `--text-lg` Inter Bold, left-aligned, `--space-6` bottom margin — e.g. _"Weekly Stats"_.

**Color coding for deltas:**
- Positive change: Fluency Green (`--color-success`)
- Negative / needs attention: Sunset Amber (`--color-accent-secondary`)
- Neutral: 50% white opacity

### Stat / Progress Charts

- **Line charts:** Fluency Green stroke (`2px`), no fill or a 10% green gradient fill.
- **Bar charts:** Accent color fill with `--radius-sm` (4px) top corners, `--space-1` gap between bars.
- **Callout numbers:** `--text-2xl` Sunset Amber for key metrics.
- **Supporting text:** `--text-sm` at 60% white opacity.
- **Legend dots:** 8px circles using the respective data color.
- **Axes:** `--text-xs` at 40% white opacity, no heavy gridlines — use 5% white horizontal rules if needed.

### Floating Action Button (FAB)

- **Size:** 56px circle.
- **Background:** Clarity Teal (`--color-accent-primary`).
- **Icon:** 24px, `--color-bg-primary` (dark on teal).
- **Position:** Bottom-right, `--space-4` from edges.
- **Use:** Primary creation action — e.g. "New Session", "Add Goal".

---

## Voice & Tone

| Context            | Tone                                                              |
| ------------------ | ----------------------------------------------------------------- |
| Onboarding         | Warm, encouraging — _"You're in the right place."_               |
| During Exercises   | Calm, precise — _"Let's try that phrase one more time."_         |
| Progress Reports   | Celebratory, data-driven — _"Your fluency improved 12% this week."_ |
| Error States       | Gentle, reassuring — _"No worries — let's pick up where you left off."_ |

---

*Marketing strategy has been moved to [MARKETING.md](MARKETING.md).*

*StutterLab — Where science meets the joy of speaking freely.*
