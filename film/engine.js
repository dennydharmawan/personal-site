'use strict';
/* Print engine for "Stays up".
   Adapted from sevenevesai/riso-windowseat (MIT): halftone screens, live plates
   screened per pixel in compose(), and the craft kit (curve, cut, nib, ...).
   Changes here: inks and paper are stock Tailwind v4 palette values from
   palette.js, converted from oklch once at boot. */

const W = 1080, CX = W / 2, CY = W / 2, TAU = Math.PI * 2;
const PITCH = 4.6;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, u) => a + (b - a) * u;
const sm = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
const ramp = (t, a, b) => sm((t - a) / (b - a));
const fract = x => x - Math.floor(x);

function mulberry32(a) {
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const rngFor = key => mulberry32(hash(key));
const h01 = key => mulberry32(hash(key))();

function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/* ── palette ──────────────────────────────────────────────────────────────── */

function oklchToRgb(str) {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/.exec(str);
  const L = +m[1] / 100, C = +m[2], H = +m[3] * Math.PI / 180;
  const a = C * Math.cos(H), b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s,
  ];
  return lin.map(x => {
    const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
    return clamp(v, 0, 1);
  });
}
const tw = name => oklchToRgb(window.TW[name]);
const css = rgb => `rgb(${rgb.map(v => Math.round(v * 255)).join(',')})`;

const INK_SOURCE = { yellow: 'yellow-300', pink: 'pink-500', blue: 'sky-600', indigo: 'indigo-900' };
const INK = {};
for (const n in INK_SOURCE) INK[n] = tw(INK_SOURCE[n]);
const PAPER = tw('orange-50'), MOTTLE = tw('stone-400'), FIBRE = tw('stone-500');

/* Screen angles as rational tangents so the threshold tile wraps without a seam. */
const SCREEN = { blue: { a: 4, b: 1 }, pink: { a: 1, b: 4 }, yellow: { a: 1, b: 0 }, indigo: { a: 1, b: 1 } };
/* Registration: each plate misses by a fixed amount, in device px. */
const REG = { blue: [2, -1], pink: [-2, 2], yellow: [2, 1], indigo: [0, 0] };

/* ── halftone screens ─────────────────────────────────────────────────────── */

const screens = {};
function buildScreen(name) {
  const { a, b } = SCREEN[name];
  const n = a * a + b * b;
  const S = Math.max(2, Math.round(PITCH * Math.sqrt(n)));
  const P = S / Math.sqrt(n);
  const u = P / Math.sqrt(n);
  const v1 = [u * a, u * b], v2 = [-u * b, u * a];
  const pts = [];
  for (let m = -n; m <= n; m++) for (let k = -n; k <= n; k++) {
    const x = m * v1[0] + k * v2[0], y = m * v1[1] + k * v2[1];
    const wx = ((x % S) + S) % S, wy = ((y % S) + S) % S;
    if (!pts.some(p => Math.abs(p[0] - wx) < 0.01 && Math.abs(p[1] - wy) < 0.01)) pts.push([wx, wy]);
  }
  const wrapped = [];
  for (const [x, y] of pts) for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) wrapped.push([x + dx, y + dy]);
  const th = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let d2 = Infinity;
    for (const [px, py] of wrapped) {
      const dx = x + 0.5 - px, dy = y + 0.5 - py, q = dx * dx + dy * dy;
      if (q < d2) d2 = q;
    }
    th[y * S + x] = clamp(Math.PI * d2 / (P * P), 0, 1);
  }
  return { S, th };
}
const screenOf = name => screens[name] || (screens[name] = buildScreen(name));

/* ── paper ────────────────────────────────────────────────────────────────── */

