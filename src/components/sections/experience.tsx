import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'motion/react';
import { experiences } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  RevealGroup,
  RevealItem,
  listGapClassName,
  pageShellClassName,
  sectionHeaderClassName,
  sectionPaddingClassName,
  spring
} from '@/components/sections/shared';

type ExperienceItem = (typeof experiences)[number];
type ExperienceVariant = 'current' | 'ledger' | 'sticky';

function TimelineEntry({
  item,
  isLast
}: {
  item: ExperienceItem;
  isLast: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isActive = useInView(ref, { amount: 0.4, margin: '0px 0px -20% 0px' });
  const shouldReduceMotion = useReducedMotion();
  const isCurrent = 'current' in item && item.current;

  return (
    <li ref={ref} className={`relative grid gap-x-8 pl-10 sm:pl-14 lg:grid-cols-[11rem_minmax(0,1fr)] lg:pl-0 ${isLast ? '' : 'pb-14 lg:pb-16'}`}>
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-0 flex size-5 items-center justify-center lg:left-[11rem] lg:-translate-x-1/2"
      >
        {isCurrent && !shouldReduceMotion ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/40" />
        ) : null}
        <span
          className={`relative size-2.5 rounded-full ring-4 ring-zinc-700 transition-colors duration-500 ${
            isActive ? 'bg-sky-400' : 'bg-zinc-400'
          }`}
        />
      </span>

      <RevealItem className="mb-3 grid content-start gap-1 lg:mb-0 lg:pr-10 lg:text-right">
        <p className="text-sm whitespace-nowrap tabular-nums text-zinc-300">{item.period}</p>
        {isCurrent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200 lg:justify-self-end">
            Current
          </span>
        ) : null}
      </RevealItem>

      <div className="grid content-start gap-3 lg:pl-10">
        <RevealItem className="grid gap-1">
          <p className="text-sm font-medium text-zinc-200">{item.company}</p>
          <h3 className="text-2xl font-heading font-normal leading-tight tracking-tight text-zinc-50 text-balance sm:text-3xl">
            {item.role}
          </h3>
        </RevealItem>
        <RevealItem>
          <p className="max-w-[60ch] text-base leading-7 text-zinc-300 text-pretty">{item.summary}</p>
        </RevealItem>
        <RevealItem>
          <ul className={`grid max-w-[60ch] ${listGapClassName}`}>
            {item.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-3 text-[0.9375rem] font-normal leading-6 text-zinc-200"
              >
                <PlayBulletMarker />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </RevealItem>
      </div>
    </li>
  );
}

function ExperienceHeader() {
  return (
    <RevealGroup className={sectionHeaderClassName}>
      <RevealItem>
        <h2 className="text-4xl font-heading font-normal tracking-tight text-zinc-50 text-balance sm:text-5xl">
          Experience
        </h2>
      </RevealItem>
      <RevealItem className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <p className="max-w-2xl text-base font-normal leading-7 text-zinc-300 text-pretty">
          ERP consulting, then lending backends, then bank platform engineering.
        </p>
        <a
          className="-my-3 inline-flex items-center gap-1 py-3 text-sm font-medium text-sky-300 underline-offset-4 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-700"
          href="/resume.pdf"
          rel="noopener"
          target="_blank"
        >
          Full detail in resume
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </RevealItem>
    </RevealGroup>
  );
}

function Highlights({ item }: { item: ExperienceItem }) {
  return (
    <ul className={`grid max-w-[60ch] ${listGapClassName}`}>
      {item.highlights.map((highlight) => (
        <li key={highlight} className="flex gap-3 text-[0.9375rem] font-normal leading-6 text-zinc-200">
          <PlayBulletMarker />
          <span>{highlight}</span>
        </li>
      ))}
    </ul>
  );
}

function ExperienceTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset: ['start 70%', 'end 70%'],
    target: listRef
  });
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, restDelta: 0.001, stiffness: 120 });
  const scaleY = useTransform(shouldReduceMotion ? scrollYProgress : smoothProgress, [0, 1], [0, 1]);

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[9px] w-px bg-white/15 lg:left-[11rem] lg:-translate-x-1/2"
      />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[9px] w-px origin-top bg-sky-400 lg:left-[11rem] lg:-translate-x-1/2"
        style={{ scaleY }}
      />
      <ol ref={listRef} className="grid">
        {experiences.map((item, index) => (
          <RevealGroup key={`${item.company}-${item.role}`}>
            <TimelineEntry isLast={index === experiences.length - 1} item={item} />
          </RevealGroup>
        ))}
      </ol>
    </div>
  );
}

function ExperienceLedger() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <RevealGroup className="grid border-t border-white/15">
      {experiences.map((item, index) => {
        const isOpen = index === openIndex;
        const panelId = `experience-panel-${index}`;

        return (
          <RevealItem key={`${item.company}-${item.role}`} className="border-b border-white/15">
            <h3>
              <button
                type="button"
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-6 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_11rem_1.5rem]"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-sm font-medium text-zinc-200">{item.company}</span>
                <span className="col-span-2 row-start-2 font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-50 sm:text-3xl lg:col-span-1 lg:row-start-auto">
                  {item.role}
                </span>
                <span className="row-start-3 text-sm whitespace-nowrap tabular-nums text-zinc-300 lg:row-start-auto lg:text-right">
                  {item.period}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`col-start-2 row-start-1 size-4 justify-self-end text-zinc-300 transition-transform lg:col-start-4 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : spring}
                >
                  <div className="grid gap-4 pb-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_12.5rem] lg:gap-x-6">
                    <div className="grid gap-4 lg:col-start-2">
                      <p className="max-w-[60ch] text-base leading-7 text-zinc-300 text-pretty">
                        {item.summary}
                      </p>
                      <Highlights item={item} />
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

function ExperienceRole({ item }: { item: ExperienceItem }) {
  return (
    <RevealGroup className="grid gap-3 border-t border-white/15 py-8 first:border-t-0 first:pt-0">
      <RevealItem className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm font-medium text-zinc-200">{item.company}</p>
        <p className="text-sm whitespace-nowrap tabular-nums text-zinc-300">{item.period}</p>
      </RevealItem>
      <RevealItem>
        <h3 className="font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-50 text-balance sm:text-3xl">
          {item.role}
        </h3>
      </RevealItem>
      <RevealItem>
        <p className="max-w-[60ch] text-base leading-7 text-zinc-300 text-pretty">{item.summary}</p>
      </RevealItem>
      <RevealItem>
        <Highlights item={item} />
      </RevealItem>
    </RevealGroup>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <section
      className={`bg-zinc-700 text-zinc-50 ${sectionPaddingClassName}`}
      data-scroll-target="experience"
    >
      <div className={pageShellClassName}>{children}</div>
    </section>
  );
}

export function ExperienceSection({ variant = 'current' }: { variant?: ExperienceVariant }) {
  if (variant === 'sticky') {
    return (
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ExperienceHeader />
            <ol className="hidden gap-3 lg:grid">
              {experiences.map((item) => (
                <li key={item.company} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-medium text-zinc-200">{item.company}</span>
                  <span className="whitespace-nowrap tabular-nums text-zinc-400">{item.period}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid">
            {experiences.map((item) => (
              <ExperienceRole key={`${item.company}-${item.role}`} item={item} />
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <ExperienceHeader />
      {variant === 'ledger' ? <ExperienceLedger /> : <ExperienceTimeline />}
    </SectionShell>
  );
}
