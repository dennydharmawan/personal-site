import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Download,
  Mail
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  stagger,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { LuGithub, LuInstagram, LuLinkedin } from 'react-icons/lu';
import {
  CapabilityInstrument,
  StackGrid
} from '@/components/capability-instruments';
import { DotField } from '@/components/dot-field';
import { type DustFormation, ParticleStream } from '@/components/particle-stream';
import {
  aboutSystemsImage,
  experiences,
  expertiseItems,
  projects,
  trustedTeams,
  type Project
} from '@/components/portfolio-home-data';
import { stageLayers, type StageLayerId } from '@/components/system-stage-data';
import { Button } from '@/components/ui/button';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  RevealedContext,
  anchorScrollOffset,
  careerStart,
  contactEmail,
  detailStackGapClassName,
  easeOut,
  getYearsExperience,
  listGapClassName,
  pageShellClassName,
  revealEase,
  revealHidden,
  revealTransition,
  revealVariants,
  revealViewport,
  revealVisible,
  scrollToTarget,
  scrollToTargetName,
  sectionContentGapClassName,
  sectionHeaderCenteredClassName,
  sectionHeaderClassName,
  sectionHeaderMarginClassName,
  sectionPaddingBottomClassName,
  sectionPaddingClassName,
  sectionPaddingTopClassName,
  spring,
  trustedLogoToneClassName,
  twoColumnGapClassName,
} from '@/components/sections/shared';
import { HeroSection } from '@/components/sections/hero';

const navItems = [
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

async function writeClipboardText(value: string) {
  let copiedWithClipboard = false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      copiedWithClipboard = true;
    } catch {
      copiedWithClipboard = false;
    }
  }

  if (copiedWithClipboard) {
    return;
  }

  const textArea = document.createElement('textarea');

  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.left = '-9999px';
  textArea.style.position = 'fixed';
  document.body.append(textArea);
  textArea.focus({ preventScroll: true });
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  const didCopy = document.execCommand('copy');
  textArea.remove();

  if (!didCopy) {
    throw new Error('Email copy command failed');
  }
}

function EmailActionMenu() {
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
      await writeClipboardText(contactEmail);
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
        className="h-11 max-w-full gap-2 rounded-full border-zinc-900/10 bg-white px-4 text-zinc-900 shadow-none transition-colors hover:border-zinc-900/20 hover:bg-white hover:text-zinc-900"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{contactEmail}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 grid w-full min-w-64 overflow-hidden rounded-2xl border border-zinc-900/8 bg-white p-1 text-sm font-medium text-zinc-700 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:bg-zinc-50 focus-visible:text-zinc-900 focus-visible:outline-none"
            onClick={copyEmail}
          >
            {copyLabel}
          </button>
          <a
            role="menuitem"
            className="rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:bg-zinc-50 focus-visible:text-zinc-900 focus-visible:outline-none"
            href={`mailto:${contactEmail}`}
            onClick={() => setIsOpen(false)}
          >
            Send email
          </a>
        </div>
      ) : null}
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
          borderColor: isNavCompact ? 'rgba(228,228,231,0.9)' : 'rgba(228,228,231,0)',
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
          className={`${pageShellClassName} flex items-center justify-between gap-4 px-0 md:px-0`}
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
            className="inline-flex min-h-10 items-center whitespace-nowrap text-zinc-950 transition-colors hover:text-sky-700 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              <span className="text-xs font-medium text-zinc-500">Full-Stack Engineer</span>
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
                className="relative hidden min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-zinc-800 transition-colors duration-200 hover:text-zinc-950 focus-visible:text-zinc-950 sm:inline-flex"
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
                      className="absolute inset-0 rounded-xl bg-zinc-100/90 shadow-sm ring-1 ring-zinc-300/70"
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

function stageLayerLabel(id: StageLayerId) {
  return stageLayers.find((layer) => layer.id === id)?.label ?? id;
}

function LayerPills({ className, layers }: { className?: string; layers: StageLayerId[] }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {layers.map((id) => (
        <span
          key={id}
          className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
        >
          {stageLayerLabel(id)}
        </span>
      ))}
    </div>
  );
}

const projectMediaClassName =
  'aspect-[3/2] w-full rounded-2xl object-cover ring-1 ring-zinc-900/10';

