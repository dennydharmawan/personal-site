# Desk scenery

A 50 second silent riso print film of one day over Merdeka Square, drawn in code. It loops: the last frame is the first. Every frame is a pure function of `t`, so the film rebuilds from this folder.

This folder is its own npm package. The site build does not read it.

## Setup

```sh
cd film
npm ci
npx playwright-core install chromium
```

## Commands

Run these from `film/`.

| Command | What it does |
| --- | --- |
| `npm run check` | Renders t=2.4, 19.03, 34.9, 44.2, and 47.3 in two fresh pages and compares SHA-256 hashes. Also fails if t=0 and t=`DUR` differ, which would break the loop, or if `film.js` or `engine.js` calls `Math.random` or `Date.now`. |
| `npm run palette` | Rebuilds `palette.js` from the root's `node_modules/tailwindcss/theme.css`. Run `pnpm install` at the root first. |
| `npm run shoot -- --out out` | Writes a PNG for each beat in `SHOTS`, plus `out/meta.json`. Pass `--times 13.4,25.03` for other frames. |
| `npm run render -- 30 out/master.mp4` | Renders frames 0 to `DUR` minus one frame at 30 fps into `frames/` and encodes a 1080 H.264 master with ffmpeg. The last frame is left out because it repeats the first. |
| `npm run paper` | Writes the print paper alone to `public/film/desk-paper.webp`. The site footer uses it as its background, so the footer and the film share one sheet. |
| `python3 sheet.py out out/sheet.jpg 4 360` | Builds a contact sheet from a `shoot` run. |

To scrub the film by hand, open `film.html` in a browser. `film.html?t=13.4` opens on a given second.

## Web media

`npm run media` renders the master, then writes the site's four files to `public/film/`. It encodes an AV1 video and an H.264 fallback, both 720px and silent. It also shoots frame 0 as a 720px AVIF and JPEG poster.

The run then checks the files against their budgets and fails when one is over.

| File | Budget |
| --- | --- |
| `desk-scenery-av1.mp4` | 5,000,000 bytes, no audio stream |
| `desk-scenery-h264.mp4` | 5,000,000 bytes, no audio stream |
| `desk-scenery-poster.avif` | 160 KB |
| `desk-scenery-poster.jpg` | 280 KB |

Each run adds about 8.5 MB to git history, so commit the media once per approved art state.

## Toolchain

The committed output was made with these versions. A newer Chromium or encoder can change output bytes.

- Node 22
- playwright-core 1.63 (Chromium)
- ffmpeg 9.0.1 with SVT-AV1 4.2.0 and libx264
- Pillow 12.3

## Credit

The print engine in `engine.js` is adapted from [sevenevesai/riso-windowseat](https://github.com/sevenevesai/riso-windowseat), under the MIT license in `LICENSE-riso-windowseat`.
