type Rect = { x: number; y: number; w: number; h: number };
export type PartId = 'intake' | 'queue' | 'process' | 'route' | 'settle' | 'growth';
export type Part = {
  id: PartId;
  label: string;
  footprint: Rect;
  callout: { x: number; y: number; leadTo: number };
  panX: number;
  dwellMs: number;
};

export const parts: readonly Part[] = [
  { id: 'intake', label: 'INTAKE', footprint: { x: 52, y: 84, w: 146, h: 250 }, callout: { x: 125, y: 50, leadTo: 90 }, panX: 125, dwellMs: 3200 },
  { id: 'queue', label: 'QUEUE', footprint: { x: 88, y: 236, w: 324, h: 30 }, callout: { x: 250, y: 118, leadTo: 240 }, panX: 250, dwellMs: 3800 },
  { id: 'process', label: 'PROCESS', footprint: { x: 406, y: 132, w: 206, h: 202 }, callout: { x: 510, y: 104, leadTo: 138 }, panX: 510, dwellMs: 3400 },
  { id: 'route', label: 'ROUTE', footprint: { x: 604, y: 150, w: 186, h: 164 }, callout: { x: 660, y: 150, leadTo: 219 }, panX: 700, dwellMs: 3400 },
  { id: 'settle', label: 'SETTLE', footprint: { x: 786, y: 150, w: 72, h: 164 }, callout: { x: 821, y: 104, leadTo: 154 }, panX: 821, dwellMs: 2800 },
  { id: 'growth', label: 'GROWTH', footprint: { x: 901, y: 46, w: 273, h: 290 }, callout: { x: 1000, y: 34, leadTo: 50 }, panX: 1040, dwellMs: 3200 }
];

// Tall enough for the system dimension at y 392 and the bottom crop marks under it.
export const sheetHeight = 420;

export const sheetLabel =
  'Blueprint of a six-stage transaction pipeline. Intake takes mixed events, files, and API calls. A queue keeps them ordered and retries them. Process runs checkpointed, idempotent workers. Route sends each item to a priority, standard, or batch lane. Settle acknowledges each one. Growth charts the output compounding over time.';

export const draw = { consStep: 35, consMs: 500, partAt: (i: number) => 200 + i * 160, pathStep: 28, dimsAt: 1450, calloutsAt: 1650 };

export const lanes = [172, 233, 294] as const;
export const laneAngles = [-35, 0, 35] as const;
export const laneOrder = [1, 0, 1, 2] as const;
export const rollerXs = Array.from({ length: 10 }, (_, i) => 114 + i * 28);
export const gearSpecs = [470, 506, 542].map((x, i) => ({ x, dir: i % 2 ? -1 : 1, offset: i % 2 ? 20 : 0 }));
type Shape = 'c' | 't' | 's';
export const jumbleSpecs: ReadonlyArray<readonly [number, number, Shape]> = [[92, 104, 'c'], [118, 100, 't'], [150, 106, 's'], [108, 126, 's'], [136, 128, 'c'], [124, 150, 't']];
export const barTargets = Array.from({ length: 8 }, (_, i) => 26 + i * i * 3.6);
export const barX = (i: number) => 942 + i * 26;
export const stillHeights = barTargets.map((target, i) => (i < 5 ? target : 0));
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
export const growthGridD = [112, 152, 192, 232, 272].map((y) => `M930 ${y} H1152`).join(' ');

export const dimensions = [
  { x1: 100, x2: 400, y: 360, label: 'QUEUE · 300' },
  { x1: 420, x2: 600, y: 360, label: 'PROCESS · 180' },
  { x1: 60, x2: 860, y: 392, label: 'SYSTEM · 800' }
];

export const cropMarks = ['M14 34 V14 H34', 'M1166 14 H1186 V34', `M1186 ${sheetHeight - 34} V${sheetHeight - 14} H1166`, `M34 ${sheetHeight - 14} H14 V${sheetHeight - 34}`];
export const constructionLines = [
  ...[90, 150, 233, 330].map((y) => `M30 ${y} H1170`),
  ...[100, 420, 600, 660, 790, 905].map((x) => `M${x} 30 V${sheetHeight - 30}`)
];
type Point = readonly [number, number];
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

export const routes = lanes.map((ly) => makeRoute([[125, 200], [125, 233], [660, 233], [700, ly], [905, ly]]));
