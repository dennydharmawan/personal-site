#!/usr/bin/env node
// Usage: node scripts/architecture/generate.mjs [--sheet out.png]
// Builds the three Work samples architecture diagrams into ../public/portfolio-previews/architecture/.
// Text is measured in Chrome with the site's embedded font, so every box is sized to what it holds.
// Before writing, it fails if a text escapes its box or an arrow label crowds a box, another label, or the edge.
// --sheet renders each diagram at 1440 and at 338 px (the phone frame) into one PNG to look at.
import fs from 'node:fs';
import path from 'node:path';
import { CLIPS_DIR, REPO_DIR, fail, launchBrowser, tempDir } from '../lib.mjs';

const args = process.argv.slice(2);
let sheet = '';
const sheetAt = args.indexOf('--sheet');
if (sheetAt !== -1) {
  sheet = path.resolve(args[sheetAt + 1] ?? '');
  if (!args[sheetAt + 1]) fail('Usage: node scripts/architecture/generate.mjs [--sheet out.png]');
}

const OUT = path.join(REPO_DIR, 'public/portfolio-previews/architecture');
const LOGO_DIR = path.join(CLIPS_DIR, 'public/logos');
const FONT = fs
  .readFileSync(path.join(REPO_DIR, 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2'))
  .toString('base64');

// sRGB conversions of Tailwind v4.3 palette steps, as in src/theme.ts.
const C = {
  ground: '#fafafa', // zinc-50
  white: '#ffffff',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc400: '#9f9fa9',
  zinc500: '#71717b',
  zinc700: '#3f3f46',
  zinc900: '#18181b',
  sky50: '#f0f9ff',
  sky100: '#dff2fe',
  sky500: '#00a6f4',
  sky700: '#0069a8',
  emerald50: '#ecfdf5',
  emerald600: '#009966',
  emerald700: '#007a55',
  rose50: '#fff1f2',
  rose600: '#ec003f',
  rose700: '#c70036',
};

// ---------- logos: path data from clips/public/logos ----------
const read = (name) => fs.readFileSync(path.join(LOGO_DIR, `${name}.svg`), 'utf8');
const pathsOf = (text) => [...text.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ' '));
const viewBoxOf = (text) => text.match(/viewBox="([^"]+)"/)[1];
// `crop` marks a Simple Icons square: its viewBox is replaced by the ink's bounding box at run time.
const mark = (name, fill, { crop = false, evenodd = false } = {}) => {
  const text = read(name);
  return { viewBox: viewBoxOf(text), parts: pathsOf(text).map((d) => ({ d, fill })), crop, evenodd };
};
const LOGOS = {
  zoho: mark('zoho', '#E42527'),
  jumpcloud: mark('jumpcloud', '#002B49'),
  slack: mark('slack', '#4A154B', { evenodd: true }),
  confluence: mark('confluence', '#172B4D'),
  jira: mark('jira', '#0052CC'),
  bitbucket: mark('bitbucket', '#0052CC'),
  datadog: mark('datadog', '#632CA6'),
  tailscale: mark('tailscale', '#242424'),
  redis: mark('redis', '#FF4438', { crop: true }),
  // The dolphin is a thin line drawing next to a wordmark, so it gets a taller row than the other marks.
  mysql: { ...mark('mysql', '#4479A1', { crop: true }), rowHeight: 64 },
  nextjs: mark('nextjs', '#000000', { crop: true }),
  nodejs: mark('nodejs', '#5FA04E', { crop: true }),
  typescript: mark('typescript', '#3178C6', { crop: true }),
  kafka: mark('kafka', '#231F20', { crop: true }),
  vonage: mark('vonage', '#000000', { crop: true }),
  whatsapp: mark('whatsapp', '#25D366', { crop: true }),
  midtrans: {
    // The three bars' ink box; the file's 0 0 28.2 30 leaves a sliver of padding.
    viewBox: '0 0 28.11 29.88',
    parts: [...read('midtrans-mark').matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)].map((m) => ({
      fill: m[1],
      d: m[2].replace(/\s+/g, ' '),
    })),
  },
};
const aspect = (name) => {
  const [, , w, h] = LOGOS[name].viewBox.split(/\s+/).map(Number);
  return w / h;
};
const ROW_LOGO = 48;
const rowHeight = (name) => LOGOS[name].rowHeight ?? ROW_LOGO;
// A taller mark shares the row's centre line, so it keeps its gap above the node's name.
const rowTop = (name, top) => top - (rowHeight(name) - ROW_LOGO) / 2;
// A mark sized to a height, capped in width so wide wordmarks stay in proportion.
function logo(name, x, y, h, maxW = h * 2) {
  const w = Math.min(maxW, h * aspect(name));
  const hh = w / aspect(name);
  const { viewBox, parts, evenodd } = LOGOS[name];
  const body = parts.map((p) => `<path d="${p.d}" fill="${p.fill}"${evenodd ? ' fill-rule="evenodd"' : ''}/>`).join('');
  return { svg: `<svg x="${x}" y="${(y + (h - hh) / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" viewBox="${viewBox}" aria-hidden="true">${body}</svg>`, w };
}

