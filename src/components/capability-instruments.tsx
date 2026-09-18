import { useRef, type JSX } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
  type Transition
} from 'motion/react';
import {
  SiAstro,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiTailwindcss,
  SiTypescript
} from 'react-icons/si';
import { cn } from '@/lib/utils';

export type CapabilityKind = 'ai' | 'fullstack' | 'production' | 'standards';

export const capabilityKinds: CapabilityKind[] = ['fullstack', 'ai', 'production', 'standards'];

const instrumentLabels: Record<CapabilityKind, string> = {
  ai: 'Illustration: a terminal running an agent from a spec file and opening a pull request',
  fullstack:
    'Illustration: a request flowing from a React component to a Node route handler and back',
  production: 'Illustration: a status board for API latency, queue depth, and error budget',
  standards: 'Illustration: a merge node ringed by floating labels for passing lint, type, test, and review checks'
};

type Cycle = { initial?: TargetAndTransition; animate?: TargetAndTransition; transition?: Transition };

// Without an explicit initial, motion mounts SVG attribute targets like cx/cy as "undefined"
// for one frame before the first keyframe applies.
function firstKeyframe(keyframes: TargetAndTransition): TargetAndTransition {
  return Object.fromEntries(
    Object.entries(keyframes).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
}

function cycle(
  reduced: boolean,
  keyframes: TargetAndTransition,
  duration: number,
  times: number[],
  options: { delay?: number; ease?: 'easeInOut' | 'linear' } = {}
): Cycle {
  if (reduced) return {};
  return {
    initial: firstKeyframe(keyframes),
    animate: keyframes,
    transition: {
      delay: options.delay ?? 0,
      duration,
      ease: options.ease ?? 'easeInOut',
      repeat: Number.POSITIVE_INFINITY,
      times
    }
  };
}

const svgLabelClassName = 'fill-slate-500 font-medium';
const svgLabelSize = '10.5';

const codeClientLines = ['const { data } =', '  useAccounts()', 'fetch(', "  '/api/accounts'"];
const codeServerLines = [
  'router.get(',
  "  '/accounts',",
  '  requireRole(',
  "    'admin'),",
  '  listAccounts)'
];

function codeLines(lines: string[], x: number, top: number, lit: number): JSX.Element[] {
  return lines.map((line, index) => (
    <text
      className={index === lit ? 'fill-sky-700 font-mono' : 'fill-slate-500 font-mono'}
      fontSize="10"
      key={line}
      x={x}
      xmlSpace="preserve"
      y={top + index * 16}
    >
      {line}
    </text>
  ));
}

function RequestFlow({ reduced }: { reduced: boolean }): JSX.Element {
  const request = cycle(
    reduced,
    {
      opacity: [0, 1, 1, 0, 0],
      transform: ['translate(0px, 0px)', 'translate(6px, -2px)', 'translate(22px, -32px)', 'translate(28px, -34px)', 'translate(28px, -34px)']
    },
    4.8,
    [0, 0.06, 0.3, 0.38, 1]
  );
  const response = cycle(
    reduced,
    {
      transform: ['translate(0px, 0px)', 'translate(0px, 0px)', 'translate(-6px, 2px)', 'translate(-22px, 32px)', 'translate(-28px, 34px)', 'translate(-28px, 34px)'],
      opacity: [0, 0, 1, 1, 0, 0]
    },
    4.8,
    [0, 0.5, 0.56, 0.8, 0.86, 1]
  );

  return (
    <svg className="size-full" viewBox="0 0 320 240">
      <text className={svgLabelClassName} fontSize={svgLabelSize} x="14" y="30">
        Client
      </text>
      <text className={svgLabelClassName} fontSize={svgLabelSize} x="174" y="30">
        Server
      </text>
      <rect className="fill-slate-50 stroke-slate-900/5" height="118" rx="9" width="132" x="14" y="40" />
      <rect className="fill-slate-50 stroke-slate-900/5" height="118" rx="9" width="132" x="174" y="40" />
      <rect className="fill-sky-50" height="15" rx="3" width="110" x="20" y="101" />
      <rect className="fill-sky-50" height="15" rx="3" width="92" x="180" y="65" />
      {codeLines(codeClientLines, 24, 62, 3)}
      {codeLines(codeServerLines, 184, 58, 1)}
      <path
        className="stroke-sky-200"
        d="M 146 104 C 158 104 162 70 174 70"
        fill="none"
        strokeDasharray="3 3"
        strokeWidth="1.25"
      />
      {reduced ? (
        <circle className="fill-sky-600" cx="174" cy="70" r="3.2" />
      ) : (
        <>
          <motion.circle className="fill-sky-600" cx={146} cy={104} r="3.2" {...request} />
          <motion.circle className="fill-sky-400" cx={174} cy={70} r="3.2" {...response} />
        </>
      )}
      <text className={svgLabelClassName} fontSize={svgLabelSize} x="14" y="192">
        The client call and the route handler
      </text>
      <text className={svgLabelClassName} fontSize={svgLabelSize} x="14" y="208">
        share one typed contract.
      </text>
    </svg>
  );
}

const agentLines = [
  'reading spec: 3 requirements',
  'plan: 4 files',
  'tests: 14 passed',
  'PR #482 opened for review'
];

function AgentRun({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-sky-200" />
        <span className="ml-1 text-xs font-medium text-slate-500">Agent run</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-xl bg-slate-50 p-3 font-mono text-[11px] leading-[1.5] text-slate-500 ring-1 ring-slate-900/5">
        <p className="truncate">
          <span className="text-sky-700">$</span> agent run --spec access-review.md
        </p>
        {agentLines.map((line, index) => {
          const start = 0.04 + index * 0.12;
          return (
            <motion.p
              className={cn('truncate', index === 3 ? 'text-sky-700' : undefined)}
              key={line}
              {...cycle(
                reduced,
                {
                  opacity: [0, 0, 1, 1, 0],
                  transform: ['translateX(-4px)', 'translateX(-4px)', 'translateX(0px)', 'translateX(0px)', 'translateX(0px)']
                },
                6.4,
                [0, start, start + 0.05, 0.94, 0.99]
              )}
            >
              {line}
            </motion.p>
          );
        })}
        <p className="mt-auto flex items-center gap-1">
          <span className="text-slate-500">$</span>
          <motion.span
            className="inline-block h-3 w-1.5 bg-sky-600"
            {...cycle(reduced, { opacity: [1, 1, 0, 0] }, 1.1, [0, 0.49, 0.5, 1])}
          />
        </p>
      </div>
    </div>
  );
}

// Both time-series rows repeat every 50 viewBox units and slide by exactly one period, so the
// snap back to 0 lands on identical pixels.
const seriesPeriod = 50;
const seriesDuration = 7;
const sparkPoints =
  '0,17 10,11 20,15 30,7 40,13 50,17 60,11 70,15 80,7 90,13 100,17 110,11 120,15 130,7 140,13 150,17';
const depthHeights = [10, 14, 8, 18, 12, 7, 15, 11];
const depthBars = Array.from({ length: 24 }, (_, index) => ({
  height: depthHeights[index % depthHeights.length],
  x: index * (seriesPeriod / depthHeights.length)
}));

function StatusRow({ children, label, value }: { children: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[5.5rem] shrink-0 truncate text-[11px] font-medium text-slate-600">
        {label}
      </span>
      <span className="flex h-5 min-w-0 flex-1 items-center">{children}</span>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-600">{value}</span>
    </div>
  );
}

function StatusBoard({ reduced }: { reduced: boolean }): JSX.Element {
  const slide = cycle(
    reduced,
    { transform: ['translateX(0px)', `translateX(-${seriesPeriod}px)`] },
    seriesDuration,
    [0, 1],
    { ease: 'linear' }
  );

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Production</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <motion.span
            className="size-1.5 rounded-full bg-emerald-500"
            {...cycle(reduced, { opacity: [0.45, 1, 0.45] }, 3.6, [0, 0.5, 1])}
          />
          healthy
        </span>
      </div>
      <StatusRow label="API p95" value="142 ms">
        <svg className="size-full overflow-hidden" preserveAspectRatio="none" viewBox="0 0 100 24">
          <motion.polyline
            className="stroke-sky-400"
            fill="none"
            points={sparkPoints}
            strokeLinejoin="round"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            {...slide}
          />
        </svg>
      </StatusRow>
      <StatusRow label="Queue depth" value="18">
        <svg className="size-full overflow-hidden" preserveAspectRatio="none" viewBox="0 0 100 24">
          <motion.g {...slide}>
            {depthBars.map((bar) => (
              <rect
                className="fill-sky-300"
                height={bar.height}
                key={bar.x}
                width="4"
                x={bar.x}
                y={24 - bar.height}
              />
            ))}
          </motion.g>
        </svg>
      </StatusRow>
      <StatusRow label="Error budget" value="99.97%">
        <span className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full w-[94%] rounded-full bg-emerald-500/70" />
        </span>
      </StatusRow>
      <p className="text-[11px] text-slate-500">Last 30 days. Alerts page on-call, not customers.</p>
    </div>
  );
}

