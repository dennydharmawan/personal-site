#!/usr/bin/env bash
# Renders the four Work Samples clips and their posters straight into the site's public folder.
set -euo pipefail
cd "$(dirname "$0")"

out=../public/portfolio-previews
clips=(
  "PrReviewer:work-sample-pr-reviewer"
  "AuthAccess:work-sample-auth-access"
  "LoanCollection:work-sample-loan-collection"
  "EcommercePayment:work-sample-ecommerce-payment"
)

for entry in "${clips[@]}"; do
  id="${entry%%:*}"
  name="${entry##*:}"
  npx remotion render "$id" "$out/motion/$name.mp4" --log=error
  # Frame 400 sits in act three with every row settled, before the card fades out.
  npx remotion still "$id" "$out/$name.png" --frame=400 --log=error
done
