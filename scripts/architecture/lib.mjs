// Helpers for the diagram generator. Node built-ins only: nothing here may need an npm install.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIAGRAM_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_DIR = path.resolve(DIAGRAM_DIR, '../..');

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export const tempDir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));

// Playwright is not a declared dependency, so look in node_modules and then the npx cache.
function loadChromium() {
  const req = createRequire(import.meta.url);
  const bases = [process.env.NODE_PATH, path.join(REPO_DIR, 'node_modules')].filter(Boolean);
  const npx = path.join(os.homedir(), '.npm/_npx');
  if (fs.existsSync(npx)) for (const dir of fs.readdirSync(npx)) bases.push(path.join(npx, dir, 'node_modules'));
  for (const base of bases) {
    for (const name of ['playwright-core', 'playwright']) {
      try {
        return req(path.join(base, name)).chromium;
      } catch {}
    }
  }
  fail('playwright-core not found in node_modules or ~/.npm/_npx. Run `npx playwright-core --version` once to cache it.');
}

export async function launchBrowser() {
  const chromium = loadChromium();
  try {
    return { browser: await chromium.launch({ channel: 'chrome' }), channel: 'chrome' };
  } catch {
    return { browser: await chromium.launch(), channel: 'chromium' };
  }
}
