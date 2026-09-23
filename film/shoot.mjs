// node shoot.mjs --times 1,2,3 --out out/   (default: the SHOTS table)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? a.push([v.slice(2), all[i + 1]]) : 0, a), []));
const out = resolve(args.out || 'out'); mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(pathToFileURL(resolve('film.html')).href);
await page.waitForFunction(() => window.__riso && window.__riso.ready, null, { timeout: 60000 });
const times = args.times ? args.times.split(',').map(Number) : await page.evaluate(() => window.__riso.shots.map(s => s.at));
const shots = await page.evaluate(() => window.__riso.shots);
const meta = [];
for (const t of times) {
  const t0 = Date.now();
  const url = await page.evaluate(t => { window.__riso.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  const f = `${out}/t_${t.toFixed(2).padStart(6, '0')}.png`;
  writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
  const s = shots.find(s => Math.abs(s.at - t) < 1e-6);
  meta.push({ t, file: f, beat: s ? s.beat : '', ms: Date.now() - t0 });
}
writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
console.log(meta.map(m => `${m.t.toFixed(2)}s ${m.ms}ms ${m.beat}`).join('\n'));
if (errors.length) { console.error('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
await browser.close();
