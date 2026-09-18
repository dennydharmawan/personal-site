import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export type ParticlePattern = 'dust' | 'spiral';

type Particle = {
  alpha: number;
  arm: number;
  depth: number;
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
const parallaxPixels = 14;

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
      phase: (index % dotsPerArm) / dotsPerArm,
      size: 0.8,
      speed: 0.006,
      x: 0,
      y: 0
    }));
  }
  return Array.from({ length: dustCount }, () => {
    const depth = random();
    return {
      alpha: 0.2 + 0.7 * depth,
      arm: 0,
      depth,
      phase: random() * Math.PI * 2,
      size: 0.6 + depth * 1,
      speed: 0.25 + random() * 0.35,
      x: random(),
      y: random()
    };
  });
}

// `spiral` streams evenly spaced dots inward along arms wound around `origin` (card fractions, may
// sit outside the card). `dust` floats scattered dots in place. In both, nearer dots shift further
// with the pointer, which reads as depth.
export function ParticleStream({
  className,
  colorVar = '--color-slate-400',
  origin = [0.5, 0.5],
  pattern,
  seed
}: {
  className?: string;
  colorVar?: string;
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
    const pointer = { x: 0, y: 0 };
    const shift = { x: 0, y: 0 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = false;

    const draw = (now: number) => {
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      shift.x += (pointer.x - shift.x) * 0.06;
      shift.y += (pointer.y - shift.y) * 0.06;

      const dpr = canvas.width / Math.max(width, 1);
      const unit = Math.max(width, height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = getComputedStyle(canvas).getPropertyValue(colorVar).trim();

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
          x = particle.x * width + Math.cos(particle.phase) * dustFloatPixels * particle.depth;
          y = particle.y * height + Math.sin(particle.phase * 0.8) * dustFloatPixels;
        }
        x += shift.x * particle.depth * parallaxPixels;
        y += shift.y * particle.depth * parallaxPixels;
        if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;
        context.globalAlpha = alpha;
        const side = particle.size * 2 * dpr;
        context.fillRect(x * dpr - side / 2, y * dpr - side / 2, side, side);
      }

      if (visible && !reduced) frame = requestAnimationFrame(draw);
    };

    const start = () => {
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
    };
    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    if (!reduced) {
      host.addEventListener('pointermove', onPointerMove);
      host.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [colorVar, originX, originY, pattern, reduced, seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
