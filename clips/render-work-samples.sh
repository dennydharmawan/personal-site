#!/usr/bin/env bash
# Renders the four Work Samples clips and their posters straight into the site's public folder.
set -euo pipefail
cd "$(dirname "$0")"

out=../public/portfolio-previews
clips=(
  "PrReviewer:work-sample-pr-reviewer:318"
  "AuthAccess:work-sample-auth-access:470"
  "LoanCollection:work-sample-loan-collection:490"
  "EcommercePayment:work-sample-ecommerce-payment:490"
)

for entry in "${clips[@]}"; do
  IFS=: read -r id name poster <<<"$entry"
  npx remotion render "$id" "$out/motion/$name.mp4" --log=error
  # Reduced-motion visitors only ever see the poster, so it sits on a frame where the
  # system is mid-flow and that beat's caption is at full opacity.
  npx remotion still "$id" "$out/$name.png" --frame="$poster" --log=error
done