// ---------- text measurement ----------
let page;
const cache = new Map();
async function measure(text, size, weight) {
  const key = `${size}|${weight}|${text}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      await page.evaluate(([t, s, w]) => {
        const el = document.getElementById('m');
        el.textContent = t;
        el.setAttribute('font-size', s);
        el.setAttribute('font-weight', w);
        return el.getComputedTextLength();
      }, [text, size, weight]),
    );
  }
  return cache.get(key);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- primitives ----------
const TONES = {
  plain: { fill: C.white, stroke: C.zinc200, sw: 2 },
  focal: { fill: C.sky50, stroke: C.sky500, sw: 3 },
  done: { fill: C.emerald50, stroke: C.emerald600, sw: 3 },
  fail: { fill: C.rose50, stroke: C.rose600, sw: 3 },
};
const NAME = 40;
const SUB = 32;
const PAD = 24;

/** A node: logo row on top (optional), name, sublabel. Returns svg and its rect. */
async function node({ id, x, y, w, h = 180, name, sub, logos = [], tone = 'plain', subColor = C.zinc500 }) {
  const t = TONES[tone];
  const parts = [];
  parts.push(`<rect data-box="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${t.fill}" stroke="${t.stroke}" stroke-width="${t.sw}"/>`);
  let nameY;
  let subY;
  if (logos.length) {
    let lx = x + PAD;
    for (const name of logos) {
      const l = logo(name, lx, rowTop(name, y + PAD), rowHeight(name));
      parts.push(l.svg);
      lx += l.w + 16;
    }
    nameY = y + 124;
    subY = y + 160;
  } else if (sub) {
    nameY = y + h / 2 - 9;
    subY = nameY + 40;
  } else {
    nameY = y + h / 2 + 14;
  }
  parts.push(`<text data-in="${id}" x="${x + PAD}" y="${nameY}" font-size="${NAME}" font-weight="600" fill="${C.zinc900}">${esc(name)}</text>`);
  if (sub) parts.push(`<text data-in="${id}" x="${x + PAD}" y="${subY}" font-size="${SUB}" font-weight="500" fill="${subColor}">${esc(sub)}</text>`);
  const need = Math.max(await measure(name, NAME, 600), sub ? await measure(sub, SUB, 500) : 0) + 2 * PAD;
  if (need > w) throw new Error(`${id}: needs ${Math.ceil(need)}px, has ${w}`);
  return parts.join('');
}

/** Orthogonal polyline with rounded corners. */
function route(points, r = 16) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    if (i === points.length - 1) {
      d += ` L${x},${y}`;
      break;
    }
    const [px, py] = points[i - 1];
    const [nx, ny] = points[i + 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, inLen / 2, outLen / 2);
    const ax = x - (Math.sign(x - px) * rr);
    const ay = y - (Math.sign(y - py) * rr);
    const bx = x + (Math.sign(nx - x) * rr);
    const by = y + (Math.sign(ny - y) * rr);
    d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
  }
  return d;
}

const ARROW = {
  sky: { stroke: C.sky500, text: C.sky700, w: 4 },
  rose: { stroke: C.rose600, text: C.rose700, w: 4 },
  zinc: { stroke: C.zinc400, text: C.zinc500, w: 3, dash: '12 10' },
};
function arrow(points, kind = 'sky') {
  const a = ARROW[kind];
  return `<path d="${route(points)}" fill="none" stroke="${a.stroke}" stroke-width="${a.w}"${a.dash ? ` stroke-dasharray="${a.dash}"` : ''} stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ah-${kind})"/>`;
}

