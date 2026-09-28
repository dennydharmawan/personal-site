import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Drum order: the punctuation the board shows sits right after blank, so no tile rolls
// through forty flaps to reach '.', '?', or '→'.
const DRUM = ' .?→ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,:-+%/@';

const KEY_LABEL = 'EMAIL ME →';
// The key starts as the headline's tail is landing and flaps slower, so it still finishes last
// and reads as the payoff. Whole board: headline in about 1s, key readable by about 1.7s.
const KEY_START_MS = 700;

type Layout = 'wide' | 'narrow';

// accentFrom is the column where the sky words start on that line. The column counts must match
// --flap-cols in global.css, which picks the layout with a container query.
const layouts: Record<Layout, { columns: number; lines: { text: string; accentFrom: number }[] }> = {
  wide: {
    columns: 22,
    lines: [
      { text: 'HIRING A SENIOR', accentFrom: Infinity },
      { text: 'ENGINEER FOR FINTECH?', accentFrom: 13 }
    ]
  },
  narrow: {
    columns: 12,
    lines: [
      { text: 'HIRING A', accentFrom: Infinity },
      { text: 'SENIOR', accentFrom: Infinity },
      { text: 'ENGINEER FOR', accentFrom: Infinity },
      { text: 'FINTECH?', accentFrom: 0 }
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
  fall?: Animation;
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

function stop(tile: Tile) {
  window.clearTimeout(tile.timer);
  tile.fall?.cancel();
  tile.busy = false;
}

function setNow(tile: Tile, glyph: string) {
  stop(tile);
  tile.current = tile.target = glyph;
  paint(tile.top, glyph);
  paint(tile.bottom, glyph);
  tile.leaf.style.visibility = 'hidden';
}

// One flap: the leaf falls from the current glyph to `next` and lands as the new bottom half.
function flap(tile: Tile, next: string, duration: number, onLanded: () => void) {
  tile.busy = true;
  paint(tile.top, next);
  paint(tile.bottom, tile.current);
  paint(tile.leafFront, tile.current);
  paint(tile.leafBack, next);
  tile.leaf.style.visibility = 'visible';

  const fall = (tile.fall = tile.leaf.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-180deg)' }], {
    duration,
    easing: 'cubic-bezier(.55,0,.9,.55)'
  }));
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
    onLanded();
  };
}

// The last flap hits the stop and bounces back once toward the viewer before it rests.
function settle(tile: Tile) {
  tile.bottom.parentElement?.animate(
    [
      { transform: 'rotateX(0deg)' },
      { transform: 'rotateX(10deg)', offset: 0.3 },
      { transform: 'rotateX(0deg)', offset: 0.65 },
      { transform: 'rotateX(3deg)', offset: 0.82 },
      { transform: 'rotateX(0deg)' }
    ],
    { duration: 260, easing: 'ease-out' }
  );
}

// Flaps one glyph at a time until the tile reaches its target, then settles.
function step(tile: Tile) {
  if (tile.busy || tile.current === tile.target) return;

  const index = DRUM.indexOf(tile.current);
  const next = index < 0 ? tile.target : DRUM[(index + 1) % DRUM.length];
  flap(tile, next, (tile.slow ? 80 : 48) + Math.random() * 16, () =>
    next === tile.target ? settle(tile) : step(tile)
  );
}

// A blank tile starts a few flaps short of its glyph instead of spinning the whole drum, so a
// 'Y' costs as much as an 'A'. The first flap covers the jump, too fast to see.
function flipTo(tile: Tile, glyph: string, delay: number, flaps: number) {
  tile.target = DRUM.includes(glyph) ? glyph : ' ';
  if (tile.target !== ' ' && tile.current === ' ') {
    tile.current = DRUM[(DRUM.indexOf(tile.target) - flaps + DRUM.length) % DRUM.length];
  }
  window.clearTimeout(tile.timer);
  tile.timer = window.setTimeout(() => step(tile), delay);
}

