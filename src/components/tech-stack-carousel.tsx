import { useEffect, useId, useRef, useState } from 'react';
import { Waypoints } from 'lucide-react';
import { motion } from 'motion/react';
import { SiApachekafka } from 'react-icons/si';
import { techStackIconSvgs } from '@/components/tech-stack-icon-svgs';
import { cn } from '@/lib/utils';

import type { TechStackIconId } from '@/components/tech-stack-icon-svgs';

type TechStackItem =
  | {
      icon: TechStackIconId;
      label: string;
      source: 'tech-stack-icons';
    }
  | {
      label: string;
      source: 'kafka' | 'bullmq';
    };

const productStack: TechStackItem[] = [
  { icon: 'js', label: 'JavaScript', source: 'tech-stack-icons' },
  { icon: 'typescript', label: 'TypeScript', source: 'tech-stack-icons' },
  { icon: 'react', label: 'React', source: 'tech-stack-icons' },
  { icon: 'nextjs', label: 'Next.js', source: 'tech-stack-icons' },
  { icon: 'nodejs', label: 'Node.js', source: 'tech-stack-icons' },
  { icon: 'expressjs', label: 'Express', source: 'tech-stack-icons' },
  { icon: 'graphql', label: 'GraphQL', source: 'tech-stack-icons' },
  { icon: 'reactquery', label: 'TanStack Query', source: 'tech-stack-icons' },
  { icon: 'zustand', label: 'Zustand', source: 'tech-stack-icons' },
  { icon: 'tailwindcss', label: 'Tailwind CSS', source: 'tech-stack-icons' },
  { icon: 'shadcnui', label: 'shadcn/ui', source: 'tech-stack-icons' },
  { icon: 'playwright', label: 'Playwright', source: 'tech-stack-icons' },
  { icon: 'vitest', label: 'Vitest', source: 'tech-stack-icons' }
];

const systemStack: TechStackItem[] = [
  { icon: 'postgresql', label: 'PostgreSQL', source: 'tech-stack-icons' },
  { icon: 'mysql', label: 'MySQL', source: 'tech-stack-icons' },
  { icon: 'mongodb', label: 'MongoDB', source: 'tech-stack-icons' },
  { icon: 'redis', label: 'Redis', source: 'tech-stack-icons' },
  { icon: 'drizzle', label: 'Drizzle ORM', source: 'tech-stack-icons' },
  { label: 'Kafka', source: 'kafka' },
  { label: 'BullMQ', source: 'bullmq' },
  { icon: 'docker', label: 'Docker', source: 'tech-stack-icons' },
  { icon: 'kubernetes', label: 'Kubernetes', source: 'tech-stack-icons' },
  { icon: 'aws', label: 'AWS', source: 'tech-stack-icons' },
  { icon: 'gcloud', label: 'GCP', source: 'tech-stack-icons' },
  { icon: 'datadog', label: 'Datadog', source: 'tech-stack-icons' },
  { icon: 'grafana', label: 'Grafana', source: 'tech-stack-icons' }
];

const tileWidth = 56;
const tileGap = 14;
const marqueeSpeedPxPerSecond = 24;

