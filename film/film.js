'use strict';
/* Desk scenery. One window over Merdeka Square, Jakarta, for one full turn of the day.

   The film is a loop: the last frame is the first. At dusk the last sun
   climbs Monas and leaves the gold flame; the lamp clicks on while the day's
   work runs. The deploy lands, the screen sleeps, the lamp goes off, and the
   desk is left to the cat. The city lights up, a train crosses, a storm takes
   the power out and the cat wakes at the thunderclap. Power returns block by
   block. At dawn the first sun lands on the flame, a fresh glass of tea
   arrives and the screen wakes. The sun crosses the north-facing window from
   east to west through morning, noon and afternoon, and golden hour hands
   back to the same dusk.

   Every frame is a pure function of t (seek(t)); no Math.random in render.
   Every oscillator runs whole cycles per DUR (cyc) so the seam is exact. */

const DUR = 50;

/* Beats. Every scene event keys off this table. */
const T = {
  lastLight: 5.4,        // the terminator reaches the tip of the flame
  lampOn: 5.9,
  towersOn: [5.2, 10.8],
  streetOn: [7.2, 8.4],
  flood: 8.8,            // Monas floodlights
  train: [11.0, 17.4],
  plane: [11.4, 17.0],
  cloudsIn: [11.6, 16.6],   // the storm follows the log-off; no idle night between
  distant: [[13.3, 900], [13.42, 900], [14.6, 250], [15.35, 640], [15.44, 640], [17.1, 180], [18.15, 520], [20.4, 330], [21.18, 700], [21.3, 700], [22.5, 470]],
  drops: 14.9,
  pour: [16.0, 17.4],
  bolt: 19.0,
  boltX: 862,
  restore: [23.2, 25.8],
  rainOff: [21.8, 24.4],
  cloudsOut: [24.8, 28.6],
  floodOff: 29.2,
  firstLight: 30.1,      // the first sun reaches the flame
  lampOff: 10.4,          // logged off: the deploy lands, the screen sleeps, the lamp clicks off
  deploy: 7.9,
  sleep: [8.9, 9.8],      // the screen dims, then goes dark
  wake: 32.6,             // back at dawn with a fresh glass; the screen wakes
  climb: 33.6,            // the sun leaves the horizon and climbs out of the top of the window
  noon: [38, 42],         // the sun overhead, out of frame
  dayTrain: [38, 42],
  golden: 46,             // the sun comes back down into the window
  kite: [41.5, 3.6],      // up over the kampung, reeled in after the seam
};
T.catSit = [T.bolt, 23.0];  // sits up in the flash, lies back down as the power returns
/* Loop-safe oscillators: every one of them completes whole cycles in DUR. */
const cyc = (t, hz) => t * TAU * Math.max(1, Math.round(hz * DUR)) / DUR;
/* Seconds since t0, counted across the loop seam. Bit-identical at t = 0 and
   t = DUR, which a fract() form is not. */
const since = (t, t0) => t >= t0 ? t - t0 : t + DUR - t0;

/* The sun's bearing and height drive every sunlit face and the light on the
   desk. It is the dry season and the window faces north, so the sun passes
   north of overhead: east (+1, right) in the morning, overhead (0) at noon,
   west (-1, left) from afternoon through dusk. Height runs 0 (low) to 1. */
const sunSide = t => t < 24 ? -1 : (1 - ramp(t, T.noon[0] - 0.5, T.noon[0] + 1.2)) - ramp(t, T.noon[1] - 0.8, T.noon[1] + 1.2);
const sunHigh = t => t < 24 ? 0 : ramp(t, T.climb, T.noon[0]) * (1 - ramp(t, T.noon[1], DUR));
/* Morning look (1) against the evening look (0); they meet again at the loop. */
const morn = t => (1 + sunSide(t)) / 2;

/* Stage. */
const GL = { x0: 96, y0: 84, x1: 984, y1: 800 };       // glass
const FR = { x0: 78, y0: 66, x1: 1002, y1: 818 };      // outer frame
const MUL = [360, 378];                                 // mullion
const GLASS = rect(GL.x0, GL.y0, GL.x1, GL.y1);
const HY = 600;                                         // horizon: base of the far city
const DESK = 830;

const nightness = t => ramp(t, 4.2, 10.5) * (1 - ramp(t, 27.5, 33.5));
const roomDark = t => ramp(t, 3.2, 9.5) * (1 - ramp(t, 29.2, 33.8));
const lampAt = t => (t >= T.lampOn && t < T.lampOff) ? 1 : 0;
const steamAt = t => t < 24 ? 1 - ramp(t, 6.5, 13) : ramp(t, T.wake - 0.2, T.wake + 0.8);
const rainAt = t => ramp(t, T.pour[0], T.pour[1]) * (1 - ramp(t, T.rainOff[0], T.rainOff[1]));
const cloudAt = t => ramp(t, T.cloudsIn[0], T.cloudsIn[1]) * (1 - ramp(t, T.cloudsOut[0], T.cloudsOut[1]));

/* Power: the grid drops in a wave from the strike and comes back block by block. */
const offAt = x => T.bolt + 0.07 + Math.abs(x - T.boltX) / W * 0.75;
function powered(x, t, key) {
  if (t < offAt(x)) return true;
  return t >= T.restore[0] + h01('restore:' + key) * (T.restore[1] - T.restore[0]);
}

/* Lightning: short pulses. */
function flashAt(t) {
  let f = 0;
  for (const [t0, d, a] of [[T.bolt, 0.09, 1], [T.bolt + 0.17, 0.07, 0.8], [T.bolt + 0.31, 0.05, 0.5]])
    if (t >= t0 && t < t0 + d) f = Math.max(f, a * (1 - (t - t0) / d * 0.5));
  return f;
}
function flickerAt(t) {
  let best = null;
  for (const [t0, x] of T.distant) {
    const d = t - t0;
    if (d >= 0 && d < 0.14) { const a = 1 - d / 0.14; if (!best || a > best.a) best = { a, x }; }
  }
  return best;
}

/* ── sky ──────────────────────────────────────────────────────────────────── */

/* Jakarta's night sky is never black: sodium light in the haze keeps the
   horizon warm and the whole sky lighter than the room. */
const PAL = {
  gold:    { yellow: [.06, .36, .9], pink: [.2, .34, .48], blue: [.26, .08, 0], indigo: [0, 0, 0] },
  late:    { yellow: [0, .12, .58], pink: [.3, .48, .58], blue: [.48, .26, .06], indigo: [.1, .02, 0] },
  blue:    { yellow: [0, .04, .26], pink: [.08, .2, .42], blue: [.6, .5, .36], indigo: [.46, .24, .06] },
  night:   { yellow: [0, .1, .42], pink: [.1, .24, .46], blue: [.52, .44, .3], indigo: [.54, .34, .1] },
  heavy:   { yellow: [0, .08, .34], pink: [.14, .26, .42], blue: [.5, .44, .34], indigo: [.5, .34, .12] },
  dark:    { yellow: [0, .02, .1], pink: [.06, .1, .2], blue: [.5, .46, .4], indigo: [.58, .46, .3] },
  predawn: { yellow: [0, .04, .22], pink: [.1, .26, .44], blue: [.56, .42, .28], indigo: [.44, .22, .06] },
  dawn:    { yellow: [.04, .3, .86], pink: [.18, .4, .44], blue: [.46, .18, .04], indigo: [.06, 0, 0] },
  morning: { yellow: [.05, .22, .56], pink: [.08, .18, .24], blue: [.44, .24, .1], indigo: [0, 0, 0] },
  noon:    { yellow: [0, .06, .2], pink: [0, .05, .1], blue: [.56, .4, .22], indigo: [.04, 0, 0] },
  afternoon: { yellow: [.02, .14, .42], pink: [.06, .14, .24], blue: [.44, .26, .1], indigo: [0, 0, 0] },
};
const SKYK = [[0, 'gold'], [5, 'late'], [9, 'blue'], [13, 'night'], [16.5, 'heavy'],
  [19.1, 'heavy'], [19.8, 'dark'], [23.4, 'dark'], [25.8, 'heavy'], [27.8, 'predawn'], [31.2, 'dawn'],
  [34.2, 'morning'], [36.4, 'morning'], [T.noon[0] + 1, 'noon'], [T.noon[1] - 0.6, 'noon'], [43.2, 'afternoon'], [T.golden - 1, 'afternoon'], [DUR, 'gold']];
const SKY_YS = [GL.y0, 360, HY + 10];
function skyCov(a, b, u) {
  const o = {};
  for (const n of PL) o[n] = { ys: SKY_YS, as: a[n].map((v, i) => lerp(v, b[n][i], u)) };
  return o;
}
function skyAt(t) {
  let i = 0;
  while (i < SKYK.length - 2 && t > SKYK[i + 1][0]) i++;
  const [t0, a] = SKYK[i], [t1, b] = SKYK[i + 1];
  return skyCov(PAL[a], PAL[b], sm((t - t0) / (t1 - t0)));
}
function sky(t) {
  put(rect(GL.x0 - 4, GL.y0 - 4, GL.x1 + 4, HY + 40), skyAt(t));
}

function sunAt(t) {
  if (t < 6.5) {
    const u = t / 5.6;
    return { x: 388 + 6 * u, y: lerp(446, 640, Math.pow(u, 1.2)), red: sm(u), a: 1 - ramp(t, 5.2, 6.2) };
  }
  if (t > 28.5 && t < T.noon[0]) {
    const u = clamp((t - 29.3) / 4.7, 0, 1), rise = sm(ramp(t, T.climb, 37.4));
    return { x: 892 - 6 * u - 90 * rise, y: lerp(640, 470, u) - 600 * rise, red: 1 - sm(u), a: ramp(t, 28.5, 29.6) * (1 - ramp(t, 36.6, T.noon[0])) };
  }
  if (t > T.golden - 0.8) {
    const s = ramp(t, T.golden - 0.8, DUR), f = s + 0.8 * s * (1 - s);
    return { x: lerp(300, 388, f), y: lerp(-130, 446, f), red: 0, a: ramp(t, T.golden - 0.8, T.golden + 0.4) };
  }
  return null;
}
function sun(t) {
  const s = sunAt(t);
  if (!s) return;
  const r = 44;
  glow('yellow', s.x, s.y, r, 360, 0.5 * s.a);
  glow('pink', s.x, s.y, r, 240, 0.18 * s.a * (0.4 + s.red));
  glow('blue', s.x, s.y, r * 0.8, 300, 0.75 * s.a, 'destination-out');
  glow('indigo', s.x, s.y, r * 0.8, 260, 0.8 * s.a, 'destination-out');
  const disc = cut(ringPts(s.x, s.y, r, r, 14), rngFor('sun'), { amp: 1.4 });
  knock(disc, { blue: s.a, indigo: s.a, pink: s.a });
  add(disc, { yellow: s.a, pink: (0.22 + s.red * 0.5) * s.a });
}

/* Clouds are built from billows: a dome of overlapping rounds on a flat
   base. Each billow is modelled by subtraction toward the light, so the
   forms read as volume, not as bars. The light moves through the night: the
   low sun from below-left at dusk, the city's sodium glow from below at
   night, the rising sun from the right at dawn. */
function cloudShape(key, w, h, o = {}) {
  const r = rngFor('cloud:' + key), billows = [], mam = [];
  const n = o.n || Math.max(4, Math.round(w / (h * 0.5)));
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0 : (i / (n - 1)) * 2 - 1, dome = Math.pow(1 - Math.abs(u) * 0.92, 0.8);
    const rad = h * (0.26 + 0.3 * dome) * (0.8 + r() * 0.4);
    billows.push({ dx: u * (w / 2 - rad * 0.55) + (r() - 0.5) * rad * 0.35, dy: -(rad * 0.5 + h * 0.5 * dome * (0.75 + r() * 0.35)), r: rad, seed: key + ':' + i });
  }
  if (o.tower) for (let i = 0; i < o.tower; i++) {                // a second tier of smaller billows on top
    const u = (r() * 2 - 1) * 0.55, rad = h * (0.2 + r() * 0.14);
    billows.push({ dx: u * w / 2, dy: -(h * 0.95 + rad * 0.2 + r() * h * 0.2), r: rad, seed: key + ':t' + i });
  }
  if (o.mammatus) for (let i = 0; i < o.mammatus; i++) mam.push({ dx: (r() * 2 - 1) * w * 0.4, r: 7 + r() * 13, seed: key + ':m' + i });
  const belly = [];
  if (o.belly) for (let i = 0; i < o.belly; i++) {                // a row of low billows, so the base is lumpy
    const u = (i + 0.5) / o.belly * 2 - 1, rad = 16 + r() * 22;
    belly.push({ dx: u * w * 0.46 + (r() - 0.5) * 18, dy: rad * 0.1 - r() * 10, r: rad, seed: key + ':b' + i });
  }
  return { w, h, billows, mam, belly, key };
}
function cloudPath(c, x, base, k, mam = true) {
  const p = new Path2D();
  for (const b of c.billows) p.addPath(cut(ringPts(x + b.dx * k, base + b.dy * k, b.r * k, b.r * 0.84 * k, 12), rngFor(b.seed), { amp: b.r * 0.05 * k }));
  const hw = c.w / 2 * k, belly = c.belly || [];
  if (belly.length) {
    for (const b of belly) p.addPath(cut(ringPts(x + b.dx * k, base + b.dy * k, b.r * k, b.r * 0.72 * k, 12), rngFor(b.seed), { amp: b.r * 0.06 * k }));
    /* a round core, not a trapezoid: straight flanks show wherever the billows leave a gap */
    p.addPath(cut(ringPts(x, base - c.h * 0.22 * k, hw * 0.82, c.h * 0.26 * k, 16), rngFor(c.key + ':base'), { amp: 3 }));
  } else p.addPath(cut([[x - hw, base], [x - hw * 0.7, base - c.h * 0.32 * k], [x + hw * 0.7, base - c.h * 0.32 * k], [x + hw, base], [x + hw * 0.4, base + 3], [x - hw * 0.4, base + 3]], rngFor(c.key + ':base'), { amp: 2 }));
  if (mam) p.addPath(mamPath(c, x, base, k));
  return p;
}
function mamPath(c, x, base, k) {
  const p = new Path2D();
  for (const m of c.mam) p.addPath(cut(ringPts(x + m.dx * k, base + m.r * 0.45 * k + (c.belly && c.belly.length ? 14 * k : 0), m.r * k, m.r * 0.78 * k, 10), rngFor(m.seed), { amp: 1.2 }));
  return p;
}
/* look: body(top, base) → cov; light [lx, ly]; hi plates knocked on each billow's lit side; hiAdd inked there. */
function drawCloud(c, x, base, k, look, a, mam = true) {
  if (a <= 0.01) return;
  const p = cloudPath(c, x, base, k, mam), top = base - c.h * 1.15 * k;
  put(p, look.body(top, base), undefined, a);
  withClip(p, () => {
    for (const b of c.billows) {
      const bx = x + (b.dx + look.light[0] * b.r * 0.42) * k, by = base + (b.dy + look.light[1] * b.r * 0.42) * k;
      for (const pl in look.hi) glow(pl, bx, by, 0, b.r * 1.02 * k, look.hi[pl] * a, 'destination-out');
      for (const pl in look.hiAdd || {}) glow(pl, bx, by, 0, b.r * 0.9 * k, look.hiAdd[pl] * a);
    }
    if (look.under) { const y0 = base - c.h * 0.3 * k; add(rect(x - c.w * k, y0, x + c.w * k, base + 30), scaleCov(look.under(y0, base + 16), a)); }
  });
}
const ramp2 = (top, base, a, b) => ({ ys: [top, base], as: [a, b] });
const LOOK = {
  dusk: { light: [-0.6, 0.5], hi: { blue: .22, indigo: .1 }, hiAdd: { yellow: .24, pink: .1 },
    body: (t0, b) => ({ blue: ramp2(t0, b, .34, .14), pink: ramp2(t0, b, .24, .4), yellow: ramp2(t0, b, .04, .3), indigo: ramp2(t0, b, .1, 0) }),
    under: (y0, y1) => ({ pink: ramp2(y0, y1, 0, .16), yellow: ramp2(y0, y1, 0, .2) }) },
  night: { light: [0, 0.75], hi: { indigo: .26, blue: .1 }, hiAdd: { pink: .06 },
    body: (t0, b) => ({ indigo: ramp2(t0, b, .72, .5), blue: ramp2(t0, b, .52, .44), pink: ramp2(t0, b, .06, .26), yellow: ramp2(t0, b, 0, .08) }),
    under: (y0, y1) => ({ pink: ramp2(y0, y1, 0, .12), yellow: ramp2(y0, y1, 0, .05) }) },
  dawn: { light: [0.65, -0.25], hi: { blue: .2, indigo: .1, pink: .06 }, hiAdd: { yellow: .16 },
    body: (t0, b) => ({ blue: ramp2(t0, b, .2, .24), pink: ramp2(t0, b, .3, .34), yellow: ramp2(t0, b, .14, .1), indigo: ramp2(t0, b, .02, .06) }),
    under: (y0, y1) => ({ pink: ramp2(y0, y1, 0, .14) }) },
};
const NOON_LOOK = {
  hi: { blue: .16, indigo: .06, pink: .06, yellow: .04 }, hiAdd: {},
  body: (t0, b) => ({ blue: ramp2(t0, b, .08, .3), indigo: ramp2(t0, b, 0, .1), pink: ramp2(t0, b, .02, .06), yellow: ramp2(t0, b, .02, .03) }),
  under: (y0, y1) => ({ blue: ramp2(y0, y1, 0, .16), indigo: ramp2(y0, y1, 0, .07) }),
};
/* 0 at dawn and dusk, 1 through the high part of the day. */
const noonW = t => sm(clamp((sunHigh(t) - 0.2) / 0.55, 0, 1));
function lookAt(t) {
  const n = nightness(t), m = morn(t), w = noonW(t), A = LOOK.dusk, B = LOOK.dawn, N = LOOK.night;
  const mixF = (f, g, u) => (t0, b) => mixCov(f(t0, b), g(t0, b), u);
  const mixO = (o1, o2, u) => { const o = {}; for (const pl of PL) { const v = lerp(o1[pl] || 0, o2[pl] || 0, u); if (v) o[pl] = v; } return o; };
  const mixL = (a, b, u) => ({ light: [lerp(a.light[0], b.light[0], u), lerp(a.light[1], b.light[1], u)], hi: mixO(a.hi, b.hi, u), hiAdd: mixO(a.hiAdd, b.hiAdd, u),
    body: mixF(a.body, b.body, u), under: mixF(a.under, b.under, u) });
  const noon = Object.assign({ light: [0.45 * sunSide(t), -0.7] }, NOON_LOOK);
  return mixL(mixL(mixL(A, B, m), noon, w), N, n);
}

