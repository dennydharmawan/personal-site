#!/usr/bin/env node
// Serves dist/ with `astro preview`, runs Lighthouse and a table of SEO checks
// against it, and prints one summary line. Build first: `pnpm build`.
//
//   node scripts/seo-check.mjs [--runs 3] [--no-lighthouse] [--json out.json]

import { spawn, execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const SITE = 'https://dennydharmawan.com/';
const PORT = 4329;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const LIGHTHOUSE = 'lighthouse@13.5.0';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const runs = Number(option('--runs', 3));

const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
    try {
      return JSON.parse(m[1]);
    } catch {
      return { parseError: m[1].slice(0, 80) };
    }
  });

const graphNodes = (blocks) => blocks.flatMap((b) => b['@graph'] ?? [b]);
const ofType = (blocks, type) => graphNodes(blocks).find((n) => [n['@type']].flat().includes(type));
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) ?? [];
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const missing = (obj, keys) => keys.filter((k) => obj[k] == null || obj[k] === '');

// Each check returns true on pass, or a string that says what failed.
const CHECKS = [
  ['html-lang', ({ home }) => /<html[^>]*\blang="en"/.test(home.body) || 'no lang on <html>'],
  ['canonical-self', ({ home }) => home.body.includes(`<link rel="canonical" href="${SITE}"`) || 'canonical is not the site root'],
  ['title-length', ({ home }) => {
    const t = home.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    return (t.length >= 30 && t.length <= 60) || `title is ${t.length} chars`;
  }],
  ['description-length', ({ home }) => {
    const d = attr(tags(home.body, 'meta').find((t) => attr(t, 'name') === 'description') ?? '', 'content') ?? '';
    return (d.length >= 70 && d.length <= 160) || `description is ${d.length} chars`;
  }],
  ['single-h1', ({ home }) => tags(home.body, 'h1').length === 1 || `${tags(home.body, 'h1').length} h1 elements`],
  ['img-alt', ({ home }) => {
    const bad = tags(home.body, 'img').filter((t) => attr(t, 'alt') == null);
    return bad.length === 0 || `${bad.length} img without alt`;
  }],
  ['img-dimensions', ({ home }) => {
    const bad = tags(home.body, 'img').filter((t) => !attr(t, 'width') || !attr(t, 'height'));
    return bad.length === 0 || `${bad.length} img without width and height: ${bad.map((t) => attr(t, 'src')).join(', ')}`;
  }],
  ['jsonld-parses', ({ ld }) => ld.every((b) => !b.parseError) || 'a JSON-LD block does not parse'],
  ['jsonld-person', ({ ld }) => {
    const p = ofType(ld, 'Person');
    if (!p) return 'no Person node';
    const gaps = missing(p, ['name', 'url', 'jobTitle', 'image', 'sameAs', 'worksFor', 'knowsAbout']);
    return gaps.length === 0 || `Person lacks ${gaps.join(', ')}`;
  }],
  ['jsonld-website', ({ ld }) => {
    const w = ofType(ld, 'WebSite');
    return Boolean(w && w.url === SITE && w.name) || 'no WebSite node with url and name';
  }],
  ['jsonld-profilepage', ({ ld }) => {
    const p = ofType(ld, 'ProfilePage');
    return Boolean(p && p.mainEntity) || 'no ProfilePage node with mainEntity';
  }],
  ['og-image', ({ og }) => (og.status === 200 && og.type === 'image/png') || `og.png is ${og.status} ${og.type}`],
  ['robots-sitemap', ({ robots }) => robots.body.includes(`Sitemap: ${SITE}sitemap.xml`) || 'robots.txt does not name the sitemap'],
  ['sitemap-lastmod', ({ sitemap }) => /<lastmod>\d{4}-\d{2}-\d{2}/.test(sitemap.body) || 'sitemap has no lastmod'],
  ['llms-txt', ({ llms }) => (llms.status === 200 && llms.body.startsWith('# ')) || `llms.txt is ${llms.status}`],
  ['not-found', ({ notFound }) =>
    (notFound.status === 404 && notFound.body.includes('name="robots" content="noindex"')) || `unknown path is ${notFound.status}`],
];

