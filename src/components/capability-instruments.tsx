import { useRef, type JSX, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
  type Transition
} from 'motion/react';
import { FaAws } from 'react-icons/fa6';
import {
  SiApachekafka,
  SiDatadog,
  SiGraphql,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiTypescript
} from 'react-icons/si';
import { cn } from '@/lib/utils';

export type CapabilityKind = 'ai' | 'fullstack' | 'production' | 'standards';
export type InstrumentSize = 'small' | 'wide';

// Below lg the instrument is a fixed band; a 4:3 box there would leave the panel mostly blank.
const instrumentBoxClassName: Record<InstrumentSize, string> = {
  small: 'h-60 lg:aspect-[4/3] lg:h-auto',
  wide: 'h-80 sm:h-64 lg:h-[17.5rem]'
};

const instrumentLabels: Record<CapabilityKind, string> = {
  ai: 'Illustration: four review agents running in parallel, merging into confidence and security gates, then a human approval queue',
  fullstack:
    'Illustration: an access request moving through a role check, an audit record, and a quarterly access review',
  production:
    'Illustration: a reliability readout for uptime, monthly transactions, and user growth',
  standards: 'Illustration: three adopted standards merging into one main branch'
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

const panelClassName = 'flex h-full flex-col justify-center p-4';
const widePanelClassName = `${panelClassName} mx-auto w-full max-w-md`;
const captionClassName = 'text-[11px] leading-snug text-zinc-500 text-pretty';
const monoClassName = 'font-mono text-[11px]';

const accessSteps = [
  { detail: 'from an HR event', state: 'queued', step: 'access.request' },
  { detail: 'role and resource', state: 'allow', step: 'rbac.check' },
  { detail: 'who, what, when', state: 'written', step: 'audit.append' },
  { detail: 'quarterly', state: 'scheduled', step: 'access.review' }
];
const accessRowHeight = 32;
const accessCycle = 7.2;

function AccessPath({ reduced }: { reduced: boolean }): JSX.Element {
  const stops = accessSteps.map((_, index) => `translateY(${index * accessRowHeight}px)`);

  return (
    <div className={`${widePanelClassName} gap-3`}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute top-4 bottom-4 left-[3.5px] w-px bg-zinc-200"
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-[0.875rem] left-0 size-2 rounded-full bg-sky-500 ring-4 ring-sky-500/10"
          {...cycle(
            reduced,
            { transform: [stops[0], stops[0], stops[1], stops[1], stops[2], stops[2], stops[3], stops[3], stops[0]] },
            accessCycle,
            [0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.96, 1]
          )}
        />
        {accessSteps.map(({ detail, state, step }, index) => {
          const lit = 0.16 + index * 0.25;
          return (
            <motion.div
              className="flex h-8 items-center gap-2 pl-6"
              key={step}
              {...cycle(
                reduced,
                { opacity: [0.5, 0.5, 1, 1, 0.5, 0.5] },
                accessCycle,
                [0, lit - 0.06, lit, lit + 0.12, lit + 0.18, 1]
              )}
            >
              <span className={`${monoClassName} w-28 shrink-0 truncate text-zinc-900 sm:w-32`}>
                {step}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">{detail}</span>
              <span
                className={`${monoClassName} hidden shrink-0 rounded-md bg-zinc-50 px-2 py-0.5 text-zinc-600 ring-1 ring-zinc-900/5 sm:inline-block`}
              >
                {state}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className={captionClassName}>
        One request, from the API call to the audit record it leaves behind.
      </p>
    </div>
  );
}

const reviewerAgents = ['security', 'correctness', 'tests', 'conventions'];
const pipelineCycle = 6.8;

function PipelineLink({ delay, reduced }: { delay: number; reduced: boolean }): JSX.Element {
  return (
    <span aria-hidden="true" className="relative mx-auto block h-3 w-px bg-zinc-200">
      <motion.span
        className="absolute -left-[2px] size-[5px] rounded-full bg-sky-500"
        {...cycle(
          reduced,
          {
            opacity: [0, 0, 1, 1, 0, 0],
            transform: ['translateY(-2px)', 'translateY(-2px)', 'translateY(0px)', 'translateY(9px)', 'translateY(11px)', 'translateY(11px)']
          },
          pipelineCycle,
          [0, delay, delay + 0.04, delay + 0.14, delay + 0.18, 1]
        )}
      />
    </span>
  );
}

function PipelineNode({ children, tone }: { children: ReactNode; tone?: 'accent' }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex flex-col items-center rounded-lg px-3 py-1.5 text-center ring-1',
        tone === 'accent'
          ? 'bg-sky-50 text-sky-700 ring-sky-200/70'
          : 'bg-white text-zinc-900 ring-zinc-900/5'
      )}
    >
      {children}
    </span>
  );
}

function ReviewerPipeline({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${widePanelClassName} gap-1`}>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {reviewerAgents.map((agent, index) => (
          <motion.li
            className={`${monoClassName} rounded-lg bg-zinc-50 px-2 py-1 text-center text-zinc-600 ring-1 ring-zinc-900/5`}
            key={agent}
            {...cycle(
              reduced,
              { opacity: [0.45, 1, 1, 0.45] },
              5.2 + index * 0.6,
              [0, 0.25, 0.65, 1],
              { delay: index * 0.28 }
            )}
          >
            {agent}
          </motion.li>
        ))}
      </ul>
      <span aria-hidden="true" className="mx-[12%] mt-2 block border-t border-zinc-200" />
      <PipelineLink delay={0.08} reduced={reduced} />
      <PipelineNode>
        <span className={`${monoClassName} font-medium`}>merger</span>
        <span className="text-[11px] leading-snug text-zinc-500">
          drops findings the cited code contradicts
        </span>
      </PipelineNode>
      <PipelineLink delay={0.34} reduced={reduced} />
      <span className="flex justify-center gap-2">
        <PipelineNode>
          <span className={`${monoClassName} text-zinc-600`}>confidence gate</span>
        </PipelineNode>
        <PipelineNode>
          <span className={`${monoClassName} text-zinc-600`}>security gate</span>
        </PipelineNode>
      </span>
      <PipelineLink delay={0.6} reduced={reduced} />
      <span className="flex justify-center">
        <PipelineNode tone="accent">
          <span className={`${monoClassName} font-medium`}>human approval queue</span>
        </PipelineNode>
      </span>
    </div>
  );
}

const reliabilityFigures = [
  { label: 'transactions a month', value: '2M+' },
  { label: 'user growth, three years', value: '+147%' }
];

function ReliabilityBoard({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-2.5`}>
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
        <span>Flexi Cash lending</span>
        <span className="flex items-center gap-1.5">
          <motion.span
            className="size-1.5 rounded-full bg-emerald-500"
            {...cycle(reduced, { opacity: [0.45, 1, 0.45] }, 3.6, [0, 0.5, 1])}
          />
          in production
        </span>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium text-zinc-600">uptime</span>
          <span className="text-sm font-semibold tabular-nums text-zinc-900">99.98%</span>
        </div>
        <span className="relative block h-1 overflow-hidden rounded-full bg-zinc-100">
          <span className="absolute inset-y-0 left-0 w-[99%] rounded-full bg-emerald-500/70" />
          <motion.span
            className="absolute inset-y-0 w-10 bg-linear-to-r from-transparent via-white/70 to-transparent"
            {...cycle(
              reduced,
              { transform: ['translateX(-2.5rem)', 'translateX(22rem)'] },
              6.4,
              [0, 1],
              { ease: 'linear' }
            )}
          />
        </span>
      </div>
      {reliabilityFigures.map(({ label, value }) => (
        <div className="flex items-baseline justify-between gap-2" key={label}>
          <span className="min-w-0 truncate text-[11px] font-medium text-zinc-600">{label}</span>
          <span className="text-[11px] font-semibold tabular-nums text-zinc-900">{value}</span>
        </div>
      ))}
      <p className={captionClassName}>
        Datadog dashboards and traces other teams took as their template.
      </p>
    </div>
  );
}

const adoptedStandards = [
  { delay: 0, duration: 5.6, id: 'workflow', label: 'git workflow · 5+ teams' },
  { delay: 0.9, duration: 6.8, id: 'package', label: 'shared package · 4 apps' },
  { delay: 1.8, duration: 6.2, id: 'dashboards', label: 'dashboards · team template' }
];
const branchTravel = 24;

function AdoptedStandards({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-3`}>
      <p className="text-sm font-semibold text-zinc-900">One standard, several teams.</p>
      <div className="flex items-stretch">
        <ul className="min-w-0 flex-1">
          {adoptedStandards.map(({ delay, duration, id, label }) => (
            <li className="flex h-7 items-center gap-1.5" key={id}>
              <span className="min-w-0 flex-1 truncate text-right text-[11px] font-medium text-zinc-600">
                {label}
              </span>
              <span aria-hidden="true" className="relative h-px w-6 shrink-0 bg-zinc-200">
                <motion.span
                  className="absolute -top-[2px] -left-[2px] size-[5px] rounded-full bg-sky-500"
                  {...cycle(
                    reduced,
                    {
                      opacity: [0, 1, 1, 0],
                      transform: [
                        'translateX(0px)',
                        'translateX(4px)',
                        `translateX(${branchTravel - 4}px)`,
                        `translateX(${branchTravel}px)`
                      ]
                    },
                    duration,
                    [0, 0.12, 0.44, 0.5],
                    { delay }
                  )}
                />
              </span>
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="relative w-8 shrink-0">
          <span className="absolute top-[14px] bottom-[14px] left-0 w-px bg-zinc-200" />
          <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-zinc-200" />
          <span className="absolute top-1/2 left-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_-8px_--alpha(var(--color-zinc-900)/45%)] ring-1 ring-zinc-900/5">
            <svg className="size-3" fill="none" viewBox="0 0 24 24">
              <path
                className="stroke-zinc-900"
                d="M7 4v7a5 5 0 0 0 5 5h5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <circle className="fill-white stroke-zinc-900" cx="7" cy="19" r="2.4" strokeWidth="1.8" />
              <circle className="fill-white stroke-zinc-900" cx="7" cy="4.4" r="2.4" strokeWidth="1.8" />
              <circle className="fill-zinc-900" cx="18.5" cy="16" r="2.4" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export function CapabilityInstrument({
  className,
  kind,
  size
}: {
  className?: string;
  kind: CapabilityKind;
  size: InstrumentSize;
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
        'relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-900/5',
        className
      )}
      role="img"
    >
      <div
        aria-hidden="true"
        className={cn('w-full', instrumentBoxClassName[size])}
        key={reduced ? 'static' : 'looping'}
      >
        {kind === 'fullstack' ? <AccessPath reduced={reduced} /> : null}
        {kind === 'ai' ? <ReviewerPipeline reduced={reduced} /> : null}
        {kind === 'production' ? <ReliabilityBoard reduced={reduced} /> : null}
        {kind === 'standards' ? <AdoptedStandards reduced={reduced} /> : null}
      </div>
    </div>
  );
}

const stackTiles = [
  { Icon: SiTypescript, drift: 'translateY(-5px)', duration: 4.6, label: 'TypeScript' },
  { Icon: SiReact, drift: 'translateY(-4px)', duration: 5.2, label: 'React' },
  { Icon: SiNextdotjs, drift: 'translateY(3px)', duration: 6.4, label: 'Next.js' },
  { Icon: SiNodedotjs, drift: 'translateY(4px)', duration: 5.8, label: 'Node.js' },
  { Icon: SiGraphql, drift: 'translateY(-3px)', duration: 6.9, label: 'GraphQL' },
  { Icon: SiApachekafka, drift: 'translateY(5px)', duration: 5.5, label: 'Kafka' },
  { Icon: SiRedis, drift: 'translateY(-4px)', duration: 6.1, label: 'Redis' },
  { Icon: SiMongodb, drift: 'translateY(3px)', duration: 4.9, label: 'MongoDB' },
  { Icon: SiPostgresql, drift: 'translateY(-3px)', duration: 5.9, label: 'PostgreSQL' },
  { Icon: SiMysql, drift: 'translateY(4px)', duration: 6.6, label: 'MySQL' },
  { Icon: SiDatadog, drift: 'translateY(-5px)', duration: 5.1, label: 'Datadog' },
  { Icon: FaAws, drift: 'translateY(3px)', duration: 6.3, label: 'AWS' }
];

const stackLabels = stackTiles.map((tile) => tile.label).join(', ');

export function StackGrid({ className }: { className?: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const reduced = useReducedMotion() === true || !isInView;

  return (
    <div className={className} ref={ref}>
      <ul
        aria-label={`Stack: ${stackLabels}`}
        className="grid grid-cols-4 gap-3 md:grid-cols-6 lg:grid-cols-4"
        key={reduced ? 'static' : 'looping'}
      >
        {stackTiles.map(({ Icon, drift, duration, label }, index) => (
          <motion.li
            key={label}
            className={cn(
              'grid aspect-square place-items-center rounded-2xl bg-white text-zinc-700 shadow-[0_10px_24px_-14px_--alpha(var(--color-zinc-900)/40%)] ring-1 ring-zinc-900/5',
              index === 0 && 'text-sky-600'
            )}
            title={label}
            {...cycle(reduced, { transform: ['translateY(0px)', drift, 'translateY(0px)'] }, duration, [0, 0.5, 1], {
              delay: index * 0.29
            })}
          >
            <Icon aria-hidden="true" className="size-[42%]" />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
