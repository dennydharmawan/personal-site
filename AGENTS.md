# Personal Site Agent Notes

Before changing portfolio positioning, homepage copy, resume-facing language, or
recruiter-targeted sections, read:

- `.ai-docs/job-targets/*.md`

Use the job-target files as private working context for keyword alignment. Do not
turn them into public site content verbatim. Keep public copy recruiter-readable,
NDA-safe, truthful, and focused on evidence: systems owned, scale, reliability,
delivery judgment, cross-team work, and production impact.

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