function bakePaper() {
  const c = cv(W, W), x = c.getContext('2d');
  x.fillStyle = css(PAPER); x.fillRect(0, 0, W, W);
  const r = rngFor('paper');
  const [mr, mg, mb] = MOTTLE.map(v => Math.round(v * 255));
  for (const [res, maxA] of [[30, 0.12], [72, 0.09], [165, 0.06]]) {
    const n = cv(res, res), nx = n.getContext('2d');
    const img = nx.createImageData(res, res);
    for (let i = 0; i < res * res; i++) {
      img.data[i * 4] = mr; img.data[i * 4 + 1] = mg; img.data[i * 4 + 2] = mb;
      img.data[i * 4 + 3] = Math.pow(r(), 1.8) * 255 * maxA;
    }
    nx.putImageData(img, 0, 0);
    x.save(); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(n, 0, 0, W, W); x.restore();
  }
  x.save(); x.strokeStyle = css(FIBRE);
  for (let i = 0; i < 420; i++) {
    const px = r() * W, py = r() * W, len = 5 + r() * 22, ang = r() * Math.PI;
    x.globalAlpha = 0.01 + r() * 0.02; x.lineWidth = 0.5 + r() * 0.7;
    x.beginPath(); x.moveTo(px, py);
    x.quadraticCurveTo(px + Math.cos(ang) * len * 0.5 + (r() - 0.5) * 5, py + Math.sin(ang) * len * 0.5 + (r() - 0.5) * 5,
      px + Math.cos(ang) * len, py + Math.sin(ang) * len);
    x.stroke();
  }
  x.restore();
  x.save();
  for (let i = 0; i < 2200; i++) {
    x.globalAlpha = 0.015 + r() * 0.03;
    x.fillStyle = r() < 0.55 ? css(FIBRE) : css([1, 1, 1]);
    x.beginPath(); x.arc(r() * W, r() * W, 0.4 + r() * 1.0, 0, TAU); x.fill();
  }
  x.restore();
  return c;
}

/* ── live plates ──────────────────────────────────────────────────────────────
   Each frame draws continuous coverage (alpha) into one canvas per ink.
   compose() screens them per pixel against page-pinned threshold tables that
   also carry mottling and starvation, so the screen never swims.            */

const PL = ['yellow', 'pink', 'blue', 'indigo'];
const PG = {};
for (const n of PL) PG[n] = cv(W, W).getContext('2d', { willReadFrequently: true });

const THR = {};
function buildThr(n) {
  const sc = screenOf(n), S = sc.S, t = new Uint8Array(W * W), r = rngFor('thr:' + n);
  const R = 16, R2 = R + 2, nz = new Float32Array(R2 * R2);
  for (let i = 0; i < nz.length; i++) nz[i] = r() * 2 - 1;
  for (let y = 0; y < W; y++) {
    const fy = y / W * R, iy = fy | 0, vy = fy - iy, row = (y % S) * S;
    for (let x = 0; x < W; x++) {
      const fx = x / W * R, ix = fx | 0, vx = fx - ix, k = iy * R2 + ix;
      const m = (nz[k] * (1 - vx) + nz[k + 1] * vx) * (1 - vy) + (nz[k + R2] * (1 - vx) + nz[k + R2 + 1] * vx) * vy;
      t[y * W + x] = clamp(Math.round(sc.th[row + x % S] * 236 + 7 + m * 7 + (r() - 0.5) * 22), 2, 250);
    }
  }
  const flecks = Math.round(W * W / 2600);
  for (let i = 0; i < flecks; i++) {
    const cx = r() * W, cy = r() * W, rad = 0.5 + r() * r() * 1.8, rr = rad * rad;
    for (let y = Math.max(0, Math.floor(cy - rad)); y <= Math.min(W - 1, Math.ceil(cy + rad)); y++)
      for (let x = Math.max(0, Math.floor(cx - rad)); x <= Math.min(W - 1, Math.ceil(cx + rad)); x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= rr) t[y * W + x] = 255;
  }
  return t;
}

