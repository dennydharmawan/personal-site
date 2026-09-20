#!/bin/bash
# Regenerates the hero photo bands from the highest-resolution source.
# Each band is a crop of team-gaze-hero-final-spec-source.png framed for one
# breakpoint range, encoded as AVIF and WebP plus one JPEG fallback.
set -euo pipefail

root="/Users/denny.dharmawan/portfolios/personal-site/.claude/worktrees/wf_833207a8-e86-1"
previews="$root/public/portfolio-previews"
source_png="$previews/team-gaze-hero-final-spec-source.png"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

band() {
  local name=$1 crop=$2
  shift 2
  magick "$source_png" -crop "$crop" +repage "$work/$name.png"
  for width in "$@"; do
    local scaled="$work/$name-$width.png"
    magick "$work/$name.png" -resize "${width}x" -unsharp 0x0.6+0.5+0.01 "$scaled"
    cwebp -quiet -q 74 -m 6 "$scaled" -o "$previews/hero-team-$name-$width.webp"
    avifenc --speed 3 -q 58 "$scaled" "$previews/hero-team-$name-$width.avif" > /dev/null
  done
}

band mobile 1508x887+19+0 500 700 1000 1200
band tablet 1774x657+0+120 1000 1456 1774
band desktop 1774x433+0+118 1280 1774

magick "$work/desktop-1280.png" -quality 78 "$previews/hero-team-desktop-1280.jpg"

cd "$previews"
ls -l hero-team-*