/* Fair-weather cumulus: flat shaded bases, domed lit tops. White at noon,
   coloured by the low sun at either end of the day. They clear out for the storm. */
function cumulus(key, w, h) {
  const r = rngFor('cu:' + key), billows = [];
  for (const [dx, dy, rad] of [[-0.34, -0.3, 0.32], [-0.1, -0.56, 0.46], [0.14, -0.64, 0.52], [0.36, -0.36, 0.34]])
    billows.push({ dx: (dx + (r() - 0.5) * 0.05) * w, dy: dy * h * (0.92 + r() * 0.16), r: rad * h * (0.92 + r() * 0.16), seed: key + ':' + billows.length });
  return { w, h, billows, mam: [], key };
}
const FAIR = [
  { c: cumulus('A', 280, 112), x: 470, base: 384, v: 3 },
  { c: cumulus('B', 240, 96), x: 830, base: 240, v: 4 },
  { c: cumulus('C', 170, 70), x: 240, base: 198, v: 3.5 },
];
function fairClouds(t) {
  const a = 1 - cloudAt(t) * 1.4 - ramp(t, 11.6, 13.6) * (1 - ramp(t, 25, 28));
  if (a <= 0.01) return;
  const look = lookAt(t), A = clamp(a, 0, 1);
  const L0 = GL.x0 - 190, WRAP = GL.x1 - GL.x0 + 380;
  for (const f of FAIR) {
    /* the storm hides them, so they jump back one loop's drift there and meet t = 0 again */
    const drift = f.v * (t < T.bolt ? t : t - DUR);
    const x = L0 + (((f.x - L0 - drift) % WRAP) + WRAP) % WRAP;
    withClip(rect(-200, -400, W + 200, f.base + 1), () => drawCloud(f.c, x, f.base, 1, look, A));
  }
}

/* The storm comes in as a mass: a dark deck lowers from the top with a
   billowed leading edge, and cumulonimbus heads push down through it at
   uneven heights. Their undersides are dark, and the lowest lumps carry the
   city's sodium glow until the power fails. Mammatus hangs under the bases
   only once the storm is overhead. */
const CB = [
  { c: cloudShape('cbFarL', 420, 130, { mammatus: 4, belly: 9 }), x: 300, base: 470, far: 1 },
  { c: cloudShape('cbFarR', 380, 110, { mammatus: 3, belly: 8 }), x: 770, base: 440, far: 0.85 },
  { c: cloudShape('cbL', 520, 250, { tower: 4, mammatus: 9, belly: 11 }), x: 170, base: 330, far: 0.4 },
  { c: cloudShape('cbR', 460, 230, { tower: 3, mammatus: 8, belly: 10 }), x: 900, base: 350, far: 0.5 },
  { c: cloudShape('cbM', 600, 210, { tower: 3, mammatus: 10, belly: 13 }), x: 610, base: 250, far: 0 },
];
const DECK = (() => {
  const r = rngFor('deck'), out = [];
  for (let x = GL.x0 - 140; x < GL.x1 + 220; x += 30 + r() * 26) out.push({ x, dy: r() * 34, r: 26 + r() * 30, seed: 'deck:' + out.length });
  return out;
})();
function stormDeck(t, y, glowOn) {
  if (y < GL.y0 - 100) return;
  const dx = -2.5 * t, p = rect(GL.x0 - 200, -400, GL.x1 + 260, y - 12);
  for (const b of DECK) p.addPath(cut(ringPts(b.x + dx, y - b.dy, b.r, b.r * 0.7, 12), rngFor(b.seed), { amp: b.r * 0.07 }));
  put(p, { indigo: ramp2(GL.y0, y + 30, .54, .7), blue: ramp2(GL.y0, y + 30, .5, .46), pink: ramp2(GL.y0, y + 30, .08, .14 + .1 * glowOn), yellow: ramp2(GL.y0, y + 30, 0, .04 * glowOn) });
  withClip(p, () => add(rect(GL.x0 - 200, y - 50, GL.x1 + 260, y + 40), { pink: ramp2(y - 50, y + 30, 0, .16 * glowOn), yellow: ramp2(y - 50, y + 30, 0, .08 * glowOn) }));
}
function storm(t) {
  const C = cloudAt(t);
  if (C <= 0.01) return;
  const glowOn = t < offAt(600) || t > T.restore[1] ? 1 : 0;
  const lift = ramp(t, T.cloudsOut[0], T.cloudsOut[1]);
  const inU = ramp(t, T.cloudsIn[0], T.cloudsIn[1]);
  const deckY = lerp(GL.y0 - 110, 430, sm(clamp(inU / 0.85, 0, 1)));
  stormDeck(t, deckY - sm(lift) * (deckY - GL.y0 + 130), glowOn);
  const overhead = ramp(inU, 0.8, 1) * (1 - ramp(lift, 0, 0.3));
  for (const m of CB) {
    const arrive = sm(clamp((inU - (1 - m.far) * 0.35) / 0.65, 0, 1));
    const leave = sm(clamp((lift - m.far * 0.3) / 0.7, 0, 1));
    if (arrive <= 0 || leave >= 1) continue;
    const base = m.base - (1 - arrive) * (m.base + 160) - leave * (m.base + 200);
    const k = 1 - m.far * 0.12, dim = 1 - m.far * 0.25;
    const look = {
      light: [0, 0.8], hi: { indigo: (.12 + .16 * glowOn) * dim, blue: .08 }, hiAdd: { pink: .12 * glowOn, yellow: .05 * glowOn },
      body: (t0, b) => ({ indigo: ramp2(t0, b, .56 * dim, .84 * dim), blue: ramp2(t0, b, .48 * dim, .5 * dim), pink: ramp2(t0, b, .06, .1 + .1 * glowOn), yellow: ramp2(t0, b, 0, .03 * glowOn) }),
      under: (y0, y1) => ({ pink: ramp2(y0, y1, 0, .24 * glowOn), yellow: ramp2(y0, y1, 0, .12 * glowOn) }),
    };
    const x = m.x - t * (3 + m.far * 3);
    drawCloud(m.c, x, base, k, look, 1, false);
    if (overhead > 0.01) {
      const mp = mamPath(m.c, x, base, k);
      put(mp, look.body(base - m.c.h * k, base), undefined, overhead);
      withClip(mp, () => add(rect(x - m.c.w * k, base, x + m.c.w * k, base + 60), scaleCov({ pink: ramp2(base, base + 40, .06, .2 * glowOn), yellow: ramp2(base, base + 40, 0, .08 * glowOn) }, overhead)));
    }
  }
  const f = flickerAt(t);
  if (f) {
    glow('indigo', f.x, 260, 20, 380, 0.85 * f.a, 'destination-out');
    glow('blue', f.x, 260, 20, 320, 0.6 * f.a, 'destination-out');
    glow('pink', f.x, 270, 10, 300, 0.32 * f.a);
    glow('yellow', f.x, 260, 10, 200, 0.22 * f.a);
  }
}

/* Swifts: a flock wheels across the sunset gap at dusk and a smaller one
   heads out at dawn. Each bird keeps its own place in the flock, its own
   wingbeat and a slow drift, so the group breathes instead of marching. */
const FLOCKS = [
  { t0: 0.3, t1: 6.6, n: 12, from: [-80, 420], via: [420, 300], to: [1160, 250], spread: [140, 56], s: 1, seed: 'dusk' },
  { t0: 31.0, t1: 35.0, n: 9, from: [1150, 330], via: [700, 250], to: [-80, 210], spread: [110, 40], s: 0.85, seed: 'dawn' },
].map(f => {
  const r = rngFor('flock:' + f.seed), birds = [];
  for (let i = 0; i < f.n; i++) birds.push({ dx: (r() - 0.5) * f.spread[0], dy: (r() - 0.5) * f.spread[1], ph: r() * TAU, s: 0.75 + r() * 0.45, f: 3.2 + r() * 1.6, lag: r() * 0.08, wob: r() * TAU });
  return Object.assign(f, { birds });
});
function swifts(t) {
  const p = new Path2D();
  for (const f of FLOCKS) {
    if (t < f.t0 || t > f.t1) continue;
    for (const b of f.birds) {
      const u = clamp((t - f.t0) / (f.t1 - f.t0) - b.lag, 0, 1), v = 1 - u;
      const cx = v * v * f.from[0] + 2 * v * u * f.via[0] + u * u * f.to[0];
      const cy = v * v * f.from[1] + 2 * v * u * f.via[1] + u * u * f.to[1];
      const squeeze = 0.6 + 0.4 * Math.sin(u * Math.PI * 2 + 1);
      const x = cx + b.dx * squeeze + Math.sin(t * 1.3 + b.wob) * 8, y = cy + b.dy * squeeze + Math.cos(t * 1.7 + b.wob) * 5;
      const dir = f.to[0] > f.from[0] ? 1 : -1;
      const fl = Math.sin(TAU * t * b.f + b.ph), k = 13 * b.s * f.s;
      const tip = k * (0.35 + 0.25 * fl);
      const L = [x - k, y - tip], R = [x + k, y - tip];
      const pts = [L, [x - k * 0.45, y - tip * 0.2 + 1.5], [x + dir * 1.5, y + 1.8], [x + k * 0.45, y - tip * 0.2 + 1.5], R];
      p.addPath(nib(pts, wSwell(2.3 * b.s * f.s, 0.5, 0.42), { per: 4 }));
      p.moveTo(x + dir * 3, y + 1); p.ellipse(x + dir * 1, y + 1, 3.2 * b.s * f.s, 1.6 * b.s * f.s, 0, 0, TAU);
    }
  }
  add(p, { indigo: .82, pink: .28, blue: .2 });
}


/* A landing plane: strobe and beacon, very small. */
function plane(t) {
  if (t < T.plane[0] || t > T.plane[1]) return;
  const u = (t - T.plane[0]) / (T.plane[1] - T.plane[0]);
  const x = lerp(1010, 60, u), y = lerp(150, 122, u) + Math.sin(u * 3) * 4;
  if (fract(t * 0.85) < 0.08) {
    glow('indigo', x, y, 1, 10, 1, 'destination-out'); glow('blue', x, y, 1, 9, 1, 'destination-out');
    glow('yellow', x, y, 0, 5, 0.4);
  }
  if (fract(t * 0.85 + 0.5) < 0.2) { glow('indigo', x + 6, y + 1, 1, 6, 0.8, 'destination-out'); glow('pink', x + 6, y + 1, 0, 4, 1); }
}

/* After the storm: the last cell retreats west (left) with a rain curtain
   under it, and when the sun comes up in the east the rainbow stands on it,
   behind the city and Monas. The bow is centred on the antisolar side. */
const BOW = { x: 250, y: 830, r: 560 };
const WEST = cloudShape('west', 720, 150, { n: 10, mammatus: 8 });
function westCell(t) {
  const a = ramp(t, 26.5, 29) * (1 - ramp(t, 35, 37.5));
  if (a <= 0.01) return;
  const x = 170 - (t - 26.5) * 7, base = 206, lit = ramp(t, 29.2, 31.5);
  const look = {
    light: [0.8, -0.35], hi: { indigo: .4 * lit, blue: .26 * lit }, hiAdd: { pink: .26 * lit, yellow: .2 * lit },
    body: (t0, b) => ({ indigo: ramp2(t0, b, .5 - .24 * lit, .54 - .06 * lit), blue: ramp2(t0, b, .48 - .1 * lit, .46), pink: ramp2(t0, b, .14 + .12 * lit, .16 + .04 * lit), yellow: ramp2(t0, b, 0, .02 * lit) }),
    under: (y0, y1) => ({ indigo: ramp2(y0, y1, 0, .14), blue: ramp2(y0, y1, 0, .06) }),
  };
  /* the rain it is still dropping to the west: a veil the rainbow stands in */
  const veil = rect(x - 380, base, x + 300, 720);
  add(veil, { blue: ramp2(base, 720, .12 * a, 0), indigo: ramp2(base, 720, .08 * a, 0) });
  const curtain = new Path2D(), r = rngFor('curtain');
  for (let i = 0; i < 90; i++) { const cx = x - 330 + r() * 600, y0 = base + 4 + r() * 20, L = 180 + r() * 240; curtain.moveTo(cx, y0); curtain.lineTo(cx - 24, y0 + L); }
  strokeOn('blue', curtain, 2.4, .14 * a); strokeOn('indigo', curtain, 2.4, .08 * a);
  drawCloud(WEST, x, base, 1, look, a);
}
/* A bow faces away from the sun, so it is gone before the sun clears the towers. */
function rainbow(t) {
  const a = ramp(t, 30.3, 32.4) * (1 - ramp(t, 33.6, 34.8));
  if (a <= 0.01) return;
  const { x, y, r } = BOW;
  const bands = [['red', { pink: .78, yellow: .62 }], ['orange', { yellow: .8, pink: .42 }], ['yellow', { yellow: .82 }],
    ['green', { yellow: .6, blue: .5 }], ['blue', { blue: .66 }], ['violet', { blue: .4, pink: .38, indigo: .1 }]];
  const bw = 7.5, a0 = Math.PI * 1.03, a1 = Math.PI * 1.97, segs = 36;
  /* brighter sky inside the bow, the dark band between the bows outside it */
  const inside = new Path2D(); inside.arc(x, y, r - bands.length * bw, a0, a1); inside.lineTo(x, y); inside.closePath();
  knock(inside, { indigo: .14 * a, blue: .1 * a });
  for (let s = 0; s < segs; s++) {
    const u0 = s / segs, u1 = (s + 1) / segs, th0 = lerp(a0, a1, u0), th1 = lerp(a0, a1, u1) + 0.002;
    const um = (u0 + u1) / 2, fade = a * Math.pow(Math.sin(Math.PI * clamp((um - 0.02) / 0.8, 0, 1)), 0.7);
    if (fade <= 0.02) continue;
    const arcBand = new Path2D(); arcBand.arc(x, y, r, th0, th1); arcBand.arc(x, y, r - bands.length * bw, th1, th0, true); arcBand.closePath();
    knock(arcBand, { indigo: .55 * fade, blue: .35 * fade, pink: .25 * fade, yellow: .2 * fade });
    bands.forEach(([, cov], i) => {
      const band = new Path2D(); band.arc(x, y, r - i * bw, th0, th1); band.arc(x, y, r - (i + 1) * bw, th1, th0, true); band.closePath();
      add(band, scaleCov(cov, fade * 0.9));
    });
  }
}

/* ── the city ─────────────────────────────────────────────────────────────── */

/* A calm, low far city: flat blocks, one mast, a few lit floors. */
const FAR = (() => {
  const r = rngFor('far2'), out = [];
  let x = GL.x0 - 30;
  while (x < GL.x1 + 30) {
    const w = 26 + r() * 40, h = 16 + Math.pow(r(), 1.4) * 46;
    const lights = [];
    for (let y = HY - h + 7; y < HY - 4; y += 8) for (let lx = x + 4; lx < x + w - 9; lx += 10) if (r() < 0.32) lights.push([lx, y, r()]);
    out.push({ x, w, h, lights, mast: r() < 0.06 });
    x += w * (0.7 + r() * 0.4);
  }
  return out;
})();
function farCity(t) {
  const n = nightness(t), R = rainAt(t);
  const p = new Path2D();
  for (const b of FAR) {
    p.rect(b.x, HY - b.h, b.w, b.h + 40);
    if (b.mast) p.rect(b.x + b.w * 0.5 - 1.5, HY - b.h - 20, 3, 20);
  }
  const day = { blue: .28, pink: .28, yellow: .1, indigo: .03 }, night = { indigo: .46, blue: .48, pink: .18, yellow: .04 };
  const c = mixCov(day, night, n);
  put(p, { yellow: c.yellow, pink: c.pink, blue: { ys: [HY - 70, HY + 30], as: [c.blue * 0.9, c.blue * 1.1] }, indigo: { ys: [HY - 70, HY + 30], as: [c.indigo * 0.85, c.indigo * 1.15] } });
  const lit = new Path2D();
  const rate = n * (1 - 0.55 * ramp(t, 11.6, 20)) * (1 - 0.6 * R);
  for (let i = 0; i < FAR.length; i++) {
    const b = FAR[i];
    if (!powered(b.x, t, 'far' + (i >> 2))) continue;
    for (const [x, y, q] of b.lights) if (q < rate * 0.8) lit.rect(x, y, 6, 3);
  }
  knock(lit, { indigo: .85, blue: .75 }); add(lit, { yellow: .8, pink: .3 });
}

const TOWERS = [
  { x0: 104, x1: 170, top: 352, crown: 'flat', band: 1 },
  { x0: 164, x1: 246, top: 272, crown: 'step', band: 0 },
  { x0: 240, x1: 310, top: 402, crown: 'mast', band: 1 },
  { x0: 296, x1: 346, top: 456, crown: 'flat', band: 0 },
  { x0: 432, x1: 506, top: 476, crown: 'roof', band: 1, far: 1 },
  { x0: 688, x1: 760, top: 462, crown: 'flat', band: 0, far: 1 },
  { x0: 774, x1: 842, top: 368, crown: 'dome', band: 1 },
  { x0: 834, x1: 918, top: 288, crown: 'mast', band: 0 },
  { x0: 910, x1: 1002, top: 336, crown: 'step', band: 1 },
];
const TBASE = 668;
function towerShape(b) {
  const p = rect(b.x0, b.top, b.x1, TBASE), w = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2;
  let tip = null;
  if (b.crown === 'step') { p.rect(b.x0 + w * 0.12, b.top - 16, w * 0.76, 17); p.rect(b.x0 + w * 0.3, b.top - 30, w * 0.4, 15); }
  if (b.crown === 'mast') { p.rect(b.x0 + w * 0.2, b.top - 12, w * 0.6, 13); p.rect(cx - 1.6, b.top - 70, 3.2, 60); tip = [cx, b.top - 70]; }
  if (b.crown === 'dome') { p.moveTo(b.x0 + w * 0.14, b.top + 1); p.ellipse(cx, b.top + 1, w * 0.36, 26, 0, Math.PI, TAU); }
  if (b.crown === 'roof') { p.moveTo(b.x0 - 3, b.top + 1); p.lineTo(cx, b.top - 26); p.lineTo(b.x1 + 3, b.top + 1); p.closePath(); }
  if (b.crown === 'flat') p.rect(b.x0 + w * 0.55, b.top - 10, w * 0.3, 11);
  return { p, tip };
}
const FLOOR = 12, BAY = 16, GAP = 3.5;
/* Offices light whole floors at dusk and empty out through the evening, leaving
   a few late bays; apartments light unit by unit and stay on later. */
