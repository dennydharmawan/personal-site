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

export type CapabilityKind = 'fullstack' | 'migration' | 'production' | 'standards';
export type InstrumentSize = 'small' | 'wide';

// Below md each card stands alone, so the instrument takes its own height; a shared band there
// floats the shorter diagrams in up to 150px of blank window. From md cards share rows, so the
// band is fixed, and a 4:3 box below lg would leave the panel mostly blank.
const instrumentBoxClassName: Record<InstrumentSize, string> = {
  small: 'py-2 md:h-60 md:py-0 lg:aspect-[4/3] lg:h-auto',
  wide: 'py-2 md:h-64 md:py-0 lg:h-[17.5rem]'
};

const instrumentLabels: Record<CapabilityKind, string> = {
  migration:
    'Illustration: an audit log moving from MongoDB to DocumentDB in five stages, backfill, verify, reads, writes, and retire, with rows checked before reads switch',
  fullstack:
    'Illustration: an access request moving through a role check, an audit record, and a quarterly access review',
  production:
    'Illustration: a status strip of daily uptime with one bad day, monthly transactions, and a rising user-growth line',
  standards: 'Illustration: a shared package for auth, logging, and flags fanning out to four apps, and dashboards that became the company monitoring template'
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

// lit is the point in the cycle where the runner dot reaches that row.
const accessSteps = [
  { detail: 'from an HR event', lit: 0.03, state: 'queued', step: 'access.request' },
  { detail: 'role and resource', lit: 0.22, state: 'allow', step: 'access.check' },
  { detail: 'who, what, when', lit: 0.47, state: 'written', step: 'audit.append' },
  { detail: 'quarterly', lit: 0.72, state: 'scheduled', step: 'access.review' }
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
        {accessSteps.map(({ detail, lit, state, step }) => (
          <motion.div
            className="flex h-8 items-center gap-2 pl-6"
            key={step}
            {...cycle(
              reduced,
              { opacity: [0.7, 0.7, 1, 1, 0.7, 0.7] },
              accessCycle,
              [0, Math.max(lit - 0.03, 0), lit, lit + 0.13, lit + 0.17, 1]
            )}
          >
            <span className={`${monoClassName} w-28 shrink-0 truncate text-zinc-900 sm:w-32`}>
              {step}
            </span>
            <span className="hidden min-w-0 flex-1 truncate text-[11px] text-zinc-500 min-[380px]:block">{detail}</span>
            <span
              className={`${monoClassName} hidden shrink-0 rounded-md bg-zinc-50 px-2 py-0.5 text-zinc-600 ring-1 ring-zinc-900/5 sm:inline-block`}
            >
              {state}
            </span>
          </motion.div>
        ))}
      </div>
      <p className={captionClassName}>
        One access request, end to end.
      </p>
    </div>
  );
}

// Two labels in one grid cell, crossfading on the parent loop. Under reduced motion only the
// settled label shows, so the still frame tells the end of the story.
function Swap({
  align = 'center',
  from,
  reduced,
  times,
  to,
  duration
}: {
  align?: 'center' | 'end';
  from: ReactNode;
  reduced: boolean;
  times: [number, number, number, number];
  to: ReactNode;
  duration: number;
}): JSX.Element {
  const [inStart, inEnd, outStart, outEnd] = times;
  return (
    <span className={cn('grid', align === 'end' ? 'justify-items-end' : 'justify-items-center')}>
      {reduced ? null : (
        <motion.span
          className="[grid-area:1/1]"
          {...cycle(reduced, { opacity: [1, 1, 0, 0, 1, 1] }, duration, [0, inStart, inEnd, outStart, outEnd, 1])}
        >
          {from}
        </motion.span>
      )}
      <motion.span
        className="[grid-area:1/1]"
        {...cycle(reduced, { opacity: [0, 0, 1, 1, 0, 0] }, duration, [0, inStart, inEnd, outStart, outEnd, 1])}
      >
        {to}
      </motion.span>
    </span>
  );
}

// The audit-log move: each stage lands before the next starts. The dot rests on a stage while
// it runs, verify resolves from comparing to a match, and reads shift store once verified.
const migrationStages = ['backfill', 'verify', 'reads', 'writes', 'retire'];
const migrationCycle = 8.4;
const stageAt = [0.04, 0.2, 0.42, 0.6, 0.76];
const stageHold = 0.12;

