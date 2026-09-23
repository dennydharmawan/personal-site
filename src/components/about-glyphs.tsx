import type { ComponentType } from 'react';
import type { GlyphId } from '@/components/portfolio-home-data';
import { cn } from '@/lib/utils';

// Every glyph sits on a 24-unit grid with one 1.6 stroke weight and a single sky accent,
// so the four read as one set at text size.
const line = 'fill-none stroke-white stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const faintLine = 'fill-none stroke-white/40 stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]';
const softLine = 'fill-none stroke-white/70 stroke-[1.6] [stroke-linecap:round]';
const skyLine = 'fill-none stroke-sky-400 stroke-[1.6] [stroke-linecap:round]';
const tick = 'fill-none stroke-white stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]';
// Fills the toggle with the tile's own color so the toggle cuts across the badge outline.
const knockout = 'fill-zinc-900 stroke-white stroke-[1.6]';

function AccessArt() {
  return (
    <>
      <rect className={line} x="3.4" y="2.9" width="12.4" height="15.6" rx="2.7" />
      <path className={faintLine} d="M8.1 5.6h3" />
      <circle className={line} cx="9.6" cy="9.4" r="2.3" />
      <path className={line} d="M6.2 15.1c.6-1.7 1.9-2.6 3.4-2.6s2.8.9 3.4 2.6" />
      <rect className={knockout} x="12.2" y="14.1" width="9.6" height="6.2" rx="3.1" />
      <circle className="fill-sky-400" cx="18.7" cy="17.2" r="2" />
    </>
  );
}

function HubArt() {
  return (
    <>
      <path className={softLine} d="M9.5 9.5 7.2 7.2M14.5 9.5l2.3-2.3M9.5 14.5l-2.3 2.3M14.5 14.5l2.3 2.3" />
      <circle className={line} cx="5.4" cy="5.4" r="2.3" />
      <circle className={line} cx="18.6" cy="5.4" r="2.3" />
      <circle className={line} cx="5.4" cy="18.6" r="2.3" />
      <circle className={line} cx="18.6" cy="18.6" r="2.3" />
      <rect className="fill-sky-400" x="8.6" y="8.6" width="6.8" height="6.8" rx="2.1" />
    </>
  );
}

function ReviewArt() {
  return (
    <>
      <path className={line} d="M6 6.9c0 3.9 6 3.8 6 7.3M12 6.9v7.3" />
      <circle className="fill-white" cx="6" cy="4.7" r="1.95" />
      <circle className="fill-white" cx="12" cy="4.7" r="1.95" />
      <circle className={faintLine} cx="18" cy="4.7" r="1.55" />
      <circle className="fill-sky-400" cx="12" cy="17.8" r="3.6" />
      <path className={tick} d="M10.3 17.9l1.15 1.15 2.3-2.5" />
    </>
  );
}

function LendingArt() {
  return (
    <>
      <path className="fill-white/15" d="M3 16.4 7.4 13.3 11 14.7 15.2 9.9 21 6.3V20H3Z" />
      <path className={line} d="M3 16.4 7.4 13.3 11 14.7 15.2 9.9 21 6.3" />
      <circle className="fill-white" cx="21" cy="6.3" r="1.9" />
      <path className={skyLine} d="M3 20h18" />
    </>
  );
}

const art: Record<GlyphId, ComponentType> = {
  access: AccessArt,
  hub: HubArt,
  lending: LendingArt,
  review: ReviewArt
};

export function GlyphTile({ className, glyph }: { className?: string; glyph: GlyphId }) {
  const Art = art[glyph];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid size-[1.06em] shrink-0 place-items-center rounded-[0.3em] bg-linear-to-b from-zinc-800 to-zinc-950 shadow-sm shadow-black/20 inset-ring inset-ring-white/10 inset-shadow-2xs inset-shadow-white/20',
        className
      )}
    >
      <svg className="size-[74%] overflow-visible" viewBox="0 0 24 24">
        <Art />
      </svg>
    </span>
  );
}