/**
 * An arrow label on an opaque ground-coloured mask. `at` anchors one side of the mask:
 * above/below a horizontal segment, or left/right of a vertical one, with a 10px gap.
 * Lines are [text, colour, weight].
 */
async function label({ x, y, side, lines, kind = 'sky' }) {
  const LH = 44;
  const widths = [];
  for (const [text, , weight = 600] of lines) widths.push(await measure(text, SUB, weight));
  const w = Math.max(...widths) + 24;
  const h = LH * lines.length;
  const GAP = 10;
  let mx;
  let my;
  if (side === 'above') [mx, my] = [x - w / 2, y - GAP - h];
  if (side === 'below') [mx, my] = [x - w / 2, y + GAP];
  if (side === 'right') [mx, my] = [x + GAP, y - h / 2];
  if (side === 'left') [mx, my] = [x - GAP - w, y - h / 2];
  const parts = [`<rect data-mask="1" x="${mx.toFixed(1)}" y="${my.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="8" fill="${C.ground}"/>`];
  lines.forEach(([text, color = ARROW[kind].text, weight = 600], i) => {
    parts.push(`<text x="${(mx + w / 2).toFixed(1)}" y="${(my + LH * i + 33).toFixed(1)}" font-size="${SUB}" font-weight="${weight}" fill="${color}" text-anchor="middle">${text}</text>`);
  });
  return parts.join('');
}

