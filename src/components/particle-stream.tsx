import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export type ParticlePattern = 'dust' | 'spiral';
export type DustFormation = 'arcs' | 'braid' | 'columns' | 'waves';

type Particle = {
  alpha: number;
  arm: number;
  depth: number;
  extra: boolean;
  lane: number;
  phase: number;
  size: number;
  speed: number;
  x: number;
  y: number;
};

const spiralArms = 16;
const dotsPerArm = 210;
const spiralTurns = 0.5;
const dustCount = 150;
const dustFloatPixels = 5;
const arcLanes = 7;
const dotsPerLane = 60;
const arcStart = Math.PI * 0.95;
const arcSweep = Math.PI * 0.6;
const arcFlow = 0.02;
const gatherRate = 3.5;
const parallaxPixels = 14;
const pointerEaseRate = 4;
// Idle dust rides a slow wind across the card and wraps at the edges, so the field never
// settles into dots circling in place. Nearer dots travel faster, which reads as depth.
const driftPixelsPerSecond = [3, 11] as const;
const windSwayRadians = 0.5;
const twinkleDepth = 0.3;
// Dots near the pointer part around it, nearer dots more, so the cursor moves through the field.
const repelRadius = 90;
const repelPixels = 22;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(pattern: ParticlePattern, seed: number): Particle[] {
  const random = seededRandom(seed);
  if (pattern === 'spiral') {
    return Array.from({ length: spiralArms * dotsPerArm }, (_, index) => ({
      alpha: 1,
      arm: Math.floor(index / dotsPerArm),
      depth: 0.5,
      extra: false,
      lane: 0,
      phase: (index % dotsPerArm) / dotsPerArm,
      size: 0.8,
      speed: 0.006,
      x: 0,
      y: 0
    }));
  }
  return Array.from({ length: arcLanes * dotsPerLane }, (_, index) => {
    const depth = random();
    return {
      alpha: 0.2 + 0.7 * depth,
      arm: (Math.floor(index / arcLanes) + random() * 0.3) / dotsPerLane,
      depth,
      extra: index >= dustCount,
      lane: ((index % arcLanes) + (random() - 0.5) * 0.12) / (arcLanes - 1),
      phase: random() * Math.PI * 2,
      size: 0.6 + depth * 1,
      speed: 0.25 + random() * 0.35,
      x: random(),
      y: random()
    };
  });
}

