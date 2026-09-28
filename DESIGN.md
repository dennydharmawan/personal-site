---
name: Denny Dharmawan personal site
description: One-page portfolio for a full-stack engineer who builds regulated banking systems
colors:
  # Values are the stock Tailwind v4 palette entries. The palette name in the comment is normative.
  primary: "oklch(21% 0.006 285.885)"             # zinc-900: primary button, logo mark, headings, --primary
  primary-hover: "oklch(27.4% 0.006 286.033)"     # zinc-800: primary button hover
  on-primary: "#fff"                              # white
  background: "#fff"                              # white: hero, expertise, about
  surface-muted: "oklch(98.5% 0 0)"               # zinc-50: work samples, footer, evidence cards
  surface-card: "oklch(96.7% 0.001 286.375)"      # zinc-100: bento cards, clip and film frames
  surface-dark: "oklch(27.4% 0.006 286.033)"      # zinc-800: the experience section
  hairline-on-dark: "oklch(100% 0 0 / 15%)"       # white/15: role rules and rail lines on zinc-900
  text: "oklch(21% 0.006 285.885)"                # zinc-900
  text-body-strong: "oklch(37% 0.013 285.805)"    # zinc-700: hero lede, work-sample write-ups, evidence text
  text-body: "oklch(44.2% 0.017 285.786)"         # zinc-600: section intros, footer copy, chips
  text-muted: "oklch(55.2% 0.016 285.938)"        # zinc-500: second tone of headings, labels, sources
  text-on-dark: "oklch(98.5% 0 0)"                # zinc-50: headings on zinc-900
  text-on-dark-strong: "oklch(92% 0.004 286.32)"  # zinc-200: company names and highlights on zinc-900
  text-on-dark-body: "oklch(87.1% 0.006 286.286)" # zinc-300: body copy and periods on zinc-900
  border: "oklch(92% 0.004 286.32)"               # zinc-200: --border, bento cards, hero rule
  accent: "oklch(58.8% 0.158 241.966)"            # sky-600: --ring, caret, focus ring, phrase underline, chapter progress
  accent-text: "oklch(50% 0.134 242.749)"         # sky-700: role label, See it links, logo hover
  accent-on-dark: "oklch(74.6% 0.16 232.661)"     # sky-400: role rail, bullet marker fill, glyph accent
  accent-signal: "oklch(68.5% 0.169 237.323)"     # sky-500: instrument runner dots, social icon hover
  accent-wash: "oklch(97.7% 0.013 236.62)"        # sky-50: active phrase wash, approval-queue node, --accent
  selection: "oklch(90.1% 0.058 230.902)"         # sky-200: text selection, approval-queue ring
  focus-on-dark: "oklch(82.8% 0.111 230.318)"     # sky-300: focus ring on zinc-700, zinc-800, and zinc-900
  pass: "oklch(69.6% 0.17 162.48)"                # emerald-500: in-production dot, uptime bar, availability dot
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
  preface:
    fontFamily: "Bricolage Grotesque Variable, Instrument Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.8vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.45
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
    fontWeight: 500
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  photo: "24px"
  full: "9999px"
spacing:
  section-y: "80px"
  section-y-md: "112px"
  section-y-lg: "128px"
  header-to-content: "48px"
  header-to-content-md: "64px"
  header-intro-gap: "16px"
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
  stack-chip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  clip-frame:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.2xl}"
    padding: "6px"
  bento-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.2xl}"
  evidence-card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-body-strong}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  evidence-card-active:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
  menu-button:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    size: "44px"
---

# Design System: Denny Dharmawan personal site

## Overview

A single-page portfolio built as Astro 7 with React 19 islands and Tailwind v4. The reader is a recruiter or an engineering lead. The page shows working systems before it makes claims. Work samples play animated walkthroughs with sample data. Expertise cards run live instruments. The about paragraph links each claim to the experience bullet that proves it.

The look is neutral and quiet. Zinc carries every surface and all text. Sky is the only brand hue. One zinc-900 section breaks up a light page. Ambient motion is small dust and slow instrument loops.

The page is six sections under a fixed header. Heights are measured at 1280 px wide.

