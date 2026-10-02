import { useEffect, useId, useReducer, useRef, useState } from 'react';
import type { CSSProperties, JSX, PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  bay,
  brackets,
  calloutY,
  chart,
  chartFrame,
  constructionLines,
  cropMarks,
  dimensions,
  draw,
  finsD,
  gearD,
  gearSpecs,
  ground,
  housing,
  housingWithPorts,
  hub,
  initialChart,
  jumbleSpecs,
  laneAngles,
  laneOrder,
  lanes,
  partAtPoint,
  parts,
  penMs,
  pointAt,
  ring,
  rollerXs,
  routePipes,
  routes,
  shapePaths,
  sheetHeight,
  sheetLabel,
  startShown,
  thresholds,
  tokenPool
} from '@/components/hero-blueprint-data';
import type { ChartFrame, Part, PartId } from '@/components/hero-blueprint-data';

function timing(delay: number, duration?: number, fillAt?: number): CSSProperties {
  const style: Record<string, string> = { '--d': `${Math.round(delay)}ms` };
  if (duration !== undefined) style['--t'] = `${Math.round(duration)}ms`;
  if (fillAt !== undefined) style['--f'] = `${Math.round(fillAt)}ms`;
  return style as CSSProperties;
}

function createPen(start: number, step = draw.pathStep, fixedMs?: number) {
  let n = 0;
  let end = start;
  return {
    draw(d: string, className: string) {
      const delay = start + n * step;
      const ms = fixedMs ?? penMs(d);
      const fillAt = className.includes('bp-solid') ? delay + ms * 0.7 : undefined;
      end = Math.max(end, delay + ms);
      return <path key={n++} d={d} pathLength={1} className={`${className} bp-draw`} style={timing(delay, ms, fillAt)} />;
    },
    // Each bore draws in step with its outline, so a pipe grows as a hollow tube with an open end.
    // Every outline goes under every bore, so pipes that share a junction merge into one fork.
    pipes(ds: readonly string[]) {
      const runs = ds.map((d) => {
        const delay = start + n * step;
        const ms = fixedMs ?? penMs(d);
        end = Math.max(end, delay + ms);
        return { d, key: n++, style: timing(delay, ms) };
      });
      return (
        <g key={`pipes-${runs[0].key}`}>
          {runs.map(({ d, key, style }) => <path key={`o${key}`} d={d} pathLength={1} className="bp-pipe-o bp-draw" style={style} />)}
          {runs.map(({ d, key, style }) => <path key={`i${key}`} d={d} pathLength={1} className="bp-pipe-i bp-draw" style={style} />)}
        </g>
      );
    },
    end: () => end
  };
}

type Ids = { hatch: string; arrow: string; clip: string; tokens: string; prefix: string };
type ArtProps = { start: number; ids: Ids };

function IntakeArt({ start }: ArtProps) {
  const pen = createPen(start);
  return (
    <>
      {pen.draw('M56 90 L48 330 M194 90 L202 330 M49 300 H201', 'bp-ink bp-thin')}
      {pen.draw('M60 90 H190 L140 170 H110 Z', 'bp-ink bp-solid')}
      {pen.draw('M50 90 H200', 'bp-ink bp-heavy')}
      {pen.draw('M110 170 V198 M140 170 V198', 'bp-ink')}
      {jumbleSpecs.map(([x, y, shape]) => (
        <g key={`${x}-${y}`} data-bp="jumble" transform={`translate(${x} ${y})`}>
          {pen.draw(shapePaths[shape], 'bp-ink bp-thin')}
        </g>
      ))}
    </>
  );
}

function QueueArt({ start }: ArtProps) {
  const pen = createPen(start);
  return (
    <>
      {pen.draw('M236 262 V330 M380 262 V330 M236 300 H380', 'bp-ink bp-thin')}
      {pen.draw('M100 240 H400 A11 11 0 0 1 400 262 H100 A11 11 0 0 1 100 240 Z', 'bp-ink bp-solid')}
      {rollerXs.map((x) => (
        <g key={x} data-bp="roller">
          {pen.draw(ring(x, 251, 7), 'bp-ink bp-thin')}
          {pen.draw(`M${x - 7} 251 H${x + 7}`, 'bp-ink bp-thin')}
        </g>
      ))}
    </>
  );
}

