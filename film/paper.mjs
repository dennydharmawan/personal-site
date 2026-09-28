// node paper.mjs   Writes the print paper (the stock the film is printed on) for the site footer.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
mkdirSync('out', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('film.html')).href);
await page.waitForFunction(() => window.__riso && window.__riso.ready, null, { timeout: 60000 });
const url = await page.evaluate(() => bakePaper().toDataURL('image/png'));
writeFileSync('out/paper.png', Buffer.from(url.split(',')[1], 'base64'));
await browser.close();
