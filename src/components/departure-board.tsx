import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';

// Drum order: the punctuation the board shows sits right after blank, so no tile rolls
// through forty flaps to reach '.' or '→'.
const DRUM = ' .→ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,:-+%/@';

const KEY_LABEL = 'EMAIL ME →';
// The key lands after the headline has settled, and flaps slower, so it reads as the payoff.
const KEY_START_MS = 2100;

type Layout = 'wide' | 'narrow';

// accentFrom is the column where the sky words start on that line.
const layouts: Record<Layout, { columns: number; lines: { text: string; accentFrom: number }[] }> = {
  wide: {
    columns: 22,
    lines: [
      { text: 'TURN YOUR GROWTH IDEAS', accentFrom: Infinity },
      { text: 'INTO REALITY TODAY.', accentFrom: 5 }
    ]
  },
  narrow: {
    columns: 12,
    lines: [
      { text: 'TURN YOUR', accentFrom: Infinity },
      { text: 'GROWTH IDEAS', accentFrom: Infinity },
      { text: 'INTO REALITY', accentFrom: 5 },
      { text: 'TODAY.', accentFrom: 0 }
    ]
  }
};

type Tile = {
  top: HTMLElement;
  bottom: HTMLElement;
  leaf: HTMLElement;
  leafFront: HTMLElement;
  leafBack: HTMLElement;
  shades: HTMLElement[];
  current: string;
  target: string;
  busy: boolean;
  slow: boolean;
  timer?: number;
};

function readTile(el: HTMLElement): Tile {
  // Document order: static top, static bottom, leaf front, leaf back.
  const glyphs = el.querySelectorAll<HTMLElement>('.flap-half > span');
  return {
    top: glyphs[0],
    bottom: glyphs[1],
    leaf: el.querySelector<HTMLElement>('.flap-leaf')!,
    leafFront: glyphs[2],
    leafBack: glyphs[3],
    shades: [...el.querySelectorAll<HTMLElement>('.flap-shade')],
    current: ' ',
    target: ' ',
    busy: false,
    slow: false
  };
}

const paint = (el: HTMLElement, glyph: string) => {
  el.textContent = glyph === ' ' ? '' : glyph;
};

function setNow(tile: Tile, glyph: string) {
  window.clearTimeout(tile.timer);
  tile.current = tile.target = glyph;
  paint(tile.top, glyph);
  paint(tile.bottom, glyph);
  tile.leaf.style.visibility = 'hidden';
}

// One flap per call: the leaf falls from the current glyph to the next one on the drum, then
// the tile calls itself again until it reaches its target.
function step(tile: Tile) {
  if (tile.busy || tile.current === tile.target) return;

  tile.busy = true;
  const index = DRUM.indexOf(tile.current);
  const next = index < 0 ? tile.target : DRUM[(index + 1) % DRUM.length];
  const duration = (tile.slow ? 88 : 48) + Math.random() * 16;

  paint(tile.top, next);
  paint(tile.bottom, tile.current);
  paint(tile.leafFront, tile.current);
  paint(tile.leafBack, next);
  tile.leaf.style.visibility = 'visible';

  const fall = tile.leaf.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-180deg)' }], {
    duration,
    easing: 'cubic-bezier(.55,0,.9,.55)'
  });
  tile.shades[0].animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: duration / 2, fill: 'forwards' });
  tile.shades[1].animate([{ opacity: 0.45 }, { opacity: 0 }], {
    delay: duration / 2,
    duration: duration / 2,
    fill: 'both'
  });

  fall.onfinish = () => {
    paint(tile.bottom, next);
    tile.leaf.style.visibility = 'hidden';
    tile.current = next;
    tile.busy = false;
    step(tile);
  };
}

function flipTo(tile: Tile, glyph: string, delay: number, instant: boolean) {
  const target = DRUM.includes(glyph) ? glyph : ' ';

  if (instant) {
    setNow(tile, target);
    return;
  }

  tile.target = target;
  window.clearTimeout(tile.timer);
  tile.timer = window.setTimeout(() => step(tile), delay);
}

function FlapTile({ glyph, tone }: { glyph: string; tone?: 'accent' | 'key' }) {
  return (
    <span className="flap" data-glyph={glyph} data-tone={tone} aria-hidden="true">
      <span className="flap-half flap-top">
        <span />
      </span>
      <span className="flap-half flap-bottom">
        <span />
      </span>
      <span className="flap-leaf">
        <span className="flap-half flap-top">
          <span />
          <i className="flap-shade" />
        </span>
        <span className="flap-half flap-bottom">
          <span />
          <i className="flap-shade" />
        </span>
      </span>
    </span>
  );
}