function ProcessArt({ start, ids }: ArtProps) {
  const pen = createPen(start);
  const walls = pen.draw('M420 150 H600 V330 H420 Z', 'bp-ink');
  const chamber = pen.draw('M440 190 H580 V280 H440 Z', 'bp-ink bp-solid');
  const ports = pen.draw('M412 224 H424 V242 H412 Z M596 224 H608 V242 H596 Z', 'bp-ink bp-solid');
  const fins = pen.draw(finsD, 'bp-ink bp-thin');
  const plate = pen.draw('M466 296 H554 V316 H466 Z', 'bp-ink bp-solid');
  const gears = gearSpecs.map(({ x, offset }) => (
    <g key={x} data-bp="gear" transform={`translate(${x} 235) rotate(${offset})`}>
      {pen.draw(gearD, 'bp-ink bp-solid')}
      {pen.draw(ring(0, 0, 5), 'bp-ink bp-thin')}
    </g>
  ));
  const done = timing(pen.end());
  return (
    <>
      <rect x={420} y={150} width={180} height={180} fill={`url(#${ids.hatch})`} className="bp-fade" style={done} />
      {walls}
      {chamber}
      {ports}
      {fins}
      {plate}
      {gears}
      <text x={510} y={310} textAnchor="middle" className="bp-plate bp-fade" style={done}>PROC-01</text>
      <g className="bp-fade" style={done}>
        <circle cx={592} cy={162} r={4.5} className="bp-lamp" />
        <circle data-bp="proc-lamp" cx={592} cy={162} r={4.5} className="bp-glow" opacity={0} />
      </g>
    </>
  );
}

function RouteArt({ start }: ArtProps) {
  const pen = createPen(start);
  const pipes = pen.pipes(routePipes);
  const hub = pen.draw(ring(660, 233, 14), 'bp-ink bp-solid');
  const arm = pen.draw('M0 0 H12', 'bp-ink');
  const done = timing(pen.end());
  return (
    <>
      {pipes}
      {hub}
      <g data-bp="vane" transform="translate(660 233)">
        {arm}
        <circle r={3} className="bp-dot bp-fade" style={done} />
      </g>
    </>
  );
}

function SettleArt({ start }: ArtProps) {
  const pen = createPen(start);
  // The posts draw first so each bay's white fill hides them where they pass behind it.
  const rack = pen.draw('M800 142 V330 M842 142 V330', 'bp-ink bp-thin');
  const cap = pen.draw('M794 142 H848', 'bp-ink');
  const bays = lanes.map((ly) => ({
    ly,
    box: pen.draw(`M790 ${ly - 18} H852 V${ly + 18} H790 Z`, 'bp-ink bp-solid'),
    slot: pen.draw(`M798 ${ly + 10} H830`, 'bp-ink bp-thin')
  }));
  const done = timing(pen.end());
  return (
    <>
      {rack}
      {cap}
      {bays.map(({ ly, box, slot }) => (
        <g key={ly}>
          {box}
          {slot}
          <g className="bp-fade" style={done}>
            <circle data-bp="halo" cx={842} cy={ly - 8} r={9} className="bp-glow" opacity={0} />
            <circle cx={842} cy={ly - 8} r={4} className="bp-lamp" />
            <circle data-bp="glow" cx={842} cy={ly - 8} r={4} className="bp-glow" opacity={0} />
          </g>
        </g>
      ))}
    </>
  );
}

