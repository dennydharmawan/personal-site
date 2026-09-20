export type StageLayerId = 'delivery' | 'client' | 'access' | 'queue' | 'data';

export type StageLayer = {
  id: StageLayerId;
  label: string;
  caption: string;
  nodes: string[];
};

const delivery: StageLayer = {
  id: 'delivery',
  label: 'Delivery',
  caption: 'CI, AI review agents, git workflow',
  nodes: ['PR review agents', 'Git workflow', 'Shared packages']
};

const client: StageLayer = {
  id: 'client',
  label: 'Client',
  caption: 'Next.js, React, design systems',
  nodes: ['Next.js', 'React', 'Design system']
};

const access: StageLayer = {
  id: 'access',
  label: 'API & access',
  caption: 'Node services, RBAC, audit logs',
  nodes: ['Node.js / GraphQL', 'RBAC · CASL', 'Audit log']
};

const queue: StageLayer = {
  id: 'queue',
  label: 'Queues & integrations',
  caption: 'BullMQ, Kafka, webhooks, messaging',
  nodes: ['BullMQ · Redis', 'Kafka', 'Webhooks · WhatsApp']
};

const data: StageLayer = {
  id: 'data',
  label: 'Data & observability',
  caption: 'PostgreSQL, MongoDB, Datadog',
  nodes: ['PostgreSQL', 'MongoDB', 'Datadog']
};

// The order the hero diagram stacks its layers in.
export const stageLayers: StageLayer[] = [delivery, client, access, queue, data];

// The order a request travels through them, which the work-samples strip draws.
export const requestPathLayers: StageLayer[] = [client, access, queue, data, delivery];
