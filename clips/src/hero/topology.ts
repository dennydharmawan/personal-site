/**
 * Payment topology geometry and packet scheduling, ported from the site's
 * `src/components/system-stage.tsx` so the render matches the diagram it replaces.
 *
 * Unlike the DOM version this module is exactly periodic over `loopDuration`: a
 * packet whose journey crosses the loop boundary is also evaluated one loop
 * later, so frame 0 equals the state at 10.4s and the video loops without a cut.
 */

export type NodeId =
  | "merchant"
  | "api"
  | "idempotency"
  | "risk"
  | "bank"
  | "queue"
  | "worker"
  | "ledger";

export type EdgeId =
  | "submit"
  | "dedupe"
  | "screen"
  | "authorize"
  | "declined"
  | "capture"
  | "settle"
  | "record"
  | "webhook";

export type Tone = "amber" | "rose" | "green";

export type Point = { x: number; y: number };
type Size = { width: number; height: number };
type LabelAnchor = "start" | "middle" | "end";
type EdgeLabel = { x: number; y: number; anchor: LabelAnchor; rotate?: number };

export type TypeScale = {
  label: number;
  sublabel: number;
  edgeLabel: number;
  dot: { radius: number; halo: number; trail: number; pulse: number };
};

export type Layout = {
  viewBox: string;
  centers: Record<NodeId, Point>;
  sizes: Record<NodeId, Size>;
  routes: Record<EdgeId, Point[]>;
  labels: Partial<Record<EdgeId, EdgeLabel>>;
  ringRadius: number;
  type: TypeScale;
};

export const topologyNodes: { id: NodeId; label: string; sublabel: string }[] = [
  { id: "merchant", label: "Merchant app", sublabel: "Next.js checkout" },
  { id: "api", label: "Payment API", sublabel: "Node.js" },
  { id: "idempotency", label: "Idempotency store", sublabel: "Redis" },
  { id: "risk", label: "Risk check", sublabel: "rules + limits" },
  { id: "bank", label: "Bank processor", sublabel: "card network" },
  { id: "queue", label: "Queue", sublabel: "BullMQ" },
  { id: "worker", label: "Settlement worker", sublabel: "async" },
  { id: "ledger", label: "Ledger", sublabel: "PostgreSQL, double-entry" },
];

export const topologyEdges: { id: EdgeId; from: NodeId; to: NodeId; label?: string }[] = [
  { id: "submit", from: "merchant", to: "api" },
  { id: "dedupe", from: "api", to: "idempotency" },
  { id: "screen", from: "api", to: "risk" },
  { id: "authorize", from: "risk", to: "bank" },
  { id: "declined", from: "risk", to: "merchant", label: "declined" },
  { id: "capture", from: "bank", to: "queue" },
  { id: "settle", from: "queue", to: "worker" },
  { id: "record", from: "worker", to: "ledger" },
  { id: "webhook", from: "worker", to: "merchant", label: "webhook" },
];

const edgeById = new Map(topologyEdges.map((edge) => [edge.id, edge]));

const wideType: TypeScale = {
  label: 18,
  sublabel: 13,
  edgeLabel: 14,
  dot: { radius: 6, halo: 13, trail: 34, pulse: 2 },
};

const narrowType: TypeScale = {
  label: 13,
  sublabel: 11,
  edgeLabel: 11,
  dot: { radius: 4.5, halo: 9, trail: 22, pulse: 1.5 },
};

export const loopDuration = 15_000;
const packetSpeed = 180;
// The webhook lane is the longest path on the board; a bit more speed keeps the
// approved story from running into the declined one.
const webhookSpeed = 230;
const settleRingDuration = 600;
const dedupeDuration = 300;
const pulseDuration = 450;

const wideBox: Size = { width: 190, height: 60 };
const wideSmallBox: Size = { width: 166, height: 44 };
const narrowBox: Size = { width: 200, height: 44 };
const narrowSmallBox: Size = { width: 170, height: 34 };

function sizeTable(standard: Size, small: Size): Record<NodeId, Size> {
  return {
    api: standard,
    bank: standard,
    idempotency: small,
    ledger: standard,
    merchant: standard,
    queue: standard,
    risk: standard,
    worker: standard,
  };
}