// The chart paints its opening frame on the server, so the engine inherits real attributes.
function RevenueArt({ start, ids }: ArtProps) {
  const pen = createPen(start);
  const { axisX, top, baseY } = chart;
  const axis = pen.draw(`M${axisX} ${top} V${baseY}`, 'bp-ink bp-thin');
  const ticks = pen.draw(chart.ticks.map((y) => `M${axisX} ${y} H${axisX + 5}`).join(' '), 'bp-tick');
  const barsAt = start + 120;
  const trendAt = barsAt + (initialChart.bars.length - 1) * 60 + 200;
  const trendMs = 420;
  const settled = timing(trendAt + trendMs);
  return (
    <>
      {axis}
      {ticks}
      <g clipPath={`url(#${ids.clip})`}>
        {initialChart.bars.map(({ x, y, h, full }, i) => (
          <rect key={i} data-bp="bar" x={x} y={y} width={chart.barW} height={h} className={cn('bp-bar bp-rise-y', full && 'is-full')} style={timing(barsAt + i * 60, 380)} />
        ))}
        <polyline data-bp="trend" points={initialChart.trend} pathLength={1} className="bp-trend bp-draw" style={timing(trendAt, trendMs)} />
        <g data-bp="head" transform={initialChart.head}>
          <path d="M2 0 L-7 -4.5 L-7 4.5 Z" className="bp-trend-head bp-fade" style={settled} />
        </g>
      </g>
    </>
  );
}

const partArt: Record<PartId, (props: ArtProps) => JSX.Element> = {
  intake: IntakeArt,
  queue: QueueArt,
  process: ProcessArt,
  route: RouteArt,
  settle: SettleArt,
  revenue: RevenueArt
};

// A dashed line cannot draw itself with a dash offset, so a solid stroke in a mask draws instead.
function MaskedStroke({ id, d, className, maskClassName, style }: { id: string; d: string; className: string; maskClassName: string; style?: CSSProperties }) {
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1200} height={sheetHeight}>
        <path d={d} pathLength={1} strokeWidth={8} className={`fill-none stroke-white ${maskClassName}`} style={style} />
      </mask>
      <path d={d} className={className} mask={`url(#${id})`} />
    </>
  );
}

/* ---------- tour ---------- */

type TourState =
  | { kind: 'drafting' }
  | { kind: 'establishing' }
  | { kind: 'touring'; index: number }
  | { kind: 'resting' }
  | { kind: 'hovering'; id: PartId }
  | { kind: 'lingering'; id: PartId }
  | { kind: 'pinned'; id: PartId };

// auto is false under reduced motion: nothing advances on its own, and a released part returns to rest.
type Tour = { auto: boolean; at: TourState };
type TourEvent =
  | { type: 'drawn'; auto: boolean }
  | { type: 'elapsed' }
  | { type: 'hover'; id: PartId }
  | { type: 'leave' }
  | { type: 'tap'; id: PartId };

const partIndex = (id: PartId) => parts.findIndex((part) => part.id === id);

function afterHold({ auto, at }: Tour): TourState {
  switch (at.kind) {
    case 'establishing':
    case 'resting':
      return { kind: 'touring', index: 0 };
    case 'touring':
      return at.index + 1 < parts.length ? { kind: 'touring', index: at.index + 1 } : { kind: 'resting' };
    case 'lingering':
    case 'pinned':
      return auto ? { kind: 'touring', index: (partIndex(at.id) + 1) % parts.length } : { kind: 'resting' };
    default:
      return at;
  }
}

function holdMs({ auto, at }: Tour): number | null {
  switch (at.kind) {
    case 'establishing':
      return 750;
    case 'touring':
      return parts[at.index].dwellMs;
    case 'resting':
      return auto ? 3000 : null;
    case 'lingering':
      return 600;
    case 'pinned':
      return 6000;
    default:
      return null;
  }
}

function tourReducer(tour: Tour, event: TourEvent): Tour {
  const { at } = tour;
  if (at.kind === 'drafting') {
    return event.type === 'drawn' ? { auto: event.auto, at: event.auto ? { kind: 'establishing' } : { kind: 'resting' } } : tour;
  }
  switch (event.type) {
    case 'elapsed':
      return { ...tour, at: afterHold(tour) };
    case 'hover':
      return at.kind === 'hovering' && at.id === event.id ? tour : { ...tour, at: { kind: 'hovering', id: event.id } };
    case 'leave':
      return at.kind === 'hovering' ? { ...tour, at: { kind: 'lingering', id: at.id } } : tour;
    case 'tap':
      return { ...tour, at: { kind: 'pinned', id: event.id } };
    default:
      return tour;
  }
}

function focusOf(at: TourState): Part | null {
  if (at.kind === 'touring') return parts[at.index];
  if (at.kind === 'hovering' || at.kind === 'lingering' || at.kind === 'pinned') return parts[partIndex(at.id)];
  return null;
}