function ProjectMedia({ project }: { project: Project }) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.4 });

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isInView) {
      // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView]);

  if (shouldReduceMotion) {
    return (
      <img
        alt={`${project.title} interface preview`}
        className={projectMediaClassName}
        decoding="async"
        loading="lazy"
        src={project.preview}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      aria-label={`${project.title} interface recording`}
      className={projectMediaClassName}
      disablePictureInPicture
      disableRemotePlayback
      loop
      muted
      playsInline
      poster={project.preview}
      preload="none"
      src={project.video}
    />
  );
}

function ProjectArticle({ index, project }: { index: number; project: Project }) {
  const isMediaFirst = index % 2 === 1;

  return (
    <article
      className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
      data-scroll-target={`project-${index}`}
    >
      <RevealGroup className={`grid ${detailStackGapClassName} ${isMediaFirst ? 'lg:order-2' : ''}`}>
        <div className="grid gap-3">
          <RevealItem>
            <p className="text-sm font-medium text-sky-700">{project.role}</p>
          </RevealItem>
          <RevealItem>
            <LayerPills layers={project.layers} />
          </RevealItem>
          <RevealItem>
            <h3 className="max-w-xl text-3xl font-heading font-normal leading-tight tracking-tight text-zinc-900 text-balance sm:text-4xl">
              {project.title}
            </h3>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              {project.summary}
            </p>
          </RevealItem>
        </div>
        <RevealItem>
          <ul className={`grid ${listGapClassName}`}>
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm font-normal leading-6 text-zinc-700">
                <PlayBulletMarker className="text-zinc-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </RevealItem>
        <RevealItem>
          <p className="text-sm text-zinc-500">{project.stack.join(', ')}</p>
        </RevealItem>
      </RevealGroup>

      <Reveal className={isMediaFirst ? 'lg:order-1' : undefined} delay={0.15}>
        <ProjectMedia project={project} />
      </Reveal>
    </article>
  );
}

export function WorkSamplesSection() {
  return (
    <section className={`bg-zinc-50 ${sectionPaddingClassName}`} data-scroll-target="work">
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderCenteredClassName}>
          <RevealItem>
            <h2 className="text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Work samples
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-2xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Employer platforms stay under NDA. These samples show the same systems work: access
              control, operational workflows, payments, and review automation.
            </p>
          </RevealItem>
        </RevealGroup>

        <div className={`grid ${sectionContentGapClassName}`}>
          {projects.map((project, index) => (
            <ProjectArticle key={project.title} index={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayBulletMarker({ className = 'text-zinc-400' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`mt-[0.3125rem] size-3.5 shrink-0 ${className}`}
    >
      <path d="M2 3.4 L2 14.6 L11.2 9 Z" className="fill-sky-400/45" />
      <path
        d="M5 1.8 L5 13 L14 7.4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TimelineEntry({
  item,
  isLast
}: {
  item: (typeof experiences)[number];
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

export function ExperienceSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset: ['start 70%', 'end 70%'],
    target: listRef
  });
  const smoothProgress = useSpring(scrollYProgress, { damping: 30, restDelta: 0.001, stiffness: 120 });
  const scaleY = useTransform(shouldReduceMotion ? scrollYProgress : smoothProgress, [0, 1], [0, 1]);

  return (
    <section
      className={`bg-zinc-700 text-zinc-50 ${sectionPaddingClassName}`}
      data-scroll-target="experience"
    >
      <div className={pageShellClassName}>
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
      </div>
    </section>
  );
}

const bentoCardClassName =
  'relative isolate flex flex-col lg:min-h-[27rem] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100';
const bentoWindowShadowClassName =
  'shadow-[0_28px_56px_-24px_--alpha(var(--color-zinc-900)/30%)]';

function BentoHeading({ tail, title }: { tail: string; title: string }) {
  return (
    <h3 className="max-w-[24rem] p-7 pb-8 text-2xl font-heading font-normal leading-tight tracking-tight text-zinc-900 text-balance sm:p-9 sm:text-[1.75rem]">
      {title} <span className="text-zinc-500">{tail}</span>
    </h3>
  );
}

function BentoWindow({ children, label, wide }: { children: ReactNode; label: string; wide: boolean }) {
  return (
    <div
      className={`mt-auto overflow-hidden rounded-t-xl border border-b-0 border-zinc-200 bg-white ${bentoWindowShadowClassName} ${
        wide ? 'mx-7 sm:mr-0 sm:ml-[18%] sm:rounded-tr-none sm:border-r-0' : 'mx-7 sm:mx-9'
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3">
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span className="mx-auto pr-8 text-[11px] font-medium text-zinc-500">{label}</span>
      </div>
      <div className={wide ? '-mb-16' : '-mb-10'}>{children}</div>
    </div>
  );
}

const wideCardCount = 2;
const spiralOrigin: [number, number] = [0.1, 1.2];
const arcOrigin: [number, number] = [1.08, 1.12];
const cardFormations: DustFormation[] = ['arcs', 'braid', 'waves', 'arcs', 'columns'];
const spiralMaskClassName =
  '[mask-image:radial-gradient(120%_110%_at_75%_0%,black_35%,transparent_85%)]';

function CapabilityCards() {
  return (
    <RevealGroup className="grid gap-4 lg:grid-cols-6 lg:gap-6" stagger={0.1}>
      {expertiseItems.map((item, index) => {
        const wide = index < wideCardCount;
        return (
          <RevealItem
            key={item.title}
            className={`${bentoCardClassName} ${wide ? 'lg:col-span-3 lg:min-h-[31rem]' : 'lg:col-span-2'}`}
          >
            <ParticleStream
              className={`pointer-events-none absolute inset-0 -z-10 size-full ${index === 0 ? spiralMaskClassName : ''}`}
              formation={cardFormations[index]}
              origin={index === 0 ? spiralOrigin : arcOrigin}
              pattern={index === 0 ? 'spiral' : 'dust'}
              seed={index + 1}
            />
            <BentoHeading tail={item.tail} title={item.title} />
            <BentoWindow label={item.windowLabel} wide={wide}>
              <CapabilityInstrument className="rounded-none shadow-none ring-0" kind={item.kind} />
            </BentoWindow>
          </RevealItem>
        );
      })}
      <RevealItem className={`${bentoCardClassName} lg:col-span-2`}>
        <ParticleStream
          className="pointer-events-none absolute inset-0 -z-10 size-full"
          formation={cardFormations[expertiseItems.length]}
          origin={arcOrigin}
          pattern="dust"
          seed={expertiseItems.length + 1}
        />
        <BentoHeading tail="from the interface to the queue" title="One TypeScript stack" />
        <StackGrid className="mx-7 mt-auto -mb-6 [mask-image:linear-gradient(black_55%,transparent)] sm:mx-9" />
      </RevealItem>
    </RevealGroup>
  );
}

export function CapabilitiesSection() {
  return (
    <section className={sectionPaddingClassName}>
      <div className={pageShellClassName}>
        <RevealGroup className={`grid items-end ${sectionHeaderMarginClassName} ${twoColumnGapClassName} lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)]`}>
          <RevealItem className="grid gap-4">
            <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Expertise that holds up in production.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Full-stack product and platform work in regulated environments: interfaces, APIs,
              access rules, data, and the monitoring that keeps the system operable after launch.
            </p>
          </RevealItem>
        </RevealGroup>

        <CapabilityCards />
      </div>
    </section>
  );
}

const aboutFacts = [
  { label: 'regulated delivery since 2019', value: 'Banking' },
  { label: 'React, Next.js, Node', value: 'TypeScript' }
];

function AboutCopy({ yearsExperience }: { yearsExperience: number }) {
  return (
    <>
      <div className="grid gap-4">
        <RevealItem>
          <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-white text-balance sm:text-5xl">
            Full-stack engineer who treats operability as part of the feature.
          </h2>
        </RevealItem>
      </div>
      <div className="grid max-w-xl gap-4 text-base font-normal leading-7 text-zinc-300 text-pretty">
        <RevealItem>
          <p>
            I have spent {yearsExperience}+ years shipping product and platform work for Indonesian
            digital banks. Every release there has to survive audit, incident review, and the next
            engineer who inherits it.
          </p>
        </RevealItem>
        <RevealItem>
          <p>
            Most of my depth is TypeScript across React, Next.js, and Node: distributed services,
            access control, and the path from interface to API to data to monitoring. I adopt
            tools, AI coding agents included, on one test: does the team ship and operate better
            with them.
          </p>
        </RevealItem>
      </div>
    </>
  );
}

function AboutFacts({ className }: { className?: string }) {
  return (
    <ul className={`grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${className ?? ''}`}>
      {aboutFacts.map((fact) => (
        <li key={fact.value} className="grid gap-1 py-4 sm:px-6 sm:first:pl-0">
          <p className="text-2xl font-heading font-semibold leading-none tracking-tight text-white">
            {fact.value}
          </p>
          <p className="text-[0.8125rem] font-medium leading-5 text-zinc-300">{fact.label}</p>
        </li>
      ))}
    </ul>
  );
}

// The ripple starts at the laptop in the photo, as if the dust were the city lights behind it.
const aboutPulse = { everySeconds: 6, origin: [0.82, 0.62] as [number, number] };

function AboutCard({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup
      className="relative isolate overflow-hidden rounded-[2rem] bg-zinc-700 ring-1 ring-zinc-900/5"
      stagger={0.1}
    >
      <DotField
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(110%_120%_at_100%_0%,black_25%,transparent_85%)]"
        colorVar="--color-sky-200"
        density={0.16}
        pulse={aboutPulse}
      />
      <div className="grid gap-10 px-6 pt-12 sm:px-10 sm:pt-16 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)] lg:items-end lg:gap-16 lg:pl-16 lg:pr-0 lg:pt-20">
        <div className={`grid content-start lg:pb-20 ${detailStackGapClassName}`}>
          <AboutCopy yearsExperience={yearsExperience} />
          <RevealItem>
            <AboutFacts className="max-w-xl border-t border-white/10" />
          </RevealItem>
        </div>
        <RevealItem className="-mr-6 self-end sm:-mr-10 lg:mr-0">
          <div className="overflow-hidden rounded-tl-2xl border-l border-t border-white/10 bg-zinc-600 shadow-[0_-16px_64px_-16px_--alpha(var(--color-black)/50%)]">
            <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-zinc-400" />
              <span className="size-2.5 rounded-full bg-zinc-400" />
              <span className="size-2.5 rounded-full bg-zinc-400" />
            </div>
            <img
              alt="Laptop open on a coffee table in a dim living room, city lights through the window"
              className="aspect-[4/3] w-full object-cover object-[50%_60%]"
              decoding="async"
              loading="lazy"
              src={aboutSystemsImage}
            />
          </div>
        </RevealItem>
      </div>
    </RevealGroup>
  );
}

export function AboutSection() {
  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        <AboutCard yearsExperience={getYearsExperience()} />
      </div>
    </section>
  );
}

export default function PortfolioHome() {
  usePreventHashNavigation();

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-zinc-900">
      <AnimatedHeader />

      <main data-scroll-target="top">
        <HeroSection />

        <WorkSamplesSection />

        <ExperienceSection />

        <CapabilitiesSection />

        <AboutSection />

        <SiteFooter />
      </main>
    </div>
  );
}

function FooterSocials({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-1 text-sm font-medium ${className ?? ''}`}>
      {footerSocialLinks.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            className="group inline-flex min-h-11 w-fit items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={item.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon aria-hidden="true" className="size-4 text-zinc-400 transition-colors group-hover:text-sky-500" />
            <span>{item.label}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}

function FooterBottomBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="border-t border-zinc-900/6">
      <div
        className={`${pageShellClassName} flex flex-col gap-4 py-6 text-sm font-normal sm:flex-row sm:items-center sm:justify-between text-zinc-600`}
      >
        <p>© 2026 Denny Dharmawan. All rights reserved.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 w-fit gap-2 rounded-full px-4 shadow-none transition-colors border-zinc-900/10 bg-white text-zinc-900 hover:border-zinc-900/20 hover:bg-white hover:text-zinc-900"
          onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
        >
          <ChevronUp aria-hidden="true" className="size-3.5" />
          <span>Back to top</span>
        </Button>
      </div>
    </div>
  );
}

function FooterHeadline() {
  return (
    <div className={`grid justify-items-center text-center ${detailStackGapClassName}`}>
      <h2
        className="max-w-2xl text-4xl font-heading font-normal leading-[1.02] tracking-tight text-balance text-zinc-900 sm:text-5xl lg:text-6xl"
      >
        Let&apos;s build something
        <span className="block text-zinc-500">that stays up.</span>
      </h2>
      <p className="max-w-lg text-base font-normal leading-7 text-zinc-600 text-pretty">
        Frontend, backend, and platform work for systems that have to stay operable in production.
        Working from Jakarta with teams across time zones.
      </p>
      <EmailActionMenu />
    </div>
  );
}

export function SiteFooter() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer data-scroll-target="contact" className="relative isolate overflow-hidden border-t border-zinc-900/6 bg-zinc-50">
      <div className={`${pageShellClassName} grid justify-items-center gap-10 pb-10 ${sectionPaddingTopClassName}`}>
        <FooterHeadline />
        <FooterSocials className="justify-center" />
      </div>
      <div className="overflow-hidden">
        <motion.p
          aria-hidden="true"
          className="mx-auto w-fit select-none font-heading text-[clamp(2.5rem,11vw,9.25rem)] font-medium leading-[0.82] tracking-[-0.045em] whitespace-nowrap text-zinc-200"
          initial={shouldReduceMotion ? false : { opacity: 0, transform: 'translateY(48%)' }}
          whileInView={{ opacity: 1, transform: 'translateY(26%)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.4, ease: revealEase }}
        >
          Denny Dharmawan
        </motion.p>
      </div>
      <FooterBottomBar />
    </footer>
  );
}