const OFFICE = [false, true, true, false, false, true, true, true, false];
const LIT = TOWERS.map((b, i) => {
  const r = rngFor('floors' + i), bays = [];
  const bayXs = [];
  for (let x = b.x0 + 3; x < b.x1 - 6; x += BAY) bayXs.push([x, Math.min(BAY - GAP, b.x1 - 3 - x)]);
  for (let y = b.top + 7; y < TBASE - 8; y += FLOOR) {
    if (OFFICE[i]) {
      const on = lerp(T.towersOn[0], T.towersOn[0] + 3.8, r()) + (b.far ? 0.4 : 0);
      const lateFloor = r() < 0.06, off = lateFloor ? 31 + r() * 3 : 11.6 + r() * 6.5;
      const cool = r() < 0.8;
      for (const [x, w] of bayXs) bays.push({ x, y, w, on, off: !lateFloor && r() < 0.08 ? 31 + r() * 3.5 : off, cool });
    } else {
      for (const [x, w] of bayXs) {
        if (r() > 0.5) continue;
        const on = lerp(T.towersOn[0] + 0.6, T.towersOn[1], Math.pow(r(), 0.8)) + (b.far ? 0.4 : 0);
        bays.push({ x, y, w, on, off: r() < 0.3 ? 30.5 + r() * 4 : 12.5 + r() * 7, cool: r() < 0.15 });
      }
    }
  }
  return bays;
});
function towers(t) {
  const n = nightness(t);
  for (let i = 0; i < TOWERS.length; i++) {
    const b = TOWERS[i], { p, tip } = towerShape(b), w = b.x1 - b.x0, k = b.far ? 0.8 : 1;
    const ys = [b.top - 30, TBASE];
    /* the glass reflects the sky: blue at noon, warm when the sun is low */
    const hi = { blue: { ys, as: [.42 * k, .62 * k] }, pink: { ys, as: [.12 * k, .26 * k] }, indigo: { ys, as: [.06 * k, .26 * k] }, yellow: .05 };
    const low = { blue: { ys, as: [.34 * k, .56 * k] }, pink: { ys, as: [.26 * k, .36 * k] }, indigo: { ys, as: [.06 * k, .22 * k] }, yellow: .08 };
    const day = mixCov(low, hi, noonW(t));
    const nite = { indigo: .8 * k, blue: .56 * k, pink: .1, yellow: 0 };
    const dawn = { blue: { ys, as: [.38 * k, .56 * k] }, pink: { ys, as: [.2 * k, .3 * k] }, indigo: { ys, as: [.06 * k, .24 * k] }, yellow: .06 };
    let c = mixCov(day, nite, n);
    c = mixCov(c, dawn, (1 - n) * morn(t));
    put(p, c);
    const shadeFace = rect(b.x0 + w * 0.62, b.top - 40, b.x1, TBASE);
    add(shadeFace, { blue: .12 * k, indigo: .06 + .08 * n });
    const sl = sunLine(t);
    if (sl && sl.a > 0) {
      const west = (1 - sl.side) / 2;
      for (const [face, k2] of [[rect(b.x0, b.top - 80, b.x0 + w * 0.62, TBASE), west], [shadeFace, 1 - west]]) {
        if (k2 <= 0.01) continue;
        softAbove(sl.y, (clip, wgt) => withClip(clip, () => withClip(p, () => {
          const u = sl.a * wgt * k2;
          knock(face, { blue: .3 * u, indigo: .2 * u, pink: .06 * u }); add(face, { yellow: .34 * u, pink: .16 * u });
        })));
      }
    }
    /* curtain wall: spandrel lines at each floor, faint mullions */
    const dayK = 1 - n;
    if (dayK > 0.05) withClip(p, () => {
      const spandrel = new Path2D(), mull = new Path2D();
      for (let y = b.top + 7 + FLOOR - 4.5; y < TBASE; y += FLOOR) spandrel.rect(b.x0, y, w, 4.5);
      for (let x = b.x0 + 3 + BAY - GAP; x < b.x1 - 4; x += BAY) mull.rect(x, b.top, 2.5, TBASE - b.top);
      add(spandrel, { indigo: .28 * dayK * k });
      knock(mull, { blue: .12 * dayK, indigo: .08 * dayK });
    });
    const warm = new Path2D(), cool = new Path2D();
    for (const bay of LIT[i]) {
      if (t < bay.on || t > bay.off) continue;
      if (!powered(bay.x, t, 'tower' + i)) continue;
      (bay.cool ? cool : warm).rect(bay.x, bay.y, bay.w, 5.5);
    }
    const lf = ramp(t, T.towersOn[0], T.towersOn[0] + 1.5) * (1 - 0.85 * ramp(t, 30.5, 33.5));
    knock(warm, { indigo: lf, blue: lf, pink: .6 * lf }); add(warm, { yellow: .9 * lf, pink: .3 * lf });
    knock(cool, { indigo: lf, blue: .85 * lf, pink: lf }); add(cool, { blue: .16 * lf, yellow: .14 * lf });
    /* aircraft warning lights: steady on the tall roofs, slow blink on the masts */
    if (n > 0.3 && powered(b.x0, t, 'tower' + i)) {
      const reds = [];
      if (tip && Math.sin(cyc(t, 0.8) + i * 2.3) > -0.2) reds.push(tip);
      if (b.top < 380 && b.crown === 'dome') reds.push([(b.x0 + b.x1) / 2, b.top - 24]);
      else if (b.top < 380 && b.crown !== 'mast') { const y = b.crown === 'step' ? b.top - 30 : b.top; const e = b.crown === 'step' ? 0.3 : 0.08; reds.push([b.x0 + w * e + 2, y], [b.x1 - w * e - 2, y]); }
      const a = ramp(n, 0.3, 0.6);
      for (const [x, y] of reds) {
        glow('indigo', x, y, 1, 12, .9 * a, 'destination-out'); glow('blue', x, y, 1, 10, .9 * a, 'destination-out');
        const dot = new Path2D(); dot.arc(x, y, 3, 0, TAU);
        add(dot, { pink: a, yellow: .5 * a }); glow('pink', x, y, 2, 11, .5 * a);
      }
    }
  }
}


/* KRL commuter train on its viaduct, behind the square: a stainless body with
   the red stripe by day, lit windows after dark. */
const TRAIN_Y = 603;
function viaduct(t) {
  const n = nightness(t);
  const deck = rect(GL.x0 - 4, TRAIN_Y + 10, GL.x1 + 4, TRAIN_Y + 17);
  for (let x = GL.x0 + 20; x < GL.x1; x += 78) deck.rect(x, TRAIN_Y + 16, 7, 40);
  put(deck, mixCov({ blue: .36, pink: .28, indigo: .08, yellow: .04 }, { indigo: .66, blue: .5, pink: .1 }, n));
}
function train(t) {
  const run = [T.train, T.dayTrain].find(([a, b]) => t >= a && t <= b);
  if (!run) return;
  const n = nightness(t), u = (t - run[0]) / (run[1] - run[0]);
  const CAR = 62, len = 8 * CAR, head = lerp(GL.x0 - 20, GL.x1 + len + 20, u);
  const y0 = TRAIN_Y - 10, y1 = TRAIN_Y + 10;
  const body = new Path2D(), win = new Path2D(), stripe = new Path2D(), roof = new Path2D();
  for (let c = 0; c < 8; c++) {
    const x1 = head - c * CAR, x0 = x1 - CAR + 3, nose = c === 0 ? 7 : 0;
    body.moveTo(x0, y0); body.lineTo(x1 - nose, y0); body.lineTo(x1, y0 + 8); body.lineTo(x1, y1); body.lineTo(x0, y1); body.closePath();
    roof.rect(x0, y0, CAR - 3 - nose, 2.5);
    for (let k = 0; k < 5; k++) win.rect(x0 + 4 + k * 11.4, y0 + 4, 8, 6);
    if (c === 0) win.rect(x1 - nose + 1, y0 + 3, nose - 2, 5);
    stripe.rect(x0, y0 + 12, CAR - 3 - nose * 0.2, 4);
  }
  put(body, mixCov({ blue: .14, indigo: .07, pink: .05, yellow: .04 }, { indigo: .6, blue: .5, pink: .08 }, n));
  add(roof, { indigo: .2 + .2 * n, blue: .1 });
  put(win, mixCov({ indigo: .5, blue: .42, pink: .06 }, { yellow: .88, pink: .2 }, n));
  put(stripe, mixCov({ pink: .95, yellow: .55 }, { pink: .7, yellow: .25, indigo: .25 }, n));
  const hl = [head + 2, y0 + 12];
  glow('indigo', hl[0], hl[1], 1, 16, .9, 'destination-out'); glow('yellow', hl[0] + 4, hl[1], 0, 14, .8);
}

/* ── Monas ────────────────────────────────────────────────────────────────────
   Proportions from photographs: shaft ~9 m at the cup narrowing to ~5.6 m,
   observation deck ~12 m wide at 115 m, flame ~6 × 12 m on a bronze base,
   cup rim ~50 m on a narrower pedestal, 132 m overall.                    */

const M = { x: 604, y0: 690, s: 3.5 };
const mX = d => M.x + d * M.s, mY = h => M.y0 - h * M.s;
const P = pts => poly(pts.map(([d, h]) => [mX(d), mY(h)]));
const MON = (() => {
  const bowlR = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10; bowlR.push([16.2 + 8.4 * Math.pow(u, 1.7), 8.2 + u * 6.8]); }
  const bowl = P([...bowlR.map(([d, h]) => [-d, h]).reverse(), ...bowlR]);
  const parts = {
    terrace: P([[-46, -3], [46, -3], [46, 1.6], [40, 1.6], [40, 3.6], [-40, 3.6], [-40, 1.6], [-46, 1.6]]),
    pedestal: P([[-14.5, 3.4], [14.5, 3.4], [14.5, 8.4], [-14.5, 8.4]]),
    bowl,
    rim: P([[-25, 14.8], [25, 14.8], [25.8, 17.6], [-25.8, 17.6]]),
    shaft: P([[-4.5, 17.4], [4.5, 17.4], [2.8, 110.8], [-2.8, 110.8]]),
    flare: P([[-2.8, 110.6], [2.8, 110.6], [6.1, 113.5], [-6.1, 113.5]]),
    deck: P([[-6.1, 113.4], [6.1, 113.4], [6.1, 118.4], [-6.1, 118.4]]),
    lip: P([[-6.7, 118.3], [6.7, 118.3], [6.7, 119.1], [-6.7, 119.1]]),
    fbase: P([[-3.6, 119], [3.6, 119], [3.1, 120.8], [-3.1, 120.8]]),
  };
  const flameEdge = [[-3.0, 120.7], [-3.3, 122.2], [-2.55, 123.9], [-2.9, 124.9], [-1.85, 126.7], [-2.0, 127.5], [-0.95, 129.4], [-0.45, 130.9], [0.3, 132.3],
    [0.95, 130.5], [1.55, 128.9], [1.35, 128.1], [2.35, 126.3], [2.15, 125.3], [3.05, 123.4], [3.25, 121.9], [3.0, 120.7]];
  parts.flame = poly(curve(flameEdge.map(([d, h]) => [mX(d), mY(h)]), true, 6));
  const ribs = new Path2D();
  for (const [a, b, c] of [[-1.6, -0.6, 0.2], [0, 0.6, 0.9], [1.6, 1.4, 0.8]]) {
    const pts = curve([[mX(a), mY(121)], [mX(b), mY(124.5)], [mX(c * 0.8), mY(128)], [mX(0.25), mY(131.5)]], false, 8);
    pts.forEach(([x, y], i) => i ? ribs.lineTo(x, y) : ribs.moveTo(x, y));
  }
  parts.ribs = ribs;
  const all = new Path2D();
  for (const k of ['pedestal', 'bowl', 'rim', 'shaft', 'flare', 'deck', 'lip', 'fbase']) all.addPath(parts[k]);
  parts.body = all;
  parts.shadeFace = P([[1.2, 17.4], [4.5, 17.4], [2.8, 110.8], [0.75, 110.8], [0.75, 110.6], [2.8, 110.6], [6.1, 113.5], [6.1, 119.1], [1.6, 119.1], [1.6, 113.4]]);
  parts.shadeLow = P([[6, 3.4], [14.5, 3.4], [14.5, 8.4], [24.6, 14.8], [25.8, 17.6], [8, 17.6], [7, 8.4]]);
  parts.slit = P([[-5.7, 116.1], [5.7, 116.1], [5.7, 116.9], [-5.7, 116.9]]);
  parts.rimTop = P([[-25.8, 17.3], [25.8, 17.3], [25.8, 17.9], [-25.8, 17.9]]);
  parts.flameShade = poly(curve(flameEdge.slice(8).map(([d, h]) => [mX(Math.max(d, 0.2)), mY(h)]).concat([[mX(0.2), mY(120.7)]]), true, 4));
  parts.flameC = [mX(0), mY(125.5)];
  return parts;
})();

/* The last and first sun: everything above the line is in direct light.
   At dusk it climbs from the ground to the flame; at dawn it comes down. */
function sunLine(t) {
  if (t < 6.2) return { y: mY(terminatorAt(t)), a: 1 - ramp(t, 5.3, 5.9), side: -1 };
  if (t > 29.5) return { y: mY(terminatorAt(t)), a: ramp(t, T.firstLight - 0.4, T.firstLight + 0.3), side: sunSide(t) };
  return null;
}
/* Runs fn(clip, weight) over the region above y with a soft 28 px edge. */
function softAbove(y, fn) {
  fn(rect(-20, -400, W + 20, y - 14), 1);
  for (let i = 0; i < 7; i++) { const y0 = y - 14 + i * 4; fn(rect(-20, y0, W + 20, y0 + 4), 1 - (i + 0.5) / 7); }
}
/* The height (m) above which Monas is in direct sun. */
function terminatorAt(t) {
  if (t < 6) return lerp(-5, 134, sm(ramp(t, 1.8, T.lastLight)));
  if (t > 29) return lerp(133, -5, ramp(t, T.firstLight, 33.6));
  return 200;
}
function floodAt(t) {
  if (t < T.flood) return 0;
  const on = ramp(t, T.flood, T.flood + 0.35);
  const out = t >= offAt(M.x) && t < 24.6 ? 0 : 1;
  const warm = t >= 24.6 && t < 25.2 ? ramp(t, 24.6, 25.2) : 1;
  return on * out * warm * (1 - ramp(t, T.floodOff, T.floodOff + 0.4));
}
function monas(t) {
  const n = nightness(t), F = floodAt(t), hT = terminatorAt(t);
  const duskShade = { blue: .36, pink: .27, indigo: .05, yellow: .03 };
  const nightUnlit = { indigo: .86, blue: .58, pink: .12, yellow: 0 };
  const dawnShade = { blue: .4, pink: .24, indigo: .08, yellow: .02 };
  const flood = {
    blue: { ys: [mY(0), mY(125)], as: [.02, .28] }, indigo: { ys: [mY(0), mY(125)], as: [0, .1] },
    yellow: { ys: [mY(0), mY(125)], as: [.1, .02] }, pink: .04,
  };
  let c = mixCov(mixCov(duskShade, dawnShade, morn(t)), nightUnlit, n);
  c = mixCov(c, flood, F);
  put(MON.terrace, mixCov({ blue: .4, pink: .3, yellow: .14, indigo: .1 }, { indigo: .6, blue: .46, pink: .1 }, n));
  knock(rect(mX(-46), mY(1.6) - 1, mX(46), mY(1.6) + 1.5), { indigo: .3 + .3 * F, blue: .3 });
  put(MON.body, c);
  add(MON.shadeFace, { blue: .1 + .06 * (1 - F), indigo: .05 + .08 * n * (1 - F), pink: .03 });
  withClip(MON.body, () => add(MON.shadeLow, { blue: .1, indigo: .06 * n }));
  add(MON.bowl, { indigo: { ys: [mY(8.2), mY(15)], as: [.42, .04] }, blue: { ys: [mY(8.2), mY(15)], as: [.26, .02] }, pink: .04 });
  add(MON.pedestal, { indigo: .3, blue: .22 });

  /* direct sun above the terminator: lit face toward the sun, warm shade face */
  const sl = sunLine(t);
  if (sl && sl.a > 0) {
    const lit = { yellow: .3, pink: .17, blue: .02, indigo: 0 }, warmShade = { pink: .3, yellow: .18, blue: .2, indigo: .03 };
    const west = (1 - sl.side) / 2, bodyLit = mixCov(warmShade, lit, west), face = mixCov(lit, warmShade, west);
    softAbove(sl.y, (clip, wgt) => withClip(clip, () => {
      const u = sl.a * wgt;
      put(MON.body, mixCov(c, bodyLit, u));
      withClip(MON.body, () => { put(MON.shadeFace, mixCov(c, face, u)); put(MON.shadeLow, mixCov(c, face, u)); });
    }));
    const k = sl.a;
    add(MON.bowl, { indigo: { ys: [mY(8.2), mY(15)], as: [.36 * k, .02] }, blue: { ys: [mY(8.2), mY(15)], as: [.3 * k, .02] }, pink: .06 * k });
    add(MON.pedestal, { indigo: .26 * k, blue: .22 * k });
  }
  strokeOn('indigo', MON.body, 1.5, .34 - .12 * F);
  knock(MON.rimTop, { blue: .3 + .3 * F, indigo: .3 + .3 * F });
  add(MON.rimTop, { yellow: .08 + .1 * F });
  const slitLit = F > 0.5 || (t > T.restore[1] && t < T.floodOff);
  if (slitLit) { knock(MON.slit, { indigo: 1, blue: 1 }); add(MON.slit, { yellow: .75, pink: .2 }); }
  else add(MON.slit, { indigo: .6, blue: .3 });

  /* the flame: bright when the sun or the floodlights reach it, and through the blackout */
  const blackout = t >= offAt(M.x) && t < 25;
  const sunFlame = t < 6 ? (hT < 132 ? 1 : 0) * (1 - ramp(t, 5.2, 5.8)) : (t > 29 ? ramp(t, T.firstLight - 0.2, T.firstLight + 0.4) : 0);
  const bright = Math.max(F, sunFlame, blackout ? 0.9 : 0);
  const dull = { yellow: .55, pink: .36, blue: .24, indigo: .1 };
  const gold = { yellow: 1, pink: .42, blue: 0, indigo: .03 };
  put(MON.flame, mixCov(dull, gold, bright));
  add(MON.flameShade, { pink: .16 + .1 * (1 - bright), indigo: .08 + .1 * (1 - bright) });
  strokeOn('pink', MON.ribs, 1.4, .45); strokeOn('indigo', MON.ribs, 1.1, .12 + .2 * (1 - bright));
  const hi = poly([[mX(-2.6), mY(121.6)], [mX(-2.0), mY(121.6)], [mX(-1.2), mY(127)], [mX(-1.7), mY(127)]]);
  knock(hi, { pink: .6 * bright, indigo: 1, blue: 1 });
  const halo = bright * (n > 0.4 || sunFlame > 0 ? 1 : 0.4);
  if (halo > 0.02) {
    const [fx, fy] = MON.flameC;
    const pulse = blackout ? 0.85 + 0.15 * Math.sin(t * 5.3) : 1;
    glow('indigo', fx, fy, 6, 70, .55 * halo * n, 'destination-out');
    glow('blue', fx, fy, 6, 56, .4 * halo * n, 'destination-out');
    glow('yellow', fx, fy, 10, 64, .32 * halo * pulse);
    glow('pink', fx, fy, 6, 40, .1 * halo * pulse);
  }
  /* first light: a glint on the flame */
  const glint = t > 29 ? Math.max(0, 1 - Math.abs(t - T.firstLight - 0.35) / 0.55) : (t < 6 ? Math.max(0, 1 - Math.abs(t - T.lastLight + 0.35) / 0.5) : 0);
  if (glint > 0) {
    const [fx, fy] = MON.flameC, g = new Path2D(), L = 26 * glint;
    g.moveTo(fx - L, fy - 8); g.lineTo(fx + L, fy - 8); g.moveTo(fx, fy - 8 - L); g.lineTo(fx, fy - 8 + L);
    for (const pl of ['indigo', 'blue', 'pink']) strokeOn(pl, g, 2.2, glint, 'destination-out');
    strokeOn('yellow', g, 1.6, .5 * glint);
  }
  /* floodlight pools at the foot */
  if (F > 0) {
    withClip(MON.terrace, () => { glow('indigo', M.x, mY(1), 10, 150, .5 * F, 'destination-out'); glow('yellow', M.x, mY(1), 10, 150, .2 * F); });
  }
  /* in the blackout the flame's own glow is the only light on the deck */
  if (blackout) {
    const lit = new Path2D(); lit.addPath(MON.deck); lit.addPath(MON.lip); lit.addPath(MON.flare);
    knock(lit, { indigo: .35, blue: .2 }); add(lit, { yellow: .3, pink: .12 });
  }
}