type GateChip = {
  className: string;
  drift: TargetAndTransition;
  duration: number;
  delay: number;
  id: string;
  label: string;
};

const gateChips: GateChip[] = [
  {
    className: 'left-[3%] top-[22%] bg-sky-50 text-sky-700 ring-sky-200/70',
    drift: { transform: ['translate(0px, 0px)', 'translate(6px, -7px)', 'translate(0px, 0px)'] },
    duration: 9,
    delay: 0,
    id: 'types',
    label: 'types clean'
  },
  {
    className: 'right-[4%] top-[13%] bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    drift: { transform: ['translate(0px, 0px)', 'translate(-5px, 8px)', 'translate(0px, 0px)'] },
    duration: 11,
    delay: 0.7,
    id: 'lint',
    label: 'lint 0 errors'
  },
  {
    className: 'bottom-[13%] left-[7%] bg-sky-50 text-sky-700 ring-sky-200/70',
    drift: { transform: ['translate(0px, 0px)', 'translate(7px, 6px)', 'translate(0px, 0px)'] },
    duration: 10,
    delay: 1.4,
    id: 'tests',
    label: 'tests 14/14'
  },
  {
    className: 'right-[3%] bottom-[21%] bg-violet-50 text-violet-700 ring-violet-200/70',
    drift: { transform: ['translate(0px, 0px)', 'translate(-6px, -6px)', 'translate(0px, 0px)'] },
    duration: 12,
    delay: 2.1,
    id: 'review',
    label: 'review approved'
  }
];

