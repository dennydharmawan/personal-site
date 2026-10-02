import { useId, type CSSProperties, type JSX, type ReactNode } from 'react';
import { motion, type Transition } from 'motion/react';
import { cycle, useEpisode, type Frame } from '@/components/instruments/shared';

export const lighthouseLabel =
  'Illustration: a harbour at dusk. A white lighthouse with pink bands stands on a headland beside a keeper’s cottage and a few village houses, above a jetty with a lamp. The sun is half set behind the sea. The lighthouse beam rests on clear water by the jetty, and the jetty lamp and the house windows are lit.';

// Drawn once for the narrowest card (350px) and enlarged as one piece on wider cards, so the art
// never stretches.
const stage = { height: 280, width: 320 };
// Sea and headland run well past both sides of the stage, so the widest card still has scenery at its edges.
const field = { left: -200, width: 740 };
const floor = stage.height + 6;

function Stage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="@container w-full">
      <div className="relative h-[280px] [--stage-scale:1] @[440px]:h-[322px] @[440px]:[--stage-scale:1.15] @[600px]:h-[350px] @[600px]:[--stage-scale:1.25]">
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

type Point = readonly [number, number];

// A polyline with every inner corner rounded off.
function rounded(points: readonly Point[], radius: number): string {
  return points
    .map(([x, y], index) => {
      if (index === 0) return `M${x} ${y}`;
      if (index === points.length - 1) return `L${x} ${y}`;
      const toward = ([otherX, otherY]: Point) => {
        const length = Math.hypot(otherX - x, otherY - y);
        const reach = Math.min(radius, length / 2) / length;
        return `${round(x + (otherX - x) * reach)} ${round(y + (otherY - y) * reach)}`;
      };
      return `L${toward(points[index - 1])}Q${x} ${y} ${toward(points[index + 1])}`;
    })
    .join('');
}

// A smooth ground line through evenly spaced heights. The same curve is drawn as the rim of a hill
// and read back for everything that stands on it.
function ridge(first: number, step: number, heights: readonly number[]): { at: (x: number) => number; curve: string; line: string } {
  const last = heights.length - 1;
  const tangent = (index: number) => (heights[Math.min(index + 1, last)] - heights[Math.max(index - 1, 0)]) / 2;
  const at = (x: number) => {
    const position = Math.min(Math.max((x - first) / step, 0), last - 1e-6);
    const index = Math.floor(position);
    const t = position - index;
    return (
      (2 * t ** 3 - 3 * t ** 2 + 1) * heights[index] +
      (t ** 3 - 2 * t ** 2 + t) * tangent(index) +
      (3 * t ** 2 - 2 * t ** 3) * heights[index + 1] +
      (t ** 3 - t ** 2) * tangent(index + 1)
    );
  };
  const curve = heights.slice(1).reduce((path, height, index) => {
    const x = first + index * step;
    const out = `${round(x + step / 3)} ${round(heights[index] + tangent(index) / 3)}`;
    const into = `${round(x + (2 * step) / 3)} ${round(height - tangent(index + 1) / 3)}`;
    return `${path}C${out} ${into} ${x + step} ${height}`;
  }, '');
  return { at, curve, line: `M${first} ${heights[0]}${curve}` };
}

// The headland's turf line, and a nearer knoll in front of it.
const crest = ridge(184, 24, [171, 166.5, 165.5, 166.5, 170, 175.5, 182, 189, 195.5, 201, 205.5, 209, 211.5, 213, 214, 214.5]);
const knoll = ridge(208, 24, [280, 256, 243, 236, 233, 234, 237, 241, 245, 249, 252, 255, 257, 258, 259]);

const horizon = 196;

// The cliff that faces the sea, from the waterline up to the turf: four beds of rock, each stepping out
// a little further than the one above.
const cliff: readonly Point[] = [
  [155, floor], [157, 263], [165, 260], [167, 239], [173, 236], [175, 213], [180, 210], [182, 189], [186, 186], [187, 172]
];
const headlandPath = `${rounded(cliff, 2)}L184 171${crest.curve}V${floor}Z`;
const knollPath = `${knoll.line}V${floor}H208Z`;
// The ledge on top of each bed, where the last sun lands.
const ledges: readonly { length: number; x: number; y: number }[] = [
  { length: 15, x: 182.5, y: 187.5 },
  { length: 20, x: 175.5, y: 211.5 },
  { length: 17, x: 167.5, y: 237.5 },
  { length: 22, x: 157.5, y: 261.5 }
];
const cracks: readonly string[] = ['M196 196V205', 'M188 219V231', 'M201 224V230', 'M183 246V256', 'M196 250V257', 'M176 268V278', 'M191 270V276'];
// Grass tufts on the open slopes, some with a few flowers beside them: x, y, and which posy (0 is none).
const tufts: readonly (readonly [number, number, number])[] = [
  [246, 264, 1], [226, 276, 0], [292, 254, 0], [318, 268, 2], [346, 256, 0], [376, 270, 3], [412, 264, 1],
  [446, 272, 0], [484, 268, 2], [264, 198, 0], [334, 222, 0], [246, 224, 3], [512, 240, 0]
];
// Each posy is a few dots around its tuft: dx, dy, and whether the dot is white.
const posies: readonly (readonly (readonly [number, number, boolean])[])[] = [
  [],
  [[6, -1, false], [9.4, 0.8, true], [-5.6, 0.6, false]],
  [[-6.2, -1.2, true], [-9.4, 1, false], [5.6, 1.4, false]],
  [[5.2, 1.6, false], [-5.2, -0.4, true]]
];
// A path winds from the tower door down the slope to the jetty.
const jettyPath = 'M232 171C221 174 213 180 216 189S234 199 231 209 208 217 207 227 199 241 180 243.500';

// The lighthouse and the keeper's cottage are drawn at one size and enlarged about the tower's foot.
const keep = { ground: 166, scale: 1.25, x: 236 };
const keepTransform = `translate(${keep.x} ${keep.ground}) scale(${keep.scale}) translate(${-keep.x} ${-keep.ground})`;
function raised(y: number): number {
  return keep.ground - (keep.ground - y) * keep.scale;
}
const lamp = 72;
const lantern = { x: keep.x, y: raised(lamp) };
const tower = { base: 158, foot: 12.5, head: 8, top: 88, x: keep.x };
const towerPath = `M${tower.x - tower.foot} ${tower.base}L${tower.x - tower.head} ${tower.top}H${tower.x + tower.head}L${tower.x + tower.foot} ${tower.base}Z`;
const railPosts = [-12, -8, -4, 0, 4, 8, 12];

