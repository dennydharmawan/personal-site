export type StageLayerId = 'delivery' | 'client' | 'access' | 'queue' | 'data';

export type StageLayer = {
  id: StageLayerId;
  label: string;
  caption: string;
  nodes: string[];
};

export const stageLayers: StageLayer[] = [
  {
    id: 'delivery',
    label: 'Delivery',
    caption: 'CI, AI review agents, git workflow',
    nodes: ['PR review agents', 'Git workflow', 'Shared packages']
  },
  {
    id: 'client',
    label: 'Client',
    caption: 'Next.js, React, design systems',
    nodes: ['Next.js', 'React', 'Design system']
  },
  {
    id: 'access',
    label: 'API & access',
    caption: 'Node services, RBAC, audit logs',
    nodes: ['Node.js / GraphQL', 'RBAC · CASL', 'Audit log']
  },
  {
    id: 'queue',
    label: 'Queues & integrations',
    caption: 'BullMQ, Kafka, webhooks, messaging',
    nodes: ['BullMQ · Redis', 'Kafka', 'Webhooks · WhatsApp']
  },
  {
    id: 'data',
    label: 'Data & observability',
    caption: 'PostgreSQL, MongoDB, Datadog',
    nodes: ['PostgreSQL', 'MongoDB', 'Datadog']
  }
];
