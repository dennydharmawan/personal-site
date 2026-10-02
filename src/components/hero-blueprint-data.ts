type Rect = { x: number; y: number; w: number; h: number };
export type PartId = 'intake' | 'queue' | 'process' | 'route' | 'settle' | 'revenue';
export type Part = {
  id: PartId;
  label: string;
  footprint: Rect;
  callout: { x: number; leadTo: number };
  panX: number;
  dwellMs: number;
};

export const calloutY = 52;

export const parts: readonly Part[] = [
  { id: 'intake', label: 'INTAKE', footprint: { x: 44, y: 84, w: 162, h: 250 }, callout: { x: 125, leadTo: 88 }, panX: 125, dwellMs: 2400 },
  { id: 'queue', label: 'QUEUE', footprint: { x: 86, y: 226, w: 322, h: 44 }, callout: { x: 250, leadTo: 240 }, panX: 250, dwellMs: 2800 },
  { id: 'process', label: 'PROCESS', footprint: { x: 406, y: 132, w: 206, h: 202 }, callout: { x: 510, leadTo: 138 }, panX: 510, dwellMs: 2600 },
  { id: 'route', label: 'ROUTE', footprint: { x: 614, y: 152, w: 166, h: 162 }, callout: { x: 660, leadTo: 219 }, panX: 700, dwellMs: 2600 },
  { id: 'settle', label: 'SETTLE', footprint: { x: 786, y: 136, w: 72, h: 198 }, callout: { x: 821, leadTo: 142 }, panX: 821, dwellMs: 2200 },
  { id: 'revenue', label: 'REVENUE', footprint: { x: 900, y: 70, w: 260, h: 264 }, callout: { x: 922, leadTo: 76 }, panX: 1040, dwellMs: 2600 }
];

// Footprints overlap where the belt runs through the intake legs; the smallest one names the part.
export function partAtPoint(x: number, y: number): Part | null {
  let hit: Part | null = null;
  for (const part of parts) {
    const f = part.footprint;
    if (x > f.x && x < f.x + f.w && y > f.y && y < f.y + f.h && (!hit || f.w * f.h < hit.footprint.w * hit.footprint.h)) hit = part;
  }
  return hit;
}

// A focused part is marked by its footprint's four corners, the way a drafting tool shows a selection.
export function brackets({ x, y, w, h }: Rect) {
  const arm = 10;
  const r = x + w;
  const b = y + h;
  return `M${x} ${y + arm} V${y} H${x + arm} M${r - arm} ${y} H${r} V${y + arm} M${r} ${b - arm} V${b} H${r - arm} M${x + arm} ${b} H${x} V${b - arm}`;
}

// Tall enough for the system dimension and the bottom crop marks under it.
export const sheetHeight = 420;
export const ground = { y: 330, x1: 40, x2: 1160 };

export const sheetLabel =
  'Blueprint of a six-stage transaction pipeline. Intake takes mixed events, files, and API calls. A queue keeps them ordered and retries them. Process runs checkpointed, idempotent workers. Route sends each item to a priority, standard, or batch lane. Settle acknowledges each one. Revenue charts each period\'s settled volume, compounding period over period.';

export const draw = { consStep: 35, consMs: 500, partAt: (i: number) => 200 + i * 160, pathStep: 28, dimsAt: 1450, calloutsAt: 1650 };

export const lanes = [172, 233, 294] as const;
export const laneAngles = [-35, 0, 35] as const;
export const laneOrder = [1, 0, 1, 2] as const;
export const rollerXs = Array.from({ length: 10 }, (_, i) => 114 + i * 28);
export const gearSpecs = [470, 506, 542].map((x, i) => ({ x, dir: i % 2 ? -1 : 1, offset: i % 2 ? 20 : 0 }));
type Shape = 'c' | 't' | 's';
export const jumbleSpecs: ReadonlyArray<readonly [number, number, Shape]> = [[92, 104, 'c'], [118, 100, 't'], [150, 106, 's'], [108, 126, 's'], [136, 128, 'c'], [124, 150, 't']];

export const housing = { x: 420, y: 150, w: 180, h: 180 };
// The ports stick out 8 past each housing wall.
export const housingWithPorts = { x: housing.x - 8, y: housing.y, w: housing.w + 16, h: housing.h };
export const hub = { x: 660, y: 233, r: 14 };
export const bay = (ly: number) => ({ x: 790, y: ly - 18, w: 62, h: 36 });
export const thresholds = { processedX: 510, vaneX: hub.x - 30 };

type Point = readonly [number, number];

export const chart = {
  axisX: 922,
  top: 76,
  baseY: ground.y,
  ticks: [280, 230, 180, 130, 80],
  slots: 7,
  pitch: 31,
  barW: 20,
  targetH: 250,
  growth: 1.22,
  itemsPerPeriod: 7,
  startItems: 0,
  clipX: 923,
  closeRate: 4,
  shiftS: 0.8,
  trendLift: 6
};
const current = chart.slots - 1;
export const slotX = (i: number) => 940 + i * chart.pitch;
// A geometric series, so every bar is the next one divided by the growth factor.
const barH = (i: number) => chart.targetH / chart.growth ** (current - i);
export const startShown = (chart.startItems / chart.itemsPerPeriod) * chart.targetH;

export type BarFrame = { x: number; y: number; h: number; opacity: number; full: boolean };
export type ChartFrame = { bars: BarFrame[]; trend: string; head: string };

