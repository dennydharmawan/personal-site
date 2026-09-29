import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

const spacing = 24;
const dotSize = 2;
const baseAlpha = 0.3;
const waveAlpha = 0.7;
// Two slow waves at different angles and speeds, so the bright band never repeats the same shape.
const waves = [
  { angle: 0.6, length: 520, speed: 0.07 },
  { angle: 2.1, length: 340, speed: -0.045 }
];

// A fixed grid of dots whose brightness rolls across it in soft bands. Under reduced motion the
// grid draws once, at its starting frame.
export function DotGrid({ className, colorVar = '--color-zinc-400' }: { className?: string; colorVar?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let color = '';
    let frame = 0;
    let visible = false;
    let clock = 0;
    let last = 0;

    const paint = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;
      const size = dotSize * dpr;
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          let light = 0;
          for (const { angle, length, speed } of waves) {
            const along = x * Math.cos(angle) + y * Math.sin(angle);
            light += Math.sin((along / length) * Math.PI * 2 + clock * speed * Math.PI * 2);
          }
          const band = Math.max(0, light / waves.length);
          context.globalAlpha = baseAlpha + waveAlpha * band * band;
          context.fillRect(Math.round(x * dpr - size / 2), Math.round(y * dpr - size / 2), size, size);
        }
      }
    };

    const tick = (now: number) => {
      clock += last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      color = getComputedStyle(canvas).getPropertyValue(colorVar).trim();
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced || !visible) paint();
      else frame = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [colorVar, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