// The beam lands on the water between `far`, out at sea, and `dock`, by the jetty.
const boat = { aim: 224, dock: 110, far: -40 };

const beats = [
  { ms: 2200, name: 'hold' },
  { ms: 2800, name: 'search' },
  { ms: 500, name: 'found' },
  { ms: 2600, name: 'follow' },
  { ms: 1300, name: 'lit' }
] as const;
type BeatName = (typeof beats)[number]['name'];

// Solves a cubic bezier easing, so the beam's landing point can be sampled along the water.
function bezier(x1: number, y1: number, x2: number, y2: number): (time: number) => number {
  const axis = (a: number, b: number, u: number) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u ** 2 * b + u ** 3;
  return (time) => {
    let low = 0;
    let high = 1;
    for (let pass = 0; pass < 24; pass += 1) {
      const mid = (low + high) / 2;
      if (axis(x1, x2, mid) < time) low = mid;
      else high = mid;
    }
    return axis(y1, y2, (low + high) / 2);
  };
}

// The beam is drawn pointing left at this length, then turned and stretched to reach its target.
const beamReach = 260;

function beamPose(angle: number, length: number): string {
  return `rotate(${round(-angle)}deg) scaleX(${round(length / beamReach)})`;
}

function beamOnto(x: number): string {
  const across = lantern.x - x;
  const down = boat.aim - lantern.y;
  return beamPose((Math.atan2(down, across) * 180) / Math.PI, Math.hypot(across, down));
}

// The beam makes one slow pass: out across the water to `far`, a pause, and back in to the jetty. Both
// legs are sampled along the water, so the beam keeps touching the sea the whole way.
const sweepSamples = 24;
const sweepTimes = Array.from({ length: sweepSamples + 1 }, (_, step) => step / sweepSamples);
const sweepEase = bezier(0.45, 0, 0.55, 1);
const sweepOut = sweepTimes.map((time) => beamOnto(boat.dock + (boat.far - boat.dock) * sweepEase(time)));
const sweepIn = [...sweepOut].reverse();

type Move = { transition: Transition; value: number | number[] | string | string[] };
const held: Transition = { duration: 0 };

const beamTurn: Record<BeatName, Move> = {
  follow: { transition: { duration: 2.5, ease: 'linear', times: sweepTimes }, value: sweepIn },
  found: { transition: held, value: beamOnto(boat.far) },
  hold: { transition: held, value: beamOnto(boat.dock) },
  lit: { transition: held, value: beamOnto(boat.dock) },
  search: { transition: { duration: 2.7, ease: 'linear', times: sweepTimes }, value: sweepOut }
};

// How thick the fog lies: heavy while the beam searches, thinning as the beam walks in across the water.
const fogThin = 0.32;
const fogShown: Record<BeatName, Move> = {
  follow: { transition: { delay: 0.3, duration: 2.1, ease: 'easeInOut' }, value: fogThin },
  found: { transition: held, value: 1 },
  hold: { transition: held, value: fogThin },
  lit: { transition: held, value: fogThin },
  search: { transition: { delay: 0.3, duration: 1.6, ease: 'easeInOut' }, value: 1 }
};

function welcome(beat: BeatName, order: number): Move {
  if (beat === 'lit') return { transition: { delay: 0.12 + order * 0.07, duration: 0.3, ease: 'easeOut' }, value: 1 };
  if (beat === 'hold') return { transition: held, value: 1 };
  if (beat === 'search') return { transition: { delay: 0.15 + order * 0.05, duration: 0.8, ease: 'easeIn' }, value: 0 };
  return { transition: held, value: 0 };
}

function stop(color: string, opacity = 1): CSSProperties {
  return { stopColor: color, stopOpacity: opacity };
}

type Wall = 'amber' | 'indigo' | 'pink';
type Roof = 'indigo' | 'pink';
type House = {
  chimney?: boolean;
  door: number;
  facing: 'front' | 'side';
  height: number;
  left: number;
  roof: Roof;
  rise: number;
  scale?: number;
  wall: Wall;
  width: number;
  windows: readonly Point[];
};

// Left to right, down the slope from the lighthouse to the harbour. Window and door positions are
// measured from the house's left edge and from the top of its wall.
const village: readonly House[] = [
  { chimney: true, door: 4, facing: 'front', height: 17, left: 299, rise: 9, roof: 'indigo', wall: 'pink', width: 18, windows: [[11, 4.5]] },
  { door: 10.5, facing: 'front', height: 22, left: 340, rise: 8, roof: 'pink', wall: 'indigo', width: 16, windows: [[3, 3.5], [3, 12.5]] },
  { door: 5, facing: 'side', height: 14, left: 370, rise: 8, roof: 'pink', wall: 'amber', width: 25, windows: [[13.5, 4.5]] },
  { chimney: true, door: 10, facing: 'front', height: 21, left: 414, rise: 9, roof: 'indigo', wall: 'pink', width: 17, windows: [[3, 3.5], [9.6, 3.5]] },
  { door: 17, facing: 'side', height: 14, left: 464, rise: 8, roof: 'pink', wall: 'indigo', width: 28, windows: [[4, 4.5], [10.5, 4.5]] }
];
// The lamp lights first, then the windows in order down the street.
const windowOrder = village.map((_, index) => 2 + village.slice(0, index).reduce((sum, { windows }) => sum + windows.length, 0));
const cypresses: readonly { height: number; x: number }[] = [
  { height: 19, x: 325 },
  { height: 21, x: 362 },
  { height: 17, x: 398 },
  { height: 22, x: 404.5 },
  { height: 16, x: 436.5 },
  { height: 23, x: 443.5 },
  { height: 18, x: 500 }
];
// A nearer row on the knoll, drawn larger.
const quayside: readonly House[] = [
  { chimney: true, door: 15.5, facing: 'side', height: 12, left: 262, rise: 7.5, roof: 'indigo', scale: 1.5, wall: 'amber', width: 22, windows: [[3.5, 3.5], [9.5, 3.5]] },
  { door: 9.5, facing: 'front', height: 15, left: 374, rise: 8, roof: 'pink', scale: 1.5, wall: 'indigo', width: 16, windows: [[3, 3.5]] },
  { door: 3, facing: 'side', height: 11, left: 413, rise: 7, roof: 'indigo', scale: 1.5, wall: 'pink', width: 18, windows: [[10, 3.5]] }
];
const quaysideOrder = quayside.map((_, index) => 3 + index * 2);
const nearCypresses: readonly { height: number; x: number }[] = [
  { height: 30, x: 303 },
  { height: 22, x: 311.5 },
  { height: 28, x: 354 },
  { height: 24, x: 405.5 },
  { height: 32, x: 462 },
  { height: 24, x: 471 }
];
const shrubs: readonly { r: number; x: number }[] = [
  { r: 4.2, x: 204.5 },
  { r: 3, x: 210 }
];
const fencePosts = [188, 193.5, 199];