/* ── the square: trees, palms, lamps, the road ────────────────────────────── */

function canopy(key, y, amp, n, x0, x1, sz) {
  const r = rngFor(key), p = new Path2D(), tops = [];
  for (let x = x0; x < x1; x += sz * (0.5 + r() * 0.4)) {
    const rr = sz * (0.55 + r() * 0.5), cy = y - r() * amp;
    p.addPath(cut(ringPts(x, cy, rr, rr * 0.72, 10), rngFor(key + ':' + (x | 0)), { amp: 3 }));
    tops.push([x, cy - rr * 0.6, rr]);
  }
  p.addPath(rect(x0 - 20, y, x1 + 20, y + 80));
  return { p, tops };
}
const BACKTREES = canopy('backtrees', 650, 10, 0, GL.x0 - 30, GL.x1 + 30, 26);
const FRONTTREES = canopy('fronttrees', 712, 18, 0, GL.x0 - 30, GL.x1 + 30, 34);
const PALMS = [[140, 704, 1.0], [520, 712, 0.9], [706, 714, 1.05], [948, 706, 0.95]].map(([x, y, s], i) => {
  const r = rngFor('palm' + i), trunk = [[x, y + 20], [x + 3 * s, y - 30 * s], [x + 2 * s, y - 70 * s]];
  const top = trunk[2], fronds = new Path2D();
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.48 + (r() - 0.5) * 0.2, L = (30 + r() * 12) * s;
    const pts = [top, [top[0] + Math.cos(a) * L * 0.5, top[1] + Math.sin(a) * L * 0.5 - 6 * s], [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.4 + 12 * s]];
    fronds.addPath(nib(pts, wLeaf(4.2 * s), { per: 6 }));
  }
  const tr = nib(trunk, u => (2.6 - u * 0.8) * s, { per: 6 });
  return { tr, fronds, top };
});
function greens(t, which) {
  const n = nightness(t);
  const day = { blue: .44, yellow: .34, pink: .1, indigo: .08 }, night = { indigo: .8, blue: .56, yellow: .06, pink: .08 };
  const k = which === 'back' ? 0.85 : 1;
  const T0 = which === 'back' ? BACKTREES : FRONTTREES;
  put(T0.p, scaleCov(mixCov(day, night, n), k));
  if (n < 0.8) {
    const tops = new Path2D();
    for (const [x, y, r] of T0.tops) tops.addPath(cut(ringPts(x - r * 0.2, y + r * 0.1, r * 0.5, r * 0.28, 8), rngFor('top' + x), { amp: 2 }));
    const sunlit = t < 6 ? 1 - ramp(t, 3.5, 5.4) : ramp(t, 31, 33.5);
    knock(tops, { blue: .16 * (1 - n), indigo: .06 * (1 - n) }); add(tops, { yellow: .16 * (1 - n) * (0.4 + sunlit) });
  }
  if (which === 'front') {
    for (const pm of PALMS) {
      const c = mixCov({ blue: .5, yellow: .3, pink: .12, indigo: .14 }, { indigo: .86, blue: .56, yellow: .04, pink: .06 }, n);
      put(pm.tr, c); put(pm.fronds, c);
    }
  }
}

const LAMPS = (() => { const out = []; for (let x = GL.x0 + 30; x < GL.x1; x += 92) out.push(x); return out; })();
const LAMP_Y = 728;
function streetLamps(t) {
  const n = nightness(t);
  const poles = new Path2D();
  for (const x of LAMPS) { poles.rect(x - 0.9, LAMP_Y, 1.8, 20); poles.rect(x - 3, LAMP_Y - 1, 6, 2.4); }
  add(poles, { indigo: .5, blue: .3 });
  for (let i = 0; i < LAMPS.length; i++) {
    const x = LAMPS[i];
    const on = t > lerp(T.streetOn[0], T.streetOn[1], (x - GL.x0) / (GL.x1 - GL.x0)) && t < 31.2 + h01('lampoff' + i) * 1.6;
    if (!on || !powered(x, t, 'street' + (i >> 2))) continue;
    const warm = ramp(t, T.streetOn[0], T.streetOn[1] + 0.8);
    glow('indigo', x, LAMP_Y, 2, 14, .9, 'destination-out'); glow('blue', x, LAMP_Y, 2, 12, .8, 'destination-out');
    glow('yellow', x, LAMP_Y, 1, 11, .75 * warm); glow('pink', x, LAMP_Y, 1, 7, .35 * warm);
    glow('yellow', x, 764, 4, 22, .14 * warm);
  }
}

/* Traffic on the road in front of the square: cars show a headlamp at the
   front and a tail lamp at the back; motorbikes are a single lamp. */
const ROAD = [748, 780];
const VEH = (() => {
  const r = rngFor('traffic'), out = [];
  for (let i = 0; i < 46; i++) {
    const lane = i % 2, bike = r() < 0.5;
    out.push({ lane, bike, x0: r() * 1400, v: (bike ? 70 : 42) + r() * 40, q: r(), len: bike ? 7 : 16 + r() * 8, bus: !bike && r() < 0.08 });
  }
  return out;
})();
function road(t) {
  const n = nightness(t), R = rainAt(t), wet = Math.max(R, 1 - ramp(t, 23, 30)) * (t > 16 ? 1 : 0);
  const rd = rect(GL.x0 - 4, ROAD[0], GL.x1 + 4, ROAD[1]);
  put(rd, mixCov({ blue: .3, pink: .2, indigo: .12, yellow: .04 }, { indigo: .72, blue: .5, pink: .08 }, n));
  const kerb = rect(GL.x0 - 4, ROAD[0], GL.x1 + 4, ROAD[0] + 2);
  knock(kerb, { indigo: .4, blue: .4 });
  const density = lerp(1, 0.28, ramp(t, 11.6, 19) * (1 - ramp(t, 28, 34)));
  const heads = new Path2D(), tails = new Path2D(), bodies = new Path2D(), refl = new Path2D(), busWin = new Path2D();
  for (const v of VEH) {
    if (v.q > density * 0.62) continue;
    const dir = v.lane ? 1 : -1, span = GL.x1 - GL.x0 + 200;
    const vq = Math.max(1, Math.round(v.v * DUR / span)) * span / DUR;
    const x = GL.x0 - 100 + (((v.x0 + dir * vq * t) % span) + span) % span;
    const y = v.lane ? 771 : 757, len = v.bus ? 44 : v.len;
    const front = x + dir * len / 2, back = x - dir * len / 2;
    if (!v.bike) bodies.rect(Math.min(front, back), y - (v.bus ? 9 : 5), len, v.bus ? 10 : 6);
    if (v.bus) for (let k = 0; k < 6; k++) busWin.rect(Math.min(front, back) + 4 + k * 6.6, y - 7, 4, 3.4);
    heads.moveTo(front + 3, y); heads.ellipse(front, y, 3.6, 1.8, 0, 0, TAU);
    if (!v.bike) { tails.moveTo(back + 2.4, y); tails.ellipse(back, y, 2.6, 1.6, 0, 0, TAU); }
    if (wet > 0) { refl.rect(front - 1.2, y + 3, 2.4, 12); if (!v.bike) refl.rect(back - 1, y + 3, 2, 9); }
  }
  add(bodies, { indigo: .45, blue: .3, pink: .08 });
  knock(busWin, { indigo: 1, blue: 1 }); add(busWin, { yellow: .7 * n, pink: .1 });
  const lit = 0.35 + 0.65 * n;
  knock(heads, { indigo: 1, blue: 1, pink: .8 }); add(heads, { yellow: .8 * lit });
  knock(tails, { indigo: 1, blue: 1 }); add(tails, { pink: .95 * lit, yellow: .2 });
  if (wet > 0) { knock(refl, { indigo: .45 * wet, blue: .4 * wet }); add(refl, { yellow: .22 * wet, pink: .1 * wet }); }
}

/* The nearest roofs: kampung houses with water tanks (toren), lit windows and a
   TV glowing blue. */
const ROOFS = (() => {
  const r = rngFor('roofs'), houses = [], tanks = [], wins = [];
  let x = GL.x0 - 20;
  while (x < GL.x1 + 20) {
    const w = 40 + r() * 70, top = 784 + r() * 8, ridge = top - 5 - r() * 4;
    houses.push({ x, w, top, ridge });
    if (r() < 0.45) r();
    if (r() < 0.5) wins.push([x + 8 + r() * (w - 20), top + 8, r() < 0.3]);
    x += w * (0.8 + r() * 0.3);
  }
  const p = new Path2D();
  for (const h of houses) p.addPath(poly([[h.x, 804], [h.x, h.top + 4], [h.x + h.w * 0.5, h.ridge], [h.x + h.w, h.top + 4], [h.x + h.w, 804]]));
  const roofY = (h, x) => { const u = Math.abs((x - h.x) / h.w - 0.5) * 2; return lerp(h.ridge, h.top + 4, u); };
  /* the skyline of the roofs, for anything that must pass behind them */
  const profile = x => Math.min(...houses.filter(h => x >= h.x && x <= h.x + h.w).map(h => roofY(h, x)), 804);
  const above = new Path2D();
  above.moveTo(GL.x0 - 20, -100);
  for (let x2 = GL.x0 - 20; x2 <= GL.x1 + 20; x2 += 2) above.lineTo(x2, profile(x2));
  above.lineTo(GL.x1 + 20, -100); above.closePath();
  /* placed by hand where the desk leaves the roofline visible */
  const houseAt = x => houses.find(h => x >= h.x && x <= h.x + h.w);
  for (const [x, orange, stand] of [[168, 0, 4], [250, 1, 7], [428, 0, 3], [722, 0, 6], [760, 1, 3], [842, 0, 5]])
    tanks.push({ x, orange, stand, y: roofY(houseAt(x), x) });
  return { p, houses, tanks, wins, profile, above };
})();
function roofs(t) {
  const n = nightness(t);
  put(ROOFS.p, mixCov({ pink: .44, yellow: .3, blue: .22, indigo: .14 }, { indigo: .78, blue: .52, pink: .16 }, n));
  const legs = new Path2D(), blue = new Path2D(), orange = new Path2D(), lids = { b: new Path2D(), o: new Path2D() }, shade = new Path2D(), hi = new Path2D(), rib = new Path2D();
  const side = sunSide(t) || 1;
  for (const tk of ROOFS.tanks) {
    const R = 7, H = 16, x = tk.x, yb = tk.y - tk.stand, yt = yb - H;
    legs.rect(x - R + 1, yb, 2, tk.stand + 2); legs.rect(x + R - 3, yb, 2, tk.stand + 2); legs.rect(x - R, yb, 2 * R, 2);
    const body = tk.orange ? orange : blue;
    body.addPath(rrect(x - R, yt + 2, x + R, yb, 2.5));
    const lid = new Path2D(); lid.ellipse(x, yt + 2, R + 0.5, 3, 0, 0, TAU);
    (tk.orange ? lids.o : lids.b).addPath(lid);
    shade.addPath(rect(side > 0 ? x - R : x + R * 0.25, yt + 2, side > 0 ? x - R * 0.25 : x + R, yb));
    hi.addPath(rect(side > 0 ? x + R * 0.2 : x - R * 0.6, yt + 4, side > 0 ? x + R * 0.6 : x - R * 0.2, yb - 1));
    rib.rect(x - R, yt + H * 0.55, 2 * R, 1.6);
  }
  add(legs, { indigo: .5 + .2 * n, blue: .3 });
  const dark = { indigo: .72, blue: .56, pink: .1 };
  put(blue, mixCov({ blue: .9, indigo: .1, yellow: .04 }, dark, n));
  put(orange, mixCov({ yellow: .88, pink: .52, indigo: .02 }, mixCov(dark, { pink: .22 }, 0.4), n));
  put(lids.b, mixCov({ blue: .95, indigo: .34 }, dark, n));
  put(lids.o, mixCov({ yellow: .8, pink: .66, indigo: .1 }, dark, n));
  add(shade, { indigo: .2 * (1 - n) }); add(rib, { indigo: .18 * (1 - n) });
  knock(hi, { indigo: .08 * (1 - n), blue: .2 * (1 - n), pink: .12 * (1 - n) });
  const warm = new Path2D(), tv = new Path2D();
  for (let i = 0; i < ROOFS.wins.length; i++) {
    const [x, y, isTv] = ROOFS.wins[i];
    if (!powered(x, t, 'roof' + i) || n < 0.35) continue;
    if (isTv) { if (Math.sin(t * 7 + i) + Math.sin(t * 3.1 + i * 2) > -0.6) tv.rect(x, y, 6, 4); }
    else warm.rect(x, y, 5, 4);
  }
  knock(warm, { indigo: 1, blue: 1 }); add(warm, { yellow: .85, pink: .35 });
  knock(tv, { indigo: 1, pink: 1 }); add(tv, { blue: .3 });
}

/* ── the kite ─────────────────────────────────────────────────────────────── */

const KITE = { hover: [760, 285], anchor: [744, 0], span: 40 };
KITE.anchor[1] = ROOFS.profile(KITE.anchor[0]) + 2;
const kiteOn = t => t >= T.kite[0] || t <= T.kite[1];
function kitePose(t) {
  const [hx, hy] = KITE.hover, [ax, ay] = KITE.anchor;
  const dip = 16 * Math.pow(Math.max(0, Math.sin(cyc(t, 0.2) + 2)), 14);
  const wob = [9 * Math.sin(cyc(t, 0.16)) + 3 * Math.sin(cyc(t, 0.52) + 1), 5 * Math.sin(cyc(t, 0.3) + 0.5) + dip];
  const rot = 0.1 * Math.sin(cyc(t, 0.42) + 0.7) + 0.012 * dip;
  let x = hx + wob[0], y = hy + wob[1];
  /* launched from behind the roofs: it climbs over 2.5 s and slows into the hover */
  const u = clamp(since(t, T.kite[0]) / 2.5, 0, 1), up = 1 - Math.pow(1 - u, 2.2);
  x = lerp(ax + 10, x, sm(u)); y = lerp(ay + 40, y, up);
  /* reeled in after the seam, sinking behind the roofs by T.kite[1] */
  if (t <= T.kite[1]) {
    const v = Math.pow(t / T.kite[1], 1.6);
    x = lerp(x, ax + 14, v); y = lerp(y, ay + 34, v);
  }
  return { x, y, rot: rot * (1 - 0.5 * (1 - u)) };
}
function kite(t) {
  if (!kiteOn(t)) return;
  const { x, y, rot } = kitePose(t), s = KITE.span / 30;
  const c = Math.cos(rot), sn = Math.sin(rot);
  const P = (dx, dy) => [x + (dx * c - dy * sn) * s, y + (dx * sn + dy * c) * s];
  const top = P(0, -19), rt = P(15, -5), bot = P(0, 17), lf = P(-15, -5), mid = P(0, -5);
  const L = clamp(-sunSide(t), 0, 1) * (1 - nightness(t));
  withClip(ROOFS.above, () => {
    const [ax, ay] = KITE.anchor, br = P(0, 0);
    const line = new Path2D(); line.moveTo(br[0], br[1]);
    line.quadraticCurveTo((br[0] + ax) / 2 - 10, (br[1] + ay) / 2 + 70, ax, ay);
    strokeOn('indigo', line, 1.5, .5); strokeOn('blue', line, 1.5, .2);
    const tail = [], tailW = new Path2D();
    for (let k = 0; k <= 6; k++) { const v = k / 6; tail.push(P(Math.sin(cyc(t, 1.1) + v * 3) * 4 * v, 17 + v * 22)); }
    tailW.addPath(nib(tail, u => 2.6 - u, { per: 4 }));
    put(tailW, { pink: .9, yellow: .3 });
    const q = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    put(poly([top, rt, bot, lf]), { pink: .9, yellow: .14 });
    put(poly([q(mid, top, 0.55), q(mid, rt, 0.55), q(mid, bot, 0.5), q(mid, lf, 0.55)]), { yellow: .95, pink: .06 });
    /* lit from the sun's side, shaded on the other */
    const shadeHalf = poly([top, rt, bot]), litHalf = poly([top, lf, bot]);
    add(shadeHalf, { indigo: .08 + .12 * L, blue: .04 });
    knock(litHalf, { indigo: .1 * L, blue: .1 * L }); add(litHalf, { yellow: .08 * L });
    const spar = new Path2D(); spar.moveTo(...lf); spar.quadraticCurveTo(...P(0, -12), ...rt);
    const spine = new Path2D(); spine.moveTo(...top); spine.lineTo(...bot);
    strokeOn('indigo', spar, 2.6, .62); strokeOn('indigo', spine, 2, .45);
    strokeOn('indigo', poly([top, rt, bot, lf]), 1.8, .55);
  });
}

