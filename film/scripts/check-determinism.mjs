import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const TIMES = [2.4, 19.03, 34.9, 44.2, 47.3];
// The film loops, so its last instant has to render the same bytes as its first.
const SEAM = [0, 'DUR'];
const film = new URL('../film.html', import.meta.url).href;
let failed = false;

// film.js names Math.random in a comment, so comments are stripped before matching.
for (const file of ['film.js', 'engine.js']) {
  const code = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  for (const banned of code.match(/\bMath\s*\.\s*random\b|\bDate\s*\.\s*now\b/g) ?? []) {
    console.error(`FAIL ${file} uses ${banned}`);
    failed = true;
  }
}

async function hashes(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(film);
  await page.waitForFunction(() => window.__riso && window.__riso.ready, null, { timeout: 60000 });
  const out = [];
  for (const t of [...TIMES, ...SEAM]) {
    const url = await page.evaluate(t => { window.__riso.seek(t === 'DUR' ? window.__riso.duration : t); return document.getElementById('c').toDataURL('image/png'); }, t);
    out.push(createHash('sha256').update(Buffer.from(url.split(',')[1], 'base64')).digest('hex'));
  }
  await context.close();
  if (errors.length) throw new Error(`page errors:\n${errors.join('\n')}`);
  return out;
}

const browser = await chromium.launch();
try {
  const a = await hashes(browser);
  const b = await hashes(browser);
  TIMES.forEach((t, i) => {
    const match = a[i] === b[i];
    if (!match) failed = true;
    console.log(`${match ? 'ok  ' : 'FAIL'} t=${t} ${a[i]} ${b[i]}`);
  });
  const [first, last] = a.slice(TIMES.length);
  if (first !== last) failed = true;
  console.log(`${first === last ? 'ok  ' : 'FAIL'} loop seam t=0 ${first} t=DUR ${last}`);
} finally {
  await browser.close();
}
process.exitCode = failed ? 1 : 0;
