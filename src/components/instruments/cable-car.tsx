import { useId, type CSSProperties, type JSX, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cycle, type Frame } from '@/components/instruments/shared';

export const cableCarLabel =
  'Illustration: a cable car line climbing a snowy hillside from a small station hut at the lower left to the upper right, in front of violet mountains. Four pastel gondolas, evenly spaced, ride the one cable past two pylons, and a green lamp on the top pylon lights as each gondola clears it.';

// The scene is drawn once for the narrowest card (312px) and enlarged as one piece on wider cards,
// so the art never stretches. The widest step is taller than its box; the surplus is foreground snow
// that drops below the card's bottom edge.
const stage = { height: 250, width: 312 };
// Scenery runs past both sides of the stage, so a card a few pixels wider than the scaled stage
// still shows hillside at its edges.
const field = { left: -48, width: 408 };

function Stage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="@container w-full">
      <div className="relative h-[250px] [--stage-drop:0px] [--stage-scale:1] @[340px]:h-[280px] @[340px]:[--stage-scale:1.12] @[400px]:h-[290px] @[400px]:[--stage-drop:35px] @[400px]:[--stage-scale:1.3]">
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            height: stage.height,
            marginLeft: -stage.width / 2,
            transform: 'translateY(var(--stage-drop)) scale(var(--stage-scale))',
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

function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

type Point = readonly [number, number];

// Piecewise-linear value through `points`, held flat before the first and after the last.
function ramp(points: readonly Point[], at: number): number {
  const first = points[0];
  if (at <= first[0]) return first[1];
  for (let index = 1; index < points.length; index += 1) {
    const [toAt, toValue] = points[index];
    if (at <= toAt) {
      const [fromAt, fromValue] = points[index - 1];
      return fromValue + ((toValue - fromValue) * (at - fromAt)) / (toAt - fromAt);
    }
  }
  return points[points.length - 1][1];
}

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

// A smooth ridge line through evenly spaced heights. The same curve is drawn as the hill's crest and
// read back for anything that has to stand on it.
const knots = { first: field.left, step: 24 };

function ridge(heights: readonly number[]): { at: (x: number) => number; crest: string; fill: string } {
  const last = heights.length - 1;
  const tangent = (index: number) => (heights[Math.min(index + 1, last)] - heights[Math.max(index - 1, 0)]) / 2;
  const at = (x: number) => {
    const position = Math.min(Math.max((x - knots.first) / knots.step, 0), last - 1e-6);
    const index = Math.floor(position);
    const t = position - index;
    return (
      (2 * t ** 3 - 3 * t ** 2 + 1) * heights[index] +
      (t ** 3 - 2 * t ** 2 + t) * tangent(index) +
      (3 * t ** 2 - 2 * t ** 3) * heights[index + 1] +
      (t ** 3 - t ** 2) * tangent(index + 1)
    );
  };
  const crest = heights.slice(1).reduce((path, height, index) => {
    const x = knots.first + index * knots.step;
    const out = `${round(x + knots.step / 3)} ${round(heights[index] + tangent(index) / 3)}`;
    const into = `${round(x + (2 * knots.step) / 3)} ${round(height - tangent(index + 1) / 3)}`;
    return `${path}C${out} ${into} ${x + knots.step} ${height}`;
  }, `M${knots.first} ${heights[0]}`);
  return { at, crest, fill: `${crest}V${stage.height + 12}H${knots.first}Z` };
}

const midRidge = ridge([150, 146, 144, 146, 150, 155, 158, 158, 154, 146, 134, 122, 110, 100, 92, 86, 80, 76]);
const slope = ridge([209, 208, 207, 207, 207, 207, 206, 202, 194, 182, 168, 153, 139, 127, 118, 110, 101, 94]);
const drift = ridge([238, 234, 232, 234, 238, 240, 238, 234, 228, 222, 214, 206, 198, 190, 184, 176, 170, 166]);

// The cable hangs from five supports: the wheel inside the station, the station's exit, the two
// pylons, and the next pylon past the frame. Each span sags a little, and the sheaves at a support
// bend the cable over a short length instead of kinking it.
const supports = [
  { sag: 0, x: 24, y: 155 },
  { sag: 4, x: 62, y: 155 },
  { sag: 3, x: 160, y: 116 },
  { sag: 3, x: 256, y: 62 },
  { sag: 0, x: 376, y: 26 }
];
const bend = 11;

function hangingAt(x: number): number {
  const index = Math.min(Math.max(supports.findIndex((support) => support.x > x) - 1, 0), supports.length - 2);
  const from = supports[x >= supports[supports.length - 1].x ? supports.length - 2 : index];
  const to = supports[supports.indexOf(from) + 1];
  const t = (x - from.x) / (to.x - from.x);
  return from.y + (to.y - from.y) * t + 4 * from.sag * t * (1 - t);
}

