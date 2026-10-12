#!/usr/bin/env bash
# Builds the delivery files for every work-sample screen from its source WebP:
# an AVIF twin, plus 1024px-wide WebP and AVIF copies of each full screen for 1x displays.
# 4:4:4 keeps coloured UI text from smearing.
set -euo pipefail
cd "$(dirname "$0")/../public/portfolio-previews"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for webp in work-sample-*.webp; do
  case "$webp" in *-1024.webp) continue ;; esac
  base="${webp%.webp}"
  magick "$webp" "png:$tmp/screen.png"
  avifenc -q 60 -s 2 -y 444 "$tmp/screen.png" "$base.avif" >/dev/null
  case "$base" in *-phone) continue ;; esac
  magick "$tmp/screen.png" -resize 1024x "png:$tmp/small.png"
  cwebp -quiet -q 82 -m 6 "$tmp/small.png" -o "$base-1024.webp"
  avifenc -q 60 -s 2 -y 444 "$tmp/small.png" "$base-1024.avif" >/dev/null
done
