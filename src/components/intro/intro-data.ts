export type StoryId = 'pr-reviewer' | 'employee-access' | 'loan-collections' | 'lending';

export type FlowNode = { label: string; tag?: string };

/** Each column appears on one arrow press, left to right. A column with several nodes is a fan-out. */
export type Flow = readonly (readonly FlowNode[])[];

/**
 * One system, told with HERO. The slide carries the headline and the effect for every reader.
 * The architecture diagram in docs/intro-diagrams carries the rationale and the operations.
 */
export type Story = {
  /** Where the work happened: an employer, or "Design study" for work that was never deployed. */
  context: string;
  effect: string;
  flow: Flow;
  headline: string;
  id: StoryId;
  name: string;
  period: string;
  proof: { label: string; value: string };
  role: string;
  shortName: string;
};

export type Closing = { heading: string; points: readonly string[]; shortHeading: string };


export const stories: Record<StoryId, Story> = {
  'pr-reviewer': {
    context: 'Design study',
    effect:
      'AI reviewers that post every finding get muted within weeks. In my design, four agents review each diff, and a gate posts only the findings they are confident about. Every security finding goes to a person first.',
    flow: [
      [{ label: 'Pipeline step' }, { label: 'Slack mention' }],
      [{ label: 'Orchestrator', tag: 'pulls repository context' }],
      [{ label: '4 specialist agents', tag: 'security, correctness, testing, conventions' }],
      [{ label: 'Merger and gate', tag: 'drops unsupported findings' }],
      [{ label: 'PR comment' }, { label: 'Slack approval', tag: 'security or low confidence' }]
    ],
    headline: "A code reviewer designed so your team won't mute it.",
    id: 'pr-reviewer',
    name: 'Multi-agent PR reviewer',
    period: '2026',
    proof: { label: 'specialist agents behind one gate', value: '4' },
    role: 'I wrote the whole design: the PRD, the architecture, the API, and the data model.',
    shortName: 'PR reviewer'
  },
  'employee-access': {
    context: 'Krom Bank',
    effect:
      'When HR hires, rehires, or offboards someone, the system creates or removes their accounts in each tool automatically. If a step fails, the retry picks up where it stopped without creating duplicates, and every change is recorded for audit.',
    flow: [
      [{ label: 'HR system', tag: 'start or exit date' }],
      [{ label: 'Workflow engine' }],
      [{ label: 'Job queue', tag: 'one checkpoint per step' }],
      [{ label: '8 company tools' }, { label: 'Audit log' }]
    ],
    headline: 'New hires get their accounts on day one. Leavers lose them when they leave.',
    id: 'employee-access',
    name: 'Employee access system',
    period: '2024–2026',
    proof: { label: 'company tools on one workflow, with every change audited', value: '8' },
    role: 'I built it from scratch: a workflow engine that grants and removes access across 8 company tools, with an audit trail.',
    shortName: 'Access'
  },
  'loan-collections': {
    context: 'Krom Bank',
    effect:
      'Collectors used to chase each overdue loan by phone, WhatsApp, and field visits, with no single record of who was contacted or what they promised.',
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
    proof: { label: 'every overdue loan has a collector, every day', value: '8 AM' },
    role: 'I designed the data model and built most of the frontend and the backend.',
    shortName: 'Collections'
  },
  lending: {
    context: 'Jenius',
    effect:
      'I owned the Flexi Cash lending services on Node.js and GraphQL: 2M+ transactions a month at 99.98% uptime. I kept loan applications and payouts stable while the user base grew 147% in three years.',
    flow: [
      [{ label: 'Jenius app' }, { label: 'Retail partners' }],
      [{ label: 'GraphQL API' }],
      [{ label: 'Lending services', tag: 'origination, disbursement' }],
      [{ label: 'Kafka events', tag: 'partner integrations' }]
    ],
    headline: 'I built the partner APIs that brought Flexi Cash to more retail partners.',
    id: 'lending',
    name: 'Flexi Cash lending',
    period: '2019–2022',
    proof: { label: 'transactions a month', value: '2M+' },
    role: 'Backend engineer for three years, from loan applications to payouts.',
    shortName: 'Lending'
  }
};

export const storyOrder: readonly StoryId[] = [
  'pr-reviewer',
  'employee-access',
  'loan-collections',
  'lending'
];

export const closing: Closing = {
  heading: "What I'm looking for",
  points: [
    'A senior full-stack or backend role.',
    'In fintech or digital banking.',
    'With a path to tech lead.'
  ],
  shortHeading: "What's next"
};

export type Slide =
  | { kind: 'intro' }
  | { kind: 'story'; story: Story }
  | { closing: Closing; kind: 'closing' };

export const slides: readonly Slide[] = [
  { kind: 'intro' },
  ...storyOrder.map((id): Slide => ({ kind: 'story', story: stories[id] })),
  { closing, kind: 'closing' }
];

/** How many arrow presses a slide takes before the next press moves to the next slide. */
export function revealSteps(slide: Slide) {
  return slide.kind === 'story' ? slide.story.flow.length - 1 : 0;
}
