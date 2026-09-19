import { ArrowUpRight } from 'lucide-react';
import { experiences } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  RevealGroup,
  RevealItem,
  listGapClassName,
  pageShellClassName,
  sectionHeaderClassName,
  sectionPaddingClassName
} from '@/components/sections/shared';

type ExperienceItem = (typeof experiences)[number];

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

export function ExperienceSection() {
  return (
    <section
      className={`bg-zinc-700 text-zinc-50 ${sectionPaddingClassName}`}
      data-scroll-target="experience"
    >
      <div
        className={`${pageShellClassName} grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16`}
      >
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
    </section>
  );
}