function MigrationPath({ reduced }: { reduced: boolean }): JSX.Element {
  const last = migrationStages.length - 1;
  const stops = migrationStages.map((_, index) => `${(index / last) * 100}%`);
  const runnerFrames: string[] = [];
  const runnerTimes: number[] = [];
  stageAt.forEach((at, index) => {
    runnerFrames.push(stops[index], stops[index]);
    runnerTimes.push(at, Math.min(at + stageHold, 0.97));
  });

  return (
    <div className={`${widePanelClassName} gap-4`}>
      <div className="relative mx-6 h-9">
        <span aria-hidden="true" className="absolute inset-x-0 top-[5px] h-px bg-zinc-200" />
        <ol>
          {migrationStages.map((stage, index) => (
            <li
              className="absolute top-0 grid -translate-x-1/2 justify-items-center gap-2"
              key={stage}
              style={{ left: stops[index] }}
            >
              <span className="size-[11px] rounded-full bg-white ring-1 ring-zinc-300" />
              <span className={`${monoClassName} whitespace-nowrap text-zinc-600`}>{stage}</span>
            </li>
          ))}
        </ol>
        <motion.span
          aria-hidden="true"
          className="absolute top-0 -ml-[5.5px] size-[11px] rounded-full bg-sky-500 ring-4 ring-sky-500/10"
          style={reduced ? { left: stops[last] } : undefined}
          {...cycle(
            reduced,
            { left: [stops[0], ...runnerFrames, stops[last], stops[0]] },
            migrationCycle,
            [0, ...runnerTimes, 0.97, 1]
          )}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-900/5">
        <span className={`${monoClassName} text-zinc-500`}>audit log</span>
        <span className={monoClassName}>
          <Swap
            align="end"
            duration={migrationCycle}
            from={
              <span className="inline-flex items-center gap-1.5 text-zinc-500">
                <motion.span
                  aria-hidden="true"
                  className="size-2.5 rounded-full border-[1.5px] border-zinc-300 border-t-zinc-600"
                  {...cycle(reduced, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, 0.9, [0, 1], { ease: 'linear' })}
                />
                comparing rows
              </span>
            }
            reduced={reduced}
            times={[0.3, 0.34, 0.93, 0.98]}
            to={<span className="text-emerald-600">rows match ✓</span>}
          />
        </span>
      </div>

      <div className="grid gap-1.5">
        <span className="relative block h-1.5 overflow-hidden rounded-full bg-zinc-200">
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-sky-500"
            style={reduced ? { transform: 'scaleX(1)' } : undefined}
            {...cycle(
              reduced,
              { transform: ['scaleX(0)', 'scaleX(0)', 'scaleX(1)', 'scaleX(1)', 'scaleX(0)'] },
              migrationCycle,
              [0, stageAt[2], stageAt[2] + stageHold, 0.95, 1]
            )}
          />
        </span>
        <span className="flex justify-between text-[10px] text-zinc-500">
          <span>MongoDB</span>
          <span>reads move to DocumentDB</span>
        </span>
      </div>
    </div>
  );
}

// A status-page strip: one bar a day, one bad day in amber. The day is illustrative; the
// uptime figure beside it is the real one.
const uptimeDays = 42;
const badDay = 29;
const growthPath = 'M1 15 C 10 14, 16 12, 24 10 S 40 6, 47 4 S 58 2, 63 1';