| Section | File | Surface | Height |
| --- | --- | --- | --- |
| Hero | `hero.tsx` | light, white | 891 px |
| Work samples | `work-samples.tsx` | light, zinc-50 | 2,693 px |
| Experience | `experience.tsx` | dark, zinc-800 | 1,305 px |
| Expertise | `expertise.tsx` | light, white | 1,390 px |
| About | `about.tsx` | light, white | 707 px |
| Footer | `site-footer.tsx` | light, zinc-50 | 796 px |

The page totals 7,781 px. The per-section figures are rounded, so they sum to 7,782.

**Key Characteristics:**
- Zinc neutrals, one sky accent, stock Tailwind palette only.
- Bricolage Grotesque headings at weight 400. Instrument Sans for everything else.
- Light, light, dark, light, light, light.
- Flat cards with hairline rings. Shadows only on windows, tiles, and menus.
- Ambient loops drift under 6 px and never resync.

## Colors

Every color resolves to a stock Tailwind v4 palette value. `AGENTS.md` holds the rule. Semantic tokens live in `:root` in `src/styles/global.css` and point at palette variables.

### Primary
- **Near-black zinc** (zinc-900, `--primary`). Primary button, logo mark, headings, and body foreground. Hover is zinc-800 and active is zinc-950.
- **Sky.** The only brand hue. Each step it uses is listed here.
  - Sky-600 is `--ring`, the caret, the focus ring on light surfaces, the about phrase underline, the chapter progress fill, and the TypeScript tile.
  - Sky-700 is the role label on work samples, the "See it" links, the approval-queue text, and the hover color of the logo and the mobile menu items.
  - Sky-500 is the runner dot in the instruments and the footer social icons on hover.
  - Sky-400 marks progress on dark. It lights the role rail, fills the bullet marker at 45%, and is the one accent stroke in each glyph tile.
  - Sky-300 is the focus ring on zinc-700, zinc-800, and zinc-900.
  - Sky-200 is the text selection and the approval-queue ring.
  - Sky-50 is `--accent`, the wash behind an active about phrase, and the approval-queue node. Sky-800 is `--accent-foreground`.
  - The hero backdrop tints sky-100 through sky-400 at 40% opacity.

### Secondary
- **Emerald-500.** Healthy status only. The "in production" dot and the uptime bar in the reliability instrument, and the availability dot in the footer.

### Neutral
- **White.** Hero, expertise, and about backgrounds. Bento windows, instrument nodes, stack tiles, stack chips, outline buttons, and the active evidence card.
- **Zinc-50.** Work samples and footer backgrounds, evidence cards, and the mobile menu action row. Also `--muted`.
- **Zinc-100.** Bento cards, clip frames, and the film frame. Also `--secondary`.
- **Zinc-200.** `--border`. Bento card borders, the hero bottom rule, the write-up rule on work samples, and the chapter track.
- **Zinc-500.** The second tone of two-tone headings, labels, evidence sources, and `--muted-foreground`.
- **Zinc-600 and zinc-700 text.** Zinc-600 is section intros, footer copy, and chip text. Zinc-700 is the hero lede, the proof row, work-sample write-ups, and evidence text.
- **Text on dark.** Headings and the role title are zinc-50. Company names and highlights are zinc-200. Body copy and periods are zinc-300. The role rail uses zinc-400 for idle companies and zinc-600 for idle dots.
- **Hairlines.** Light cards use `ring-zinc-900/5` or `ring-zinc-900/10`. The footer and pills use `border-zinc-900/6` and `border-zinc-900/10`, and the email menu uses `border-zinc-900/8`. The dark section uses `border-white/15`.
- **Browser surfaces.** The scrollbar thumb is zinc-300 on a transparent track, and `accent-color` is zinc-900.

### Named Rules
**The Stock Palette Rule.** No hex, `rgb()`, `hsl()`, or `oklch()` literal in a component. Reach for a semantic token first, then a palette utility, then `var(--color-*)`. Transparency uses the slash modifier or `--alpha()`.

**The One Dark Section Rule.** Experience is the only dark surface, and it is zinc-800. Depth on it comes from white hairlines at 15%, not from a second gray.

