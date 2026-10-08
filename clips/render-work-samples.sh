#!/usr/bin/env bash
# Renders the Work Samples clips and their posters straight into the site's public folder.
# Usage: ./render-work-samples.sh [CompositionId]
# With an id, only that clip and its poster render; with none, all three do.
set -euo pipefail
cd "$(dirname "$0")"

out=../public/portfolio-previews
clips=(
  "AuthAccess:work-sample-auth-access:300"
  "LoanCollection:work-sample-loan-collection:300"
  "EcommercePayment:work-sample-ecommerce-payment:170"
)

only=${1:-}
if [[ -n "$only" ]]; then
  known=()
  for entry in "${clips[@]}"; do known+=("${entry%%:*}"); done
  if [[ " ${known[*]} " != *" $only "* ]]; then
    echo "Unknown composition '$only'. Choose one of: ${known[*]}" >&2
    exit 2
  fi
fi

for entry in "${clips[@]}"; do
  IFS=: read -r id name poster <<<"$entry"
  [[ -z "$only" || "$id" == "$only" ]] || continue
  mp4="$out/motion/$name.mp4"
  started=$(mktemp)
  # Remotion can exit non-zero on "Target closed" while tearing the browser down after a
  # finished render, so a fresh, non-empty file counts and the frame count below decides.
  if ! npx remotion render "$id" "$mp4" --log=error; then
    [[ -s "$mp4" && "$mp4" -nt "$started" ]] || { rm -f "$started"; echo "$id: render failed" >&2; exit 1; }
    echo "$id: render exited non-zero after writing $mp4" >&2
  fi
  rm -f "$started"
  frames=$(npx remotion ffprobe -v error -select_streams v:0 -count_packets \
    -show_entries stream=nb_read_packets -of csv=p=0 "$mp4")
  echo "$id: $frames frames in $mp4 (compare with the clip's *_DURATION)"
  # Reduced-motion visitors only ever see the poster, so it sits on a frame that tells
  # the whole story on its own.
  npx remotion still "$id" "$out/$name.png" --frame="$poster" --log=error
done