let paperPx = null, frame = null;
const INKM = PL.map(n => INK[n]);
const OFF = PL.map(n => REG[n]);
function compose(ctx, paper) {
  if (!paperPx) {
    paperPx = paper.getContext('2d').getImageData(0, 0, W, W).data;
    frame = ctx.createImageData(W, W);
    for (const n of PL) THR[n] = buildThr(n);
  }
  const o = frame.data;
  o.set(paperPx);
  for (let k = 0; k < PL.length; k++) {
    const a = PG[PL[k]].getImageData(0, 0, W, W).data, th = THR[PL[k]];
    const [mr, mg, mb] = INKM[k], [dx, dy] = OFF[k];
    const x0 = Math.max(0, dx), x1 = Math.min(W, W + dx);
    for (let y = Math.max(0, dy); y < Math.min(W, W + dy); y++) {
      let j = (y - dy) * W + x0 - dx, i = (y * W + x0) * 4;
      for (let x = x0; x < x1; x++, j++, i += 4) {
        if (a[j * 4 + 3] > th[j]) { o[i] *= mr; o[i + 1] *= mg; o[i + 2] *= mb; }
      }
    }
  }
  ctx.putImageData(frame, 0, 0);
}

/* ── plate operations ─────────────────────────────────────────────────────────
   cov maps plate → number | {ys:[..], as:[..]} (a vertical coverage ramp).
   put:   the shape owns its value on every plate (occludes what is behind).
   add:   overprint onto the listed plates.
   knock: take the listed plates back toward paper by the given fraction.   */

function resetPlates() {
  for (const n of PL) {
    const g = PG[n];
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, W);
    g.fillStyle = g.strokeStyle = '#000'; g.lineCap = g.lineJoin = 'round';
  }
}
function style(g, c) {
  if (typeof c === 'number') { g.globalAlpha = clamp(c, 0, 1); return '#000'; }
  g.globalAlpha = 1;
  const y0 = c.ys[0], y1 = c.ys[c.ys.length - 1];
  const gr = g.createLinearGradient(0, y0, 0, y1);
  c.ys.forEach((y, i) => gr.addColorStop((y - y0) / (y1 - y0), 'rgba(0,0,0,' + clamp(c.as[i], 0, 1) + ')'));
  return gr;
}
function put(path, cov, rule) {
  for (const n of PL) {
    const g = PG[n];
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.fillStyle = '#000';
    g.fill(path, rule || 'nonzero');
    const c = cov[n];
    if (c) { g.globalCompositeOperation = 'lighter'; g.fillStyle = style(g, c); g.fill(path, rule || 'nonzero'); }
  }
}
function add(path, cov, rule) {
  for (const n in cov) {
    const g = PG[n], c = cov[n];
    if (!c) continue;
    g.globalCompositeOperation = 'source-over'; g.fillStyle = style(g, c); g.fill(path, rule || 'nonzero');
  }
}
function knock(path, cov, rule) {
  for (const n in cov) {
    const g = PG[n];
    if (!cov[n]) continue;
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = style(g, cov[n]); g.fill(path, rule || 'nonzero');
  }
}
function strokeOn(n, path, w, a, op) {
  const g = PG[n];
  if (a <= 0) return;
  g.globalCompositeOperation = op || 'source-over'; g.globalAlpha = clamp(a, 0, 1); g.lineWidth = w; g.strokeStyle = '#000';
  g.stroke(path);
}
function radial(g, x, y, r0, r1, a0, a1) {
  const gr = g.createRadialGradient(x, y, r0, x, y, r1);
  gr.addColorStop(0, 'rgba(0,0,0,' + clamp(a0, 0, 1) + ')'); gr.addColorStop(1, 'rgba(0,0,0,' + clamp(a1, 0, 1) + ')');
  return gr;
}
function glow(n, x, y, r0, r1, a, op) {
  if (a <= 0.001) return;
  const g = PG[n];
  g.globalCompositeOperation = op || 'source-over'; g.globalAlpha = 1;
  g.fillStyle = radial(g, x, y, r0, r1, a, 0);
  g.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
}
function withClip(path, fn) {
  for (const n of PL) { PG[n].save(); PG[n].clip(path); }
  fn();
  for (const n of PL) PG[n].restore();
}
function mixCov(a, b, u) {
  const o = {};
  for (const n of PL) {
    const x = a[n] || 0, y = b[n] || 0;
    if (typeof x === 'number' && typeof y === 'number') o[n] = lerp(x, y, u);
    else {
      const ys = x.ys || y.ys;
      o[n] = { ys, as: ys.map((_, i) => lerp(x.as ? x.as[i] : x, y.as ? y.as[i] : y, u)) };
    }
  }
  return o;
}
function scaleCov(c, k) {
  const o = {};
  for (const n in c) o[n] = typeof c[n] === 'number' ? c[n] * k : { ys: c[n].ys, as: c[n].as.map(v => v * k) };
  return o;
}
function poly(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; }
function rrect(x0, y0, x1, y1, r, p) {
  p = p || new Path2D();
  p.moveTo(x0 + r, y0); p.arcTo(x1, y0, x1, y1, r); p.arcTo(x1, y1, x0, y1, r);
  p.arcTo(x0, y1, x0, y0, r); p.arcTo(x0, y0, x1, y0, r); p.closePath();
  return p;
}
function rect(x0, y0, x1, y1, p) { p = p || new Path2D(); p.rect(x0, y0, x1 - x0, y1 - y0); return p; }