// `spiral` streams evenly spaced dots inward along arms wound around `origin` (card fractions, may
// sit outside the card). `dust` floats scattered dots in place; while the pointer is over the card
// they gather, with extra dots fading in, into flowing lanes shaped by `formation`: `arcs` sweeps
// concentric lanes around `origin`, `braid` weaves those lanes across each other, `waves` runs them
// through the heading band, `columns` lifts them straight up. In both patterns, nearer dots shift
// further with the pointer, which reads as depth.
export function ParticleStream({
  className,
  colorVar = '--color-zinc-400',
  formation = 'arcs',
  origin = [0.5, 0.5],
  pattern,
  seed
}: {
  className?: string;
  colorVar?: string;
  formation?: DustFormation;
  origin?: [number, number];
  pattern: ParticlePattern;
  seed: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() === true;
  const [originX, originY] = origin;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;

    const particles = buildParticles(pattern, seed);
    const wind = seededRandom(seed * 97 + 13)() * Math.PI * 2;
    let clock = 0;
    const pointer = { x: 0, y: 0 };
    const pointerPixels = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0 };
    let repel = 0;
    const shift = { x: 0, y: 0 };
    let hovered = false;
    let gather = 0;
    let flow = 0;
    let color = '';
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = false;

    const draw = (now: number) => {
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      clock += dt;
      const ease = 1 - Math.exp(-dt * pointerEaseRate);
      shift.x += (pointer.x - shift.x) * ease;
      shift.y += (pointer.y - shift.y) * ease;
      const cursorEase = 1 - Math.exp(-dt * pointerEaseRate * 3);
      cursor.x += (pointerPixels.x - cursor.x) * cursorEase;
      cursor.y += (pointerPixels.y - cursor.y) * cursorEase;
      repel += ((hovered ? 1 : 0) - repel) * cursorEase;

      gather += ((hovered ? 1 : 0) - gather) * (1 - Math.exp(-dt * gatherRate));
      flow = (flow + arcFlow * dt) % 1;
      const pull = gather * gather * (3 - 2 * gather);

      const dpr = canvas.width / Math.max(width, 1);
      const unit = Math.max(width, height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;

      for (const particle of particles) {
        let x: number;
        let y: number;
        let alpha = particle.alpha;
        if (pattern === 'spiral') {
          particle.phase = (particle.phase + particle.speed * dt) % 1;
          const angle = (particle.arm / spiralArms) * Math.PI * 2 - particle.phase * spiralTurns * Math.PI * 2;
          const radius = (1.45 - particle.phase * 1.1) * unit;
          x = originX * width + Math.cos(angle) * radius;
          y = originY * height + Math.sin(angle) * radius;
          alpha = Math.sin(particle.phase * Math.PI) * 0.9;
        } else {
          particle.phase += particle.speed * dt;
          const heading = wind + Math.sin(clock * 0.07 + particle.lane * 5 + particle.y * 4) * windSwayRadians;
          const pace = driftPixelsPerSecond[0] + (driftPixelsPerSecond[1] - driftPixelsPerSecond[0]) * particle.depth;
          particle.x += (Math.cos(heading) * pace * dt) / Math.max(width, 1);
          particle.y += (Math.sin(heading) * pace * dt) / Math.max(height, 1);
          const marginX = 6 / Math.max(width, 1);
          const marginY = 6 / Math.max(height, 1);
          if (particle.x < -marginX) particle.x += 1 + marginX * 2;
          else if (particle.x > 1 + marginX) particle.x -= 1 + marginX * 2;
          if (particle.y < -marginY) particle.y += 1 + marginY * 2;
          else if (particle.y > 1 + marginY) particle.y -= 1 + marginY * 2;
          alpha *= 1 - twinkleDepth + twinkleDepth * Math.sin(particle.phase * 1.3);
          x = particle.x * width + Math.cos(particle.phase) * dustFloatPixels * particle.depth;
          y = particle.y * height + Math.sin(particle.phase * 0.8) * dustFloatPixels;
          if (pull > 0.001) {
            const along = (particle.arm + flow) % 1;
            let targetX: number;
            let targetY: number;
            if (formation === 'waves') {
              targetX = (along * 1.1 - 0.05) * width;
              targetY =
                (0.1 + particle.lane * 0.32 + Math.sin(along * Math.PI * 3 + particle.lane * 4) * 0.035) * height;
            } else if (formation === 'columns') {
              targetX = (0.06 + particle.lane * 0.88) * width;
              targetY = (1 - along) * height;
            } else {
              const weave =
                formation === 'braid' ? Math.sin(along * Math.PI * 5 + particle.lane * Math.PI * 6) * 0.09 : 0;
              const spread = formation === 'braid' ? 0.92 + particle.lane * 0.14 : 0.8 + particle.lane * 0.42;
              const angle = arcStart + along * arcSweep;
              const radius = (spread + weave) * height;
              targetX = originX * width + Math.cos(angle) * radius;
              targetY = originY * height + Math.sin(angle) * radius;
            }
            x += (targetX - x) * pull;
            y += (targetY - y) * pull;
            alpha += (Math.sin(along * Math.PI) * 0.85 - alpha) * pull;
          }
          if (particle.extra) alpha *= pull;
          if (alpha <= 0.004) continue;
          if (repel > 0.01) {
            const dx = x - cursor.x;
            const dy = y - cursor.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0.5 && distance < repelRadius) {
              const falloff = 1 - distance / repelRadius;
              const push = falloff * falloff * repelPixels * (0.4 + particle.depth * 0.6) * repel;
              x += (dx / distance) * push;
              y += (dy / distance) * push;
            }
          }
        }
        x += shift.x * particle.depth * parallaxPixels;
        y += shift.y * particle.depth * parallaxPixels;
        if (x < -8 || y < -8 || x > width + 8 || y > height + 8) continue;
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(x * dpr, y * dpr, particle.size * dpr, 0, Math.PI * 2);
        context.fill();
      }

      if (visible && !reduced) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      color = getComputedStyle(canvas).getPropertyValue(colorVar).trim();
      cancelAnimationFrame(frame);
      last = 0;
      frame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      start();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    });
    intersectionObserver.observe(canvas);

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
      pointerPixels.x = event.clientX - rect.left;
      pointerPixels.y = event.clientY - rect.top;
    };
    const onPointerEnter = (event: PointerEvent) => {
      hovered = pattern === 'dust';
      const rect = host.getBoundingClientRect();
      cursor.x = pointerPixels.x = event.clientX - rect.left;
      cursor.y = pointerPixels.y = event.clientY - rect.top;
    };
    const onPointerLeave = () => {
      hovered = false;
      pointer.x = 0;
      pointer.y = 0;
    };
    if (!reduced) {
      host.addEventListener('pointerenter', onPointerEnter);
      host.addEventListener('pointermove', onPointerMove);
      host.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener('pointerenter', onPointerEnter);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [colorVar, formation, originX, originY, pattern, reduced, seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
