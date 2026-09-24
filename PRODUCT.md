# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary reader is a technical recruiter or talent partner at an Indonesian digital bank or fintech. They open the link from a resume, a LinkedIn profile, an application form, or a message and give it about ten seconds. In that time they check title, seniority, domain, and stack keywords against a role, then decide whether to forward the candidate or reach out.

The secondary reader is an engineering manager or senior engineer at the same kind of company. They open the page before or after a screen and look for depth: which systems he owned, at what scale, and how he works.

## Product Purpose

The site is Denny Dharmawan's personal page. Its job is to get him shortlisted for Senior Full-Stack Engineer roles in Indonesian digital banking and fintech, with Tech Lead as the next step. It succeeds when a reader can state his level, his domain, and one number with its employer within ten seconds, and knows how to download the resume or contact him.

## Positioning

He built the system of record for who can access Krom Bank's internal apps, ran lending backends at Jenius at 2M+ transactions a month and 99.98% uptime, and built and runs a production multi-agent pull-request reviewer. Bank access governance, lending at scale, and production AI code review are one person's record, stated with where and when each happened.

## Operating Context

Readers arrive from a resume PDF, LinkedIn, job application forms, and recruiter messages. Screening happens on a laptop during office hours and on a phone inside the LinkedIn app. Readers scan and do not read. The page is in English.

## Capabilities and Constraints

- One page. Astro 7 with React 19 islands, Tailwind CSS v4, `motion/react`.
- Primary actions: download `public/resume.pdf` and contact by email or LinkedIn.
- NDA: no internal codenames, internal tool names, colleagues, tickets, or Slack threads. Employer systems are described at the pattern level.
- Four work-sample clips are Remotion animations with sample data (`clips/`). They are walkthroughs, not screen recordings.
- The PR reviewer runs in production at Krom Bank. The access, loan collection, and checkout samples are NDA-safe builds.

## Brand Commitments

- Name: Denny Dharmawan. Existing logo mark and favicon in `public/`.
- Color: stock Tailwind palette only, per `AGENTS.md`. Brand is `zinc-900` and the accent is `sky`.
- Voice: plain first person that a recruiter can read. No hype words, no invented metrics. Copy is checked against the humanizer patterns before it ships.

## Evidence on Hand

- Krom Bank, Jan 2023 to now. Promoted to Senior Full-Stack Engineer in May 2026. Built the internal identity and access governance platform: HR events provision and remove access, continuous reconciliation, audit trail, periodic access reviews. Shared auth, logging, and feature-flag package in 4 production apps. Git workflow RFC used by 5+ teams. Datadog dashboards and tracing that became the company monitoring template. Production multi-agent PR reviewer on AWS Bedrock, Bitbucket, and Slack. Won an internal AI engineering competition. Mentored 2 engineers.
- Jenius / Bank SMBC Indonesia, Dec 2019 to Dec 2022. Back End Engineer on Flexi Cash. 2M+ transactions a month, 99.98% uptime, origination and disbursement stable through 147% user growth in three years. Retail partner APIs on Kafka events.
- Iverson Technology, Dec 2017 to Dec 2019. Dynamics AX ERP for enterprise clients including JNE and Gramedia. Trained 200 professionals.
- Detail recorded in Denny's own earlier site copy (`portfolio-home-data.ts` and `about.tsx` before the September 2026 rewrite) and in `resume.pdf`:
  - The access platform automates onboarding, rehire, and offboarding access.
  - The PR reviewer uses four specialist agents (security, correctness, testing, conventions) that review a diff in parallel against retrieved repository context. A merger drops findings whose cited code does not support the claim, and confidence gates route what remains. Security findings never auto-post, and low-confidence notes go to a private approval queue for a person.
  - After winning the AI engineering competition, he brought spec-driven development to the engineering teams.
  - At Jenius, the retail partner APIs on Kafka events widened digital lending distribution.
  - At Iverson, he integrated data warehouse, enterprise portal, and point-of-sale systems.
  - He started out teaching programming labs at university.
  - Stack by employer. Krom Bank: TypeScript, React, Next.js, Node.js, PostgreSQL, MySQL, MongoDB, DocumentDB, Redis, BullMQ, AWS, Datadog. Jenius: Node.js, GraphQL, Kafka.
- Assets: four clips and preview images in `public/portfolio-previews/`, employer logos in `public/company-logos/`, `resume.pdf`.
- Absent, never to be fabricated: access platform scale, PR reviewer usage, the method behind a 37% API speedup, Go experience, Kubernetes or Terraform ownership, testimonials. The two incident write-ups stay private by the owner's decision.

## Product Principles

1. Recruiter words come first: title, domain, and stack keywords in plain English, readable without engineering context.
2. Every number sits next to the employer and period it came from. A hero finding repeats its source bullet word for word, because the citation jumps to it, and nothing else repeats a number.
3. Production work is labeled production. Rebuilds are labeled NDA-safe builds.
4. A claim without support is cut, never softened or hedged.
5. Depth is available to the engineer who scrolls, but it never stands between the recruiter and the resume.

## Accessibility & Inclusion

WCAG 2.2 AA contrast, full keyboard access with visible focus, and `prefers-reduced-motion` respected on every animation.
