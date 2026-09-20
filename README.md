# Personal Site

Astro portfolio site for Denny Dharmawan. The site is intentionally static-first
and focuses on recruiter-readable engineering positioning, work samples,
experience, and contact paths.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Structure

- `src/pages/index.astro` mounts the homepage.
- `src/components/portfolio-home.tsx` composes the sections in order.
- `src/components/sections/` holds one file per section.
- `src/components/portfolio-home-data.ts` stores homepage content data.
- `public/` contains static images, logos, resume, and favicons.
- `clips/` is a Remotion package that renders the work-sample videos.

## Notes

Portfolio copy should stay truthful, NDA-safe, and grounded in real systems,
scale, reliability, delivery judgment, and cross-team work. Repo-local guidance
lives in `AGENTS.md` and `DESIGN.md`. Job-target keyword notes live in the
Obsidian career vault; `AGENTS.md` has the path.
