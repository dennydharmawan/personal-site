# personal-site

Astro 7 + React 19 islands, Tailwind CSS v4 (Vite plugin, no `tailwind.config.js`).
Design tokens live in `src/styles/global.css`.

## Color: use the native Tailwind palette. Never invent a color.

Every color must resolve to a stock Tailwind v4 palette value — `zinc`, `sky`,
`emerald`, `violet`, `white`, `black`, and so on. Do not introduce a hex, `rgb()`,
`hsl()`, or `oklch()` literal, and do not add a custom named color to the theme.

The current palette is:

| role | value |
| --- | --- |
| brand / primary | `zinc-900` (near-black: logo mark, favicon, primary buttons) |
| accent | `sky` |
| text and surfaces | `zinc` |
| pass / healthy | `emerald` |
| secondary chip | `violet` |

Order of preference when you need a color:

1. A semantic token from `global.css` — `bg-primary`, `text-muted-foreground`,
   `ring-border`. Reach here first; it is what keeps the two themes coherent.
2. A stock palette utility — `text-sky-700`, `fill-emerald-500`.
3. A stock palette value through a CSS variable — `var(--color-sky-400)`. Tailwind v4
   exposes every palette entry this way, so an inline `style` or an SVG `fill` still has
   no excuse to hardcode a hex.

For transparency use the slash modifier (`bg-sky-500/15`, `ring-black/5`) rather than
writing an `rgba()`.

To change the brand color, edit the token in `:root` in `global.css`. Do not sweep
utility classes across components.

### Known exceptions, all pre-existing

These predate the rule and should migrate to `var(--color-*)` when touched, not be
copied:

- `src/components/sections/site-header.tsx` — the compact nav animates its background and
  border between `rgba()` values. The numbers are palette colors (`rgba(228,228,231,…)` is
  `zinc-200`), spelled out because Motion interpolates concrete color values.
- `public/logo-mark.svg` and `public/favicon.svg` — `#18181B` is `zinc-900`. A static `.svg` in `public/` is not
  processed by Tailwind, so it cannot reference a token; a hex is correct here.

## Motion

`motion/react`. Every looping animation goes through `cycle()` in
`src/components/capability-instruments.tsx`, which returns `{}` under
`useReducedMotion()`. Keep ambient drift under ~6px, and give each looping element its
own duration and delay so a group never resyncs — see `docs/attio-motion-notes.md`.

## Portfolio copy

Before changing portfolio positioning, homepage copy, resume-facing language, or
recruiter-targeted sections, read job-target notes in the Obsidian vault:

- `/Users/denny.dharmawan/Documents/Obsidian Vault/2-Areas/career/superbank-job-target-keywords.md`

Use the job-target files as private working context for keyword alignment. Do not
turn them into public site content verbatim. Keep public copy recruiter-readable,
NDA-safe, truthful, and focused on evidence: systems owned, scale, reliability,
delivery judgment, cross-team work, and production impact.

Site copy never uses the word "platform". Name the thing instead: a workflow engine,
a shared package, internal tools.

## Local UI Iteration

- Prefer the running `pnpm run dev` task for visual/UI iteration. Do not run
  `pnpm build` after every small UI or copy change unless the user explicitly
  asks for a production-build check or the change affects build-time behavior.
- Verify UI changes in the in-app Browser at the active localhost URL whenever
  practical, especially for responsive layout, hover states, animation, and
  above-the-fold presentation.
- Browser verification is not required for every small, low-risk edit. If the
  change is straightforward and confidence is high from code inspection, skip
  the browser check and say so briefly in the final note.
