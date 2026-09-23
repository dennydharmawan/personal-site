import { readFileSync, writeFileSync } from 'node:fs';

const theme = new URL('../../node_modules/tailwindcss/theme.css', import.meta.url);
const out = new URL('../palette.js', import.meta.url);

const colors = {};
for (const [, name, value] of readFileSync(theme, 'utf8').matchAll(/^\s*--color-([a-z0-9-]+):\s*([^;]+);/gm)) {
  colors[name] = value.trim();
}
if (!Object.keys(colors).length) throw new Error(`no --color-* entries in ${theme.pathname}`);

writeFileSync(out, `// Generated from tailwindcss/theme.css (stock Tailwind v4 palette). Do not edit.
window.TW = ${JSON.stringify(colors, null, 1)};
`);
console.log(`wrote ${Object.keys(colors).length} colors to palette.js`);
