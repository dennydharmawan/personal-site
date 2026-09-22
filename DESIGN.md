---
name: Denny Dharmawan personal site
description: One-page portfolio for a full-stack engineer who builds regulated banking systems
colors:
  # Values are the stock Tailwind v4 palette entries. The palette name in the comment is normative.
  primary: "oklch(21% 0.006 285.885)"            # zinc-900: primary button, logo mark, headings, --primary
  primary-hover: "oklch(27.4% 0.006 286.033)"    # zinc-800: primary button hover
  on-primary: "#fff"                             # white
  background: "#fff"                             # white: hero, expertise, about section
  surface-muted: "oklch(98.5% 0 0)"              # zinc-50: work samples, footer
  surface-card: "oklch(96.7% 0.001 286.375)"     # zinc-100: bento cards, layer pills
  surface-dark: "oklch(37% 0.013 285.805)"       # zinc-700: experience section, about card
  surface-dark-raised: "oklch(44.2% 0.017 285.786)" # zinc-600: photo window inside the about card
  glass-fill: "oklch(100% 0 0 / 5%)"             # white/5: glass panels on the about card
  glass-ring: "oklch(100% 0 0 / 10%)"            # white/10: glass panel ring, window borders on dark
  text: "oklch(21% 0.006 285.885)"               # zinc-900
  text-body: "oklch(44.2% 0.017 285.786)"        # zinc-600: body copy on light
  text-muted: "oklch(55.2% 0.016 285.938)"       # zinc-500: second tone of headings, captions
  text-on-dark: "oklch(98.5% 0 0)"               # zinc-50
  text-on-dark-body: "oklch(87.1% 0.006 286.286)" # zinc-300: body copy on dark
  border: "oklch(92% 0.004 286.32)"              # zinc-200: --border, bento cards, hero rule
  accent: "oklch(58.8% 0.158 241.966)"           # sky-600: --ring, caret
  accent-text: "oklch(50% 0.134 242.749)"        # sky-700: role label, logo hover
  accent-on-dark: "oklch(82.8% 0.111 230.318)"   # sky-300: resume link on zinc-700
  accent-dust: "oklch(90.1% 0.058 230.902)"      # sky-200: about dust, text selection
  pass: "oklch(69.6% 0.17 162.48)"               # emerald-500: instrument status only
  chip-secondary: "oklch(49.1% 0.27 292.581)"    # violet-700: instrument chip only
  chip-alert: "oklch(51.4% 0.222 16.935)"        # rose-700: instrument chip only, --destructive is rose-600
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "5rem"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  body-small:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7143
  label:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  caption:
    fontFamily: "Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  photo: "24px"
  feature: "32px"
  full: "9999px"
spacing:
  section-y: "80px"
  section-y-md: "112px"
  section-y-lg: "128px"
  header-to-content: "48px"
  header-to-content-md: "64px"
  two-column-gap: "40px"
  two-column-gap-lg: "64px"
  detail-stack: "24px"
  list-gap: "12px"
  shell-gutter: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    height: "44px"
  button-outline-pill:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 16px"
  layer-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  project-card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  bento-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.2xl}"
  about-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.feature}"
    padding: "24px"
  glass-panel:
    backgroundColor: "{colors.glass-fill}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.3xl}"
    padding: "24px"
---

# Design System: Denny Dharmawan personal site

## Stale since the 2026-09-20 refresh

This document describes the page as it stood at commit 3317266. The refresh that
followed changed these things and this document has not been rewritten yet.

- First paint. The server HTML now renders visible. Above-the-fold entrances run on the
  CSS `animate-rise-in` utility in `global.css` with a `--rise-delay` stagger from
  `riseDelay()` in `shared.tsx`. `Reveal` still animates below-the-fold content on scroll
  but no longer ships `opacity: 0` from the server. The hero on-mount reveal is gone.
