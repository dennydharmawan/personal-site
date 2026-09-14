import type { JSX } from 'react';
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition
} from 'motion/react';
import { cn } from '@/lib/utils';

export type CapabilityKind = 'ai' | 'fullstack' | 'production' | 'standards';

export const capabilityKinds: CapabilityKind[] = ['fullstack', 'ai', 'production', 'standards'];

const instrumentLabels: Record<CapabilityKind, string> = {
  ai: 'Illustration: a terminal running an agent from a spec file and opening a pull request',
  fullstack:
    'Illustration: a request flowing from a React component to a Node route handler and back',
  production: 'Illustration: a status board for API latency, queue depth, and error budget',
  standards: 'Illustration: a git branch merging into main beside a checklist of review gates'
};

const slate300 = 'var(--color-slate-300)';
const emerald500 = 'var(--color-emerald-500)';

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

const codeClientLines = ['const { data } =', '  useAccounts()', 'fetch(', "  '/api/accounts'"];
const codeServerLines = [
  'router.get(',
  "  '/accounts',",
  '  requireRole(',
  "    'admin'),",
  '  listAccounts)'
];

function paneLabel(text: string, x: number): JSX.Element {
  return (
    <text className="fill-slate-500 font-mono" fontSize="9" letterSpacing="1.4" x={x} y="30">
      {text}
    </text>
  );
}

function codeLines(lines: string[], x: number, top: number, lit: number): JSX.Element[] {
  return lines.map((line, index) => (
    <text
      className={index === lit ? 'fill-teal-700 font-mono' : 'fill-slate-500 font-mono'}
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
    { cx: [146, 152, 168, 174, 174], cy: [104, 102, 72, 70, 70], opacity: [0, 1, 1, 0, 0] },
    4.8,
    [0, 0.06, 0.3, 0.38, 1]
  );
  const response = cycle(
    reduced,
    {
      cx: [174, 174, 168, 152, 146, 146],
      cy: [70, 70, 72, 102, 104, 104],
      opacity: [0, 0, 1, 1, 0, 0]
    },
    4.8,
    [0, 0.5, 0.56, 0.8, 0.86, 1]
  );

  return (
    <svg className="size-full" viewBox="0 0 320 240">
      {paneLabel('CLIENT', 14)}
      {paneLabel('SERVER', 174)}
      <rect className="fill-slate-50 stroke-black/5" height="118" rx="9" width="132" x="14" y="40" />
      <rect className="fill-slate-50 stroke-black/5" height="118" rx="9" width="132" x="174" y="40" />
      <rect className="fill-teal-50" height="15" rx="3" width="110" x="20" y="101" />
      <rect className="fill-teal-50" height="15" rx="3" width="92" x="180" y="65" />
      {codeLines(codeClientLines, 24, 62, 3)}
      {codeLines(codeServerLines, 184, 58, 1)}
      <path
        className="stroke-teal-200"
        d="M 146 104 C 158 104 162 70 174 70"
        fill="none"
        strokeDasharray="3 3"
        strokeWidth="1.25"
      />
      {reduced ? (
        <circle className="fill-teal-600" cx="174" cy="70" r="3.2" />
      ) : (
        <>
          <motion.circle className="fill-teal-600" cx={146} cy={104} r="3.2" {...request} />
          <motion.circle className="fill-teal-400" cx={174} cy={70} r="3.2" {...response} />
        </>
      )}
      <text className="fill-slate-500 font-mono" fontSize="9" letterSpacing="1.4" x="14" y="188">
        REQUEST OUT · RESPONSE BACK
      </text>
      <line className="stroke-black/5" x1="14" x2="306" y1="200" y2="200" />
      <text className="fill-slate-500 font-mono" fontSize="10" x="14" y="220">
        one contract, both sides
      </text>
    </svg>
  );
}

const agentLines = [
  'reading spec … 3 requirements',
  'plan: 4 files',
  'tests 14 passed',
  'PR #482 opened → review queue'
];

function AgentRun({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-teal-200" />
        <span className="ml-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-slate-500">
          agent
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-xl bg-slate-50 p-3 font-mono text-[11px] leading-[1.5] text-slate-500 ring-1 ring-black/5">
        <p className="truncate">
          <span className="text-teal-700">$</span> agent run --spec access-review.md
        </p>
        {agentLines.map((line, index) => {
          const start = 0.12 + index * 0.13;
          return (
            <motion.p
              className={cn('truncate', index === 3 ? 'text-teal-700' : undefined)}
              key={line}
              {...cycle(
                reduced,
                { opacity: [0, 0, 1, 1, 0], x: [-4, -4, 0, 0, 0] },
                6.4,
                [0, start, start + 0.05, 0.9, 0.97]
              )}
            >
              {line}
            </motion.p>
          );
        })}
        <p className="mt-auto flex items-center gap-1">
          <span className="text-slate-500">$</span>
          <motion.span
            className="inline-block h-3 w-1.5 bg-teal-600"
            {...cycle(reduced, { opacity: [1, 1, 0, 0] }, 1.1, [0, 0.49, 0.5, 1])}
          />
        </p>
      </div>
    </div>
  );
}

const sparkPoints =
  '0,17 10,11 20,15 30,7 40,13 50,17 60,11 70,15 80,7 90,13 100,17 110,11 120,15 130,7 140,13 150,17';

function StatusRow({ children, label, value }: { children: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[5.5rem] shrink-0 truncate font-mono text-[11px] text-slate-500">{label}</span>
      <span className="flex h-5 min-w-0 flex-1 items-center">{children}</span>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-600">{value}</span>
    </div>
  );
}

function StatusBoard({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.18em] text-slate-500">
          production
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          <motion.span
            className="size-1.5 rounded-full bg-emerald-500"
            {...cycle(reduced, { opacity: [0.45, 1, 0.45] }, 3.6, [0, 0.5, 1])}
          />
          healthy
        </span>
      </div>
      <StatusRow label="API p95" value="142 ms">
        <svg
          className="size-full overflow-hidden"
          preserveAspectRatio="none"
          viewBox="0 0 100 24"
        >
          <motion.polyline
            className="stroke-teal-400"
            fill="none"
            points={sparkPoints}
            strokeLinejoin="round"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            {...cycle(reduced, { x: [0, -50] }, 7, [0, 1], { ease: 'linear' })}
          />
        </svg>
      </StatusRow>
      <StatusRow label="Queue depth" value="18">
        <span className="flex h-4 w-full items-end gap-[3px]">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => (
            <motion.span
              className="h-full min-w-0 flex-1 origin-bottom rounded-sm bg-teal-200"
              key={bar}
              {...cycle(reduced, { scaleY: [1, 0.18, 1] }, 4.4, [0, 0.5, 1], { delay: bar * 0.1 })}
            />
          ))}
        </span>
      </StatusRow>
      <StatusRow label="Error budget" value="99.97%">
        <span className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.span
            className="block h-full w-[94%] rounded-full bg-emerald-500/70"
            {...cycle(reduced, { opacity: [0.75, 1, 0.75] }, 5.2, [0, 0.5, 1])}
          />
        </span>
      </StatusRow>
      <p className="font-mono text-[10px] text-slate-500">30d window · alerts wired to on-call</p>
    </div>
  );
}