**The Sky On Dark Rule.** On zinc-900, sky appears only as sky-400 on the role rail and the bullet markers, and as the sky-300 focus ring. Names, dates, and body copy stay zinc.

## Typography

**Display Font:** Bricolage Grotesque Variable (falls back to the body stack). Exposed as `font-heading`.
**Body Font:** Instrument Sans Variable (with ui-sans-serif, system-ui, sans-serif). Exposed as `font-sans` and set on `html`.
**Mono:** the default `font-mono` stack, used only for code and step names inside the instruments at 11 px.

Both families are self-hosted variable fonts with `font-display: optional`. `index.astro` preloads both files.

### Hierarchy
- **Display** (400, `tracking-tight`). The hero headline. Below `sm` the size is `clamp(1.5rem, 9.55vw - 3.8px, 2.5rem)` at leading 1.04, so "Building web solutions" holds one line. It is 3.5rem from `sm` and 5rem from `lg`, at leading 0.96. The footer headline is its sibling at `text-4xl`, `sm:text-5xl`, and `lg:text-7xl`, leading 1.02.
- **Headline** (400, `text-4xl` then `sm:text-5xl`, `tracking-tight`, `text-balance`). Every section `h2`.
- **Title** (400, `leading-tight`, `tracking-tight`). Bento headings are `text-2xl`, then 1.75rem from `sm`. Role titles are `text-2xl`, then `sm:text-3xl`. Work-sample titles are `text-3xl`, then `sm:text-4xl`. Mobile menu items are `text-3xl`.
- **Preface** (400, Bricolage, `clamp(1.25rem, 1.8vw, 1.625rem)`, leading 1.45, measure `40em`). The about paragraph only.
- **Body** (400, `text-base`, `leading-7`, `text-pretty`). Section intros, write-ups, role summaries. Measure is capped at `max-w-xl`, `max-w-2xl`, or `60ch`.
- **Small body** (400, `text-sm`, `leading-6`). Evidence sources, the film caption, and the footer contact list. Experience highlights and evidence text sit at 0.9375rem.
- **Label** (500, `text-sm`). Nav items, company names, the role label, the trusted line, the Problem and What I built terms, buttons, footer socials.
- **Caption** (500, `text-xs`). Stack chips and the header role line. Chapter labels are `text-xs` at 400 below `sm` and `text-sm` from `sm`. Window labels and instrument text are 11 px.
- **Stat** (600, `tabular-nums`). The hero years figure is Instrument Sans at `text-5xl`, `leading-none`. Periods and dates use `tabular-nums` without the weight.

### Named Rules
**The Two-Tone Heading Rule.** A heading may split into two tones. The first part is zinc-900 and the second is zinc-500. The hero, the footer, and every bento heading do this.

**The Weight 400 Rule.** Headings in Bricolage stay at weight 400 with `tracking-tight`. Semibold is for the stat and the header name.

## Layout

The page shell is `pageShellClassName`, a centered column of `min(1280px, 100% - 2.5rem)`. Spacing classes live in `src/components/sections/shared.tsx`.

| Export | Classes | Values |
| --- | --- | --- |
| `sectionPaddingTopClassName` | `pt-20 md:pt-28 lg:pt-32` | 80, 112, 128 px |
| `sectionPaddingBottomClassName` | `pb-20 md:pb-28 lg:pb-32` | 80, 112, 128 px |
| `sectionPaddingClassName` | both of the above | |
| `sectionHeaderMarginClassName` | `mb-12 md:mb-16` | 48, 64 px |
| `sectionHeaderClassName` | `grid max-w-3xl gap-4` plus the margin | stacked header, 16 px gap |
| `sectionSplitHeaderClassName` | `grid items-end gap-4 lg:grid-cols-[0.9fr_0.8fr] lg:gap-16` plus the margin | 16 px stacked, 64 px side by side |
| `detailStackGapClassName` | `gap-6` | 24 px |
| `listGapClassName` | `gap-3` | 12 px |
| `sectionContentGapClassName` | `gap-16 md:gap-20 lg:gap-28` | exported, not used by any shipped section |

