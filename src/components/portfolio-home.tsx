import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Download, Mail } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LuGithub, LuInstagram, LuLinkedin } from 'react-icons/lu';
import {
  aboutSystemsImage,
  capabilityTiles,
  experiences,
  expertiseItems,
  projects,
  trustedTeams
} from '@/components/portfolio-home-data';
import { portfolioMarqueeImages } from '@/components/portfolio-marquee-images';
import { ThreeDMarquee } from '@/components/ui/3d-marquee';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Work Samples', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' }
];

const footerNavItems = [
  { label: 'Home', target: 'top' },
  { label: 'Work Samples', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' }
];

const footerSocialLinks = [
  {
    href: 'https://www.linkedin.com/in/ddharmawan',
    icon: LuLinkedin,
    label: 'LinkedIn'
  },
  {
    href: 'https://www.instagram.com/naiklevel.dev/',
    icon: LuInstagram,
    label: 'Instagram'
  },
  {
    href: 'https://github.com/dennydharmawan',
    icon: LuGithub,
    label: 'GitHub'
  }
];

const trustedLogoToneClassName = 'grayscale opacity-[0.72] contrast-100';

const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
const easeOut = [0.2, 0, 0, 1] as const;
const anchorScrollOffset = 76;
const careerStart = { monthIndex: 11, year: 2017 };
const contactEmail = 'contact@dennydharmawan.com';

function getYearsExperience(date = new Date()) {
  const completedYears = date.getFullYear() - careerStart.year;
  return date.getMonth() >= careerStart.monthIndex ? completedYears : completedYears - 1;
}

function initialValue<T>(shouldReduceMotion: boolean | null, value: T) {
  return shouldReduceMotion ? false : value;
}

function scrollToTarget(
  event: MouseEvent<HTMLElement>,
  targetName: string,
  shouldReduceMotion: boolean | null
) {
  const target = document.querySelector<HTMLElement>(`[data-scroll-target="${targetName}"]`);

  if (!target) {
    return;
  }

  event.preventDefault();

  const targetTop =
    targetName === 'top'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - anchorScrollOffset;

  window.scrollTo({
    behavior: shouldReduceMotion ? 'auto' : 'smooth',
    top: Math.max(targetTop, 0)
  });
}

function EmailActionMenu({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);
  let copyLabel = 'Copy email';

  if (copyState === 'copied') {
    copyLabel = 'Copied';
  } else if (copyState === 'failed') {
    copyLabel = 'Copy failed';
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const { target } = event;

      if (target instanceof Node && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  return (
    <div ref={menuRef} className="relative w-fit max-w-full">
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-11 max-w-full gap-2 rounded-lg border-slate-200 bg-white px-4 text-slate-950 shadow-none transition-colors hover:border-brand-200 hover:bg-slate-50 hover:text-brand-600"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{contactEmail}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="menu"
            className="absolute left-0 top-[calc(100%+0.5rem)] z-20 grid w-full min-w-64 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium text-slate-700 shadow-lg shadow-slate-950/10"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: easeOut }}
          >
            <button
              type="button"
              role="menuitem"
              className="rounded-md px-3 py-2.5 text-left transition-colors hover:bg-slate-50 hover:text-brand-600 focus-visible:bg-slate-50 focus-visible:text-brand-600 focus-visible:outline-none"
              onClick={copyEmail}
            >
              {copyLabel}
            </button>
            <a
              role="menuitem"
              className="rounded-md px-3 py-2.5 transition-colors hover:bg-slate-50 hover:text-brand-600 focus-visible:bg-slate-50 focus-visible:text-brand-600 focus-visible:outline-none"
              href={`mailto:${contactEmail}`}
              onClick={() => setIsOpen(false)}
            >
              Send email
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HeroPreviewBand({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      initial={shouldReduceMotion ? false : { filter: 'blur(4px)', opacity: 0, y: 16 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.48, ease: easeOut }}
    >
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/portfolio-previews/team-gaze-hero-final-curiosity-mobile-crop.png"
        />
        <source
          media="(min-width: 1024px)"
          srcSet="/portfolio-previews/team-gaze-hero-final-curiosity-pc-crop.png"
        />
        <img
          src="/portfolio-previews/team-gaze-hero-final-spec-source.png"
          alt="Team collaborating around a laptop with attention directed toward the next action"
          className="block h-[12.5rem] w-full object-cover object-[50%_22%] sm:h-[17rem] lg:h-[18rem]"
          decoding="async"
        />
      </picture>
    </motion.div>
  );
}

function HeroProofBlock({ yearsExperience }: { yearsExperience: number }) {
  return (
    <div className="grid gap-6 pt-2 min-[520px]:grid-cols-[minmax(0,1fr)_minmax(8.5rem,0.36fr)] min-[520px]:items-end lg:gap-8">
      <div className="grid gap-3">
        <p className="max-w-md text-sm font-medium leading-6 text-slate-700 text-pretty">
          Trusted by teams at Indonesia&apos;s leading digital banks
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {trustedTeams.map((team) => (
            <span key={team.name} className="inline-flex h-10 min-w-24 items-center justify-start">
              <img
                src={team.logo}
                alt={`${team.name} logo`}
                className={`${team.logoClassName} ${trustedLogoToneClassName} w-auto object-contain`}
                decoding="async"
              />
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-5xl font-semibold leading-none text-slate-700 tabular-nums">
          {yearsExperience}+
        </p>
        <p className="text-sm font-medium leading-5 text-slate-600 text-pretty">
          years of experience
        </p>
      </div>
    </div>
  );
}

function AnimatedHeader() {
  const shouldReduceMotion = useReducedMotion();
  const [isNavCompact, setIsNavCompact] = useState(false);
  const [hoveredNavHref, setHoveredNavHref] = useState<string | null>(null);

  useEffect(() => {
    const updateCompactState = () => setIsNavCompact(window.scrollY > 28);

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, { passive: true });

    return () => window.removeEventListener('scroll', updateCompactState);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <motion.div
        className="pointer-events-auto border-b backdrop-blur"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{
          backgroundColor: isNavCompact ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0)',
          borderColor: isNavCompact ? 'rgba(226,232,240,0.9)' : 'rgba(226,232,240,0)',
          opacity: 1
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                backgroundColor: { duration: 0.28, ease: easeOut },
                borderColor: { duration: 0.28, ease: easeOut },
                opacity: { duration: 0.36, ease: easeOut }
              }
        }
      >
        <motion.div
          className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 px-0 md:px-0"
          initial={shouldReduceMotion ? false : { filter: 'blur(3px)', y: -8 }}
          animate={{ filter: 'blur(0px)', height: isNavCompact ? 56 : 72, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  filter: { delay: 0.04, duration: 0.32, ease: easeOut },
                  height: { duration: 0.28, ease: easeOut },
                  y: { delay: 0.04, duration: 0.32, ease: easeOut }
                }
          }
        >
          <motion.a
            className="inline-flex min-h-10 items-center whitespace-nowrap text-slate-950 transition-colors hover:text-brand-700"
            href="/"
            aria-label="Denny Dharmawan home"
            onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.08, ...spring }}
          >
            <img
              aria-hidden="true"
              src="/logo-mark.svg"
              alt=""
              className="mr-2 size-8 shrink-0"
              decoding="async"
            />
            <span className="grid gap-px leading-none">
              <span className="text-base font-semibold">Denny Dharmawan</span>
              <span className="text-xs font-medium text-slate-500">Full-Stack Engineer</span>
            </span>
          </motion.a>
          <motion.nav
            className="flex items-center justify-end gap-1.5"
            aria-label="Main navigation"
            onMouseLeave={() => setHoveredNavHref(null)}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.14, ...spring }}
          >
            {navItems.map((item, index) => (
              <motion.button
                key={item.target}
                type="button"
                className="relative hidden min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:text-slate-950 focus-visible:text-slate-950 sm:inline-flex"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                onBlur={() => setHoveredNavHref(null)}
                onFocus={() => setHoveredNavHref(item.target)}
                onClick={(event) => scrollToTarget(event, item.target, shouldReduceMotion)}
                onMouseEnter={() => setHoveredNavHref(item.target)}
                transition={
                  shouldReduceMotion ? { duration: 0 } : { delay: 0.18 + index * 0.04, ...spring }
                }
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {hoveredNavHref === item.target ? (
                    <motion.span
                      layoutId="nav-hover-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-slate-100/90 shadow-sm ring-1 ring-slate-300/70"
                      initial={
                        shouldReduceMotion
                          ? false
                          : { filter: 'blur(4px)', opacity: 0, scale: 0.96 }
                      }
                      animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
                      exit={{ filter: 'blur(3px)', opacity: 0, scale: 0.98 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              ...spring,
                              duration: 0.38,
                              filter: { duration: 0.3, ease: easeOut },
                              opacity: { duration: 0.3, ease: easeOut }
                            }
                      }
                    />
                  ) : null}
                </AnimatePresence>
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: 0.18 + navItems.length * 0.04, ...spring }
              }
            >
              <Button asChild variant="outline" size="sm" className="ml-1 min-h-10 px-4">
                <a
                  href="mailto:contact@dennydharmawan.com"
                  aria-label="Email contact@dennydharmawan.com"
                >
                  <span className="lg:hidden">Email</span>
                  <span className="hidden lg:inline">contact@dennydharmawan.com</span>
                </a>
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      </motion.div>
    </header>
  );
}

function usePreventHashNavigation() {
  useEffect(() => {
    const resetHashNavigation = () => {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        );
        window.scrollTo({ behavior: 'auto', left: 0, top: 0 });
        window.setTimeout(() => window.scrollTo({ behavior: 'auto', left: 0, top: 0 }), 0);
      }
    };

    resetHashNavigation();
    window.addEventListener('hashchange', resetHashNavigation);

    return () => window.removeEventListener('hashchange', resetHashNavigation);
  }, []);
}