const lerp = ([x0, y0]: Point, [x1, y1]: Point, k: number): Point => [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
const fmt = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;

// shown is the current bar's height, reach how far the trend has drawn toward it once full (0..1),
// and shift how far every bar has slid one slot left (0..1). The frame at shift 1 matches the frame
// at shift 0 with each bar one slot over, which is what lets the engine snap back without a jump.
export function chartFrame(shown: number, reach: number, shift: number): ChartFrame {
  const scale = chart.growth ** -shift;
  const bars = Array.from({ length: chart.slots }, (_, j): BarFrame => {
    const h = (j < current ? barH(j) : shown) * scale;
    return { x: slotX(j) - shift * chart.pitch, y: chart.baseY - h, h, opacity: j === 0 ? 1 - shift : 1, full: j < current || reach > 0 };
  });
  const tops = bars.map(({ x, h }): Point => [x + chart.barW / 2, chart.baseY - h - chart.trendLift]);
  const trend = tops.slice(0, current);
  if (reach > 0) trend.push(lerp(tops[current - 1], tops[current], Math.min(1, reach)));
  // The outgoing point retracts into its neighbour as its bar fades, so the snap drops no segment.
  trend[0] = lerp(trend[0], trend[1], shift);
  // The arrowhead rides the trend's tip, so revenue only ever points up at the latest settled period.
  const [x0, y0] = trend[trend.length - 2];
  const [x1, y1] = trend[trend.length - 1];
  const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return {
    bars,
    trend: trend.map(fmt).join(' '),
    head: `translate(${fmt([x1, y1])}) rotate(${angle.toFixed(1)})`
  };
}
export const initialChart = chartFrame(startShown, 0, 0);

export const tokenPool = 12;

export const ring = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy}`;
export const shapePaths: Record<Shape, string> = { c: ring(0, 0, 6), t: 'M0 -7 L7 5 H-7 Z', s: 'M-6 -6 H6 V6 H-6 Z' };

function gearPath(r: number, teeth: number) {
  const n = teeth * 4;
  let d = '';
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2;
    const rr = k % 4 < 2 ? r : r * 0.78;
    d += `${k ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `;
  }
  return `${d}Z`;
}
export const gearD = gearPath(18, 9);

// Covers only the commands this drawing uses; every arc in it is a semicircle.
function pathLength(d: string) {
  const tokens = d.match(/[MHVLAZ]|-?\d*\.?\d+/gi) ?? [];
  let i = 0;
  let cmd = 'M';
  let x = 0, y = 0, sx = 0, sy = 0, length = 0;
  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    if (cmd === 'M') {
      x = sx = num();
      y = sy = num();
      cmd = 'L';
    } else if (cmd === 'L') {
      const nx = num(), ny = num();
      length += Math.hypot(nx - x, ny - y);
      x = nx;
      y = ny;
    } else if (cmd === 'H') {
      const nx = num();
      length += Math.abs(nx - x);
      x = nx;
    } else if (cmd === 'V') {
      const ny = num();
      length += Math.abs(ny - y);
      y = ny;
    } else if (cmd === 'A') {
      const r = num();
      i += 4;
      x = num();
      y = num();
      length += Math.PI * r;
    } else {
      length += Math.hypot(sx - x, sy - y);
      x = sx;
      y = sy;
    }
  }
  return length;
}

// A pen draws at roughly constant speed, so duration grows with the square root of length.
export const penMs = (d: string) => Math.min(720, Math.max(240, 34 * Math.sqrt(pathLength(d))));
export const finsD = `${Array.from({ length: 9 }, (_, i) => `M${446 + i * 16} 150 V138`).join(' ')} M440 138 H580`;
export const routePipes = ['M608 233 H648', ...lanes.map((ly) => `M672 233 L700 ${ly} H790`)];

export const dimensions = [{ x1: 48, x2: 852, y: 372, label: 'SYSTEM' }];

export const cropMarks = ['M14 34 V14 H34', 'M1166 14 H1186 V34', `M1186 ${sheetHeight - 34} V${sheetHeight - 14} H1166`, `M34 ${sheetHeight - 14} H14 V${sheetHeight - 34}`];
export const constructionLines = [
  ...[90, 233, 330].map((y) => `M30 ${y} H1170`),
  ...[125, 420, 600, 660, 821, 922].map((x) => `M${x} 30 V${sheetHeight - 30}`)
];
type Route = { points: readonly Point[]; lengths: number[]; total: number };

function makeRoute(points: readonly Point[]): Route {
  const lengths = points.slice(1).map(([x, y], i) => Math.hypot(x - points[i][0], y - points[i][1]));
  return { points, lengths, total: lengths.reduce((sum, length) => sum + length, 0) };
}

export function pointAt({ points, lengths }: Route, distance: number): Point {
  let rest = distance;
  for (let i = 0; i < lengths.length; i++) {
    if (rest <= lengths[i] || i === lengths.length - 1) {
      const k = Math.min(1, rest / lengths[i]);
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    rest -= lengths[i];
  }
  return points[points.length - 1];
}

// The knee at 672 leaves the hub along the pipe instead of cutting its corner; each route ends at its bay center.
export const routes = lanes.map((ly) => makeRoute([[125, 200], [125, 233], [660, 233], [672, 233], [700, ly], [821, ly]]));