/* ---------- engine ---------- */

const tokenSpeed = 170;
const spawnEvery = 0.55;
// The drop from the hopper neck to the belt, the first leg of every route.
const dropLength = 33;
// Processed tokens shrink inside the masked chamber so they ride the bore instead of filling it.
const pipeScale = 0.72;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type EngineNodes = {
  rollers: SVGGElement[];
  gears: SVGGElement[];
  jumble: SVGGElement[];
  vane: SVGGElement;
  processLamp: SVGCircleElement;
  glows: SVGCircleElement[];
  halos: SVGCircleElement[];
  bars: SVGRectElement[];
  trend: SVGPolylineElement;
  head: SVGGElement;
  tokens: SVGGElement[];
};

function bindNodes(svg: SVGSVGElement): EngineNodes {
  const all = <T extends Element>(name: string) => Array.from(svg.querySelectorAll<T>(`[data-bp="${name}"]`));
  return {
    rollers: all('roller'),
    gears: all('gear'),
    jumble: all('jumble'),
    vane: all<SVGGElement>('vane')[0],
    processLamp: all<SVGCircleElement>('proc-lamp')[0],
    glows: all('glow'),
    halos: all('halo'),
    bars: all('bar'),
    trend: all<SVGPolylineElement>('trend')[0],
    head: all<SVGGElement>('head')[0],
    tokens: all('token')
  };
}

// Most engine values hold still between frames, so a write that would repeat the last value is skipped.
const written = new WeakMap<Element, Record<string, string>>();
function write(el: Element, name: string, value: string) {
  let attrs = written.get(el);
  if (!attrs) written.set(el, (attrs = {}));
  if (attrs[name] === value) return;
  attrs[name] = value;
  el.setAttribute(name, value);
}

// The series is geometric, so after a shift the chart looks exactly as it did before one, and this is
// its whole state.
type Chart =
  | { kind: 'filling' }
  | { kind: 'closing'; reach: number }
  | { kind: 'shifting'; elapsed: number };
type Box = Part['footprint'];
type Engine = {
  tick(dt: number, now: number): void;
  resume(): void;
  halt(): void;
  still(): void;
  focus(box: Box | null): void;
  dispose(): void;
};

// Tokens outside the focused part step back like its ink does.
const dimAlpha = 0.6;

type Point = readonly [number, number];

// Gravity on the drop: the token leaves the neck slowly and reaches the belt at speed.
function tokenAt(lane: number, s: number): Point {
  if (s >= dropLength) return pointAt(routes[lane], s);
  const [x, y] = routes[lane].points[0];
  const p = s / dropLength;
  return [x, y + dropLength * p * p];
}