export function DepartureBoard({ email }: { email: string }) {
  const shouldReduceMotion = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLAnchorElement>(null);
  const [layout, setLayout] = useState<Layout>('wide');
  const tilesRef = useRef<{ lines: { tile: Tile; glyph: string }[][]; key: Tile[] }>({ lines: [], key: [] });
  const playedRef = useRef(false);

  const { columns, lines } = layouts[layout];
  const blanks = columns - KEY_LABEL.length;

  // Tile size follows the board's own width, so the grid always fills it edge to edge.
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const fit = () => {
      const padding = parseFloat(getComputedStyle(board).paddingLeft) * 2;
      const width = board.clientWidth - padding;
      const next: Layout = width >= 720 ? 'wide' : 'narrow';
      const { columns: cols } = layouts[next];
      const gap = next === 'wide' ? 6 : 4;
      const tileWidth = Math.min(64, Math.floor((width - (cols - 1) * gap) / cols));

      board.style.setProperty('--flap-w', `${tileWidth}px`);
      board.style.setProperty('--flap-h', `${Math.round(tileWidth * 1.42)}px`);
      board.style.setProperty('--flap-fs', `${Math.round(tileWidth * 0.9)}px`);
      board.style.setProperty('--flap-gap-x', `${gap}px`);
      setLayout(next);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  // Rebuild the tile handles whenever the layout renders a different grid.
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const rows = [...board.querySelectorAll<HTMLElement>('[data-flap-row]')];
    const lineTiles = rows.map((row) =>
      [...row.querySelectorAll<HTMLElement>('.flap')]
        .filter((el) => !el.closest('a'))
        .map((el) => ({ tile: readTile(el), glyph: el.dataset.glyph ?? ' ' }))
    );
    const keyTiles = [...(keyRef.current?.querySelectorAll<HTMLElement>('.flap') ?? [])].map((el) => ({
      ...readTile(el),
      slow: true
    }));

    tilesRef.current = { lines: lineTiles, key: keyTiles };

    const settled = playedRef.current || shouldReduceMotion;
    lineTiles.flat().forEach(({ tile, glyph }) => setNow(tile, settled ? glyph : ' '));
    keyTiles.forEach((tile, i) => setNow(tile, settled ? KEY_LABEL[i] : ' '));

    return () => {
      lineTiles.flat().forEach(({ tile }) => window.clearTimeout(tile.timer));
      keyTiles.forEach((tile) => window.clearTimeout(tile.timer));
    };
  }, [layout, shouldReduceMotion]);

  // The board clatters in once, the first time most of it is on screen. Nothing loops.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || shouldReduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || playedRef.current) return;
        playedRef.current = true;
        observer.disconnect();

        tilesRef.current.lines.forEach((row, r) =>
          row.forEach(({ tile, glyph }, c) => flipTo(tile, glyph, r * 140 + c * 26, false))
        );
        tilesRef.current.key.forEach((tile, i) => flipTo(tile, KEY_LABEL[i], KEY_START_MS + i * 70, false));
      },
      { threshold: 0.45 }
    );

    observer.observe(board);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  return (
    <div
      ref={boardRef}
      className="flap-board p-4 sm:p-7"
      style={{ '--flap-w': '48px', '--flap-h': '68px', '--flap-fs': '43px' } as CSSProperties}
    >
      <div className="relative z-10 grid gap-[calc(var(--flap-gap-x)*1.3)]">
        {lines.map((line) => (
          <div key={line.text} data-flap-row className="flex gap-(--flap-gap-x)" aria-hidden="true">
            {[...line.text.padEnd(columns, ' ')].map((glyph, i) => (
              <FlapTile key={i} glyph={glyph} tone={i >= line.accentFrom ? 'accent' : undefined} />
            ))}
          </div>
        ))}
        <div data-flap-row className="flex gap-(--flap-gap-x)">
          {Array.from({ length: blanks }, (_, i) => (
            <FlapTile key={i} glyph=" " />
          ))}
          <a
            ref={keyRef}
            href={`mailto:${email}`}
            aria-label={`Email me at ${email}`}
            className="flap-key flex gap-(--flap-gap-x) rounded-md [--focus-offset:6px]"
          >
            {[...KEY_LABEL].map((glyph, i) => (
              <FlapTile key={i} glyph={glyph} tone="key" />
            ))}
          </a>
        </div>
      </div>
    </div>
  );
}