- Focus. One unlayered `:focus-visible` outline in `global.css`, coloured by the
  `--focus-ring` token, which flips to sky-300 on `bg-zinc-700`, `bg-zinc-800` and
  `bg-zinc-900`. Per-component focus rings were removed.
- Anchors. Nav jumps land at 57 px, matching the compact header, not 76 px.
- Header. A mobile nav below `sm` in `mobile-nav.tsx`. Section deep links resolve.
- Hero. The photo is three responsive bands in AVIF and WebP, built by
  `scripts/build-hero-photo.sh` from `scripts/assets/`. The proof row is top-aligned.
- Work samples. A request-path strip precedes a single column of cards. From `lg` the
  clip sits beside the write-up. Card bullets are open by default.
- Expertise. A two-column layout between `md` and `lg`. The instruments now draw the
  access path, the PR-reviewer pipeline, and the shipped engineering standards.
- About. Rewritten again as a portrait and bio on white, with no figures. A DD monogram
  holds the 4:5 portrait frame until a photo is supplied. The night-sky card, `DotField`,
  and the uptime monitor are gone, so the surface rhythm is now light, light, dark, light,
  light, light.
- Footer. A resume link and a Jakarta availability line. Instagram removed.
- Section heights in the table below are stale.


## Overview

A single-page portfolio built as Astro 7 with React 19 islands and Tailwind v4. The reader is a hiring manager or engineering lead. The page shows working systems before it makes claims. Work samples play real interface recordings. Expertise cards run live instruments. Experience lists every role in full.

The look is neutral and quiet. Zinc carries every surface and all text. Sky is the only brand hue. Two dark zinc-700 surfaces break up a light page. Ambient motion is small dust and slow instrument loops.

The page is six sections under a fixed header. Heights are measured at 1280 px wide.

| Section | File | Surface | Height |
| --- | --- | --- | --- |
| Hero | `hero.tsx` | light, white | 891 px |
| Work samples | `work-samples.tsx` | light, zinc-50 | 1,732 px |
| Experience | `experience.tsx` | dark, zinc-700 | 1,201 px |
| Expertise | `expertise.tsx` | light, white | 1,401 px |
| About | `about.tsx` | white section holding one dark zinc-700 card | 764 px |
| Footer | `site-footer.tsx` | light, zinc-50 | 543 px |

The page totals 6,531 px. The per-section figures are rounded, so they sum to 6,532.

**Key Characteristics:**
- Zinc neutrals, one sky accent, stock Tailwind palette only.
- Bricolage Grotesque headings at weight 400. Instrument Sans for everything else.
- Light, light, dark, light, dark card, light.
- Flat cards with hairline rings. Shadows only on windows and menus.
- Ambient loops drift under 6 px and never resync.

## Colors

Every color resolves to a stock Tailwind v4 palette value. `AGENTS.md` holds the rule. Semantic tokens live in `:root` in `src/styles/global.css` and point at palette variables.

### Primary
- **Near-black zinc** (zinc-900, `--primary`). Primary button, logo mark, headings, body foreground. Hover is zinc-800 and active is zinc-950.
- **Sky.** The only brand hue. Sky-600 is `--ring` and the caret. Sky-700 is the role label on work cards and the logo hover. Sky-50 and sky-800 back the `--accent` token pair. Sky-200 is the text selection and the about dust. Sky-100 through sky-400 tint the hero backdrop at 40% opacity. Sky-400 at 45% fills the bullet marker. Sky-500 lights the footer social icons on hover.

### Secondary
- **Emerald, violet, rose.** Status colors inside `capability-instruments.tsx` only. Emerald marks pass or healthy. Violet is the secondary chip. Rose is the alert chip. Each uses the 50, 200, and 700 steps for fill, border, and text. Emerald-500 is the status dot.

