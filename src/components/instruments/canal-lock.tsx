import { useId, type CSSProperties, type JSX, type ReactNode } from 'react';
import { motion, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';
import { cycle, useEpisode, type Frame } from '@/components/instruments/shared';

export const canalLockLabel =
  'Illustration: a canal lock on a bright morning, seen from the side. A narrowboat floats in the full lock chamber, level with the higher water on the right, and the gate ahead of it is raised with a green lamp. A village stands on the low bank and a taller town on the high bank.';

// Drawn once for the narrowest card (350px) and enlarged as one piece on wider cards, so the art
// never stretches.
const stage = { height: 280, width: 320 };
// Both reaches run well past the stage, so the widest card still has scenery at its edges.
const field = { left: -200, width: 740 };
const floor = stage.height + 6;

function Stage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="@container w-full">
      <div className="relative h-[280px] [--stage-scale:1] @[440px]:h-[322px] @[440px]:[--stage-scale:1.15]">
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            height: stage.height,
            marginLeft: -stage.width / 2,
            transform: 'scale(var(--stage-scale))',
            width: stage.width
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function stop(color: string, opacity = 1): CSSProperties {
  return { stopColor: color, stopOpacity: opacity };
}

// Water levels of the two reaches, and the ground behind each.
const low = 228;
const high = 188;
const lowBank = 216;
const highBank = 176;
const chamber = { from: 112, to: 208 };
const middle = (chamber.from + chamber.to) / 2;
// The high reach is shallow: its bed is a step the top gate stands on.
const sill = 244;
const gate = { lowerLift: 84, top: 180, upperLift: 76 };
const boat = { offLeft: -130, offRight: 452 };

const beats = [
  { ms: 800, name: 'open' },
  { ms: 2400, name: 'leave' },
  { ms: 1700, name: 'reset' },
  { ms: 2400, name: 'arrive' },
  { ms: 800, name: 'shut' },
  { ms: 1900, name: 'fill' }
] as const;
type BeatName = (typeof beats)[number]['name'];

type Move = { transition: Transition; value: string };
const held: Transition = { duration: 0 };
const lift: Transition = { duration: 0.65, ease: [0.4, 0, 0.2, 1] };
const rise: Transition = { duration: 1.7, ease: [0.45, 0, 0.35, 1] };

function sail(x: number, level: number): string {
  return `translate(${x}px, ${level}px)`;
}

const boatAt: Record<BeatName, Move> = {
  arrive: { transition: { duration: 2.2, ease: [0.2, 0.6, 0.3, 1] }, value: sail(middle, low) },
  fill: { transition: rise, value: sail(middle, high) },
  leave: { transition: { duration: 2.3, ease: [0.5, 0, 0.8, 0.6] }, value: sail(boat.offRight, high) },
  open: { transition: held, value: sail(middle, high) },
  // The boat is past the card's edge here, so the jump back to the low reach is never seen.
  reset: { transition: held, value: sail(boat.offLeft, low) },
  shut: { transition: held, value: sail(middle, low) }
};
// How far the chamber's water sits below the high level.
const chamberAt: Record<BeatName, Move> = {
  arrive: { transition: held, value: `translateY(${low - high}px)` },
  fill: { transition: rise, value: 'translateY(0px)' },
  leave: { transition: held, value: 'translateY(0px)' },
  open: { transition: held, value: 'translateY(0px)' },
  reset: { transition: { delay: 0.35, duration: 0.9, ease: 'easeInOut' }, value: `translateY(${low - high}px)` },
  shut: { transition: held, value: `translateY(${low - high}px)` }
};
const lowerGateUp: Record<BeatName, { transition: Transition; up: boolean }> = {
  arrive: { transition: held, up: true },
  fill: { transition: held, up: false },
  leave: { transition: held, up: false },
  open: { transition: held, up: false },
  reset: { transition: { ...lift, delay: 1.05, duration: 0.55 }, up: true },
  shut: { transition: lift, up: false }
};
const upperGateUp: Record<BeatName, { transition: Transition; up: boolean }> = {
  arrive: { transition: held, up: false },
  fill: { transition: held, up: false },
  leave: { transition: held, up: true },
  open: { transition: lift, up: true },
  reset: { transition: { ...lift, duration: 0.5 }, up: false },
  shut: { transition: held, up: false }
};

type Wall = 'amber' | 'indigo' | 'pink';
type Roof = 'indigo' | 'pink';
type Building = {
  base: number;
  chimney?: boolean;
  cols: number;
  door: number;
  left: number;
  long?: boolean;
  rise: number;
  roof: Roof;
  rows: number;
  wall: Wall;
  width: number;
};
const pane = { height: 5, width: 3.6 };
const buildings: readonly Building[] = [
  { base: lowBank, chimney: true, cols: 2, door: 6.2, left: 40, rise: 8, roof: 'pink', rows: 1, wall: 'indigo', width: 16 },
  { base: lowBank, cols: 2, door: 5.6, left: 6, rise: 8, roof: 'indigo', rows: 2, wall: 'pink', width: 15 },
  { base: lowBank, cols: 3, door: 15.5, left: -40, long: true, rise: 7, roof: 'pink', rows: 1, wall: 'amber', width: 25 },
  { base: lowBank, chimney: true, cols: 2, door: 5.6, left: -78, rise: 9, roof: 'indigo', rows: 2, wall: 'indigo', width: 15 },
  { base: lowBank, cols: 3, door: 3, left: -124, long: true, rise: 7, roof: 'pink', rows: 1, wall: 'pink', width: 24 },
  { base: lowBank, cols: 2, door: 6.2, left: -168, rise: 8, roof: 'indigo', rows: 2, wall: 'amber', width: 16 },
  // The lock keeper's cottage, beside the chamber.
  { base: highBank, chimney: true, cols: 3, door: 13, left: 144, long: true, rise: 8, roof: 'pink', rows: 1, wall: 'pink', width: 30 },
  { base: highBank, cols: 2, door: 5.6, left: 236, rise: 7, roof: 'pink', rows: 2, wall: 'pink', width: 15 },
  { base: highBank, cols: 2, door: 6.6, left: 256, rise: 0, roof: 'indigo', rows: 4, wall: 'indigo', width: 17 },
  { base: highBank, cols: 1, door: 4.1, left: 278, rise: 15, roof: 'pink', rows: 3, wall: 'amber', width: 12 },
  { base: highBank, cols: 2, door: 7.1, left: 296, rise: 0, roof: 'pink', rows: 3, wall: 'pink', width: 18 },
  { base: highBank, chimney: true, cols: 2, door: 6.1, left: 322, rise: 8, roof: 'indigo', rows: 2, wall: 'indigo', width: 16 },
  { base: highBank, cols: 3, door: 8.1, left: 346, rise: 0, roof: 'indigo', rows: 4, wall: 'amber', width: 20 },
  { base: highBank, cols: 2, door: 5.6, left: 374, rise: 8, roof: 'pink', rows: 2, wall: 'pink', width: 15 },
  { base: highBank, cols: 2, door: 7.1, left: 398, rise: 0, roof: 'indigo', rows: 3, wall: 'indigo', width: 18 },
  { base: highBank, cols: 1, door: 4.1, left: 424, rise: 14, roof: 'pink', rows: 2, wall: 'amber', width: 12 },
  { base: highBank, cols: 3, door: 9.1, left: 444, rise: 0, roof: 'pink', rows: 4, wall: 'pink', width: 22 },
  { base: highBank, chimney: true, cols: 2, door: 6.1, left: 474, rise: 8, roof: 'indigo', rows: 2, wall: 'indigo', width: 16 }
];
const trees: readonly { foot: number; height?: number; r?: number; x: number }[] = [
  { foot: lowBank, r: 8, x: 66 },
  { foot: lowBank, height: 20, x: 28 },
  { foot: lowBank, r: 10, x: -8 },
  { foot: lowBank, height: 18, x: -50 },
  { foot: lowBank, r: 9, x: -92 },
  { foot: lowBank, height: 22, x: -136 },
  { foot: lowBank, r: 11, x: -184 },
  { foot: highBank, r: 7, x: 134 },
  { foot: highBank, height: 17, x: 182 },
  { foot: highBank, r: 6, x: 228 },
  { foot: highBank, height: 18, x: 317 },
  { foot: highBank, height: 19, x: 370 },
  { foot: highBank, height: 18, x: 419 },
  { foot: highBank, height: 20, x: 468 }
];
const hills = 'M-200 216V186C-170 172-140 170-110 176-80 182-56 172-24 164 8 156 40 160 70 168 100 176 124 170 152 156 180 142 210 140 240 148 270 156 300 150 336 140 372 130 410 134 446 144 482 154 512 150 540 144V216Z';
const clouds: readonly { delay: number; duration: number; left: number; scale: number; top: number }[] = [
  { delay: 0.3, duration: 12, left: 36, scale: 1, top: 96 },
  { delay: 2, duration: 14, left: 132, scale: 0.7, top: 62 },
  { delay: 1.2, duration: 13, left: -112, scale: 1.1, top: 70 },
  { delay: 2.8, duration: 15, left: 330, scale: 0.9, top: 84 }
];
const gulls: readonly { delay: number; duration: number; size: number; x: number; y: number }[] = [
  { delay: 0, duration: 5.2, size: 9, x: 82, y: 58 },
  { delay: 0.9, duration: 6.1, size: 7, x: 97, y: 48 },
  { delay: 1.7, duration: 5.6, size: 6, x: 71, y: 44 }
];
const ripples: readonly { delay: number; duration: number; left: number; top: number; width: number }[] = [
  { delay: 0.2, duration: 4.6, left: 20, top: 240, width: 22 },
  { delay: 1.3, duration: 5.3, left: 66, top: 256, width: 28 },
  { delay: 0.7, duration: 4.9, left: -44, top: 248, width: 30 },
  { delay: 1.9, duration: 5.7, left: -110, top: 266, width: 34 },
  { delay: 0.4, duration: 5.1, left: 14, top: 272, width: 36 },
  { delay: 1.6, duration: 4.7, left: 232, top: 200, width: 24 },
  { delay: 2.2, duration: 4.5, left: 286, top: 214, width: 30 },
  { delay: 1.1, duration: 5.9, left: 352, top: 204, width: 26 },
  { delay: 0.9, duration: 5.5, left: 250, top: 230, width: 20 }
];
const smoke = [
  { delay: 0, duration: 4.2, left: 169.5, size: 4.5, top: 141 },
  { delay: 1.5, duration: 4.8, left: 171.5, size: 6, top: 135 },
  { delay: 2.9, duration: 5.4, left: 169, size: 4, top: 129 }
];
const reeds: readonly { delay: number; duration: number; height: number; x: number }[] = [
  { delay: 0, duration: 3.6, height: 26, x: 8 },
  { delay: 0.5, duration: 4.1, height: 20, x: 14 },
  { delay: 0.9, duration: 3.8, height: 30, x: 21 },
  { delay: 0.3, duration: 4.4, height: 18, x: 27 },
  { delay: 0.7, duration: 3.9, height: 24, x: -52 },
  { delay: 1.1, duration: 4.2, height: 30, x: -45 },
  { delay: 0.2, duration: 3.7, height: 20, x: -38 }
];

function Cloud({ id, scale }: { id: string; scale: number }): JSX.Element {
  return (
    <svg className="block overflow-visible" height={14 * scale} viewBox="0 0 56 14" width={56 * scale}>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={id} x1="0" x2="0" y1="0" y2="14">
          <stop offset="0.3" style={stop('var(--color-white)')} />
          <stop offset="1" style={stop('var(--color-pink-200)')} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <rect height={6} rx={3} width={56} x={0} y={8} />
        <rect height={7} rx={3.5} width={34} x={9} y={3.5} />
        <circle cx={22} cy={6} r={5.5} />
        <circle cx={33} cy={6.5} r={4} />
      </g>
    </svg>
  );
}

function Tree({ foot, height, r, x }: { foot: number; height?: number; r?: number; x: number }): JSX.Element {
  const ground = foot + 2;
  if (height) {
    const half = round(height * 0.19);
    const top = ground - height;
    const belly = round(ground - height * 0.42);
    return (
      <g>
        <rect className="fill-indigo-400" height={3} width={1.4} x={x - 0.7} y={ground - 2} />
        <path className="fill-teal-200" d={`M${x} ${top}C${x - half * 0.5} ${round(top + height * 0.2)} ${x - half} ${belly} ${x - half} ${round(ground - height * 0.24)}C${x - half} ${round(ground - height * 0.1)} ${x - half * 0.5} ${ground - 1.5} ${x} ${ground - 1.5}Z`} />
        <path className="fill-teal-300" d={`M${x} ${top}C${x + half * 0.5} ${round(top + height * 0.2)} ${x + half} ${belly} ${x + half} ${round(ground - height * 0.24)}C${x + half} ${round(ground - height * 0.1)} ${x + half * 0.5} ${ground - 1.5} ${x} ${ground - 1.5}Z`} />
      </g>
    );
  }
  const size = r ?? 8;
  const y = round(ground - size * 1.7);
  return (
    <g>
      <rect className="fill-indigo-400" height={round(size * 1.1)} rx={0.6} width={round(size * 0.2)} x={round(x - size * 0.1)} y={round(ground - size * 1.1)} />
      <circle className="fill-teal-300" cx={x} cy={y} r={size} />
      <circle className="fill-teal-200" cx={round(x - size * 0.2)} cy={round(y - size * 0.2)} r={round(size * 0.76)} />
      <circle className="fill-teal-100" cx={round(x - size * 0.36)} cy={round(y - size * 0.4)} r={round(size * 0.34)} />
    </g>
  );
}

function House({ building, id }: { building: Building; id: string }): JSX.Element {
  const { chimney, cols, door, left, long, rise, roof, rows, wall, width } = building;
  const base = building.base + 2;
  const top = base - rows * 8 - 10;
  const peak = top - rise;
  const first = cols > 1 ? left + 2.6 : left + (width - pane.width) / 2;
  const step = cols > 1 ? (width - 5.2 - pane.width) / (cols - 1) : 0;
  const roofPath = long
    ? `M${left - 2.5} ${top}L${left + 2.5} ${peak}H${left + width - 2.5}L${left + width + 2.5} ${top}Z`
    : `M${left - 2} ${top}L${left + width / 2} ${peak}L${left + width + 2} ${top}Z`;
  const lightSide = long
    ? `M${left + 2.5} ${peak}H${left + width - 2.5}L${left + width - 1.5} ${peak + 2}H${left + 1.5}Z`
    : `M${left - 2} ${top}L${left + width / 2} ${peak}V${top}Z`;
  const stack = long ? peak - 3 : peak - 0.5;

  return (
    <g>
      {chimney ? (
        <>
          <rect className="fill-indigo-300" height={rise} width={3.4} x={left + width - 6.4} y={stack} />
          <rect className="fill-indigo-400/60" height={rise} width={1} x={left + width - 4} y={stack} />
          <rect className="fill-white" height={1.6} rx={0.8} width={5.4} x={left + width - 7.4} y={stack - 1} />
        </>
      ) : null}
      <rect fill={`url(#${id}-wall-${wall})`} height={base - top} width={width} x={left} y={top} />
      <rect className="fill-indigo-400/25" height={1.8} width={width} x={left} y={top} />
      {rise > 0 ? (
        <>
          <path d={roofPath} fill={`url(#${id}-roof-${roof})`} stroke={`url(#${id}-roof-${roof})`} strokeLinejoin="round" strokeWidth={1.4} />
          <path className="fill-white/30" d={lightSide} />
        </>
      ) : (
        <>
          <rect fill={`url(#${id}-roof-${roof})`} height={3} rx={1} width={width + 2.8} x={left - 1.4} y={top - 2.4} />
          <rect className="fill-white/50" height={0.9} rx={0.45} width={width + 1.6} x={left - 0.8} y={top - 2.4} />
        </>
      )}
      {Array.from({ length: rows * cols }, (_, order) => {
        const x = round(first + (order % cols) * step);
        const y = top + 3.6 + Math.floor(order / cols) * 8;
        return (
          <g key={order}>
            <rect fill={`url(#${id}-pane)`} height={pane.height} rx={0.8} width={pane.width} x={x} y={y} />
            <rect className="fill-white" height={0.9} rx={0.45} width={pane.width + 1.2} x={x - 0.6} y={y + pane.height} />
          </g>
        );
      })}
      <path className="fill-indigo-400/70" d={`M${left + door} ${base}V${base - 5.4}a1.9 1.9 0 0 1 3.8 0V${base}Z`} />
    </g>
  );
}

// A gate's frame: two posts and a head beam the gate is hauled up into, with a signal lamp.
function Frame({ id, lamp, x }: { id: string; lamp: boolean; x: number }): JSX.Element {
  return (
    <g>
      <rect fill={`url(#${id}-steel)`} height={floor - 92} rx={1.5} width={4} x={x - 8} y={92} />
      <rect fill={`url(#${id}-steel)`} height={floor - 92} rx={1.5} width={4} x={x + 4} y={92} />
      <path className="stroke-indigo-200" d={`M${x - 6} 112L${x + 6} 126M${x + 6} 112L${x - 6} 126M${x - 6} 140L${x + 6} 154M${x + 6} 140L${x - 6} 154`} strokeWidth={0.9} />
      <rect fill={`url(#${id}-cap)`} height={7} rx={2.5} width={24} x={x - 12} y={87} />
      <rect className="fill-white/55" height={1} rx={0.5} width={20} x={x - 10} y={87} />
      <rect className="fill-indigo-400" height={8.4} rx={2.2} width={7} x={x - 3.5} y={96} />
      <circle className={cn('fill-emerald-300 transition-opacity duration-300', lamp ? 'opacity-45' : 'opacity-0')} cx={x} cy={100.200} r={6} />
      <circle className={cn('transition-[fill] duration-300', lamp ? 'fill-emerald-300' : 'fill-indigo-200')} cx={x} cy={100.200} r={2.3} />
      <circle className="fill-white/70" cx={x - 0.8} cy={99.400} r={0.7} />
    </g>
  );
}

export function CanalLock({ frame }: { frame: Frame }): JSX.Element {
  const id = useId();
  const { still } = frame;
  const { beat } = useEpisode(beats, 'open', !still);
  const lower = lowerGateUp[beat];
  const upper = upperGateUp[beat];

  const drive = (move: { transition: Transition; value: string }) =>
    still ? {} : { animate: { transform: move.value }, initial: false as const, transition: move.transition };
  const gateDrive = (up: boolean, by: number, transition: Transition) => drive({ transition, value: `translateY(${up ? -by : 0}px)` });
  const winch = (up: boolean, transition: Transition) => drive({ transition, value: `rotate(${up ? 540 : 0}deg)` });

  return (
    <Stage>
      {/* Sky: a white lift over the lock, a low morning sun, clouds and a few birds. */}
      <span
        className="absolute rounded-full bg-[radial-gradient(closest-side,var(--color-white)_20%,--alpha(var(--color-white)/0%))]"
        style={{ height: 300, left: middle - 150, top: -30, width: 300 }}
      />
      <span
        className="absolute rounded-[50%] bg-[radial-gradient(closest-side,--alpha(var(--color-amber-100)/80%),--alpha(var(--color-pink-200)/50%)_45%,--alpha(var(--color-pink-100)/0%))]"
        style={{ height: 190, left: 150, top: 10, width: 300 }}
      />
      <motion.span
        className="absolute rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/80%)_35%,--alpha(var(--color-amber-100)/0%))]"
        style={{ height: 70, left: 265, top: 55, width: 70 }}
        {...cycle(still, { opacity: [0.75, 1, 0.75], transform: ['scale(0.95)', 'scale(1.05)', 'scale(0.95)'] }, 6.4, [0, 0.5, 1])}
      />
      <span
        className="absolute rounded-full bg-linear-to-b from-amber-100 to-orange-200 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/85%)]"
        style={{ height: 26, left: 287, top: 77, width: 26 }}
      />
      {clouds.map(({ delay, duration, left, scale, top }) => (
        <motion.div
          className="absolute"
          key={left}
          style={{ left, top }}
          {...cycle(still, { transform: ['translateX(0px)', 'translateX(5px)', 'translateX(0px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <Cloud id={`${id}-cloud-${left}`} scale={scale} />
        </motion.div>
      ))}
      {gulls.map(({ delay, duration, size, x, y }) => (
        <motion.div
          className="absolute size-0"
          key={x}
          style={{ left: x, top: y }}
          {...cycle(still, { transform: ['translate(0px, 0px)', 'translate(3px, -2px)', 'translate(0px, 0px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <svg className="absolute overflow-visible" fill="none" height={size * 0.5} style={{ left: -size / 2, top: -size / 4 }} viewBox="0 0 12 6" width={size}>
            <path className="stroke-indigo-400" d="M.8 3.600C2.600 1.200 4.600 1.200 6 4 7.400 1.200 9.400 1.200 11.200 3.600" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
          </svg>
        </motion.div>
      ))}

      {/* The far bank: hills, the village on the low side, the town on the high side, and the lock's back wall. */}
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-hills`} x1="0" x2="0" y1="134" y2={lowBank}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-100)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-land`} x1="0" x2="0" y1={highBank} y2={floor}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-300)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-stone`} x1="0" x2="0" y1={highBank} y2={floor}>
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
          <linearGradient id={`${id}-steel`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
          <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-indigo-300)')} />
            <stop offset="1" style={stop('var(--color-indigo-500)')} />
          </linearGradient>
          <linearGradient id={`${id}-wall-pink`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.3" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-pink-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-wall-amber`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.3" style={stop('var(--color-amber-50)')} />
            <stop offset="1" style={stop('var(--color-amber-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-wall-indigo`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.3" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-roof-pink`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-pink-300)')} />
            <stop offset="1" style={stop('var(--color-pink-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-roof-indigo`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-indigo-300)')} />
            <stop offset="1" style={stop('var(--color-indigo-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-pane`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-100)')} />
            <stop offset="1" style={stop('var(--color-amber-300)')} />
          </linearGradient>
        </defs>

        <path d={hills} fill={`url(#${id}-hills)`} />
        {trees.map((tree) => (
          <Tree key={tree.x} {...tree} />
        ))}
        {buildings.map((building) => (
          <House building={building} id={id} key={building.left} />
        ))}

        {/* The ground steps up beside the lock: low on the left, high on the right. */}
        <path d={`M${field.left} ${lowBank}H92C100 ${lowBank} 100 ${highBank} 108 ${highBank}H${field.left + field.width}V${floor}H${field.left}Z`} fill={`url(#${id}-land)`} />
        <path className="stroke-white" d={`M${field.left} ${lowBank}H92C100 ${lowBank} 100 ${highBank} 108 ${highBank}H${field.left + field.width}`} strokeWidth={1.4} />
        {[[-150, 222], [-70, 220], [-16, 223], [56, 221], [246, 181], [330, 183], [410, 180]].map(([x, y]) => (
          <path className="stroke-violet-400/70" d={`M${x - 2.4} ${y - 2.6}L${x} ${y}L${x + 0.4} ${y - 3.6}M${x} ${y}L${x + 2.8} ${y - 2.4}`} key={x} strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.9} />
        ))}

        {/* The chamber's back wall, with a depth gauge. */}
        <rect fill={`url(#${id}-stone)`} height={floor - highBank} width={chamber.to - chamber.from + 16} x={chamber.from - 8} y={highBank} />
        <path
          className="stroke-indigo-300/60"
          d={`M104 190H216M104 204H216M104 218H216M104 232H216M104 246H216M104 260H216M104 274H216M128 176V190M160 176V190M192 176V190M144 190V204M176 190V204M128 204V218M160 204V218M192 204V218M144 218V232M176 218V232M128 232V246M160 232V246M192 232V246`}
          strokeWidth={0.7}
        />
        <rect className="fill-white" height={3} rx={1.5} width={chamber.to - chamber.from + 22} x={chamber.from - 11} y={highBank - 1.5} />
        <rect className="fill-white" height={62} rx={1} width={4} x={196} y={184} />
        {[188, 196, 204, 212, 220, 228, 236].map((y, index) => (
          <rect className={index % 2 === 0 ? 'fill-pink-300' : 'fill-indigo-300'} height={4} key={y} width={4} x={196} y={y} />
        ))}
        {/* Mooring bollards and a lifebuoy on the lockside. */}
        {[124, 190].map((x) => (
          <g key={x}>
            <rect className="fill-indigo-400" height={5} rx={1} width={3} x={x - 1.5} y={highBank - 6} />
            <rect className="fill-indigo-300" height={1.6} rx={0.8} width={5} x={x - 2.5} y={highBank - 7} />
          </g>
        ))}

        {/* The step the high reach sits on. */}
        <rect fill={`url(#${id}-land)`} height={floor - sill} width={field.left + field.width - chamber.to} x={chamber.to} y={sill} />
      </svg>

      {smoke.map(({ delay, duration, left, size, top }) => (
        <motion.span
          className="absolute rounded-full bg-linear-to-b from-white to-indigo-100 opacity-90"
          key={top}
          style={{ height: size, left: left - size / 2, top: top - size / 2, width: size }}
          {...cycle(
            still,
            { opacity: [0, 0.9, 0.7, 0], transform: ['translate(-1px, 5px) scale(0.6)', 'translate(0px, 2px) scale(0.9)', 'translate(1px, -1px) scale(1)', 'translate(3px, -4px) scale(1.15)'] },
            duration,
            [0, 0.25, 0.6, 1],
            { delay, ease: 'linear' }
          )}
        />
      ))}

      {/* Water: the low reach, the high reach on its step, and the chamber between them, which rises and falls. */}
      <span
        className="absolute bg-linear-to-b from-indigo-200/90 to-indigo-300 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/80%)]"
        style={{ height: floor - low, left: field.left, top: low, width: chamber.from - field.left }}
      />
      <span
        className="absolute bg-linear-to-b from-indigo-200/90 to-indigo-300 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/80%)]"
        style={{ height: sill - high, left: chamber.to, top: high, width: field.left + field.width - chamber.to }}
      />
      <span className="absolute h-[2px] bg-violet-400/40" style={{ left: chamber.to, top: sill, width: field.left + field.width - chamber.to }} />
      <div className="absolute overflow-hidden" style={{ height: floor - high, left: chamber.from, top: high, width: chamber.to - chamber.from }}>
        <motion.span
          className="absolute inset-x-0 top-0 bg-linear-to-b from-indigo-200/90 to-indigo-300 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/80%)]"
          style={{ height: floor - high }}
          {...drive(chamberAt[beat])}
        >
          <span className="absolute top-[10px] left-[12px] h-[2px] w-[18px] rounded-full bg-white/55" />
          <span className="absolute top-[22px] left-[56px] h-[2px] w-[24px] rounded-full bg-white/55" />
          <span className="absolute top-[40px] left-[22px] h-[2px] w-[30px] rounded-full bg-white/45" />
        </motion.span>
      </div>
      {ripples.map(({ delay, duration, left, top, width }) => (
        <motion.span
          className="absolute h-[2px] rounded-full bg-white/55"
          key={left}
          style={{ left, top, width }}
          {...cycle(still, { transform: ['translateX(0px)', 'translateX(5px)', 'translateX(0px)'] }, duration, [0, 0.5, 1], { delay })}
        />
      ))}

      {/* A duck on the high reach. */}
      <motion.div
        className="absolute size-0"
        style={{ left: 262, top: high + 1 }}
        {...cycle(still, { transform: ['translate(0px, 0px) rotate(-3deg)', 'translate(3px, -0.8px) rotate(3deg)', 'translate(0px, 0px) rotate(-3deg)'] }, 4.2, [0, 0.5, 1], { delay: 0.4 })}
      >
        <span className="absolute -top-[5px] -left-[5px] h-[5px] w-[10px] rounded-b-full rounded-t-[3px] bg-white shadow-[inset_0_-1px_0_var(--color-indigo-200)]" />
        <span className="absolute -top-[9px] left-[2px] size-[5px] rounded-full bg-white" />
        <span className="absolute -top-[7px] left-[6.5px] h-[1.5px] w-[2.5px] rounded-full bg-amber-300" />
        <span className="absolute top-[0.5px] -left-[6px] h-[1.5px] w-[13px] rounded-full bg-white/70" />
      </motion.div>

      {/* The narrowboat. */}
      <motion.div className="absolute top-0 left-0 size-0" style={{ transform: sail(middle, high) }} {...drive(boatAt[beat])}>
        <motion.div
          className="absolute size-0"
          {...cycle(still, { transform: ['translateY(0px) rotate(0.8deg)', 'translateY(-1px) rotate(-0.8deg)', 'translateY(0px) rotate(0.8deg)'] }, 3.4, [0, 0.5, 1])}
        >
          <svg
            className="absolute overflow-visible [filter:drop-shadow(0_2px_2px_--alpha(var(--color-indigo-950)/16%))]"
            fill="none"
            height={28}
            style={{ left: -28, top: -23 }}
            viewBox="-28 -23 56 28"
            width={56}
          >
            <defs>
              <linearGradient id={`${id}-hull`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={stop('var(--color-indigo-400)')} />
                <stop offset="1" style={stop('var(--color-indigo-500)')} />
              </linearGradient>
              <linearGradient id={`${id}-cabin`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={stop('var(--color-pink-200)')} />
                <stop offset="1" style={stop('var(--color-pink-300)')} />
              </linearGradient>
            </defs>
            <path d="M-25-5H23C25.500-5 27-4 27-3 26 .5 23 3 19 3H-20C-23 3-24.500-1-25-5Z" fill={`url(#${id}-hull)`} />
            <path className="stroke-white" d="M-25-5H24" strokeLinecap="round" strokeWidth={1.3} />
            <rect className="fill-amber-300" height={1.2} width={44} x={-22} y={-2.600} />
            <rect fill={`url(#${id}-cabin)`} height={8.5} rx={1.5} width={32} x={-17} y={-13.500} />
            <rect className="fill-white" height={2.2} rx={1.1} width={35} x={-18.500} y={-15} />
            <rect className="fill-white/60" height={8.5} width={2.4} x={-4} y={-13.500} />
            {[-14, -8.500, 1.500, 7].map((x) => (
              <rect className="fill-amber-100 stroke-pink-400" height={4} key={x} rx={0.8} strokeWidth={0.6} width={3.6} x={x} y={-11.500} />
            ))}
            <rect className="fill-indigo-400" height={5} rx={0.6} width={2.4} x={9.500} y={-19.500} />
            <rect className="fill-white" height={1.4} rx={0.7} width={4} x={8.700} y={-20.300} />
            <path className="stroke-indigo-300" d="M-19-5.500V-11L-24-13" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.1} />
            <circle className="fill-teal-300" cx={19} cy={-7.500} r={2.6} />
            <circle className="fill-pink-300" cx={18} cy={-8.500} r={0.9} />
            <circle className="fill-white" cx={20.200} cy={-7.800} r={0.8} />
            <rect className="fill-amber-200" height={2.6} rx={0.6} width={5} x={16.500} y={-5.200} />
            <rect className="fill-white/70" height={1.4} rx={0.7} width={46} x={-23} y={3.400} />
          </svg>
        </motion.div>
      </motion.div>

      {/* The gates slide up into their frames; a wheel on each frame turns while its gate moves. */}
      <motion.span
        className="absolute rounded-t-[2px] bg-linear-to-r from-indigo-300 to-indigo-400 shadow-[inset_1px_0_0_--alpha(var(--color-white)/60%)]"
        style={{ height: floor - gate.top, left: chamber.from - 3, top: gate.top, width: 6 }}
        {...gateDrive(lower.up, gate.lowerLift, lower.transition)}
      >
        {[10, 26, 42, 58, 74, 90].map((y) => (
          <span className="absolute inset-x-0 h-[1.5px] bg-indigo-200/80" key={y} style={{ top: y }} />
        ))}
      </motion.span>
      <motion.span
        className="absolute rounded-[2px] bg-linear-to-r from-indigo-300 to-indigo-400 shadow-[inset_1px_0_0_--alpha(var(--color-white)/60%)]"
        style={{ height: sill - gate.top + 2, left: chamber.to - 3, top: gate.top, transform: `translateY(${-gate.upperLift}px)`, width: 6 }}
        {...gateDrive(upper.up, gate.upperLift, upper.transition)}
      >
        {[10, 26, 42, 58].map((y) => (
          <span className="absolute inset-x-0 h-[1.5px] bg-indigo-200/80" key={y} style={{ top: y }} />
        ))}
      </motion.span>
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <Frame id={id} lamp={lower.up} x={chamber.from} />
        <Frame id={id} lamp={upper.up} x={chamber.to} />
      </svg>
      {[
        { gateState: lower, x: chamber.from },
        { gateState: upper, x: chamber.to }
      ].map(({ gateState, x }) => (
        <motion.span
          className="absolute size-[14px] rounded-full bg-white shadow-[inset_0_0_0_2px_var(--color-pink-300),0_1px_2px_--alpha(var(--color-indigo-950)/18%)]"
          key={x}
          style={{ left: x + 9, top: 82 }}
          {...winch(gateState.up, gateState.transition)}
        >
          <span className="absolute top-[6px] left-[2px] h-[2px] w-[10px] rounded-full bg-pink-300" />
          <span className="absolute top-[2px] left-[6px] h-[10px] w-[2px] rounded-full bg-pink-300" />
          <span className="absolute top-[5px] left-[5px] size-[4px] rounded-full bg-indigo-400" />
        </motion.span>
      ))}

      {/* Reeds in the near water. */}
      {reeds.map(({ delay, duration, height, x }) => (
        <motion.span
          className="absolute w-[2px] origin-bottom rounded-full bg-linear-to-t from-teal-300 to-teal-200"
          key={x}
          style={{ height, left: x, top: floor - height }}
          {...cycle(still, { transform: ['rotate(-3deg)', 'rotate(4deg)', 'rotate(-3deg)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <span className="absolute -top-[5px] -left-[1px] h-[7px] w-[4px] rounded-full bg-indigo-400" />
        </motion.span>
      ))}
    </Stage>
  );
}
