import { useEffect, useId, useRef, useState, type JSX, type ReactNode, type RefObject } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Easing,
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
  SiTypescript
} from 'react-icons/si';
import { cn } from '@/lib/utils';

export type CapabilityKind = 'fullstack' | 'release' | 'production' | 'standards';
export type InstrumentSize = 'small' | 'wide';

const bodyClassName: Record<InstrumentSize, string> = {
  small: 'h-[252px]',
  wide: 'h-[280px]'
};

const instrumentLabels: Record<CapabilityKind, string> = {
  fullstack:
    'Illustration: access changes from Slack, Google, Jira, and Confluence flow into one access log, where each arrives with who, what, and when and is marked recorded',
  production:
    'Illustration: a traffic line that dips once on a bad day and recovers, over 99.98% uptime, 2M+ transactions a month, and 147% user growth',
  release:
    'Illustration: a release plan for the week where planned work fills in up to Friday, a late request that would run past the ship date moves to the next release, and the release ships on time',
  standards: 'Illustration: a shared package for auth, logging, and flags fanning out to internal apps, and dashboards that became the company monitoring template'
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
  options: { delay?: number; ease?: Easing } = {}
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

type Beat<Name extends string> = { readonly ms: number; readonly name: Name };

// Story loops step through a beat table: one timeout per beat, wrapping to the first beat with
// the next episode. Inactive, it holds the still beat and schedules nothing.
function useEpisode<Name extends string>(
  beats: readonly Beat<Name>[],
  still: NoInfer<Name>,
  active: boolean
): { beat: Name; episode: number } {
  const [step, setStep] = useState({ episode: 0, index: 0 });

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      setStep(({ episode, index }) =>
        index + 1 < beats.length ? { episode, index: index + 1 } : { episode: episode + 1, index: 0 }
      );
    }, beats[step.index].ms);
    return () => window.clearTimeout(timer);
  }, [active, beats, step]);

  return active ? { beat: beats[step.index].name, episode: step.episode } : { beat: still, episode: 0 };
}

type StatusTone = 'idle' | 'active' | 'warn' | 'done';
type Status = { text: string; tone: StatusTone };

const statusToneClassName: Record<StatusTone, { dot: string; text: string }> = {
  active: { dot: 'bg-sky-400', text: 'text-sky-700' },
  done: { dot: 'bg-emerald-300', text: 'text-emerald-700' },
  idle: { dot: 'bg-zinc-300', text: 'text-zinc-400' },
  warn: { dot: 'bg-rose-300', text: 'text-rose-700' }
};

type Tone = 'sky' | 'violet' | 'rose' | 'amber' | 'emerald';

const toneClassName: Record<Tone, { fill: string; soft: string; text: string }> = {
  amber: { fill: 'bg-amber-200', soft: 'bg-amber-100', text: 'text-amber-700' },
  emerald: { fill: 'bg-emerald-200', soft: 'bg-emerald-100', text: 'text-emerald-700' },
  rose: { fill: 'bg-rose-200', soft: 'bg-rose-100', text: 'text-rose-700' },
  sky: { fill: 'bg-sky-200', soft: 'bg-sky-100', text: 'text-sky-700' },
  violet: { fill: 'bg-violet-200', soft: 'bg-violet-100', text: 'text-violet-700' }
};

// Layered depth: offsets and blur double per layer while the alpha climbs one point.
const liftClassName =
  'shadow-[0_0_0_1px_--alpha(var(--color-zinc-900)/6%),0_1px_3px_--alpha(var(--color-black)/3%),0_4px_8px_-2px_--alpha(var(--color-black)/4%),0_12px_24px_-8px_--alpha(var(--color-black)/6%),0_28px_56px_-20px_--alpha(var(--color-black)/8%)]';

function StatusBar({ label, status, still }: { label: string; status: Status; still: boolean }): JSX.Element {
  const tone = statusToneClassName[status.tone];
  return (
    <div className="flex h-10 items-center justify-between gap-3 border-b border-zinc-100 px-4">
      <span className="text-[12px] font-medium whitespace-nowrap text-zinc-500">{label}</span>
      <motion.span
        animate={{ opacity: 1, y: 0 }}
        className={cn('inline-flex items-center gap-[7px] text-[11.5px] font-medium whitespace-nowrap', tone.text)}
        initial={still ? false : { opacity: 0, y: 3 }}
        key={`${status.tone}:${status.text}`}
        transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className={cn('relative size-1.5 rounded-full', tone.dot)}>
          {status.tone === 'active' ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-sky-400/25"
              {...cycle(still, { scale: [1, 2.3, 1] }, 1.2, [0, 0.5, 1])}
            />
          ) : null}
        </span>
        {status.text}
      </motion.span>
    </div>
  );
}