### Neutral
- **White.** Hero, expertise, and about section backgrounds. Project cards, bento windows, outline buttons.
- **Zinc-50.** Work samples and footer backgrounds. Also `--muted`.
- **Zinc-100.** Bento cards and layer pills. Also `--secondary`.
- **Zinc-200.** `--border`. Bento card borders and the hero bottom rule.
- **Zinc-500.** The second tone of two-tone headings, captions, and `--muted-foreground`.
- **Zinc-600 and zinc-700 text.** Body copy on light is zinc-600. The hero lede and proof row use zinc-700.
- **Zinc-700 surface.** Both dark surfaces. Zinc-600 is the raised photo window inside the about card.
- **Text on dark.** Headings are zinc-50 or white. Body is zinc-300. Company names and highlights are zinc-200. Zinc-400 appears only on the date column of the sticky company list and on window dots.
- **Hairlines.** Light cards use `ring-zinc-900/5` or `ring-zinc-900/10`. The footer uses `border-zinc-900/6` and `border-zinc-900/10`. Dark surfaces use `border-white/10`, `border-white/15`, and `ring-white/10`.

### Named Rules
**The Stock Palette Rule.** No hex, `rgb()`, `hsl()`, or `oklch()` literal in a component. Reach for a semantic token first, then a palette utility, then `var(--color-*)`. Transparency uses the slash modifier or `--alpha()`.

**The One Dark Value Rule.** Every dark surface is zinc-700. Depth on dark comes from zinc-600, `bg-white/5`, and white hairlines.

**The Sky On Dark Rule.** On zinc-700, sky appears as the sky-300 resume link and the sky-200 dust. Names, dates, and markers stay zinc.

## Typography

**Display Font:** Bricolage Grotesque Variable (falls back to the body stack). Exposed as `font-heading`.
**Body Font:** Instrument Sans Variable (with ui-sans-serif, system-ui, sans-serif). Exposed as `font-sans` and set on `html`.
**Mono:** the default `font-mono` stack, used only for code and terminal text inside the instruments at 11 px.

Both families are self-hosted variable fonts with `font-display: optional`.

### Hierarchy
- **Display** (400, 2.5rem at leading 1.04, then 3.5rem from `sm` and 5rem from `lg` at leading 0.96, `tracking-tight`). The hero headline. The footer headline is its sibling at `text-4xl`, `sm:text-5xl`, `lg:text-7xl`, leading 1.02.
- **Headline** (400, `text-4xl` then `sm:text-5xl`, `tracking-tight`, `text-balance`). Every section `h2`.
- **Title** (400, `text-2xl`, `leading-tight`, `tracking-tight`). Project titles and bento headings. Role titles grow to `sm:text-3xl`. Bento headings grow to 1.75rem.
- **Body** (400, `text-base`, `leading-7`, `text-pretty`). Section intros, role summaries, about paragraphs. Measure is capped at `max-w-xl`, `max-w-2xl`, or `60ch`.
- **Small body** (400, `text-sm`, `leading-6`). Project summaries and bullets. Experience highlights sit at 0.9375rem.
- **Label** (500, `text-sm`). Nav items, company names, the trusted line, socials, the details toggle.
- **Caption** (`text-xs` for the stack line and layer pills, 0.8125rem at `leading-5` for about panel captions, 11 px at 500 for window labels).
- **Stat** (600, `tabular-nums`). The hero years figure is Instrument Sans at `text-5xl`, `leading-none`. The about facts are Bricolage at `text-2xl`.

### Named Rules
**The Two-Tone Heading Rule.** A heading may split into two tones. The first part is zinc-900 and the second is zinc-500. The hero, the footer, and every bento heading do this.

**The Weight 400 Rule.** Headings in Bricolage stay at weight 400 with `tracking-tight`. Semibold is for stats and the header name.

## Layout

The page shell is `pageShellClassName`, a centered column of `min(1280px, 100% - 2.5rem)`. Spacing classes live in `src/components/sections/shared.tsx`.

