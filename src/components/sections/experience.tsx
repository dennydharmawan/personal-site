import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { experiences } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  Reveal,
  RevealGroup,
  RevealItem,
  focusTargetName,
  instant,
  listGapClassName,
  pageShellClassName,
  readingBandTop,
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
          I started in ERP consulting, moved into backend engineering on digital lending at Jenius, and now build full-stack systems at Krom Bank.
        </p>
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
          data-scroll-landing="reading-band"
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
      {item.titles && item.titles.length > 1 ? (
        <RevealItem>
          {/* The h3 already names the current title, so only earlier titles are listed. */}
          <ol aria-label={`Earlier titles at ${item.company}`} className="grid gap-1.5 border-l border-white/15 pl-4">
            {item.titles.slice(1).map((title) => (
              <li key={title.role} className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
                <span className="text-zinc-200">Previously {title.role}</span>
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

// The role crossing a band a third of the way down the viewport is the one being read.
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
      { rootMargin: `-${readingBandTop * 100}% 0px -60% 0px` }
    );

    roles.forEach((role) => observer.observe(role));

    return () => observer.disconnect();
  }, []);

  return { active, rolesRef };
}

// Dot centers measured from the top of the rail, so the line and the marker can target the same y.
function useDotCenters() {
  const railRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState<number[]>([]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => {
      const top = rail.getBoundingClientRect().top;
      setCenters(
        [...rail.querySelectorAll('[data-rail-dot]')].map((dot) => {
          const box = dot.getBoundingClientRect();
          return box.top - top + box.height / 2;
        })
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);

    return () => observer.disconnect();
  }, []);

  return { centers, railRef };
}

function RoleRail({ active }: { active: number }) {
  const shouldReduceMotion = useReducedMotion();
  const { centers, railRef } = useDotCenters();
  const transition = shouldReduceMotion ? instant : { duration: 0.45, ease: revealEase };
  const first = centers[0] ?? 0;
  const length = (centers.at(-1) ?? 0) - first;
  const target = centers[active] ?? first;

  return (
    <div ref={railRef} className="relative">
      {/* One track for every role, so a scroll that skips a role still fills the line in one stroke.
          The fill and the marker share a target and a transition, which keeps the marker on the head of the line. */}
      {length > 0 ? (
        <>
          <span
            aria-hidden="true"
            className="absolute left-[3px] w-px overflow-hidden bg-white/15"
            style={{ top: first, height: length }}
          >
            <motion.span
              className="block size-full origin-top bg-sky-400"
              initial={false}
              animate={{ transform: `scaleY(${(target - first) / length})` }}
              transition={transition}
            />
          </span>
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-[-5px] z-10 size-[17px] rounded-full ring-1 ring-sky-400/70 shadow-[0_0_10px_--alpha(var(--color-sky-400)/35%)]"
            initial={false}
            animate={{ transform: `translateY(${target - 8.5}px)` }}
            transition={transition}
          />
        </>
      ) : null}
      <ol aria-label="Roles" className="relative grid gap-5">
        {experiences.map((item, index) => {
          const reached = index <= active;

          return (
            <li key={item.company} className="relative pl-6">
              <span
                aria-hidden="true"
                data-rail-dot
                className={cn(
                  'absolute top-[0.45em] left-0 size-[7px] rounded-full transition-colors duration-300',
                  // The delay lets the marker land before the dot lights, so the color reads as its arrival.
                  reached ? 'bg-sky-400 delay-150' : 'bg-zinc-500'
                )}
              />
              <button
                type="button"
                aria-current={index === active ? 'step' : undefined}
                className="group grid w-full gap-0.5 rounded-sm text-left text-sm [--focus-offset:4px]"
                onClick={() => {
                  scrollToTargetName(roleTarget(index));
                  focusTargetName(roleTarget(index));
                }}
              >
                <span
                  className={cn(
                    'font-medium transition-colors duration-300',
                    index === active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                  )}
                >
                  {item.company}
                </span>
                <span className="tabular-nums text-zinc-400">{item.period}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ExperienceSection() {
  const { active, rolesRef } = useRoleInView();

  return (
    <section
      // A soft light from the top left under a fine print grain, so the dark fill is not flat. Both are
      // background layers, blended at paint, so the section needs no extra compositor layer.
      className={`bg-zinc-800 bg-[image:url(/grain.webp),radial-gradient(90%_55rem_at_15%_0%,--alpha(var(--color-zinc-600)/25%),transparent)] bg-[size:128px,auto] [background-blend-mode:soft-light,normal] text-zinc-50 ${sectionPaddingClassName}`}
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
