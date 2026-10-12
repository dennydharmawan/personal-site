#!/usr/bin/env bash
# Builds the resume from resume.tex: the PDF the site serves, plus resume.txt,
# a plain-text copy that job-search tools read. Both stay in sync with the .tex.
set -euo pipefail
cd "$(dirname "$0")/.."
tectonic -X compile resume.tex
cp resume.pdf public/resume.pdf
pdftotext -layout public/resume.pdf resume.txt
pdfinfo public/resume.pdf | grep Pages
