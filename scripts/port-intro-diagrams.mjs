// Turns the /diagram-design HTML sources in docs/intro-diagrams into inline-safe SVGs for the
// /intro deck. Colors become Tailwind palette tokens, so the site never ships a hex.
// Run: node scripts/port-intro-diagrams.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sourceDir = join(root, 'docs/intro-diagrams');
const outDir = join(root, 'src/components/intro/diagrams');

const pluginDir = join(homedir(), '.claude/plugins/cache/diagram-design/diagram-design');
const version = readdirSync(pluginDir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).at(-1);
const exportSvg = join(pluginDir, version, 'skills/diagram-design/scripts/export_svg.py');

// Tailwind v4 palette values that the personal-site diagram profile allows.
const palette = {
  '#ffffff': 'white',
  '#fafafa': 'zinc-50',
  '#f4f4f5': 'zinc-100',
  '#e4e4e7': 'zinc-200',
  '#d4d4d8': 'zinc-300',
  '#9f9fa9': 'zinc-400',
  '#71717b': 'zinc-500',
  '#52525c': 'zinc-600',
  '#3f3f46': 'zinc-700',
  '#27272a': 'zinc-800',
  '#18181b': 'zinc-900',
  '#09090b': 'zinc-950',
  '#f0f9ff': 'sky-50',
  '#dff2fe': 'sky-100',
  '#b8e6fe': 'sky-200',
  '#74d4ff': 'sky-300',
  '#00bcff': 'sky-400',
  '#0084d1': 'sky-600',
  '#0069a8': 'sky-700',
  '#00598a': 'sky-800',
  '#ecfdf5': 'emerald-50',
  '#a4f4cf': 'emerald-200',
  '#5ee9b5': 'emerald-300',
  '#007a55': 'emerald-700'
};

const work = mkdtempSync(join(tmpdir(), 'intro-diagrams-'));
const failures = [];

for (const file of readdirSync(sourceDir).filter((name) => name.endsWith('.html'))) {
  const slug = file.replace(/\.html$/, '');
  const exported = join(work, `${slug}.svg`);
  execFileSync('python3', [exportSvg, join(sourceDir, file), exported], { stdio: 'pipe' });

  let svg = readFileSync(exported, 'utf8')
    .replace(/<\?xml[^>]*>\s*/, '')
    .replace(/@import url\([^)]*\);?/g, '')
    .replace(/#fff\b/gi, '#ffffff')
    .replace(/#[0-9a-f]{6}\b/gi, (hex) => {
      const token = palette[hex.toLowerCase()];
      if (!token) failures.push(`${file}: ${hex} is not a palette value`);
      return token === 'white' ? 'var(--color-white)' : `var(--color-${token})`;
    })
    // The figure's own font tokens name the Google Fonts faces; the site loads the variable builds.
    .replace(/--font-sans:[^;]*;\s*/g, '')
    .replace(/--font-display:[^;]*;/g, '--font-display: var(--font-heading);')
    .replace(/(font-family\s*[:=]\s*"?)[^;">]*Instrument Sans[^;">]*/g, '$1var(--font-sans)')
    .replace(/(font-family\s*[:=]\s*"?)[^;">]*Bricolage Grotesque[^;">]*/g, '$1var(--font-heading)');

  for (const banned of svg.match(/rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3}\b/gi) ?? []) {
    failures.push(`${file}: ${banned} is not a palette token`);
  }
  writeFileSync(join(outDir, `${slug}.svg`), `${svg.trim()}\n`);
  console.log(`ported ${slug}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