Work samples, experience, and expertise take `sectionPaddingClassName`. About takes only the bottom padding because it follows expertise on the same white surface. The footer sets its own padding, `pt-16 md:pt-20 lg:pt-24` and `pb-16 lg:pb-20`, then closes with a bottom bar. The hero sets `pt-24 sm:pt-28` and `pb-16 md:pb-20 lg:pb-24` to clear the fixed header.

Two-column layouts open at `lg`. Most use a 64 px column gap. The hero's proof row uses 32 px. Below `lg` every section stacks into one column.

Anchor jumps run through `scrollToTargetName`, which lands a target 57 px below the top to clear the compact header. `html` sets `scroll-padding-top: 57px` to match. An experience highlight is marked `data-scroll-landing="reading-band"` and lands a third of the way down the viewport instead.

### Header
Fixed, transparent at the top of the page. After 28 px of scroll it takes a white 86% fill, a zinc-200 border, and `backdrop-blur`. With the mobile menu open it turns solid white. Height eases from 72 px to 56 px. Left is the logo mark with the name and a zinc-600 role line. From `sm`, the right side holds four nav links and an outline email button. The first link reads "Work" until `md` and "Work Samples" after. The email button reads "Email" until `lg` and shows the address after. Below `sm`, a 44 px menu button replaces them.

### Hero, 891 px
A stacked headline sits over a framed photo band. The band is 200 px tall below `sm`, 17rem from `sm`, and 18rem from `lg`, with a 24 px radius and a `ring-zinc-900/5` hairline. `scripts/build-hero-photo.sh` builds three crops, one per band, in AVIF and WebP. Below the photo, a two-column row from `lg` holds the proof block on the left and the lede and actions on the right. The proof block pairs the trusted line and grayscale logos with the years figure. The backdrop is a sky radial gradient under 1 px white vertical lines, masked away from the top. A zinc-200 rule closes the section.

Known issues. The hero runs 91 px past an 800 px viewport, and the owner chose to keep it. On a 390 by 844 phone, the first action sits at the fold.

### Work samples, 2,693 px
A split header, then four samples in one column, 64 px apart and 96 px apart from `lg`. From `lg` each sample puts the clip beside its write-up, `1.1fr` to `0.9fr`, and the clip swaps sides every other row. Below `lg` the clip sits on top. Under each clip is a three-step chapter strip. The write-up holds the role label, the title, a Problem and What I built pair under a zinc-200 rule, and the stack chips.

### Experience, 1,305 px
A zinc-900 section with a two-column grid at `lg`, `0.7fr` to `1.3fr`. The left column is sticky at `top-28`. It holds the heading, a one-line intro, and, from `lg` only, the role rail. The right column lists every role fully expanded, separated by `border-white/15` rules with `py-8`. Each role has a company and period row, the role title, a summary, and highlights with play markers. A company with more than one title lists each title and its dates, newest first, behind a `border-white/15` left rule.

### Expertise, 1,390 px
A split header, then a bento grid. It is one column on phones, two from `md`, and six from `lg`, with `gap-4 lg:gap-6`. Two wide cards span three columns at a 31rem minimum height. Three cards span two columns at 27rem. Four cards hold an instrument window. The fifth holds the stack grid, faded out at the bottom by a mask. Every card has a particle dust backdrop.

Below `md` each instrument takes its own height with 24 px of padding above and below. From `md` the instruments sit in fixed bands so cards in a row match. Small bands are 240 px, then 4:3 from `lg`. Wide bands are 256 px, then 280 px from `lg`.

### About, 707 px
A white section with a preface, not a portrait. From `lg`, a `0.7fr` to `1.3fr` grid puts the "About me" heading and a Jakarta line on the left and the preface paragraph on the right. Four phrases in the paragraph are links, each led by a glyph tile. Below, the four evidence cards sit in one column, two from `md`, and four from `xl`.

### Footer, 796 px
A zinc-50 footer split `7fr` to `5fr` at `lg`. Left is the two-tone headline, a blurb, and a contact list with Email, Elsewhere, and Status rows. Right is the desk scenery film with its caption. A bottom bar holds the copyright line and a pill "Back to top" button.

