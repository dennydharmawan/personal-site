type TileVariant = 'chart' | 'code' | 'matrix' | 'queue' | 'table' | 'workflow';

interface PortfolioTile {
  accent: string;
  accentSoft: string;
  eyebrow: string;
  metric: string;
  title: string;
  variant: TileVariant;
}

const tiles: PortfolioTile[] = [
  {
    accent: '#635bff',
    accentSoft: '#c4b5fd',
    eyebrow: 'Access control',
    metric: '94% SLA',
    title: 'Permission review',
    variant: 'matrix'
  },
  {
    accent: '#00d4ff',
    accentSoft: '#bae6fd',
    eyebrow: 'Product UI',
    metric: '128 open',
    title: 'Review queue',
    variant: 'queue'
  },
  {
    accent: '#00c896',
    accentSoft: '#bbf7d0',
    eyebrow: 'Observability',
    metric: 'Healthy',
    title: 'Service health',
    variant: 'chart'
  },
  {
    accent: '#ff8a00',
    accentSoft: '#fed7aa',
    eyebrow: 'Data model',
    metric: '12 states',
    title: 'Workflow state',
    variant: 'workflow'
  },
  {
    accent: '#f044b5',
    accentSoft: '#fbcfe8',
    eyebrow: 'API services',
    metric: '37% faster',
    title: 'Legacy refactor',
    variant: 'code'
  },
  {
    accent: '#7c3aed',
    accentSoft: '#ddd6fe',
    eyebrow: 'Operations',
    metric: '5 teams',
    title: 'Internal platform',
    variant: 'table'
  },
  {
    accent: '#14b8a6',
    accentSoft: '#99f6e4',
    eyebrow: 'Lending',
    metric: '3 queues',
    title: 'Decision flow',
    variant: 'queue'
  },
  {
    accent: '#3b82f6',
    accentSoft: '#bfdbfe',
    eyebrow: 'Release',
    metric: '0 blockers',
    title: 'Rollout guard',
    variant: 'workflow'
  },
  {
    accent: '#a855f7',
    accentSoft: '#e9d5ff',
    eyebrow: 'Banking',
    metric: 'Traceable',
    title: 'Audit trail',
    variant: 'table'
  },
  {
    accent: '#22c55e',
    accentSoft: '#bbf7d0',
    eyebrow: 'Reliability',
    metric: '99.9%',
    title: 'Monitoring view',
    variant: 'chart'
  },
  {
    accent: '#fb7185',
    accentSoft: '#fecdd3',
    eyebrow: 'Implementation',
    metric: 'RFC',
    title: 'System notes',
    variant: 'code'
  },
  {
    accent: '#06b6d4',
    accentSoft: '#a5f3fc',
    eyebrow: 'Integration',
    metric: 'Live jobs',
    title: 'Webhook health',
    variant: 'matrix'
  }
];

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderVariant({ accent, variant }: Pick<PortfolioTile, 'accent' | 'variant'>) {
  if (variant === 'chart') {
    return `
      <path d="M120 490C200 420 260 450 330 380C408 302 476 342 540 278C620 198 720 236 850 145" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
      <path d="M120 522C210 476 270 492 350 438C430 384 500 396 570 340C650 276 740 296 850 226" fill="none" stroke="#ffffff" stroke-opacity=".32" stroke-width="4" stroke-linecap="round"/>
      <g opacity=".9">
        <rect x="128" y="145" width="150" height="84" rx="18" fill="#fff" fill-opacity=".08"/>
        <rect x="310" y="145" width="150" height="84" rx="18" fill="#fff" fill-opacity=".08"/>
        <rect x="492" y="145" width="150" height="84" rx="18" fill="#fff" fill-opacity=".08"/>
      </g>`;
  }

  if (variant === 'code') {
    return `
      <rect x="110" y="148" width="744" height="376" rx="24" fill="#020617" stroke="#334155" stroke-width="2"/>
      <text x="146" y="210" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26">const review = await api.queue.next()</text>
      <text x="146" y="270" fill="${accent}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26">if (review.risk &gt; threshold) escalate()</text>
      <text x="146" y="330" fill="#e2e8f0" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26">trace.audit({ owner, status, action })</text>
      <text x="146" y="390" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26">return commit.safe()</text>`;
  }

  if (variant === 'matrix') {
    return `
      <rect x="110" y="148" width="744" height="376" rx="24" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".16"/>
      ${[0, 1, 2, 3, 4].map((row) => `<line x1="142" x2="820" y1="${226 + row * 58}" y2="${226 + row * 58}" stroke="#fff" stroke-opacity=".13"/>`).join('')}
      ${[0, 1, 2, 3].map((col) => `<line x1="${332 + col * 118}" x2="${332 + col * 118}" y1="178" y2="484" stroke="#fff" stroke-opacity=".1"/>`).join('')}
      ${[0, 1, 2, 3].map((row) => `<circle cx="${388 + row * 118}" cy="${260 + row * 42}" r="14" fill="${accent}"/>`).join('')}
      ${[0, 1, 2, 3].map((row) => `<circle cx="${506 + row * 76}" cy="${318 + row * 36}" r="14" fill="#fff" fill-opacity=".18"/>`).join('')}`;
  }

  if (variant === 'queue') {
    return `
      <rect x="110" y="148" width="744" height="376" rx="24" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".16"/>
      ${[0, 1, 2].map((row) => `<rect x="146" y="${198 + row * 92}" width="672" height="62" rx="16" fill="#fff" fill-opacity="${row === 0 ? '.16' : '.08'}"/><circle cx="184" cy="${229 + row * 92}" r="12" fill="${row === 0 ? accent : '#94a3b8'}"/><rect x="220" y="${214 + row * 92}" width="${row === 0 ? 280 : 220}" height="14" rx="7" fill="#fff" fill-opacity=".42"/><rect x="670" y="${210 + row * 92}" width="112" height="28" rx="14" fill="${accent}" fill-opacity="${row === 0 ? '.95' : '.24'}"/>`).join('')}`;
  }

  if (variant === 'workflow') {
    return `
      <path d="M178 342H792" stroke="#fff" stroke-opacity=".22" stroke-width="6" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map((step) => `<circle cx="${206 + step * 190}" cy="342" r="42" fill="${step < 2 ? accent : '#fff'}" fill-opacity="${step < 2 ? '.95' : '.12'}"/><text x="${193 + step * 190}" y="354" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700">${step + 1}</text>`).join('')}
      <rect x="170" y="430" width="620" height="60" rx="18" fill="#fff" fill-opacity=".08"/>`;
  }

  return `
    <rect x="110" y="148" width="744" height="376" rx="24" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".16"/>
    ${[0, 1, 2, 3].map((row) => `<rect x="150" y="${190 + row * 70}" width="260" height="20" rx="10" fill="#fff" fill-opacity=".36"/><rect x="520" y="${184 + row * 70}" width="240" height="32" rx="16" fill="${row % 2 === 0 ? accent : '#fff'}" fill-opacity="${row % 2 === 0 ? '.8' : '.14'}"/>`).join('')}`;
}

function createPortfolioTile(tile: PortfolioTile) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="970" height="700" viewBox="0 0 970 700">
      <defs>
        <radialGradient id="glow" cx="70%" cy="15%" r="80%">
          <stop offset="0%" stop-color="${tile.accentSoft}" stop-opacity=".45"/>
          <stop offset="46%" stop-color="${tile.accent}" stop-opacity=".2"/>
          <stop offset="100%" stop-color="#050816" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="970" height="700" rx="40" fill="#050816"/>
      <rect width="970" height="700" rx="40" fill="url(#glow)"/>
      <path d="M0 116H970M0 584H970M120 0V700M850 0V700" stroke="#fff" stroke-opacity=".06"/>
      <rect x="64" y="66" width="842" height="568" rx="34" fill="url(#panel)" stroke="#fff" stroke-opacity=".12"/>
      <circle cx="124" cy="126" r="12" fill="${tile.accent}"/>
      <text x="154" y="136" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${tile.eyebrow.toUpperCase()}</text>
      <text x="112" y="594" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="800">${tile.title}</text>
      <text x="690" y="594" fill="${tile.accentSoft}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${tile.metric}</text>
      ${renderVariant(tile)}
    </svg>
  `);
}

export const portfolioMarqueeImages = tiles.map(createPortfolioTile);