function createEngine(n: EngineNodes): Engine {
  type Token = { slot: SVGGElement; lane: number; s: number; done: boolean; lastX: number; alpha: number; tilt: number };
  const free = [...n.tokens];
  const live: Token[] = [];
  let focusBox: Box | null = null;
  const heat = lanes.map(() => 0);
  let lamp = 0;
  const vane = { angle: 0, velocity: 0, target: 0 };
  let revenue: Chart = { kind: 'filling' };
  // Counted in items rather than a share of the bar, so reaching a full period is an exact comparison.
  let level = chart.startItems;
  let shown = startShown;
  // Items that land while a period closes or shifts count toward the next one.
  let carry = 0;
  let clock = 0, spin = 0, spawnIn = 0, laneTurn = 0;
  // Every simulated second is scaled by power, so spin-up and spin-down slow the whole machine together.
  let power = { value: 0, from: 0, to: 0, start: 0, ms: 1 };
  let frame = 0, last = 0;

  const deliver = () => {
    if (revenue.kind === 'filling') level++;
    else carry++;
  };

  const inFocus = (x: number, y: number) =>
    focusBox !== null && x > focusBox.x - 4 && x < focusBox.x + focusBox.w + 4 && y > focusBox.y - 8 && y < focusBox.y + focusBox.h + 8;

  // Eased in real time, not simulated time, so tokens keep following the tour during spin-up.
  function paintToken(token: Token, x: number, y: number, dt: number) {
    const alphaTo = focusBox === null || inFocus(x, y) ? 1 : dimAlpha;
    const k = dt > 0 ? 1 - Math.exp(-dt * 9) : 1;
    token.alpha += (alphaTo - token.alpha) * k;
    const edge = Math.min(1, token.s / (tokenSpeed * 0.16), (routes[token.lane].total - token.s) / (tokenSpeed * 0.2));
    // A token leaves the hopper tilted and levels out as it lands; the belt carries it without rolling.
    const turn = token.tilt * (1 - clamp01(token.s / dropLength));
    const scale = token.done ? pipeScale : 1;
    token.slot.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)}) scale(${scale})`);
    write(token.slot, 'opacity', (edge * token.alpha).toFixed(2));
  }

  function stepTokens(sdt: number, dt: number) {
    spawnIn -= sdt;
    if (spawnIn <= 0) {
      spawnIn += spawnEvery;
      const slot = free.pop();
      if (slot) {
        slot.dataset.k = 'cts'[Math.floor(Math.random() * 3)];
        slot.removeAttribute('data-done');
        const [x, y] = routes[0].points[0];
        live.push({
          slot,
          lane: laneOrder[laneTurn++ % laneOrder.length],
          s: 0,
          done: false,
          lastX: x,
          alpha: focusBox === null || inFocus(x, y) ? 1 : dimAlpha,
          tilt: (Math.random() * 2 - 1) * 28
        });
      }
    }
    let processing = false;
    for (let i = live.length - 1; i >= 0; i--) {
      const token = live[i];
      const route = routes[token.lane];
      token.s += sdt * tokenSpeed;
      if (token.s >= route.total) {
        token.slot.removeAttribute('data-k');
        free.push(token.slot);
        live.splice(i, 1);
        heat[token.lane] = 1;
        deliver();
        continue;
      }
      const [x, y] = tokenAt(token.lane, token.s);
      if (!token.done && x > thresholds.processedX) {
        token.done = true;
        token.slot.dataset.k = 's';
        token.slot.setAttribute('data-done', '');
      }
      if (token.lastX < thresholds.vaneX && x >= thresholds.vaneX) vane.target = laneAngles[token.lane];
      if (x > housing.x && x < housing.x + housing.w) processing = true;
      token.lastX = x;
      paintToken(token, x, y, dt);
    }
    // A soft 2 Hz pulse while work is inside the chamber, easing out once it empties.
    lamp += ((processing ? 1 : 0) - lamp) * (1 - Math.exp(-sdt * 10));
    write(n.processLamp, 'opacity', (lamp * (0.45 + 0.55 * (0.5 + 0.5 * Math.cos(clock * Math.PI * 4)))).toFixed(2));
  }

  function stepVane(sdt: number) {
    for (let rest = sdt; rest > 0; rest -= 1 / 240) {
      const h = Math.min(rest, 1 / 240);
      vane.velocity += (-260 * (vane.angle - vane.target) - 18 * vane.velocity) * h;
      vane.angle += vane.velocity * h;
    }
    n.vane.setAttribute('transform', `translate(${hub.x} ${hub.y}) rotate(${vane.angle.toFixed(2)})`);
  }

  function stepLamps(sdt: number) {
    heat.forEach((value, i) => {
      const h = Math.max(0, value - sdt / 0.4);
      heat[i] = h;
      write(n.glows[i], 'opacity', h.toFixed(3));
      write(n.halos[i], 'opacity', (0.35 * h).toFixed(3));
      write(n.halos[i], 'r', (9 * (1 + 0.4 * (1 - h))).toFixed(2));
    });
  }

  function paintChart({ bars, trend, head }: ChartFrame) {
    bars.forEach(({ x, y, h, opacity, full }, i) => {
      const bar = n.bars[i];
      write(bar, 'x', x.toFixed(2));
      write(bar, 'y', y.toFixed(2));
      write(bar, 'height', h.toFixed(2));
      write(bar, 'opacity', opacity.toFixed(3));
      bar.classList.toggle('is-full', full);
    });
    write(n.trend, 'points', trend);
    write(n.head, 'transform', head);
  }

  function stepChart(sdt: number) {
    const { targetH, itemsPerPeriod } = chart;
    if (revenue.kind === 'filling') {
      shown += (Math.min(level / itemsPerPeriod, 1) * targetH - shown) * (1 - Math.exp(-sdt * 8));
      if (level >= itemsPerPeriod && shown > targetH - 0.5) {
        shown = targetH;
        carry = level - itemsPerPeriod;
        revenue = { kind: 'closing', reach: 0 };
      }
    } else if (revenue.kind === 'closing') {
      revenue.reach += sdt * chart.closeRate;
      if (revenue.reach >= 1) revenue = { kind: 'shifting', elapsed: 0 };
    } else {
      revenue.elapsed += sdt;
      if (revenue.elapsed >= chart.shiftS) {
        revenue = { kind: 'filling' };
        level = carry;
        shown = 0;
        carry = 0;
      }
    }
    if (revenue.kind === 'filling') paintChart(chartFrame(shown, 0, 0));
    else if (revenue.kind === 'closing') paintChart(chartFrame(shown, revenue.reach, 0));
    else paintChart(chartFrame(shown, 1, easeInOut(clamp01(revenue.elapsed / chart.shiftS))));
  }

  function stepMachine(sdt: number) {
    spin += sdt * (1 + live.length * 0.1);
    n.rollers.forEach((g, i) => g.setAttribute('transform', `rotate(${((spin * 160) % 360).toFixed(1)} ${rollerXs[i]} 251)`));
    n.gears.forEach((g, i) => {
      const { x, dir, offset } = gearSpecs[i];
      g.setAttribute('transform', `translate(${x} 235) rotate(${((dir * spin * 90 + offset) % 360).toFixed(1)})`);
    });
    n.jumble.forEach((g, i) => {
      const [x, y] = jumbleSpecs[i];
      const period = 2.1 + i * 0.35;
      const phase = i * 1.7;
      const tau = (clock / period) * Math.PI * 2;
      const dx = 1.2 * Math.sin(tau + phase);
      const dy = 1.2 * Math.cos(tau / 1.13 + phase * 2);
      const turn = 14 * Math.sin(tau / 1.5 + phase);
      g.setAttribute('transform', `translate(${(x + dx).toFixed(2)} ${(y + dy).toFixed(2)}) rotate(${turn.toFixed(1)})`);
    });
  }

  function tick(dt: number, now: number) {
    power.value = power.from + (power.to - power.from) * easeInOut(clamp01((now - power.start) / power.ms));
    const sdt = dt * power.value;
    clock += sdt;
    stepTokens(sdt, dt);
    stepVane(sdt);
    stepLamps(sdt);
    stepChart(sdt);
    stepMachine(sdt);
  }

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(dt, now);
    frame = power.value === 0 && power.to === 0 ? 0 : requestAnimationFrame(loop);
  };
  const run = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };
  const ramp = (to: number, ms: number) => {
    power = { value: power.value, from: power.value, to, start: performance.now(), ms };
    run();
  };
  const halt = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    power = { value: 0, from: 0, to: 0, start: 0, ms: 1 };
  };

  return {
    tick,
    resume: () => ramp(1, 900),
    halt,
    still() {
      revenue = { kind: 'filling' };
      level = chart.startItems;
      shown = startShown;
      carry = 0;
      paintChart(initialChart);
    },
    focus(box) {
      focusBox = box;
      if (frame) return;
      for (const token of live) {
        const [x, y] = tokenAt(token.lane, token.s);
        paintToken(token, x, y, 0);
      }
    },
    dispose: halt
  };
}

/* ---------- component ---------- */

function Callout({ part, index, on, ids }: { part: Part; index: number; on: boolean; ids: Ids }) {
  const { x, leadTo } = part.callout;
  const y = calloutY;
  const at = draw.calloutsAt + index * 80;
  return (
    <g className={cn('bp-call', on && 'is-on')}>
      <MaskedStroke id={`${ids.prefix}-lead-${part.id}`} d={`M${x} ${y + 11} V${leadTo}`} className="bp-lead" maskClassName="bp-draw" style={timing(at + 120, 280)} />
      <g className="bp-pop" style={timing(at)}>
        <g className="bp-pulse">
          <circle cx={x} cy={y} r={10} className="bp-bubble" />
          <text x={x} y={y + 4} textAnchor="middle" className="bp-num">{index + 1}</text>
        </g>
      </g>
      <text x={x + 16} y={y + 4} className="bp-lbl bp-slide" style={timing(at + 160)}>{part.label}</text>
    </g>
  );
}

function ProgressRing({ tour, part }: { tour: Tour; part: Part }) {
  const { x } = part.callout;
  const y = calloutY;
  const { at } = tour;
  const running = at.kind === 'touring' || at.kind === 'pinned';
  const ms = at.kind === 'pinned' ? 6000 : part.dwellMs;
  return (
    <circle
      key={`${at.kind}-${part.id}`}
      cx={x}
      cy={y}
      r={14}
      pathLength={1}
      transform={`rotate(-90 ${x} ${y})`}
      className={cn('bp-ring', !running && 'is-full')}
      style={{ '--dwell': `${ms}ms` } as CSSProperties}
    />
  );
}

export function HeroBlueprint({ className = '' }: { className?: string }) {
  const [tour, dispatch] = useReducer(tourReducer, { auto: true, at: { kind: 'drafting' } });
  const [onScreen, setOnScreen] = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const hold = useRef<{ at: TourState | null; remaining: number }>({ at: null, remaining: 0 });
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ids: Ids = { hatch: `${prefix}-hatch`, arrow: `${prefix}-arrow`, clip: `${prefix}-clip`, tokens: `${prefix}-tokens`, prefix };

  const drawn = tour.at.kind !== 'drafting';
  const halted = !onScreen;
  const focus = focusOf(tour.at);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const engine = createEngine(bindNodes(svg));
    engineRef.current = engine;
    let cancelled = false;
    // Waiting on the draw-in's own animations means a late hydration never replays the wait.
    Promise.allSettled(svg.getAnimations({ subtree: true }).map((animation) => animation.finished)).then(() => {
      if (!cancelled) dispatch({ type: 'drawn', auto: !window.matchMedia('(prefers-reduced-motion: reduce)').matches });
    });
    return () => {
      cancelled = true;
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let inView = true;
    const update = () => setOnScreen(inView && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(frame);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !drawn) return;
    if (!tour.auto) engine.still();
    else if (!onScreen) engine.halt();
    else engine.resume();
  }, [drawn, tour.auto, onScreen]);

  useEffect(() => {
    engineRef.current?.focus(focus?.footprint ?? null);
  }, [focus]);

  useEffect(() => {
    const ms = holdMs(tour);
    if (ms === null) return;
    if (hold.current.at !== tour.at) hold.current = { at: tour.at, remaining: ms };
    if (halted) return;
    const started = performance.now();
    const timer = window.setTimeout(() => dispatch({ type: 'elapsed' }), hold.current.remaining);
    return () => {
      window.clearTimeout(timer);
      hold.current.remaining -= performance.now() - started;
    };
  }, [tour, halted]);

  const partAt = (event: PointerEvent<SVGSVGElement>): PartId | null => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 1200;
    const y = ((event.clientY - box.top) / box.height) * sheetHeight;
    return partAtPoint(x, y)?.id ?? null;
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'touch') return;
    const id = partAt(event);
    dispatch(id ? { type: 'hover', id } : { type: 'leave' });
  };
  const onPointerLeave = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== 'touch') dispatch({ type: 'leave' });
  };
  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== 'touch') return;
    const id = partAt(event);
    if (id) dispatch({ type: 'tap', id });
  };

  const panX = focus?.panX ?? (tour.at.kind === 'resting' ? 600 : parts[0].panX);
  const cons = createPen(0, draw.consStep, draw.consMs);
  const base = createPen(draw.partAt(0));
  const baseLine = base.draw(`M${ground.x1} ${ground.y} H${ground.x2}`, 'bp-ink');

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden @container', className)}>
      <div className="bp-camera" style={{ '--bp-pan': panX } as CSSProperties}>
        <svg
          ref={svgRef}
          viewBox={`0 0 1200 ${sheetHeight}`}
          role="img"
          aria-label={sheetLabel}
          className={cn('bp-sheet block h-auto w-full select-none', focus && 'has-focus', halted && 'is-halted')}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerUp}
        >
          <g aria-hidden="true">
            <defs>
              <pattern id={ids.hatch} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={6} className="bp-hatch" />
              </pattern>
              <marker id={ids.arrow} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                <path d="M0 1 L10 5 L0 9 Z" className="bp-arrow" />
              </marker>
              <clipPath id={ids.clip}>
                <rect x={chart.clipX} y={0} width={1200 - chart.clipX} height={sheetHeight} />
              </clipPath>
              <mask id={ids.tokens} maskUnits="userSpaceOnUse" x={0} y={0} width={1200} height={sheetHeight}>
                <rect width={1200} height={sheetHeight} className="fill-white" />
                <rect x={housingWithPorts.x} y={housingWithPorts.y} width={housingWithPorts.w} height={housingWithPorts.h} className="fill-black" />
                <circle cx={hub.x} cy={hub.y} r={hub.r} className="fill-black" />
                {lanes.map((ly) => {
                  const b = bay(ly);
                  return <rect key={ly} x={b.x} y={b.y} width={b.w} height={b.h} className="fill-black" />;
                })}
              </mask>
            </defs>

            <g>
              {cropMarks.map((d) => (
                <path key={d} d={d} pathLength={1} className="bp-mark bp-draw" style={timing(0, draw.consMs)} />
              ))}
              {'ABCDEF'.split('').map((zone, i) => (
                <g key={zone}>
                  {i < 5 && <path d={`M${14 + (i + 1) * 195.3} 14 V22`} pathLength={1} className="bp-mark bp-draw" style={timing(i * draw.consStep, 240)} />}
                  <text x={14 + i * 195.3 + 97} y={25} textAnchor="middle" className="bp-zone bp-fade" style={timing(i * draw.consStep)}>{zone}</text>
                </g>
              ))}
              {['1', '2', '3'].map((zone, i) => (
                <text key={zone} x={24} y={14 + i * 144 + 76} textAnchor="middle" className="bp-zone bp-fade" style={timing(i * draw.consStep)}>{zone}</text>
              ))}
              {constructionLines.map((d) => cons.draw(d, 'bp-cons'))}
            </g>

            <g>
              {parts.map(({ id, footprint: f }) => (
                <path key={id} d={brackets(f)} className={cn('bp-bracket', focus?.id === id && 'is-on')} />
              ))}
            </g>

            <g>
              <rect x={ground.x1} y={ground.y} width={ground.x2 - ground.x1} height={9} fill={`url(#${ids.hatch})`} className="bp-fade" style={timing(base.end())} />
              {baseLine}
              {parts.map(({ id }, i) => {
                const Art = partArt[id];
                return (
                  <g key={id} className={cn('bp-part', focus?.id === id && 'is-focus')}>
                    <Art start={draw.partAt(i)} ids={ids} />
                  </g>
                );
              })}
            </g>

            <g mask={`url(#${ids.tokens})`}>
              {Array.from({ length: tokenPool }, (_, i) => (
                <g key={i} data-bp="token" className="bp-tok">
                  <circle r={6} className="bp-k-c" />
                  <path d={shapePaths.t} className="bp-k-t" />
                  <rect x={-6} y={-6} width={12} height={12} className="bp-k-s" />
                </g>
              ))}
            </g>

            <g>
              {dimensions.map(({ x1, x2, y, label }, i) => {
                const at = draw.dimsAt + i * 80;
                return (
                  <g key={label}>
                    <path d={`M${x1} 336 V${y + 6} M${x2} 336 V${y + 6}`} pathLength={1} className="bp-dim bp-draw" style={timing(at, 220)} />
                    <line x1={x1 + 1} y1={y} x2={x2 - 1} y2={y} markerStart={`url(#${ids.arrow})`} markerEnd={`url(#${ids.arrow})`} className="bp-dim bp-grow" style={timing(at + 220)} />
                    <text x={(x1 + x2) / 2} y={y - 5} textAnchor="middle" className="bp-dimtxt bp-rise" style={timing(at + 600)}>{label}</text>
                  </g>
                );
              })}
            </g>

            <g>
              {parts.map((part, i) => (
                <Callout key={part.id} part={part} index={i} on={focus?.id === part.id} ids={ids} />
              ))}
              {focus && <ProgressRing tour={tour} part={focus} />}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