## Elevation & Depth

Surfaces are flat. Cards separate from the page by a hairline ring or border, not a shadow. Shadows mark things that float. Those are windows inside cards, the tiles and nodes inside them, glyph tiles, and menus.

### Shadow Vocabulary
- **Bento window** (`0 28px 56px -24px` of zinc-900 at 30%). The instrument windows in the expertise cards.
- **Stack tile** (`0 10px 24px -14px` of zinc-900 at 40%). The tiles in the stack grid.
- **Merge node** (`0 6px 18px -8px` of zinc-900 at 45%). The branch icon in the standards instrument.
- **Glyph tile** (`shadow-sm` of black at 20%, a `white/10` inset ring, and a `white/20` inset top highlight). The dark tiles in the about paragraph and evidence cards.
- **Active evidence card** (`shadow-md` of zinc-900 at 5%). The card paired with the phrase under the pointer or focus.
- **Menu** (`shadow-lg`). The email action menu and the mobile menu panel.
- **Nav pill** (`shadow-sm` with `ring-zinc-300/70`). The hover pill behind header nav items.

Shadow color is zinc-900 on light surfaces, written with `--alpha(var(--color-*))`.

## Shapes

`--radius` is 0.625rem, and the theme derives the scale from it. This makes `rounded-2xl` 18 px, not the Tailwind default.

- **6 px** (`rounded-sm`). Focus shape on text links and the role rail buttons.
- **8 px** (`rounded-md`). Focus shape on chapter buttons, and the state tags in the access instrument.
- **10 px** (`rounded-lg`). Buttons, nav items, the menu button, and instrument nodes.
- **14 px** (`rounded-xl`). Bento window tops, clip and film video corners, menu items.
- **18 px** (`rounded-2xl`). Bento cards, clip and film frames, evidence cards, stack tiles, the email menu.
- **24 px** (`rounded-[1.5rem]`). The hero photo.
- **0.3em.** Glyph tiles, so the corner scales with the text.
- **Full.** Stack chips, the footer email button, "Back to top", play buttons, window dots.

Windows bleed off their card. Bento windows have no bottom border, and from `sm` wide ones also lose the right border and corner. Nested radii step down from the container. A 6 px frame around a 14 px video inside an 18 px frame is the model.

## Components

### Buttons
- **Shape:** 10 px radius. Hero, footer, and mobile menu buttons are 44 px tall via `min-h-11` or `h-11`. Header controls are 40 px, except the 44 px menu button.
- **Primary:** zinc-900 fill, white text. Hover zinc-800. Active zinc-950.
- **Outline:** white fill, zinc-200 border, zinc-900 text. Hover fills zinc-50.
- **Outline pill:** the footer email menu and "Back to top". Full radius, `border-zinc-900/10`, hover `border-zinc-900/20`, fill stays white.
- **States:** press scales to 0.96. Focus uses the page-wide ring described under Links and focus.

### Links and focus
One unlayered `:focus-visible` rule in `global.css` draws a 2 px outline in `--focus-ring` at a 2 px offset. A component may widen the offset with `--focus-offset`. `--focus-ring` is sky-600 and flips to sky-300 inside `bg-zinc-700`, `bg-zinc-800`, and `bg-zinc-900`. Jump targets with `tabindex="-1"` take focus without a ring. Footer socials are zinc-600 text with a zinc-400 icon. On hover the text goes zinc-900, the icon goes sky-500, and the arrow nudges 2 px up and right.

### Header nav
From `sm`, nav links are 40 px tall, `text-sm` zinc-800, with a hover pill that one `layoutId` moves between links and blurs in. Below `sm`, the menu button is a 44 px white square with a zinc-900/10 border, and its two icons cross-fade with a quarter turn. The menu panel drops from the header over a zinc-900/30 scrim. It lists the four sections in Bricolage `text-3xl` with arrows, 64 px rows, and zinc-100 dividers. A zinc-50 row at the bottom holds a primary "Email me" button and an outline "Resume" link.