const stars: readonly { delay: number; duration: number; size: number; x: number; y: number }[] = [
  { delay: 0.2, duration: 3.8, size: 7, x: 270, y: 20 },
  { delay: 1.4, duration: 4.6, size: 5, x: 314, y: 62 },
  { delay: 0.8, duration: 5.2, size: 5, x: 166, y: 22 },
  { delay: 2.1, duration: 4.2, size: 4, x: 132, y: 62 },
  { delay: 1.1, duration: 4.9, size: 5, x: 62, y: 44 },
  { delay: 0.5, duration: 5.6, size: 4, x: -52, y: 70 },
  { delay: 1.8, duration: 4.4, size: 6, x: 372, y: 34 },
  { delay: 0.9, duration: 5, size: 4, x: 424, y: 92 },
  { delay: 2.4, duration: 4.7, size: 5, x: -118, y: 34 }
];
const clouds: readonly { delay: number; duration: number; left: number; scale: number; top: number }[] = [
  { delay: 0.3, duration: 12, left: 76, scale: 1, top: 142 },
  { delay: 2, duration: 14, left: -22, scale: 0.7, top: 116 },
  { delay: 1.2, duration: 13, left: -120, scale: 1.1, top: 96 },
  { delay: 2.8, duration: 15, left: 338, scale: 0.9, top: 104 }
];
const glitter: readonly { delay: number; duration: number; top: number; width: number }[] = [
  { delay: 0, duration: 3.2, top: 200, width: 28 },
  { delay: 0.7, duration: 3.9, top: 205.5, width: 18 },
  { delay: 0.3, duration: 3.5, top: 211, width: 23 },
  { delay: 1.1, duration: 4.3, top: 217.5, width: 13 },
  { delay: 0.5, duration: 3.7, top: 225, width: 17 },
  { delay: 1.4, duration: 4.1, top: 234, width: 9 }
];
const ripples: readonly { delay: number; duration: number; left: number; top: number; width: number }[] = [
  { delay: 0.2, duration: 4.6, left: 72, top: 205, width: 16 },
  { delay: 1.3, duration: 5.3, left: 118, top: 214, width: 22 },
  { delay: 0.7, duration: 4.9, left: -54, top: 221, width: 30 },
  { delay: 1.9, duration: 5.7, left: 26, top: 252, width: 26 },
  { delay: 0.4, duration: 5.1, left: 104, top: 266, width: 34 },
  { delay: 1.6, duration: 4.7, left: -108, top: 246, width: 28 },
  { delay: 0.9, duration: 5.5, left: -160, top: 212, width: 22 },
  { delay: 2.2, duration: 4.5, left: 138, top: 203, width: 12 },
  { delay: 1.1, duration: 5.9, left: -34, top: 268, width: 40 },
  { delay: 0.1, duration: 5.2, left: -150, top: 270, width: 30 }
];
// Each bank is a few overlapping wisps with feathered ends: left, top, width, height. `heavy` banks
// thicken while the beam searches.
type Wisp = readonly [number, number, number, number];
const fogBanks: readonly { delay: number; duration: number; heavy: boolean; wisps: readonly Wisp[]; x: number; y: number }[] = [
  { delay: 0, duration: 9, heavy: true, wisps: [[-30, -13, 52, 5], [-60, -7, 118, 7], [-42, 1, 98, 6], [-66, 8, 74, 4]], x: 46, y: 224 },
  { delay: 1.2, duration: 11, heavy: true, wisps: [[-34, -5, 78, 5], [-52, 1, 96, 6], [-12, 8, 50, 4]], x: 112, y: 210 },
  { delay: 0.6, duration: 10, heavy: true, wisps: [[-64, -6, 116, 6], [-38, 1, 100, 7], [-72, 9, 76, 4]], x: -84, y: 214 },
  { delay: 2, duration: 12, heavy: true, wisps: [[-50, -4, 104, 6], [-66, 3, 82, 5], [-20, 9, 64, 4]], x: 64, y: 252 },
  { delay: 1.6, duration: 9.5, heavy: false, wisps: [[-52, -4, 94, 6], [-30, 3, 88, 5]], x: -150, y: 242 },
  { delay: 0.9, duration: 10.5, heavy: false, wisps: [[-40, -3, 84, 5], [-60, 3, 70, 4]], x: -40, y: 264 }
];
const gulls: readonly { delay: number; duration: number; size: number; x: number; y: number }[] = [
  { delay: 0, duration: 5.2, size: 9, x: 304, y: 92 },
  { delay: 0.9, duration: 6.1, size: 7, x: 319, y: 82 },
  { delay: 1.7, duration: 5.6, size: 6, x: 293, y: 78 }
];
const smoke = [
  { delay: 0, duration: 4.2, left: 282.5, size: 5.5, top: 116 },
  { delay: 1.5, duration: 4.8, left: 285, size: 7.5, top: 109 },
  { delay: 2.9, duration: 5.4, left: 281.5, size: 5, top: 102 }
];

const jetty = { deck: 241, from: 138, lamp: 144, to: 180 };
const lampHead = { x: jetty.lamp, y: 215 };

function Sparkle({ className, size }: { className: string; size: number }): JSX.Element {
  return (
    <svg className="absolute overflow-visible" height={size} style={{ left: -size / 2, top: -size / 2 }} viewBox="-6 -6 12 12" width={size}>
      <path className={className} d="M0-6C.5-1.6 1.6-.5 6 0 1.6.5.5 1.6 0 6-.5 1.6-1.6.5-6 0-1.6-.5-.5-1.6 0-6Z" />
    </svg>
  );
}

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

