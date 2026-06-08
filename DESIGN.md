---
name: Denny Dharmawan Portfolio
description: A Stripe-inspired personal portfolio for precise, reliable, product-minded full-stack engineering work.
colors:
  stripe-primary-reference: "#533afd"
  primary: "#4f46e5"
  primary-hover: "#4338ca"
  primary-press: "#3730a3"
  ink: "#0f172a"
  ink-deep: "#020617"
  ink-secondary: "#334155"
  ink-muted: "#475569"
  ink-soft: "#64748b"
  canvas: "#ffffff"
  canvas-soft: "#f8fafc"
  hairline: "#e2e8f0"
  hairline-strong: "#cbd5e1"
  dark-surface: "#020617"
  dark-card: "#0f172a"
  sky-soft: "#e0f2fe"
  sky-line: "#7dd3fc"
  emerald-soft: "#d1fae5"
  emerald-glow: "#6ee7b7"
  emerald-dot: "#34d399"
typography:
  display:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: "0"
    fontFeature: "ss01"
  headline:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "0"
    fontFeature: "ss01"
  title:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "0"
    fontFeature: "ss01"
  body:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.75
    letterSpacing: "0"
    fontFeature: "ss01"
  label:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
    fontFeature: "ss01"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  surface: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "36px"
  surface-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "24px"
  dark-panel:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: Denny Dharmawan Portfolio

## 1. Overview

**Creative North Star: "Financial Infrastructure, Personal Scale"**

This portfolio borrows Stripe's disciplined financial-infrastructure language: deep navy ink, a precise indigo action color, clean white surfaces, hairline borders, and atmospheric gradient bands. It adapts that language for a person, not a payments company. The page should feel like a serious engineer's operating surface, with enough visual signature to be memorable and enough restraint to keep the work credible.

The system rejects generic AI SaaS gloss, loud seniority signaling, and gimmicky portfolio tricks. Visual energy belongs in the hero atmosphere, product screenshots, and a few crafted interactions. Copy, layout, and component treatment should stay calm, specific, and recruiter-readable.

**Key Characteristics:**
- Stripe-inspired indigo is the primary action color, mapped to Tailwind `indigo-600` as the closest native token to `#533afd`.
- Deep slate navy is the ink and dark-panel language, matching Stripe's deep financial-infrastructure feel without copying the brand.
- White and cool off-white surfaces carry most of the page; color appears as atmosphere, actions, and small signal marks.
- Inter Variable approximates Stripe's thin display rhythm with weight 300, `ss01`, balanced headings, and tabular numerals for metrics.
- Cards are crisp and lightly framed; avoid wide decorative shadows paired with borders.

## 2. Colors

The palette is Stripe-inspired but portfolio-owned: indigo for action, slate for credibility, sky and emerald for atmosphere and status, white for scanability.

### Primary
- **Stripe Reference Indigo** (`#533afd`): Source color from the Stripe design markdown. Use as reference only; do not hard-code unless a future token migration makes it intentional.
- **Portfolio Indigo** (`#4f46e5`, Tailwind `indigo-600`): Primary CTA fill, logo mark, focused controls, and the rare inline emphasis.
- **Portfolio Indigo Hover** (`#4338ca`, Tailwind `indigo-700`): Hover and active emphasis on primary controls.
- **Portfolio Indigo Press** (`#3730a3`, Tailwind `indigo-800`): Pressed state for primary buttons.

### Secondary
- **Sky Signal** (`#7dd3fc`, Tailwind `sky-300`): Dark-section accents, checked icons on dark surfaces, and fine divider lines when indigo would feel too purple.
- **Emerald Availability** (`#34d399`, Tailwind `emerald-400`): Availability dot and subtle status glow.

### Tertiary
- **Sky Wash** (`#e0f2fe`, Tailwind `sky-100`): Hero gradient atmosphere.
- **Emerald Wash** (`#d1fae5`, Tailwind `emerald-100`): Hero gradient atmosphere.
- **Emerald Glow** (`#6ee7b7`, Tailwind `emerald-300`): Soft atmospheric gradient stop, never body text.

### Neutral
- **Ink** (`#0f172a`, Tailwind `slate-900`): Primary text and display type.
- **Deep Ink** (`#020617`, Tailwind `slate-950`): Dark panels and strongest text.
- **Secondary Ink** (`#334155`, Tailwind `slate-700`): Strong body text and nav text.
- **Muted Ink** (`#475569`, Tailwind `slate-600`): Body copy, experience details, and footer metadata.
- **Soft Ink** (`#64748b`, Tailwind `slate-500`): Low-emphasis metadata such as project roles and stack text.
- **Canvas** (`#ffffff`, Tailwind `white`): Main page background and cards.
- **Soft Canvas** (`#f8fafc`, Tailwind `slate-50`): Section bands.
- **Hairline** (`#e2e8f0`, Tailwind `slate-200`): Borders and dividers.
- **Strong Hairline** (`#cbd5e1`, Tailwind `slate-300`): Footer separators and quiet structural rules.

### Named Rules

**The One Indigo Rule.** Indigo may own primary actions, the DD logo, and rare navigational emphasis. It should not become body text, repeated badges, or the default hover for every heading.

**The Gradient-as-Atmosphere Rule.** The hero can carry a soft Stripe-inspired wash. Sections below should mostly return to white, cool off-white, and dark slate.

## 3. Typography

**Display Font:** Inter Variable, with Inter and system-ui fallback
**Body Font:** Inter Variable, with Inter and system-ui fallback
**Label/Mono Font:** Inter Variable; do not introduce a mono font unless rendering code or data snippets.

