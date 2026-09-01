export const aboutSystemsImage = '/portfolio-previews/about-evening-couch-accent-refined.png';

export const expertiseItems = [
  {
    body: 'Most of my work is TypeScript across React, Next.js, and Node services in fintech. I optimize for code another engineer can change six months later without the original author in the room.',
    title: 'Full-stack engineering'
  },
  {
    body: 'I run AI coding tools in production delivery, not as a demo. Spec-driven prompts and structured context are part of how I ship, and I have walked the engineering team through that setup.',
    title: 'AI-assisted delivery'
  },
  {
    body: 'I design APIs, queues, access control, and monitoring for systems that have to stay up. Banking work keeps data integrity, auditability, and operational risk in the design from day one.',
    title: 'Production systems'
  }
];

export const capabilityTiles = [
  {
    image: '/portfolio-previews/capability-product-systems.png',
    title: 'Full-stack engineering visual'
  },
  {
    image: '/portfolio-previews/capability-platform-foundations.png',
    title: 'AI-assisted delivery visual'
  },
  {
    image: '/portfolio-previews/capability-production-reliability.png',
    title: 'Production systems visual'
  }
];

export const projects = [
  {
    bullets: [
      'Four specialist agents review a diff in parallel for security, correctness, testing, and conventions',
      'A merger drops findings whose cited code does not support the claim, then routes the rest through confidence gates',
      'Security findings never auto-post. Low-confidence notes go to a private approval queue before a human spends attention on them'
    ],
    preview: '/portfolio-previews/work-sample-pr-reviewer.png',
    role: 'Internal developer tooling',
    stack: ['TypeScript', 'AWS Bedrock', 'Webhooks', 'AST analysis'],
    summary:
      'Multi-agent pull-request reviewer I built and run in production. Agents score a diff in parallel. A merger keeps only evidence-backed findings and controls what can auto-post.',
    title: 'Multi-agent PR reviewer'
  },
  {
    bullets: [
      'Account and team management with roles, permissions, protected resources, and admin actions',
      'RBAC checks on product features, API routes, and sensitive operational workflows',
      'Access requests, approvals, and audit logs for permission changes'
    ],
    preview: '/portfolio-previews/work-sample-auth-access.png',
    role: 'Auth, RBAC, and admin workflows',
    stack: ['Next.js', 'Node.js', 'RBAC', 'PostgreSQL'],
    summary:
      'Prototype covering sign-in, accounts, team membership, RBAC, access requests, and audit logs for regulated product surfaces.',
    title: 'Authentication and access management'
  },
  {
    bullets: [
      'Overdue accounts land in prioritized queues with owners, due dates, and escalation state',
      'WhatsApp API messages for reminders, payment promises, and follow-up templates',
      'Activity log for collector actions, customer replies, promises, and outcomes'
    ],
    preview: '/portfolio-previews/work-sample-loan-collection.png',
    role: 'Collections operations and messaging',
    stack: ['React', 'Node.js', 'WhatsApp API', 'Queues'],
    summary:
      'Prototype loan collection workspace. Queue overdue accounts, assign owners, and send WhatsApp follow-ups with outcome tracking.',
    title: 'Loan collection system'
  },
  {
    bullets: [
      'Catalog, cart, checkout, order status, inventory visibility, and admin operations',
      'Payment intent states, webhooks, reconciliation, and customer confirmation',
      'Storefront UX kept separate from payment and fulfillment operations'
    ],
    preview: '/portfolio-previews/work-sample-ecommerce-payment.png',
    role: 'Commerce checkout and payments',
    stack: ['Next.js', 'Payment API', 'Webhooks', 'SQL'],
    summary:
      'Prototype storefront and checkout with payment intents, webhooks, reconciliation, and order state.',
    title: 'E-commerce payment platform'
  }
];

export const experiences = [
  {
    bullets: [
      'Built the bank identity and access governance platform on Next.js, React, TypeScript, and Node.js. Scope includes RBAC admin, employee directory, audit logging, and periodic access review. It is the system of record for access decisions across internal apps.',
      'Published a shared npm package for authentication, structured logging, and feature flags. Four production apps adopt it through Express.js and Next.js adapters.',
      'Wrote the Git workflow standard now used by 5+ teams on one shared codebase. Covers branch layout, Conventional Commits, PR gates, hotfixes, and release tagging.',
      'Specified a reusable approval framework on CASL. Permissions live as data-driven JSON instead of hardcoded conditionals.',
      'Designed HRIS-integrated account provisioning on BullMQ and Redis. Employee lifecycle events become queued, retryable access jobs.',
      'Shipped an internal operations platform as primary engineer. Introduced Next.js to the team and integrated third-party telephony with partner engineers.',
      'Cut production noise with targeted API caching, Datadog dashboards, and error-context tracing. Other teams reused that monitoring pattern.',
      'Mentor two engineers. Run design and code review. Write the docs other teams use to extend these platforms.'
    ],
    company: 'Krom Bank',
    current: true,
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer'
  },
  {
    bullets: [
      'Built and maintained Flexi Cash backend services on Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
      'Owned APIs, data flows, and Kafka integrations for loan origination, funding disbursement, and partner distribution.',
      'Built retail partner integration flows that widened digital lending distribution.',
      'Stayed on the backend team while the product grew 147% in users over three years from launch.',
      'Refactored services, hardened integrations, and cleaned error handling to keep the backend maintainable.'
    ],
    company: 'Jenius / Bank SMBC Indonesia',
    period: 'Dec 2019 - Dec 2022',
    role: 'Back End Engineer'
  },
  {
    bullets: [
      'Customized Microsoft Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia.',
      'Turned business requirements into ERP customizations, integrations, and reporting.',
      'Built integrations across data warehouse, enterprise portal, and point-of-sale systems.',
      'Trained hundreds of professionals at 2+ companies on Dynamics AX customization and implementation.'
    ],
    company: 'Iverson Technology',
    period: 'Dec 2017 - Dec 2019',
    role: 'Technical Consultant'
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