### Work-sample clip
A zinc-100 frame with 6 px padding, an 18 px radius, and a `ring-zinc-900/5` hairline holds a 3:2 video with a 14 px radius. The video is muted and loops while 40% or more of it is in view. Under reduced motion it stays paused on its poster until the visitor presses play. Posters load once the clip is within 800 px of the viewport. A 36 px white play button sits bottom right with a 44 px hit area. While the clip plays, the button hides on devices that can hover and stays visible on touch.

### Chapter strip
Three buttons under each clip, each a 2 px zinc-200 track over a label. The track fills with sky-600 as the clip plays through that chapter. The active label is zinc-900 and the others are zinc-500. A click seeks the clip to that chapter.

### Stack chips
White, `ring-zinc-900/10`, zinc-600 text at `text-xs font-medium`, full radius, `px-2.5 py-1`. They close each work-sample write-up.

### Role rail
From `lg`, the sticky experience column lists each company with a 7 px dot. A 1 px white/15 line joins the dots. As a role crosses the band a third of the way down the viewport, its dot turns sky-400 and the line above it fills top to bottom. The current company is white, the others zinc-400. A click jumps to the role.

### Play bullet marker
`PlayBulletMarker` in `shared.tsx`. A 14 px outlined triangle over a sky-400 fill at 45%, offset down and left. The stroke takes `currentColor`, which is zinc-400 on the experience highlights.

### Bento card and window
The card is zinc-100 with a zinc-200 border, an 18 px radius, and `overflow-hidden`. The heading pads `p-7 sm:p-9`. The window is white with a three-dot title bar and a centered 11 px label. It sits at the card bottom with `mt-auto`. Small cards inset the window `mx-7 sm:mx-9`. From `sm`, wide cards inset it 18% from the left and bleed it off the right edge.

### Instruments
`CapabilityInstrument` in `capability-instruments.tsx` draws four diagrams. They are the access path, the reviewer pipeline, the reliability readout, and the adopted standards. Text is 11 px, mono for step names. Nodes are white with a `ring-zinc-900/5` hairline. Runner dots are sky-500. The human approval queue is the one accent node, sky-50 with a sky-200 ring and sky-700 text. Healthy status is emerald-500. Off screen, each instrument remounts in its static state so no loop runs unseen.

### Stack grid
Twelve white tiles with an 18 px radius and the stack-tile shadow, four across, six from `md`, and four again from `lg`. Icons are zinc-700 and the TypeScript tile is sky-600. Each tile floats up to 5 px on its own duration. A mask fades the last row.

### Particle backdrop
`ParticleStream` fills each bento card behind its content with zinc-400 dots. At rest about 150 dots float within 5 px. On hover the dust gathers into lanes, and nearer dots shift further with the pointer. The first card runs the `spiral` pattern under a radial mask. The others run `dust` in `braid`, `waves`, `arcs`, and `columns`. Each card has its own seed. Drawing stops off screen and under reduced motion.

### About preface and evidence cards
Each linked phrase in the preface starts with a glyph tile. The tile is a zinc-800 to zinc-950 gradient with white strokes and one sky-400 accent, sized at 1.06em. A 2 px sky-600 underline sits under the phrase. Hovering or focusing a phrase pairs it with its evidence card. The phrase gets a sky-50 wash. Its card turns white with the active shadow and a `ring-sky-600/30`, and the other cards dim. The link and the card's "See it" link both jump to the experience highlight that proves the claim. Evidence cards are zinc-50 with a `ring-zinc-900/5` hairline, an 18 px radius, and `p-5`. Each card holds a glyph tile set at 1.75rem, a zinc-500 source line, the proof, and a sky-700 "See it" link with a 44 px hit area.

### Email action menu
A pill button shows the address and a chevron that rotates 180 degrees when open. The menu is white with an 18 px radius, `border-zinc-900/8`, and `shadow-lg`. Two 44 px items, "Copy email" and "Send email", hover to zinc-50. The copy label reads "Copied" or "Copy failed" for 1.6 seconds. Escape and outside clicks close it.

### Desk scenery
`DeskScenery` in `desk-scenery.tsx`. A square muted film in the same frame as the work-sample clips. It loops while 40% or more of it is in view. The poster sits under the video and lazy-loads. Under reduced motion it stays paused until the visitor presses play. A click on the film or its play button toggles playback, and the choice sticks.