**Character:** The type system is thin, open, and technical without becoming terminal-like. It borrows Stripe's light display posture, but keeps letter spacing at `0` to avoid cramped generated-page typography.

### Hierarchy
- **Display** (300, `clamp(3rem, 6vw, 3.75rem)`, `1.03`): Hero headline only. Keep max size below 6rem.
- **Headline** (300, `clamp(2.25rem, 4vw, 3rem)`, `1.1`): Section openers such as selected work, experience, strengths, and footer.
- **Title** (300, `2rem`, `1.15`): Project titles and role headings.
- **Body** (300, `1rem`, `1.75`): Long explanatory copy, capped around 65 to 75 characters.
- **Label** (500, `0.875rem`, `1.4`): Section labels, metadata, navigation, and button text. Sentence case by default.

### Named Rules

**The Light-But-Legible Rule.** Weight 300 is acceptable for display and body because the page uses high-contrast slate ink. If text sits on dark or tinted surfaces, increase contrast before increasing decoration.

**The No Eyebrow Scaffold Rule.** Section labels may use a leading rule, but they stay sentence-case and moderate. Do not return to tiny uppercase tracked labels above every section.

## 4. Elevation

Depth is mostly structural, not decorative. Use hairline borders, tonal layering, and screenshot framing first. Shadows are allowed for primary controls, the DD mark, and a few interactive screenshot surfaces, but they should stay small unless the element is actively floating over a visual composition.

### Shadow Vocabulary
- **Low control shadow** (`0 1px 2px rgb(0 0 0 / 0.05)`): Buttons, logo marks, and small controls.
- **Low card shadow** (`0 1px 2px rgb(15 23 42 / 0.08)`): Resting cards when a border alone is too flat.
- **Interactive lift** (`0 8px 24px rgb(148 163 184 / 0.25)`): Hover-only lift for key cards, used sparingly.
- **Dark overlay shadow** (`0 12px 32px rgb(2 6 23 / 0.30)`): Overlay copy on screenshots and dark UI panels.

### Named Rules

**The Border-or-Shadow Rule.** Do not pair a 1px border with a wide decorative shadow at rest. Use a border plus a small shadow, or a larger shadow only when the element floats above imagery.

## 5. Components

### Buttons

- **Shape:** Rounded rectangle (`10px`) rather than full pill. Stripe's pill energy is translated into compact, decisive controls that fit the portfolio's shadcn-style system.
- **Primary:** Tailwind `indigo-600` background, white text, `h-10`, compact horizontal padding, icon allowed inline-end.
- **Hover / Focus:** Hover moves to `indigo-700`, active to `indigo-800`, focus uses the global ring token. Keep `active:scale-[0.96]`.
- **Secondary / Outline:** White background, slate text, slate hairline border, muted hover surface.

### Chips

- **Style:** Avoid badge proliferation. Prefer inline metadata with slate text and dot separators for tech stacks.
- **State:** Use soft indigo pills only when the element is genuinely categorical or selected. Do not use pill badges for every role, status, and tool.

### Cards / Containers

- **Corner Style:** `12px` to `16px` for cards and framed screenshots. Do not exceed `16px` on normal cards.
- **Background:** White cards on `slate-50` section bands, dark slate panels for the technical-strength section and hero availability panel.
- **Shadow Strategy:** Resting cards use border plus small shadow at most. Screenshot frames can use stronger depth only when layered over imagery.
- **Border:** `slate-200` on light surfaces, `slate-800` on dark surfaces.
- **Internal Padding:** `20px` to `24px` for cards, `64px` to `96px` for section rhythm.

### Inputs / Fields

The current site has no form inputs. If a contact form is added later, use white background, `slate-200` border, `8px` radius, `indigo-600` focus ring, and placeholder text dark enough to pass WCAG AA.

### Navigation

- **Desktop:** Fixed top nav integrated with the hero at rest. On scroll, it compacts to a white translucent band with a bottom border.
- **Hover:** Nav item hover uses the moving white pill background. Keep it subtle and border-backed, not a bright filled pill.
- **Mobile:** Keep the brand link and resume action visible. Section links may collapse away unless a mobile menu is intentionally designed.
- **Hash behavior:** Internal scroll actions should not leave URL hashes. External links and resume remain normal links.

### Signature Component

**Footer Link Arrow:** A Stripe-inspired two-part arrow. The shaft scales outward and the chevron translates so the body appears to push the head. Reduced motion disables the transition.

## 6. Do's and Don'ts

### Do:
- **Do** use Tailwind `indigo-600` as the closest native implementation of Stripe's `#533afd` primary reference.
- **Do** keep most text in slate, especially `slate-900`, `slate-700`, and `slate-600`.
- **Do** use tabular numerals for metrics such as `7+`, `37%`, and any future financial or performance numbers.
- **Do** keep section labels sentence-case with a quiet leading rule.
- **Do** use screenshots and concrete work examples as the main proof of engineering quality.
- **Do** support reduced motion for page entrances, hover interactions, and custom icon animations.

### Don't:
- **Don't** make the page feel like a generic AI SaaS landing page.
- **Don't** repeat seniority claims or recruiter-signal labels everywhere.
- **Don't** use gimmicky portfolio tricks that distract from engineering credibility.
- **Don't** turn every metadata item into a pill badge.
- **Don't** use indigo as body text or a default heading hover everywhere.
- **Don't** pair a 1px border with a wide soft shadow as a default card style.
- **Don't** use tiny uppercase tracked eyebrows above every section.