function Cypress({ foot, height, x }: { foot: number; height: number; x: number }): JSX.Element {
  const half = round(height * 0.19);
  const top = round(foot - height);
  const belly = round(foot - height * 0.42);
  return (
    <g>
      <rect className="fill-indigo-400" height={3} width={1.4} x={x - 0.7} y={foot - 2} />
      <path className="fill-indigo-300" d={`M${x} ${top}C${x - half * 0.5} ${round(top + height * 0.2)} ${x - half} ${belly} ${x - half} ${round(foot - height * 0.24)}C${x - half} ${round(foot - height * 0.1)} ${x - half * 0.5} ${foot - 1.5} ${x} ${foot - 1.5}Z`} />
      <path className="fill-indigo-400" d={`M${x} ${top}C${x + half * 0.5} ${round(top + height * 0.2)} ${x + half} ${belly} ${x + half} ${round(foot - height * 0.24)}C${x + half} ${round(foot - height * 0.1)} ${x + half * 0.5} ${foot - 1.5} ${x} ${foot - 1.5}Z`} />
      <path className="stroke-indigo-200" d={`M${x - half * 0.45} ${round(foot - height * 0.5)}C${x - half * 0.4} ${round(foot - height * 0.66)} ${x - half * 0.2} ${round(foot - height * 0.78)} ${x - 0.3} ${round(foot - height * 0.88)}`} fill="none" strokeLinecap="round" strokeWidth={0.9} />
    </g>
  );
}

function Dwelling({
  ground,
  house,
  id,
  lit
}: {
  ground: (x: number) => number;
  house: House;
  id: string;
  lit: (pane: number, x: number, y: number) => ReactNode;
}): JSX.Element {
  const { chimney, door, facing, height, left, rise, roof, scale = 1, wall, width, windows } = house;
  const ends = [ground(left), ground(left + width * scale)];
  // Sunk a little below the lower end of the ground; the hill is drawn over the foot of the wall.
  const base = round(Math.max(...ends) + 3);
  const top = round(base - (base - Math.min(...ends)) / scale - height);
  const peak = top - rise;
  // A chimney stands clear of the ridge on a long roof, and of the slope on a gable.
  const stack = facing === 'front' ? peak - 0.5 : peak - 3;
  const roofPath =
    facing === 'front'
      ? `M${left - 2} ${top}L${left + width / 2} ${peak}L${left + width + 2} ${top}Z`
      : `M${left - 2.5} ${top}L${left + 2.5} ${peak}H${left + width - 2.5}L${left + width + 2.5} ${top}Z`;
  const lightSide =
    facing === 'front'
      ? `M${left - 2} ${top}L${left + width / 2} ${peak}V${top}Z`
      : `M${left + 2.5} ${peak}H${left + width - 2.5}L${left + width - 1.5} ${peak + 2}H${left + 1.5}Z`;

  return (
    <g transform={scale === 1 ? undefined : `translate(${left} ${base}) scale(${scale}) translate(${-left} ${-base})`}>
      {chimney ? (
        <>
          <rect className="fill-indigo-300" height={rise} width={3.4} x={left + width - 6.4} y={stack} />
          <rect className="fill-indigo-400/60" height={rise} width={1} x={left + width - 4} y={stack} />
          <rect className="fill-white" height={1.6} rx={0.8} width={5.4} x={left + width - 7.4} y={stack - 1} />
        </>
      ) : null}
      <rect fill={`url(#${id}-wall-${wall})`} height={base - top} width={width} x={left} y={top} />
      <rect className="fill-indigo-400/25" height={1.8} width={width} x={left} y={top} />
      <path d={roofPath} fill={`url(#${id}-roof-${roof})`} stroke={`url(#${id}-roof-${roof})`} strokeLinejoin="round" strokeWidth={1.4} />
      <path className="fill-white/30" d={lightSide} />
      {windows.map(([x, y], order) => (
        <g key={`${x}-${y}`}>
          <rect className="fill-indigo-300" height={5.4} rx={0.9} width={4.4} x={left + x} y={top + y} />
          {lit(order, left + x, top + y)}
          <rect className="fill-white" height={1} rx={0.5} width={5.8} x={left + x - 0.7} y={top + y + 5.4} />
        </g>
      ))}
      <path className="fill-indigo-400/70" d={`M${left + door} ${base}V${top + height - 5.2}a1.9 1.9 0 0 1 3.8 0V${base}Z`} />
    </g>
  );
}

