#!/usr/bin/env node
// Usage: node scripts/seam.mjs <Composition>
// Renders frame 0 and the last frame and fails if any pixel differs by more than 8 in any channel,
// so the loop has no visible jump where the video wraps.
import path from 'node:path';
import { bundle, fail, pngSize, readRgb, still, tempDir } from './lib.mjs';

const TOLERANCE = 8;
const [composition] = process.argv.slice(2);
if (!composition) fail('Usage: node scripts/seam.mjs <Composition>');

const dir = tempDir(`clip-seam-${composition}`);
const bundleDir = bundle();
const first = still(bundleDir, composition, 0, path.join(dir, 'first.png'));
const last = still(bundleDir, composition, -1, path.join(dir, 'last.png'));

const { width, height } = pngSize(first);
const b = pngSize(last);
if (b.width !== width || b.height !== height) fail(`size mismatch: ${width}x${height} vs ${b.width}x${b.height}`);

const a = readRgb(first, width, height);
const z = readRgb(last, width, height);
let maxDelta = 0;
let over = 0;
const box = { left: width, top: height, right: -1, bottom: -1 };
for (let i = 0; i < width * height; i++) {
  const delta = Math.max(
    Math.abs(a[i * 3] - z[i * 3]),
    Math.abs(a[i * 3 + 1] - z[i * 3 + 1]),
    Math.abs(a[i * 3 + 2] - z[i * 3 + 2]),
  );
  if (delta > maxDelta) maxDelta = delta;
  if (delta <= TOLERANCE) continue;
  over++;
  const x = i % width;
  const y = Math.floor(i / width);
  box.left = Math.min(box.left, x);
  box.top = Math.min(box.top, y);
  box.right = Math.max(box.right, x);
  box.bottom = Math.max(box.bottom, y);
}

console.log(`${composition}: frame 0 vs last frame, ${width}x${height}`);
console.log(`max channel delta ${maxDelta}, pixels over ${TOLERANCE}: ${over}`);
console.log(`frames: ${first}  ${last}`);
if (over > 0) {
  console.log(`differing region: x ${box.left}-${box.right}, y ${box.top}-${box.bottom}`);
  console.log('FAIL: the loop seam jumps');
  process.exit(1);
}
console.log('PASS: the last frame matches frame 0');