### Motion
All scripted motion uses `motion/react`.

- **First paint.** The server HTML renders visible. Above-the-fold entrances run on the CSS `animate-rise-in` utility, a 12 px rise over 0.6 s. `riseDelay()` in `shared.tsx` staggers them. The hero goes headline, photo, proof, then lede at 0.08 s steps. The header logo and nav follow the same pattern.
- **Reveal.** `Reveal`, `RevealGroup`, and `RevealItem` in `shared.tsx` animate content below the fold. Content starts visible. The observer hides only an element that sits entirely below the viewport, where the jump cannot be seen. Items rise 12 px over 0.6 s on `revealEase` `[0.22, 1, 0.36, 1]` and fade over 0.4 s linear. They fire once, after the element clears the bottom 10% of the viewport. Groups stagger by 0.08 s, and expertise cards by 0.1 s.
- **About entrance.** When the preface clears the lower 30% of the viewport, its phrases play in reading order, 0.42 s apart. Each glyph tile pops from `scale(0.4) rotate(-12deg)` on `overshootEase`, its glyph draws, then its underline draws left to right.
- **Header.** Fill, border, and height ease over 0.28 s on `easeOut` `[0.2, 0, 0, 1]`. The nav hover pill moves on `spring`, `{ bounce: 0 }` at 0.38 s, and blurs in over 0.3 s. The mobile menu panel drops 12 px over 0.24 s.
- **Loops.** Every looping instrument animation goes through `cycle()` in `src/components/capability-instruments.tsx`. It returns `{}` under reduced motion. Each element gets its own duration and delay so a group never resyncs. `docs/attio-motion-notes.md` holds the reasoning.
- **Reduced motion.** React transitions drop to `{ duration: 0 }`. `global.css` also collapses CSS animation and transition durations, drops `animate-rise-in`, and turns off smooth scroll. Clips and the film stay paused.

## Do's and Don'ts

### Do:
- **Do** keep ambient drift under about 6 px and ambient opacity low.
- **Do** give each looping element its own duration and delay.
- **Do** build section padding and headers from the classes in `shared.tsx`.
- **Do** drop the top padding when a section follows another on the same surface, as about does.
- **Do** keep interactive targets 44 px tall outside the header. A smaller visual can reach 44 px with an `after:absolute after:-inset-*` hit area, as the play buttons and "See it" links do.
- **Do** keep a heading within 16 px of its own intro when the header stacks.
- **Do** change the brand color by editing `--primary` in `global.css`.

### Don't:
- **Don't** write a color literal in a component. Static SVGs in `public/` are the exception, and so are the known exceptions in `AGENTS.md`.
- **Don't** mix a second gray family into zinc.
- **Don't** add a second dark surface or use a dark value other than zinc-900.
- **Don't** give two bento cards the same seed, or a whole group one loop timing.
- **Don't** give an instrument a fixed band below `md`. A stacked card has no row to match.
- **Don't** add a scroll-linked animation. The role rail and the clips respond to what is in view, not to scroll position.

## Adding or changing a section

- Each section is one file under `src/components/sections/` and exports one component.
- `src/components/portfolio-home.tsx` only composes. It imports the sections and orders them inside `main`. Keep layout and copy out of it.
- Shared helpers live in `shared.tsx`. These are the page shell, spacing and header classes, reveal wrappers, easing, scroll helpers, `contactEmail`, and `PlayBulletMarker`.
- Wrap content in `pageShellClassName`. Take padding from `sectionPaddingClassName` or one of its halves. Take the header from `sectionHeaderClassName` or `sectionSplitHeaderClassName`.
- Wrap entering content in `RevealGroup` and `RevealItem`. Content above the fold uses `animate-rise-in` instead.
- To make a section a nav target, add `data-scroll-target` and an entry in `navItems` in `site-header.tsx`.
- Keep the surface rhythm in mind. Light, light, dark, light, light, light has one dark band. A second one would split the page.
- Content arrays live in `src/components/portfolio-home-data.ts`. A helper used by one section stays in that section's file.