const gates = ['lint', 'types', 'tests', 'review'];

function ReviewGate({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <svg className="size-full" viewBox="0 0 320 240">
      <text className="fill-slate-500 font-mono" fontSize="9" letterSpacing="1.4" x="16" y="30">
        BRANCH FLOW
      </text>
      <text className="fill-teal-700 font-mono" fontSize="9.5" x="46" y="56">
        feature/access-review
      </text>
      <path className="stroke-slate-300" d="M 16 100 H 200" fill="none" strokeWidth="2" />
      <path
        className="stroke-teal-300"
        d="M 46 100 C 62 100 62 70 78 70 H 140 C 156 70 156 100 172 100"
        fill="none"
        strokeWidth="1.75"
      />
      {[16, 46, 172, 200].map((x) => (
        <circle className="fill-white stroke-slate-300" cx={x} cy="100" key={x} r="3.6" strokeWidth="1.75" />
      ))}
      {[86, 126].map((x) => (
        <circle className="fill-white stroke-teal-400" cx={x} cy="70" key={x} r="3.6" strokeWidth="1.75" />
      ))}
      <circle className="fill-teal-600" cx="172" cy="100" r="2" />
      <text className="fill-slate-500 font-mono" fontSize="9" x="18" y="118">
        main
      </text>
      <text className="fill-slate-500 font-mono" fontSize="9.5" x="16" y="146">
        feat(auth): access review job
      </text>
      <text className="fill-slate-500 font-mono" fontSize="9.5" x="16" y="164">
        fix(api): audit log order
      </text>
      <line className="stroke-black/5" x1="16" x2="200" y1="182" y2="182" />
      <text className="fill-slate-500 font-mono" fontSize="9" letterSpacing="1.4" x="16" y="204">
        MERGE WHEN GATES PASS
      </text>
      <line className="stroke-black/5" x1="216" x2="216" y1="30" y2="210" />
      <text className="fill-slate-500 font-mono" fontSize="9" letterSpacing="1.4" x="234" y="44">
        GATES
      </text>
      {gates.map((gate, index) => {
        const y = 78 + index * 34;
        const start = 0.1 + index * 0.13;
        const check = cycle(
          reduced,
          {
            pathLength: [0, 0, 1, 1, 0],
            stroke: [slate300, slate300, emerald500, emerald500, slate300]
          },
          6,
          [0, start, start + 0.08, 0.92, 0.98]
        );
        return (
          <g key={gate}>
            <circle className="fill-white stroke-slate-200" cx="240" cy={y} r="8" strokeWidth="1.5" />
            {reduced ? (
              <path
                d={`M ${236} ${y} l 3 3.4 l 5.4 -6.4`}
                fill="none"
                stroke={emerald500}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
              />
            ) : (
              <motion.path
                d={`M ${236} ${y} l 3 3.4 l 5.4 -6.4`}
                fill="none"
                stroke={slate300}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                {...check}
              />
            )}
            <text className="fill-slate-500 font-mono" fontSize="10.5" x="256" y={y + 3.5}>
              {gate}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CapabilityInstrument({
  active = false,
  className,
  kind,
  placeholder = false,
  replayToken = 0
}: {
  active?: boolean;
  className?: string;
  kind: CapabilityKind;
  // Renders the card shell only, so a hidden or not-yet-hydrated set keeps its layout without looping.
  placeholder?: boolean;
  // Changing the token remounts the illustration, which restarts its loop from the first keyframe.
  replayToken?: number;
}): JSX.Element {
  const reduced = useReducedMotion() === true;

  return (
    <div
      aria-label={instrumentLabels[kind]}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white ring-1 transition duration-300',
        active
          ? '-translate-y-0.5 shadow-md ring-teal-300'
          : 'shadow-sm ring-black/5',
        className
      )}
      role="img"
    >
      <div aria-hidden="true" className="aspect-[4/3] w-full" key={replayToken}>
        {placeholder ? null : (
          <>
            {kind === 'fullstack' ? <RequestFlow reduced={reduced} /> : null}
            {kind === 'ai' ? <AgentRun reduced={reduced} /> : null}
            {kind === 'production' ? <StatusBoard reduced={reduced} /> : null}
            {kind === 'standards' ? <ReviewGate reduced={reduced} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
