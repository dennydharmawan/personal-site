import { statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BUDGETS = [
  { file: 'desk-scenery-av1.mp4', max: 6_000_000, video: true },
  { file: 'desk-scenery-h264.mp4', max: 6_000_000, video: true },
  { file: 'desk-scenery-poster.avif', max: 160 * 1024 },
  { file: 'desk-scenery-poster.jpg', max: 280 * 1024 },
];

let failed = false;
for (const { file, max, video } of BUDGETS) {
  const path = fileURLToPath(new URL(`../../public/film/${file}`, import.meta.url));
  const size = statSync(path).size;
  const over = size > max;
  const audio = video && execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', path], { encoding: 'utf8' }).trim() !== '';
  if (over || audio) failed = true;
  console.log(`${over || audio ? 'FAIL' : 'ok  '} ${file} ${size} bytes (max ${max})${audio ? ' has an audio stream' : ''}`);
}
process.exitCode = failed ? 1 : 0;
