import type { CapabilityKind } from '@/components/capability-instruments';

export type ExpertiseItem = {
  kind: CapabilityKind;
  tail: string;
  title: string;
  windowLabel: string;
};

export const expertiseItems: ExpertiseItem[] = [
  {
    kind: 'fullstack',
    tail: 'another engineer can change six months later',
    title: 'Full-stack engineering',
    windowLabel: 'access.decision'
  },
  {
    kind: 'ai',
    tail: 'with a person approving every security finding',
    title: 'AI-assisted delivery',
    windowLabel: 'reviewer.run'
  },
  {
    kind: 'production',
    tail: 'that held steady through 147% user growth',
    title: 'Production systems',
    windowLabel: 'reliability'
  },
  {
    kind: 'standards',
    tail: 'that 5+ teams follow',
    title: 'Engineering standards',
    windowLabel: 'review.gate'
  }
];

export type Chapter = { at: number; label: string };

// 'pr-reviewer' is hidden while the PR reviewer is off the site.
const evidenceTargets = ['krom-access', 'krom-shared-package', 'jenius-lending'] as const;

export type EvidenceTarget = (typeof evidenceTargets)[number];

export function isEvidenceTarget(value: string): value is EvidenceTarget {
  return (evidenceTargets as readonly string[]).includes(value);
}

export type GlyphId = 'access' | 'hub' | 'review' | 'lending';

export type AboutEvidence = {
  glyph: GlyphId;
  phrase: string;
  proof: string;
  source: string;
};

export type AboutSegment = string | { evidence: EvidenceTarget };

export const aboutEvidence: Record<EvidenceTarget, AboutEvidence> = {
  'krom-access': {
    glyph: 'access',
    phrase: "the workflow engine that grants and removes access to the bank's internal apps",
    proof: 'Onboarding, rehire, and offboarding update access automatically, with an audit trail.',
    source: 'Krom Bank, 2023 to now'
  },
  'krom-shared-package': {
    glyph: 'hub',
    phrase: 'a shared package for auth, logging, and feature flags',
    proof: 'Apps share one setup for sign-in, logs, and flags instead of each building its own.',
    source: 'Krom Bank, 2023 to now'
  },
  // 'pr-reviewer': {
  //   glyph: 'review',
  //   phrase: 'a multi-agent pull-request reviewer',
  //   proof:
  //     'Specialist agents review each diff in parallel. Findings the code does not support get dropped, and security findings wait for a person.',
  //   source: 'Krom Bank, in production'
  // },
  'jenius-lending': {
    glyph: 'lending',
    phrase: 'lending backends at Jenius',
    proof: 'Loan origination and disbursement stayed stable through three years of user growth.',
    source: 'Jenius, 2019 to 2022'
  }
};

export const aboutParagraph: AboutSegment[] = [
  "I'm a senior full-stack engineer at Krom Bank in Jakarta, looking for a Senior Software Engineer role, full-stack or backend, in fintech or digital banking, with Tech Lead as the next step. I learn how a business works before I write the code. At Krom I built ",
  { evidence: 'krom-access' },
  ', and ',
  { evidence: 'krom-shared-package' },
  // ' that several production apps run on. I also built ',
  // { evidence: 'pr-reviewer' },
  // ' that runs in production. Before Krom, I ran ',
  ' that several production apps run on. Before Krom, I ran ',
  { evidence: 'jenius-lending' },
  ' for three years.'
];

export type Project = {
  built: string;
  chapters: readonly [Chapter, Chapter, Chapter];
  preview: string;
  problem: string;
  role: string;
  stack: string[];
  target?: EvidenceTarget;
  title: string;
  video: string;
};