type Frame = { bodyClassName: string; label: string; still: boolean };

function Screen({ children, frame, status }: { children: ReactNode; frame: Frame; status: Status }): JSX.Element {
  return (
    <>
      <StatusBar label={frame.label} status={status} still={frame.still} />
      <div className={cn('relative overflow-hidden', frame.bodyClassName)}>{children}</div>
    </>
  );
}

const pillClassName = 'inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] font-medium whitespace-nowrap';
const mintClassName = `${toneClassName.emerald.soft} ${toneClassName.emerald.text}`;

type Measured<T> = T & { height: number; width: number };

// Measures the illustration in its own pixel space and remeasures whenever it resizes, so wires
// drawn from the result line up with the elements they join.
function useMeasured<T>(
  read: (root: HTMLElement, box: DOMRect) => T
): [RefObject<HTMLDivElement | null>, Measured<T> | null] {
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<Measured<T> | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const observer = new ResizeObserver(() => {
      const box = root.getBoundingClientRect();
      if (box.width) setMeasured({ ...read(root, box), height: box.height, width: box.width });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [read]);

  return [ref, measured];
}

function curve(ax: number, ay: number, bx: number, by: number, horizontal: boolean): string {
  if (horizontal) {
    const mx = (ax + bx) / 2;
    return `M${ax} ${ay} C${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
  }
  const my = (ay + by) / 2;
  return `M${ax} ${ay} C${ax} ${my} ${bx} ${my} ${bx} ${by}`;
}

function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
}

// One trip along a wire. It mounts per trip, so keying it by episode replays it. Progress runs
// linearly and the position eases, so the fade near the end keys off elapsed time.
function Pulse({ d, delay = 0, duration }: { d: string; delay?: number; duration: number }): JSX.Element {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);
  const pointAt = (p: number): { x: number; y: number } => {
    const path = pathRef.current;
    return path ? path.getPointAtLength(path.getTotalLength() * easeInOutCubic(p)) : { x: 0, y: 0 };
  };
  const cx = useTransform(progress, (p) => pointAt(p).x);
  const cy = useTransform(progress, (p) => pointAt(p).y);
  const opacity = useTransform(progress, [0, 0.001, 0.88, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const controls = animate(progress, 1, { delay, duration, ease: 'linear' });
    return () => controls.stop();
  }, [delay, duration, progress]);

  return (
    <>
      <path d={d} ref={pathRef} stroke="none" />
      <motion.circle
        className="fill-sky-400 drop-shadow-[0_0_4px_--alpha(var(--color-sky-400)/60%)]"
        cx={cx}
        cy={cy}
        r={3.5}
        style={{ opacity }}
      />
    </>
  );
}

const panelClassName = 'flex h-full flex-col justify-center p-4';
const captionClassName = 'text-[11px] leading-snug text-zinc-500 text-pretty';
const monoClassName = 'font-mono text-[11px]';

const accessSources = [
  { Icon: SiSlack, name: 'Slack' },
  { Icon: SiGoogle, name: 'Google' },
  { Icon: SiJira, name: 'Jira' },
  { Icon: SiConfluence, name: 'Confluence' }
];

// The names are made up; the tools are the ones the real workflow handles.
const accessEvents: readonly { action: string; initials: string; name: string; source: number; tone: Tone }[] = [
  { action: 'Added to Slack', initials: 'RA', name: 'Rina Aulia', source: 0, tone: 'sky' },
  { action: 'Moved to Risk in Jira', initials: 'DK', name: 'Dewi Kartika', source: 2, tone: 'violet' },
  { action: 'Removed from Google', initials: 'BS', name: 'Budi Santoso', source: 1, tone: 'rose' },
  { action: 'Added to Confluence', initials: 'AP', name: 'Andi Pratama', source: 3, tone: 'amber' },
  { action: 'Added to Slack', initials: 'FN', name: 'Fajar Nugroho', source: 0, tone: 'emerald' },
  { action: 'Added to Google', initials: 'ML', name: 'Maya Lestari', source: 1, tone: 'sky' },
  { action: 'Removed from Jira', initials: 'YP', name: 'Yoga Permana', source: 2, tone: 'violet' }
];
const accessRowHeight = 48;
const accessVisibleRows = 4;
const accessPortDrop = 90;

// The rest comes first, so the first live frame matches the still one.
const accessBeats = [
  { ms: 2700, name: 'recorded' },
  { ms: 900, name: 'travel' }
] as const;
type AccessBeat = (typeof accessBeats)[number]['name'];

const accessStatus: Record<AccessBeat, Status> = {
  recorded: { text: 'recorded ✓', tone: 'done' },
  travel: { text: 'recording', tone: 'active' }
};

function accessTime(sequence: number): string {
  const minutes = (9 * 60 + 2 + sequence * 6) % (24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function measureAccess(root: HTMLElement, box: DOMRect): { port: { x: number; y: number }; wires: string[] } {
  const log = root.querySelector('[data-log]')!.getBoundingClientRect();
  const port = { x: log.left - box.left, y: log.top - box.top + accessPortDrop };
  const wires = Array.from(root.querySelectorAll('[data-source]'), (tile) => {
    const rect = tile.getBoundingClientRect();
    return curve(rect.right - box.left, rect.top + rect.height / 2 - box.top, port.x, port.y, true);
  });
  return { port, wires };
}

// Each change leaves its tool as a pulse, lands on the log's port, and slides in as the newest
// row while the oldest drops off. Sequence numbers key the rows, so each one slides down a slot.
function AccessLog({ frame }: { frame: Frame }): JSX.Element {
  const { beat, episode } = useEpisode(accessBeats, 'recorded', !frame.still);
  const [ref, layout] = useMeasured(measureAccess);
  const latest = accessVisibleRows - 1 + episode;
  const source = accessEvents[(latest + 1) % accessEvents.length].source;
  const traveling = beat === 'travel';
  const arrived = beat === 'recorded' && episode > 0;
  const rows = Array.from({ length: accessVisibleRows }, (_, slot) => ({ sequence: latest - slot, slot }));

  return (
    <Screen frame={frame} status={accessStatus[beat]}>
      <div className="absolute inset-0" ref={ref}>
        {layout ? (
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            fill="none"
            viewBox={`0 0 ${layout.width} ${layout.height}`}
          >
            {layout.wires.map((d) => (
              <path className="stroke-zinc-200" d={d} key={d} strokeWidth={1.25} />
            ))}
            <AnimatePresence>
              {traveling ? (
                <motion.path
                  animate={{ opacity: 1 }}
                  className="stroke-sky-300"
                  d={layout.wires[source]}
                  exit={{ opacity: 0, transition: { duration: 0.6 } }}
                  initial={{ opacity: 0 }}
                  key={episode}
                  strokeWidth={1.25}
                  transition={{ duration: 0.15 }}
                />
              ) : null}
            </AnimatePresence>
            {traveling ? <Pulse d={layout.wires[source]} duration={0.9} key={episode} /> : null}
            {arrived ? (
              <motion.circle
                animate={{ opacity: 0, scale: 2.6 }}
                className="origin-center stroke-sky-300 [transform-box:fill-box]"
                cx={layout.port.x}
                cy={layout.port.y}
                initial={{ opacity: 0.9, scale: 1 }}
                key={`ring-${episode}`}
                r={4.5}
                strokeWidth={1.25}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
              />
            ) : null}
            <circle className="fill-white stroke-zinc-300" cx={layout.port.x} cy={layout.port.y} r={4.5} strokeWidth={1.25} />
            {arrived ? (
              <motion.circle
                animate={{ opacity: 0 }}
                className="stroke-sky-400"
                cx={layout.port.x}
                cy={layout.port.y}
                initial={{ opacity: 1 }}
                key={`hit-${episode}`}
                r={4.5}
                strokeWidth={1.25}
                transition={{ delay: 0.12, duration: 0.5 }}
              />
            ) : null}
          </svg>
        ) : null}

        <div className="absolute inset-y-0 left-[22px] z-[1] grid content-center gap-[18px]">
          {accessSources.map(({ Icon, name }, index) => (
            <span
              className={cn('relative grid size-10 place-items-center rounded-xl bg-white text-zinc-700', liftClassName)}
              data-source={name}
              key={name}
            >
              {traveling && index === source ? (
                <motion.span
                  animate={{ opacity: [0, 1, 1, 0] }}
                  className="absolute inset-0 rounded-xl ring-4 ring-sky-200/80"
                  initial={{ opacity: 0 }}
                  key={episode}
                  transition={{ duration: 0.9, times: [0, 0.44, 0.56, 1] }}
                />
              ) : null}
              <Icon className="relative" size={17} />
            </span>
          ))}
        </div>

        <div
          className={cn(
            'absolute top-[22px] -bottom-px left-[34%] z-[1] flex w-[min(300px,58%)] flex-col rounded-t-[14px] bg-white',
            liftClassName
          )}
          data-log
        >
          <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-zinc-100 px-3.5 text-[13px] font-semibold text-zinc-900">
            Access log
            <span className={cn(pillClassName, mintClassName)}>every change</span>
          </div>
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(black_65%,transparent)]">
            <AnimatePresence initial={false}>
              {rows.map(({ sequence, slot }) => {
                const { action, initials, name, tone } = accessEvents[sequence % accessEvents.length];
                const fresh = sequence >= accessVisibleRows;
                return (
                  <motion.div
                    animate={{ opacity: 1, y: slot * accessRowHeight }}
                    className="absolute inset-x-0 top-0 flex items-center gap-2.5 px-3.5"
                    exit={{ opacity: 0, y: accessVisibleRows * accessRowHeight }}
                    initial={{ opacity: 0, y: -accessRowHeight }}
                    key={sequence}
                    style={{ height: accessRowHeight }}
                    transition={{ opacity: { duration: 0.45 }, y: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    {fresh ? (
                      <motion.span
                        animate={{ opacity: 0 }}
                        className="absolute inset-x-2 inset-y-1 rounded-[10px] bg-sky-50"
                        initial={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1.6, ease: 'linear' }}
                      />
                    ) : null}
                    <motion.span
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'relative grid size-7 shrink-0 place-items-center rounded-full text-[10.5px] font-semibold text-zinc-700',
                        toneClassName[tone].soft
                      )}
                      initial={fresh ? { opacity: 0, scale: 0.5 } : false}
                      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      {initials}
                    </motion.span>
                    <span className="relative grid min-w-0 flex-1">
                      <span className="truncate text-[12.5px] font-medium text-zinc-900">{name}</span>
                      <span className="truncate text-[11.5px] text-zinc-500">{action}</span>
                    </span>
                    <span className="relative text-[11px] text-zinc-400 tabular-nums">{accessTime(sequence)}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Screen>
  );
}

type Span = { from: number; title: string; to: number };

// Each release plans three items and gets one late request. Positions are percent of the week.
const releases: readonly { next: string; request: Span; work: readonly (Span & { tone: Tone })[] }[] = [
  {
    next: 'Rehire',
    request: { from: 50, title: 'Bulk import', to: 95 },
    work: [
      { from: 0, title: 'Access on hire', to: 30, tone: 'sky' },
      { from: 16, title: 'Access on exit', to: 48, tone: 'violet' },
      { from: 38, title: 'Audit trail', to: 72, tone: 'amber' }
    ]
  },
  {
    next: 'Audit export',
    request: { from: 46, title: 'Contractors', to: 93 },
    work: [
      { from: 0, title: 'Bulk import', to: 28, tone: 'sky' },
      { from: 14, title: 'Rehire', to: 44, tone: 'violet' },
      { from: 34, title: 'Access reviews', to: 71, tone: 'amber' }
    ]
  },
  {
    next: 'Vendors',
    request: { from: 52, title: 'Offboarding', to: 95 },
    work: [
      { from: 0, title: 'Contractors', to: 32, tone: 'sky' },
      { from: 18, title: 'Audit export', to: 50, tone: 'violet' },
      { from: 40, title: 'Approvals', to: 73, tone: 'amber' }
    ]
  }
];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const shipAt = 76;
const laneHeight = 30;
const laneTop = 30;

const releaseBeats = [
  { ms: 1700, name: 'plan' },
  { ms: 1600, name: 'request' },
  { ms: 1100, name: 'defer' },
  { ms: 2800, name: 'shipped' },
  { ms: 450, name: 'next' }
] as const;
type ReleaseBeat = (typeof releaseBeats)[number]['name'];

// The today line walks to the ship line across the first three beats.
const sweepSeconds = releaseBeats.slice(0, 3).reduce((sum, { ms }) => sum + ms, 0) / 1000;

const releaseScene: Record<
  ReleaseBeat,
  { request: 'none' | 'late' | 'moved'; shipped: boolean; status: Status; today: boolean }
> = {
  defer: { request: 'moved', shipped: false, status: { text: 'moved to next release', tone: 'active' }, today: true },
  next: { request: 'moved', shipped: true, status: { text: 'shipped on time ✓', tone: 'done' }, today: false },
  plan: { request: 'none', shipped: false, status: { text: 'on track', tone: 'idle' }, today: true },
  request: { request: 'late', shipped: false, status: { text: "won't fit", tone: 'active' }, today: true },
  shipped: { request: 'moved', shipped: true, status: { text: 'shipped on time ✓', tone: 'done' }, today: false }
};

const chipClassName = 'inline-flex h-[26px] items-center rounded-full border px-[11px] text-[11.5px] whitespace-nowrap';
const overdueClassName =
  'bg-[repeating-linear-gradient(135deg,var(--color-rose-100)_0_4px,var(--color-rose-50)_4px_8px)]';

// A week of planned work that ships on Friday. The late request would run past the ship line,
// so it moves into the next release as one object: the bar and the chip share a layoutId.
function ReleasePlan({ frame }: { frame: Frame }): JSX.Element {
  const { beat, episode } = useEpisode(releaseBeats, 'shipped', !frame.still);
  const layoutPrefix = useId();
  const scene = releaseScene[beat];
  const { next, request, work } = releases[episode % releases.length];
  const requestId = `${layoutPrefix}-request-${episode}`;
  const overdueFrom = `${((shipAt - request.from) / (request.to - request.from)) * 100}%`;
  const fading = beat === 'next' ? 'opacity-0' : '';

  return (
    <Screen frame={frame} status={scene.status}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-baseline gap-2 px-5 pt-[18px] pb-1.5">
          <span className="text-[13.5px] font-semibold text-zinc-900">Release 1.{4 + (episode % 6)}</span>
          <span className={cn('text-[12px] text-zinc-400 transition-opacity duration-300', fading)}>due Friday</span>
        </div>

        <div className={cn('relative mx-5 mt-1.5 h-[150px] transition-opacity duration-300', fading)}>
          <div className="grid grid-cols-[repeat(5,15%)] text-[11px] text-zinc-400">
            {weekdays.map((day) => (
              <span className="pl-0.5" key={day}>
                {day}
              </span>
            ))}
          </div>
          <div className="absolute top-[22px] bottom-0 left-0 w-3/4 bg-[linear-gradient(to_right,var(--color-zinc-100)_1px,transparent_1px)] bg-[length:20%_100%]" />
          <div
            className={cn(
              'absolute inset-y-0 border-l-[1.5px] border-dashed transition-colors duration-400',
              scene.shipped ? 'border-emerald-300' : 'border-sky-300'
            )}
            style={{ left: `${shipAt}%` }}
          >
            <span
              className={cn(
                pillClassName,
                'absolute -top-0.5 left-1.5 text-[10.5px] font-semibold transition-colors duration-400',
                scene.shipped ? mintClassName : `${toneClassName.sky.soft} ${toneClassName.sky.text}`
              )}
            >
              {scene.shipped ? 'Shipped ✓' : 'Ship'}
            </span>
          </div>

          <div key={episode}>
            {work.map(({ from, title, to, tone }, lane) => (
              <div
                className={cn(
                  'absolute flex h-6 items-center overflow-hidden rounded-full px-[11px] text-[11.5px] font-medium whitespace-nowrap text-zinc-700',
                  toneClassName[tone].soft
                )}
                key={title}
                style={{ left: `${from}%`, top: laneTop + lane * laneHeight, width: `${to - from}%` }}
              >
                <motion.span
                  animate={{ scaleX: 1 }}
                  className={cn('absolute inset-0 origin-left', toneClassName[tone].fill)}
                  initial={frame.still ? false : { scaleX: 0 }}
                  transition={{
                    delay: (sweepSeconds * from) / shipAt,
                    duration: (sweepSeconds * (to - from)) / shipAt,
                    ease: 'linear'
                  }}
                />
                <span className="relative">{title}</span>
              </div>
            ))}
            {scene.request === 'late' ? (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'absolute z-[2] flex h-6 items-center overflow-hidden rounded-full bg-white px-[11px] text-[11.5px] font-medium whitespace-nowrap text-zinc-700',
                  liftClassName
                )}
                initial={{ opacity: 0, x: 16 }}
                layoutId={requestId}
                style={{
                  left: `${request.from}%`,
                  top: laneTop + work.length * laneHeight,
                  width: `${request.to - request.from}%`
                }}
                transition={{ opacity: { duration: 0.35 }, x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              >
                <motion.span className="relative" layout>
                  {request.title}
                </motion.span>
                <motion.span
                  animate={{ scaleX: 1 }}
                  className={cn(
                    'absolute inset-y-0 right-0 flex origin-left items-center justify-end pr-[9px] text-[10.5px] font-semibold text-rose-700',
                    overdueClassName
                  )}
                  initial={{ scaleX: 0 }}
                  style={{ left: overdueFrom }}
                  transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  +2 days
                </motion.span>
              </motion.div>
            ) : null}
          </div>

          <AnimatePresence>
            {scene.today ? (
              <motion.div
                animate={{ left: `${shipAt}%`, opacity: 1 }}
                className="pointer-events-none absolute top-[22px] bottom-0 z-[3] border-l-[1.5px] border-sky-400"
                exit={{ opacity: 0 }}
                initial={{ left: '0%', opacity: 0 }}
                key={episode}
                transition={{ left: { duration: sweepSeconds, ease: 'linear' }, opacity: { duration: 0.3 } }}
              >
                <span className="absolute -top-1 -left-[4.75px] size-2 rounded-full bg-sky-400 ring-[3px] ring-sky-400/20" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className={cn(
            'mt-auto flex h-[54px] shrink-0 items-center gap-2 border-t border-zinc-100 px-5 transition-opacity duration-300',
            fading
          )}
        >
          <span className="text-[11.5px] font-medium whitespace-nowrap text-zinc-400">Next release</span>
          <span className={cn(chipClassName, 'border-dashed border-zinc-300 bg-white text-zinc-600')}>{next}</span>
          {scene.request === 'moved' ? (
            <motion.span
              className={cn(chipClassName, 'relative border-rose-200 bg-rose-50 text-zinc-600')}
              layoutId={requestId}
              transition={{ layout: { duration: 0.75, ease: [0.65, 0, 0.35, 1] } }}
            >
              {beat === 'defer' ? (
                <>
                  <motion.span
                    animate={{ opacity: 0 }}
                    className={cn('absolute -inset-px rounded-full bg-white', liftClassName)}
                    initial={{ opacity: 1 }}
                    transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <motion.span
                    animate={{ opacity: 0 }}
                    className={cn('absolute -inset-y-px -right-px rounded-r-full', overdueClassName)}
                    initial={{ opacity: 1 }}
                    style={{ left: overdueFrom }}
                    transition={{ duration: 0.2 }}
                  />
                </>
              ) : null}
              <motion.span className="relative" layout>
                {request.title}
              </motion.span>
            </motion.span>
          ) : null}
        </div>
      </div>
    </Screen>
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

// The package fans out to the internal apps that run on it. Each app lights when the dot
// reaches it, on its own duration and delay so they never land together. The last row stands
// for the rest, so the diagram doesn't claim an exact count.
const adoptingApps = [
  { delay: 0, duration: 5.4, label: 'internal app' },
  { delay: 0.7, duration: 6.1, label: 'internal app' },
  { delay: 1.4, duration: 5.8, label: 'internal app' },
  { delay: 2.1, duration: 6.5, label: 'more' }
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
          {adoptingApps.map(({ delay, duration, label }) => (
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
                {label}
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

const placeholderStatus: Status = { text: '', tone: 'idle' };

const instruments: Record<CapabilityKind, (props: { frame: Frame }) => JSX.Element> = {
  fullstack: AccessLog,
  production: ({ frame }) => (
    <Screen frame={frame} status={placeholderStatus}>
      <ReliabilityBoard reduced={frame.still} />
    </Screen>
  ),
  release: ReleasePlan,
  standards: ({ frame }) => (
    <Screen frame={frame} status={placeholderStatus}>
      <AdoptedStandards reduced={frame.still} />
    </Screen>
  )
};

export function CapabilityInstrument({
  kind,
  label,
  size
}: {
  kind: CapabilityKind;
  label: string;
  size: InstrumentSize;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  // Off screen, the illustration remounts in its still state so no loop ticks where nobody can see it.
  const still = useReducedMotion() === true || !isInView;
  const Instrument = instruments[kind];

  return (
    <div ref={ref} aria-label={instrumentLabels[kind]} role="img">
      <div aria-hidden="true" key={still ? 'still' : 'live'}>
        <Instrument frame={{ bodyClassName: bodyClassName[size], label, still }} />
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