async function get(path) {
  const res = await fetch(new URL(path, ORIGIN));
  return { status: res.status, type: res.headers.get('content-type')?.split(';')[0], body: await res.text() };
}

async function startPreview() {
  const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    stdio: 'ignore',
  });
  for (let i = 0; i < 240; i++) {
    try {
      if ((await fetch(ORIGIN)).ok) return server;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  server.kill();
  throw new Error(`astro preview did not answer on ${ORIGIN}`);
}

async function lighthouse(preset) {
  const cli = [
    '-y', LIGHTHOUSE, `${ORIGIN}/`, '--output=json', '--output-path=stdout', '--quiet',
    '--chrome-flags=--headless=new', `--only-categories=${CATEGORIES.join(',')}`,
  ];
  if (preset === 'desktop') cli.push('--preset=desktop');
  const { stdout } = await promisify(execFile)('npx', cli, { maxBuffer: 64 * 1024 * 1024 });
  const report = JSON.parse(stdout);
  if (report.runtimeError) throw new Error(report.runtimeError.message);
  const failing = CATEGORIES.filter((c) => c !== 'performance').flatMap((c) =>
    report.categories[c].auditRefs
      .filter((r) => r.weight > 0 && report.audits[r.id].score !== null && report.audits[r.id].score < 1)
      .map((r) => r.id),
  );
  return {
    ...Object.fromEntries(CATEGORIES.map((c) => [c, Math.round(report.categories[c].score * 100)])),
    lcp: Math.round(report.audits['largest-contentful-paint'].numericValue),
    tbt: Math.round(report.audits['total-blocking-time'].numericValue),
    cls: report.audits['cumulative-layout-shift'].numericValue,
    failing,
  };
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const server = await startPreview();
let errors = 0;
const result = { checks: {}, lighthouse: {} };
try {
  const [home, og, robots, sitemap, llms, notFound] = await Promise.all(
    ['/', '/og.png', '/robots.txt', '/sitemap.xml', '/llms.txt', '/seo-check-missing-page'].map(get),
  );
  const ctx = { home, og, robots, sitemap, llms, notFound, ld: jsonLd(home.body) };
  for (const [id, test] of CHECKS) result.checks[id] = test(ctx);

  if (!flag('--no-lighthouse')) {
    for (const preset of ['mobile', 'desktop']) {
      const samples = [];
      for (let i = 0; i < runs; i++) {
        try {
          samples.push(await lighthouse(preset));
        } catch (e) {
          errors++;
          console.error(`lighthouse ${preset} run ${i + 1}: ${e.message}`);
        }
      }
      if (samples.length === 0) continue;
      const pick = (k) => median(samples.map((s) => s[k]));
      result.lighthouse[preset] = {
        ...Object.fromEntries([...CATEGORIES, 'lcp', 'tbt', 'cls'].map((k) => [k, pick(k)])),
        perfRange: [Math.min(...samples.map((s) => s.performance)), Math.max(...samples.map((s) => s.performance))],
        failing: [...new Set(samples.flatMap((s) => s.failing))],
        samples: samples.length,
      };
    }
  }
} finally {
  server.kill();
}

const failed = Object.entries(result.checks).filter(([, v]) => v !== true);
for (const [id, v] of Object.entries(result.checks)) console.log(`${v === true ? 'pass' : 'FAIL'}  ${id}${v === true ? '' : `  ${v}`}`);
for (const [preset, lh] of Object.entries(result.lighthouse)) {
  console.log(
    `${preset.padEnd(7)} perf ${lh.performance} (${lh.perfRange.join('-')})  a11y ${lh.accessibility}  bp ${lh['best-practices']}  seo ${lh.seo}` +
      `  lcp ${lh.lcp}ms  tbt ${lh.tbt}ms  cls ${lh.cls.toFixed(3)}  n=${lh.samples}${lh.failing.length ? `  failing: ${lh.failing.join(',')}` : ''}`,
  );
}
const lhRuns = Object.values(result.lighthouse).reduce((n, lh) => n + lh.samples, 0);
console.log(`checks_failed=${failed.length}/${CHECKS.length} lighthouse_runs=${lhRuns} errors=${errors}`);

if (option('--json')) await writeFile(option('--json'), JSON.stringify({ ...result, errors }, null, 2));
process.exitCode = errors > 0 ? 1 : 0;