function frame({ slug, title, desc, body }) {
  const markers = Object.entries({ sky: C.sky500, rose: C.rose600, zinc: C.zinc400 })
    .map(([k, c]) => `<marker id="ah-${k}" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="20" refX="20" refY="10" orient="auto"><path d="M0,0 L22,10 L0,20 Z" fill="${c}"/></marker>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" role="img" aria-labelledby="${slug}-title ${slug}-desc">
<title id="${slug}-title">${esc(title)}</title>
<desc id="${slug}-desc">${esc(desc)}</desc>
<defs>
<style>@font-face{font-family:"Instrument Sans";src:url(data:font/woff2;base64,${FONT}) format("woff2");font-weight:400 700;font-display:block}text{font-family:"Instrument Sans","Instrument Sans Variable",ui-sans-serif,system-ui,sans-serif}</style>
${markers}
</defs>
<rect width="1440" height="960" fill="${C.ground}"/>
${body}
</svg>
`;
}

// ---------- 1. HRIS automation ----------
async function hris() {
  const r1 = 72;
  const r2 = 384;
  const mid1 = r1 + 90;
  const mid2 = r2 + 90;
  const strip = { x: 48, y: 736, w: 1344, h: 176 };
  const arrows = [
    arrow([[400, mid1], [578, mid1]]),
    arrow([[760, r1 + 180], [760, r2 - 2]]),
    arrow([[908, mid2], [1068, mid2]]),
    arrow([[1300, r2 + 180], [1300, strip.y - 2]]),
    arrow([[1220, r2], [1220, r1 + 182]], 'zinc'),
    // The retry leaves the worker, drops under the row, and comes back up into the queue.
    arrow([[1070, 524], [990, 524], [990, 620], [690, 620], [690, r2 + 182]], 'rose'),
  ];
  const labels = [
    await label({ x: 490, y: mid1, side: 'above', lines: [['webhook']] }),
    await label({ x: 760, y: 318, side: 'right', lines: [['enqueue']] }),
    await label({ x: 989, y: mid2, side: 'above', lines: [['run job']] }),
    await label({ x: 1300, y: 650, side: 'left', lines: [['create, remove']] }),
    await label({ x: 1220, y: 318, side: 'right', kind: 'zinc', lines: [['record']] }),
    await label({ x: 830, y: 620, side: 'below', kind: 'rose', lines: [['retry with backoff'], ['resumes at the failed step', C.rose700, 500]] }),
  ];
  const nodes = [
    await node({ id: 'zoho', x: 48, y: r1, w: 352, name: 'Zoho People', sub: 'hire, rehire, offboard', logos: ['zoho'] }),
    await node({ id: 'api', x: 580, y: r1, w: 360, name: 'Provisioning API', sub: 'Node.js, TypeScript', logos: ['nodejs', 'typescript'] }),
    await node({ id: 'audit', x: 1070, y: r1, w: 300, name: 'Audit log', sub: 'every change', logos: ['mysql'] }),
    await node({ id: 'queue', x: 612, y: r2, w: 296, name: 'Job queue', sub: 'BullMQ on Redis', logos: ['redis'] }),
    await node({ id: 'workers', x: 1070, y: r2, w: 300, name: 'Workers', sub: 'skip if it exists', tone: 'focal', subColor: C.sky700 }),
  ];
  // The eight tools: a strip of logo tiles, the end state.
  const tools = ['jumpcloud', 'zoho', 'slack', 'confluence', 'jira', 'bitbucket', 'datadog', 'tailscale'];
  const t = TONES.done;
  const s = [`<rect data-box="tools" x="${strip.x}" y="${strip.y}" width="${strip.w}" height="${strip.h}" rx="16" fill="${t.fill}" stroke="${t.stroke}" stroke-width="${t.sw}"/>`];
  s.push(`<text data-in="tools" x="${strip.x + PAD}" y="${strip.y + 79}" font-size="${NAME}" font-weight="600" fill="${C.zinc900}">8 tools</text>`);
  s.push(`<text data-in="tools" x="${strip.x + PAD}" y="${strip.y + 119}" font-size="${SUB}" font-weight="500" fill="${C.emerald700}">accounts ready</text>`);
  const tile = 96;
  const first = strip.x + PAD + (await measure('accounts ready', SUB, 500)) + 48;
  const last = strip.x + strip.w - PAD - tile;
  const step = (last - first) / (tools.length - 1);
  tools.forEach((name, i) => {
    const tx = first + i * step;
    const ty = strip.y + (strip.h - tile) / 2;
    s.push(`<rect data-in="tools" x="${tx.toFixed(1)}" y="${ty}" width="${tile}" height="${tile}" rx="20" fill="${C.white}" stroke="${C.zinc200}" stroke-width="2"/>`);
    const l = logo(name, 0, 0, 52, 72);
    s.push(logo(name, tx + (tile - l.w) / 2, ty + (tile - 52) / 2, 52, 72).svg);
  });
  return frame({
    slug: 'arch-hris',
    title: 'HRIS automation workflow architecture',
    desc: 'A hire, rehire, or offboard event in Zoho People reaches the provisioning API (Node.js, TypeScript) by webhook. The API enqueues the job in BullMQ on Redis, and workers run it, skipping any account that already exists. Workers create or remove accounts in 8 tools: JumpCloud, Zoho, Slack, Confluence, Jira, Bitbucket, Datadog, and Tailscale. A failed job goes back to the queue to retry with backoff and resumes at the failed step. Workers record every change in a MySQL audit log.',
    body: [...arrows, ...labels, ...nodes, ...s].join('\n'),
  });
}

// ---------- 2. Loan collections ----------
async function loans() {
  const r1 = 150;
  const r2 = 590;
  const arrows = [
    arrow([[238, r1 + 180], [238, r2 - 2]]),
    arrow([[428, r2 + 42], [508, r2 + 42], [508, r1 + 90], [584, r1 + 90]]),
    arrow([[428, r2 + 138], [584, r2 + 138]]),
    arrow([[930, r1 + 90], [1078, r1 + 90]]),
    arrow([[930, r2 + 90], [1078, r2 + 90]]),
  ];
  const labels = [
    await label({ x: 238, y: (r1 + 180 + r2) / 2, side: 'right', lines: [['next step']] }),
    await label({ x: 508, y: (r1 + 180 + r2) / 2, side: 'right', lines: [['call']] }),
    await label({ x: 507, y: r2 + 138, side: 'below', lines: [['remind']] }),
    await label({ x: 1004, y: r1 + 90, side: 'above', lines: [['status']] }),
    await label({ x: 1004, y: r2 + 90, side: 'above', lines: [['replies']] }),
  ];
  const nodes = [
    await node({ id: 'console', x: 48, y: r1, w: 380, name: 'Collector console', sub: 'Next.js', logos: ['nextjs'] }),
    await node({ id: 'api', x: 48, y: r2, w: 380, name: 'Collections API', sub: 'Node.js, Redis queue', logos: ['nodejs', 'redis'] }),
    await node({ id: 'vonage', x: 586, y: r1, w: 344, name: 'Vonage Voice', sub: 'browser calls', logos: ['vonage'] }),
    await node({ id: 'whatsapp', x: 586, y: r2, w: 344, name: 'WhatsApp', sub: 'template reminders', logos: ['whatsapp'] }),
  ];
  // The timeline: one card that every contact lands on.
  const tl = { x: 1080, y: r1, w: 312, h: r2 + 180 - r1 };
  const t = TONES.done;
  const s = [`<rect data-box="timeline" x="${tl.x}" y="${tl.y}" width="${tl.w}" height="${tl.h}" rx="16" fill="${t.fill}" stroke="${t.stroke}" stroke-width="${t.sw}"/>`];
  s.push(logo('mysql', tl.x + PAD, rowTop('mysql', tl.y + PAD), rowHeight('mysql')).svg);
  s.push(`<text data-in="timeline" x="${tl.x + PAD}" y="${tl.y + 124}" font-size="${NAME}" font-weight="600" fill="${C.zinc900}">Timeline</text>`);
  s.push(`<text data-in="timeline" x="${tl.x + PAD}" y="${tl.y + 160}" font-size="${SUB}" font-weight="500" fill="${C.emerald700}">one per loan</text>`);
  const chips = [
    ['Call, no answer', C.white, C.zinc200, C.zinc700],
    ['Reminder read', C.sky100, C.sky100, C.sky700],
    ['Promise to pay', C.emerald600, C.emerald600, C.white],
  ];
  let cy = tl.y + 236;
  for (const [text, fill, stroke, ink] of chips) {
    const w = (await measure(text, SUB, 600)) + 36;
    s.push(`<rect data-in="timeline" x="${tl.x + PAD}" y="${cy}" width="${w.toFixed(1)}" height="60" rx="30" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
    s.push(`<text data-in="timeline" x="${tl.x + PAD + 18}" y="${cy + 41}" font-size="${SUB}" font-weight="600" fill="${ink}">${text}</text>`);
    cy += 84;
  }
  return frame({
    slug: 'arch-loans',
    title: 'Multi-channel loan collections architecture',
    desc: "A collector sets each loan's next step in a Next.js console, which sends it to the collections API (Node.js with a Redis queue). The API places browser calls through Vonage Voice and sends template reminders through WhatsApp. Call status from Vonage and replies from WhatsApp land on one MySQL timeline per loan, with entries such as a call with no answer, a reminder read, and a promise to pay.",
    body: [...arrows, ...labels, ...nodes, ...s].join('\n'),
  });
}

// ---------- 3. E-commerce payments ----------
async function payments() {
  const r1 = 72;
  const r2 = 384;
  const r3 = 696;
  const mid1 = r1 + 90;
  const mid2 = r2 + 90;
  const mid3 = r3 + 90;
  const arrows = [
    arrow([[308, mid1], [546, mid1]]),
    arrow([[868, mid1], [1030, mid1]]),
    arrow([[1212, r1 + 180], [1212, r2 - 2]]),
    arrow([[1056, mid2], [854, mid2]]),
    arrow([[780, r2], [780, r1 + 182]]),
    arrow([[636, r1 + 180], [636, 318], [178, 318], [178, r2 - 2]]),
    arrow([[178, r2 + 180], [178, mid3], [510, mid3]], 'zinc'),
    arrow([[1212, r2 + 180], [1212, mid3], [906, mid3]], 'zinc'),
  ];
  const labels = [
    await label({ x: 427, y: mid1, side: 'above', lines: [['place order']] }),
    await label({ x: 949, y: mid1, side: 'above', lines: [['pay']] }),
    await label({ x: 1212, y: 318, side: 'right', lines: [['charge']] }),
    await label({ x: 954, y: mid2, side: 'above', lines: [['webhook']] }),
    await label({ x: 780, y: 318, side: 'right', lines: [['paid', C.emerald700]] }),
    await label({ x: 407, y: 318, side: 'above', lines: [[`awaiting → <tspan fill="${C.emerald700}">paid</tspan>`, C.sky700]] }),
    await label({ x: 347, y: mid3, side: 'above', kind: 'zinc', lines: [['orders']] }),
    await label({ x: 1055, y: mid3, side: 'above', kind: 'zinc', lines: [['settlement']] }),
  ];
  const nodes = [
    await node({ id: 'checkout', x: 48, y: r1, w: 260, name: 'Checkout', sub: 'Next.js', logos: ['nextjs'] }),
    await node({ id: 'order', x: 548, y: r1, w: 320, name: 'Order service', sub: 'owns order state', tone: 'focal', subColor: C.sky700 }),
    await node({ id: 'payment', x: 1032, y: r1, w: 360, name: 'Payment service', sub: 'Payment API' }),
    await node({ id: 'db', x: 48, y: r2, w: 260, name: 'Orders DB', sub: 'SQL' }),
    await node({ id: 'kafka', x: 564, y: r2, w: 288, name: 'Kafka', sub: 'payment events', logos: ['kafka'] }),
    await node({ id: 'midtrans', x: 1056, y: r2, w: 312, name: 'Midtrans', sub: 'payment provider', logos: ['midtrans'] }),
    await node({ id: 'recon', x: 512, y: r3, w: 392, name: 'Reconciliation job', sub: 'flags mismatches', tone: 'fail', subColor: C.rose700 }),
  ];
  return frame({
    slug: 'arch-payments',
    title: 'E-commerce payments architecture',
    desc: "A Next.js checkout places the order with the order service, which owns the order's state. The order service asks the payment service to pay, and the payment service charges through Midtrans. Midtrans confirms by webhook into Kafka, Kafka passes the payment back to the order service as paid, and the order service moves the order in the SQL orders database from awaiting to paid. A reconciliation job compares those orders with Midtrans settlement data and flags mismatches.",
    body: [...arrows, ...labels, ...nodes].join('\n'),
  });
}

// ---------- layout check ----------
// Runs on the build's data-* markers, which the written files drop.
async function layoutProblems(svg) {
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const out = [];
    const r = (el) => {
      const b = el.getBBox();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const hit = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;
    const boxes = [...document.querySelectorAll('[data-box]')].map((el) => ({ id: el.dataset.box, ...r(el) }));
    for (const el of document.querySelectorAll('text[data-in]')) {
      const b = boxes.find((x) => x.id === el.dataset.in);
      const t = r(el);
      if (t.x < b.x + 12 || t.x + t.w > b.x + b.w - 12 || t.y < b.y + 6 || t.y + t.h > b.y + b.h - 6) out.push(`text "${el.textContent}" escapes ${b.id}`);
    }
    const masks = [...document.querySelectorAll('[data-mask]')].map((el) => ({ text: el.nextElementSibling?.textContent, ...r(el) }));
    for (const m of masks) for (const b of boxes) if (hit(m, b, 6)) out.push(`label "${m.text}" within 6px of box ${b.id}`);
    for (let i = 0; i < masks.length; i++) for (let j = i + 1; j < masks.length; j++) if (hit(masks[i], masks[j], 6)) out.push(`labels "${masks[i].text}" / "${masks[j].text}" collide`);
    for (const m of masks) if (m.x < 24 || m.y < 24 || m.x + m.w > 1416 || m.y + m.h > 936) out.push(`label "${m.text}" near edge`);
    return out;
  });
}

// ---------- run ----------
const { browser } = await launchBrowser();
page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.setContent(`<style>@font-face{font-family:IS;src:url(data:font/woff2;base64,${FONT}) format('woff2');font-weight:400 700}</style><svg xmlns="http://www.w3.org/2000/svg" width="2000" height="200"><text id="m" x="0" y="100" font-family="IS">x</text></svg>`);
await page.evaluate(() => document.fonts.ready);
for (const l of Object.values(LOGOS).filter((l) => l.crop)) {
  const b = await page.evaluate(([vb, ds]) => {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    host.setAttribute('viewBox', vb);
    host.innerHTML = ds.map((d) => `<path d="${d}"/>`).join('');
    document.body.appendChild(host);
    const r = host.getBBox();
    host.remove();
    return [r.x, r.y, r.width, r.height];
  }, [l.viewBox, l.parts.map((p) => p.d)]);
  l.viewBox = b.map((v) => +v.toFixed(3)).join(' ');
}
const built = { 'hris-automation': await hris(), 'loan-collection': await loans(), 'ecommerce-payment': await payments() };
let failed = false;
for (const [name, svg] of Object.entries(built)) {
  const problems = await layoutProblems(svg);
  if (problems.length) {
    failed = true;
    console.error(`${name}:\n  ${problems.join('\n  ')}`);
  }
}
if (failed) {
  await browser.close();
  fail('Layout check failed; nothing written.');
}
fs.mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries(built)) {
  const file = path.join(OUT, `${name}.svg`);
  fs.writeFileSync(file, svg.replace(/ data-(box|in|mask)="[^"]*"/g, ''));
  console.log(`${name}: layout clean, ${(fs.statSync(file).size / 1024).toFixed(0)} KB -> ${path.relative(REPO_DIR, file)}`);
}

if (sheet) {
  const dir = tempDir('architecture-sheet');
  const rows = [];
  for (const name of Object.keys(built)) {
    const src = `data:image/svg+xml;base64,${fs.readFileSync(path.join(OUT, `${name}.svg`)).toString('base64')}`;
    for (const width of [1440, 338]) {
      const height = Math.round((width * 2) / 3);
      await page.setViewportSize({ width, height });
      await page.setContent(`<html><body style="margin:0"><img src="${src}" style="display:block;width:${width}px"></body></html>`);
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(dir, `${name}-${width}.png`), clip: { x: 0, y: 0, width, height } });
    }
    rows.push(`<div class="row"><figure><img src="${name}-1440.png" style="width:960px"><figcaption>${name} · 1440 render shown at 960</figcaption></figure><figure><img src="${name}-338.png" style="width:338px"><figcaption>338 px (phone, actual size)</figcaption></figure></div>`);
  }
  const html = path.join(dir, 'sheet.html');
  fs.writeFileSync(html, `<!doctype html><html><head><style>body{margin:0;padding:24px;background:#e4e4e7;font:18px -apple-system,Helvetica,sans-serif;color:#18181b}.row{display:flex;gap:24px;align-items:flex-start;margin-bottom:24px}figure{margin:0;background:#fff;padding:10px;border-radius:12px}img{display:block;outline:1px solid #e4e4e7}figcaption{padding:8px 2px 0}</style></head><body>${rows.join('')}</body></html>`);
  await page.setViewportSize({ width: 1420, height: 800 });
  await page.goto(`file://${html}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: sheet, fullPage: true });
  console.log(`sheet -> ${sheet} (338 px tiles at actual size in ${dir})`);
}
await browser.close();
