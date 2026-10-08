#!/usr/bin/env node
// Usage: node scripts/storyboard.mjs <Composition> <out.png> <frame:label>... [--scale 0.34]
// Renders each listed frame and tiles them into one labelled contact sheet.
// Tiles are drawn at the on-site scale: 0.46 (1440 desktop), 0.34 (1024, the default), 0.235 (390 phone).
// Example: node scripts/storyboard.mjs AuthAccess /tmp/auth.png 0:Opening 100:Timed\ out 120:Retry 270:Ready
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { bundle, fail, launchBrowser, pngSize, still, tempDir } from './lib.mjs';

const FPS = 30;
const args = process.argv.slice(2);
let scale = 0.34;
const scaleAt = args.indexOf('--scale');
if (scaleAt !== -1) {
  scale = Number(args[scaleAt + 1]);
  args.splice(scaleAt, 2);
}
const [composition, out, ...specs] = args;
if (!composition || !out || specs.length === 0 || !(scale > 0)) {
  fail('Usage: node scripts/storyboard.mjs <Composition> <out.png> <frame:label>... [--scale 0.34]');
}

const frames = specs.map((spec) => {
  const colon = spec.indexOf(':');
  const frame = Number(colon === -1 ? spec : spec.slice(0, colon));
  if (!Number.isInteger(frame)) fail(`"${spec}" does not start with a frame number`);
  const label = colon === -1 ? '' : spec.slice(colon + 1);
  const time = frame >= 0 ? ` · ${(frame / FPS).toFixed(2)} s` : '';
  return { frame, caption: `f${frame}${time}${label ? ` · ${label}` : ''}` };
});

const dir = tempDir(`clip-storyboard-${composition}`);
const bundleDir = bundle();
const rendered = frames.map(({ frame, caption }) => ({
  caption,
  file: still(bundleDir, composition, frame, path.join(dir, `f${frame}.png`)),
}));
const escape = (text) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const { width } = pngSize(rendered[0].file);
const tile = Math.round(width * scale);
const cols = Math.min(4, rendered.length);
const cells = rendered
  .map(({ file, caption }) => `<figure><img src="${pathToFileURL(file).href}"><figcaption>${escape(caption)}</figcaption></figure>`)
  .join('');
const html = path.join(dir, 'sheet.html');
fs.writeFileSync(
  html,
  `<!doctype html><style>
body{margin:0;padding:16px;background:white;font:15px/1.3 system-ui,sans-serif;color:black}
main{display:grid;grid-template-columns:repeat(${cols},${tile}px);gap:20px 16px}
figure{margin:0}img{display:block;width:${tile}px;outline:1px solid #0002}figcaption{padding-top:6px}
</style><main>${cells}</main>`,
);
const { browser } = await launchBrowser();
const page = await browser.newPage({ viewport: { width: cols * tile + (cols - 1) * 16 + 32, height: 400 } });
await page.goto(pathToFileURL(html).href);
await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
await page.screenshot({ path: path.resolve(out), fullPage: true });
await browser.close();
console.log(`${composition}: ${rendered.length} frames at ${scale}x -> ${path.resolve(out)}`);
console.log(`full-size frames: ${dir}`);
