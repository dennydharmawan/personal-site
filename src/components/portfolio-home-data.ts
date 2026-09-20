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
      'Overdue accounts land in prioritized queues, each with an owner, a due date, and an escalation state',
      'Reminders, payment promises, and follow-ups go out as WhatsApp API templates, so collectors stop retyping messages',
      'One activity log records collector actions, customer replies, promises, and outcomes'
    ],
    layers: ['queue', 'client'],
    preview: '/portfolio-previews/work-sample-loan-collection.png',
    role: 'Collections operations and messaging',
    stack: ['React', 'Node.js', 'WhatsApp API', 'Queues'],
    summary:
      'Collections workspace for overdue accounts. Queues give every account an owner, WhatsApp handles the follow-ups, and one log records the outcomes.',
    title: 'Loan collection system',
    video: '/portfolio-previews/motion/work-sample-loan-collection.mp4'
  },
  {
    bullets: [
      'Catalog, cart, checkout, and order status for customers, with inventory and admin operations behind them',
      'Payment intents move through explicit states. Webhooks drive reconciliation and the customer confirmation',
      'Storefront UX stays separate from payment and fulfillment, so either side can change alone'
    ],
    layers: ['client', 'data'],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.png',
    role: 'Commerce checkout and payments',
    stack: ['Next.js', 'Payment API', 'Webhooks', 'SQL'],
    summary:
      'Storefront and checkout built on payment intents and webhooks, with reconciliation and a clean split between customer UX and fulfillment.',
    title: 'E-commerce payment platform',
    video: '/portfolio-previews/motion/work-sample-ecommerce-payment.mp4'
  }
];

export const experiences = [
  {
    company: 'Krom Bank',
    current: true,
    highlights: [
      'Built the access governance platform that automates onboarding, rehire, and offboarding access, with continuous reconciliation and an audit trail',
      'Shipped a shared auth, logging, and feature-flag package adopted by four production apps',
      'Improved API performance 37% by refactoring legacy modules and adding targeted caching',
      'Designed the Datadog dashboards and tracing that became the company monitoring template'
    ],
    period: 'Jan 2023 – Present',
    role: 'Senior Full-Stack Engineer',
    titles: [
      { period: 'May 2026 – Present', role: 'Senior Full-Stack Engineer' },
      { period: 'Jan 2023 – May 2026', role: 'Full-Stack Engineer' }
    ],
    summary:
      'Platform and product engineering for a digital bank on Next.js, Node.js, and TypeScript. Mentored two engineers and wrote the Git workflow used by 5+ teams.',
    years: '2023'
  },
  {
    company: 'Jenius / Bank SMBC Indonesia',
    highlights: [
      'Ran the lending backends at 2M+ transactions a month and 99.98% uptime on Node.js, GraphQL, and Kafka',
      'Kept origination and disbursement stable while users grew 147% in three years',
      'Built retail partner APIs on Kafka events that widened digital lending distribution'
    ],
    period: 'Dec 2019 – Dec 2022',
    role: 'Back End Engineer',
    summary: 'Backend services for Flexi Cash, a digital lending product.',
    years: '2019'
  },
  {
    company: 'Iverson Technology',
    highlights: [
      'Customized Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia',
      'Integrated data warehouse, enterprise portal, and point-of-sale systems',
      'Trained 200 professionals on Dynamics AX customization'
    ],
    period: 'Dec 2017 – Dec 2019',
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
