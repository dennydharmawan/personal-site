// node render.mjs [fps] [out.mkv] [from] [to]
// Renders every frame through seek(t) and pipes lossless PNGs into one ffmpeg that blurs at 1080,
// downsamples to 720, and writes a lossless RGB master. The blur runs before the downsample so the
// riso dot screen averages into tone instead of aliasing into a rosette.
import { chromium } from 'playwright-core';
import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
const fps = Number(process.argv[2] || 30), outFile = process.argv[3] || 'master.mkv';
const from = Number(process.argv[4] || 0);

const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(fps), '-i', '-',
  '-vf', 'gblur=sigma=0.8:steps=6,scale=720:720:flags=lanczos',
  '-c:v', 'libx264rgb', '-qp', '0', '-preset', 'veryfast', '-pix_fmt', 'gbrp', outFile,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const encoded = new Promise((res, rej) => ff.on('close', code => code ? rej(new Error(`ffmpeg exited ${code}`)) : res()));
// An early ffmpeg exit shows up as EPIPE here and 'drain' never fires, so writes race the exit instead.
ff.stdin.on('error', () => {});
encoded.catch(() => {});
const write = buf => ff.stdin.write(buf) ? Promise.resolve() : Promise.race([new Promise(res => ff.stdin.once('drain', res)), encoded]);

const fail = err => { console.error(String(err)); ff.kill(); rmSync(outFile, { force: true }); process.exit(1); };

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(pathToFileURL(resolve('film.html')).href);
await page.waitForFunction(() => window.__riso && window.__riso.ready);
const dur = Number(process.argv[5] || await page.evaluate(() => window.__riso.duration));
// The film loops, so t = dur repeats t = 0 and is left out.
const n = Math.round((dur - from) * fps);
const t0 = Date.now();
try {
  for (let i = 0; i < n; i++) {
    const t = from + i / fps;
    const url = await page.evaluate(t => { window.__riso.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t);
    await write(Buffer.from(url.split(',')[1], 'base64'));
    if (i % 150 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
} catch (err) { await browser.close(); fail(err); }
await browser.close();
if (errors.length) fail(errors.join('\n'));
ff.stdin.end();
await encoded.catch(fail);
const ms = Date.now() - t0;
console.log(`wrote ${outFile} ${n} frames in ${(ms / 1000).toFixed(1)} s, ${(ms / n).toFixed(0)} ms/frame`);
