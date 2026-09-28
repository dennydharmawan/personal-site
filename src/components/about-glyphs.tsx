import type { ComponentType } from 'react';
import { motion, type Variants } from 'motion/react';
import type { GlyphId } from '@/components/portfolio-home-data';
import { instant, overshootEase, revealEase } from '@/components/sections/shared';
import { cn } from '@/lib/utils';

// Every glyph sits on a 24-unit grid with a 1.6 stroke (1.5 for the check) and a single sky
// accent, so the four read as one set at text size.
const line = 'fill-none stroke-white stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const faintLine = 'fill-none stroke-white/40 stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const softLine = 'fill-none stroke-white/70 stroke-[1.6] [stroke-linecap:round]';
const skyLine = 'fill-none stroke-sky-400 stroke-[1.6] [stroke-linecap:round]';
const tick = 'fill-none stroke-white stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]';
// Fills the toggle with the tile's own color so the toggle cuts across the badge outline.
const knockout = 'fill-zinc-900 stroke-white stroke-[1.6]';

// `hidden` is each part's before state and `visible` is the finished drawing. `at` is when
// the glyph starts, in seconds, so the same art plays inside the entrance or on its own.
function grow(at: number, duration = 0.35): Variants {
  return {
    hidden: { scale: 0, transition: instant },
    visible: { scale: 1, transition: { delay: at, duration, ease: overshootEase } }
  };
}

// A round cap paints a dot even at zero length, so a stroke stays invisible until it starts drawing.
function draw(at: number, duration: number): Variants {
  return {
    hidden: { opacity: 0, pathLength: 0, transition: instant },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        opacity: { delay: at, duration: 0.01 },
        pathLength: { delay: at, duration, ease: revealEase }
      }
    }
  };
}

function fade(from: number, to: number, at: number, duration = 0.3): Variants {
  return {
    hidden: { opacity: from, transition: instant },
    visible: { opacity: to, transition: { delay: at, duration, ease: 'linear' } }
  };
}

type ArtProps = { at: number };

function AccessArt({ at }: ArtProps) {
  const knobSwitch = at + 0.32;

  return (
    <>
      <rect className={line} x="3.4" y="2.9" width="12.4" height="15.6" rx="2.7" />
      <path className={faintLine} d="M8.1 5.6h3" />
      <circle className={line} cx="9.6" cy="9.4" r="2.3" />
      <path className={line} d="M6.2 15.1c.6-1.7 1.9-2.6 3.4-2.6s2.8.9 3.4 2.6" />
      <rect className={knockout} x="12.2" y="14.1" width="9.6" height="6.2" rx="3.1" />
      <motion.g
        variants={{
          hidden: { x: -3.4, transition: instant },
          visible: { x: 0, transition: { delay: at + 0.12, duration: 0.5, ease: revealEase } }
        }}
      >
        <motion.circle
          className="fill-white/40"
          cx="18.7"
          cy="17.2"
          r="2"
          variants={fade(1, 0, knobSwitch, 0.25)}
        />
        <motion.circle
          className="fill-sky-400"
          cx="18.7"
          cy="17.2"
          r="2"
          variants={fade(0, 1, knobSwitch, 0.25)}
        />
      </motion.g>
    </>
  );
}

const hubSpokes = ['M9.5 9.5 7.2 7.2', 'M14.5 9.5l2.3-2.3', 'M9.5 14.5l-2.3 2.3', 'M14.5 14.5l2.3 2.3'];
const hubNodes = [
  [5.4, 5.4],
  [18.6, 5.4],
  [5.4, 18.6],
  [18.6, 18.6]
] as const;

function HubArt({ at }: ArtProps) {
  return (
    <>
      {hubSpokes.map((d, i) => (
        <motion.path key={d} className={softLine} d={d} variants={draw(at + 0.2 + i * 0.05, 0.25)} />
      ))}
      {hubNodes.map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          className={line}
          cx={cx}
          cy={cy}
          r="2.3"
          variants={grow(at + 0.38 + i * 0.05)}
        />
      ))}
      <motion.rect
        className="fill-sky-400"
        x="8.6"
        y="8.6"
        width="6.8"
        height="6.8"
        rx="2.1"
        variants={grow(at, 0.45)}
      />
    </>
  );
}

function LendingArt({ at }: ArtProps) {
  const rise = at + 0.22;

  return (
    <>
      <motion.path
        className="fill-white/15"
        d="M3 16.4 7.4 13.3 11 14.7 15.2 9.9 21 6.3V20H3Z"
        style={{ originY: 1 }}
        variants={{
          hidden: { opacity: 0, scaleY: 0.3, transition: instant },
          visible: { opacity: 1, scaleY: 1, transition: { delay: rise, duration: 0.55, ease: revealEase } }
        }}
      />
      <motion.path
        className={line}
        d="M3 16.4 7.4 13.3 11 14.7 15.2 9.9 21 6.3"
        variants={draw(rise, 0.55)}
      />
      <motion.circle className="fill-white" cx="21" cy="6.3" r="1.9" variants={grow(at + 0.7)} />
      <motion.path className={skyLine} d="M3 20h18" variants={draw(at, 0.35)} />
    </>
  );
}

const art: Record<GlyphId, ComponentType<ArtProps>> = {
  access: AccessArt,
  hub: HubArt,
  lending: LendingArt
};

// Without `at` the glyph stays finished. With it, the glyph follows the parent's
// hidden/visible variants, and bumping `replay` remounts it to act out its system again.
export function GlyphTile({
  at,
  className,
  glyph,
  replay = 0,
  variants
}: {
  at?: number;
  className?: string;
  glyph: GlyphId;
  replay?: number;
  variants?: Variants;
}) {
  const Art = art[glyph];
  const control =
    at === undefined
      ? { animate: 'visible', initial: false as const }
      : replay > 0
        ? { animate: 'visible', initial: 'hidden' }
        : {};

  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        'inline-grid size-[1.06em] shrink-0 place-items-center rounded-[0.3em] bg-linear-to-b from-zinc-800 to-zinc-950 shadow-sm shadow-black/20 inset-ring inset-ring-white/10 inset-shadow-2xs inset-shadow-white/20',
        className
      )}
      variants={variants}
    >
      <motion.svg key={replay} className="size-[74%] overflow-visible" viewBox="0 0 24 24" {...control}>
        <Art at={replay > 0 ? 0 : (at ?? 0)} />
      </motion.svg>
    </motion.span>
  );
}