function cableAt(x: number): number {
  const over = supports.slice(1, -1).find((support) => Math.abs(x - support.x) < bend);
  if (!over) return hangingAt(x);
  const t = (x - (over.x - bend)) / (2 * bend);
  return (1 - t) ** 2 * hangingAt(over.x - bend) + 2 * t * (1 - t) * over.y + t ** 2 * hangingAt(over.x + bend);
}

function cableSlope(x: number): number {
  return (Math.atan2(cableAt(x + 1) - cableAt(x - 1), 2) * 180) / Math.PI;
}

const line = { from: 24, to: 350 };
const cablePath = Array.from({ length: (372 - 16) / 2 + 1 }, (_, index) => {
  const x = 16 + index * 2;
  return `${index ? 'L' : 'M'}${x} ${round(cableAt(x))}`;
}).join('');

// Distance along the cable, so a gondola moves at one speed however steep the span is.
const trip = (() => {
  const step = 0.5;
  const marks: { s: number; x: number }[] = [];
  let s = 0;
  for (let x = line.from; x <= line.to; x += step) {
    if (x > line.from) s += Math.hypot(step, cableAt(x) - cableAt(x - step));
    marks.push({ s, x });
  }
  const xAt = (distance: number) => {
    const index = Math.max(1, marks.findIndex((mark) => mark.s >= distance));
    const from = marks[index - 1];
    const to = marks[index];
    return from.x + ((to.x - from.x) * (distance - from.s)) / (to.s - from.s);
  };
  const distanceAt = (x: number) => marks[Math.round((x - line.from) / step)].s;
  return { distanceAt, length: s, xAt };
})();

type Tone = { deep: string; edge: string; light: string; mid: string };

// Whole `var(--color-*)` strings: Tailwind only emits a palette variable it can read as a literal.
const tones = {
  amber: { deep: 'var(--color-amber-300)', edge: 'var(--color-amber-400)', light: 'var(--color-amber-100)', mid: 'var(--color-amber-200)' },
  pink: { deep: 'var(--color-pink-300)', edge: 'var(--color-pink-400)', light: 'var(--color-pink-100)', mid: 'var(--color-pink-200)' },
  sky: { deep: 'var(--color-sky-300)', edge: 'var(--color-sky-400)', light: 'var(--color-sky-100)', mid: 'var(--color-sky-200)' },
  teal: { deep: 'var(--color-teal-300)', edge: 'var(--color-teal-400)', light: 'var(--color-teal-100)', mid: 'var(--color-teal-200)' }
} satisfies Record<string, Tone>;

// Listed from the top of the line down. `riders` is which window panes have someone behind them.
const fleet: readonly { name: string; riders: readonly ('left' | 'right')[]; tone: Tone }[] = [
  { name: 'amber', riders: ['left', 'right'], tone: tones.amber },
  { name: 'sky', riders: ['right'], tone: tones.sky },
  { name: 'pink', riders: ['left', 'right'], tone: tones.pink },
  { name: 'teal', riders: ['left'], tone: tones.teal }
];

const loopSeconds = 10;
const spacing = trip.length / fleet.length;
const speed = trip.length / loopSeconds;
const passSeconds = loopSeconds / fleet.length;
const pass = { exit: trip.distanceAt(supports[1].x), lower: trip.distanceAt(supports[2].x), upper: trip.distanceAt(supports[3].x) };
// Where the top gondola sits on the first frame: clear of the top pylon's sheaves, with its glint showing.
const lead = pass.upper + 30;
const glintAfter = 18;

// A pendulum knocked once: it swings back first, then rings down.
function swing(distance: number, degrees: number): number {
  const seconds = distance / speed;
  return seconds < 0 ? 0 : degrees * Math.exp(-seconds / 0.55) * Math.sin((2 * Math.PI * seconds) / 0.9);
}

const samples = 160;
const sampleTimes = Array.from({ length: samples + 1 }, (_, step) => step / samples);

