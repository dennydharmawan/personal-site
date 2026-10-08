// Shared helpers for the clip checks. Node built-ins only: nothing here may need an npm install.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CLIPS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_DIR = path.resolve(CLIPS_DIR, '..');

export function fail(message) {
  console.error(message);
  process.exit(1);
}

export const tempDir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));

function run(cmd, args, { capture = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: CLIPS_DIR,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return result;
}

/** Bundles the Remotion project once so each still skips its own bundle step. */
export function bundle() {
  const dir = tempDir('clip-bundle');
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  const result = run('npx', ['remotion', 'bundle', 'src/index.ts', '--out-dir', dir, '--log=error']);
  if (result.status !== 0 || !fs.existsSync(path.join(dir, 'index.html'))) fail('remotion bundle failed');
  return dir;
}

/** Renders one frame to a PNG. A negative frame counts from the end, so -1 is the last frame. */
export function still(bundleDir, composition, frame, out) {
  const result = run('npx', ['remotion', 'still', bundleDir, composition, out, `--frame=${frame}`, '--log=error']);
  // Remotion can exit non-zero on "Target closed" while tearing the browser down after a good render.
  // `out` sits in a fresh temp dir, so a non-empty file there is this run's frame.
  const written = fs.existsSync(out) && fs.statSync(out).size > 0;
  if (!written) fail(`remotion still ${composition} --frame=${frame} wrote nothing (exit ${result.status})`);
  return out;
}

const hasSystemFfmpeg = () => {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return !probe.error && probe.status === 0;
};

/** Decodes an image to packed RGB bytes, using Remotion's bundled ffmpeg when none is on PATH. */
export function readRgb(file, width, height) {
  const args = ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'];
  const result = hasSystemFfmpeg() ? run('ffmpeg', args, { capture: true }) : run('npx', ['remotion', 'ffmpeg', ...args], { capture: true });
  if (result.status !== 0) fail(`ffmpeg could not decode ${file}: ${result.stderr}`);
  if (result.stdout.length !== width * height * 3) {
    fail(`${file} decoded to ${result.stdout.length} bytes; expected ${width}x${height} RGB`);
  }
  return result.stdout;
}

/** Reads width and height from a PNG's IHDR chunk. */
export function pngSize(file) {
  const header = Buffer.alloc(24);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, header, 0, 24, 0);
  fs.closeSync(fd);
  if (header.toString('ascii', 12, 16) !== 'IHDR') fail(`${file} is not a PNG`);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

/**
 * Playwright is not a dependency of this package, so it resolves the way the
 * video-motion-graphics skill does: clips/node_modules first, then the npx cache.
 */
export function loadChromium() {
  const req = createRequire(import.meta.url);
  const bases = [process.env.NODE_PATH, path.join(CLIPS_DIR, 'node_modules'), path.join(REPO_DIR, 'node_modules')].filter(Boolean);
  const npx = path.join(os.homedir(), '.npm/_npx');
  if (fs.existsSync(npx)) for (const dir of fs.readdirSync(npx)) bases.push(path.join(npx, dir, 'node_modules'));
  for (const base of bases) {
    for (const name of ['playwright-core', 'playwright']) {
      try {
        return req(path.join(base, name)).chromium;
      } catch {}
    }
  }
  fail('playwright-core not found in clips/node_modules or ~/.npm/_npx. Run `npx playwright-core --version` once to cache it.');
}

/** Google Chrome plays the H.264 clips; Playwright's bundled Chromium cannot. */
export async function launchBrowser() {
  const chromium = loadChromium();
  try {
    return { browser: await chromium.launch({ channel: 'chrome' }), channel: 'chrome' };
  } catch {
    console.warn('Google Chrome not found; using bundled Chromium, which cannot play H.264 video.');
    return { browser: await chromium.launch(), channel: 'chromium' };
  }
}