function WorkSamplesSection({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section className="bg-slate-50 py-14 md:py-20" data-scroll-target="work">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
        <motion.div
          className="mx-auto mb-12 grid max-w-3xl justify-items-center gap-4 text-center md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4, once: true }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <h2 className="text-3xl font-semibold leading-[1.08] text-slate-950 text-balance sm:text-4xl lg:text-[2.75rem]">
            Selected Work Samples
          </h2>
          <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
            My work for enterprise companies is protected under strict NDAs. The prototypes and side
            projects below demonstrate how I approach problem-solving and apply my skills without
            exposing proprietary systems.
          </p>
        </motion.div>

        <div className="grid gap-16 md:gap-20">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.25, once: true }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: easeOut }}
            >
              <motion.div className={`grid gap-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="grid gap-3">
                  <p className="text-sm font-medium text-slate-500">{project.role}</p>
                  <h3 className="max-w-xl text-3xl font-semibold leading-tight text-slate-900 text-balance transition-colors group-hover:text-slate-700 sm:text-4xl">
                    {project.title}
                  </h3>
                  <p className="max-w-xl text-base font-normal leading-7 text-slate-600 text-pretty">
                    {project.summary}
                  </p>
                </div>
                <ul className="grid gap-3">
                  {project.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="group/bullet flex gap-3 text-sm font-normal leading-6 text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600 transition-transform duration-200 group-hover/bullet:scale-110" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
                  {project.stack.map((tech, stackIndex) => (
                    <span key={tech} className="inline-flex items-center gap-2">
                      {stackIndex > 0 ? (
                        <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
                      ) : null}
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={`relative min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm outline outline-1 outline-black/10 transition-[border-color,box-shadow] duration-300 hover:border-brand-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={spring}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-100/70 to-transparent" />
                <img
                  src={project.preview}
                  alt={`${project.title} interface preview`}
                  className="relative aspect-[1.45/1] min-h-[18rem] w-full rounded-xl object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  aria-label="Under development"
                  className="pointer-events-none absolute left-6 top-6 z-10 inline-flex rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm backdrop-blur"
                >
                  Under development
                </div>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-10 lg:grid-cols-[minmax(0,0.74fr)_minmax(34rem,1fr)] lg:items-start lg:gap-16">
        <motion.div
          className="grid max-w-xl content-start gap-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.35, once: true }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <h2 className="text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl">
            Expertise
          </h2>
          <div className="grid gap-5">
            {expertiseItems.map((item) => (
              <div
                key={item.title}
                className="grid gap-2 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0"
              >
                <h3 className="text-base font-semibold leading-6 text-slate-950">{item.title}</h3>
                <p className="text-base font-normal leading-7 text-slate-700 text-pretty">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-3 sm:min-h-[32rem] sm:grid-cols-2 sm:grid-rows-2 lg:self-end lg:gap-4">
          {capabilityTiles.map((tile, index) => (
            <motion.article
              key={tile.title}
              aria-hidden="true"
              className={`relative min-h-[15rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-full ${
                index === 0 ? 'sm:col-start-2 sm:row-start-1' : ''
              } ${index === 1 ? 'sm:col-start-1 sm:row-start-2' : ''} ${
                index === 2 ? 'sm:col-start-2 sm:row-start-2' : ''
              }`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.25, once: true }}
              transition={{ delay: index * 0.06, duration: 0.38, ease: easeOut }}
            >
              <img
                src={tile.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover object-center"
                loading="lazy"
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PortfolioHome() {
  const shouldReduceMotion = useReducedMotion();
  const yearsExperience = getYearsExperience();

  usePreventHashNavigation();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnimatedHeader />

      <main data-scroll-target="top">
        <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_52%,#f2f6ff_100%)] pb-10 pt-24 sm:pt-28 lg:pb-14">
          <motion.div
            className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8"
            initial={initialValue(shouldReduceMotion, {
              filter: 'blur(3px)',
              opacity: 0,
              y: 12
            })}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
          >
            <div className="grid gap-7">
              <h1 className="max-w-6xl text-[2.5rem] font-normal leading-[1.04] text-slate-950 sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5rem]">
                Building web solutions
                <span className="block pt-1 text-slate-400 sm:pt-2">that actually scale.</span>
              </h1>

              <HeroPreviewBand shouldReduceMotion={shouldReduceMotion} />
            </div>

            <div className="grid gap-7 pt-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] lg:items-end">
              <HeroProofBlock yearsExperience={yearsExperience} />

              <div className="grid gap-5 lg:justify-items-start">
                <p className="max-w-xl text-base font-normal leading-7 text-slate-700 text-pretty">
                  I'm a full-stack engineer with hands-on experience building{' '}
                  <span className="whitespace-nowrap">large-scale</span> financial systems, where
                  scalability, reliability, and maintainability are critical.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="group min-h-11 px-3 has-data-[icon=inline-end]:pr-3 sm:px-4 sm:has-data-[icon=inline-end]:pr-4"
                    onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                  >
                    View work samples
                    <ChevronDown data-icon="inline-end" className="size-4" />
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="min-h-11 px-3 sm:px-4">
                    <a href="/resume.pdf">
                      <Download data-icon="inline-start" />
                      Download resume
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <WorkSamplesSection shouldReduceMotion={shouldReduceMotion} />

        <section
          className="mx-auto w-[min(1200px,calc(100%-2rem))] py-16 md:py-20"
          data-scroll-target="experience"
        >
          <motion.div
            className="mb-14 grid max-w-3xl gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4, once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <h2 className="text-4xl font-semibold leading-tight text-slate-900 text-balance sm:text-5xl">
              Experience
            </h2>
            <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
              Experience across internal fintech platforms, digital lending services, ERP
              customization, APIs, integrations, access control, monitoring, technical
              documentation, and performance tuning.
            </p>
          </motion.div>

          <div className="relative">
            {experiences.map((item, index) => (
              <motion.article
                key={`${item.company}-${item.role}`}
                className="relative grid gap-5 border-t border-slate-200 py-9 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] lg:gap-10"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.35, once: true }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: easeOut }}
              >
                <div className="grid content-start gap-3 lg:justify-items-end lg:text-right">
                  <p
                    className={`text-base font-medium ${
                      item.current ? 'text-brand-600' : 'text-slate-600'
                    }`}
                  >
                    {item.period}
                  </p>
                  {item.current ? (
                    <span className="w-fit text-sm font-medium text-brand-700">Current</span>
                  ) : null}
                </div>

                <div>
                  <div className="grid gap-2">
                    <h3 className="text-2xl font-semibold leading-tight text-slate-900 text-balance">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-brand-600">{item.company}</p>
                    {'roleHistory' in item ? (
                      <div className="mt-2 grid gap-2">
                        {item.roleHistory.map((roleItem) => (
                          <div
                            key={`${item.company}-${roleItem.role}-${roleItem.period}`}
                            className="grid items-baseline gap-x-4 gap-y-1 text-sm leading-5 sm:grid-cols-[minmax(11rem,max-content)_auto]"
                          >
                            <span className="font-medium text-slate-800">{roleItem.role}</span>
                            <span className="text-slate-500">{roleItem.period}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <ul className="mt-5 grid gap-3">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm font-normal leading-6 text-slate-600"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <CapabilitiesSection shouldReduceMotion={shouldReduceMotion} />

        <section className="overflow-hidden bg-white py-16 md:py-20" data-scroll-target="about">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
            <motion.div
              className="relative grid min-h-[34rem] gap-10 lg:grid-cols-[minmax(0,0.52fr)_minmax(34rem,0.48fr)] lg:items-center lg:gap-12 xl:gap-16"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.35, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <div className="grid content-center gap-6 py-4 lg:min-h-[34rem]">
                <h2 className="max-w-xl text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl">
                  About me
                </h2>
                <div className="grid max-w-2xl gap-4 text-base font-normal leading-7 text-slate-700 text-pretty">
                  <p>
                    I care about writing good software, but I am equally focused on what that
                    software needs to do for the business. Engineering quality and delivery speed
                    are not opposites. Finding where they meet is usually the more interesting
                    problem.
                  </p>
                  <p>
                    I bring that same thinking to distributed systems and scalable architecture,
                    where most of my deeper curiosity lives. The web moves fast, and I take keeping
                    up with it seriously: understanding what is worth adopting, why, and how it
                    helps teams ship better software.
                  </p>
                </div>
              </div>

              <div className="relative mx-auto aspect-[16/9] w-full max-w-[40rem] overflow-hidden rounded-lg shadow-[0_22px_60px_rgba(15,23,42,0.12)] lg:mx-0 lg:max-w-[46rem] lg:justify-self-end">
                <img
                  src={aboutSystemsImage}
                  alt="Relaxed home workspace with a laptop, notebook, and tablet"
                  className="size-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-slate-50 pb-12 md:pb-16 lg:pb-20" data-scroll-target="contact">
          <motion.div
            className="mx-auto w-[min(1200px,calc(100%-2rem))]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.08, once: true }}
            transition={{ duration: 0.42, ease: easeOut }}
          >
            <div className="grid max-w-4xl gap-6 pb-10 pt-16 text-left md:pb-12 md:pt-20">
              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl">
                Say hi. See where it goes.
              </h2>

              <div className="grid max-w-2xl gap-6">
                <p className="text-base font-normal leading-7 text-slate-700 text-pretty">
                  I&apos;m open to new opportunities. Maybe you have something in mind, maybe
                  you&apos;re just browsing — either way, say hi. Could be the start of something
                  good.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 gap-2 px-4 has-data-[icon=inline-start]:pl-4"
                  >
                    <a href={`mailto:${contactEmail}`}>
                      <Mail data-icon="inline-start" className="size-4" />
                      Let&apos;s chat
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_54%_82%,rgba(14,165,233,0.18),transparent_34%)]" />
              <ThreeDMarquee
                className="relative h-[26rem] rounded-none sm:h-[32rem] lg:h-[36rem]"
                images={portfolioMarqueeImages}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent sm:w-36 lg:w-44" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent sm:w-36 lg:w-44" />
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-slate-200 bg-slate-50">
          <motion.div
            className="mx-auto w-[min(1200px,calc(100%-2rem))] py-14 md:py-16 lg:py-20"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.08, once: true }}
            transition={{ duration: 0.42, ease: easeOut }}
          >
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(12rem,0.22fr)] lg:items-start lg:gap-x-24">
              <div className="grid max-w-xl content-start gap-7">
                <div className="grid gap-4">
                  <h2 className="max-w-lg text-3xl font-semibold leading-tight text-slate-950 text-balance sm:text-4xl">
                    Thanks for looking around.
                  </h2>
                  <p className="max-w-lg text-base font-normal leading-7 text-slate-600 text-pretty">
                    Based in Jakarta. I build product software across frontend, backend, and
                    operations, with a bias for systems that stay clear to use and reliable in
                    production.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <EmailActionMenu shouldReduceMotion={shouldReduceMotion} />
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pt-1">
                  <p className="flex w-fit items-center gap-2 text-sm font-medium text-slate-600">
                    <span>Find me on</span>
                    <span
                      aria-hidden="true"
                      className="h-px w-9 shrink-0 rounded-full bg-brand-500/70"
                    />
                  </p>
                  <div className="flex items-center gap-1">
                    {footerSocialLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <a
                          key={item.href}
                          aria-label={item.label}
                          className="group/social relative inline-flex size-9 items-center justify-center overflow-hidden rounded-md text-slate-500 transition-[color,scale] duration-300 ease-out hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-200 active:scale-[0.96] motion-reduce:transition-none"
                          href={item.href}
                          rel="noopener noreferrer"
                          target="_blank"
                          title={item.label}
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-0.5 scale-[0.18] rounded-md bg-slate-950 opacity-0 transition-[opacity,scale] duration-300 ease-out group-hover/social:scale-100 group-hover/social:opacity-100 group-focus-visible/social:scale-100 group-focus-visible/social:opacity-100 motion-reduce:transition-none"
                          />
                          <Icon
                            aria-hidden="true"
                            className="relative z-10 size-5 transition-[color,scale] duration-300 ease-out group-hover/social:scale-110 group-focus-visible/social:scale-110 motion-reduce:transition-none"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <nav className="grid content-start gap-1.5 text-sm font-medium text-slate-600 lg:justify-self-start">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950">
                  Navigate
                </p>
                {footerNavItems.map((item) => (
                  <button
                    key={item.target}
                    type="button"
                    className="inline-flex min-h-9 w-fit items-center text-left transition-colors hover:text-brand-600"
                    onClick={(event) => scrollToTarget(event, item.target, shouldReduceMotion)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-5 text-sm font-normal text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Denny Dharmawan. All rights reserved.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group/back min-h-10 gap-2 rounded-lg border-slate-200 bg-white px-3 text-slate-950 shadow-none transition-colors hover:border-brand-200 hover:bg-slate-50 hover:text-brand-600"
                    onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
                  >
                    <span
                      aria-hidden="true"
                      className="relative inline-flex size-6 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-300 group-hover/back:border-brand-600"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 scale-0 rounded-full bg-brand-600 transition-transform duration-300 ease-out group-hover/back:scale-100"
                      />
                      <ChevronUp className="relative z-10 size-3.5 transition-colors duration-300 group-hover/back:text-white" />
                    </span>
                    <span>Back to top</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
}