| Export | Classes | Values |
| --- | --- | --- |
| `sectionPaddingTopClassName` | `pt-20 md:pt-28 lg:pt-32` | 80, 112, 128 px |
| `sectionPaddingBottomClassName` | `pb-20 md:pb-28 lg:pb-32` | 80, 112, 128 px |
| `sectionPaddingClassName` | both of the above | |
| `sectionHeaderMarginClassName` | `mb-12 md:mb-16` | 48, 64 px |
| `sectionHeaderClassName` | `grid max-w-3xl gap-4` plus the margin | |
| `sectionHeaderCenteredClassName` | the header plus `mx-auto justify-items-center text-center` | |
| `twoColumnGapClassName` | `gap-10 lg:gap-16` | 40, 64 px |
| `detailStackGapClassName` | `gap-6` | 24 px |
| `listGapClassName` | `gap-3` | 12 px |
| `sectionContentGapClassName` | `gap-16 md:gap-20 lg:gap-28` | exported, not used by any shipped section |

Work samples, experience, and expertise take `sectionPaddingClassName`. About takes only the bottom padding because it follows expertise on the same white surface. The footer takes only the top padding and closes with `pb-12`. The hero sets its own padding, `pt-24 sm:pt-28` and `pb-16 md:pb-20 lg:pb-24`, to clear the fixed header.

Anchor scrolling uses `data-scroll-target` attributes and `scrollToTarget`, with a 76 px offset. `html` sets `scroll-padding-top: 5rem`.

### Header
Fixed, transparent at the top of the page. After 28 px of scroll it takes a white 86% fill, a zinc-200 border, and `backdrop-blur`. Height animates from 72 px to 56 px. Left is the logo mark with the name and a zinc-500 role line. Right is four nav buttons, hidden below `sm`, and an outline email button that shows the address from `lg`.

### Hero, 891 px
A stacked headline sits over a framed photo band. The photo is 18rem tall at `lg` with a 24 px radius and a `ring-zinc-900/5` hairline. Below it a two-column row holds the proof block on the left and the lede plus actions on the right. The proof block pairs the trusted line and grayscale logos with the years figure. The backdrop is a sky radial gradient under 1 px white vertical lines, masked away from the top. A zinc-200 rule closes the section.

Known issue. The hero runs 91 px past an 800 px viewport. The owner chose to keep it.

### Work samples, 1,732 px
A centered header, then a two-column card grid from `md` with `gap-6 lg:gap-8`. Each card is white with a 22 px radius and `p-4 sm:p-5`. The clip sits on top at 3:2 with an 18 px radius. It plays a muted looping video while 40% in view and swaps to the poster image under reduced motion. Under the clip sit the role and layer pills, the title, a summary, and a `details` toggle. The toggle reads "How it works" closed and "Hide details" open, and holds the bullets. A zinc-500 stack line closes the card.

### Experience, 1,201 px
A zinc-700 section with a two-column grid at `lg`, `0.7fr` to `1.3fr`. The left column is sticky at `top-28`. It holds the heading, a one-line intro, the resume link, and a company and date list that shows from `lg` only. The right column lists every role fully expanded. Each role has a company and period row, the role title, a summary, and highlights with play markers. A company with more than one title lists each title and its dates under the heading, newest first, behind a `border-white/15` left rule. Roles are separated by `border-white/15` rules with `py-8`.

### Expertise, 1,401 px
A two-column header with the heading left and the intro right. Below it a six-column bento at `lg` with `gap-4 lg:gap-6`. Two wide cards span three columns at a 31rem minimum height. Three cards span two columns at 27rem. Four cards hold an instrument window. The fifth holds the stack grid, faded out at the bottom by a mask. Every card has a particle dust backdrop.

### About, 764 px
One night-sky card on a white section. The card is zinc-700 with a 32 px radius and `p-4 sm:p-6`. `DotField` dust in sky-200 covers the whole card, masked to fade from the top right. Inside is a six-column grid at `lg`. The headline and two paragraphs span four columns with no panel behind them. Glass panels hold the photo window across two columns, two single-column facts, and a four-column background row with three entries.

