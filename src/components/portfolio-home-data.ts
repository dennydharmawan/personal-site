import type { CapabilityKind } from '@/components/capability-instruments';

export type ExpertiseItem = {
  kind: CapabilityKind;
  tail: string;
  title: string;
};

export const expertiseItems: ExpertiseItem[] = [
  {
    kind: 'release',
    tail: 'Solve the real problem.',
    title: 'Understand the business.'
  },
  {
    kind: 'fullstack',
    tail: 'Connect business priorities to technical decisions.',
    title: 'Lead where the decisions are hard.'
  },
  {
    kind: 'production',
    tail: 'Keep quality high at scale.',
    title: 'Deliver end to end.'
  },
  {
    kind: 'standards',
    tail: 'Solve shared problems once.',
    title: 'Make the team faster.'
  }
];

export type Chapter = { at: number; label: string };

const evidenceTargets = ['krom-access', 'krom-shared-package', 'jenius-lending'] as const;

export type EvidenceTarget = (typeof evidenceTargets)[number];

export function isEvidenceTarget(value: string): value is EvidenceTarget {
  return (evidenceTargets as readonly string[]).includes(value);
}

export type GlyphId = 'access' | 'hub' | 'lending';

export type AboutEvidence = {
  glyph: GlyphId;
  phrase: string;
};

export type AboutSegment = string | { evidence: EvidenceTarget };

export const aboutEvidence: Record<EvidenceTarget, AboutEvidence> = {
  'krom-access': {
    glyph: 'access',
    phrase: "the workflow engine that grants and removes access to the bank's internal apps"
  },
  'krom-shared-package': {
    glyph: 'hub',
    phrase: 'a shared package for auth, logging, and feature flags'
  },
  'jenius-lending': {
    glyph: 'lending',
    phrase: 'lending backend services at Jenius'
  }
};

export const aboutParagraph: AboutSegment[] = [
  "I'm a senior full-stack engineer at Krom Bank in Jakarta. I learn how a business works before I write the code. At Krom, I built ",
  { evidence: 'krom-access' },
  ', and ',
  { evidence: 'krom-shared-package' },
  ' that multiple internal apps run on. Before Krom, I owned the ',
  { evidence: 'jenius-lending' },
  " for three years. Next, I want a senior full-stack or backend role in fintech or digital banking, with a path to tech lead."
];