export function Lighthouse({ frame }: { frame: Frame }): JSX.Element {
  const id = useId();
  const { still } = frame;
  const { beat, episode } = useEpisode(beats, 'hold', !still);

  const drive = (move: Move, key: 'opacity' | 'transform') =>
    still ? {} : { animate: { [key]: move.value }, initial: false as const, transition: move.transition };

  return (
    <Stage>
      {/* Sky: a white lift behind the lighthouse, the sunset's wash low on the left, a moon and a few stars. */}
      <span
        className="absolute rounded-full bg-[radial-gradient(closest-side,var(--color-white)_20%,--alpha(var(--color-white)/0%))]"
        style={{ height: 300, left: 80, top: -40, width: 300 }}
      />
      <span
        className="absolute rounded-[50%] bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/75%),--alpha(var(--color-pink-200)/60%)_42%,--alpha(var(--color-pink-100)/0%))]"
        style={{ height: 236, left: 12 - 230, top: horizon - 118, width: 460 }}
      />
      {stars.map(({ delay, duration, size, x, y }) => (
        <motion.span
          className="absolute size-0"
          key={x}
          style={{ left: x, top: y }}
          {...cycle(still, { opacity: [1, 0.35, 1], transform: ['scale(1)', 'scale(0.7)', 'scale(1)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <Sparkle className="fill-indigo-300" size={size} />
        </motion.span>
      ))}
      <svg className="absolute overflow-visible [filter:drop-shadow(0_0_5px_var(--color-white))]" height={22} style={{ left: 290, top: 26 }} viewBox="0 0 22 22" width={22}>
        <defs>
          <linearGradient id={`${id}-moon`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
        </defs>
        <path d="M14.5 2.2A9.4 9.4 0 1 0 19.9 15 7.6 7.6 0 0 1 14.5 2.2Z" fill={`url(#${id}-moon)`} />
      </svg>
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

      {/* Sun, far islands and the sea. */}
      <motion.span
        className="absolute rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/80%)_35%,--alpha(var(--color-amber-100)/0%))]"
        style={{ height: 76, left: 12 - 38, top: horizon - 38, width: 76 }}
        {...cycle(still, { opacity: [0.75, 1, 0.75], transform: ['scale(0.95)', 'scale(1.05)', 'scale(0.95)'] }, 6.4, [0, 0.5, 1])}
      />
      <span
        className="absolute rounded-full bg-linear-to-b from-amber-100 to-orange-200 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/85%)]"
        style={{ height: 30, left: 12 - 15, top: horizon - 15, width: 30 }}
      />
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-isle-far`} x1="0" x2="0" y1="162" y2={horizon}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-pink-100)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-isle-near`} x1="0" x2="0" y1="178" y2={horizon}>
            <stop offset="0" style={stop('var(--color-indigo-300)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-sea`} x1="0" x2="0" y1={horizon} y2={floor}>
            <stop offset="0" style={stop('var(--color-pink-200)')} />
            <stop offset="0.24" style={stop('var(--color-indigo-200)')} />
            <stop offset="1" style={stop('var(--color-indigo-300)')} />
          </linearGradient>
        </defs>
        <path d="M-200 196V177C-184 168-168 163-150 165-132 167-124 176-104 178-88 180-76 171-60 173-42 175-34 190-16 196Z" fill={`url(#${id}-isle-far)`} />
        <path d="M-136 196C-122 185-108 180-94 182-80 184-72 192-54 196Z" fill={`url(#${id}-isle-near)`} />
        <path d="M66 196C74 189 85 185.500 96 187.500 106 189.500 111 193.500 120 196Z" fill={`url(#${id}-isle-far)`} />
        <rect fill={`url(#${id}-sea)`} height={floor - horizon} width={field.width} x={field.left} y={horizon} />
        <rect className="fill-white/70" height={1.5} width={field.width} x={field.left} y={horizon} />
      </svg>
      {glitter.map(({ delay, duration, top, width }) => (
        <motion.span
          className="absolute h-[2.5px] rounded-full bg-amber-100"
          key={top}
          style={{ left: 12 - width / 2, top, width }}
          {...cycle(still, { opacity: [1, 0.6, 1], transform: ['scaleX(1)', 'scaleX(0.72)', 'scaleX(1)'] }, duration, [0, 0.5, 1], { delay })}
        />
      ))}
      {ripples.map(({ delay, duration, left, top, width }) => (
        <motion.span
          className="absolute h-[2px] rounded-full bg-white/55"
          key={left}
          style={{ left, top, width }}
          {...cycle(still, { transform: ['translateX(0px)', 'translateX(5px)', 'translateX(0px)'] }, duration, [0, 0.5, 1], { delay })}
        />
      ))}

      {/* A mooring buoy in the near water. */}
      <motion.div
        className="absolute size-0"
        style={{ left: 86, top: 258 }}
        {...cycle(still, { transform: ['translateY(0px) rotate(-5deg)', 'translateY(-1.5px) rotate(4deg)', 'translateY(0px) rotate(-5deg)'] }, 3.6, [0, 0.5, 1], { delay: 0.6 })}
      >
        <span className="absolute -left-[5px] top-[1px] h-[2px] w-[10px] rounded-full bg-white/70" />
        <span className="absolute -top-[7px] -left-[3.5px] h-[8px] w-[7px] rounded-t-full rounded-b-[2px] bg-linear-to-b from-pink-300 to-pink-400 shadow-[inset_0_1px_0_--alpha(var(--color-white)/70%)]" />
        <span className="absolute -top-[4.5px] -left-[3.5px] h-[2px] w-[7px] bg-white" />
        <span className="absolute -top-[10px] -left-[0.5px] h-[3px] w-[1px] bg-indigo-400" />
      </motion.div>

      {/* Fog lies low over the water. */}
      <motion.span
        className="absolute bg-linear-to-b from-white/0 via-white/40 to-white/0"
        style={{ height: 70, left: field.left, opacity: fogThin, top: horizon + 2, width: 372 }}
        {...drive(fogShown[beat], 'opacity')}
      />
      {fogBanks.map(({ delay, duration, heavy, wisps, x, y }) => (
        <motion.div
          className="absolute size-0"
          key={x}
          style={{ left: x, top: y }}
          {...cycle(still, { transform: ['translateX(-3px)', 'translateX(3px)', 'translateX(-3px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <motion.svg
            className="absolute top-0 left-0 overflow-visible [filter:blur(0.4px)]"
            height={1}
            style={{ opacity: heavy ? fogThin : 0.5 }}
            width={1}
            {...(heavy ? drive(fogShown[beat], 'opacity') : {})}
          >
            <defs>
              <linearGradient id={`${id}-fog-${x}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" style={stop('var(--color-white)', 0)} />
                <stop offset="0.28" style={stop('var(--color-white)', 0.82)} />
                <stop offset="0.72" style={stop('var(--color-white)', 0.82)} />
                <stop offset="1" style={stop('var(--color-white)', 0)} />
              </linearGradient>
            </defs>
            {wisps.map(([left, top, width, height]) => (
              <rect fill={`url(#${id}-fog-${x})`} height={height} key={top} rx={height / 2} width={width} x={left} y={top} />
            ))}
          </motion.svg>
        </motion.div>
      ))}

      {/* The beam turns about the lamp and stretches to wherever it lands. */}
      <motion.div
        className="absolute size-0"
        style={{ left: lantern.x, top: lantern.y, transform: beamOnto(boat.dock) }}
        {...drive(beamTurn[beat], 'transform')}
      >
        <svg className="absolute overflow-visible" height={60} style={{ left: -beamReach, top: -30 }} viewBox={`${-beamReach} -30 ${beamReach + 80} 60`} width={beamReach + 80}>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-beam`} x1={0} x2={-beamReach} y1="0" y2="0">
              <stop offset="0" style={stop('var(--color-amber-200)', 0.85)} />
              <stop offset="0.6" style={stop('var(--color-amber-100)', 0.5)} />
              <stop offset="1" style={stop('var(--color-amber-100)', 0)} />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-beam-core`} x1={0} x2={-beamReach} y1="0" y2="0">
              <stop offset="0" style={stop('var(--color-white)', 0.9)} />
              <stop offset="0.7" style={stop('var(--color-amber-100)', 0.45)} />
              <stop offset="1" style={stop('var(--color-amber-100)', 0)} />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-beam-back`} x1={0} x2={76} y1="0" y2="0">
              <stop offset="0" style={stop('var(--color-amber-200)', 0.7)} />
              <stop offset="1" style={stop('var(--color-amber-100)', 0)} />
            </linearGradient>
          </defs>
          <path d={`M0-3.500V3.500L${-beamReach} 26V-26Z`} fill={`url(#${id}-beam)`} />
          <path d={`M0-2V2L${-beamReach} 11V-11Z`} fill={`url(#${id}-beam-core)`} />
          <path d="M0-3.500V3.500L76 10V-10Z" fill={`url(#${id}-beam-back)`} />
        </svg>
      </motion.div>

      {/* Headland, village and jetty. */}
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-land`} x1="0" x2="0" y1="165" y2={floor}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-300)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-knoll`} x1="0" x2="0" y1="228" y2={floor}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-300)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-sunlit`} x1="154" x2="206" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-pink-200)')} />
            <stop offset="0.45" style={stop('var(--color-pink-200)', 0.7)} />
            <stop offset="1" style={stop('var(--color-pink-200)', 0)} />
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
          <linearGradient id={`${id}-deck`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-pane`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-100)')} />
            <stop offset="1" style={stop('var(--color-amber-300)')} />
          </linearGradient>
          <clipPath id={`${id}-headland`}>
            <path d={headlandPath} />
          </clipPath>
        </defs>

        {cypresses.map(({ height, x }) => (
          <Cypress foot={round(crest.at(x) + 2)} height={height} key={x} x={x} />
        ))}
        {village.map((house, index) => (
          <Dwelling
            ground={crest.at}
            house={house}
            id={id}
            key={house.left}
            lit={(pane, x, y) => (
              <motion.rect
                fill={`url(#${id}-pane)`}
                height={5.4}
                rx={0.9}
                style={{ opacity: 1 }}
                width={4.4}
                x={x}
                y={y}
                {...drive(welcome(beat, windowOrder[index] + pane), 'opacity')}
              />
            )}
          />
        ))}

        {/* The keeper's cottage, tucked behind the tower. */}
        <g transform={keepTransform}>
        <rect className="fill-indigo-200" height={10} width={4} x={271} y={131} />
        <rect className="fill-white" height={1.8} rx={0.9} width={6} x={270} y={129.6} />
        <rect fill={`url(#${id}-wall-indigo)`} height={26} width={36} x={246} y={148} />
        <rect className="fill-indigo-400/25" height={2} width={36} x={246} y={148} />
        <path d="M243.500 148.500L249 138H279L284.500 148.500Z" fill={`url(#${id}-roof-pink)`} stroke={`url(#${id}-roof-pink)`} strokeLinejoin="round" strokeWidth={1.4} />
        <path className="fill-white/30" d="M249 138H279L280 140H248Z" />
        <rect className="fill-white" height={8.4} rx={1.4} width={8} x={254.500} y={152.800} />
        <rect fill={`url(#${id}-pane)`} height={6.4} rx={0.8} width={6} x={255.500} y={153.800} />
        <path className="stroke-white" d="M258.500 153.800V160.200M255.500 157H261.500" strokeWidth={0.9} />
        <path className="fill-indigo-400/70" d="M269.500 172V160.500a2.500 2.500 0 0 1 5 0V172Z" />
        </g>

        <path d={headlandPath} fill={`url(#${id}-land)`} />
        <g clipPath={`url(#${id}-headland)`}>
          <rect fill={`url(#${id}-sunlit)`} height={floor - 160} width={56} x={150} y={160} />
          {ledges.map(({ length, x, y }) => (
            <g key={y}>
              <rect className="fill-violet-400/35" height={2.2} rx={1.1} width={length + 9} x={x} y={y + 1.2} />
              <rect className="fill-white/85" height={1.6} rx={0.8} width={length} x={x} y={y - 0.8} />
            </g>
          ))}
          {cracks.map((d) => (
            <path className="stroke-violet-400/40" d={d} key={d} strokeLinecap="round" strokeWidth={1.1} />
          ))}
          <path className="stroke-pink-100" d={rounded(cliff, 2)} strokeLinejoin="round" strokeWidth={7} />
          <path className="stroke-violet-100" d={crest.line} strokeLinecap="round" strokeWidth={7} transform="translate(0 3)" />
          <path className="stroke-white/60" d={jettyPath} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
          {/* Foam where the rock meets the water. */}
          <rect className="fill-white/80" height={2.4} rx={1.2} width={22} x={148} y={274} />
        </g>
        <path className="stroke-white" d={crest.line} strokeLinecap="round" strokeWidth={1.3} />

        {nearCypresses.map(({ height, x }) => (
          <Cypress foot={round(knoll.at(x) + 2)} height={height} key={x} x={x} />
        ))}
        {quayside.map((house, index) => (
          <Dwelling
            ground={knoll.at}
            house={house}
            id={id}
            key={house.left}
            lit={(pane, x, y) => (
              <motion.rect
                fill={`url(#${id}-pane)`}
                height={5.4}
                rx={0.9}
                style={{ opacity: 1 }}
                width={4.4}
                x={x}
                y={y}
                {...drive(welcome(beat, quaysideOrder[index] + pane), 'opacity')}
              />
            )}
          />
        ))}
        <path d={knollPath} fill={`url(#${id}-knoll)`} />
        <path className="stroke-white/80" d={knoll.line} strokeLinecap="round" strokeWidth={1.3} />
        {tufts.map(([x, y, posy]) => (
          <g key={`${x}-${y}`}>
            <path className="stroke-violet-400/70" d={`M${x - 2.4} ${y - 2.6}L${x} ${y}L${x + 0.4} ${y - 3.6}M${x} ${y}L${x + 2.8} ${y - 2.4}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.9} />
            {posies[posy].map(([dx, dy, white]) => (
              <circle className={white ? 'fill-white' : 'fill-pink-300'} cx={x + dx} cy={y + dy} key={dx} r={white ? 1 : 1.2} />
            ))}
          </g>
        ))}

        {fencePosts.map((x) => (
          <path className="stroke-indigo-300" d={`M${x} ${round(crest.at(x) + 1)}v-6`} key={x} strokeLinecap="round" strokeWidth={1.2} />
        ))}
        <path
          className="stroke-indigo-300"
          d={`M${fencePosts[0] - 2} ${round(crest.at(fencePosts[0]) - 3.5)}L${fencePosts[2] + 2} ${round(crest.at(fencePosts[2] + 2) - 3.2)}`}
          strokeLinecap="round"
          strokeWidth={1}
        />
        {shrubs.map(({ r, x }) => {
          const y = round(crest.at(x) - r * 0.55);
          return (
            <g key={x}>
              <circle className="fill-indigo-400" cx={x} cy={y} r={r} />
              <circle className="fill-indigo-300" cx={x - r * 0.22} cy={y - r * 0.22} r={r * 0.72} />
            </g>
          );
        })}

        {/* Jetty: the deck, its posts, and a lamp at the seaward end. */}
        {[jetty.from + 6, jetty.from + 19, jetty.from + 32].map((x) => (
          <g key={x}>
            <rect className="fill-indigo-400" height={12} rx={0.6} width={3} x={x - 1.5} y={jetty.deck + 2} />
            <rect className="fill-indigo-400/40" height={1.5} rx={0.75} width={7} x={x - 3.5} y={jetty.deck + 15} />
          </g>
        ))}
        <rect className="fill-indigo-400/50" height={1.8} width={jetty.to - jetty.from - 2} x={jetty.from + 1} y={jetty.deck + 3.2} />
        <rect fill={`url(#${id}-deck)`} height={4} rx={1} width={jetty.to - jetty.from} x={jetty.from} y={jetty.deck} />
        {[150, 156, 162, 168, 174].map((x) => (
          <rect className="fill-indigo-200" height={4} key={x} width={0.7} x={x} y={jetty.deck} />
        ))}
        <rect className="fill-indigo-400" height={5} rx={1} width={2.6} x={171} y={jetty.deck - 4.2} />
        <rect className="fill-white" height={1.2} rx={0.6} width={3.4} x={170.600} y={jetty.deck - 4.800} />
        <rect className="fill-amber-200" height={5} rx={0.8} width={5.5} x={156} y={jetty.deck - 5} />
        <rect className="fill-amber-300" height={1} width={5.5} x={156} y={jetty.deck - 3} />
        <rect className="fill-pink-200" height={4} rx={0.8} width={4.5} x={162.200} y={jetty.deck - 4} />

        <path className="stroke-indigo-400" d={`M${jetty.lamp} ${jetty.deck}V${lampHead.y + 4}`} strokeLinecap="round" strokeWidth={1.5} />
        <rect className="fill-indigo-400" height={1.6} rx={0.8} width={5} x={jetty.lamp - 2.5} y={jetty.deck - 1.2} />
        <rect className="fill-indigo-200 stroke-indigo-400" height={7} rx={1.2} strokeWidth={1} width={6} x={lampHead.x - 3} y={lampHead.y - 3.5} />
        <path className="fill-indigo-400" d={`M${lampHead.x - 4.4} ${lampHead.y - 3.2}L${lampHead.x} ${lampHead.y - 7.4}L${lampHead.x + 4.4} ${lampHead.y - 3.2}Z`} strokeLinejoin="round" />
        <circle className="fill-indigo-400" cx={lampHead.x} cy={lampHead.y - 8} r={1} />
      </svg>

      {/* A dinghy tied up on the near side of the jetty. */}
      <motion.div
        className="absolute size-0"
        style={{ left: 160, top: 263 }}
        {...cycle(still, { transform: ['translateY(0px) rotate(1.5deg)', 'translateY(-1.2px) rotate(-1.5deg)', 'translateY(0px) rotate(1.5deg)'] }, 3.9, [0, 0.5, 1], { delay: 0.9 })}
      >
        <svg className="absolute overflow-visible" height={16.8} style={{ left: -16.8, top: -12.6 }} viewBox="-12 -9 24 12" width={33.6}>
          <defs>
            <linearGradient id={`${id}-dinghy`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={stop('var(--color-amber-200)')} />
              <stop offset="1" style={stop('var(--color-amber-300)')} />
            </linearGradient>
          </defs>
          <path className="stroke-indigo-400/70" d="M8.500-4.500C10-8 9-11 5.500-12.500" fill="none" strokeWidth={0.7} />
          <path d="M-10-5H10C9-1.500 7 0 4.500 0H-5.500C-8 0-9.500-2-10-5Z" fill={`url(#${id}-dinghy)`} />
          <path className="stroke-white" d="M-10-5H10" strokeLinecap="round" strokeWidth={1.2} />
          <rect className="fill-amber-400/60" height={1} width={8} x={-4} y={-3} />
          <rect className="fill-white/70" height={1.4} rx={0.7} width={18} x={-9} y={1} />
        </svg>
      </motion.div>

      {/* The jetty lamp: a glow, a lit pane, and its reflection. */}
      <motion.div
        className="absolute size-0"
        style={{ left: lampHead.x, top: lampHead.y }}
        {...drive(welcome(beat, 0), 'opacity')}
      >
        <motion.span
          className="absolute size-0"
          key={beat === 'lit' ? `lit-${episode}` : 'steady'}
          {...(beat === 'lit'
            ? {
                animate: { transform: ['scale(0.5)', 'scale(1.18)', 'scale(1)'] },
                initial: { transform: 'scale(0.5)' },
                transition: { delay: 0.12, duration: 0.55, ease: ['easeOut', 'easeInOut'], times: [0, 0.55, 1] }
              }
            : {})}
        >
          <motion.span
            className="absolute -top-[15px] -left-[15px] size-[30px] rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/90%)_25%,--alpha(var(--color-amber-200)/0%))]"
            {...cycle(still, { opacity: [1, 0.72, 1], transform: ['scale(1)', 'scale(0.92)', 'scale(1)'] }, 2.9, [0, 0.5, 1], { delay: 0.4 })}
          />
        </motion.span>
        <span className="absolute -top-[2.5px] -left-[2px] h-[6px] w-[4px] rounded-[1px] bg-linear-to-b from-white to-amber-200" />
        <span className="absolute -left-[5px] h-[1.5px] w-[10px] rounded-full bg-amber-200/90" style={{ top: jetty.deck + 19 - lampHead.y }} />
        <span className="absolute -left-[3px] h-[1.5px] w-[6px] rounded-full bg-amber-200/70" style={{ top: jetty.deck + 23 - lampHead.y }} />
      </motion.div>
      {beat === 'lit' ? (
        <motion.span
          animate={{ opacity: [0, 0.9, 0], transform: ['scale(0.4)', 'scale(1)', 'scale(1.8)'] }}
          className="absolute size-5 rounded-full ring-2 ring-amber-300"
          initial={{ opacity: 0, transform: 'scale(0.4)' }}
          key={episode}
          style={{ left: lampHead.x - 10, top: lampHead.y - 10 }}
          transition={{ delay: 0.12, duration: 0.7, ease: 'easeOut', times: [0, 0.3, 1] }}
        />
      ) : null}

      {/* The lighthouse stands in front of the beam's pivot. */}
      <motion.span
        className="absolute rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/85%)_20%,--alpha(var(--color-amber-100)/0%))]"
        style={{ height: 68, left: lantern.x - 34, top: lantern.y - 34, width: 68 }}
        {...cycle(still, { opacity: [0.8, 1, 0.8], transform: ['scale(0.94)', 'scale(1.06)', 'scale(0.94)'] }, 3.4, [0, 0.5, 1])}
      />
      <svg
        className="absolute inset-0 overflow-visible [filter:drop-shadow(0_1px_1px_--alpha(var(--color-indigo-950)/12%))_drop-shadow(0_5px_7px_--alpha(var(--color-indigo-950)/12%))]"
        fill="none"
        height={stage.height}
        viewBox={`0 0 ${stage.width} ${stage.height}`}
        width={stage.width}
      >
        <defs>
          <linearGradient id={`${id}-tower`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-pink-100)')} />
            <stop offset="0.3" style={stop('var(--color-white)')} />
            <stop offset="0.68" style={stop('var(--color-indigo-50)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
          <linearGradient id={`${id}-band`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-pink-200)')} />
            <stop offset="0.3" style={stop('var(--color-pink-300)')} />
            <stop offset="1" style={stop('var(--color-pink-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-indigo-300)')} />
            <stop offset="1" style={stop('var(--color-indigo-500)')} />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-100)')} />
            <stop offset="1" style={stop('var(--color-amber-200)')} />
          </linearGradient>
          <clipPath id={`${id}-tower-clip`}>
            <path d={towerPath} />
          </clipPath>
        </defs>

        <ellipse className="fill-indigo-400/30" cx={tower.x + 5} cy={168.2} rx={25} ry={2.6} />
        <g transform={keepTransform}>

        <rect fill={`url(#${id}-tower)`} height={9} rx={1.5} width={34} x={tower.x - 17} y={158} />
        <path className="stroke-indigo-200" d={`M${tower.x - 17} 162.500H${tower.x + 17}M${tower.x - 9} 158V162.500M${tower.x + 6} 158V162.500M${tower.x - 2} 162.500V167M${tower.x + 11} 162.500V167`} strokeWidth={0.7} />
        <rect className="fill-white" height={1.2} rx={0.6} width={34} x={tower.x - 17} y={158} />

        <path d={towerPath} fill={`url(#${id}-tower)`} />
        <g clipPath={`url(#${id}-tower-clip)`}>
          <rect fill={`url(#${id}-band)`} height={13} width={30} x={tower.x - 15} y={101} />
          <rect fill={`url(#${id}-band)`} height={13} width={30} x={tower.x - 15} y={132} />
          <rect className="fill-indigo-400/25" height={2} width={30} x={tower.x - 15} y={88} />
        </g>
        <path className="stroke-white/45" d={`M${tower.x - 5} 92L${tower.x - 8.200} 154`} strokeLinecap="round" strokeWidth={2.2} />

        <circle className="fill-indigo-300" cx={tower.x + 0.500} cy={95} r={2.3} />
        <circle cx={tower.x + 0.500} cy={95} fill={`url(#${id}-glass)`} r={1.5} />
        <path className="fill-indigo-300" d={`M${tower.x - 2.800} 128V121.500a2.800 2.800 0 0 1 5.600 0V128Z`} />
        <path d={`M${tower.x - 1.800} 127V121.600a1.800 1.800 0 0 1 3.600 0V127Z`} fill={`url(#${id}-glass)`} />
        <path className="fill-indigo-400" d={`M${tower.x - 3.400} 158V150a3.400 3.400 0 0 1 6.800 0V158Z`} />
        <circle className="fill-amber-200" cx={tower.x + 1.600} cy={153.500} r={0.7} />
        <rect className="fill-white" height={1.6} rx={0.5} width={10} x={tower.x - 5} y={157} />

        <path className="fill-indigo-300" d={`M${tower.x - tower.head} ${tower.top}L${tower.x - 12} 84H${tower.x + 12}L${tower.x + tower.head} ${tower.top}Z`} />
        <rect className="fill-amber-100 stroke-indigo-300" height={20} rx={1} strokeWidth={0.8} width={13.6} x={tower.x - 6.800} y={61.500} />
        <rect fill={`url(#${id}-glass)`} height={19} width={12.4} x={tower.x - 6.200} y={62} />
        <ellipse className="fill-white" cx={lantern.x} cy={lamp} rx={2.8} ry={4.2} />
        <path className="stroke-indigo-300/80" d={`M${tower.x - 2.400} 62V81M${tower.x + 2.400} 62V81`} strokeWidth={0.7} />
        <rect fill={`url(#${id}-cap)`} height={3.2} rx={1.2} width={28} x={tower.x - 14} y={81} />
        <rect className="fill-white/60" height={0.9} rx={0.45} width={26} x={tower.x - 13} y={81} />
        {railPosts.map((offset) => (
          <path className="stroke-indigo-400" d={`M${tower.x + offset} 75V81`} key={offset} strokeWidth={0.8} />
        ))}
        <path className="stroke-indigo-400" d={`M${tower.x - 13} 75H${tower.x + 13}`} strokeLinecap="round" strokeWidth={1.2} />

        <path d={`M${tower.x - 7.500} 60C${tower.x - 7} 54 ${tower.x - 3} 51.500 ${tower.x} 50 ${tower.x + 3} 51.500 ${tower.x + 7} 54 ${tower.x + 7.500} 60Z`} fill={`url(#${id}-cap)`} />
        <path className="stroke-white/60" d={`M${tower.x - 5} 57.500C${tower.x - 4.400} 54.800 ${tower.x - 2.600} 53.200 ${tower.x - 1} 52.200`} strokeLinecap="round" strokeWidth={0.9} />
        <rect fill={`url(#${id}-cap)`} height={2.6} rx={1.3} width={19} x={tower.x - 9.500} y={59.400} />
        <path className="stroke-indigo-400" d={`M${tower.x} 50V42`} strokeLinecap="round" strokeWidth={1} />
        <circle className="fill-indigo-400" cx={tower.x} cy={48.800} r={1.8} />
        </g>
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

    </Stage>
  );
}
