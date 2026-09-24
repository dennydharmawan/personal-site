// node render.mjs [fps] [out.mp4] [from] [to]  — renders every frame through seek(t) and encodes with ffmpeg
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const fps = Number(process.argv[2] || 30), outFile = process.argv[3] || 'desk-scenery.mp4';
const from = Number(process.argv[4] || 0);
const dir = resolve('frames'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(pathToFileURL(resolve('film.html')).href);
await page.waitForFunction(() => window.__riso && window.__riso.ready);
const dur = Number(process.argv[5] || await page.evaluate(() => window.__riso.duration));
const n = Math.round((dur - from) * fps);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const t = from + i / fps;
  const url = await page.evaluate(t => { window.__riso.seek(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t);
  writeFileSync(`${dir}/f_${String(i).padStart(5, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  if (i % 150 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
}
await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${dir}/f_%05d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', outFile]);
console.log('wrote', outFile);