function prefixSvgIds(svg: string, prefix: string) {
  const ids = Array.from(svg.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const uniqueIds = [...new Set(ids)];
  let prefixedSvg = svg;

  for (const id of uniqueIds) {
    const prefixedId = `${prefix}-${id}`;

    prefixedSvg = prefixedSvg
      .replaceAll(`id="${id}"`, `id="${prefixedId}"`)
      .replaceAll(`url(#${id})`, `url(#${prefixedId})`)
      .replaceAll(`href="#${id}"`, `href="#${prefixedId}"`);
  }

  return prefixedSvg;
}

function StackTile({ item }: { item: TechStackItem }) {
  const svgId = useId();
  const svg =
    item.source === 'tech-stack-icons' ? prefixSvgIds(techStackIconSvgs[item.icon], svgId) : null;

  return (
    <figure
      aria-label={item.label}
      className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/65 bg-white/90 shadow-[0_10px_28px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm"
      role="img"
    >
      {svg ? (
        <span
          aria-hidden="true"
          className="size-8 [&>svg]:block [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : null}

      {item.source === 'kafka' ? (
        <SiApachekafka aria-hidden="true" className="size-7 text-slate-950" />
      ) : null}

      {item.source === 'bullmq' ? (
        <span aria-hidden="true" className="grid place-items-center gap-0.5 text-orange-700">
          <Waypoints className="size-5" strokeWidth={2.25} />
          <span className="text-[0.56rem] font-semibold leading-none">BullMQ</span>
        </span>
      ) : null}

      <figcaption className="sr-only">{item.label}</figcaption>
    </figure>
  );
}

function StackRow({
  direction,
  items,
  label,
  shouldReduceMotion
}: {
  direction: 'left' | 'right';
  items: TechStackItem[];
  label: string;
  shouldReduceMotion: boolean | null;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ pointerId: -1, scrollLeft: 0, x: 0 });
  const isNormalizingScrollRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const fallbackSequenceWidth = items.length * (tileWidth + tileGap);
  const [marqueeLayout, setMarqueeLayout] = useState({
    rowWidth: 0,
    sequenceWidth: fallbackSequenceWidth
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const row = rowRef.current;
    const sequence = sequenceRef.current;

    if (!row || !sequence) {
      return;
    }

    const updateLayout = () => {
      const nextRowWidth = row.clientWidth;
      const nextSequenceWidth = sequence.scrollWidth || fallbackSequenceWidth;

      setMarqueeLayout((currentLayout) => {
        if (
          currentLayout.rowWidth === nextRowWidth &&
          currentLayout.sequenceWidth === nextSequenceWidth
        ) {
          return currentLayout;
        }

        return {
          rowWidth: nextRowWidth,
          sequenceWidth: nextSequenceWidth
        };
      });
    };

    updateLayout();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(row);
    resizeObserver.observe(sequence);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fallbackSequenceWidth, shouldReduceMotion]);

  const marqueeDistance = marqueeLayout.sequenceWidth || fallbackSequenceWidth;
  const marqueeDuration = marqueeDistance / marqueeSpeedPxPerSecond;
  const sequenceCount = shouldReduceMotion
    ? 1
    : Math.max(4, Math.ceil(marqueeLayout.rowWidth / marqueeDistance) + 3);
  const normalizeScrollPosition = (row: HTMLDivElement) => {
    if (isNormalizingScrollRef.current || marqueeDistance <= 0) {
      return;
    }

    const normalizedScrollLeft = row.scrollLeft % marqueeDistance;

    if (Math.abs(row.scrollLeft - normalizedScrollLeft) < 1) {
      return;
    }

    isNormalizingScrollRef.current = true;
    row.scrollLeft = normalizedScrollLeft;

    window.requestAnimationFrame(() => {
      isNormalizingScrollRef.current = false;
    });
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    normalizeScrollPosition(event.currentTarget);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const row = rowRef.current;

    if (!row) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      scrollLeft: row.scrollLeft,
      x: event.clientX
    };

    row.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;

    if (!row || dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    row.scrollLeft = dragStateRef.current.scrollLeft - (event.clientX - dragStateRef.current.x);
    normalizeScrollPosition(row);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;

    if (!row || dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    row.releasePointerCapture(event.pointerId);
    dragStateRef.current.pointerId = -1;
    setIsDragging(false);
  };

  const leftFade =
    'bg-[linear-gradient(to_right,rgb(30_41_59)_0%,rgb(30_41_59)_36%,rgba(30,41,59,0.84)_56%,rgba(30,41,59,0.42)_78%,rgba(30,41,59,0)_100%)]';
  const rightFade =
    'bg-[linear-gradient(to_left,rgb(30_41_59)_0%,rgb(30_41_59)_36%,rgba(30,41,59,0.84)_56%,rgba(30,41,59,0.42)_78%,rgba(30,41,59,0)_100%)]';

  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 w-24 rounded-r-full sm:w-32',
          leftFade
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 w-24 rounded-l-full sm:w-32',
          rightFade
        )}
      />

      <div
        aria-label={label}
        className={cn(
          'flex w-full min-w-0 max-w-full gap-3 overflow-x-auto px-1 py-2 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        )}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onScroll={handleScroll}
        ref={rowRef}
        role="list"
        style={{ touchAction: 'pan-y' }}
        tabIndex={0}
      >
        <div
          className={cn(
            'flex w-max shrink-0',
            shouldReduceMotion
              ? ''
              : 'animate-[stack-marquee_var(--stack-marquee-duration)_linear_infinite]',
            isDragging ? '[animation-play-state:paused]' : ''
          )}
          style={
            {
              '--stack-marquee-distance': `${marqueeDistance}px`,
              '--stack-marquee-duration': `${marqueeDuration}s`,
              animationDirection: direction === 'right' ? 'reverse' : 'normal'
            } as React.CSSProperties
          }
        >
          {Array.from({ length: sequenceCount }, (_, sequenceIndex) => (
            <div
              aria-hidden={sequenceIndex > 0 ? 'true' : undefined}
              className="flex shrink-0 gap-3.5 pr-3.5"
              key={sequenceIndex}
              ref={sequenceIndex === 0 ? sequenceRef : undefined}
            >
              {items.map((item) => (
                <div
                  className="shrink-0"
                  key={`${sequenceIndex}-${item.label}`}
                  role={sequenceIndex === 0 ? 'listitem' : undefined}
                >
                  <StackTile item={item} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TechStackCarousel({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="grid w-full min-w-0 gap-8 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800 px-6 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.14)] sm:px-8 sm:py-8"
      initial={shouldReduceMotion ? false : { filter: 'blur(3px)', opacity: 0, y: 8 }}
      whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      viewport={{ amount: 0.35, once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid gap-3">
        <div className="grid gap-3">
          <p className="text-sm font-semibold leading-none text-white">
            Core Stack & System Tooling
          </p>
          <p className="max-w-xl text-sm font-normal leading-7 text-slate-300 text-pretty">
            JavaScript and TypeScript first, with production tooling across product UI, data,
            event-driven workflows, cloud, and reliability.
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl min-w-0 gap-4">
        <StackRow
          direction="left"
          items={productStack}
          label="Product UI and TypeScript stack"
          shouldReduceMotion={shouldReduceMotion}
        />
        <StackRow
          direction="right"
          items={systemStack}
          label="Data, platform, and reliability stack"
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </motion.div>
  );
}