const wideBase: Layout = {
  viewBox: "0 0 1000 440",
  centers: {
    api: { x: 360, y: 100 },
    bank: { x: 860, y: 100 },
    idempotency: { x: 360, y: 200 },
    ledger: { x: 360, y: 310 },
    merchant: { x: 110, y: 100 },
    queue: { x: 860, y: 310 },
    risk: { x: 610, y: 100 },
    worker: { x: 610, y: 310 },
  },
  sizes: sizeTable(wideBox, wideSmallBox),
  routes: {
    authorize: [
      { x: 705, y: 100 },
      { x: 765, y: 100 },
    ],
    capture: [
      { x: 860, y: 130 },
      { x: 860, y: 280 },
    ],
    declined: [
      { x: 610, y: 70 },
      { x: 610, y: 40 },
      { x: 110, y: 40 },
      { x: 110, y: 70 },
    ],
    dedupe: [
      { x: 360, y: 130 },
      { x: 360, y: 178 },
    ],
    record: [
      { x: 515, y: 310 },
      { x: 455, y: 310 },
    ],
    screen: [
      { x: 455, y: 100 },
      { x: 515, y: 100 },
    ],
    settle: [
      { x: 765, y: 310 },
      { x: 705, y: 310 },
    ],
    submit: [
      { x: 205, y: 100 },
      { x: 265, y: 100 },
    ],
    webhook: [
      { x: 610, y: 340 },
      { x: 610, y: 400 },
      { x: 110, y: 400 },
      { x: 110, y: 130 },
    ],
  },
  labels: {
    declined: { x: 360, y: 30, anchor: "middle" },
    webhook: { x: 360, y: 421, anchor: "middle" },
  },
  ringRadius: 50,
  type: wideType,
};

const narrowBase: Layout = {
  viewBox: "0 0 360 760",
  centers: {
    api: { x: 180, y: 150 },
    bank: { x: 180, y: 400 },
    idempotency: { x: 180, y: 230 },
    ledger: { x: 180, y: 670 },
    merchant: { x: 180, y: 60 },
    queue: { x: 180, y: 490 },
    risk: { x: 180, y: 310 },
    worker: { x: 180, y: 580 },
  },
  sizes: sizeTable(narrowBox, narrowSmallBox),
  routes: {
    authorize: [
      { x: 180, y: 332 },
      { x: 180, y: 378 },
    ],
    capture: [
      { x: 180, y: 422 },
      { x: 180, y: 468 },
    ],
    declined: [
      { x: 80, y: 310 },
      { x: 40, y: 310 },
      { x: 40, y: 60 },
      { x: 80, y: 60 },
    ],
    dedupe: [
      { x: 140, y: 172 },
      { x: 140, y: 213 },
    ],
    record: [
      { x: 180, y: 602 },
      { x: 180, y: 648 },
    ],
    screen: [
      { x: 220, y: 172 },
      { x: 220, y: 191 },
      { x: 300, y: 191 },
      { x: 300, y: 269 },
      { x: 220, y: 269 },
      { x: 220, y: 288 },
    ],
    settle: [
      { x: 180, y: 512 },
      { x: 180, y: 558 },
    ],
    submit: [
      { x: 180, y: 82 },
      { x: 180, y: 128 },
    ],
    webhook: [
      { x: 280, y: 580 },
      { x: 320, y: 580 },
      { x: 320, y: 60 },
      { x: 280, y: 60 },
    ],
  },
  // The single column leaves no horizontal room beside the lanes, so both labels
  // run along their lane instead of across the node column.
  labels: {
    declined: { x: 28, y: 185, anchor: "middle", rotate: -90 },
    webhook: { x: 334, y: 320, anchor: "middle", rotate: -90 },
  },
  ringRadius: 54,
  type: narrowType,
};

// Replace each right-angle corner with a quarter arc so a packet glides through bends
// instead of snapping, and the drawn lane matches the path the packet actually takes.
function roundRoute(points: Point[], radius: number): Point[] {
  if (points.length < 3) return points;

  const arcSteps = 10;
  const out: Point[] = [points[0]];

  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const inDir = unit(prev, corner);
    const outDir = unit(corner, next);
    const r = Math.min(radius, Math.hypot(corner.x - prev.x, corner.y - prev.y) / 2, Math.hypot(next.x - corner.x, next.y - corner.y) / 2);
    const start = { x: corner.x - inDir.x * r, y: corner.y - inDir.y * r };
    const end = { x: corner.x + outDir.x * r, y: corner.y + outDir.y * r };

    // Quadratic Bézier through the corner approximates the quarter circle closely enough.
    for (let step = 0; step <= arcSteps; step += 1) {
      const t = step / arcSteps;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      out.push({
        x: a * start.x + b * corner.x + c * end.x,
        y: a * start.y + b * corner.y + c * end.y,
      });
    }
  }

  out.push(points[points.length - 1]);
  return out;
}

function unit(from: Point, to: Point): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

