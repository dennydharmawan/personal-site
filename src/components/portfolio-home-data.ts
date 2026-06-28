export const aboutSystemsImage = '/portfolio-previews/about-desk-workspace.png';

export const expertiseItems = [
  {
    body: "I've spent most of my career building across the full stack in fintech. The part I care most about isn't whether the feature ships. It's whether the code is still understandable six months later, by someone who wasn't in the room when it was written.",
    title: 'Full-Stack Engineering'
  },
  {
    body: "I actually use AI coding tools in production. I've built internal frameworks around spec-driven prompting and structured context-setting, and presented the approach to my engineering team. It's part of how I work, not a side experiment.",
    title: 'AI-Native Development'
  },
  {
    body: 'Designing and building full-stack systems that hold up in production: scalable APIs, reliable workflows, maintainable architecture, and clear operational guardrails. My financial systems background keeps the work grounded in data integrity, security, and operational risk.',
    title: 'Large-Scale Systems'
  }
];

export const capabilityTiles = [
  {
    image: '/portfolio-previews/capability-product-systems.png',
    title: 'Full-stack engineering visual'
  },
  {
    image: '/portfolio-previews/capability-platform-foundations.png',
    title: 'AI-native development visual'
  },
  {
    image: '/portfolio-previews/capability-production-reliability.png',
    title: 'Large-scale systems visual'
  }
];

export const projects = [
  {
    bullets: [
      'User and team management with roles, permissions, protected resources, and admin actions',
      'RBAC rules for product features, API routes, and sensitive operational workflows',
      'Access requests, approvals, and audit logs for traceable permission changes'
    ],
    preview: '/portfolio-previews/work-sample-auth-access-device.webp',
    role: 'Authentication, RBAC, and user management',
    stack: ['Next.js', 'Node.js', 'RBAC', 'PostgreSQL'],
    summary:
      'A planned platform for sign-in, user accounts, team membership, role-based permissions, access requests, and audit logs.',
    title: 'Authentication & Access Management'
  },
  {
    bullets: [
      'Designed to turn delinquent accounts into prioritized queues with owners, due dates, and escalation state',
      'Planned WhatsApp API messaging for reminders, promises to pay, and follow-up templates',
      'Collection activity, customer responses, payment promises, and operational outcome tracking'
    ],
    preview: '/portfolio-previews/work-sample-loan-collection-device.webp',
    role: 'Fintech operations workflow and integration design',
    stack: ['React', 'Node.js', 'WhatsApp API', 'Queues'],
    summary:
      'A planned loan collection workspace for prioritizing overdue accounts, coordinating collectors, and sending WhatsApp-based follow-ups.',
    title: 'Loan Collection System'
  },
  {
    bullets: [
      'Designed to cover catalog, cart, checkout, order status, inventory visibility, and admin operations',
      'Planned payment intent states, callbacks, reconciliation, and customer-facing confirmation',
      'Clear separation between storefront UX and operational payment and fulfillment workflows'
    ],
    preview: '/portfolio-previews/work-sample-ecommerce-payment-device.webp',
    role: 'Commerce product flow and payment integration',
    stack: ['Next.js', 'Payment API', 'Webhooks', 'SQL'],
    summary:
      'A planned e-commerce platform prototype with product browsing, checkout, payment integration, and order management.',
    title: 'E-commerce Payment Platform'
  },
  {
    bullets: [
      'Designed to generate carousel drafts from a prompt, topic outline, or reusable content structure',
      'Planned brand presets, slide-level editing, image choices, and export-ready layouts',
      'AI generation connected to a practical editing workflow instead of one-shot output'
    ],
    preview: '/portfolio-previews/work-sample-ai-carousel-device.webp',
    role: 'AI-assisted creative tooling and frontend workflow',
    stack: ['React', 'AI API', 'Canvas UI', 'Export'],
    summary:
      'A planned social media carousel generator that helps users turn ideas into editable, branded carousel posts with AI support.',
    title: 'AI Carousel Generator'
  }
];

export const experiences = [
  {
    bullets: [
      'Maintain and improve internal fintech platforms used by business and operations teams, with focus on reliability, maintainability, and performance.',
      'Owned end-to-end system design and delivery for internal operations tools across data modeling, workflow UI, API integration, monitoring, and release support.',
      'Reduced average API execution time by 37% by addressing technical debt in legacy modules, improving code structure, and adding targeted caching.',
      'Designed access-management workflows covering RBAC, access review, audit trails, and operational approval flows.',
      'Built shared internal libraries for audit logging, feature-flag management, and common implementation utilities that helped standardize delivery.',
      'Drive engineering standards through RFCs, technical documentation, reusable implementation patterns, and cross-functional delivery.',
      'Improved production reliability through monitoring dashboards, distributed tracing, CI/CD improvements, and infrastructure migration support.'
    ],
    company: 'Krom Bank',
    current: true,
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer',
    roleHistory: [
      {
        period: 'May 2026 - Present',
        role: 'Senior Full-Stack Engineer'
      },
      {
        period: 'Jan 2023 - May 2026',
        role: 'Full-Stack Engineer'
      }
    ]
  },
  {
    bullets: [
      'Built and maintained backend services for Jenius and Flexi Cash using Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
      'Served on the backend team during Flexi Cash growth from launch to a 147% increase in user base over three years.',
      'Developed APIs, data flows, and service integrations for loan origination, funding disbursement, and partner distribution workflows.',
      'Built external retail partner integration flows to expand Flexi Cash digital lending distribution.',
      'Improved backend maintainability through service refactoring, integration reliability improvements, and cleaner error handling.'
    ],
    company: 'Jenius / Bank SMBC Indonesia',
    period: 'Dec 2019 - Jan 2022',
    role: 'Back End Engineer'
  },
  {
    bullets: [
      'Customized Microsoft Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia.',
      'Translated business requirements into ERP customizations, integrations, and operational fixes.',
      'Built and supported integrations across data warehouse, enterprise portal, and POS printer-related systems.',
      'Trained professionals from multiple companies in Dynamics AX customization and implementation practices.'
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
