#!/usr/bin/env bash
set -euo pipefail

film="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
web="$film/../public/film"
mkdir -p "$web" "$film/out"

# render.mjs and shoot.mjs resolve film.html and frames/ against the working directory.
cd "$film"

node render.mjs 30 out/master.mp4

# SVT-AV1 ignores ffmpeg's -loglevel, so SVT_LOG=1 keeps its banner out of the log.
SVT_LOG=1 ffmpeg -y -loglevel error -i out/master.mp4 \
  -vf scale=720:720:flags=lanczos -c:v libsvtav1 -crf 60 -preset 5 \
  -pix_fmt yuv420p -an -movflags +faststart "$web/stays-up-av1.mp4"

ffmpeg -y -loglevel error -i out/master.mp4 \
  -vf scale=540:540:flags=lanczos -c:v libx264 -crf 28 -preset slow \
  -pix_fmt yuv420p -an -movflags +faststart "$web/stays-up-h264.mp4"

node shoot.mjs --times 13.4 --out out/poster

python3 - "$film/out/poster/t_013.40.png" "$web" <<'PY'
import sys
from PIL import Image

src, web = sys.argv[1], sys.argv[2]
poster = Image.open(src).convert("RGB").resize((720, 720), Image.LANCZOS)
poster.save(f"{web}/stays-up-poster.avif", quality=55)
poster.save(f"{web}/stays-up-poster.jpg", quality=78, optimize=True, progressive=True)
PY