/* ── noon: shadows of clouds overhead slide across the city ───────────────── */

function softEllipse(pl, x, y, rx, ry, a, op) {
  if (a <= 0.001) return;
  const g = PG[pl];
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  g.globalCompositeOperation = op || 'source-over'; g.globalAlpha = 1;
  g.fillStyle = radial(g, 0, 0, rx * 0.35, rx, a, 0); g.fillRect(-rx, -rx, 2 * rx, 2 * rx);
  g.restore();
}
function cloudShadows(t) {
  const a = noonW(t) * (1 - cloudAt(t));
  if (a <= 0.01) return;
  const ground = new Path2D();
  for (const p of [BACKTREES.p, FRONTTREES.p, MON.body, MON.terrace, rect(GL.x0 - 4, ROAD[0], GL.x1 + 4, GL.y1 + 4)]) ground.addPath(p);
  for (const b of TOWERS) ground.addPath(towerShape(b).p);
  const SPAN = GL.x1 - GL.x0 + 700;
  withClip(ground, () => {
    for (const [x0, y, rx, ry] of [[1654, 672, 250, 74], [2134, 560, 170, 160]]) {
      const x = GL.x0 - 350 + (((x0 - 22 * t) % SPAN) + SPAN) % SPAN;
      softEllipse('blue', x, y, rx, ry, .13 * a); softEllipse('indigo', x, y, rx, ry, .07 * a);
      softEllipse('yellow', x, y, rx, ry, .1 * a, 'destination-out');
    }
  });
}

/* ── weather ──────────────────────────────────────────────────────────────── */

const RAIN = (() => {
  const r = rngFor('rain'), out = [];
  for (let i = 0; i < 170; i++) out.push({ x: r() * 1100, y: r(), l: 18 + r() * 34, v: 0.9 + r() * 0.5 });
  return out;
})();
function rainOutside(t) {
  const R = rainAt(t);
  if (R <= 0.01) return;
  const p = new Path2D(), H = GL.y1 - GL.y0 + 120;
  for (let i = 0; i < RAIN.length * R; i++) {
    const d = RAIN[i], y = GL.y0 - 60 + fract(d.y + t * d.v * 1.6) * H, x = d.x + (y - GL.y0) * 0.14 - 40;
    p.moveTo(x, y); p.lineTo(x + d.l * 0.14, y + d.l);
  }
  for (const [pl, a] of [['indigo', .56], ['blue', .36], ['pink', .18]]) strokeOn(pl, p, 2.8, a * R, 'destination-out');
  strokeOn('blue', p, 1.2, .1 * R);
}
/* Rain haze belongs to distance: it thickens over the far city and thins over the near square. */
function haze(t) {
  const R = rainAt(t), pre = ramp(t, 25, 28) * (1 - ramp(t, 29.5, 33));
  const D = Math.max(R * 0.46, pre * 0.3);
  if (D <= 0.01) return;
  const out = t >= offAt(540) && t < T.restore[1] ? 1 - ramp(t, T.restore[0], T.restore[1]) : 0;
  const col = t < 25 ? mixCov({ blue: .34, indigo: .3, pink: .08, yellow: .02 }, { blue: .42, indigo: .62, pink: .02 }, out) : { pink: .2, blue: .22, yellow: .06, indigo: .04 };
  const area = rect(GL.x0 - 4, 300, GL.x1 + 4, GL.y1 + 4);
  const e = { ys: [300, HY, 650, 720, GL.y1], as: [0.2 * D, D, 0.4 * D, 0.14 * D, 0.1 * D] };
  knock(area, { yellow: e, pink: e, blue: e, indigo: e });
  const c = {};
  for (const n in col) c[n] = { ys: e.ys, as: e.as.map(a => a * col[n]) };
  add(area, c);
}
function bolt(t) {
  const f = flashAt(t);
  if (f <= 0) return;
  const view = rect(GL.x0 - 4, GL.y0 - 4, GL.x1 + 4, GL.y1 + 4);
  knock(view, { indigo: .5 * f, blue: .28 * f });
  add(view, { pink: .1 * f });
  const r = rngFor('bolt'), pts = [[T.boltX - 30, GL.y0 + 90]];
  const branches = new Path2D();
  while (pts[pts.length - 1][1] < HY - 10) {
    const [x, y] = pts[pts.length - 1], nx = x + (r() - 0.45) * 34, ny = y + 18 + r() * 26;
    pts.push([nx, ny]);
    if (r() < 0.22) { branches.moveTo(nx, ny); let bx = nx, by = ny; for (let k = 0; k < 4; k++) { bx += (r() - 0.2) * 26; by += 12 + r() * 14; branches.lineTo(bx, by); } }
  }
  const main = new Path2D(); pts.forEach(([x, y], i) => i ? main.lineTo(x, y) : main.moveTo(x, y));
  for (const pl of PL) strokeOn(pl, main, 7, f * 0.7, 'destination-out');
  for (const pl of ['indigo', 'blue']) strokeOn(pl, branches, 2.4, f, 'destination-out');
  strokeOn('pink', main, 16, .18 * f); strokeOn('pink', branches, 7, .16 * f); strokeOn('yellow', main, 3, .25 * f);
  for (const pl of PL) strokeOn(pl, main, 3.2, f, 'destination-out');
  for (const pl of PL) strokeOn(pl, branches, 1.6, f, 'destination-out');
  const [bx, by] = pts[pts.length - 1];
  glow('indigo', bx, by, 4, 120, .6 * f, 'destination-out'); glow('pink', bx, by, 4, 90, .3 * f); glow('yellow', bx, by, 2, 50, .3 * f);
}

/* Drops on the glass. Born through the storm, they stick, some run straight
   down, and the survivors evaporate as the sky clears. Each is a tiny lens:
   the view inverted and minified. Drops near the lamp's reflection catch it. */
const DROPS = (() => {
  const r = rngFor('drops'), out = [];
  for (let i = 0; i < 78; i++) {
    const b = T.drops + Math.pow(r(), 1.5) * 8.2, rad = 7 + r() * r() * 15;
    const stick = r() < 0.5 ? Infinity : 0.3 + r() * 3.2 / (rad / 5);
    out.push({ b, x: GL.x0 + 10 + r() * (GL.x1 - GL.x0 - 20), y: GL.y0 + 10 + r() * (GL.y1 - GL.y0 - 30), rad, stick, fall: 14 + rad * 8 + r() * 16, wob: r() * TAU, dry: 25 + r() * 2.6 });
  }
  return out;
})();
const SNAP = PL.map(() => cv(W, W).getContext('2d', { willReadFrequently: true }));
/* An architect lamp at the back left. Its shade stays left of the mullion and its base sits behind the curled cat's ears. */
const LAMP = { base: [150, 852], elbow: [112, 540], head: [270, 492], aim: [400, 956] };
/* The lamp seen in the night glass, pulled toward the middle of the pane. */
const MIRROR_LAMP = [LAMP.head[0] + (CX - LAMP.head[0]) * 0.16 + 30, LAMP.head[1] + 70];
function drops(t) {
  const live = DROPS.filter(dp => t >= dp.b && t < dp.dry + 3);
  if (!live.length) return;
  PL.forEach((n, i) => { const g = SNAP[i]; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(PG[n].canvas, 0, 0); });
  const trails = new Path2D(), rims = new Path2D(), hi = new Path2D(), body = new Path2D(), warm = new Path2D();
  const L = lampAt(t) * roomDark(t);
  for (const dp of live) {
    const age = t - dp.b, run = Math.max(0, age - dp.stick);
    const y = dp.y + dp.fall * run * Math.min(1, run * 1.2), x = dp.x + Math.sin(dp.wob + run * 2.2) * 2.2 * Math.min(run, 1);
    if (y > GL.y1 - 6) continue;
    const shrink = 1 - ramp(t, dp.dry, dp.dry + 3);
    const r = dp.rad * Math.min(1, age * 6) * shrink;
    if (r < 1.2) continue;
    const st = run > 0 ? 1.25 : 1;
    /* a drying drop flattens into a film and stops lensing */
    const lens = sm(clamp(shrink * 1.6 - 0.3, 0, 1));
    if (run > 0 && lens > 0.5) { trails.moveTo(x, dp.y + (y - dp.y) * 0.1); trails.lineTo(x, y - r); }
    if (lens <= 0.02) continue;
    for (let i = 0; i < PL.length; i++) {
      const g = PG[PL[i]];
      g.save(); g.translate(x, y); g.scale(1, st);
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip(); g.scale(1, 1 / st);
      g.scale(-1, -1);
      g.globalAlpha = lens;
      g.globalCompositeOperation = 'destination-out'; g.fillRect(-r * 3, -r * 3, r * 6, r * 6);
      g.globalCompositeOperation = 'source-over';
      const RR = r * 4.2;
      g.drawImage(SNAP[i].canvas, x - RR, y - RR, 2 * RR, 2 * RR, -r * 1.25, -r * 1.25, r * 2.5, r * 2.5);
      g.restore();
    }
    if (lens < 0.6) continue;
    body.moveTo(x + r, y); body.ellipse(x, y, r, r * st, 0, 0, TAU);
    const e = new Path2D(); e.ellipse(x, y, r, r * st, 0, 0.15 * Math.PI, 0.95 * Math.PI); rims.addPath(e);
    const hr = Math.max(2, r * 0.3);
    hi.moveTo(x - r * 0.36 + hr, y - r * 0.4); hi.ellipse(x - r * 0.36, y - r * 0.4, hr * 1.3, hr, -0.6, 0, TAU);
    if (L > 0 && Math.hypot(x - MIRROR_LAMP[0], y - MIRROR_LAMP[1]) < 260) { warm.moveTo(x + r * 0.3 + hr, y + r * 0.3); warm.ellipse(x + r * 0.3, y + r * 0.3, hr, hr * 0.8, 0, 0, TAU); }
  }
  for (const [n, a] of [['indigo', .28], ['blue', .2]]) strokeOn(n, trails, 3, a, 'destination-out');
  strokeOn('blue', trails, 2, .14);
  knock(body, { indigo: .24, blue: .12 });
  strokeOn('indigo', rims, 1.4, .22); strokeOn('blue', rims, 1.4, .2);
  knock(hi, { yellow: 1, pink: 1, blue: 1, indigo: 1 });
  if (L > 0) { knock(warm, { indigo: L, blue: L }); add(warm, { yellow: .9 * L, pink: .3 * L }); }
}

/* At night the glass becomes a faint mirror of the room: the lamp floats in it
   as a small warm spot, not a pale bloom over the trees. */
function mirror(t) {
  const M0 = roomDark(t) * lampAt(t) * (1 - 0.8 * flashAt(t));
  if (M0 <= 0.01) return;
  const [x, y] = MIRROR_LAMP;
  glow('indigo', x, y, 4, 34, .3 * M0, 'destination-out');
  glow('blue', x, y, 4, 30, .2 * M0, 'destination-out');
  glow('yellow', x, y, 3, 30, .3 * M0);
  const deskGlow = rect(GL.x0, GL.y1 - 34, 620, GL.y1);
  knock(deskGlow, { indigo: { ys: [GL.y1 - 34, GL.y1], as: [0, .3 * M0] } });
  add(deskGlow, { yellow: { ys: [GL.y1 - 34, GL.y1], as: [0, .12 * M0] } });
}

/* ── the room ─────────────────────────────────────────────────────────────── */

/* The window's light on the desk top. It falls away from the sun, short under
   a high sun and long under a low one. xs(v) spans it at depth v, from the back
   of the desk (0) to its far edge y1 (1). */
function sunPatch(t) {
  const len = 1 - 0.65 * sunHigh(t), skew = -170 * sunSide(t);
  return { len, y1: DESK + 210 * len, xs: v => [GL.x0 + 40 + (skew - 60) * len * v, GL.x1 - 40 + (70 + skew) * len * v] };
}
/* How much of that light reaches a point on the desk, soft at the patch's edges. */
function sunOn(t, x, y) {
  const s = sunPatch(t), [x0, x1] = s.xs(clamp((y - DESK) / (s.y1 - DESK), 0, 1));
  return (1 - roomDark(t)) * clamp((s.y1 - y) / 24 + 0.5, 0, 1) * clamp((x - x0) / 40 + 0.5, 0, 1) * clamp((x1 - x) / 40 + 0.5, 0, 1);
}
/* Every light that reaches a point on the desk, as the shadow it throws there:
   the tip's offset per px of the caster's height, its strength and its
   softness. The sun comes through the window behind the desk, so its shadows
   fall toward us; the lamp's fall away from its head; the lightning's fall
   toward us and away from the strike. */
function deskLights(t, x, y) {
  const out = [], sun = sunOn(t, x, y), hi = sunHigh(t);
  if (sun > 0.01) { const len = lerp(1.1, 0.16, hi); out.push({ o: [-0.8 * sunSide(t) * len, 0.3 * len], a: .34 * sun, soft: hi, warm: true }); }
  const [hx, hy] = LAMP.head, fy = LAMP.base[1] + 10, H = fy - hy;
  const lamp = lampAt(t) * roomDark(t) / (1 + ((x - LAMP.aim[0]) ** 2 + (3 * (y - LAMP.aim[1])) ** 2) / 350 ** 2);
  if (lamp > 0.01) out.push({ o: [(x - hx) / H, (y - fy) / H], a: .42 * lamp, soft: .2, warm: true });
  const f = flashAt(t);
  if (f > 0) out.push({ o: [(x - T.boltX) / 1400, 0.45], a: .3 * f, soft: 0 });
  return out;
}
/* Overprints cov on path, fading from p0 to nothing at p1. */
function shadeAlong(path, [x0, y0], [x1, y1], cov, op) {
  if (Math.hypot(x1 - x0, y1 - y0) < 1) { (op ? knock : add)(path, scaleCov(cov, 0.5)); return; }
  for (const pl in cov) {
    const g = PG[pl], gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, 'rgba(0,0,0,' + clamp(cov[pl], 0, 1) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = op || 'source-over'; g.globalAlpha = 1; g.fillStyle = gr; g.fill(path);
  }
}
/* Grounds an object of half-width w and height h standing at (x, y): a tight
   dark core, then one cast shadow per light, fading to its tip. Returns the
   lights so a glass can throw its caustic along them. */
function contactShadow(t, x, y, w, h, ry = 6) {
  const core = new Path2D(); core.ellipse(x, y, w * 1.04, ry, 0, 0, TAU);
  add(core, { indigo: .3, blue: .18, pink: .08 });
  const lights = deskLights(t, x, y);
  for (const s of lights) {
    const ox = s.o[0] * h, oy = s.o[1] * h, p = new Path2D();
    for (let k = 0; k <= 10; k++) {
      const u = k / 10, rx = w * (1 + 0.6 * s.soft * u), rr = ry * (1 + 1.5 * s.soft * u) + Math.abs(oy) * 0.12;
      p.moveTo(x + ox * u + rx, y + oy * u); p.ellipse(x + ox * u, y + oy * u, rx, rr, 0, 0, TAU);
    }
    shadeAlong(p, [x, y], [x + ox, y + oy], { indigo: s.a, blue: .55 * s.a, pink: .2 * s.a });
  }
  return lights;
}

