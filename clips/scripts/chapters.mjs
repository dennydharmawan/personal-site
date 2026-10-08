#!/usr/bin/env node
// Usage: node scripts/chapters.mjs ["Project title"] [--out dir] [--url http://localhost:4321/] [--width 1440]
// Drives the Work samples section on the running site (start it with `pnpm run dev` from the repo root).
// For each project, or only the named one, it checks against src/components/portfolio-home-data.ts:
//   - "How it's built" pauses the clip and "Walkthrough" resumes it;
//   - each chapter `at` sits on a whole or half second;
//   - a chapter click while paused seeks to `at` (within 0.02 s), stays paused, and marks that chapter
//     aria-current, with a screenshot of the landed frame in --out;
//   - a chapter click while playing marks that chapter and keeps playing.
// Exits 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO_DIR, fail, launchBrowser, tempDir } from './lib.mjs';

const TOLERANCE = 0.02;
const options = { out: '', url: 'http://localhost:4321/', width: '1440' };
const positional = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const flag = argv[i].match(/^--(out|url|width)$/);
  if (flag) options[flag[1]] = argv[++i];
  else positional.push(argv[i]);
}

const dataFile = path.join(REPO_DIR, 'src/components/portfolio-home-data.ts');
const { projects } = await import(pathToFileURL(dataFile).href).catch((error) =>
  fail(`Could not import ${dataFile} (${error.code ?? error.message}). Node strips TypeScript unflagged from 22.18 and 23.6.`),
);
const [only] = positional;
const selected = only ? projects.filter((project) => project.title === only) : projects;
if (selected.length === 0) fail(`No project titled "${only}". Titles: ${projects.map((p) => `"${p.title}"`).join(', ')}`);

const outDir = options.out ? path.resolve(options.out) : tempDir('clip-chapters');
fs.mkdirSync(outDir, { recursive: true });
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let failures = 0;
const check = (passed, message) => {
  if (!passed) failures++;
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${message}`);
};

async function poll(read, timeout = 2000) {
  const end = Date.now() + timeout;
  for (;;) {
    const value = await read();
    if (value || Date.now() > end) return value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const { browser, channel } = await launchBrowser();
for (const project of selected) {
  const { title, chapters } = project;
  console.log(`${title} (${options.width}px, ${channel})`);
  const page = await browser.newPage({ viewport: { width: Number(options.width), height: 1000 } });
  await page.goto(options.url, { waitUntil: 'load' });
  const article = page.locator('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  const video = article.locator('video');
  await video.scrollIntoViewIfNeeded();

  const playing = () => video.evaluate((v) => !v.paused && v.currentTime > 0);
  const paused = () => video.evaluate((v) => v.paused);
  if (!(await poll(playing, 15000))) {
    check(false, 'clip autoplays once in view');
    await page.close();
    continue;
  }
  const duration = await video.evaluate((v) => v.duration);
  console.log(`  clip ${await video.evaluate((v) => v.currentSrc)}, ${duration.toFixed(3)} s`);
  // A persistent counter, so a seek cannot finish before a one-shot listener is attached.
  await video.evaluate((v) => {
    v.dataset.seeks = '0';
    v.addEventListener('seeked', () => (v.dataset.seeks = String(Number(v.dataset.seeks) + 1)));
  });
  const seeks = () => video.evaluate((v) => Number(v.dataset.seeks));

  // The tab check runs first: after the Pause button the clip stays paused on purpose.
  await article.getByRole('tab', { name: /How it.s built/ }).click();
  check(await poll(paused), '"How it\'s built" pauses the clip');
  const tab = await article.getByRole('tab', { selected: true }).innerText();
  check(/How it.s built/.test(tab), `"How it's built" is the selected tab (got "${tab}")`);
  // Let the panel cross-fade finish so the screenshot shows the diagram alone.
  await poll(() => article.evaluate((el) => el.getAnimations({ subtree: true }).length === 0));
  await article.screenshot({ path: path.join(outDir, `${slug(title)}-how-its-built.png`) });
  await article.getByRole('tab', { name: 'Walkthrough' }).click();
  check(await poll(playing), '"Walkthrough" resumes the clip');

  const list = article.getByRole('list', { name: `${title} chapters` });
  const current = () => list.locator('button[aria-current="step"]').innerText().catch(() => '');
  const select = async (chapter) => {
    const before = await seeks();
    await list.getByRole('button', { name: chapter.label, exact: true }).click();
    const seeked = await poll(async () => (await seeks()) > before, 5000);
    await poll(async () => (await current()) === chapter.label, 1000);
    return seeked;
  };

  await article.getByRole('button', { name: `Pause ${title} walkthrough` }).click();
  await poll(paused);
  for (const [index, chapter] of chapters.entries()) {
    const at = chapter.at.toFixed(1).padStart(4);
    check(Number.isInteger(chapter.at * 2) && chapter.at < duration, `${at} s  "${chapter.label}" sits on a whole or half second inside the clip`);
    const seeked = await select(chapter);
    const time = await video.evaluate((v) => v.currentTime);
    const active = await current();
    check(
      seeked && Math.abs(time - chapter.at) <= TOLERANCE && (await paused()) && active === chapter.label,
      `${at} s  paused click lands at ${time.toFixed(3)} s, ${seeked ? 'seeked' : 'no seeked event'}, aria-current "${active}"`,
    );
    await video.screenshot({ path: path.join(outDir, `${slug(title)}-${index + 1}-${slug(chapter.label)}.png`) });
  }

  await article.getByRole('button', { name: `Play ${title} walkthrough` }).click();
  await poll(playing);
  for (const chapter of [...chapters].reverse()) {
    const at = chapter.at.toFixed(1).padStart(4);
    const seeked = await select(chapter);
    const time = await video.evaluate((v) => v.currentTime);
    const active = await current();
    check(
      seeked && time >= chapter.at - TOLERANCE && time < chapter.at + 1 && !(await paused()) && active === chapter.label,
      `${at} s  playing click lands at ${time.toFixed(3)} s and keeps playing, aria-current "${active}"`,
    );
  }
  await page.close();
}
await browser.close();

console.log(`screenshots: ${outDir}`);
if (failures > 0) {
  console.log(`FAIL: ${failures} check(s) failed`);
  process.exit(1);
}
console.log('PASS: every chapter seek and tab switch behaved');