const routes = fleet.map((_, index) => {
  const frames = sampleTimes.map((time) => {
    const s = wrap(lead - index * spacing + time * trip.length, trip.length);
    const x = trip.xAt(s);
    // Behind the station wall at one end and past the card's edge at the other, so the jump back is never seen.
    const shown = s > 5 && s < trip.length - 8 ? 1 : 0;
    const sway = swing(s - pass.exit, 2) + swing(s - pass.lower, 4.5) + swing(s - pass.upper, 5);
    const lit = (s - pass.upper - glintAfter) / speed;
    const shadowX = x + 9;
    const ground = (Math.atan2(slope.at(shadowX + 1) - slope.at(shadowX - 1), 2) * 180) / Math.PI;
    return {
      glint: ramp([[0, 0], [0.08, 1], [0.62, 1], [0.95, 0]], lit),
      glintTransform: `scale(${round(ramp([[0, 0.2], [0.14, 1.15], [0.28, 1], [0.6, 1], [0.95, 0.3]], lit))}) rotate(${round(Math.max(0, lit) * 50)}deg)`,
      grip: `rotate(${round(cableSlope(x))}deg)`,
      place: `translate(${round(x)}px, ${round(cableAt(x))}px)`,
      shadow: shown * ramp([[84, 0], [100, 1]], x),
      shadowPlace: `translate(${round(shadowX)}px, ${round(slope.at(shadowX) + 8)}px) rotate(${round(ground)}deg)`,
      shown,
      sway: `rotate(${round(sway)}deg)`
    };
  });
  const track = <Key extends keyof (typeof frames)[number]>(key: Key) => frames.map((frame) => frame[key]);
  return {
    glint: track('glint'),
    glintTransform: track('glintTransform'),
    grip: track('grip'),
    place: track('place'),
    shadow: track('shadow'),
    shadowPlace: track('shadowPlace'),
    shown: track('shown'),
    sway: track('sway')
  };
});

// The lamp on the top pylon answers every gondola, so it runs on the gap between two of them.
const lampSamples = 40;
const lampTimes = Array.from({ length: lampSamples + 1 }, (_, step) => step / lampSamples);
const lamp = (() => {
  const firstPass = wrap(pass.upper - lead, spacing) / speed;
  const since = lampTimes.map((time) => wrap(time * passSeconds - firstPass, passSeconds));
  return {
    lit: since.map((seconds) => round(ramp([[0, 0], [0.1, 1], [0.9, 1], [1.5, 0]], seconds))),
    ring: since.map((seconds) => round(ramp([[0, 0], [0.08, 0.9], [0.7, 0]], seconds))),
    ringTransform: since.map((seconds) => `scale(${round(ramp([[0, 0.6], [0.7, 2]], seconds))})`)
  };
})();

function stop(color: string, opacity = 1): CSSProperties {
  return { stopColor: color, stopOpacity: opacity };
}

// The far range, left to right: a low peak, the main massif, and a third peak running off the right edge.
const range: readonly Point[] = [
  [-48, 152], [-30, 134], [-12, 124], [4, 112], [20, 100], [30, 108], [40, 104], [54, 120], [70, 126], [86, 140],
  [100, 138], [114, 122], [126, 112], [136, 96], [146, 90], [158, 70], [168, 62], [180, 42], [190, 36], [206, 18],
  [216, 30], [224, 34], [236, 52], [244, 56], [254, 74], [262, 80], [272, 70], [282, 64], [292, 50], [306, 40],
  [316, 52], [326, 56], [340, 72], [352, 78], [364, 92]
];
const rangePath = `${rounded(range, 3)}V190H-48Z`;
// The faces turned away from the light, each from its summit down a spur to the valley.
const shadeFaces: readonly (readonly Point[])[] = [
  [[20, 100], [30, 108], [40, 104], [54, 120], [70, 126], [86, 140], [96, 190], [22, 190], [26, 150], [18, 130], [24, 116]],
  [[206, 18], [216, 30], [224, 34], [236, 52], [244, 56], [254, 74], [262, 80], [268, 190], [214, 190], [218, 150], [208, 118], [216, 90], [204, 62], [212, 40]],
  [[306, 40], [316, 52], [326, 56], [340, 72], [352, 78], [364, 92], [364, 190], [308, 190], [312, 100], [304, 78], [310, 58]],
  [[146, 90], [158, 70], [164, 96], [156, 122], [162, 150], [158, 190], [140, 190], [146, 140], [140, 116]]
];
const snowCaps: readonly (readonly Point[])[] = [
  [[4, 90], [6, 114], [13, 122], [19, 112], [25, 124], [31, 114], [38, 120], [46, 112], [46, 90]],
  [[166, 0], [170, 56], [180, 64], [187, 52], [196, 68], [204, 55], [212, 72], [220, 58], [228, 66], [234, 54], [244, 60], [246, 0]],
  [[284, 20], [286, 64], [294, 72], [300, 60], [306, 74], [312, 62], [320, 72], [326, 62], [334, 68], [334, 20]]
];

const hut = { bay: 80, floor: 207, post: 77, wall: { left: 8, right: 46 } };
const roof = { left: 2, right: 90, thick: 6, topLeft: 147, topRight: 143 };