/* A dark walnut desk, so the orange cat stands off it. */
const DESK_WOOD = {
  day: { yellow: { ys: [DESK, W], as: [.46, .5] }, pink: { ys: [DESK, W], as: [.56, .62] }, blue: { ys: [DESK, W], as: [.3, .38] }, indigo: { ys: [DESK, W], as: [.26, .36] } },
  night: { yellow: .16, pink: { ys: [DESK, W], as: [.4, .44] }, blue: { ys: [DESK, W], as: [.4, .46] }, indigo: { ys: [DESK, W], as: [.8, .9] } },
  edgeDay: { pink: .56, blue: .46, yellow: .3, indigo: .5 }, edgeNight: { indigo: .96, blue: .6, pink: .16 },
};
function room(t) {
  const d = roomDark(t), L = lampAt(t);
  const wall = rect(0, 0, W, DESK); wall.addPath(rect(FR.x0, FR.y0, FR.x1, FR.y1));
  const wallDay = { yellow: .22, pink: .2, blue: .3, indigo: .1 }, wallNight = { indigo: .74, blue: .46, pink: .06, yellow: .02 };
  put(wall, mixCov(wallDay, wallNight, d), 'evenodd');
  const frame = rect(FR.x0, FR.y0, FR.x1, FR.y1); frame.addPath(GLASS);
  const frameC = mixCov({ indigo: .42, blue: .5, pink: .2, yellow: .06 }, { indigo: .84, blue: .5, pink: .08 }, d);
  put(frame, frameC, 'evenodd');
  const mull = rect(MUL[0], GL.y0, MUL[1], GL.y1);
  put(mull, frameC);
  const mEdge = rect(MUL[0] + 2, GL.y0, MUL[0] + 5, GL.y1);
  knock(mEdge, { blue: .4, indigo: .5, pink: .3 });
  const inner = rect(GL.x0, GL.y0, GL.x1, GL.y1);
  strokeOn('indigo', inner, 2.6, .85); strokeOn('blue', inner, 2.6, .3);
  const sill = rect(FR.x0 - 10, FR.y1 - 8, FR.x1 + 10, FR.y1 + 4);
  put(sill, mixCov({ yellow: .3, pink: .22, blue: .26, indigo: .08 }, { indigo: .7, blue: .44, pink: .08 }, d));
  knock(rect(FR.x0 - 10, FR.y1 - 8, FR.x1 + 10, FR.y1 - 5), { indigo: .5, blue: .5, pink: .4 });
  /* at night the city glow catches the frame's inner edge, strongest low down */
  const rimK = nightness(t) * (t < offAt(600) || t > T.restore[1] ? 1 : 0.45);
  if (rimK > 0.01) {
    const ring = rect(GL.x0 - 5, GL.y0 - 5, GL.x1 + 5, GL.y1 + 5);
    ring.addPath(rect(GL.x0 - 1.4, GL.y0 - 1.4, GL.x1 + 1.4, GL.y1 + 1.4));
    ring.addPath(rect(MUL[0] - 1.5, GL.y0, MUL[0] + 1.6, GL.y1));
    ring.addPath(rect(MUL[1] - 1.6, GL.y0, MUL[1] + 1.5, GL.y1));
    const e = { ys: [GL.y0, GL.y1], as: [.18 * rimK, .5 * rimK] };
    knock(ring, { indigo: e, pink: { ys: e.ys, as: e.as.map(a => a * 0.5) } }, 'evenodd');
    add(ring, { blue: { ys: e.ys, as: e.as.map(a => a * 0.2) } }, 'evenodd');
  }

  const desk = rect(0, DESK, W, W);
  put(desk, mixCov(DESK_WOOD.day, DESK_WOOD.night, d));
  const grain = new Path2D(), gr = rngFor('grain');
  for (let y = DESK + 10; y < 1050; y += 13 + gr() * 14) {
    let x = -10; grain.moveTo(x, y);
    while (x < W + 10) { x += 40 + gr() * 60; grain.lineTo(x, y + (gr() - 0.5) * 2.4); }
  }
  strokeOn('indigo', grain, 1.4, .1 + .04 * d); strokeOn('pink', grain, 1, .06);
  const back = rect(0, DESK, W, DESK + 5);
  add(back, { indigo: { ys: [DESK, DESK + 5], as: [.5, 0] }, blue: { ys: [DESK, DESK + 5], as: [.3, 0] } });
  const edge = rect(0, 1046, W, W);
  put(edge, mixCov(DESK_WOOD.edgeDay, DESK_WOOD.edgeNight, d));
  knock(rect(0, 1046, W, 1049), { indigo: .5, blue: .5, pink: .4 });

  const dayLight = 1 - d;
  if (dayLight > 0.02) {
    const { y1, xs } = sunPatch(t), [a0, a1] = xs(0), [b0, b1] = xs(1);
    const warm = t < 24 ? 1 : Math.max(1 - ramp(t, 31, 35), ramp(t, T.noon[1], DUR));
    const a = dayLight, c = 1 - warm, ys = [DESK, y1];
    const patch = poly([[a0, DESK], [a1, DESK], [b1, y1], [b0, y1]]);
    knock(patch, { blue: { ys, as: [.28 * a, .12 * a] }, indigo: { ys, as: [.12 * a, .05 * a] }, pink: { ys, as: [.18 * c * a, .08 * c * a] } });
    add(patch, { yellow: { ys, as: [(.22 + .16 * warm) * a, (.1 + .1 * warm) * a] }, pink: { ys, as: [.11 * warm * a, .05 * warm * a] } });
  }

  /* the lamp's light on the wall and desk */
  if (L > 0) {
    const [hx, hy] = LAMP.head, [ax, ay] = LAMP.aim;
    for (const [pl, a] of [['indigo', .9], ['blue', .8], ['pink', .1]]) {
      const g = PG[pl];
      g.save(); g.clip(wall, 'evenodd');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = radial(g, hx, hy + 60, 20, 360, a * d, 0); g.fillRect(0, 0, W, W);
      g.restore();
    }
    for (const [pl, a] of [['yellow', .42], ['pink', .14]]) {
      const g = PG[pl];
      g.save(); g.clip(wall, 'evenodd');
      g.globalCompositeOperation = 'source-over'; g.fillStyle = radial(g, hx, hy + 60, 20, 330, a * d, 0); g.fillRect(0, 0, W, W);
      g.restore();
    }
    for (const [pl, a] of [['indigo', 1], ['blue', .92], ['pink', .14]]) {
      const g = PG[pl];
      g.save(); g.clip(rect(0, DESK, W, 1046)); g.translate(ax, ay); g.scale(1, 0.3);
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = radial(g, 0, 0, 20, 300, a * d * .85, 0); g.fillRect(-500, -500, 1000, 1000);
      g.restore();
    }
    for (const [pl, a, rr] of [['yellow', .5, 280], ['pink', .14, 190]]) {
      const g = PG[pl];
      g.save(); g.clip(rect(0, DESK, W, 1046)); g.translate(ax, ay); g.scale(1, 0.3);
      g.globalCompositeOperation = 'source-over'; g.fillStyle = radial(g, 0, 0, 20, rr, a * d, 0); g.fillRect(-500, -500, 1000, 1000);
      g.restore();
    }
  }
}

/* An architect lamp on a weighted base. At night its arms are a dark cut-out
   against the glass, with a thin warm edge while it burns. */
function lamp(t) {
  const d = roomDark(t), L = lampAt(t);
  const [bx, by] = LAMP.base, [ex, ey] = LAMP.elbow, [hx, hy] = LAMP.head, [ax, ay] = LAMP.aim;
  const [px, py] = [bx, by - 18];
  const enamel = mixCov({ blue: .88, indigo: .2, yellow: .04 }, { blue: .7, indigo: .9, pink: .1 }, d);
  contactShadow(t, bx, by + 3, 54, 18, 12);
  const baseTop = new Path2D(); baseTop.ellipse(bx, by - 11, 52, 11, 0, 0, TAU);
  const baseSide = poly([[bx - 52, by - 11], [bx + 52, by - 11], [bx + 52, by], [bx - 52, by]]);
  baseSide.ellipse(bx, by, 52, 11, 0, 0, Math.PI);
  put(baseSide, enamel); add(baseSide, { indigo: .2 });
  put(baseTop, enamel);
  const bhi = new Path2D(); bhi.ellipse(bx - 12, by - 12, 24, 4, -0.05, Math.PI * 1.05, Math.PI * 1.7);
  strokeOn('blue', bhi, 2.6, .5 * (1 - d), 'destination-out'); strokeOn('indigo', bhi, 2.6, .8 * (1 - d), 'destination-out');
  const rods = [[[px - 5, py], [ex - 5, ey], 3], [[px + 6, py], [ex + 6, ey + 2], 2.6], [[ex, ey - 4], [hx - 6, hy - 7], 2.8], [[ex + 2, ey + 6], [hx - 4, hy + 4], 2.4]];
  const rod = mixCov({ indigo: .7, blue: .5, pink: .08 }, { indigo: .96, blue: .62, pink: .14 }, d);
  for (const [a, b, w] of rods) put(nib([a, b], () => w, { per: 2 }), rod);
  const spring = new Path2D();
  for (const [[x0, y0], [x1, y1]] of [[[px + 12, py - 40], [ex + 10, ey + 80]], [[ex + 22, ey + 6], [hx - 44, hy - 2]]]) {
    const N = 18; spring.moveTo(x0, y0);
    for (let k = 1; k <= N; k++) { const u = k / N, nx = -(y1 - y0), ny = x1 - x0, m = Math.hypot(nx, ny); spring.lineTo(lerp(x0, x1, u) + nx / m * (k % 2 ? 3 : -3), lerp(y0, y1, u) + ny / m * (k % 2 ? 3 : -3)); }
  }
  strokeOn('indigo', spring, 1.2, .6 + .3 * d);
  if (L > 0) {
    const edge = new Path2D();
    for (const [a, b, w] of rods) edge.addPath(nib([[a[0], a[1] + w], [b[0], b[1] + w]], () => 0.8, { per: 2 }));
    knock(edge, { indigo: .8 * d, blue: .6 * d }); add(edge, { yellow: .7 * d, pink: .15 * d });
  }
  const knob = new Path2D(); knob.arc(ex, ey, 7, 0, TAU); knob.moveTo(px + 6, py); knob.arc(px, py, 6, 0, TAU); knob.moveTo(hx + 6, hy); knob.arc(hx, hy, 6, 0, TAU);
  put(knob, enamel); add(knob, { indigo: .2 });
  /* shade: a cone aimed at the desk */
  const ang = Math.atan2(ay - hy, ax - hx), ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
  const back = [hx + ux * 6, hy + uy * 6], mouth = [hx + ux * 92, hy + uy * 92];
  const R0 = 14, R1 = 52;
  const cone = poly([[back[0] + vx * R0, back[1] + vy * R0], [mouth[0] + vx * R1, mouth[1] + vy * R1], [mouth[0] - vx * R1, mouth[1] - vy * R1], [back[0] - vx * R0, back[1] - vy * R0]]);
  cone.moveTo(back[0], back[1]); cone.ellipse(back[0], back[1], R0, R0 * 0.8, ang, 0, TAU);
  put(cone, enamel);
  add(poly([[back[0] - vx * R0 * 0.1, back[1] - vy * R0 * 0.1], [mouth[0] - vx * R1 * 0.1, mouth[1] - vy * R1 * 0.1], [mouth[0] - vx * R1, mouth[1] - vy * R1], [back[0] - vx * R0, back[1] - vy * R0]]), { indigo: .22 });
  const sheen = nib([[back[0] + vx * R0 * 0.55, back[1] + vy * R0 * 0.55], [mouth[0] + vx * R1 * 0.62, mouth[1] + vy * R1 * 0.62]], wTip(2.4), { per: 3 });
  knock(sheen, { blue: .5 * (1 - .6 * d), indigo: .9 * (1 - .6 * d) });
  const rim = new Path2D(); rim.ellipse(mouth[0], mouth[1], R1, 10, ang + Math.PI / 2, 0, TAU);
  if (L > 0) {
    const beam = poly([[mouth[0] + vx * R1, mouth[1] + vy * R1], [ax + 190, ay + 14], [ax - 170, ay + 20], [mouth[0] - vx * R1, mouth[1] - vy * R1]]);
    shadeAlong(beam, mouth, [ax, ay], { indigo: .4 * d, blue: .3 * d }, 'destination-out');
    shadeAlong(beam, mouth, [ax, ay], { yellow: .22 * d });
    const lipEdge = nib([[back[0] + vx * R0, back[1] + vy * R0], [mouth[0] + vx * R1, mouth[1] + vy * R1]], () => 0.9, { per: 2 });
    knock(lipEdge, { indigo: .7 * d, blue: .5 * d }); add(lipEdge, { yellow: .6 * d });
    knock(rim, { indigo: 1, blue: 1, pink: 1, yellow: 1 });
    add(rim, { yellow: .35 });
    glow('yellow', mouth[0] + ux * 6, mouth[1] + uy * 6, 4, 60, .5);
    const bulb = new Path2D(); bulb.ellipse(mouth[0] - ux * 6, mouth[1] - uy * 6, R1 * 0.55, 7, ang + Math.PI / 2, 0, TAU);
    knock(bulb, { indigo: 1, blue: 1, pink: 1, yellow: 1 });
  } else {
    put(rim, mixCov(enamel, { indigo: .6, blue: .8 }, 0.5));
    const inner = new Path2D(); inner.ellipse(mouth[0] - ux * 3, mouth[1] - uy * 3, R1 * 0.8, 6, ang + Math.PI / 2, 0, TAU);
    add(inner, { indigo: .4, pink: .1 });
  }
}

/* A gelas belimbing of sweet tea: faceted, heavy-footed, the warung glass. */
const TEA = { x: 808, yb: 1000, h: 166, tw: 50, bw: 41, k: 0.72, full: .62, low: .18 };
/* Drunk down from the fresh glass at dawn until the log-off at dusk, left low overnight. */
function teaLevel(t) {
  const s = since(t, T.wake);
  const drunk = clamp(s / (DUR - T.wake + T.lampOff), 0, 1);
  return lerp(TEA.low, lerp(TEA.full, TEA.low, drunk), sm(s / 0.6));
}
function teaProfile(y) {
  const { yb, h, tw, bw } = TEA, u = clamp((yb - y) / h, 0, 1);
  const lobe = 5.5 * Math.pow(Math.sin(Math.min(1, u / 0.64) * Math.PI), 0.8) * (u < 0.64 ? 1 : 0);
  const waist = -2.5 * Math.exp(-Math.pow((u - 0.7) / 0.06, 2));
  return lerp(bw, tw, Math.pow(u, 1.3)) + lobe + waist;
}
function teaGlass(t) {
  const d = roomDark(t), L = lampAt(t) * d;
  const { x, yb, h } = TEA, yt = yb - h;
  const left = [], right = [];
  for (let k = 0; k <= 24; k++) { const y = lerp(yt, yb - 6, k / 24), w = teaProfile(y); left.push([x - w, y]); right.push([x + w, y]); }
  const bodyPts = [...left, [x - TEA.bw + 4, yb], [x + TEA.bw - 4, yb], ...right.reverse()];
  const body = poly(bodyPts);
  /* drawn about its foot, so the shadow can be laid out here in the glass's own scale; the sun and the lamp focus an amber caustic through the tea */
  for (const s of contactShadow(t, x, yb, TEA.bw + 4, h, 9)) {
    if (!s.warm) continue;
    const k = Math.min(1, s.a / .3), ca = new Path2D(); ca.ellipse(x + s.o[0] * h * 0.2, yb + 3 + s.o[1] * h * 0.2, 20 + 8 * s.soft, 4 + Math.abs(s.o[1]) * h * 0.05, 0, 0, TAU);
    knock(ca, { indigo: .75 * k, blue: .55 * k }); add(ca, { yellow: .5 * k, pink: .24 * k });
  }
  /* glass seen against the desk: slightly lighter, slightly cooler */
  knock(body, { indigo: .2, pink: .12 }); add(body, { blue: .1 });
  const ys = yb - 12 - teaLevel(t) * (h - 22);
  const teaPts = [];
  for (let k = 0; k <= 16; k++) { const y = lerp(ys, yb - 12, k / 16); teaPts.push([x - teaProfile(y) + 3, y]); }
  for (let k = 16; k >= 0; k--) { const y = lerp(ys, yb - 12, k / 16); teaPts.push([x + teaProfile(y) - 3, y]); }
  const tea = poly(teaPts);
  /* teh manis: deep amber, darker toward the foot, and it goes down with the room at night */
  put(tea, { yellow: .96, pink: { ys: [ys, yb], as: [.6, .84] }, indigo: { ys: [ys, yb], as: [.04 + .3 * d, .2 + .3 * d] }, blue: .1 * d });
  if (L > 0) { const lit = new Path2D(); lit.ellipse(x - 14, (ys + yb) / 2, 14, (yb - ys) * 0.36, 0, 0, TAU); withClip(tea, () => { knock(lit, { indigo: .6 * L, pink: .3 * L }); }); }
  const wsurf = teaProfile(ys) - 3;
  const surf = new Path2D(); surf.ellipse(x, ys, wsurf, 5, 0, 0, TAU);
  put(surf, { yellow: .72, pink: .42, indigo: .03 + .26 * d, blue: .08 * d });
  const men = new Path2D(); men.ellipse(x, ys, wsurf, 5, 0, 0, Math.PI);
  strokeOn('indigo', men, 1.8, .5); strokeOn('pink', men, 1.8, .4);
  /* the heavy foot */
  const foot = poly([[x - TEA.bw + 3, yb - 11], [x + TEA.bw - 3, yb - 11], [x + TEA.bw - 4, yb], [x - TEA.bw + 4, yb]]);
  add(foot, { blue: .3, indigo: .1 });
  /* the star-fruit lobes: three broad facets across the front and a sliver at
     each side, every one lit on the side toward the window and the lamp and
     dark on the other, bold enough to hold at 1x */
  const lobeTop = yb - h * 0.64, EDGES = [-90, -66, -22, 22, 66, 90].map(a => Math.sin(a * Math.PI / 180));
  const facetStrip = (s0, s1) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) { const y = lerp(yb - 11, lobeTop, k / 12), w = teaProfile(y); pts.push([x + w * s0, y]); }
    for (let k = 12; k >= 0; k--) { const y = lerp(yb - 11, lobeTop, k / 12), w = teaProfile(y); pts.push([x + w * s1, y]); }
    return poly(pts);
  };
  const lit = new Path2D(), dark = new Path2D(), seams = new Path2D();
  for (let i = 0; i < EDGES.length - 1; i++) {
    const s0 = EDGES[i], s1 = EDGES[i + 1], m = lerp(s0, s1, 0.45);
    lit.addPath(facetStrip(s0, m)); dark.addPath(facetStrip(m, s1));
    if (i) for (let k = 0; k <= 12; k++) { const y = lerp(yb - 11, lobeTop, k / 12), px = x + teaProfile(y) * s0; k ? seams.lineTo(px, y) : seams.moveTo(px, y); }
  }
  /* the tea shows the lobes best; over the empty glass the dark side stays faint */
  withClip(body, () => {
    knock(lit, { indigo: .34, blue: .22, pink: .16 });
    add(dark, { indigo: .1, blue: .04 });
  });
  withClip(tea, () => add(dark, { indigo: .22, blue: .08 }));
  strokeOn('indigo', seams, 2, .5);
  const band = new Path2D(); band.ellipse(x, lobeTop, teaProfile(lobeTop), 3.5, 0, 0, Math.PI);
  strokeOn('indigo', band, 1.6, .45);
  /* walls, rim, highlights */
  const walls = new Path2D();
  left.forEach(([px, py], i) => i ? walls.lineTo(px, py) : walls.moveTo(px, py));
  walls.moveTo(right[right.length - 1][0], right[right.length - 1][1]);
  for (let k = right.length - 1; k >= 0; k--) walls.lineTo(right[k][0], right[k][1]);
  strokeOn('indigo', walls, 2.2, .7);
  const rim = new Path2D(); rim.ellipse(x, yt, TEA.tw, 6, 0, 0, TAU);
  strokeOn('indigo', rim, 2, .65); strokeOn('blue', rim, 2, .3);
  const hi = poly([[x - TEA.tw + 8, yt + 14], [x - TEA.tw + 15, yt + 14], [x - TEA.bw + 12, yb - 30], [x - TEA.bw + 6, yb - 30]]);
  knock(hi, { yellow: .85, pink: .85, blue: .85, indigo: .85 });
  const hi2 = poly([[x + TEA.tw - 12, yt + 26], [x + TEA.tw - 9, yt + 26], [x + TEA.bw - 7, yb - 40], [x + TEA.bw - 10, yb - 40]]);
  knock(hi2, { yellow: .7, pink: .7, blue: .7, indigo: .7 });
  if (L > 0) { const glint = new Path2D(); glint.ellipse(x - TEA.tw + 10, yt + 4, 5, 2.4, 0, 0, TAU); knock(glint, { indigo: 1, blue: 1, pink: 1 }); add(glint, { yellow: .5 }); }
}

/* The laptop: open toward us, code on the screen, a status dot in the
   corner that goes red in the blackout and green when power returns. Its
   screen is a cool light against the lamp's warm one. It closes at dawn. */
const LAP = { x: 590, back: 888, front: 978, bw: 118, fw: 142, h: 150 };
const CODE = (() => {
  const r = rngFor('code'), lines = [];
  let indent = 0;
  for (let i = 0; i < 160; i++) {
    if (r() < 0.25 && indent < 3) indent++; else if (r() < 0.3 && indent > 0) indent--;
    const toks = [], n = r() < 0.12 ? 0 : 1 + Math.floor(r() * 4);
    let x = indent * 9;
    for (let k = 0; k < n; k++) { const w = 6 + r() * 30; toks.push({ x, w, c: Math.floor(r() * 4) }); x += w + 4; }
    lines.push(toks);
  }
  return lines;
})();
const awake = t => t < T.sleep[1] || t >= T.wake;
/* before it sleeps, the screen dims */
const sleepDim = t => t < 20 ? 1 - 0.6 * sm(ramp(t, T.sleep[0], T.sleep[0] + 0.3)) : 1;
/* Lines of code on screen. Typing stops for the deploy; at dawn the file is
   scrolled back so the day's typing lands exactly where the evening began. */