function FlapTile({ glyph, tone, wideOnly }: { glyph: string; tone?: 'accent' | 'key'; wideOnly?: boolean }) {
  return (
    <span className="flap" data-glyph={glyph} data-tone={tone} data-wide-only={wideOnly || undefined} aria-hidden="true">
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

const isShown = (el: Element) => el.getClientRects().length > 0;

export function DepartureBoard({ email }: { email: string }) {
  const shouldReduceMotion = useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const keyTilesRef = useRef<Tile[]>([]);

  const keyBlanks = layouts.wide.columns - KEY_LABEL.length;
  const narrowKeyBlanks = layouts.narrow.columns - KEY_LABEL.length;

  // Both layouts are in the markup and CSS shows one, so the server HTML already has the final
  // size and nothing jumps when this hydrates. The tiles start blank, which is also what the
  // server rendered.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const rows = [...board.querySelectorAll<HTMLElement>('[data-flap-line]')];
    const lines = rows.map((row) =>
      [...row.querySelectorAll<HTMLElement>('.flap')].map((el) => ({ tile: readTile(el), glyph: el.dataset.glyph ?? ' ' }))
    );
    const key = [...board.querySelectorAll<HTMLElement>('.flap-key .flap')].map((el) => ({ ...readTile(el), slow: true }));
    keyTilesRef.current = key;
    const all = [...lines.flat().map(({ tile }) => tile), ...key];

    const settle = () => {
      lines.flat().forEach(({ tile, glyph }) => setNow(tile, glyph));
      key.forEach((tile, i) => setNow(tile, KEY_LABEL[i]));
    };

    if (shouldReduceMotion) {
      settle();
      return () => all.forEach(stop);
    }

    // The board clatters in once, the first time most of it is on screen. Nothing loops. Only the
    // layout on screen animates; the hidden one settles at once in case the window crosses the
    // breakpoint later.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        let r = 0;
        rows.forEach((row, i) => {
          if (!isShown(row)) {
            lines[i].forEach(({ tile, glyph }) => setNow(tile, glyph));
            return;
          }
          lines[i].forEach(({ tile, glyph }, c) => flipTo(tile, glyph, r * 110 + c * 20, 5 + Math.floor(Math.random() * 4)));
          r += 1;
        });
        key.forEach((tile, i) => flipTo(tile, KEY_LABEL[i], KEY_START_MS + i * 45, 4 + Math.floor(Math.random() * 3)));
      },
      { threshold: 0.45 }
    );

    observer.observe(board);
    return () => {
      observer.disconnect();
      all.forEach(stop);
    };
  }, [shouldReduceMotion]);

  // A visitor who reaches the key before it has flapped in gets its label at once.
  const settleKey = () => {
    keyTilesRef.current.forEach((tile, i) => {
      if (tile.current !== KEY_LABEL[i]) setNow(tile, KEY_LABEL[i]);
    });
  };

  return (
    <div ref={boardRef} className="flap-board p-4 sm:p-7">
      <div className="flap-grid relative z-10 grid gap-[calc(var(--flap-gap-x)*1.3)]">
        {(Object.keys(layouts) as Layout[]).map((layout) => (
          <div key={layout} data-flap-layout={layout} aria-hidden="true">
            {layouts[layout].lines.map((line) => (
              <div key={line.text} data-flap-line className="flex gap-(--flap-gap-x)">
                {[...line.text.padEnd(layouts[layout].columns, ' ')].map((glyph, i) => (
                  <FlapTile key={i} glyph={glyph} tone={i >= line.accentFrom ? 'accent' : undefined} />
                ))}
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-(--flap-gap-x)">
          {Array.from({ length: keyBlanks }, (_, i) => (
            <FlapTile key={i} glyph=" " wideOnly={i < keyBlanks - narrowKeyBlanks} />
          ))}
          <a
            href={`mailto:${email}`}
            aria-label={`Email me at ${email}`}
            className="flap-key relative flex gap-(--flap-gap-x) rounded-md [--focus-offset:6px] after:absolute after:inset-x-0 after:inset-y-[min(0px,calc((100%-44px)/2))]"
            onFocus={settleKey}
            onPointerEnter={settleKey}
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
