#!/usr/bin/env bash
set -euo pipefail

film="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
web="$film/../public/film"
mkdir -p "$web" "$film/out"

# render.mjs resolves film.html against the working directory.
cd "$film"

node render.mjs 30 out/master.mkv

# The master is RGB. Convert and tag explicitly so browsers do not guess the matrix and shift the hues.
# Full-range BT.601 matches what the JPEG-based pipeline shipped before.
yuv=(-vf scale=out_range=pc:out_color_matrix=bt601,format=yuv420p -color_range pc -colorspace bt470bg)

# SVT-AV1's temporal filter blends neighbouring frames, and at this crf it leaves a ghost of the
# cat's old pose when it jumps up at the bolt and when it lies back down, so it is off. That costs
# about 5% in size and changes nothing visible in frames that hold still. The key frames sit on the
# bolt (T.bolt in film.js) and on the first dark frame after its flash, where the jump happens.
# SVT-AV1 ignores ffmpeg's -loglevel, so SVT_LOG=1 keeps its banner out of the log.
SVT_LOG=1 ffmpeg -y -loglevel error -i out/master.mkv "${yuv[@]}" \
  -c:v libsvtav1 -crf 54 -preset 5 -svtav1-params enable-tf=0 -force_key_frames 19.0,19.1 \
  -an -movflags +faststart out/desk-scenery-av1.mp4

ffmpeg -y -loglevel error -i out/master.mkv "${yuv[@]}" \
  -c:v libx264 -crf 31 -preset slow -an -movflags +faststart out/desk-scenery-h264.mp4

# The poster is the master's frame 0, already blurred and downsampled, so the swap from poster to
# playing video does not jump.
ffmpeg -y -loglevel error -i out/master.mkv -frames:v 1 out/poster.png

python3 - "$film/out/poster.png" "$film/out" <<'PY'
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
poster = Image.open(src).convert("RGB")
poster.save(f"{out}/desk-scenery-poster.avif", quality=55)
poster.save(f"{out}/desk-scenery-poster.jpg", quality=74, optimize=True, progressive=True)
PY

# Each file lands in public/film only once it is complete, so a failed run leaves the old set in place.
mv out/desk-scenery-av1.mp4 out/desk-scenery-h264.mp4 out/desk-scenery-poster.avif out/desk-scenery-poster.jpg "$web/"
