#!/usr/bin/env bash
# Renders the four Work Samples clips and their posters straight into the site's public folder.
set -euo pipefail
cd "$(dirname "$0")"

out=../public/portfolio-previews
clips=(
  "PrReviewer:work-sample-pr-reviewer:400"
  "AuthAccess:work-sample-auth-access:490"
  "LoanCollection:work-sample-loan-collection:470"
  "EcommercePayment:work-sample-ecommerce-payment:490"
)

for entry in "${clips[@]}"; do
  IFS=: read -r id name poster <<<"$entry"
  npx remotion render "$id" "$out/motion/$name.mp4" --log=error
  # The poster frame sits in the last beat with everything settled, before the reset.
  npx remotion still "$id" "$out/$name.png" --frame="$poster" --log=error
done