function ReliabilityBoard({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-3`}>
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
        <span>Flexi Cash lending</span>
        <span>Jenius, 2019 to 2022</span>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-medium text-zinc-600">uptime</span>
          <span className="text-sm font-semibold tabular-nums text-zinc-900">99.98%</span>
        </div>
        <span className="relative flex h-5 gap-[2px] overflow-hidden">
          {Array.from({ length: uptimeDays }, (_, day) => (
            <span
              className={cn(
                'min-w-0 flex-1 rounded-[1px]',
                day === badDay ? 'bg-amber-400' : 'bg-emerald-500/70'
              )}
              key={day}
            />
          ))}
          <motion.span
            className="absolute inset-y-0 w-10 bg-linear-to-r from-transparent via-white/60 to-transparent"
            {...cycle(
              reduced,
              { transform: ['translateX(-2.5rem)', 'translateX(22rem)'] },
              6.4,
              [0, 1],
              { ease: 'linear' }
            )}
          />
        </span>
        <span className="flex justify-between text-[10px] text-zinc-400">
          <span>one bad day, recovered</span>
          <span>today</span>
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] font-medium text-zinc-600">transactions a month</span>
        <span className="text-[11px] font-semibold tabular-nums text-zinc-900">2M+</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] font-medium text-zinc-600">user growth, three years</span>
        <span className="flex items-center gap-2">
          <svg aria-hidden="true" className="h-4 w-16 overflow-visible" fill="none" viewBox="0 0 64 16">
            <motion.path
              className="stroke-sky-500"
              d={growthPath}
              strokeLinecap="round"
              strokeWidth="1.5"
              {...cycle(reduced, { pathLength: [0, 1, 1, 0] }, 7.4, [0, 0.35, 0.9, 1], { delay: 0.6 })}
            />
          </svg>
          <span className="text-[11px] font-semibold tabular-nums text-zinc-900">+147%</span>
        </span>
      </div>
    </div>
  );
}

// The package fans out to the four apps that run on it. Each app lights when the dot reaches
// it, on its own duration and delay so the four never land together.
const adoptingApps = [
  { delay: 0, duration: 5.4 },
  { delay: 0.7, duration: 6.1 },
  { delay: 1.4, duration: 5.8 },
  { delay: 2.1, duration: 6.5 }
];
const fanTravel = 28;

function AdoptedStandards({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-3`}>
      <p className="text-sm font-semibold text-zinc-900">Built once, adopted across teams.</p>
      <div className="flex items-center">
        <span className="grid shrink-0 gap-0.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 ring-1 ring-zinc-900/5">
          <span className={`${monoClassName} font-medium text-zinc-900`}>shared package</span>
          <span className="text-[10px] text-zinc-500">auth · logging · flags</span>
        </span>
        <span aria-hidden="true" className="h-px w-2 shrink-0 bg-zinc-200" />
        <div className="relative grid flex-1 gap-1">
          <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 left-0 w-px bg-zinc-200" />
          {adoptingApps.map(({ delay, duration }, index) => (
            <div className="flex h-5 items-center" key={delay}>
              <span aria-hidden="true" className="relative h-px shrink-0 bg-zinc-200" style={{ width: fanTravel }}>
                <motion.span
                  className="absolute -top-[2px] -left-[2px] size-[5px] rounded-full bg-sky-500"
                  {...cycle(
                    reduced,
                    {
                      opacity: [0, 1, 1, 0, 0],
                      transform: ['translateX(0px)', 'translateX(4px)', `translateX(${fanTravel - 4}px)`, `translateX(${fanTravel}px)`, `translateX(${fanTravel}px)`]
                    },
                    duration,
                    [0, 0.06, 0.2, 0.24, 1],
                    { delay }
                  )}
                />
              </span>
              <motion.span
                className={`${monoClassName} inline-flex items-center gap-1 rounded-md px-1.5 py-px text-zinc-600 ring-1 ring-zinc-900/5`}
                {...cycle(
                  reduced,
                  { backgroundColor: ['var(--color-white)', 'var(--color-white)', 'var(--color-sky-50)', 'var(--color-sky-50)', 'var(--color-white)'] },
                  duration,
                  [0, 0.22, 0.28, 0.7, 0.85],
                  { delay }
                )}
              >
                <span className="size-1.5 rounded-full bg-sky-500" />
                app {index + 1}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-zinc-500">
        dashboards <span className="text-zinc-400">→</span> company monitoring template
      </p>
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
        {kind === 'migration' ? <MigrationPath reduced={reduced} /> : null}
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
            className="grid aspect-square place-items-center rounded-2xl bg-white text-zinc-700 shadow-[0_10px_24px_-14px_--alpha(var(--color-zinc-900)/40%)] ring-1 ring-zinc-900/5"
            {...cycle(reduced, { transform: ['translateY(0px)', drift, 'translateY(0px)'] }, duration, [0, 0.5, 1], {
              delay: index * 0.29
            })}
          >
            <span className="grid justify-items-center gap-1.5">
              <Icon aria-hidden="true" className="size-7" />
              <span className="text-[10px] leading-none font-medium text-zinc-600">{label}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
