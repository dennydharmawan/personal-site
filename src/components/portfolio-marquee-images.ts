type TileVariant =
  | 'architecture'
  | 'capacity'
  | 'dataflow'
  | 'incident'
  | 'latency'
  | 'messaging'
  | 'observability'
  | 'review'
  | 'risk'
  | 'service'
  | 'tenancy'
  | 'ui';

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
    eyebrow: 'System design',
    metric: 'API graph',
    title: 'Service map',
    variant: 'architecture'
  },
  {
    accent: '#00d4ff',
    accentSoft: '#bae6fd',
    eyebrow: 'Product UI',
    metric: 'Queue',
    title: 'Review queue',
    variant: 'ui'
  },
  {
    accent: '#00c896',
    accentSoft: '#bbf7d0',
    eyebrow: 'Reliability',
    metric: 'SLO',
    title: 'SLO health',
    variant: 'observability'
  },
  {
    accent: '#ff8a00',
    accentSoft: '#fed7aa',
    eyebrow: 'Capacity planning',
    metric: 'Peak load',
    title: 'Traffic forecast',
    variant: 'capacity'
  },
  {
    accent: '#f044b5',
    accentSoft: '#fbcfe8',
    eyebrow: 'Performance',
    metric: 'P95',
    title: 'Latency budget',
    variant: 'latency'
  },
  {
    accent: '#7c3aed',
    accentSoft: '#ddd6fe',
    eyebrow: 'Governance',
    metric: 'RFC',
    title: 'Decision log',
    variant: 'review'
  },
  {
    accent: '#14b8a6',
    accentSoft: '#99f6e4',
    eyebrow: 'Operations data',
    metric: 'Pipeline',
    title: 'Data pipeline',
    variant: 'dataflow'
  },
  {
    accent: '#3b82f6',
    accentSoft: '#bfdbfe',
    eyebrow: 'Access model',
    metric: 'RBAC',
    title: 'Tenant isolation',
    variant: 'tenancy'
  },
  {
    accent: '#a855f7',
    accentSoft: '#e9d5ff',
    eyebrow: 'Platform',
    metric: 'Workers',
    title: 'Backend topology',
    variant: 'service'
  },
  {
    accent: '#22c55e',
    accentSoft: '#bbf7d0',
    eyebrow: 'Security',
    metric: 'Audit',
    title: 'Risk review',
    variant: 'risk'
  },
  {
    accent: '#fb7185',
    accentSoft: '#fecdd3',
    eyebrow: 'Root cause',
    metric: 'Trace',
    title: 'Incident timeline',
    variant: 'incident'
  },
  {
    accent: '#06b6d4',
    accentSoft: '#a5f3fc',
    eyebrow: 'Integration',
    metric: 'Jobs',
    title: 'Message routing',
    variant: 'messaging'
  }
];

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderPill(x: number, y: number, label: string, accent: string, active = false) {
  return `
    <rect x="${x}" y="${y}" width="150" height="38" rx="19" fill="${active ? accent : '#ffffff'}" fill-opacity="${active ? '.92' : '.1'}"/>
    <text x="${x + 20}" y="${y + 25}" fill="${active ? '#ffffff' : '#cbd5e1'}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700">${label}</text>
  `;
}