export type Project = {
  /** A simplified diagram of the system, shown behind the clip's "How it's built" tab. */
  architecture: { alt: string; src: string };
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
  {
    architecture: {
      alt: 'Simplified architecture. A hire, rehire, or offboard event in Zoho People reaches the provisioning API (Node.js, TypeScript) by webhook. The API enqueues the job in BullMQ on Redis, and workers run it, skipping any account that already exists. Workers create or remove accounts in 8 tools: JumpCloud, Zoho, Slack, Confluence, Jira, Bitbucket, Datadog, and Tailscale. A failed job goes back to the queue to retry with backoff and resumes at the failed step. Workers record every change in a MySQL audit log.',
      src: '/portfolio-previews/architecture/hris-automation.svg'
    },
    built:
      'When HR hires, rehires, or offboards someone, the system creates or removes their accounts in each tool automatically. If a step fails, the retry picks up where it stopped without creating duplicates, and every change is recorded for audit.',
    chapters: [
      { at: 0, label: 'Setup fails halfway' },
      { at: 4, label: 'Retry, no duplicates' },
      { at: 9, label: 'Ready on day one' }
    ],
    preview: '/portfolio-previews/work-sample-auth-access.webp',
    problem:
      'Every new hire needs accounts in 8 company tools on day one, and every leaver needs them removed.',
    role: 'Identity and access governance',
    stack: ['Node.js', 'TypeScript', 'BullMQ', 'Redis', 'MySQL', 'Access control management'],
    title: 'HRIS automation workflow',
    video: '/portfolio-previews/motion/work-sample-auth-access.mp4'
  },
  {
    architecture: {
      alt: "Simplified architecture. A collector sets each loan's next step in a Next.js console, which sends it to the collections API (Node.js with a Redis queue). The API places browser calls through Vonage Voice and sends template reminders through WhatsApp. Call status from Vonage and replies from WhatsApp land on one MySQL timeline per loan, with entries such as a call with no answer, a reminder read, and a promise to pay.",
      src: '/portfolio-previews/architecture/loan-collection.svg'
    },
    built:
      'Each overdue loan gets an owner and a next step: a call, a WhatsApp message, or a field visit. Collectors call from the browser through Vonage and send WhatsApp reminders from templates. Every contact and promise to pay lands on one timeline.',
    chapters: [
      { at: 0, label: 'No single record' },
      { at: 2.5, label: 'Call, then WhatsApp' },
      { at: 8, label: 'Promise to pay logged' }
    ],
    preview: '/portfolio-previews/work-sample-loan-collection.webp',
    problem: 'Collectors chase each overdue loan by phone, WhatsApp, and field visits, with no single record of who was contacted or what they promised.',
    role: 'Collections operations',
    stack: ['Next.js', 'Node.js', 'MySQL', 'Redis', 'Vonage', 'WhatsApp API'],
    title: 'Multi-channel loan collections',
    video: '/portfolio-previews/motion/work-sample-loan-collection.mp4'
  },
  {
    architecture: {
      alt: "Simplified architecture. A Next.js checkout places the order with the order service, which owns the order's state. The order service asks the payment service to pay, and the payment service charges through Midtrans. Midtrans confirms by webhook into Kafka, Kafka passes the payment back to the order service as paid, and the order service moves the order in the SQL orders database from awaiting to paid. A reconciliation job compares those orders with Midtrans settlement data and flags mismatches.",
      src: '/portfolio-previews/architecture/ecommerce-payment.svg'
    },
    built:
      'Every order moves through clear stages, from awaiting payment to paid. The payment provider confirms each payment directly, and a regular check matches every order to the money received.',
    chapters: [
      { at: 0, label: 'Paid, order waits' },
      { at: 4, label: 'Provider confirms' },
      { at: 7, label: 'Every order matched' }
    ],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.webp',
    problem: "After a customer pays, the store can't always tell whether the payment went through, so the order waits with no clear status.",
    role: 'Checkout and payments',
    stack: ['Next.js', 'Microservices', 'Kafka', 'Payment API', 'Webhooks', 'SQL'],
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
        text: "Built the bank's employee access system from scratch: a workflow engine that grants and removes access across 8 company tools, with an audit trail"
      },
      {
        text: 'Designed and built most of the loan collections system: calls from the browser, WhatsApp reminders, and field visits on one timeline per loan'
      },
      { text: 'Cut average API execution time by 37% with refactoring and Redis caching' },
      {
        target: 'krom-shared-package',
        text: 'Shipped a shared auth, logging, and feature-flag package adopted by multiple internal apps'
      },
      { text: 'Mentored two engineers on the team' }
    ],
    period: 'Jan 2023 – Present',
    role: 'Senior Full-Stack Engineer',
    titles: [
      { period: 'May 2026 – Present', role: 'Senior Full-Stack Engineer' },
      { period: 'Jan 2023 – May 2026', role: 'Full-Stack Engineer' }
    ],
    summary:
      'Frontend and backend work for a digital bank on Next.js, Node.js, and TypeScript.',
    years: '2023'
  },
  {
    company: 'Jenius / Bank SMBC Indonesia',
    highlights: [
      {
        target: 'jenius-lending',
        text: 'Owned the Flexi Cash lending services: 2M+ transactions a month at 99.98% uptime, on Node.js and GraphQL'
      },
      { text: 'Kept loan applications and payouts stable while the user base grew 147% in three years' },
      { text: 'Built event-driven partner APIs on Kafka that brought Flexi Cash to more retail partners' }
    ],
    period: 'Dec 2019 – Dec 2022',
    role: 'Backend Engineer',
    summary: 'Backend services for Flexi Cash, a digital lending product.',
    years: '2019'
  },
  {
    company: 'Iverson Technology',
    highlights: [
      { text: 'Customized ERP workflows and reports for clients, including JNE and Gramedia' },
      { text: 'Integrated data warehouse, enterprise portal, and point-of-sale systems' },
      { text: 'Trained hundreds of professionals at client companies on Dynamics AX customization' }
    ],
    period: 'Dec 2017 – Dec 2019',
    role: 'Technical Consultant',
    summary: 'Microsoft Dynamics AX consulting for enterprise clients.',
    years: '2017'
  }
];

export const siteMeta = {
  url: 'https://dennydharmawan.com/',
  title: 'Denny Dharmawan | Senior Software Engineer, Full-Stack',
  description:
    'Senior full-stack engineer in Jakarta. I built access automation at Krom Bank and owned lending services at Jenius that handled 2M+ transactions a month.'
} as const;

export const profileLinks = {
  linkedIn: 'https://www.linkedin.com/in/ddharmawan',
  gitHub: 'https://github.com/dennydharmawan'
} as const;

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