const CODE0 = 40;
const codeAt = t => t < 20 ? CODE0 + Math.min(t, T.deploy - 0.3) * 3.1 : CODE0 - (DUR - t) * 1.7;
function laptop(t) {
  const d = roomDark(t), L = lampAt(t) * d;
  const { x, back, front, bw, fw, h } = LAP;
  const screenOn = awake(t) ? 1 : 0;
  /* the lid casts the shadow; the thin deck only sits on a dark line */
  contactShadow(t, x, back, bw, h, 5);
  const sh = poly([[x - fw - 6, front + 2], [x + fw + 10, front + 2], [x + fw + 4, front + 12], [x - fw, front + 12]]);
  add(sh, { indigo: .3, blue: .2, pink: .08 });
  const deck = poly([[x - bw, back], [x + bw, back], [x + fw, front], [x - fw, front]]);
  const alu = mixCov({ blue: .22, pink: .12, yellow: .1, indigo: .04 }, { blue: .4, indigo: .5, pink: .1 }, d);
  put(deck, alu);
  const lip = poly([[x - fw, front], [x + fw, front], [x + fw - 2, front + 7], [x - fw + 2, front + 7]]);
  put(lip, mixCov({ blue: .36, pink: .18, indigo: .12, yellow: .08 }, { blue: .45, indigo: .66, pink: .1 }, d));
  /* keys, in the deck's perspective */
  const keys = new Path2D();
  const at = (u, v) => { const w = lerp(bw, fw, v); return [x + (u - 0.5) * 2 * w * 0.9, lerp(back, front, v)]; };
  for (let row = 0; row < 5; row++) for (let col = 0; col < 13; col++) {
    const v0 = 0.08 + row * 0.1, v1 = v0 + 0.075, u0 = col / 13 + 0.008, u1 = (col + 1) / 13 - 0.008;
    const a = at(u0, v0), b = at(u1, v0), c = at(u1, v1), e = at(u0, v1);
    keys.moveTo(a[0], a[1]); keys.lineTo(b[0], b[1]); keys.lineTo(c[0], c[1]); keys.lineTo(e[0], e[1]); keys.closePath();
  }
  add(keys, { indigo: .32 + .2 * d, blue: .14 });
  const pad = poly([at(0.36, 0.62), at(0.64, 0.62), at(0.65, 0.92), at(0.35, 0.92)]);
  knock(pad, { indigo: .15, blue: .1 }); strokeOn('indigo', pad, 1, .25);
  /* the lamp warms the left of the deck */
  if (L > 0) withClip(deck, () => { glow('indigo', LAMP.aim[0], LAMP.aim[1], 10, 190, .5 * L, 'destination-out'); glow('yellow', LAMP.aim[0], LAMP.aim[1], 10, 190, .3 * L); glow('pink', LAMP.aim[0], LAMP.aim[1], 10, 150, .1 * L); });

  /* the open lid. phi is its angle from closed. A point s along the lid and
     n off its face projects with the deck's own foreshortening: D px of
     depth and R px of height per lid length. */
  const phi = 104 * Math.PI / 180;
  const D = (front - back) - 6, R = h + 2, THK = 0.034, cp = Math.cos(phi), sp = Math.sin(phi);
  const P = (s, n) => {
    const dd = (s * cp - n * sp) * D;
    return { y: back + dd - (s * sp + n * cp) * R, w: lerp(bw, fw, clamp(dd / (front - back), -0.25, 1)) - 5 * s * sp };
  };
  const band = (a, b) => poly([[x - a.w, a.y], [x + a.w, a.y], [x + b.w, b.y], [x - b.w, b.y]]);
  const topIn = P(1, 0), topOut = P(1, THK);
  const rimC = mixCov({ blue: .14, pink: .08, yellow: .12, indigo: .02 }, { blue: .32, indigo: .38, pink: .1 }, d);
  const top = topIn.y, tw = topIn.w;
  put(band(topIn, { y: back + 1, w: bw + 1 }), { indigo: .82, blue: .5, pink: .06 });
  put(band(topOut, topIn), rimC);
  const fs = sp, inset = 8, sx0 = x - tw + inset, sx1 = x + tw - inset, sy0 = top + inset * fs + 1, sy1 = back - 12 * fs - 2;
  if (sy1 - sy0 < 6) return;
  const screen = poly([[sx0, sy0], [sx1, sy0], [sx1 + 2, sy1], [sx0 - 2, sy1]]);
  if (!screenOn) { put(screen, { indigo: .9, blue: .55, pink: .08 }); return; }
  const dim = (t >= offAt(x) && t < T.restore[1] ? 0.75 : 1) * sleepDim(t);
  put(screen, mixCov({ indigo: .9, blue: .55, pink: .08 }, { indigo: .78, blue: .4, pink: .04 }, dim));
  /* the screen's own light spills on the keys and the desk in front */
  if (d > 0.1) {
    glow('indigo', x, back + 20, 20, 190, .42 * d * dim, 'destination-out');
    glow('pink', x, back + 20, 20, 150, .12 * d * dim, 'destination-out');
    glow('blue', x, back + 20, 10, 150, .1 * d * dim);
  }
  /* code: lines accumulate through the night and the view scrolls */
  withClip(screen, () => {
    const lh2 = 7.2, rows = Math.floor((sy1 - sy0 - 16) / lh2);
    const cc = codeAt(t), written = Math.min(CODE.length - 1, Math.floor(cc));
    const first = Math.max(0, written - rows);
    const toks = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], gutter = new Path2D();
    for (let i = first; i <= written; i++) {
      const y = sy0 + 6 + (i - first) * lh2;
      gutter.rect(sx0 + 5, y, 6, 3);
      const partial = i === written ? fract(cc) : 1;
      for (const tk of CODE[i]) {
        const w = Math.min(tk.w, Math.max(0, partial * 110 - tk.x));
        if (w > 0) toks[tk.c].rect(sx0 + 16 + tk.x, y, w, 3.2);
      }
      if (i === written && Math.sin(cyc(t, 1.5)) > -0.2) { const cx = sx0 + 16 + Math.min(110, partial * 110); toks[2].rect(cx, y - 1, 2.2, 5.4); }
    }
    const k = dim;
    knock(gutter, { indigo: .45 * k }); 
    knock(toks[0], { indigo: .8 * k, blue: .5 * k }); add(toks[0], { pink: .75 * k });
    knock(toks[1], { indigo: .8 * k, blue: .8 * k }); add(toks[1], { yellow: .8 * k });
    knock(toks[2], { indigo: .9 * k, blue: .7 * k, pink: 1 }); add(toks[2], { blue: .25 * k });
    knock(toks[3], { indigo: .85 * k }); add(toks[3], { blue: .3 * k });
    /* status bar and its dot */
    const bar = rect(sx0, sy1 - 9, sx1, sy1);
    add(bar, { blue: .25, indigo: .1 });
    const down = t >= offAt(x) + 0.4 && t < T.restore[1] + 0.3;
    const dot = new Path2D(); dot.arc(sx1 - 9, sy1 - 4.5, 2.6, 0, TAU);
    knock(dot, { indigo: 1, blue: 1, pink: 1 });
    if (down) add(dot, { pink: 1, yellow: .3 * (0.6 + 0.4 * Math.sin(t * 8)) });
    else add(dot, { yellow: .9, blue: .75 });
    /* the deploy lands: a green toast with a tick */
    const toast = ramp(t, T.deploy, T.deploy + 0.2) * (1 - ramp(t, T.sleep[0] - 0.2, T.sleep[0]));
    if (toast > 0.01) {
      const tx1 = sx1 - 8, tx0 = tx1 - 74, ty1 = sy1 - 14, ty0 = ty1 - 20;
      const pill = rrect(tx0, ty0, tx1, ty1, 6);
      knock(pill, { indigo: toast, blue: toast, pink: toast });
      add(pill, { yellow: .9 * toast, blue: .72 * toast });
      const tick = new Path2D(); tick.moveTo(tx0 + 8, ty0 + 10); tick.lineTo(tx0 + 12, ty0 + 14); tick.lineTo(tx0 + 19, ty0 + 6);
      for (const pl of PL) strokeOn(pl, tick, 2.4, toast, 'destination-out');
      const words = new Path2D(); words.rect(tx0 + 25, ty0 + 8, 38, 3.4);
      knock(words, { yellow: .5 * toast, blue: .5 * toast }); add(words, { indigo: .3 * toast });
    }
  });
  const hinge = rect(x - bw, back - 2, x + bw, back + 2);
  add(hinge, { indigo: .5, blue: .3 });
}

function steam(t) {
  const a = steamAt(t);
  if (a <= 0.01) return;
  const { x, yb, h } = TEA, y0 = yb - h - 4;
  for (let k = 0; k < 3; k++) {
    const ph = k * 2.1, pts = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, y = y0 - u * (150 + 30 * k);
      pts.push([x - 14 + k * 14 + Math.sin(y * 0.045 + cyc(t, 0.29) + ph) * (4 + u * 16) + u * 10, y]);
    }
    const p = nib(pts, u => (1.6 + 5 * Math.sin(Math.PI * u) * (1 - u * 0.4)) * a, { per: 4 });
    const f = a * (0.7 - k * 0.12);
    knock(p, { indigo: .38 * f, blue: .28 * f, pink: .14 * f });
    add(p, { yellow: .05 * f });
  }
}

/* A linen curtain drawn to the right: an interior occluder that gives the
   room a near plane, warm by day, dark plum by night. */
function curtain(t) {
  const d = roomDark(t);
  const top = 44, bot = 828;
  const edge = y => 916 + 7 * Math.sin((y - top) / 130) + 16 * sm((y - 520) / 300) + 5 * Math.sin((y - top) / 47);
  const p = new Path2D();
  p.moveTo(W + 10, top);
  for (let y = top; y <= bot; y += 8) p.lineTo(edge(y), y);
  p.lineTo(edge(bot) + 20, bot + 6); p.lineTo(W + 10, bot + 2); p.closePath();
  const day = { yellow: .46, pink: .34, blue: .14, indigo: .05 }, night = { indigo: .62, blue: .3, pink: .38, yellow: .16 };
  put(p, mixCov(day, night, d));
  withClip(p, () => {
    for (const [pl, a] of [['indigo', .26 + .16 * d], ['blue', .14], ['pink', .1]]) {
      const g = PG[pl], gr = g.createLinearGradient(900, 0, W, 0);
      for (let i = 0; i <= 24; i++) { const u = i / 24, v = Math.pow(0.5 + 0.5 * Math.cos(u * TAU * 3.2 + 0.9), 2); gr.addColorStop(u, 'rgba(0,0,0,' + (a * v).toFixed(3) + ')'); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(880, 0, 220, W);
    }
    { const g = PG.yellow, gr = g.createLinearGradient(900, 0, W, 0);
      for (let i = 0; i <= 24; i++) { const u = i / 24, v = Math.pow(0.5 + 0.5 * Math.cos(u * TAU * 3.2 + 0.9 + Math.PI), 3); gr.addColorStop(u, 'rgba(0,0,0,' + (.08 * v * (1 - d)).toFixed(3) + ')'); }
      g.globalCompositeOperation = 'source-over'; g.fillStyle = gr; g.fillRect(880, 0, 220, W); }
    const lead = [];
    for (let y = top; y <= bot; y += 16) lead.push([edge(y) + 3, y]);
    add(nib(lead, () => 3, { per: 3 }), { indigo: .22, pink: .1 });
    const hem = rect(0, bot - 14, W, bot + 10);
    add(hem, { indigo: .12, pink: .06 });
  });
  const rod = rect(872, 34, W + 10, 40);
  put(rod, { indigo: .72, blue: .5, pink: .12 });
  const fin = new Path2D(); fin.arc(870, 37, 7, 0, TAU);
  put(fin, { indigo: .72, blue: .5, pink: .12 });
  knock(rect(872, 34, W + 10, 35.5), { indigo: .5, blue: .4 });
  const rings = new Path2D();
  for (let x = 924; x < W + 20; x += 26) { rings.moveTo(x + 6, 40); rings.ellipse(x, 40, 6, 7, 0, 0, TAU); }
  strokeOn('indigo', rings, 1.6, .6);
}

function roomFlash(t) {
  const f = flashAt(t);
  if (f <= 0) return;
  const outside = rect(0, 0, W, W); outside.addPath(GLASS);
  knock(outside, { indigo: .4 * f, blue: .25 * f }, 'evenodd');
}

/* ── desk objects ─────────────────────────────────────────────────────────── */

function scaled(cx, cy, k, fn) {
  for (const n of PL) { const g = PG[n]; g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy); }
  fn();
  for (const n of PL) PG[n].restore();
}

/* A snake plant in a mustard glazed pot at the back of the desk, in front of the
   curtain. The glaze and the lighter night leaves keep it readable against the
   indigo curtain after dark. */
function plant(t) {
  const d = roomDark(t), x = 912, y = 880, r = rngFor('plant');
  const pw = 38, pb = 29, ph = 70;
  contactShadow(t, x, y + 2, 34, 120, 7);
  const leaves = new Path2D(), backs = new Path2D();
  const blades = [[-22, 150, -0.2, 13], [-9, 205, -0.06, 15], [5, 236, 0.04, 16], [18, 176, 0.18, 14], [-2, 120, 0.3, 12], [26, 110, 0.42, 11]];
  blades.forEach(([dx, len, lean, w], i) => {
    const bx = x + dx * 0.8, by = y - ph + 6, tip = [bx + lean * len + (r() - 0.5) * 8, by - len];
    const mid = [bx + lean * len * 0.45 + (r() - 0.5) * 6, by - len * 0.5];
    (i % 2 ? backs : leaves).addPath(nib([[bx, by], mid, tip], wLeaf(w, 0.4), { per: 8 }));
  });
  const leafDay = { yellow: .72, blue: .62, indigo: .12, pink: .04 }, leafNight = { indigo: .46, blue: .62, yellow: .42, pink: .02 };
  put(backs, mixCov({ yellow: .6, blue: .7, indigo: .22 }, { indigo: .8, blue: .66, yellow: .1 }, d));
  put(leaves, mixCov(leafDay, leafNight, d));
  strokeOn('yellow', leaves, 1.6, .5 * (1 - d)); strokeOn('indigo', leaves, 1, .2);
  const pot = poly([[x - pw, y - ph], [x + pw, y - ph], [x + pb, y], [x - pb, y]]);
  const glaze = { yellow: .88, pink: .12 }, glazeN = { yellow: .7, pink: .1, blue: .12, indigo: .1 };
  put(pot, mixCov(glaze, glazeN, d));
  add(poly([[x + pw * 0.2, y - ph], [x + pw, y - ph], [x + pb, y], [x + pb * 0.25, y]]), { indigo: .12, blue: .06 });
  const rim = rect(x - pw - 4, y - ph - 4, x + pw + 4, y - ph + 10);
  put(rim, mixCov({ yellow: .92, pink: .2 }, { yellow: .74, pink: .16, blue: .14, indigo: .12 }, d));
  knock(rect(x - pw - 4, y - ph - 4, x + pw + 4, y - ph - 1), { indigo: .4, blue: .3 });
}

/* ── the cat: kucing oren ─────────────────────────────────────────────────────
   A small rig. A pose is a plain record, and the film moves the cat by
   interpolating poses. Local frame: origin on the desk under the body, y down,
   drawn at CAT.s. Every outline has the same point count in every pose, so
   poses morph cleanly. */

const CAT = { x: 222, y: 1004, s: 1.8 };
const RIG_N = 36;
const RIG_TH = Array.from({ length: RIG_N }, (_, i) => i / RIG_N * TAU - Math.PI / 2);
/* Body outline as radii at fixed angles about (x, y), sampled from a union of
   ellipses cut at the desk, so poses are authored as blobs. */
function sampleStar(x, y, blobs) {
  const inside = (px, py) => py <= 0 && blobs.some(([cx, cy, rx, ry, rot = 0]) => {
    const c = Math.cos(rot), s = Math.sin(rot), dx = px - cx, dy = py - cy;
    const u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry;
    return u * u + v * v <= 1;
  });
  return RIG_TH.map(th => {
    let r = 0;
    for (let d = 0; d < 260; d += 0.5) if (inside(x + Math.cos(th) * d, y + Math.sin(th) * d)) r = d;
    return r;
  });
}
const body = (x, y, blobs) => ({ x, y, r: sampleStar(x, y, blobs) });
const deg = a => a * Math.PI / 180;
/* A stripe is [from angle, to angle, bow, width, taper]. The angles ride the
   body outline, bow bends the band off its chord, taper 1 is heavy at the
   start (a flank stripe off the spine) and 0 swells in the middle. */
