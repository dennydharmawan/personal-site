import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { contactEmail, getYearsExperience } from '@/components/sections/shared';

/*
  A 2D port of Vercel's Ship badge (vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber):
  a few rope joints from a fixed anchor, the card hung by its clip, its spin damped so it settles,
  the strap drawn as a smooth curve through the joints, and a drag that keeps the grab offset.
*/
const JOINTS = 4;
const JOINT_LENGTH = 50;
const CARD_WIDTH = 212;
const CARD_HEIGHT = 296;
const GRAVITY = 0.5;
const AIR = 0.986;
// Share of the card's swing around its clip removed each frame; Vercel damps the badge's spin the same way.
const SPIN_DAMPING = 0.05;
const SOLVER_PASSES = 16;

type Point = { x: number; y: number; px: number; py: number };

function constrain(a: Point, b: Point, length: number, aShare = 0.5) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 1;
  const offset = (distance - length) / distance;
  a.x += dx * offset * aShare;
  a.y += dy * offset * aShare;
  b.x -= dx * offset * (1 - aShare);
  b.y -= dy * offset * (1 - aShare);
}

// Catmull-Rom through the joints, written as cubic Béziers, so the strap bends instead of kinking.
function smoothPath(points: { x: number; y: number }[]) {
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function Barcode() {
  return (
    <span aria-hidden="true" className="flex h-6 items-end gap-[2px]">
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="block bg-zinc-900"
          style={{ width: `${1 + ((i * 7) % 3)}px`, height: `${60 + ((i * 37) % 40)}%` }}
        />
      ))}
    </span>
  );
}

