import type { CSSProperties } from 'react';

const meteorSeeds = [
  { delay: '0s', duration: '7.2s', left: '92%', opacity: '0.72', tail: '5.5rem', top: '-10%' },
  { delay: '0.35s', duration: '6.8s', left: '72%', opacity: '0.5', tail: '4.25rem', top: '-5%' },
  { delay: '0.7s', duration: '8.2s', left: '112%', opacity: '0.62', tail: '4.75rem', top: '4%' },
  { delay: '1.1s', duration: '7.7s', left: '82%', opacity: '0.44', tail: '3.75rem', top: '10%' },
  { delay: '1.45s', duration: '9s', left: '104%', opacity: '0.56', tail: '5rem', top: '18%' },
  { delay: '1.85s', duration: '6.9s', left: '64%', opacity: '0.38', tail: '3.5rem', top: '25%' },
  { delay: '2.25s', duration: '8.6s', left: '96%', opacity: '0.7', tail: '5.25rem', top: '32%' },
  { delay: '2.7s', duration: '7.4s', left: '118%', opacity: '0.46', tail: '4rem', top: '40%' },
  { delay: '3.05s', duration: '8.8s', left: '76%', opacity: '0.52', tail: '4.5rem', top: '48%' },
  { delay: '3.4s', duration: '7.1s', left: '108%', opacity: '0.4', tail: '3.75rem', top: '56%' },
  { delay: '3.8s', duration: '9.4s', left: '88%', opacity: '0.58', tail: '4.75rem', top: '64%' },
  { delay: '4.25s', duration: '7.9s', left: '120%', opacity: '0.34', tail: '3.5rem', top: '72%' },
  { delay: '4.65s', duration: '8.3s', left: '70%', opacity: '0.48', tail: '4.25rem', top: '80%' },
  { delay: '5.1s', duration: '6.7s', left: '100%', opacity: '0.42', tail: '3.75rem', top: '88%' },
  { delay: '5.45s', duration: '8.9s', left: '84%', opacity: '0.54', tail: '4.5rem', top: '96%' },
  { delay: '5.9s', duration: '7.6s', left: '114%', opacity: '0.36', tail: '3.5rem', top: '14%' },
  { delay: '6.25s', duration: '8.5s', left: '78%', opacity: '0.5', tail: '4rem', top: '37%' },
  { delay: '6.7s', duration: '7.3s', left: '106%', opacity: '0.4', tail: '3.75rem', top: '52%' },
  { delay: '7.05s', duration: '9.2s', left: '90%', opacity: '0.56', tail: '4.75rem', top: '68%' },
  { delay: '7.5s', duration: '8s', left: '122%', opacity: '0.32', tail: '3.5rem', top: '84%' }
];

interface MeteorsProps {
  className?: string;
  number?: number;
}

function Meteors({ className = '', number = 12 }: MeteorsProps) {
  const visibleMeteors = Array.from({ length: Math.max(number, 0) }, (_, index) => ({
    ...meteorSeeds[index % meteorSeeds.length],
    index
  }));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {visibleMeteors.map((meteor) => (
        <span
          key={`${meteor.left}-${meteor.top}-${meteor.index}`}
          className="absolute size-0.5 rounded-full bg-brand-200 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_18px_var(--color-brand-300)] before:absolute before:left-0 before:top-1/2 before:h-px before:w-[var(--meteor-tail)] before:-translate-y-1/2 before:bg-gradient-to-r before:from-brand-200 before:via-brand-400/70 before:to-transparent before:content-[''] motion-reduce:hidden"
          style={
            {
              '--meteor-opacity': meteor.opacity,
              '--meteor-tail': meteor.tail,
              animation: `meteor-effect ${meteor.duration} linear ${meteor.delay} infinite`,
              left: meteor.left,
              top: meteor.top
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export { Meteors };