const pylons = [supports[2], supports[3]].map((support, index) => ({
  foot: slope.at(support.x) + 6,
  lamp: index === 1,
  tilt: cableSlope(support.x),
  top: cableAt(support.x),
  x: support.x
}));
const topPylon = pylons[1];
const wheelOffsets = [-12, -4, 4, 12];
// The station's drive wheel, seen through the open bay; the cable runs over its top.
const drive = { radius: 8, x: 58, y: supports[1].y + 8 };
// A wheel's rim moves at the cable's speed, so a small wheel turns faster than a large one.
function turnSeconds(radius: number): number {
  return round((2 * Math.PI * radius) / speed);
}
const smoke = [
  { delay: 0, duration: 4.2, left: 21, size: 6, top: 119 },
  { delay: 1.5, duration: 4.8, left: 24, size: 8, top: 112 },
  { delay: 2.9, duration: 5.4, left: 20, size: 5, top: 106 }
];

const pines: readonly { drop: number; height: number; x: number }[] = [
  { drop: 3, height: 15, x: 104 },
  { drop: 9, height: 22, x: 120 },
  { drop: 5, height: 20, x: 186 },
  { drop: 13, height: 30, x: 202 },
  { drop: 4, height: 17, x: 222 },
  { drop: 6, height: 22, x: 288 },
  { drop: 14, height: 30, x: 304 },
  { drop: 5, height: 18, x: 326 },
  { drop: 36, height: 28, x: 142 },
  { drop: 58, height: 36, x: 252 },
  { drop: 74, height: 28, x: 282 }
];
const farPines: readonly Point[] = [
  [-34, 9], [-26, 12], [-19, 8], [97, 8], [104, 12], [113, 10], [119, 7], [199, 9], [207, 13], [216, 10],
  [228, 8], [233, 11], [287, 12], [295, 9], [331, 10], [338, 13]
];

const clouds = [
  { delay: 0.4, duration: 11, left: 110, scale: 1, top: 58 },
  { delay: 2.2, duration: 13, left: 18, scale: 0.72, top: 66 }
];

function Pine({ height, x, y }: { height: number; x: number; y: number }): JSX.Element {
  const tiers = [
    { apex: -0.52, base: -0.08, half: 0.33 },
    { apex: -0.77, base: -0.35, half: 0.25 },
    { apex: -1, base: -0.61, half: 0.17 }
  ].map(({ apex, base, half }) => ({ apex: round(apex * height), base: round(base * height), half: round(half * height) }));
  return (
    <g transform={`translate(${round(x)} ${round(y)})`}>
      <ellipse className="fill-violet-200/70" cx={round(height * 0.2)} cy={0.5} rx={round(height * 0.34)} ry={round(height * 0.07)} />
      <rect className="fill-violet-400" height={round(height * 0.12)} width={round(height * 0.08)} x={round(-height * 0.04)} y={round(-height * 0.1)} />
      {tiers.map(({ apex, base, half }) => (
        <g key={apex} strokeLinejoin="round" strokeWidth={1.2}>
          <path className="fill-teal-200 stroke-teal-200" d={`M0 ${apex}L${-half} ${base}H0Z`} />
          <path className="fill-teal-300 stroke-teal-300" d={`M0 ${apex}L${half} ${base}H0Z`} />
          <path
            className="fill-white"
            d={`M0 ${apex - 0.6}L${round(-half * 0.66)} ${round(apex + (base - apex) * 0.66)}L${round(-half * 0.16)} ${round(apex + (base - apex) * 0.5)}L0 ${round(apex + (base - apex) * 0.56)}Z`}
          />
        </g>
      ))}
    </g>
  );
}

// The cabin is drawn 30 wide in its own units, hanging from the grip at the origin, and enlarged as a whole.
const cabinScale = 1.25;