function roundLayout(layout: Layout, radius: number): Layout {
  const routes = Object.fromEntries(
    Object.entries(layout.routes).map(([id, points]) => [id, roundRoute(points, radius)]),
  ) as Record<EdgeId, Point[]>;
  return { ...layout, routes };
}

export const wideLayout = roundLayout(wideBase, 14);
export const narrowLayout = roundLayout(narrowBase, 10);

function segmentLengths(points: Point[]): number[] {
  return points.slice(1).map((point, index) => {
    const previous = points[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
}

const routeLengthCache = new WeakMap<Point[], number>();

export function routeLength(points: Point[]): number {
  const cached = routeLengthCache.get(points);

  if (cached !== undefined) return cached;

  const total = segmentLengths(points).reduce((sum, length) => sum + length, 0);
  routeLengthCache.set(points, total);
  return total;
}

export function pointAtDistance(points: Point[], distance: number): Point {
  const lengths = segmentLengths(points);
  let remaining = Math.max(distance, 0);

  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];

    if (remaining <= length || index === lengths.length - 1) {
      const ratio = length === 0 ? 0 : Math.min(remaining / length, 1);
      const from = points[index];
      const to = points[index + 1];
      return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
    }

    remaining -= length;
  }

  return points[points.length - 1];
}

// Points along a route between two distances, keeping any corners in between so a
// trail follows the orthogonal path instead of cutting across it.
function routeSlice(points: Point[], from: number, to: number): Point[] {
  const lengths = segmentLengths(points);
  const slice = [pointAtDistance(points, from)];
  let walked = 0;

  for (let index = 0; index < lengths.length; index += 1) {
    walked += lengths[index];
    if (walked > from && walked < to) slice.push(points[index + 1]);
  }

  slice.push(pointAtDistance(points, to));
  return slice;
}

export const trailChunkCount = 6;

function trailSlices(points: Point[], head: number, length: number): Point[][] {
  const tail = Math.max(0, head - length);
  const span = head - tail;

  if (span <= 0) return [];

  const chunks: Point[][] = [];
  for (let index = 0; index < trailChunkCount; index += 1) {
    const from = tail + (span * index) / trailChunkCount;
    const to = tail + (span * (index + 1)) / trailChunkCount;
    chunks.push(routeSlice(points, from, to));
  }
  return chunks;
}

// Ease-in-out per hop: a packet leaves a node gently and settles into the next one
// instead of running at one speed and stopping dead.
function legEase(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
}

// cubic-bezier(0.22, 1, 0.36, 1): solve x(u) = progress by bisection, then read y(u).
export function revealEase(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  let low = 0;
  let high = 1;

  for (let step = 0; step < 24; step += 1) {
    const mid = (low + high) / 2;
    const inverse = 1 - mid;
    const x = 3 * inverse * inverse * mid * 0.22 + 3 * inverse * mid * mid * 0.36 + mid ** 3;

    if (x < clamped) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const u = (low + high) / 2;
  const inverse = 1 - u;
  return 3 * inverse * inverse * u + 3 * inverse * u * u + u ** 3;
}

type LegKind = "edge" | "transit";

/**
 * A journey alternates node transits and edge runs with no gaps: the packet slides
 * out of the first node's centre, runs each lane, crosses each node under its box
 * (where the border pulse shows it being handled), and finally slides into the last
 * node's centre. Drawing packets beneath the node layer is what hides the transits.
 */
type Leg = {
  kind: LegKind;
  points: Point[];
  start: number;
  end: number;
  /** Edges completed when this leg starts; drives the packet's tone. */
  edgesDone: number;
  /** The node reached at the end of the leg. */
  node: NodeId;
};
type Journey = { legs: Leg[]; edgeEnds: number[]; arrival: number };

const transitDuration = 300;

function buildJourney(layout: Layout, edges: EdgeId[], speed: number): Journey {
  const legs: Leg[] = [];
  let cursor = 0;
  let edgesDone = 0;

  const push = (kind: LegKind, points: Point[], node: NodeId, duration: number) => {
    legs.push({ edgesDone, end: cursor + duration, kind, node, points, start: cursor });
    cursor += duration;
  };

  edges.forEach((edgeId, index) => {
    const edge = edgeById.get(edgeId);
    if (!edge) throw new Error(`Unknown edge ${edgeId}`);

    const route = layout.routes[edgeId];
    const previous = index > 0 ? layout.routes[edges[index - 1]] : null;
    const entry = previous ? previous[previous.length - 1] : layout.centers[edge.from];

    push("transit", [entry, route[0]], edge.from, transitDuration);
    push("edge", route, edge.to, (routeLength(route) / speed) * 1000);
    edgesDone += 1;
  });

  const last = edgeById.get(edges[edges.length - 1]);
  if (!last) throw new Error("Journey needs at least one edge");
  const lastRoute = layout.routes[last.id];
  push("transit", [lastRoute[lastRoute.length - 1], layout.centers[last.to]], last.to, transitDuration);

  return {
    arrival: cursor,
    edgeEnds: legs.filter((leg) => leg.kind === "edge").map((leg) => leg.end),
    legs,
  };
}

const approvedEdges: EdgeId[] = ["submit", "screen", "authorize", "capture", "settle", "record"];
const declinedEdges: EdgeId[] = ["submit", "screen", "declined"];
const webhookEdges: EdgeId[] = ["webhook"];

type PacketKind = "approvedWebhook" | "declined";
type Launch = { kind: PacketKind; offset: number };

type Placement = {
  point: Point;
  trailChunks: Point[][];
  edgesDone: number;
  opacity: number;
};

function placeOnJourney(layout: Layout, journey: Journey, elapsed: number): Placement | null {
  if (elapsed < 0 || elapsed > journey.arrival) return null;

  const lastIndex = journey.legs.length - 1;

  for (let index = 0; index <= lastIndex; index += 1) {
    const leg = journey.legs[index];

    if (elapsed > leg.end) continue;

    const span = leg.end - leg.start;
    const t = span === 0 ? 1 : (elapsed - leg.start) / span;
    const ratio = leg.kind === "edge" ? legEase(t) : t;
    const length = routeLength(leg.points);
    const distance = length * ratio;
    const point = pointAtDistance(leg.points, distance);
    const trailChunks = leg.kind === "edge" ? trailSlices(leg.points, distance, layout.type.dot.trail) : [];

    // Fade under the box on the way out of the first node and into the last one so
    // the halo never leaks past the border while the dot is meant to be inside.
    let opacity = 1;
    if (index === 0) opacity = revealEase(t);
    if (index === lastIndex) opacity = 1 - revealEase(t);

    // Crossing a node, the colour flips halfway under the box: a packet enters in the
    // tone it arrived with and leaves in the tone the node decided on.
    const edgesDone = leg.kind === "transit" && t < 0.5 ? leg.edgesDone - 1 : leg.edgesDone;

    return { edgesDone, opacity, point, trailChunks };
  }

  return null;
}

export type Packet = {
  key: string;
  tone: Tone;
  point: Point;
  /** The trail split into equal-length pieces, tail first, so it can fade out behind the dot. */
  trailChunks: Point[][];
  opacity: number;
};
export type Ring = { key: string; point: Point; radius: number; opacity: number };
export type Pulse = { key: string; node: NodeId; tone: Tone; progress: number };
export type Frame = { packets: Packet[]; rings: Ring[]; dots: Point[]; pulses: Pulse[] };

// The decision at risk check turns a declined payment rose; capture at the bank turns an
// approved one green. `edgesDone` counts lanes completed, so the colour flips as the
// packet enters the deciding node.
function packetTone(kind: PacketKind, edgesDone: number): Tone {
  if (kind === "declined") return edgesDone >= 2 ? "rose" : "amber";
  return edgesDone >= 3 ? "green" : "amber";
}

function toneAtEdgeEnd(kind: PacketKind, edgeIndex: number): Tone {
  return packetTone(kind, edgeIndex + 1);
}

export type Journeys = { approved: Journey; declined: Journey; webhook: Journey };

/**
 * One loop tells two stories back to back: a payment that clears all the way to the
 * ledger and notifies the merchant, then one the risk check turns away, with equal
 * pauses between them.
 */
export type Schedule = { journeys: Journeys; launches: Launch[] };

export function buildJourneys(layout: Layout): Journeys {
  return {
    approved: buildJourney(layout, approvedEdges, packetSpeed),
    declined: buildJourney(layout, declinedEdges, packetSpeed),
    webhook: buildJourney(layout, webhookEdges, webhookSpeed),
  };
}

const webhookDelay = 200;

export function webhookSpawn(journeys: Journeys): number {
  return journeys.approved.arrival + webhookDelay;
}

function journeyLifetime(journey: Journey): number {
  const lastEdgeEnd = journey.edgeEnds[journey.edgeEnds.length - 1];
  return Math.max(journey.arrival, lastEdgeEnd + pulseDuration, journey.arrival + settleRingDuration - transitDuration);
}

export function buildSchedule(layout: Layout): Schedule {
  const journeys = buildJourneys(layout);
  const approvedEnd = webhookSpawn(journeys) + journeyLifetime(journeys.webhook);
  const declinedLifetime = journeyLifetime(journeys.declined);
  // Split the idle time evenly so the pause before the declined run matches the
  // pause before the loop wraps back to the approved one.
  const idle = (loopDuration - approvedEnd - declinedLifetime) / 2;

  return {
    journeys,
    launches: [
      { kind: "approvedWebhook", offset: 0 },
      { kind: "declined", offset: approvedEnd + idle },
    ],
  };
}

function collectJourney(
  layout: Layout,
  journey: Journey,
  kind: PacketKind,
  key: string,
  elapsed: number,
  frame: Frame,
  options: { skipLastPulse: boolean; ring: boolean; fixedTone?: Tone },
): void {
  const placement = placeOnJourney(layout, journey, elapsed);

  if (placement && placement.opacity > 0) {
    frame.packets.push({
      key,
      opacity: placement.opacity,
      point: placement.point,
      tone: options.fixedTone ?? packetTone(kind, placement.edgesDone),
      trailChunks: placement.trailChunks,
    });
  }

  journey.edgeEnds.forEach((end, edgeIndex) => {
    const sinceArrival = elapsed - end;
    const isLast = edgeIndex === journey.edgeEnds.length - 1;

    if (sinceArrival >= 0 && sinceArrival < pulseDuration && !(isLast && options.skipLastPulse)) {
      const leg = journey.legs.find((candidate) => candidate.kind === "edge" && candidate.end === end);
      frame.pulses.push({
        key: `${key}-pulse-${edgeIndex}`,
        node: leg?.node ?? "merchant",
        progress: sinceArrival / pulseDuration,
        tone: options.fixedTone ?? toneAtEdgeEnd(kind, edgeIndex),
      });
    }
  });

  if (options.ring) {
    // The ring starts as the dot slides under the ledger, so the two read as one event.
    const ringStart = journey.arrival - transitDuration / 2;
    const ringProgress = (elapsed - ringStart) / settleRingDuration;

    if (ringProgress >= 0 && ringProgress < 1) {
      const eased = revealEase(ringProgress);
      const node = journey.legs[journey.legs.length - 1].node;
      frame.rings.push({
        key: `${key}-ring`,
        opacity: 1 - eased,
        point: layout.centers[node],
        radius: eased * layout.ringRadius,
      });
    }
  }
}

function collect(
  layout: Layout,
  journeys: Journeys,
  launch: Launch,
  launchIndex: number,
  elapsed: number,
  frame: Frame,
): void {
  const { approved, declined, webhook } = journeys;
  const journey = launch.kind === "declined" ? declined : approved;

  collectJourney(layout, journey, launch.kind, `packet-${launchIndex}`, elapsed, frame, {
    ring: launch.kind !== "declined",
    skipLastPulse: launch.kind !== "declined",
  });

  if (launch.kind === "approvedWebhook") {
    collectJourney(layout, webhook, launch.kind, `webhook-${launchIndex}`, elapsed - webhookSpawn(journeys), frame, {
      fixedTone: "green",
      ring: false,
      skipLastPulse: false,
    });
  }

  // Every packet that reaches the API ticks the idempotency store on the way through.
  const dedupeElapsed = elapsed - journey.edgeEnds[0];

  if (dedupeElapsed >= 0 && dedupeElapsed <= dedupeDuration) {
    const half = dedupeDuration / 2;
    const ratio = dedupeElapsed <= half ? dedupeElapsed / half : 1 - (dedupeElapsed - half) / half;
    const route = layout.routes.dedupe;
    frame.dots.push(pointAtDistance(route, routeLength(route) * ratio));
  }
}

/** Longest a single launch stays on screen; must stay below `loopDuration`. */
export function launchLifetime(journeys: Journeys): number {
  return Math.max(
    webhookSpawn(journeys) + journeyLifetime(journeys.webhook),
    journeyLifetime(journeys.declined),
  );
}

export function buildFrame(layout: Layout, schedule: Schedule, clock: number): Frame {
  const { journeys, launches } = schedule;
  const frame: Frame = { dots: [], packets: [], pulses: [], rings: [] };
  const now = ((clock % loopDuration) + loopDuration) % loopDuration;

  launches.forEach((launch, launchIndex) => {
    // A launch whose journey crosses the loop boundary is picked up one loop later,
    // which is what makes frame 0 identical to the state at `loopDuration`.
    const elapsed = now >= launch.offset ? now - launch.offset : now - launch.offset + loopDuration;
    collect(layout, journeys, launch, launchIndex, elapsed, frame);
  });

  return frame;
}
