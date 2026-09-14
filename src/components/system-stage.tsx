import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { ArrowRight } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { stageLayers, type StageLayerId } from '@/components/system-stage-data';
import { cn } from '@/lib/utils';

export type SystemStageProps = {
  className?: string;
  onLayerSelect?: (id: StageLayerId) => void;
};

const stageDescription =
  'Card payment flow: a merchant app posts to the payment API, which checks idempotency and risk before authorizing with the bank, then a queue and settlement worker record the payment in the ledger and send a webhook back to the merchant.';

// Rendered from clips/src/hero at 2× the viewBox the diagram was designed in: 1000×440 for
// wide screens, 360×760 as a single column below `sm`.
const stageMedia = {
  narrow: {
    poster: '/portfolio-previews/hero-topology-narrow.png',
    video: '/portfolio-previews/motion/hero-topology-narrow.mp4'
  },
  wide: {
    poster: '/portfolio-previews/hero-topology-wide.png',
    video: '/portfolio-previews/motion/hero-topology-wide.mp4'
  }
} as const;

const stageMediaClassName = 'block w-full aspect-[360/760] bg-white sm:aspect-[1000/440]';

function StageMedia({ playing }: { playing: boolean }): JSX.Element {
  const reduced = useReducedMotion() === true;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWide, setIsWide] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 640px)');
    const sync = () => setIsWide(query.matches);

    sync();
    query.addEventListener('change', sync);

    return () => query.removeEventListener('change', sync);
  }, []);

  const source = isWide ? stageMedia.wide : stageMedia.narrow;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (playing) {
      // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, source]);

  if (reduced) {
    return (
      <img
        alt={stageDescription}
        className={stageMediaClassName}
        decoding="async"
        src={source.poster}
      />
    );
  }

  return (
    <video
      aria-label={stageDescription}
      className={stageMediaClassName}
      key={source.video}
      loop
      muted
      playsInline
      poster={source.poster}
      preload="none"
      ref={videoRef}
      src={source.video}
    />
  );
}

export function SystemStage({ className, onLayerSelect }: SystemStageProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { amount: 0.3 });

  return (
    <div className={cn('relative', className)} ref={cardRef}>
      <div className="grid overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/5 lg:grid-cols-[1fr_15rem]">
        <div className="grid content-start gap-3 px-5 py-6 sm:px-7 sm:py-7">
          <StageMedia playing={inView} />

          <p className="text-[0.6875rem] leading-tight text-slate-500">
            Card payment, from checkout to ledger
          </p>
        </div>

        <ul className="relative flex flex-col gap-1 border-t border-slate-200/80 px-5 pb-4 pt-4 lg:justify-center lg:gap-1.5 lg:border-l lg:border-t-0 lg:px-0 lg:pb-0 lg:pl-5 lg:pr-5 lg:pt-0">
          {stageLayers.map((layer) => (
            <li key={layer.id}>
              <button
                className="group flex w-full items-start gap-2.5 rounded-lg px-1 py-1 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                onClick={() => onLayerSelect?.(layer.id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.3rem] size-1.5 shrink-0 rounded-full bg-slate-400 transition-colors duration-300 group-focus-visible:bg-teal-600 group-hover:bg-teal-600"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-semibold leading-snug text-slate-900">
                    {layer.label}
                  </span>
                  <span className="block text-[0.6875rem] font-medium leading-snug text-slate-500">
                    {layer.caption}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-[0.15rem] size-3.5 shrink-0 text-teal-600 opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
