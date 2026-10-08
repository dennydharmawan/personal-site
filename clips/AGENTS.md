# clips

Remotion source for the three Work samples clips. Each composition in `src/Root.tsx` renders to an mp4 and a poster in `../public/portfolio-previews/`, and the site's chapter buttons seek into that mp4. `src/clips/AuthAccess.tsx` is the reference clip. Read it before you write or change a clip.

## Frame

- 1440×960 at 30 fps. Spread `clipConfig` from `src/theme.ts` and set `durationInFrames` from the clip's own `*_DURATION` export: a 12 to 14 s loop, 360 to 420 frames.
- Author every beat in composition frames from `useCurrentFrame()`, so a frame number divided by 30 is the time the site sees.
- The clip carries no title, subtitle, or captions. The site's title and chapter labels narrate it.

## Type floor

Set all text at 40 px or larger. The site draws the clip at 0.46× on a 1440 desktop, 0.34× at 1024, and 0.235× on a 390 phone, so 40 px lands at 18, 14, and 9 px. When a label won't fit at 40 px, cut the label. On a phone the story reads from colour, icons, and one large number.

## Colour

- Take every colour from `palette` in `src/theme.ts`. `#ffffff` is the one literal. This package sits outside the site's Tailwind build, so `palette` holds sRGB conversions of Tailwind v4.3's oklch values. Convert a missing step from v4.3 the same way, because v3 hexes miss the site's accent.
- Roles: `zinc50` stage, white cards, sky for the active thing (`sky500` marker, `sky700` tag text), emerald for done, `zinc900` log strip. Rose (`rose600`) marks failure and nothing else.

## Chapters

`chapters` in `../src/components/portfolio-home-data.ts` gives the seconds (`at`) each chapter button seeks to.

- Put each `at` on a whole or half second, so its frame (`at × 30`) is a multiple of 15. Keep `at` equal to the clip's chapter frame constant divided by 30.
- Make each chapter frame a hard state swap: the chapter's state is fully drawn on that exact frame. Switch on `frame >= CHAPTER.x`, finish every fade before the chapter frame, and start any entrance on it at full colour and opacity. The reference's status pill lands green and settles from a 1.06 swell.

## Loop seam

- The last frame matches frame 0: no pixel differs by more than 8 in any channel.
- The reference's pattern: the stage exits left on an ease-in, then a fresh stage enters from the right on an ease-out at the same speed and settles two frames before the end. The arriving stage renders `frame - DURATION`, which is the opening state. One element (the log strip) holds still across the seam to carry the eye.

## Sample data

- Invent every person, record, and number. The reference's new hire is "Maya Santoso". Real tool names and logos are fine as sample data.
- Name tools and invented people only. Keep every employer, past or present, out of clips, diagrams, alt text, and copy.

## Logos

- One single-colour brand mark per file in `public/logos/<tool>.svg`, rebuilt from the vendor's path data.
- Sources, in order: Simple Icons, svgl, the vendor's own site. Download each into its own new `mktemp -d` directory and copy only the rebuilt SVG out of it.

## Render

- Render one clip at a time: `./render-work-samples.sh <CompositionId>` writes that clip's mp4 and poster. With no argument it re-renders and overwrites all three, so run that only after a shared file (`src/theme.ts`, `src/components/`) changes.
- Remotion can exit non-zero with "Target closed" after a good render. The script then accepts the fresh mp4 and prints its frame count, which must equal the clip's `*_DURATION`.
- Poster frames live in the script. Reduced-motion visitors see only the poster.

## Architecture diagrams

`scripts/architecture/generate.mjs` builds the three "How it's built" SVGs in `../public/portfolio-previews/architecture/` from the marks in `public/logos/`. Change a diagram in the generator and rerun it; it writes nothing when its layout check fails. Run it with `--sheet` and look at each 338 px tile, the phone size. A diagram's `desc` and its `architecture.alt` in `portfolio-home-data.ts` carry the same text, which names only the drawn boxes, arrows, and labels.

## Verify

A clip change is done when all three checks pass. Each script's header lists its flags.

1. `node scripts/storyboard.mjs <Composition> <out.png> <frame:label>...` before you render. List every chapter frame plus a mid-move frame near each change, then look at every tile for clipped, overlapping, or half-faded content. Tiles draw at the 0.34 scale; add `--scale 0.235` to see the phone.
2. `node scripts/seam.mjs <Composition>` prints PASS.
3. After rendering, with the dev server on localhost:4321 (`pnpm run dev` from the repo root), `node scripts/chapters.mjs "<project title>"` prints PASS. It checks that each chapter click lands on `at` with that chapter marked current, and that "How it's built" pauses the clip and "Walkthrough" resumes it.

The scripts need Google Chrome for H.264 playback and find playwright-core in `node_modules` or the npx cache. They install nothing.
