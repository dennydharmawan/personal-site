export type StoryId = 'pr-reviewer' | 'employee-access' | 'loan-collections' | 'lending';

export type FlowNode = { label: string; tag?: string };

/** Each column appears on one arrow press, left to right. A column with several nodes is a fan-out. */
export type Flow = readonly (readonly FlowNode[])[];

/**
 * One system, told with HERO. The slide carries the headline, the problem, and my part for every reader.
 * The architecture diagram in docs/intro-diagrams carries the rationale and the operations.
 */
export type Story = {
  /** Where the work happened: an employer, or "Design study" for work that was never deployed. */
  context: string;
  problem: string;
  flow: Flow;
  headline: string;
  id: StoryId;
  name: string;
  period: string;
  proof: { label: string; value: string };
  role: string;
  shortName: string;
};

export type StackGroup = { items: readonly string[]; name: string };


export const stories: Record<StoryId, Story> = {
  'pr-reviewer': {
    context: 'Design study',
    problem: 'AI reviewers post every finding, so teams mute them within weeks.',
    flow: [
      [{ label: 'Pipeline step' }, { label: 'Slack mention' }],
      [{ label: 'Orchestrator', tag: 'pulls repository context' }],
      [
        { label: 'Security agent' },
        { label: 'Correctness agent' },
        { label: 'Testing agent' },
        { label: 'Conventions agent' }
      ],
      [{ label: 'Merger and gate', tag: 'drops unsupported findings' }],
      [{ label: 'PR comment' }, { label: 'Slack approval', tag: 'security or low confidence' }]
    ],
    headline: "A code reviewer designed so your team won't mute it.",
    id: 'pr-reviewer',
    name: 'Multi-agent PR reviewer',
    period: '2026',
    proof: { label: 'agents behind one gate', value: '4' },
    role: 'I designed four agents behind a gate that posts only confident findings and sends security ones to a person.',
    shortName: 'PR reviewer'
  },
  'employee-access': {
    context: 'Krom Bank',
    problem: 'Access to 8 company tools was a manual checklist, and at a bank, late removal is an audit risk.',
    flow: [
      [{ label: 'HR system', tag: 'start or exit date' }],
      [{ label: 'Workflow engine' }],
      [{ label: 'Job queue', tag: 'one checkpoint per step' }],
      [{ label: '8 company tools' }, { label: 'Audit log' }]
    ],
    headline: 'New hires get access on day one. Leavers lose it when they go.',
    id: 'employee-access',
    name: 'HRIS automation system',
    period: '2024–2026',
    proof: { label: 'tools on one workflow', value: '8' },
    role: 'I built the workflow engine from scratch. A failed step retries where it stopped, and every change is audited.',
    shortName: 'HRIS automation'
  },
  'loan-collections': {
    context: 'Krom Bank',
    problem: 'Collectors chased loans by phone, WhatsApp, and visits, with no record of who was contacted or what they promised.',
    flow: [
      [{ label: 'Overdue loans', tag: 'daily feed' }],
      [{ label: 'Assignment job', tag: 'rules and round robin' }],
      [
        { label: 'Browser calls', tag: 'Vonage' },
        { label: 'Field visits', tag: 'mobile app' },
        { label: 'WhatsApp reminders' }
      ],
      [{ label: 'Case record', tag: 'calls, visits, promises to pay' }]
    ],
    headline: 'Each overdue loan gets an owner and a next step.',
    id: 'loan-collections',
    name: 'Loan collections system',
    period: '2024–2025',
    proof: { label: 'every overdue loan assigned, daily', value: '8 AM' },
    role: 'I designed the data model and built most of the app: daily assignment, browser calls, and one record per case.',
    shortName: 'Loan collections'
  },
  lending: {
    context: 'Jenius',
    problem: 'Lending had to stay stable at 2M+ transactions a month while users grew 147% and retail partners joined.',
    flow: [
      [{ label: 'Jenius app' }, { label: 'Retail partners' }],
      [{ label: 'GraphQL API' }],
      [{ label: 'Lending services', tag: 'origination, disbursement' }],
      [{ label: 'Kafka events', tag: 'partner integrations' }]
    ],
    headline: 'I brought Flexi Cash to more retail partners.',
    id: 'lending',
    name: 'Flexi Cash lending',
    period: '2019–2022',
    proof: { label: 'transactions a month', value: '2M+' },
    role: 'I owned the lending services on Node.js and GraphQL and built the Kafka partner APIs, at 99.98% uptime.',
    shortName: 'Flexi Cash'
  }
};

export const storyOrder: readonly StoryId[] = [
  'pr-reviewer',
  'employee-access',
  'loan-collections',
  'lending'
];

export const stack: readonly StackGroup[] = [
  { items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'], name: 'Frontend' },
  { items: ['Node.js', 'Express', 'GraphQL', 'REST', 'BullMQ'], name: 'Backend' },
  { items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka'], name: 'Data' },
  { items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Datadog'], name: 'Cloud and ops' }
];

export type Slide =
  | { kind: 'intro' }
  | { kind: 'story'; story: Story }
  | { kind: 'stack' };

export const slides: readonly Slide[] = [
  { kind: 'intro' },
  ...storyOrder.map((id): Slide => ({ kind: 'story', story: stories[id] })),
  { kind: 'stack' }
];

/** How many arrow presses a slide takes before the next press moves to the next slide. */
export function revealSteps(slide: Slide) {
  return slide.kind === 'story' ? slide.story.flow.length - 1 : 0;
}