const stripeSet = list => list.map(([a, b, ...r]) => [deg(a), deg(b), ...r]);
/* back is 1 when we see the cat from behind, a silhouette against the glass. */
const POSES = {
  curl: {
    body: body(4, -30, [[0, -30, 84, 30], [42, -38, 50, 38, -0.2], [-40, -28, 50, 27]]),
    head: { x: -66, y: -31, rx: 28, ry: 25, tilt: -0.32 },
    ears: [deg(-40), deg(26)], earLen: 17,
    tail: [[84, -12], [86, 2], [52, 8], [4, 9], [-44, 6], [-74, -6]], tailW: 8.5,
    paws: [[-58, -6], [-34, -4]], paw: 1,
    face: 1, back: 0,
    stripes: stripeSet([[-150, 150, -0.1, 7, 1], [-128, 120, -0.12, 8, 1], [-106, 96, -0.1, 8.5, 1], [-84, 80, -0.06, 8.5, 1], [-62, 60, 0.02, 8, 1], [-40, 40, 0.1, 7, 1]]),
  },
  loaf: {
    body: body(10, -34, [[6, -34, 72, 34], [36, -46, 44, 42], [-34, -38, 42, 36]]),
    head: { x: -54, y: -67, rx: 29, ry: 25.5, tilt: -0.08 },
    ears: [deg(-24), deg(24)], earLen: 19,
    tail: [[70, -10], [80, 2], [54, 9], [16, 11], [-18, 9], [-36, 2]], tailW: 8.5,
    paws: [[-58, -5], [-36, -4]], paw: 1,
    face: 1, back: 0,
    stripes: stripeSet([[-160, 150, -0.1, 7, 1], [-132, 120, -0.1, 8, 1], [-108, 96, -0.08, 8.5, 1], [-84, 80, -0.04, 8.5, 1], [-60, 60, 0.02, 8, 1], [-38, 38, 0.08, 7, 1]]),
  },
  /* from behind: broad haunches on the desk, a narrower chest, a big round
     head on a short neck, and the tail round the right side toward us */
  sit: {
    body: body(8, -60, [[8, -30, 54, 30], [8, -62, 41, 42], [8, -94, 29, 27]]),
    head: { x: 7, y: -131, rx: 32.5, ry: 28, tilt: 0 },
    ears: [deg(-19), deg(19)], earLen: 22,
    tail: [[8, -10], [34, -1], [58, -4], [69, -16], [67, -31], [58, -37]], tailW: 6,
    paws: [[-10, -2], [22, -2]], paw: 0,
    face: 0, back: 1,
    stripes: stripeSet([[-143, -37, -0.16, 5.5, 0], [-156, -24, -0.16, 6, 0], [-170, -10, -0.15, 6.5, 0], [-184, 4, -0.14, 6.5, 0], [-198, 18, -0.12, 6.5, 0], [-212, 32, -0.1, 6, 0]]),
  },
};
/* The timing channel each field of a pose moves on. */
const RIG_CH = { body: 'body', back: 'body', head: 'head', ears: 'ears', earLen: 'ears', tail: 'tail', tailW: 'tail', paws: 'paws', paw: 'paws', face: 'face', stripes: 'stripes' };
const CHANNELS = [...new Set(Object.values(RIG_CH))];
const lerpDeep = (a, b, u) => typeof a === 'number' ? lerp(a, b, u)
  : Array.isArray(a) ? a.map((v, i) => lerpDeep(v, b[i], u))
  : Object.fromEntries(Object.keys(a).map(k => [k, lerpDeep(a[k], b[k], u)]));
function lerpPose(a, b, u) {
  const o = {};
  for (const k in RIG_CH) o[k] = lerpDeep(a[k], b[k], u[RIG_CH[k]]);
  return o;
}

/* The storm beat. It startles upright at the thunderclap, watches, and lies
   back down as the power returns: first to a loaf, then into the curl. Each
   move eases every channel on its own lag and duration, so parts lead and
   follow instead of melting together. */
const easeOut = u => 1 - Math.pow(1 - u, 3);
const easeBack = u => { const s = 1.4; u -= 1; return 1 + u * u * ((s + 1) * u + s); };
const MOVES = [
  { at: T.catSit[0], to: 'sit', ease: easeOut, easeOf: { head: easeBack },
    lag: { head: 0, ears: 0, face: 0, body: 0.02, stripes: 0.02, paws: 0, tail: 0.07 },
    dur: { head: 0.22, ears: 0.16, face: 0.07, body: 0.26, stripes: 0.26, paws: 0.1, tail: 0.28 } },
  { at: T.catSit[1], to: 'loaf', ease: sm, easeOf: {},
    lag: { body: 0, stripes: 0, paws: 0.08, head: 0.12, ears: 0.12, face: 0.14, tail: 0.22 },
    dur: { body: 0.5, stripes: 0.5, paws: 0.4, head: 0.45, ears: 0.4, face: 0.35, tail: 0.5 } },
  { at: T.catSit[1] + 0.45, to: 'curl', ease: sm, easeOf: {},
    lag: { body: 0, stripes: 0, paws: 0, head: 0.1, ears: 0.1, face: 0, tail: 0.18 },
    dur: { body: 0.5, stripes: 0.5, paws: 0.4, head: 0.5, ears: 0.45, face: 0.3, tail: 0.45 } },
];
function poseAt(t) {
  let travel = 0;
  const p = MOVES.reduce((p, m) => {
    const u = {};
    for (const ch of CHANNELS) u[ch] = (m.easeOf[ch] || m.ease)(clamp((t - m.at - m.lag[ch]) / m.dur[ch], 0, 1));
    /* stripes swing round when the cat turns between lying and sitting, so they dim while they travel */
    travel = Math.max(travel, Math.sin(Math.PI * u.stripes) * Math.abs(POSES[m.to].back - p.back));
    return lerpPose(p, POSES[m.to], u);
  }, POSES.curl);
  p.stripeA = 1 - 0.6 * travel;
  return p;
}

/* The flickers it watches from the sill. Its ears swivel toward each one in
   turn, left then right. */
const CAT_FLICKERS = T.distant.filter(([t0]) => t0 > T.catSit[0] + 0.5 && t0 < T.catSit[1]).map(([t0]) => t0);
function earTwitch(t) {
  const tw = [0, 0];
  CAT_FLICKERS.forEach((t0, i) => {
    const d = t - t0 - 0.06;
    const e = d < 0 ? 0 : d < 0.07 ? sm(d / 0.07) : d < 0.16 ? 1 : 1 - sm((d - 0.16) / 0.3);
    tw[i % 2] = Math.max(tw[i % 2], e);
  });
  return tw;
}

/* The coat as the room lights it. */
function coatAt(t) {
  const d = roomDark(t);
  return {
    base: mixCov({ yellow: .9, pink: .5, blue: .02, indigo: .02 }, { yellow: .68, pink: .52, blue: .26, indigo: .32 }, d),
    /* cream goes down to a warm dark neutral, mostly through indigo, never to blue */
    cream: mixCov({ yellow: .34, pink: .08, blue: .02 }, { yellow: .32, pink: .15, blue: .08, indigo: .4 }, d),
    rust: mixCov({ pink: .5, indigo: .22, yellow: .1 }, { pink: .3, indigo: .36, blue: .1 }, d),
    line: .5 + .2 * d,
    d,
  };
}

function rAt(b, a) {
  const f = ((a + Math.PI / 2) / TAU * RIG_N % RIG_N + RIG_N) % RIG_N, i = Math.floor(f), u = f - i;
  return lerp(b.r[i], b.r[(i + 1) % RIG_N], u);
}
const onBody = (b, a) => { const r = rAt(b, a); return [b.x + Math.cos(a) * r, b.y + Math.sin(a) * r]; };
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const outline = b => RIG_TH.map((th, i) => [b.x + Math.cos(th) * b.r[i], b.y + Math.sin(th) * b.r[i]]);

/* Draws the pose in the cat's local frame and returns its parts. */
function drawCat(t, p, c) {
  const br = 0.028 * Math.sin(cyc(t, 0.27)) * (1 - 0.6 * p.back);
  const b = { x: p.body.x, y: p.body.y, r: p.body.r.map((r, i) => r * (1 + br * Math.max(0, -Math.sin(RIG_TH[i])))) };
  const bodyP = cut(outline(b), rngFor('cat:body'), { amp: 1.1 });
  const h = p.head;
  const headP = cut(ringPts(h.x, h.y, h.rx, h.ry, 16, h.tilt), rngFor('cat:head'), { amp: 0.7 });
  const [twL, twR] = earTwitch(t);
  const earTri = (a0, side, tw) => {
    const a = -Math.PI / 2 + a0 + h.tilt + side * tw * 0.5;
    const len = p.earLen * (1 - 0.15 * tw);
    const at = (aa, rr) => [h.x + Math.cos(aa) * rr * h.rx / 26, h.y + Math.sin(aa) * rr * h.ry / 24];
    return { outer: [at(a - 0.42, 22), at(a + side * tw * 0.2, 22 + len), at(a + 0.42, 22)], inner: [at(a - 0.26, 22), at(a, 20 + len * 0.8), at(a + 0.26, 22)] };
  };
  const eL = earTri(p.ears[0], -1, twL), eR = earTri(p.ears[1], 1, twR);
  const ears = poly(eL.outer); ears.addPath(poly(eR.outer));
  const tailP = nib(p.tail, u => p.tailW * (1 - 0.4 * u * u), { per: 8 });
  const paws = new Path2D();
  for (const [x, y] of p.paws) { paws.moveTo(x + 11, y); paws.ellipse(x, y, 11, 6.5, 0, 0, TAU); }

  put(bodyP, c.base);
  const stripes = new Path2D();
  for (const [a0, a1, bow, w, taper] of p.stripes) {
    const P0 = onBody(b, a0), P1 = onBody(b, a1), len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
    const nx = -(P1[1] - P0[1]) / len, ny = (P1[0] - P0[0]) / len;
    const mid = [(P0[0] + P1[0]) / 2 + nx * bow * len, (P0[1] + P1[1]) / 2 + ny * bow * len];
    stripes.addPath(nib([P0, mid, P1], u => w * lerp(Math.pow(Math.sin(Math.PI * u), 0.5), Math.pow(1 - u, 1.2) * 1.2, taper), { per: 8 }));
  }
  withClip(bodyP, () => {
    /* seen from behind the stripes stay, but quietly */
    const sa = p.stripeA * (1 - 0.5 * p.back);
    if (sa > 0.01) add(stripes, scaleCov(c.rust, sa));
    /* belly and chest fall into shade toward the desk */
    add(rect(-200, -26, 200, 20), { indigo: { ys: [-26, 0], as: [0, .22] }, blue: { ys: [-26, 0], as: [0, .12] } });
    if (p.face > 0.01) { const chest = new Path2D(); chest.ellipse(h.x + 16, h.y + 24, 26, 20, 0.3, 0, TAU); put(chest, c.cream, null, p.face); }
  });
  strokeOn('indigo', bodyP, 1.4, c.line);

  put(tailP, c.base);
  const tc = curve(p.tail, false, 8), rings = new Path2D();
  for (const [u0, u1] of [[0.3, 0.4], [0.5, 0.6], [0.7, 0.8], [0.88, 1]]) {
    const seg = tc.slice(Math.floor(u0 * (tc.length - 1)), Math.ceil(u1 * (tc.length - 1)) + 1);
    rings.addPath(nib(seg, () => p.tailW + 2, { raw: true }));
  }
  withClip(tailP, () => add(rings, c.rust));
  strokeOn('indigo', tailP, 1.3, c.line);

  if (p.paw > 0.01) { put(paws, c.cream, null, p.paw); strokeOn('indigo', paws, 1.2, c.line * p.paw); }

  /* the neck keeps the head on the body whatever the channels are doing */
  const na = Math.atan2(h.y - b.y, h.x - b.x), NP = onBody(b, na);
  const neck = nib([[lerp(b.x, NP[0], 0.55), lerp(b.y, NP[1], 0.55)], [lerp(NP[0], h.x, 0.5), lerp(NP[1], h.y, 0.5)], [h.x, h.y]], () => h.rx * lerp(0.72, 0.6, p.back), { per: 4 });
  put(neck, c.base);
  put(ears, c.base); put(headP, c.base);
  const marks = new Path2D();
  for (const dx of [-9, 0, 9]) {
    const [x0, y0] = rot(dx, -h.ry + 1, h.tilt), [x1, y1] = rot(dx * 0.7, -h.ry + 11 - Math.abs(dx) * 0.2, h.tilt);
    marks.addPath(nib([[h.x + x0, h.y + y0], [h.x + x1, h.y + y1]], wTip(2.6), { per: 3 }));
  }
  withClip(headP, () => add(marks, c.rust));
  if (p.face > 0.01) {
    const inner = poly(eL.inner); inner.addPath(poly(eR.inner));
    add(inner, { pink: .5 * p.face });
    const F = (x, y) => { const [rx, ry] = rot(x, y, h.tilt); return [h.x + rx, h.y + ry]; };
    const muzzle = new Path2D(); const [mx, my] = F(0, 9); muzzle.ellipse(mx, my, 14, 10, h.tilt, 0, TAU);
    withClip(headP, () => put(muzzle, c.cream, null, p.face));
    const eyes = new Path2D();
    for (const s of [-1, 1]) { const a = F(s * 15, -3), m = F(s * 10, 1), e = F(s * 5, -3); eyes.moveTo(a[0], a[1]); eyes.quadraticCurveTo(m[0], m[1], e[0], e[1]); }
    strokeOn('indigo', eyes, 2.2, .85 * p.face);
    const nose = poly([F(-3.5, 5), F(3.5, 5), F(0, 8.5)]);
    add(nose, { pink: .8 * p.face });
  }
  strokeOn('indigo', ears, 1.3, c.line); strokeOn('indigo', headP, 1.3, c.line);

  const parts = [bodyP, tailP, neck, headP, ears];
  if (p.paw > 0.01) parts.push(paws);
  return { b, parts };
}

/* Light on the whole silhouette goes through a raster union of the parts:
   they wind both ways, so a combined Path2D would cancel where they overlap. */
const MASK = cv(W, W), TMP = cv(W, W);
function unionMask(parts) {
  const g = MASK.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, W); g.globalCompositeOperation = 'source-over';
  g.setTransform(PG.indigo.getTransform()); g.fillStyle = '#000';
  for (const q of parts) g.fill(q);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return MASK;
}
function stamp(pl, canvas, a, op) {
  const g = PG[pl]; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = op; g.globalAlpha = clamp(a, 0, 1); g.drawImage(canvas, 0, 0); g.restore();
}
/* The silhouette filled with fill(g), in page coordinates. */
function maskedFill(mask, fill) {
  const g = TMP.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, W);
  g.fillStyle = fill(g); g.fillRect(0, 0, W, W);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
  return TMP;
}
/* The edge a light from direction (-dx, -dy) catches: the silhouette minus itself moved by (dx, dy). */
function rimOf(mask, dx, dy) {
  const g = TMP.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, W);
  g.drawImage(mask, 0, 0);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(mask, dx, dy);
  return TMP;
}
function rimLight(mask, dx, dy, cov) {
  for (const pl in cov) if (cov[pl] > 0.005) stamp(pl, rimOf(mask, dx, dy), cov[pl], 'destination-out');
}
const alpha = a => 'rgba(0,0,0,' + clamp(a, 0, 1) + ')';

function cat(t) {
  const p = poseAt(t), c = coatAt(t), d = c.d, { x: X, y: Y, s: S } = CAT;
  const pts = outline(p.body), xs = pts.map(q => q[0]);
  const x0 = X + Math.min(...xs) * S, x1 = X + Math.max(...xs) * S;
  const top = Y + Math.min(...pts.map(q => q[1]), p.head.y - p.head.ry - p.earLen) * S;
  contactShadow(t, (x0 + x1) / 2, Y + 2 * S, (x1 - x0) / 2, Y - top, 7 * S);

  for (const n of PL) { const g = PG[n]; g.save(); g.translate(X, Y); g.scale(S, S); }
  const { b, parts } = drawCat(t, p, c);
  const mask = unionMask(parts);
  for (const n of PL) PG[n].restore();

  /* turned to the window at night we see its unlit back: one smooth fall from the shoulders to the desk */
  const back = d * p.back;
  if (back > 0.01) for (const [pl, a0, a1] of [['indigo', .24, .5], ['blue', .12, .26]]) {
    stamp(pl, maskedFill(mask, g => { const gr = g.createLinearGradient(0, top, 0, Y); gr.addColorStop(0, alpha(a0 * back)); gr.addColorStop(1, alpha(a1 * back)); return gr; }), 1, 'source-over');
  }
  /* the lamp warms the side of the cat that faces it */
  const L = lampAt(t) * d;
  if (L > 0) {
    const gx = lerp(X + b.x * S, LAMP.head[0], 0.35), gy = Y + (b.y - 34) * S;
    for (const [pl, r1, a, op] of [['indigo', 130, .8, 'destination-out'], ['blue', 120, .55, 'destination-out'], ['yellow', 130, .35, 'source-over'], ['pink', 100, .1, 'source-over']])
      stamp(pl, maskedFill(mask, g => radial(g, gx, gy, 10 * S, r1 * S, a * L, 0)), 1, op);
  }
  /* the window lights its outline: a faint cool rim from the city glow, the
     whole edge in the lightning, and the side toward each distant flicker */
  const out = t >= offAt(X) && t < T.restore[1] ? 1 - ramp(t, T.restore[0], T.restore[1]) : 0;
  const cool = d * (0.12 + 0.2 * p.back) * (1 - 0.35 * out);
  if (cool > 0.01) rimLight(mask, 0, 2.2 * S, { indigo: cool, blue: .3 * cool });
  const f = flashAt(t);
  if (f > 0) for (const sx of [-1, 1]) rimLight(mask, sx * 2.2 * S, 1.6 * S, { indigo: .8 * f, blue: .7 * f, pink: .5 * f });
  const fl = flickerAt(t);
  if (fl) { const sx = fl.x > X ? -1 : 1; rimLight(mask, sx * 2 * S, 1.2 * S, { indigo: .7 * fl.a * d, blue: .45 * fl.a * d }); }
}

/* ── frame ────────────────────────────────────────────────────────────────── */

function drawArt(t) {
  resetPlates();
  withClip(GLASS, () => {
    sky(t); sun(t); fairClouds(t); storm(t); westCell(t); rainbow(t); plane(t);
    farCity(t); viaduct(t); train(t); towers(t);
    greens(t, 'back'); monas(t); greens(t, 'front'); swifts(t);
    streetLamps(t); road(t); roofs(t); cloudShadows(t); kite(t);
    rainOutside(t); haze(t); bolt(t);
    drops(t); mirror(t);
  });
  room(t); curtain(t); plant(t);
  lamp(t);
  laptop(t);
  scaled(TEA.x, TEA.yb, TEA.k, () => { teaGlass(t); steam(t); });
  cat(t);
  roomFlash(t);
}

const SHOTS = [
  { at: 1.0, beat: 'Dusk. Sun sets behind the far city; the cat asleep, tea steaming.' },
  { at: 5.4, beat: 'The last light climbs Monas to the flame. The lamp clicks on.' },
  { at: 8.2, beat: 'The deploy lands.' },
  { at: 9.3, beat: 'The screen dims and sleeps.' },
  { at: 11.0, beat: 'Lamp off. Blue hour; the city takes over.' },
  { at: 13.4, beat: 'Night. The KRL crosses as the storm rolls in.' },
  { at: 17.8, beat: 'Downpour on the glass.' },
  { at: 19.2, beat: 'Lightning strike. The cat sits up.' },
  { at: 21.4, beat: 'Blackout. Only the flame stays lit.' },
  { at: 24.9, beat: 'Power returns, block by block.' },
  { at: 30.6, beat: 'First light lands on the flame.' },
  { at: 32.8, beat: 'Fresh tea. The screen wakes.' },
  { at: 35.5, beat: 'Morning. The sun climbs out of the window.' },
  { at: 40.0, beat: 'Noon. Flat, high light; the day train.' },
  { at: 44.0, beat: 'Afternoon. The light comes back from the west.' },
  { at: 48.0, beat: 'Golden hour, meeting the dusk it started from.' },
];