export function AccessLanyard() {
  const shouldReduceMotion = useReducedMotion();
  const strapId = useId();
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const strapRefs = useRef<SVGPathElement[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [dropped, setDropped] = useState(false);

  const sim = useRef({
    anchor: { x: 0, y: -6 },
    points: [] as Point[],
    shown: [] as { x: number; y: number }[],
    drag: null as null | { x: number; y: number; along: number; startX: number; startY: number; moved: boolean },
    tilt: 0,
    still: 0,
    running: false,
    frame: 0
  });

  useEffect(() => {
    const layer = layerRef.current;
    const card = cardRef.current;
    const tilt = tiltRef.current;
    if (!layer || !card || !tilt) return;
    const s = sim.current;

    const placeAnchor = () => {
      const width = layer.clientWidth;
      const shell = Math.min(1280, width - 40);
      s.anchor.x = (width - shell) / 2 + shell - CARD_WIDTH / 2 - 24;
    };

    // Joints laid out to the right of the anchor fall and swing into place; laid straight down they just hang.
    const reset = (drop: boolean) => {
      placeAnchor();
      const { x: ax, y: ay } = s.anchor;
      s.points = [];
      for (let i = 0; i <= JOINTS; i++) {
        const x = drop ? ax + i * JOINT_LENGTH : ax;
        const y = drop ? ay : ay + i * JOINT_LENGTH;
        s.points.push({ x, y, px: x, py: y });
      }
      const clip = s.points[JOINTS];
      const bottom = drop ? { x: clip.x + CARD_HEIGHT, y: clip.y } : { x: clip.x, y: clip.y + CARD_HEIGHT };
      s.points.push({ ...bottom, px: bottom.x, py: bottom.y });
      s.shown = s.points.map((p) => ({ x: p.x, y: p.y }));
      s.tilt = 0;
      s.still = 0;
    };

    const step = () => {
      const pts = s.points;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * AIR;
        const vy = (p.y - p.py) * AIR;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;
      }

      const clip = pts[JOINTS];
      const bottom = pts[JOINTS + 1];
      const rx = bottom.x - clip.x;
      const ry = bottom.y - clip.y;
      const rl = Math.hypot(rx, ry) || 1;
      const swingX = bottom.x - bottom.px - (clip.x - clip.px);
      const swingY = bottom.y - bottom.py - (clip.y - clip.py);
      const along = (swingX * rx + swingY * ry) / (rl * rl);
      bottom.px += (swingX - along * rx) * SPIN_DAMPING;
      bottom.py += (swingY - along * ry) * SPIN_DAMPING;

      for (let pass = 0; pass < SOLVER_PASSES; pass++) {
        pts[0].x = s.anchor.x;
        pts[0].y = s.anchor.y;
        for (let i = 0; i < JOINTS; i++) constrain(pts[i], pts[i + 1], JOINT_LENGTH, i === 0 ? 0 : 0.5);
        constrain(clip, bottom, CARD_HEIGHT);

        if (s.drag) {
          const gx = clip.x + (bottom.x - clip.x) * s.drag.along;
          const gy = clip.y + (bottom.y - clip.y) * s.drag.along;
          const dx = s.drag.x - gx;
          const dy = s.drag.y - gy;
          clip.x += dx;
          clip.y += dy;
          bottom.x += dx;
          bottom.y += dy;
        }
      }
      pts[0].x = s.anchor.x;
      pts[0].y = s.anchor.y;
    };

    const render = () => {
      const pts = s.points;
      // Ease the drawn joints toward the simulated ones: faster when far, so drags stay tight and rest stays calm.
      s.shown = s.shown.map((q, i) => {
        const p = pts[i];
        const k = Math.min(1, 0.45 + Math.hypot(p.x - q.x, p.y - q.y) * 0.02);
        return { x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k };
      });

      const clip = s.shown[JOINTS];
      const bottom = s.shown[JOINTS + 1];
      const angle = Math.atan2(bottom.x - clip.x, bottom.y - clip.y);
      const vx = pts[JOINTS].x - pts[JOINTS].px;
      s.tilt += (Math.max(-28, Math.min(28, -vx * 2.4)) - s.tilt) * 0.15;

      card.style.transform = `translate(${clip.x - CARD_WIDTH / 2}px, ${clip.y}px) rotate(${-angle}rad)`;
      tilt.style.transform = `rotateY(${s.tilt.toFixed(2)}deg)`;
      card.style.setProperty('--sheen', `${(50 + s.tilt * 1.6).toFixed(1)}%`);

      const d = smoothPath(s.shown.slice(0, JOINTS + 1));
      strapRefs.current.forEach((path) => path?.setAttribute('d', d));
    };

    const loop = () => {
      step();
      render();
      const moving = s.points.some((p) => Math.abs(p.x - p.px) + Math.abs(p.y - p.py) > 0.04);
      s.still = moving || s.drag ? 0 : s.still + 1;
      // Asleep after a second and a half at rest, so an idle badge costs nothing.
      if (s.still > 90) {
        s.running = false;
        return;
      }
      s.frame = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (shouldReduceMotion || s.running) return;
      s.running = true;
      s.still = 0;
      s.frame = requestAnimationFrame(loop);
    };

    reset(false);
    for (let i = 0; i < 400; i++) step();
    s.shown = s.points.map((p) => ({ x: p.x, y: p.y }));
    render();

    const toLocal = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('a')) return;
      card.setPointerCapture(event.pointerId);
      const at = toLocal(event);
      const clip = s.points[JOINTS];
      const bottom = s.points[JOINTS + 1];
      const along =
        ((at.x - clip.x) * (bottom.x - clip.x) + (at.y - clip.y) * (bottom.y - clip.y)) / (CARD_HEIGHT * CARD_HEIGHT);
      s.drag = { ...at, along: Math.max(0, Math.min(1, along)), startX: at.x, startY: at.y, moved: false };
      wake();
    };
    const onMove = (event: PointerEvent) => {
      if (!s.drag) return;
      const at = toLocal(event);
      s.drag.x = at.x;
      s.drag.y = at.y;
      if (Math.hypot(at.x - s.drag.startX, at.y - s.drag.startY) > 6) s.drag.moved = true;
      if (shouldReduceMotion) {
        step();
        render();
      }
    };
    // Pointer capture sends the click to the card, not the face button, so a still press flips here.
    const onUp = () => {
      if (!s.drag) return;
      if (!s.drag.moved) setFlipped((value) => !value);
      s.drag = null;
      wake();
    };

    card.addEventListener('pointerdown', onDown);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerup', onUp);
    card.addEventListener('pointercancel', onUp);

    const onResize = () => {
      reset(false);
      for (let i = 0; i < 400; i++) step();
      s.shown = s.points.map((p) => ({ x: p.x, y: p.y }));
      render();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(layer);

    // The badge drops in once, when the section's top edge passes 60% of the viewport. The layer spans
    // the whole section, several screens tall, so a ratio threshold would never be reached.
    const dropObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        dropObserver.disconnect();
        if (!shouldReduceMotion) {
          reset(true);
          render();
        }
        setDropped(true);
        wake();
      },
      { rootMargin: '0px 0px -40% 0px' }
    );
    dropObserver.observe(layer);

    return () => {
      cancelAnimationFrame(s.frame);
      s.running = false;
      card.removeEventListener('pointerdown', onDown);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerup', onUp);
      card.removeEventListener('pointercancel', onUp);
      resizeObserver.disconnect();
      dropObserver.disconnect();
    };
  }, [shouldReduceMotion]);

  // Pointer presses flip the card in onUp; this handles Enter and Space, which click with detail 0.
  const toggleFromKeyboard = (event: ReactMouseEvent) => {
    if (event.detail === 0) setFlipped((value) => !value);
  };

  const strapText = Array.from({ length: 8 }, () => 'DENNYDHARMAWAN.COM').join('  ·  ');

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      <svg
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
        style={{ opacity: dropped || shouldReduceMotion ? 1 : 0 }}
      >
        <path
          ref={(el) => {
            if (el) strapRefs.current[0] = el;
          }}
          fill="none"
          className="stroke-sky-600"
          strokeWidth={17}
          strokeLinecap="round"
        />
        <path
          ref={(el) => {
            if (el) strapRefs.current[1] = el;
          }}
          id={strapId}
          fill="none"
          className="stroke-sky-500"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <text className="fill-sky-50 font-mono text-[7px] tracking-[0.2em]" dominantBaseline="central">
          <textPath href={`#${strapId}`} startOffset="6">
            {strapText}
          </textPath>
        </text>
      </svg>

      <div
        ref={cardRef}
        className="pointer-events-auto absolute top-0 left-0 touch-none select-none [perspective:900px]"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transformOrigin: `${CARD_WIDTH / 2}px 0`,
          opacity: dropped || shouldReduceMotion ? 1 : 0
        }}
      >
        <div ref={tiltRef} className="size-full [transform-style:preserve-3d]">
          <div
            className="relative size-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : undefined }}
          >
            <div className="absolute -top-3 left-1/2 z-10 h-7 w-11 -translate-x-1/2 rounded-md bg-linear-to-b from-zinc-200 to-zinc-400 shadow-sm ring-1 ring-zinc-900/15">
              <div className="mx-auto mt-2 h-1.5 w-6 rounded-full bg-zinc-600/40" />
            </div>

            <div
              className="absolute inset-0 grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-900/10 [backface-visibility:hidden]"
              inert={flipped}
            >
              <div className="flex items-center justify-between bg-zinc-900 px-4 pt-6 pb-3 text-[10px] font-medium tracking-[0.14em] text-zinc-300 uppercase">
                <span>Access pass</span>
                <span className="text-sky-300">Engineering</span>
              </div>
              <div className="grid content-start gap-3 px-4 pt-5">
                <div className="grid size-14 place-items-center rounded-xl bg-zinc-900 font-heading text-xl text-white">
                  DD
                </div>
                <div>
                  <p className="font-heading text-2xl leading-tight tracking-tight text-zinc-900">
                    Denny
                    <br />
                    Dharmawan
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">Senior Full-Stack Engineer</p>
                </div>
                <p className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                  Open to fintech roles
                </p>
              </div>
              <div className="flex items-end justify-between px-4 pb-4">
                <Barcode />
                <span className="font-mono text-[10px] text-zinc-400">JKT · UTC+7</span>
              </div>
              {/* Clearcoat: a highlight band that slides as the card turns. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-[115deg] from-transparent from-35% via-white/60 via-50% to-transparent to-65% bg-size-[260%_100%] mix-blend-soft-light"
                style={{ backgroundPositionX: 'var(--sheen, 50%)' }}
              />
              <button
                type="button"
                aria-pressed={flipped}
                aria-label="Access pass for Denny Dharmawan. Flip it for contact details."
                className="absolute inset-0 cursor-grab rounded-2xl active:cursor-grabbing"
                onClick={toggleFromKeyboard}
              />
            </div>

            <div
              className="absolute inset-0 grid content-center justify-items-center gap-4 rounded-2xl bg-zinc-900 p-5 text-center text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
              inert={!flipped}
            >
              <button
                type="button"
                aria-label="Flip the access pass back"
                className="absolute inset-0 cursor-grab rounded-2xl active:cursor-grabbing"
                onClick={toggleFromKeyboard}
              />
              <p className="relative text-[10px] font-medium tracking-[0.14em] text-sky-300 uppercase">
                Access granted
              </p>
              <p className="relative font-heading text-2xl leading-tight tracking-tight">
                {getYearsExperience()} years shipping software
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="relative inline-flex h-11 items-center rounded-full bg-sky-400 px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-sky-300"
              >
                Email me →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
