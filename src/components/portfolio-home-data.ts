import type { CapabilityKind } from '@/components/capability-instruments';
import type { StageLayerId } from '@/components/system-stage-data';

export const aboutSystemsImage = '/portfolio-previews/about-evening-workspace-relume.png';

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
    windowLabel: 'accounts.trace'
  },
  {
    kind: 'ai',
    tail: 'running in production, not in a demo',
    title: 'AI-assisted delivery',
    windowLabel: 'agent.run'
  },
  {
    kind: 'production',
    tail: 'designed to stay up',
    title: 'Production systems',
    windowLabel: 'status'
  },
  {
    kind: 'standards',
    tail: 'other teams extend',
    title: 'Engineering standards',
    windowLabel: 'review.gate'
  }
];

export type Project = {
  bullets: string[];
  layers: StageLayerId[];
  preview: string;
  role: string;
  stack: string[];
  summary: string;
  title: string;
  video: string;
};

export const projects: Project[] = [
  {
    bullets: [
      'Four specialist agents review a diff in parallel for security, correctness, testing, and conventions',
      'A merger drops findings whose cited code does not support the claim, then routes the rest through confidence gates',
      'Security findings never auto-post. Low-confidence notes go to a private approval queue before a human spends attention on them'
    ],
    layers: ['delivery'],
    preview: '/portfolio-previews/work-sample-pr-reviewer.png',
    role: 'Internal developer tooling',
    stack: ['TypeScript', 'AWS Bedrock', 'Webhooks', 'AST analysis'],
    summary:
      'Production pull-request reviewer. Four agents score a diff in parallel. A merger keeps only evidence-backed findings and controls what can auto-post.',
    title: 'Multi-agent PR reviewer',
    video: '/portfolio-previews/motion/work-sample-pr-reviewer.mp4'
  },
  {
    bullets: [
      'Identity events dispatch a durable workflow that provisions accounts across several third-party providers',
      'Every step is checkpointed and idempotent, so a retry after a halfway failure never creates a duplicate account',
      'Roles, permissions, and an audit log that stays the system of record for who has access to what'
    ],
    layers: ['access', 'data'],
    preview: '/portfolio-previews/work-sample-auth-access.png',
    role: 'Identity and access governance',
    stack: ['Node.js', 'BullMQ', 'RBAC', 'PostgreSQL'],
    summary:
      'NDA-safe prototype for identity-driven provisioning, RBAC, and audit logs. I ship the same access patterns in regulated products.',
    title: 'Authentication and access management',
    video: '/portfolio-previews/motion/work-sample-auth-access.mp4'
  },
  {
    bullets: [
      'Overdue accounts land in prioritized queues with owners, due dates, and escalation state',
      'WhatsApp API messages for reminders, payment promises, and follow-up templates',
      'Activity log for collector actions, customer replies, promises, and outcomes'
    ],
    layers: ['queue', 'client'],
    preview: '/portfolio-previews/work-sample-loan-collection.png',
    role: 'Collections operations and messaging',
    stack: ['React', 'Node.js', 'WhatsApp API', 'Queues'],
    summary:
      'Collections workspace for overdue accounts: owners, queues, WhatsApp follow-ups, and an activity log for outcomes.',
    title: 'Loan collection system',
    video: '/portfolio-previews/motion/work-sample-loan-collection.mp4'
  },
  {
    bullets: [
      'Catalog, cart, checkout, order status, inventory visibility, and admin operations',
      'Payment intent states, webhooks, reconciliation, and customer confirmation',
      'Storefront UX kept separate from payment and fulfillment operations'
    ],
    layers: ['client', 'data'],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.png',
    role: 'Commerce checkout and payments',
    stack: ['Next.js', 'Payment API', 'Webhooks', 'SQL'],
    summary:
      'Storefront and checkout with payment intents, webhooks, reconciliation, and a clean split between customer UX and fulfillment.',
    title: 'E-commerce payment platform',
    video: '/portfolio-previews/motion/work-sample-ecommerce-payment.mp4'
  }
];

export const experiences = [
  {
    company: 'Krom Bank',
    current: true,
    highlights: [
      'Built the identity and access governance platform, the system of record for access decisions',
      'Shipped a shared auth, logging, and feature-flag package adopted by four production apps',
      'Wrote the Git workflow standard used by 5+ teams on one codebase'
    ],
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer',
    titles: [
      { period: 'May 2026 - Present', role: 'Senior Full-Stack Engineer' },
      { period: 'Jan 2023 - May 2026', role: 'Full-Stack Engineer' }
    ],
    summary: 'Platform and product engineering for a digital bank on Next.js, Node.js, and TypeScript.',
    years: '2023'
  },
  {
    company: 'Jenius / Bank SMBC Indonesia',
    highlights: [
      'Owned loan origination, disbursement, and partner APIs on Node.js, GraphQL, and Kafka',
      'Built retail partner integrations that widened digital lending distribution',
      'Kept the backend maintainable while users grew 147% over three years'
    ],
    period: 'Dec 2019 - Dec 2022',
    role: 'Back End Engineer',
    summary: 'Backend services for Flexi Cash, a digital lending product.',
    years: '2019'
  },
  {
    company: 'Iverson Technology',
    highlights: [
      'Customized Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia',
      'Integrated data warehouse, enterprise portal, and point-of-sale systems',
      'Trained hundreds of professionals on Dynamics AX customization'
    ],
    period: 'Dec 2017 - Dec 2019',
    role: 'Technical Consultant',
    summary: 'ERP customization and integration for enterprise clients.',
    years: '2017'
  }
];

export const trustedTeams = [
  {
    logo: '/company-logos/krom-bank.svg',
    logoClassName: 'h-7 max-w-[7.75rem]',
    name: 'Krom Bank'
  },
  {
    logo: '/company-logos/bank-smbc-indonesia.svg',
    logoClassName: 'h-9 max-w-[8.5rem]',
    name: 'Bank SMBC Indonesia'
  },
  {
    logo: '/company-logos/jenius.svg',
    logoClassName: 'h-7 max-w-[7.75rem]',
    name: 'Jenius'
  }
];
