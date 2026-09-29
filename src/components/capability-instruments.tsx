import { useEffect, useRef, useState, type ComponentType, type JSX, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
  type Transition
} from 'motion/react';
import { FaAws } from 'react-icons/fa6';
import {
  SiApachekafka,
  SiConfluence,
  SiDatadog,
  SiGoogle,
  SiGraphql,
  SiJira,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiSlack,
  SiTypescript,
  SiZoho
} from 'react-icons/si';
import { cn } from '@/lib/utils';

export type CapabilityKind = 'fullstack' | 'release' | 'production' | 'standards';
export type InstrumentSize = 'small' | 'wide';

// Below md each card stands alone, so the instrument takes its own height; a shared band there
// floats the shorter diagrams in up to 150px of blank window. From md cards share rows, so the
// band is fixed, and a 4:3 box below lg would leave the panel mostly blank.
const instrumentBoxClassName: Record<InstrumentSize, string> = {
  small: 'py-2 md:h-60 md:py-0 lg:aspect-[4/3] lg:h-auto',
  wide: 'py-2 md:h-64 md:py-0 lg:h-[17.5rem]'
};

const instrumentLabels: Record<CapabilityKind, string> = {
  release:
    'Illustration: a release plan where three must-haves fit before Friday, a new request would run two days over, so it moves to the next release and the plan ships on time',
  fullstack:
    'Illustration: an access log where each new change, such as a new hire added to Slack, arrives with who, what, and when, and is marked recorded',
  production:
    'Illustration: a traffic line that dips once on a bad day and recovers, over 99.98% uptime, 2M+ transactions a month, and 147% user growth',
  standards:
    'Illustration: one fix published in a shared package, then each internal app that runs on it updates to the new version until every app is current'
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
const monoClassName = 'font-mono text-[11px]';

// The names are made up; the tools and reasons are the ones the real workflow handles.
const accessEvents: { Icon: ComponentType<{ className?: string }>; change: string; name: string; reason: string; tool: string }[] = [
  { Icon: SiSlack, change: 'Access added', name: 'Rina Aulia', reason: 'New hire', tool: 'Slack' },
  { Icon: SiGoogle, change: 'Access removed', name: 'Budi Santoso', reason: 'Last day', tool: 'Google Workspace' },
  { Icon: SiJira, change: 'Role changed', name: 'Dewi Kartika', reason: 'Moved to Risk', tool: 'Jira' },
  { Icon: SiZoho, change: 'Access added', name: 'Andi Pratama', reason: 'Rehire', tool: 'Zoho' },
  { Icon: SiConfluence, change: 'Access removed', name: 'Sari Wulandari', reason: 'Contract ended', tool: 'Confluence' },
  { Icon: SiSlack, change: 'Access added', name: 'Fajar Nugroho', reason: 'New hire', tool: 'Slack' },
  { Icon: SiGoogle, change: 'Access added', name: 'Maya Lestari', reason: 'New hire', tool: 'Google Workspace' },
  { Icon: SiJira, change: 'Access removed', name: 'Yoga Permana', reason: 'Last day', tool: 'Jira' }
];
const accessRowHeight = 46;
const accessVisibleRows = 5;
const accessArrivalMs = 5200;
const accessRowClassName = 'grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] items-center gap-3 px-4';

function accessTime(sequence: number): string {
  const minutes = 9 * 60 + 2 + (sequence + accessVisibleRows) * 7;
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

// Every few seconds the next change arrives at the top, highlighted until it is recorded, and the
// oldest row drops off the bottom. Sequence numbers key the rows, so each one slides down a slot.
function AccessLog({ reduced }: { reduced: boolean }): JSX.Element {
  const [latest, setLatest] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setLatest((sequence) => sequence + 1), accessArrivalMs);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const rows = Array.from({ length: accessVisibleRows }, (_, slot) => {
    const sequence = latest - slot;
    const event = accessEvents[((sequence % accessEvents.length) + accessEvents.length) % accessEvents.length];
    return { ...event, sequence, slot };
  });

  return (
    <div className="flex h-full flex-col">
      <div className={`${accessRowClassName} h-8 shrink-0 border-b border-zinc-100 text-[10px] font-medium text-zinc-400`}>
        <span>Employee</span>
        <span>Change</span>
        <span className="text-right">Status</span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden" style={{ minHeight: accessRowHeight * 4 }}>
        <AnimatePresence initial={false}>
          {rows.map(({ Icon, change, name, reason, sequence, slot, tool }) => {
            const arriving = sequence > 0;
            return (
              <motion.div
                animate={{ opacity: 1, y: slot * accessRowHeight }}
                className={`${accessRowClassName} absolute inset-x-0 top-0 border-b border-zinc-100`}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0, y: -accessRowHeight }}
                key={sequence}
                style={{ height: accessRowHeight }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {arriving ? (
                  <motion.span
                    animate={{ opacity: 0 }}
                    className="absolute inset-0 bg-sky-50"
                    initial={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 1.4, ease: 'linear' }}
                  />
                ) : null}
                <span className="relative flex min-w-0 items-center gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-zinc-900/10">
                    <Icon className="size-3.5 text-zinc-700" />
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate text-[12px] font-medium text-zinc-900">{name}</span>
                    <span className="truncate text-[11px] text-zinc-500">{tool}</span>
                  </span>
                </span>
                <span className="relative grid min-w-0">
                  <span className="truncate text-[12px] text-zinc-700">{change}</span>
                  <span className="truncate text-[11px] text-zinc-500">{reason}</span>
                </span>
                <span className="relative grid justify-items-end gap-0.5">
                  <span className="grid text-[10px] font-medium">
                    {arriving ? (
                      <motion.span
                        animate={{ opacity: 0 }}
                        className="col-start-1 row-start-1 rounded-full bg-sky-100 px-2 py-0.5 text-sky-700"
                        initial={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.25 }}
                      >
                        <span className="hidden sm:inline">recording</span>
                        <span className="sm:hidden">…</span>
                      </motion.span>
                    ) : null}
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="col-start-1 row-start-1 rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600"
                      initial={{ opacity: arriving ? 0 : 1 }}
                      transition={{ delay: 1.1, duration: 0.25 }}
                    >
                      <span className="hidden sm:inline">recorded </span>✓
                    </motion.span>
                  </span>
                  <span className="text-[10px] tabular-nums text-zinc-400">{accessTime(sequence)}</span>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
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
  align?: 'center' | 'end' | 'start';
  from: ReactNode;
  reduced: boolean;
  times: [number, number, number, number];
  to: ReactNode;
  duration: number;
}): JSX.Element {
  const [inStart, inEnd, outStart, outEnd] = times;
  return (
    <span className={cn('grid', { center: 'justify-items-center', end: 'justify-items-end', start: 'justify-items-start' }[align])}>
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

// A release plan under a deadline. A new request lands on the plan, the team's time runs over, so
// the request slides down into the next release and the must-haves ship on time. Rows have fixed heights,
// so the request card's resting offsets are the rows' own positions.
const releaseCycle = 10;
const releaseRowHeight = 30;
const releaseMustHaves = ['Grant access on hire', 'Remove access on exit', 'Record every change'];
const requestOverRows = 62;
const requestInNextRelease = 208;
const releaseTimes = [0, 0.08, 0.14, 0.42, 0.52, 0.56, 1];
const releaseRowClassName = 'flex items-center justify-between gap-3 border-b border-zinc-100 text-[12px]';
const mustChipClassName = 'rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600';
const laterChipClassName = 'rounded-full px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-900/10';

function ReleasePlan({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className="flex h-full items-center">
      <div className="relative mx-auto h-[248px] w-full max-w-lg px-4 pt-3">
        <div className="flex h-5 items-center justify-between text-[10px] font-medium text-zinc-400">
          <span>Ships Friday</span>
          <Swap
            align="end"
            duration={releaseCycle}
            from={<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">due Fri</span>}
            reduced={reduced}
            times={[0.62, 0.66, 0.93, 0.98]}
            to={<span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">shipped on time ✓</span>}
          />
        </div>
        {releaseMustHaves.map((item) => (
          <div className={releaseRowClassName} key={item} style={{ height: releaseRowHeight }}>
            <span className="truncate text-zinc-900">{item}</span>
            <span className={mustChipClassName}>must-have</span>
          </div>
        ))}

        <div className="grid h-9 content-center gap-1">
          <span className="flex items-center justify-between text-[10px] text-zinc-500">
            <span>team time before Friday</span>
            <Swap
              align="end"
              duration={releaseCycle}
              from={<span>fits</span>}
              reduced={reduced}
              times={[0.15, 0.18, 0.43, 0.47]}
              to={<span className="font-medium text-amber-600">over by 2 days</span>}
            />
          </span>
          <span className="relative block h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <span className="absolute inset-y-0 left-0 w-[78%] rounded-full bg-sky-500" />
            <motion.span
              className="absolute inset-0 rounded-full bg-amber-400"
              style={reduced ? { opacity: 0 } : undefined}
              {...cycle(reduced, { opacity: [0, 0, 1, 1, 0, 0] }, releaseCycle, [0, 0.14, 0.18, 0.42, 0.47, 1])}
            />
          </span>
        </div>

        <div className="flex h-5 items-center text-[10px] font-medium text-zinc-400">Next release</div>
        <div className={releaseRowClassName} style={{ height: releaseRowHeight }}>
          <span className="truncate text-zinc-700">Rehire support</span>
          <span className={laterChipClassName}>next</span>
        </div>
        <motion.div
          className={releaseRowClassName}
          style={{ height: releaseRowHeight }}
          {...cycle(reduced, { opacity: [0, 0, 0, 0, 0, 1, 1] }, releaseCycle, releaseTimes)}
        >
          <span className="truncate text-zinc-700">Bulk import</span>
          <span className={laterChipClassName}>next</span>
        </motion.div>

        <motion.div
          className="absolute inset-x-2 top-0 flex items-center justify-between gap-3 rounded-lg bg-white px-2 text-[12px] shadow-[0_8px_20px_-8px_--alpha(var(--color-zinc-900)/25%)] ring-1 ring-sky-500/40"
          style={{ height: releaseRowHeight, ...(reduced ? { opacity: 0 } : {}) }}
          {...cycle(
            reduced,
            {
              opacity: [0, 0, 1, 1, 1, 0, 0],
              transform: [
                `translate(24px, ${requestOverRows}px)`,
                `translate(24px, ${requestOverRows}px)`,
                `translate(0px, ${requestOverRows}px)`,
                `translate(0px, ${requestOverRows}px)`,
                `translate(0px, ${requestInNextRelease}px)`,
                `translate(0px, ${requestInNextRelease}px)`,
                `translate(0px, ${requestInNextRelease}px)`
              ]
            },
            releaseCycle,
            releaseTimes
          )}
        >
          <span className="truncate font-medium text-zinc-900">Bulk import</span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">new request</span>
        </motion.div>
      </div>
    </div>
  );
}

// One traffic line that dips once and recovers. The shape is illustrative; the figures under it
// are the real ones. The marker sits on the dip, so its position is the path's own coordinates.
const trafficLine = 'M0 84 C 36 80, 64 72, 96 62 S 150 46, 182 42 L 196 58 L 210 36 S 252 22, 280 14';
const trafficArea = `${trafficLine} L 280 96 L 0 96 Z`;
const dip = { x: 196 / 280, y: 58 / 96 };
const trafficCycle = 8.2;
const reliabilityFigures = [
  { label: 'uptime', value: '99.98%' },
  { label: 'transactions a month', value: '2M+' },
  { label: 'users, three years', value: '+147%' }
];

function ReliabilityBoard({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-4`}>
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
        <span>Flexi Cash lending</span>
        <span>Jenius, 2019 to 2022</span>
      </div>

      <div className="relative aspect-[280/96]">
        <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" fill="none" viewBox="0 0 280 96">
          {[24, 48, 72].map((y) => (
            <line className="stroke-zinc-100" key={y} x1="0" x2="280" y1={y} y2={y} />
          ))}
          <motion.path
            className="fill-sky-500/10"
            d={trafficArea}
            {...cycle(reduced, { opacity: [0, 0, 1, 1, 0] }, trafficCycle, [0, 0.2, 0.5, 0.92, 1])}
          />
          <motion.path
            className="stroke-sky-500"
            d={trafficLine}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            {...cycle(
              reduced,
              { opacity: [1, 1, 1, 0], pathLength: [0, 1, 1, 1] },
              trafficCycle,
              [0, 0.45, 0.92, 1]
            )}
          />
        </svg>
        <motion.span
          className="absolute grid -translate-x-1/2 justify-items-center gap-1.5"
          style={{ left: `${dip.x * 100}%`, top: `calc(${dip.y * 100}% - 4px)` }}
          {...cycle(reduced, { opacity: [0, 0, 1, 1, 0] }, trafficCycle, [0, 0.33, 0.38, 0.92, 1])}
        >
          <span className="size-2 rounded-full bg-white ring-2 ring-zinc-900" />
          <span className="whitespace-nowrap text-[10px] text-zinc-500">bad day, recovered</span>
        </motion.span>
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-3">
        {reliabilityFigures.map(({ label, value }) => (
          <div className="grid gap-0.5" key={label}>
            <dt className="order-last text-[10px] leading-snug text-zinc-500">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums text-zinc-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// One fix lands in the shared package, and each app that runs on it picks up the new version in
// turn until the whole list is current. App names are illustrative.
const rolloutCycle = 9.6;
const rolloutFirstApp = 0.2;
const rolloutAppGap = 0.1;
const rolloutApps = ['hr-tools', 'admin-console', 'ops-dashboard', 'reports'];
const rolloutDone = rolloutFirstApp + rolloutAppGap * (rolloutApps.length - 1) + 0.04;

function SharedRollout({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div className={`${panelClassName} gap-2.5`}>
      <div className="grid gap-1 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-900/5">
        <span className="flex items-center justify-between gap-2">
          <span className={`${monoClassName} font-medium text-zinc-900`}>@shared/core</span>
          <Swap
            align="end"
            duration={rolloutCycle}
            from={<span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-900/5">v2.3</span>}
            reduced={reduced}
            times={[0.08, 0.12, 0.93, 0.98]}
            to={<span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">v2.4 published</span>}
          />
        </span>
        <span className="truncate text-[11px] text-zinc-500">fix: add a request id to every log line</span>
      </div>

      <ul className="grid">
        {rolloutApps.map((name, index) => {
          const at = rolloutFirstApp + rolloutAppGap * index;
          return (
            <li className="relative flex h-7 items-center gap-2 border-b border-zinc-100 px-1 last:border-b-0" key={name}>
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-emerald-50"
                style={reduced ? { opacity: 0 } : undefined}
                {...cycle(reduced, { opacity: [0, 0, 1, 0, 0] }, rolloutCycle, [0, at, at + 0.03, at + 0.16, 1])}
              />
              <span className={`relative grid size-5 shrink-0 place-items-center rounded-md bg-white text-[10px] font-semibold text-zinc-600 uppercase ring-1 ring-zinc-900/10`}>
                {name[0]}
              </span>
              <span className={`${monoClassName} relative min-w-0 flex-1 truncate text-zinc-700`}>{name}</span>
              <span className="relative text-[10px] font-medium tabular-nums">
                <Swap
                  align="end"
                  duration={rolloutCycle}
                  from={<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-500">2.3</span>}
                  reduced={reduced}
                  times={[at, at + 0.03, 0.93, 0.98]}
                  to={<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">2.4 ✓</span>}
                />
              </span>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-1">
        <span className="relative block h-1 overflow-hidden rounded-full bg-zinc-100">
          <motion.span
            className="absolute inset-0 origin-left rounded-full bg-emerald-400"
            style={reduced ? { transform: 'scaleX(1)' } : undefined}
            {...cycle(
              reduced,
              { transform: ['scaleX(0)', 'scaleX(0)', `scaleX(1)`, 'scaleX(1)', 'scaleX(0)'] },
              rolloutCycle,
              [0, rolloutFirstApp - 0.02, rolloutDone, 0.93, 0.98]
            )}
          />
        </span>
        <span className="text-[10px] text-zinc-500">
          <Swap
            align="start"
            duration={rolloutCycle}
            from={<span>rolling out</span>}
            reduced={reduced}
            times={[rolloutDone, rolloutDone + 0.03, 0.93, 0.98]}
            to={<span className="font-medium text-emerald-700">fixed once, every app current</span>}
          />
        </span>
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
        {kind === 'fullstack' ? <AccessLog reduced={reduced} /> : null}
        {kind === 'release' ? <ReleasePlan reduced={reduced} /> : null}
        {kind === 'production' ? <ReliabilityBoard reduced={reduced} /> : null}
        {kind === 'standards' ? <SharedRollout reduced={reduced} /> : null}
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
            className="grid aspect-square place-items-center rounded-2xl bg-white text-zinc-700 shadow-xs ring-1 ring-zinc-900/5"
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
