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
    tail: 'so every access change shows who, what, and when.',
    title: 'Audit trail by default',
    windowLabel: 'access.log'
  },
  {
    kind: 'release',
    tail: 'and move the rest to the next release.',
    title: 'Ship what matters on time',
    windowLabel: 'release.plan'
  },
  {
    kind: 'production',
    tail: 'so the loan service stays up when something breaks.',
    title: 'Plan for the bad day',
    windowLabel: 'status'
  },
  {
    kind: 'standards',
    tail: 'with one package for auth, logging, and flags.',
    title: 'Keep every app consistent',
    windowLabel: 'shared-core'
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
  "I'm a senior full-stack engineer at Krom Bank in Jakarta. I learn how a business works before I write the code. At Krom I built ",
  { evidence: 'krom-access' },
  ', and ',
  { evidence: 'krom-shared-package' },
  ' that multiple internal apps run on. Before Krom, I owned the ',
  { evidence: 'jenius-lending' },
  " for three years. Next, I want a senior full-stack or backend role in fintech or digital banking, with a path to tech lead."
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
  {
    built:
      'When HR hires, rehires, or offboards someone, the system creates or removes their accounts in each tool automatically. If a step fails, the retry picks up where it stopped without creating duplicates, and every change is recorded for audit.',
    chapters: [
      { at: 0, label: 'Setup fails halfway' },
      { at: 4.3, label: 'Retry, no duplicates' },
      { at: 12.7, label: 'Ready on day one' }
    ],
    preview: '/portfolio-previews/work-sample-auth-access.png',
    problem:
      'Every new hire needs accounts in 8 company tools on day one, and every leaver needs them removed.',
    role: 'Identity and access governance',
    stack: ['Node.js', 'TypeScript', 'BullMQ', 'Redis', 'MySQL', 'Kubernetes', 'Access control management'],
    title: 'HRIS automation workflow',
    video: '/portfolio-previews/motion/work-sample-auth-access.mp4'
  },
  {
    built:
      'Each overdue loan gets an owner and a next step: a call, a WhatsApp message, or a field visit. Collectors call from the browser through Vonage and send WhatsApp reminders from templates. Every contact and promise to pay lands on one timeline.',
    chapters: [
      { at: 0, label: 'Overdue accounts queued' },
      { at: 8.6, label: 'WhatsApp reminder sent' },
      { at: 12.4, label: 'Promise to pay logged' }
    ],
    preview: '/portfolio-previews/work-sample-loan-collection.png',
    problem: 'Collectors chase each overdue loan by phone, WhatsApp, and field visits, with no single record of who was contacted or what they promised.',
    role: 'Collections operations',
    stack: ['Next.js', 'Node.js', 'MySQL', 'Redis', 'Vonage', 'WhatsApp API', 'Datadog'],
    title: 'Multi-channel loan collections',
    video: '/portfolio-previews/motion/work-sample-loan-collection.mp4'
  },
  {
    built:
      'Every order moves through clear stages, from awaiting payment to paid. The payment provider confirms each payment directly, and a regular check matches every order to money received.',
    chapters: [
      { at: 0, label: 'Customer pays' },
      { at: 4.6, label: 'Order waits' },
      { at: 13.2, label: 'Payment matched' }
    ],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.png',
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
      }
    ],
    period: 'Jan 2023 – Present',
    role: 'Senior Full-Stack Engineer',
    titles: [
      { period: 'May 2026 – Present', role: 'Senior Full-Stack Engineer' },
      { period: 'Jan 2023 – May 2026', role: 'Full-Stack Engineer' }
    ],
    summary:
      'Frontend and backend work for a digital bank on Next.js, Node.js, and TypeScript. Mentored two engineers.',
    years: '2023'
  },
  {
    company: 'Jenius / Bank SMBC Indonesia',
    highlights: [
      {
        target: 'jenius-lending',
        text: 'Owned the Flexi Cash lending services as main contributor, at 2M+ transactions a month and 99.98% uptime on Node.js and GraphQL'
      },
      { text: 'Kept loan applications and payouts stable while users grew 147% in three years' },
      { text: 'Built event-driven partner APIs on Kafka that brought Flexi Cash to more retail partners' }
    ],
    period: 'Dec 2019 – Dec 2022',
    role: 'Back End Engineer',
    summary: 'Backend services for Flexi Cash, a digital lending product.',
    years: '2019'
  },
  {
    company: 'Iverson Technology',
    highlights: [
      { text: 'Customized ERP workflows and reports for clients including JNE and Gramedia' },
      { text: 'Integrated data warehouse, enterprise portal, and point-of-sale systems' },
      { text: 'Trained hundreds of professionals across 2+ companies on Dynamics AX customization' }
    ],
    period: 'Dec 2017 – Dec 2019',
    role: 'Technical Consultant',
    summary: 'Microsoft Dynamics AX consulting for enterprise clients.',
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
