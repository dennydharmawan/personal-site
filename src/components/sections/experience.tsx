import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { experiences } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  Reveal,
  RevealGroup,
  RevealItem,
  instant,
  listGapClassName,
  pageShellClassName,
  revealEase,
  scrollToTargetName,
  sectionHeaderClassName,
  sectionPaddingClassName
} from '@/components/sections/shared';
import { cn } from '@/lib/utils';

type ExperienceItem = (typeof experiences)[number];

function ExperienceHeader() {
  return (
    <RevealGroup className={sectionHeaderClassName}>
      <RevealItem>
        <h2 className="text-4xl font-heading font-normal tracking-tight text-zinc-50 text-balance sm:text-5xl">
          Experience
        </h2>
      </RevealItem>
      <RevealItem className="flex flex-wrap items-baseline gap-x-6 gap-y-4">
        <p className="max-w-2xl text-base font-normal leading-7 text-zinc-300 text-pretty">
          ERP integrations, then digital lending backends, then a bank's system of record for who can access its internal apps.
        </p>
        <a
          className="-my-3 inline-flex items-center gap-1 py-3 text-sm font-medium text-sky-300 underline-offset-4 hover:underline rounded-sm"
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
        <li
          key={highlight.text}
          className="flex gap-3 text-[0.9375rem] font-normal leading-6 text-zinc-200"
          data-scroll-target={highlight.target}
        >
          <PlayBulletMarker />
          <span className="text-pretty">{highlight.text}</span>
        </li>
      ))}
    </ul>
  );
}

function ExperienceRole({ item }: { item: ExperienceItem }) {
  return (
    <RevealGroup className="grid gap-3">
      <RevealItem className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
        <p className="text-sm font-medium text-zinc-200">{item.company}</p>
        <p className="text-sm whitespace-nowrap tabular-nums text-zinc-300">{item.period}</p>
      </RevealItem>
      <RevealItem>
        <h3 className="font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-50 text-balance sm:text-3xl">
          {item.role}
        </h3>
      </RevealItem>
      {item.titles ? (
        <RevealItem>
          <ol aria-label={`Titles held at ${item.company}`} className="grid gap-1.5 border-l border-white/15 pl-4">
            {item.titles.map((title) => (
              <li key={title.role} className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
                <span className="text-zinc-200">{title.role}</span>
                <span className="whitespace-nowrap tabular-nums text-zinc-300">{title.period}</span>
              </li>
            ))}
          </ol>
        </RevealItem>
      ) : null}
      <RevealItem>
        <p className="max-w-[60ch] text-base leading-7 text-zinc-300 text-pretty">{item.summary}</p>
      </RevealItem>
      <RevealItem>
        <Highlights item={item} />
      </RevealItem>
    </RevealGroup>
  );
}

const roleTarget = (index: number) => `experience-role-${index}`;

// The role whose top sits in a band a third of the way down the viewport is the one being read.
function useRoleInView() {
  const rolesRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const roles = rolesRef.current ? [...rolesRef.current.children] : [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(roles.indexOf(entry.target));
          }
        }
      },
      { rootMargin: '-33% 0px -60% 0px' }
    );

    roles.forEach((role) => observer.observe(role));

    return () => observer.disconnect();
  }, []);

  return { active, rolesRef };
}

function RoleRail({ active }: { active: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol aria-label="Roles" className="grid gap-5">
      {experiences.map((item, index) => {
        const reached = index <= active;

        return (
          <li key={item.company} className="relative pl-6">
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-[0.45em] left-0 size-[7px] rounded-full transition-colors duration-300',
                reached ? 'bg-sky-400' : 'bg-zinc-600'
              )}
            />
            {index < experiences.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-[calc(0.45em+7px)] left-[3px] h-[calc(100%+1.25rem-7px)] w-px overflow-hidden bg-white/15"
              >
                <motion.span
                  className="block size-full origin-top bg-sky-400"
                  initial={false}
                  animate={{ scaleY: index < active ? 1 : 0 }}
                  transition={shouldReduceMotion ? instant : { duration: 0.45, ease: revealEase }}
                />
              </span>
            ) : null}
            <button
              type="button"
              aria-current={index === active ? 'step' : undefined}
              className="grid w-full gap-0.5 rounded-sm text-left text-sm"
              onClick={() => scrollToTargetName(roleTarget(index))}
            >
              <span
                className={cn(
                  'font-medium transition-colors duration-300',
                  index === active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {item.company}
              </span>
              <span className="tabular-nums text-zinc-500">{item.period}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ExperienceSection() {
  const { active, rolesRef } = useRoleInView();

  return (
    <section
      className={`bg-zinc-900 text-zinc-50 ${sectionPaddingClassName}`}
      data-scroll-target="experience"
    >
      <div
        className={`${pageShellClassName} grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16`}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ExperienceHeader />
          <Reveal className="hidden lg:block" delay={0.16}>
            <RoleRail active={active} />
          </Reveal>
        </div>
        <div ref={rolesRef} className="grid">
          {experiences.map((item, index) => (
            <div
              key={`${item.company}-${item.role}`}
              className="border-t border-white/15 py-8 first:border-t-0 first:pt-0 last:pb-0"
              data-scroll-target={roleTarget(index)}
            >
              <ExperienceRole item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