/* ── craft kit ────────────────────────────────────────────────────────────── */

function makeWob(rng, harmonics = 3) {
  const h = [];
  for (let i = 0; i < harmonics; i++) h.push([2 + i, rng() * 2 - 1, rng() * TAU]);
  return th => h.reduce((s, [k, a, p]) => s + a * Math.sin(k * th + p), 0) / harmonics;
}
function curve(pts, closed, per) {
  per = per || 12;
  const n = pts.length, out = [];
  const at = i => pts[closed ? (i + n * 2) % n : clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < per; k++) {
      const u = k / per, u2 = u * u, u3 = u2 * u;
      out.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * u3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
function ringPts(x, y, rx, ry, n, rot) {
  const out = [], c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  for (let i = 0; i < n; i++) {
    const th = i / n * TAU, px = Math.cos(th) * rx, py = Math.sin(th) * ry;
    out.push([x + px * c - py * s, y + px * s + py * c]);
  }
  return out;
}
function cut(pts, rng, o) {
  o = o || {};
  const amp = o.amp === undefined ? 3 : o.amp;
  const c = curve(pts, true, o.per || 10), n = c.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const a = c[i], b = c[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1;
  const w1 = makeWob(rng, 4), w2 = makeWob(rng, 9), d = new Float32Array(n);
  for (let i = 0; i < n; i++) { const th = i / n * TAU; d[i] = (w1(th) + w2(th * 3) * 0.3) * amp; }
  for (let pass = 0; pass < 2; pass++) {
    const s = Float32Array.from(d);
    for (let i = 0; i < n; i++) d[i] = (s[(i - 1 + n) % n] + s[i] * 2 + s[(i + 1) % n]) * 0.25;
  }
  const p = new Path2D();
  for (let i = 0; i < n; i++) {
    const a = c[(i - 1 + n) % n], b = c[(i + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const x = c[i][0] + sgn * ty * d[i], y = c[i][1] - sgn * tx * d[i];
    i ? p.lineTo(x, y) : p.moveTo(x, y);
  }
  p.closePath();
  return p;
}
function nib(pts, wfn, o) {
  o = o || {};
  const c = o.raw ? pts : curve(pts, false, o.per || 10);
  const n = c.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = Math.max(0.01, wfn(i / (n - 1)));
    L.push([c[i][0] - ty * w, c[i][1] + tx * w]);
    R.push([c[i][0] + ty * w, c[i][1] - tx * w]);
  }
  const p = new Path2D();
  p.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) p.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) p.lineTo(R[i][0], R[i][1]);
  p.closePath();
  return p;
}
const wTip = w => u => w * (1 - u * u);
const wSwell = (w, at, k) => u => w * Math.exp(-Math.pow((u - at) / (k || 0.35), 2));
const wLeaf = (w, skew) => u => w * Math.pow(Math.sin(Math.PI * Math.pow(u, skew || 0.55)), 1.15);