function Cabin({ id, riders, tone }: { id: string; riders: readonly ('left' | 'right')[]; tone: Tone }): JSX.Element {
  return (
    <svg
      className="absolute overflow-visible [filter:drop-shadow(0_1px_1px_--alpha(var(--color-violet-950)/16%))_drop-shadow(0_4px_5px_--alpha(var(--color-violet-950)/14%))]"
      height={44 * cabinScale}
      style={{ left: -20 * cabinScale, top: 0 }}
      viewBox="-20 0 40 44"
      width={40 * cabinScale}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={stop(tone.light)} />
          <stop offset="0.5" style={stop(tone.mid)} />
          <stop offset="1" style={stop(tone.deep)} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" style={stop('var(--color-white)')} />
          <stop offset="1" style={stop('var(--color-sky-100)')} />
        </linearGradient>
        <clipPath id={`${id}-panes`}>
          <path d="M-12 28v-6.5a4.5 4.5 0 0 1 4.5-4.5h6v11zM12 28v-6.5a4.5 4.5 0 0 0-4.5-4.5h-6v11z" />
        </clipPath>
      </defs>

      <path className="stroke-violet-400" d="M0 2V12" strokeLinecap="round" strokeWidth={2.4} />
      <rect className="fill-violet-300" height={3.6} rx={1.2} width={5.2} x={-2.6} y={5.4} />
      <rect className="fill-violet-400" height={2.4} rx={1.2} width={13} x={-6.5} y={11.2} />

      <path d="M-15 21a8 8 0 0 1 8-8h14a8 8 0 0 1 8 8v9a9 9 0 0 1-9 9h-12a9 9 0 0 1-9-9z" fill={`url(#${id}-body)`} />
      <path d="M-13.24 16A8 8 0 0 1-7 13H7a8 8 0 0 1 6.24 3z" style={{ fill: tone.mid }} />
      <path d="M-14.49 33A9 9 0 0 0-6 39H6a9 9 0 0 0 8.49-6z" style={{ fill: tone.edge, fillOpacity: 0.55 }} />
      <path d="M-12 28v-6.5a4.5 4.5 0 0 1 4.5-4.5h6v11zM12 28v-6.5a4.5 4.5 0 0 0-4.5-4.5h-6v11z" fill={`url(#${id}-glass)`} />
      <g clipPath={`url(#${id}-panes)`}>
        <g style={{ fill: tone.edge, fillOpacity: 0.7 }}>
          {riders.includes('left') ? (
            <>
              <circle cx={-6.6} cy={23.4} r={2} />
              <path d="M-10.2 28.4a3.6 3.2 0 0 1 7.2 0z" />
            </>
          ) : null}
          {riders.includes('right') ? (
            <>
              <circle cx={6.9} cy={23.9} r={1.9} />
              <path d="M3.5 28.4a3.4 3 0 0 1 6.8 0z" />
            </>
          ) : null}
        </g>
        <path className="fill-white/70" d="M-11.5 28l3.6-11h2.2l-3.6 11z" />
        <path className="fill-white/45" d="M3 28l3.6-11h1.2l-3.6 11z" />
      </g>
      <path d="M0 29.5V38" strokeLinecap="round" strokeWidth={0.9} style={{ stroke: tone.edge, strokeOpacity: 0.6 }} />
      <path className="stroke-white/85" d="M-11.6 16.6Q-10 14.3-7 14.3H2" fill="none" strokeLinecap="round" strokeWidth={1.2} />
      <rect className="fill-violet-400" height={1.8} rx={0.9} width={13} x={-6.5} y={38.6} />
    </svg>
  );
}

function Sparkle({ size }: { size: number }): JSX.Element {
  return (
    <svg
      className="absolute overflow-visible [filter:drop-shadow(0_0_2px_var(--color-white))]"
      height={size}
      style={{ left: -size / 2, top: -size / 2 }}
      viewBox="-6 -6 12 12"
      width={size}
    >
      <path className="fill-white" d="M0-6C.5-1.6 1.6-.5 6 0 1.6.5.5 1.6 0 6-.5 1.6-1.6.5-6 0-1.6-.5-.5-1.6 0-6Z" />
    </svg>
  );
}