export const projects: Project[] = [
  // Hidden while the PR reviewer is off the site.
  // {
  //   built:
  //     'Four agents review each diff in parallel for security, correctness, tests, and conventions, with context pulled from the repository. A merger drops any finding the cited code does not support. Security findings never post on their own, and low-confidence notes go to a private queue for a person to approve.',
  //   chapters: [
  //     { at: 0, label: 'AI agents review code' },
  //     { at: 7.8, label: 'False alarm dropped' },
  //     { at: 11.6, label: 'Human checks security' }
  //   ],
  //   preview: '/portfolio-previews/work-sample-pr-reviewer.png',
  //   problem: 'AI review bots post every finding, right or wrong.',
  //   role: 'Internal developer tooling',
  //   stack: ['TypeScript', 'AWS Bedrock', 'Bitbucket', 'Slack'],
  //   target: 'pr-reviewer',
  //   title: 'Multi-agent PR reviewer',
  //   video: '/portfolio-previews/motion/work-sample-pr-reviewer.mp4'
  // },
  {
    built:
      'HR events start a durable, idempotent workflow on BullMQ. Each step records its result, so a retry skips accounts that already exist and resumes at the step that failed. Roles, permissions, and an audit log sit on top.',
    chapters: [
      { at: 0, label: 'Setup fails halfway' },
      { at: 4.3, label: 'Retry, no duplicates' },
      { at: 12.7, label: 'Ready on day one' }
    ],
    preview: '/portfolio-previews/work-sample-auth-access.png',
    problem:
      'A new hire needs accounts in several systems on day one, and a setup that fails halfway must not leave duplicates.',
    role: 'Identity and access governance',
    stack: ['Node.js', 'BullMQ', 'RBAC', 'PostgreSQL'],
    title: 'Access workflow engine',
    video: '/portfolio-previews/motion/work-sample-auth-access.mp4'
  },
  {
    built:
      'Overdue accounts land in prioritized queues, each with an owner and a next step. Reminders go out as WhatsApp templates, and replies, payment promises, and follow-ups land in one activity log.',
    chapters: [
      { at: 0, label: 'Overdue accounts queued' },
      { at: 8.6, label: 'WhatsApp reminder sent' },
      { at: 12.4, label: 'Promise to pay logged' }
    ],
    preview: '/portfolio-previews/work-sample-loan-collection.png',
    problem: 'Collectors retype every payment reminder by hand.',
    role: 'Collections operations and messaging',
    stack: ['React', 'Node.js', 'WhatsApp API', 'queues'],
    title: 'Loan collection system',
    video: '/portfolio-previews/motion/work-sample-loan-collection.mp4'
  },
  {
    built:
      "Each payment moves through explicit states. The payment provider's webhook confirms the order, and reconciliation matches every order to a captured payment.",
    chapters: [
      { at: 0, label: 'Customer pays' },
      { at: 4.6, label: 'Order waits' },
      { at: 13.2, label: 'Payment matched' }
    ],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.png',
    problem: 'After a customer pays, the store cannot tell whether the payment went through.',
    role: 'Commerce checkout and payments',
    stack: ['Next.js', 'payment API', 'webhooks', 'SQL'],
    title: 'E-commerce payments',
    video: '/portfolio-previews/motion/work-sample-ecommerce-payment.mp4'
  }
];

export type Highlight = { target?: EvidenceTarget; text: string };

export const experiences: ReadonlyArray<{
  company: string;
  current?: boolean;
  highlights: Highlight[];
  period: string;
  role: string;
  summary: string;
  titles?: ReadonlyArray<{ period: string; role: string }>;
  years: string;
}> = [
  {
    company: 'Krom Bank',
    current: true,
    highlights: [
      {
        target: 'krom-access',
        text: 'Designed the workflow engine that orchestrates the identity lifecycle across 8 company tools: access on day one, revoked at exit, with an audit trail'
      },
      {
        text: 'Moved an audit log from MongoDB to DocumentDB in proven steps with no big-bang cutover, and replaced pagination that could skip rows during writes'
      },
      {
        target: 'krom-shared-package',
        text: 'Shipped a shared auth, logging, and feature-flag package adopted by four production apps'
      },
      { text: 'Designed the Datadog dashboards and tracing that became the company monitoring template' },
      {
        text: 'Traced stale release versions in Datadog to a missing deploy setting, and the infra fix now covers every EKS service'
      }
    ],
    period: 'Jan 2023 – Present',
    role: 'Senior Full-Stack Engineer',
    titles: [
      { period: 'May 2026 – Present', role: 'Senior Full-Stack Engineer' },
      { period: 'Jan 2023 – May 2026', role: 'Full-Stack Engineer' }
    ],
    summary:
      'Frontend and backend work for a digital bank on Next.js, Node.js, and TypeScript. Mentored two engineers and wrote the Git workflow used by 5+ teams.',
    years: '2023'
  },
  {
    company: 'Jenius / Bank SMBC Indonesia',
    highlights: [
      {
        target: 'jenius-lending',
        text: 'Ran the lending backends at 2M+ transactions a month and 99.98% uptime on Node.js, GraphQL, and Kafka'
      },
      { text: 'Kept origination and disbursement stable while users grew 147% in three years' },
      { text: 'Built retail partner APIs on Kafka events that widened digital lending distribution' }
    ],
    period: 'Dec 2019 – Dec 2022',
    role: 'Back End Engineer',
    summary: 'Backend services for Flexi Cash, a digital lending product.',
    years: '2019'
  },
  {
    company: 'Iverson Technology',
    highlights: [
      { text: 'Customized Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia' },
      { text: 'Integrated data warehouse, enterprise portal, and point-of-sale systems' },
      { text: 'Trained 200 professionals on Dynamics AX customization' }
    ],
    period: 'Dec 2017 – Dec 2019',
    role: 'Technical Consultant',
    summary: 'ERP customization and integration for enterprise clients.',
    years: '2017'
  }
];

export const trustedTeams = [
  {
    logo: '/company-logos/krom-bank.webp',
    logoClassName: 'h-5 min-[360px]:h-6 sm:h-7 max-w-[7.75rem]',
    logoHeight: 84,
    logoWidth: 311,
    name: 'Krom Bank'
  },
  {
    logo: '/company-logos/bank-smbc-indonesia-mono.svg',
    logoClassName: 'h-5 min-[360px]:h-6 sm:h-7 max-w-[7.75rem]',
    logoHeight: 56,
    logoWidth: 198,
    name: 'Bank SMBC Indonesia'
  },
  {
    logo: '/company-logos/jenius.svg',
    logoClassName: 'h-5 min-[360px]:h-6 sm:h-7 max-w-[7.75rem]',
    logoHeight: 43,
    logoWidth: 164,
    name: 'Jenius'
  }
];