function ReviewGate({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="flex h-full flex-col p-4">
      <p className="text-sm font-semibold text-slate-900">Nothing merges on trust.</p>
      <p className="mt-0.5 text-xs leading-snug text-slate-500">
        Every branch carries its own proof before it reaches main.
      </p>
      <div className="relative min-h-0 flex-1">
        <div className="absolute top-1/2 left-1/2 aspect-square h-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70" />
        <div className="absolute top-1/2 left-1/2 aspect-square h-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70" />
        <motion.span
          className="absolute top-1/2 left-1/2 aspect-square h-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300"
          {...cycle(reduced, { opacity: [0, 0.9, 0], transform: ['scale(0.72)', 'scale(1.12)', 'scale(1.12)'] }, 5.2, [0, 0.55, 1])}
        />
        <div className="absolute top-1/2 left-1/2 flex aspect-square h-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_-8px_--alpha(var(--color-slate-900)/45%)] ring-1 ring-slate-900/5">
          <svg className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24">
            <path
              className="stroke-slate-900"
              d="M7 4v7a5 5 0 0 0 5 5h5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
            <circle className="fill-white stroke-slate-900" cx="7" cy="19" r="2.4" strokeWidth="1.6" />
            <circle className="fill-white stroke-slate-900" cx="7" cy="4.4" r="2.4" strokeWidth="1.6" />
            <circle className="fill-slate-900" cx="18.5" cy="16" r="2.4" />
          </svg>
        </div>
        {gateChips.map((chip) => (
          <motion.span
            className={cn(
              'absolute inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-medium whitespace-nowrap ring-1',
              chip.className
            )}
            key={chip.id}
            {...cycle(reduced, chip.drift, chip.duration, [0, 0.5, 1], { delay: chip.delay })}
          >
            {chip.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function CapabilityInstrument({
  className,
  kind
}: {
  className?: string;
  kind: CapabilityKind;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  // Off screen, the illustration remounts in its static state so no loop ticks where nobody can see it.
  const reduced = useReducedMotion() === true || !isInView;

  return (
    <div
      ref={ref}
      aria-label={instrumentLabels[kind]}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5',
        className
      )}
      role="img"
    >
      <div aria-hidden="true" className="aspect-[4/3] w-full" key={reduced ? 'static' : 'looping'}>
        {kind === 'fullstack' ? <RequestFlow reduced={reduced} /> : null}
        {kind === 'ai' ? <AgentRun reduced={reduced} /> : null}
        {kind === 'production' ? <StatusBoard reduced={reduced} /> : null}
        {kind === 'standards' ? <ReviewGate reduced={reduced} /> : null}
      </div>
    </div>
  );
}

const stackTiles = [
  { Icon: SiReact, drift: 'translateY(-4px)', duration: 5.2, label: 'React' },
  { Icon: SiNextdotjs, drift: 'translateY(3px)', duration: 6.4, label: 'Next.js' },
  { Icon: SiTypescript, drift: 'translateY(-5px)', duration: 4.6, label: 'TypeScript' },
  { Icon: SiNodedotjs, drift: 'translateY(4px)', duration: 5.8, label: 'Node.js' },
  { Icon: SiPostgresql, drift: 'translateY(-3px)', duration: 6.9, label: 'PostgreSQL' },
  { Icon: SiRedis, drift: 'translateY(5px)', duration: 5.5, label: 'Redis' },
  { Icon: SiTailwindcss, drift: 'translateY(-4px)', duration: 6.1, label: 'Tailwind CSS' },
  { Icon: SiAstro, drift: 'translateY(3px)', duration: 4.9, label: 'Astro' }
];

export function StackGrid({ className }: { className?: string }): JSX.Element {
  const ref = useRef<HTMLUListElement>(null);
  const isInView = useInView(ref);
  const reduced = useReducedMotion() === true || !isInView;

  return (
    <ul
      ref={ref}
      aria-label="Stack: React, Next.js, TypeScript, Node.js, PostgreSQL, Redis, Tailwind CSS, Astro"
      className={cn('grid grid-cols-4 gap-3', className)}
      key={reduced ? 'static' : 'looping'}
    >
      {stackTiles.map(({ Icon, drift, duration, label }, index) => (
        <motion.li
          key={label}
          className={cn(
            'grid aspect-square place-items-center rounded-2xl bg-white text-slate-700 shadow-[0_10px_24px_-14px_--alpha(var(--color-slate-900)/40%)] ring-1 ring-slate-900/5',
            index === 2 && 'text-sky-600'
          )}
          title={label}
          {...cycle(reduced, { transform: ['translateY(0px)', drift, 'translateY(0px)'] }, duration, [0, 0.5, 1], {
            delay: index * 0.37
          })}
        >
          <Icon aria-hidden="true" className="size-[42%]" />
        </motion.li>
      ))}
    </ul>
  );
}