function renderVariant({ accent, variant }: Pick<PortfolioTile, 'accent' | 'variant'>) {
  if (variant === 'architecture') {
    const nodes = [
      [250, 250, 'Web'],
      [485, 205, 'API'],
      [705, 250, 'Auth'],
      [360, 410, 'Jobs'],
      [610, 410, 'Data']
    ] as const;

    return `
      <g stroke="#fff" stroke-opacity=".16" stroke-width="4">
        <path d="M250 250L485 205L705 250M485 205L360 410M485 205L610 410M360 410H610" fill="none"/>
      </g>
      ${nodes
        .map(
          ([cx, cy, label], index) => `
            <circle cx="${cx}" cy="${cy}" r="58" fill="${index === 1 ? accent : '#ffffff'}" fill-opacity="${index === 1 ? '.95' : '.1'}"/>
            <text x="${cx}" y="${cy + 7}" text-anchor="middle" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${label}</text>
          `
        )
        .join('')}
    `;
  }

  if (variant === 'capacity') {
    return `
      <defs>
        <linearGradient id="capacityArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity=".28"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="118" y="150" width="734" height="342" rx="30" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      <rect x="150" y="248" width="648" height="188" rx="24" fill="#020617" fill-opacity=".18" stroke="#ffffff" stroke-opacity=".08"/>
      <g stroke="#ffffff" stroke-opacity=".08" stroke-width="2">
        <path d="M188 394H760"/>
        <path d="M188 346H760"/>
        <path d="M188 298H760"/>
        <path d="M300 270V420"/>
        <path d="M438 270V420"/>
        <path d="M576 270V420"/>
        <path d="M714 270V420"/>
      </g>
      <path d="M190 406C246 374 294 382 350 344C412 302 468 320 530 282C594 242 658 252 758 210L758 436H190Z" fill="url(#capacityArea)"/>
      <path d="M190 406C246 374 294 382 350 344C412 302 468 320 530 282C594 242 658 252 758 210" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
      <path d="M190 432C258 398 318 406 386 372C456 338 520 340 590 304C658 270 704 282 758 250" fill="none" stroke="#ffffff" stroke-opacity=".26" stroke-width="4" stroke-linecap="round"/>
      <circle cx="530" cy="282" r="10" fill="#fff"/>
      <circle cx="530" cy="282" r="6" fill="${accent}"/>
      <circle cx="758" cy="210" r="10" fill="#fff"/>
      <circle cx="758" cy="210" r="6" fill="${accent}"/>
      ${renderPill(158, 182, 'Traffic', accent, true)}
      ${renderPill(334, 182, 'Capacity', accent)}
      ${renderPill(510, 182, 'Forecast', accent)}
      <rect x="158" y="448" width="174" height="30" rx="15" fill="#ffffff" fill-opacity=".1"/>
      <text x="178" y="469" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">Peak window</text>
      <rect x="668" y="448" width="112" height="30" rx="15" fill="${accent}" fill-opacity=".18"/>
      <text x="690" y="469" fill="#fed7aa" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800">Forecast</text>
    `;
  }

  if (variant === 'dataflow') {
    return `
      <rect x="124" y="158" width="722" height="318" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2, 3].map((step) => `<circle cx="${200 + step * 185}" cy="316" r="42" fill="${step < 3 ? accent : '#ffffff'}" fill-opacity="${step < 3 ? '.88' : '.14'}"/><text x="${200 + step * 185}" y="323" text-anchor="middle" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">${step + 1}</text>`).join('')}
      <path d="M244 316H343M429 316H528M614 316H713" stroke="#ffffff" stroke-opacity=".2" stroke-width="6" stroke-linecap="round"/>
      <rect x="178" y="398" width="610" height="38" rx="19" fill="#ffffff" fill-opacity=".1"/>
    `;
  }

  if (variant === 'tenancy') {
    return `
      <rect x="132" y="150" width="706" height="334" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2].map((row) => `<rect x="176" y="${204 + row * 72}" width="618" height="48" rx="16" fill="#ffffff" fill-opacity="${row === 1 ? '.16' : '.09'}"/><circle cx="210" cy="${228 + row * 72}" r="11" fill="${row === 1 ? accent : '#94a3b8'}"/><rect x="244" y="${220 + row * 72}" width="${row === 1 ? 176 : 132}" height="16" rx="8" fill="#ffffff" fill-opacity=".42"/><rect x="594" y="${214 + row * 72}" width="152" height="28" rx="14" fill="${row === 1 ? accent : '#ffffff'}" fill-opacity="${row === 1 ? '.9' : '.12'}"/>`).join('')}
      <path d="M176 394H794" stroke="#ffffff" stroke-opacity=".16" stroke-width="4" stroke-linecap="round"/>
      ${renderPill(176, 424, 'Scoped data', accent, true)}
      ${renderPill(352, 424, 'RBAC', accent)}
      ${renderPill(528, 424, 'Audit', accent)}
    `;
  }

  if (variant === 'latency') {
    return `
      <rect x="120" y="154" width="730" height="334" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((bar) => `<rect x="${176 + bar * 84}" y="${394 - bar * 26}" width="46" height="${52 + bar * 26}" rx="14" fill="${bar > 4 ? accent : '#ffffff'}" fill-opacity="${bar > 4 ? '.92' : '.18'}"/>`).join('')}
      <path d="M164 416H806" stroke="#ffffff" stroke-opacity=".16" stroke-width="3"/>
      ${renderPill(162, 188, 'P50', accent)}
      ${renderPill(338, 188, 'P95', accent, true)}
      ${renderPill(514, 188, 'P99', accent)}
    `;
  }

  if (variant === 'observability') {
    return `
      <rect x="120" y="154" width="730" height="334" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      <path d="M166 352H266L304 282L360 424L426 216L478 352H804" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      ${renderPill(166, 188, 'SLO', accent, true)}
      ${renderPill(342, 188, 'Errors', accent)}
      ${renderPill(518, 188, 'Latency', accent)}
      <rect x="166" y="442" width="470" height="28" rx="14" fill="#ffffff" fill-opacity=".1"/>
    `;
  }

  if (variant === 'review') {
    return `
      <rect x="118" y="150" width="734" height="342" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2].map((row) => `<rect x="164" y="${196 + row * 84}" width="642" height="52" rx="16" fill="#ffffff" fill-opacity="${row === 0 ? '.16' : '.09'}"/><circle cx="194" cy="${222 + row * 84}" r="10" fill="${row === 0 ? accent : '#94a3b8'}"/><rect x="226" y="${214 + row * 84}" width="${row === 0 ? 300 : 230}" height="14" rx="7" fill="#ffffff" fill-opacity=".4"/><rect x="664" y="${207 + row * 84}" width="102" height="30" rx="15" fill="${row === 0 ? accent : '#ffffff'}" fill-opacity="${row === 0 ? '.9' : '.13'}"/>`).join('')}
      <rect x="164" y="438" width="420" height="28" rx="14" fill="#ffffff" fill-opacity=".1"/>
    `;
  }

  if (variant === 'risk') {
    return `
      <rect x="118" y="150" width="734" height="342" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2, 3].map((row) => `<line x1="168" x2="802" y1="${226 + row * 58}" y2="${226 + row * 58}" stroke="#fff" stroke-opacity=".13"/>`).join('')}
      ${[0, 1, 2, 3].map((col) => `<line x1="${332 + col * 116}" x2="${332 + col * 116}" y1="184" y2="422" stroke="#fff" stroke-opacity=".1"/>`).join('')}
      ${[0, 1, 2, 3].map((row) => `<circle cx="${390 + row * 116}" cy="${254 + row * 26}" r="13" fill="${accent}"/>`).join('')}
      ${renderPill(168, 438, 'Audit trail', accent, true)}
    `;
  }

  if (variant === 'incident') {
    return `
      <rect x="120" y="154" width="730" height="334" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      <path d="M186 242H774" stroke="#ffffff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map((step) => `<circle cx="${214 + step * 178}" cy="242" r="${step === 2 ? 24 : 18}" fill="${step === 2 ? accent : '#ffffff'}" fill-opacity="${step === 2 ? '.92' : '.16'}"/><rect x="${176 + step * 178}" y="${286 + (step % 2) * 48}" width="118" height="32" rx="16" fill="#ffffff" fill-opacity="${step === 2 ? '.16' : '.1'}"/>`).join('')}
      <path d="M188 404C238 370 286 388 338 350C386 315 430 314 482 342C536 372 582 350 630 306C680 260 724 276 776 236" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="164" y="190" width="116" height="32" rx="16" fill="${accent}" fill-opacity=".88"/>
      <text x="190" y="212" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800">Deploy</text>
      <rect x="612" y="418" width="164" height="32" rx="16" fill="#ffffff" fill-opacity=".12"/>
      <text x="638" y="440" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800">Resolution</text>
    `;
  }

  if (variant === 'messaging') {
    return `
      <rect x="120" y="154" width="730" height="334" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      <rect x="174" y="244" width="148" height="84" rx="22" fill="#ffffff" fill-opacity=".1"/>
      <rect x="648" y="202" width="148" height="84" rx="22" fill="#ffffff" fill-opacity=".1"/>
      <rect x="648" y="360" width="148" height="84" rx="22" fill="#ffffff" fill-opacity=".1"/>
      <circle cx="486" cy="318" r="66" fill="${accent}" fill-opacity=".9"/>
      <text x="486" y="326" text-anchor="middle" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">Broker</text>
      <path d="M322 286C380 286 398 318 420 318M552 318C590 318 606 244 648 244M552 318C590 318 606 402 648 402" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="6" stroke-linecap="round"/>
      ${renderPill(174, 378, 'Events', accent, true)}
      ${renderPill(350, 418, 'Retry', accent)}
      ${renderPill(526, 458, 'DLQ', accent)}
    `;
  }

  if (variant === 'service') {
    return `
      <rect x="124" y="156" width="722" height="330" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
      ${[0, 1, 2].map((col) => `<rect x="${174 + col * 205}" y="214" width="150" height="94" rx="22" fill="${col === 1 ? accent : '#ffffff'}" fill-opacity="${col === 1 ? '.9' : '.1'}"/><rect x="${196 + col * 205}" y="334" width="106" height="22" rx="11" fill="#ffffff" fill-opacity=".18"/>`).join('')}
      <path d="M324 260H379M529 260H584M249 308V390H720" fill="none" stroke="#ffffff" stroke-opacity=".17" stroke-width="5" stroke-linecap="round"/>
      <circle cx="720" cy="390" r="20" fill="${accent}"/>
    `;
  }

  return `
    <rect x="118" y="148" width="734" height="342" rx="28" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".14"/>
    <rect x="156" y="186" width="170" height="264" rx="24" fill="#020617"/>
    ${['Dashboard', 'Requests', 'Reports', 'Settings'].map((label, i) => `<rect x="182" y="${224 + i * 48}" width="${i === 0 ? 116 : 92}" height="22" rx="11" fill="${i === 0 ? accent : '#ffffff'}" fill-opacity="${i === 0 ? '.95' : '.18'}"/>`).join('')}
    <rect x="356" y="186" width="456" height="264" rx="24" fill="#ffffff" fill-opacity=".08"/>
    ${[0, 1, 2].map((card) => `<rect x="${386 + card * 134}" y="224" width="108" height="72" rx="16" fill="#ffffff" fill-opacity=".12"/><rect x="${402 + card * 134}" y="248" width="58" height="12" rx="6" fill="${card === 1 ? accent : '#ffffff'}" fill-opacity="${card === 1 ? '.9' : '.3'}"/>`).join('')}
    <rect x="386" y="334" width="376" height="24" rx="12" fill="#ffffff" fill-opacity=".12"/>
    <rect x="386" y="382" width="286" height="24" rx="12" fill="#ffffff" fill-opacity=".12"/>
  `;
}

function createPortfolioTile(tile: PortfolioTile) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="970" height="700" viewBox="0 0 970 700">
      <defs>
        <radialGradient id="glow" cx="72%" cy="18%" r="82%">
          <stop offset="0%" stop-color="${tile.accentSoft}" stop-opacity=".44"/>
          <stop offset="44%" stop-color="${tile.accent}" stop-opacity=".2"/>
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
      <text x="112" y="594" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="50" font-weight="800">${tile.title}</text>
      <text x="858" y="594" text-anchor="end" fill="${tile.accentSoft}" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${tile.metric}</text>
      ${renderVariant(tile)}
    </svg>
  `);
}

export const portfolioMarqueeImages = tiles.map(createPortfolioTile);