### Footer, 543 px
A zinc-50 footer split `1.3fr` to `0.7fr` at `lg`, aligned to the bottom. Left is the two-tone headline and the email menu. Right is a blurb and three social links stacked under a `border-zinc-900/10` rule. A bottom bar holds the copyright line and a pill "Back to top" button.

## Elevation & Depth

Surfaces are flat. Cards separate from the page by a hairline ring or border, not a shadow. Shadows mark things that float, which are windows inside cards and menus.

### Shadow Vocabulary
- **Bento window** (`0 28px 56px -24px` of zinc-900 at 30%). The instrument windows in the expertise cards.
- **Night window** (`0 -16px 64px -16px` of black at 50%). The photo window on the about card. It casts upward because the window bleeds off the bottom edge.
- **Menu** (`shadow-lg`). The email action menu.
- **Nav pill** (`shadow-sm` with `ring-zinc-300/70`). The hover pill behind header nav items.

Shadow color is zinc-900 on light and black on dark, written with `--alpha(var(--color-*))`.

## Shapes

`--radius` is 0.625rem, and the theme derives the scale from it. This makes `rounded-3xl` 22 px, not the Tailwind default.

- **6 px** (`rounded-sm`). Focus shape on text links.
- **8 px** (`rounded-md`). Layer pills and the details toggle.
- **10 px** (`rounded-lg`). Buttons.
- **14 px** (`rounded-xl`). Nav items, menu items, bento window tops.
- **18 px** (`rounded-2xl`). Bento cards, project clips, the email menu, the photo window corner.
- **22 px** (`rounded-3xl`). Project cards and glass panels.
- **24 px** (`rounded-[1.5rem]`). The hero photo.
- **32 px** (`rounded-[2rem]`). The about card.
- **Full.** Window dots, the footer email button, "Back to top".

Windows bleed off their card. Bento windows have no bottom border, and wide ones also lose the right border and corner. The about photo window keeps only its top-left corner. Nested radii step down from the container.

## Components

### Buttons
- **Shape:** 10 px radius. Hero and footer buttons are 44 px tall via `min-h-11`. Header controls are 40 px.
- **Primary:** zinc-900 fill, white text. Hover zinc-800. Active zinc-950.
- **Outline:** white fill, zinc-200 border, zinc-900 text. Hover fills zinc-50.
- **Outline pill:** the footer email menu and "Back to top". Full radius, `border-zinc-900/10`, hover `border-zinc-900/20`, fill stays white.
- **States:** press scales to 0.96. Focus shows a sky-600 border and a 3 px ring at 50%.

### Links and focus
Text links show `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` on a `rounded-sm` shape. On zinc-700 the offset color is `ring-offset-zinc-700`. Footer socials are zinc-600 text with a zinc-400 icon. On hover the text goes zinc-900, the icon goes sky-500, and the arrow nudges 2 px up and right.

### Layer pills
Zinc-100 fill, zinc-600 text, `text-xs font-medium`, 8 px radius, `px-2.5 py-1`.

### Play bullet marker
`PlayBulletMarker` in `shared.tsx`. A 14 px outlined triangle over a sky-400 fill at 45%, offset down and left. The stroke takes `currentColor`. It is zinc-400 by default and zinc-500 on work cards.

### Bento card and window
The card is zinc-100 with a zinc-200 border, an 18 px radius, and `overflow-hidden`. The heading pads `p-7 sm:p-9`. The window is white with a three-dot title bar and a centered 11 px label. It sits at the card bottom with `mt-auto`. Small cards inset the window `mx-7 sm:mx-9`. Wide cards inset it 18% from the left and bleed it off the right edge. The instrument overflows the window bottom by negative margin.

