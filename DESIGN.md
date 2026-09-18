---
name: Denny Dharmawan personal site
description: Portfolio for a full-stack engineer who builds regulated banking systems
colors:
  primary: "#18181b"          # zinc-900: logo mark, favicon, primary button
  primary-hover: "#27272a"    # zinc-800
  on-primary: "#ffffff"
  background: "#ffffff"
  surface-muted: "#fafafa"    # zinc-50: work samples, footer
  surface-card: "#f4f4f5"     # zinc-100: expertise cards
  surface-dark: "#3f3f46"     # zinc-700: experience section, about card
  surface-dark-raised: "#52525b" # zinc-600: window inside the about card
  text: "#18181b"             # zinc-900
  text-secondary: "#52525b"   # zinc-600
  text-muted: "#71717a"       # zinc-500: second line of two-tone headings
  text-on-dark: "#fafafa"     # zinc-50
  text-on-dark-secondary: "#d4d4d8" # zinc-300
  border: "#e4e4e7"           # zinc-200
  accent: "#0284c7"           # sky-600: focus ring, active marks
  accent-text: "#0369a1"      # sky-700: links and labels on light
  accent-on-dark: "#7dd3fc"   # sky-300: links on dark only
  pass: "#10b981"             # emerald-500
  chip-secondary: "#6d28d9"   # violet-700
  chip-alert: "#be123c"       # rose-700
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  control: "10px"
  card: "16px"
  feature: "32px"
  pill: "9999px"
spacing:
  section-mobile: "80px"
  section-md: "112px"
  section-lg: "128px"
  header-to-content: "64px"
  work-sample-gap: "112px"
  two-column-gap: "64px"
  card-inset: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    height: "44px"
  expertise-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.card}"
  about-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.feature}"
---

## Overview

A single-page portfolio. The visitor is a hiring manager or engineering lead deciding whether
to open a conversation, so the page shows working systems before it makes claims: animated
instruments inside the expertise cards, work samples with real interface previews, and a
timeline.

The look is neutral and quiet. Zinc carries every surface and all text. Sky is the only brand
colour and it appears sparingly. Emerald, violet and rose exist only as status chips inside the
illustrations.

## Colors

Every colour resolves to a stock Tailwind v4 palette value. `CLAUDE.md` holds the rule and the
order of preference: semantic token, then palette utility, then `var(--color-*)`.

- **Neutrals are zinc everywhere.** Do not reintroduce slate. Mixing the two grey families gives
  light areas a blue cast next to neutral dark areas.
- **Dark surfaces are `zinc-700`**, with `zinc-600` for a raised window inside them. `zinc-800`
  and `zinc-900` were tried and rejected as too dark. No coloured glow behind or under dark
  surfaces.
- **Sky on dark is for links and the active timeline dot only.** Company names, badges and
  bullet markers on dark are `zinc-200` or `zinc-400`. Sky text spread across a dark section
  reads as the generic "cyan on dark" look.
- Body text on dark is `zinc-300` or lighter. `zinc-400` on `zinc-700` is about 4:1 and fails
  for small text.
- Change the brand colour by editing `--primary` in `src/styles/global.css`, not by sweeping
  utilities.

## Typography

Bricolage Grotesque for headings at weight 400 with tight tracking. Instrument Sans for body and
labels. Both are self-hosted variable fonts.

- Headings use a two-tone pattern: the first line in `zinc-900`, the second in `zinc-500`.
- No eyebrow labels above headings and no all-caps tracked labels. They were removed; do not
  add them back. A label that carries information, like a project's domain, is sentence case at
  `text-sm font-medium`.
- Monospace is for code and terminal output inside the instruments, not for decoration.
- Body measure stays under `60ch` to `65ch`.

## Layout

Spacing tokens live at the top of `src/components/portfolio-home.tsx`.

| Role | Mobile | md | lg |
| --- | --- | --- | --- |
| Section padding, top and bottom | 80px | 112px | 128px |
| Section header to content | 48px | 64px | 64px |
| Gap between work samples | 64px | 80px | 112px |
| Two-column gap | 40px | 40px | 64px |

- The page shell is `min(1280px, 100% - 2.5rem)`.
- Two adjacent sections with the same background share one padding: the second drops its top
  padding. About does this after Expertise.
- The hero keeps 96px bottom padding so it fits one 900px screen.
- Everything sits on the 4px grid. The exceptions are the 6px icon gap in buttons and optical
  nudges on icons.
- Expertise cards: heading and window share a 36px inset on small cards. Wide cards inset the
  window 18% and let it bleed off the right edge. The minimum card height applies from `lg` up
  only.
- Interactive targets are at least 44px tall outside the header. The header controls are 40px
  because the header height is animated.

## Elevation & Depth

- Cards are flat with a 1px `zinc-200` border.
- Windows inside cards carry one long soft shadow, `0 28px 56px -24px` of `zinc-900` at 30%.
- On dark surfaces shadows are black, never coloured.

## Shapes

10px controls, 16px cards, 32px for the about card, full pills for chips and the outline
button. Particle dots are circles.

## Components

- **Particle backdrop** (`particle-stream.tsx`). Idle: about 150 round dots float in place
  within 5px. On hover the dust gathers, with extra dots fading in, into flowing lanes. The
  formation differs per card: `arcs`, `braid`, `waves`, `columns`. The first card runs an
  always-on spiral. Do not give every card the same formation.
- **Capability instruments** (`capability-instruments.tsx`). Every loop goes through `cycle()`,
  which returns nothing under reduced motion or when off screen.
- **Reveal**. Sections settle in: 12px rise over 0.6s with a 0.4s fade, once, ease
  `[0.22, 1, 0.36, 1]`. Keep it this short. The hero load sequence is the one authored moment.
- **Focus**. Every link and button shows a 2px `ring` (sky-600) with a 2px offset. On dark
  surfaces the offset colour matches the surface.

## Do's and Don'ts

- Do keep ambient drift under about 6px and give each looping element its own duration and
  delay.
- Do verify at 1440px and 375px before calling a change done.
- Don't hardcode a hex, `rgb()`, `hsl()` or `oklch()` in components. Static SVGs in `public/`
  are the exception.
- Don't add gradient glows, coloured shadows, or sky text as decoration on dark sections.
- Don't nest another bordered card inside an expertise card beyond the existing window.

### Known detector findings, accepted for now

`impeccable detect` on the rendered page reports 18 items. None are defects:

- Hero glow blobs (three radial glows, two cyan gradients). Pre-existing hero decoration.
- Expertise cards count as "card inside card" because of the window, and as "thin border plus
  wide shadow".
- The work-sample preview frame uses a repeating grid gradient.
- Four sky links on dark.
