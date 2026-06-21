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
- `src/components/portfolio-home.tsx` renders the homepage experience.
- `src/components/portfolio-home-data.ts` stores homepage content data.
- `src/components/portfolio-marquee-images.ts` generates footer marquee images.
- `public/` contains static images, logos, resume, and favicons.

## Notes

Portfolio copy should stay truthful, NDA-safe, and grounded in real systems,
scale, reliability, delivery judgment, and cross-team work. Repo-local guidance
lives in `AGENTS.md`, `CONTEXT.md`, and private working notes under `.ai-docs/`.