### Particle backdrop
`ParticleStream` fills each bento card behind its content. At rest about 150 dots float within 5 px. On hover the dust gathers into lanes. The five cards use `arcs`, `braid`, `waves`, `arcs`, and `columns`. The first card runs the `spiral` pattern under a radial mask. Each card has its own seed. Drawing stops off screen and under reduced motion.

### Night-sky card and glass panel
The about card is zinc-700 with `DotField` dust across the whole card. A pulse ripples every 6 seconds from the laptop in the photo, at origin `[0.84, 0.42]`. Glass panels are `rounded-3xl bg-white/5 ring-1 ring-white/10` with `p-6`. The photo window is zinc-600 with `border-white/10` and zinc-400 dots.

### Email action menu
A pill button shows the address and a chevron that rotates 180 degrees when open. The menu is white with an 18 px radius, `border-zinc-900/8`, and `shadow-lg`. Two items, "Copy email" and "Send email", hover to zinc-50. The copy label reads "Copied" or "Copy failed" for 1.6 seconds. Escape and outside clicks close it.

### Motion
All motion uses `motion/react`.

- **Reveal.** `Reveal`, `RevealGroup`, and `RevealItem` in `shared.tsx`. Items rise 12 px over 0.6 s on `revealEase` `[0.22, 1, 0.36, 1]` and fade over 0.4 s linear. They fire once when 10% inside the viewport. The move is a `transform` string so it runs on the compositor. Groups stagger by 0.08 s. Expertise cards and about panels use 0.1 s.
- **Hero load.** The hero is the one group that reveals on mount, with a 0.1 s stagger.
- **Header.** Fill, border, and height ease over 0.28 s on `easeOut` `[0.2, 0, 0, 1]`. Logo and nav items enter on `spring`, which is `{ bounce: 0, duration: 0.3 }`. The nav hover pill shares one `layoutId` and blurs in.
- **Loops.** Every looping instrument animation goes through `cycle()` in `src/components/capability-instruments.tsx`. It returns `{}` under reduced motion. Each element gets its own duration and delay so a group never resyncs. `docs/attio-motion-notes.md` holds the reasoning.
- **Reduced motion.** React transitions drop to `{ duration: 0 }`. `global.css` also collapses CSS animation and transition durations and turns off smooth scroll.

## Do's and Don'ts

### Do:
- **Do** keep ambient drift under about 6 px and ambient opacity low.
- **Do** give each looping element its own duration and delay.
- **Do** build section padding from the classes in `shared.tsx`.
- **Do** drop the top padding when a section follows another on the same surface, as about does.
- **Do** keep interactive targets 44 px tall outside the header.
- **Do** change the brand color by editing `--primary` in `global.css`.

### Don't:
- **Don't** write a color literal in a component. Static SVGs in `public/` are the exception.
- **Don't** mix a second gray family into zinc.
- **Don't** use a dark surface other than zinc-700.
- **Don't** give two bento cards the same seed, or a whole group one loop timing.
- **Don't** add a scroll-linked animation. The page has none.

## Adding or changing a section

- Each section is one file under `src/components/sections/` and exports one component.
- `src/components/portfolio-home.tsx` only composes. It imports the sections and orders them inside `main`. Keep layout and copy out of it.
- Shared helpers live in `shared.tsx`. These are the page shell, spacing classes, reveal wrappers, easing, scroll helpers, `contactEmail`, and `PlayBulletMarker`.
- Wrap content in `pageShellClassName`. Take padding from `sectionPaddingClassName` or one of its halves.
- Wrap entering content in `RevealGroup` and `RevealItem`.
- To make a section a nav target, add `data-scroll-target` and an entry in `navItems` in `site-header.tsx`.
- Keep the surface rhythm in mind. A new dark section next to experience or about would break light, light, dark, light, dark card, light.
- Content arrays live in `src/components/portfolio-home-data.ts`. A helper used by one section stays in that section's file.