export function CableCar({ frame }: { frame: Frame }): JSX.Element {
  const id = useId();
  const { still } = frame;

  return (
    <Stage>
      <span
        className="absolute rounded-full bg-[radial-gradient(closest-side,var(--color-white)_25%,--alpha(var(--color-white)/0%))]"
        style={{ height: 300, left: 20, top: -50, width: 300 }}
      />
      <motion.span
        className="absolute rounded-full bg-[radial-gradient(closest-side,--alpha(var(--color-amber-200)/70%)_30%,--alpha(var(--color-amber-100)/0%))]"
        style={{ height: 84, left: 100 - 42, top: 62 - 42, width: 84 }}
        {...cycle(still, { opacity: [0.75, 1, 0.75], transform: ['scale(0.94)', 'scale(1.04)', 'scale(0.94)'] }, 6.4, [0, 0.5, 1])}
      />
      <span
        className="absolute rounded-full bg-linear-to-b from-amber-100 to-amber-200 shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/80%)]"
        style={{ height: 30, left: 100 - 15, top: 62 - 15, width: 30 }}
      />

      <svg
        className="absolute overflow-visible"
        fill="none"
        height={stage.height}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${stage.height}`}
        width={field.width}
      >
        <defs>
          <linearGradient id={`${id}-far`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-far-shade`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-violet-300)')} />
            <stop offset="0.8" style={stop('var(--color-violet-200)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-mid`} x1="0" x2="0" y1="90" y2="200">
            <stop offset="0" style={stop('var(--color-violet-50)')} />
            <stop offset="1" style={stop('var(--color-violet-200)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-slope`} x1="0" x2="0" y1="120" y2="250">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-violet-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-column`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-bay`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-violet-400)')} />
            <stop offset="1" style={stop('var(--color-violet-200)')} />
          </linearGradient>
          <clipPath id={`${id}-range`}>
            <path d={rangePath} />
          </clipPath>
          <clipPath id={`${id}-snow`}>
            {snowCaps.map((cap) => (
              <path d={`${rounded(cap, 2.5)}Z`} key={cap[1].join()} />
            ))}
          </clipPath>
        </defs>

        <path d={rangePath} fill={`url(#${id}-far)`} />
        <g clipPath={`url(#${id}-range)`}>
          {shadeFaces.map((face) => (
            <path d={`${rounded(face, 3)}Z`} fill={`url(#${id}-far-shade)`} key={face[0].join()} />
          ))}
          <g clipPath={`url(#${id}-snow)`}>
            <rect className="fill-white" height={190} width={field.width} x={field.left} y={0} />
            {shadeFaces.map((face) => (
              <path className="fill-violet-100" d={`${rounded(face, 3)}Z`} key={face[0].join()} />
            ))}
          </g>
        </g>

        <path d={midRidge.fill} fill={`url(#${id}-mid)`} />
        <path className="stroke-white" d={midRidge.crest} strokeWidth={1.5} />
        {farPines.map(([x, height]) => (
          <g key={x} transform={`translate(${x} ${round(midRidge.at(x) + 1.5)})`}>
            <path className="fill-teal-200" d={`M0 ${-height}L${round(-height * 0.32)} 0H0Z`} />
            <path className="fill-teal-300" d={`M0 ${-height}L${round(height * 0.32)} 0H0Z`} />
          </g>
        ))}

        <path d={slope.fill} fill={`url(#${id}-slope)`} />
        <path className="fill-violet-100/70" d={drift.fill} />

        <rect fill={`url(#${id}-bay)`} height={hut.floor - 148} width={hut.bay - hut.wall.right + 2} x={hut.wall.right - 2} y={148} />

      </svg>

      {routes.map(({ shadow, shadowPlace }, index) => (
        <motion.span
          className="absolute top-0 left-0 size-0"
          key={fleet[index].name}
          style={still ? { opacity: shadow[0], transform: shadowPlace[0] } : undefined}
          {...cycle(still, { opacity: shadow, transform: shadowPlace }, loopSeconds, sampleTimes, { ease: 'linear' })}
        >
          <span className="absolute -top-[3px] -left-[12px] h-[6px] w-[24px] rounded-[50%] bg-violet-300/60" />
        </motion.span>
      ))}

      {/* Everything that stands on the snow is drawn after the gondolas' shadows, so a shadow never lies across a tree. */}
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={stage.height}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${stage.height}`}
        width={field.width}
      >
        {pylons.map(({ foot, top, x }) => (
          <g key={x}>
            <ellipse className="fill-violet-200/70" cx={x + 5} cy={round(foot + 2)} rx={13} ry={3.5} />
            <path d={`M${x - 3} ${round(top + 9)}H${x + 3}L${x + 4.5} ${round(foot)}H${x - 4.5}Z`} fill={`url(#${id}-column)`} />
            <path className="stroke-white/70" d={`M${x - 1.8} ${round(top + 11)}L${x - 3} ${round(foot - 2)}`} strokeLinecap="round" strokeWidth={1} />
            {[0.36, 0.7].map((at) => (
              <rect className="fill-violet-400" height={2.4} key={at} rx={1.2} width={11} x={x - 5.5} y={round(top + 9 + (foot - top - 9) * at)} />
            ))}
            <ellipse className="fill-white" cx={x} cy={round(foot + 0.5)} rx={10} ry={3.6} />
          </g>
        ))}
        <path className="stroke-violet-400" d={`M${topPylon.x} ${round(topPylon.top + 8)}V${round(topPylon.top - 15)}`} strokeLinecap="round" strokeWidth={2.2} />

        {pines.map(({ drop, height, x }) => (
          <Pine height={height} key={x} x={x} y={slope.at(x) + drop} />
        ))}
      </svg>

      {clouds.map(({ delay, duration, left, scale, top }) => (
        <motion.div
          className="absolute"
          key={left}
          style={{ left, top }}
          {...cycle(still, { transform: ['translateX(0px)', 'translateX(5px)', 'translateX(0px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <svg className="block overflow-visible" height={18 * scale} viewBox="0 0 46 18" width={46 * scale}>
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-cloud-${left}`} x1="0" x2="0" y1="2" y2="18">
                <stop offset="0.35" style={stop('var(--color-white)')} />
                <stop offset="1" style={stop('var(--color-violet-100)')} />
              </linearGradient>
            </defs>
            <g fill={`url(#${id}-cloud-${left})`}>
              <rect height={9} rx={4.5} width={46} x={0} y={9} />
              <circle cx={14} cy={10} r={6.5} />
              <circle cx={26} cy={8.5} r={8.5} />
              <circle cx={36} cy={11.5} r={5} />
            </g>
          </svg>
        </motion.div>
      ))}

      {smoke.map(({ delay, duration, left, size, top }) => (
        <motion.span
          className="absolute rounded-full bg-linear-to-b from-white to-violet-200 opacity-90"
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

      <span className="absolute size-0" style={{ left: drive.x, top: drive.y }}>
        <motion.span
          className="absolute block"
          style={{ height: drive.radius * 2, left: -drive.radius, top: -drive.radius, width: drive.radius * 2 }}
          {...cycle(still, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, turnSeconds(drive.radius), [0, 1], { ease: 'linear' })}
        >
          <svg className="block overflow-visible" fill="none" height={drive.radius * 2} viewBox="-8 -8 16 16" width={drive.radius * 2}>
            <circle className="fill-violet-300/60 stroke-violet-100" r={6.9} strokeWidth={2.2} />
            <path className="stroke-violet-100" d="M0-6V6M-5.2-3L5.2 3M-5.2 3L5.2-3" strokeWidth={1.2} />
          </svg>
        </motion.span>
        <span className="absolute -top-[2.5px] -left-[2.5px] size-[5px] rounded-full bg-white shadow-[inset_0_0_0_1.5px_var(--color-violet-200)]" />
      </span>

      {pylons.map(({ tilt, top, x }) => (
        <div className="absolute size-0" key={x} style={{ left: x, top, transform: `rotate(${round(tilt)}deg)` }}>
          <span className="absolute -left-[4px] top-[8px] h-[7px] w-[8px] rounded-[2px] bg-violet-400" />
          <span className="absolute -left-[17px] top-[5.5px] h-[4.5px] w-[34px] rounded-full bg-linear-to-b from-violet-200 to-violet-300 shadow-[inset_0_1px_0_--alpha(var(--color-white)/70%),0_1px_2px_--alpha(var(--color-violet-950)/20%)]" />
          {wheelOffsets.map((offset, index) => (
            <span className="absolute size-0" key={offset} style={{ left: offset, top: 3.8, transform: `rotate(${index * 70}deg)` }}>
              <motion.span
                className="absolute -top-[3px] -left-[3px] size-[6px] rounded-full bg-violet-400 shadow-[inset_0_0_0_1px_var(--color-violet-300)]"
                {...cycle(still, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, turnSeconds(3), [0, 1], { ease: 'linear' })}
              >
                <span className="absolute top-[0.75px] left-[2.25px] size-[1.5px] rounded-full bg-white" />
              </motion.span>
            </span>
          ))}
        </div>
      ))}

      <span className="absolute size-0" style={{ left: topPylon.x, top: topPylon.top - 19 }}>
        <motion.span
          className="absolute -top-[8px] -left-[8px] size-4 rounded-full bg-emerald-300"
          style={still ? { opacity: lamp.ring[0], transform: lamp.ringTransform[0] } : undefined}
          {...cycle(still, { opacity: lamp.ring, transform: lamp.ringTransform }, passSeconds, lampTimes, { ease: 'linear' })}
        />
        <span className="absolute -top-[4.5px] -left-[4.5px] size-[9px] rounded-full bg-emerald-200 shadow-[0_0_0_2px_var(--color-white),0_1px_3px_2px_--alpha(var(--color-violet-950)/14%)]" />
        <motion.span
          className="absolute -top-[4.5px] -left-[4.5px] size-[9px] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-emerald-200),var(--color-emerald-400))]"
          style={still ? { opacity: lamp.lit[0] } : undefined}
          {...cycle(still, { opacity: lamp.lit }, passSeconds, lampTimes, { ease: 'linear' })}
        />
      </span>

      <svg className="absolute inset-0 overflow-visible" fill="none" height={stage.height} viewBox={`0 0 ${stage.width} ${stage.height}`} width={stage.width}>
        <path className="stroke-violet-400" d={cablePath} strokeLinecap="round" strokeWidth={1.5} />
      </svg>

      {routes.map(({ glint, glintTransform, grip, place, shown, sway }, index) => {
        const { name, riders, tone } = fleet[index];
        return (
          <motion.div
            className="absolute top-0 left-0 size-0"
            key={name}
            style={still ? { opacity: shown[0], transform: place[0] } : undefined}
            {...cycle(still, { opacity: shown, transform: place }, loopSeconds, sampleTimes, { ease: 'linear' })}
          >
            <motion.div
              className="absolute top-0 left-0 size-0"
              style={still ? { transform: sway[0] } : undefined}
              {...cycle(still, { transform: sway }, loopSeconds, sampleTimes, { ease: 'linear' })}
            >
              <Cabin id={`${id}-${name}`} riders={riders} tone={tone} />
              <motion.span
                className="absolute size-0"
                style={{ left: -13.5 * cabinScale, top: 14.5 * cabinScale, ...(still ? { opacity: glint[0], transform: glintTransform[0] } : undefined) }}
                {...cycle(still, { opacity: glint, transform: glintTransform }, loopSeconds, sampleTimes, { ease: 'linear' })}
              >
                <Sparkle size={18} />
                <span className="absolute size-0" style={{ left: 9, top: -8 }}>
                  <Sparkle size={8} />
                </span>
              </motion.span>
            </motion.div>
            <motion.span
              className="absolute top-0 left-0 size-0"
              style={still ? { transform: grip[0] } : undefined}
              {...cycle(still, { transform: grip }, loopSeconds, sampleTimes, { ease: 'linear' })}
            >
              <span className="absolute -top-[3.5px] -left-[6px] h-[5.5px] w-[12px] rounded-[2.5px] bg-linear-to-b from-violet-300 to-violet-400 shadow-[inset_0_1px_0_--alpha(var(--color-white)/60%)]" />
            </motion.span>
          </motion.div>
        );
      })}

      <svg
        className="absolute inset-0 overflow-visible [filter:drop-shadow(0_1px_1px_--alpha(var(--color-violet-950)/10%))_drop-shadow(0_6px_8px_--alpha(var(--color-violet-950)/10%))]"
        fill="none"
        height={stage.height}
        viewBox={`0 0 ${stage.width} ${stage.height}`}
        width={stage.width}
      >
        <defs>
          <linearGradient id={`${id}-wall`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-violet-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-roof`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-violet-300)')} />
            <stop offset="1" style={stop('var(--color-violet-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-pane`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-100)')} />
            <stop offset="1" style={stop('var(--color-amber-200)')} />
          </linearGradient>
        </defs>

        <rect className="fill-violet-200" height={4} rx={1.5} width={92} x={2} y={hut.floor - 2} />
        <rect className="fill-white/80" height={1} rx={0.5} width={90} x={3} y={hut.floor - 2} />

        <rect fill={`url(#${id}-wall)`} height={hut.floor - 2 - 150} width={hut.wall.right - hut.wall.left} x={hut.wall.left} y={150} />
        {[160, 165, 185, 190, 195].map((y) => (
          <rect className="fill-violet-100" height={1} key={y} width={hut.wall.right - hut.wall.left} x={hut.wall.left} y={y} />
        ))}
        <rect className="fill-violet-200" height={hut.floor - 2 - 150} width={2} x={hut.wall.right - 2} y={150} />
        <rect className="fill-violet-200" height={7} width={hut.wall.right - hut.wall.left} x={hut.wall.left} y={hut.floor - 9} />
        <rect className="fill-white/70" height={1} width={hut.wall.right - hut.wall.left} x={hut.wall.left} y={hut.floor - 9} />

        <rect className="fill-white" height={18} rx={2.5} width={20} x={16} y={166} />
        <rect fill={`url(#${id}-pane)`} height={14} rx={1.5} width={16} x={18} y={168} />
        <path className="stroke-white" d="M26 168V182M18 175H34" strokeWidth={1.5} />
        <rect className="fill-violet-300" height={2} rx={1} width={24} x={14} y={184} />

        <path className="stroke-pink-300" d="M39.4 204L41 176.5" strokeLinecap="round" strokeWidth={1.7} />
        <path className="stroke-amber-300" d="M42.4 204L43.2 178.5" strokeLinecap="round" strokeWidth={1.7} />

        <rect className="fill-violet-100" height={hut.floor - 2 - 148} width={3} x={hut.post} y={148} />
        <rect className="fill-violet-300" height={hut.floor - 2 - 148} width={1} x={hut.post + 2} y={148} />

        <rect fill={`url(#${id}-wall)`} height={18} width={8} x={17} y={129} />
        <rect className="fill-violet-200" height={18} width={2.5} x={22.5} y={129} />
        <rect className="fill-violet-300" height={2} width={8} x={17} y={131} />
        <rect className="fill-white" height={3.5} rx={1.75} width={11} x={15.5} y={127} />

        <path
          d={`M${roof.left} ${roof.topLeft}L${roof.right} ${roof.topRight}V${roof.topRight + roof.thick}L${roof.left} ${roof.topLeft + roof.thick}Z`}
          fill={`url(#${id}-roof)`}
          stroke={`url(#${id}-roof)`}
          strokeLinejoin="round"
          strokeWidth={2}
        />
        <path
          className="fill-white"
          d={`M${roof.left - 1} ${roof.topLeft}C${roof.left - 2} ${roof.topLeft - 6} ${roof.left + 6} ${roof.topLeft - 6.5} ${roof.left + 14} ${roof.topLeft - 6.2}L${roof.right - 12} ${roof.topRight - 6}C${roof.right - 4} ${roof.topRight - 6.4} ${roof.right + 2} ${roof.topRight - 5} ${roof.right + 1} ${roof.topRight + 1}C${roof.right + 1} ${roof.topRight + 3.5} ${roof.right - 3} ${roof.topRight + 3.5} ${roof.right - 3.5} ${roof.topRight + 0.5}Z`}
        />
      </svg>
    </Stage>
  );
}
