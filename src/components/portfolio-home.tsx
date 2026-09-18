import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
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
import { CapabilityInstrument } from '@/components/capability-instruments';
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

const trustedLogoToneClassName = 'grayscale opacity-[0.72] contrast-100';
const pageShellClassName = 'mx-auto w-[min(1280px,calc(100%-2.5rem))]';
const sectionPaddingClassName = 'py-20 md:py-28 lg:py-32';
const sectionHeaderClassName = 'mb-12 grid max-w-3xl gap-4 md:mb-16';
const sectionHeaderCenteredClassName = `${sectionHeaderClassName} mx-auto justify-items-center text-center`;
const sectionContentGapClassName = 'gap-16 md:gap-20 lg:gap-28';
const twoColumnGapClassName = 'gap-10 lg:gap-16';
const detailStackGapClassName = 'gap-6';
const listGapClassName = 'gap-3';
const taglineBaseClassName = 'text-[0.6875rem] font-medium uppercase tracking-[0.18em]';
const taglineClassName = `${taglineBaseClassName} text-sky-700`;
const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
const easeOut = [0.2, 0, 0, 1] as const;
const revealEase = [0.22, 1, 0.36, 1] as const;
const revealTransition = {
  opacity: { duration: 0.5, ease: 'linear' as const },
  y: { duration: 1, ease: revealEase }
};
const revealViewport = { margin: '0px 0px -10% 0px', once: true };

const anchorScrollOffset = 76;
const careerStart = { monthIndex: 11, year: 2017 };
const contactEmail = 'contact@dennydharmawan.com';

function getYearsExperience(date = new Date()) {
  const completedYears = date.getFullYear() - careerStart.year;
  return date.getMonth() >= careerStart.monthIndex ? completedYears : completedYears - 1;
}

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

function scrollToTargetName(targetName: string, shouldReduceMotion?: boolean | null) {
  const target = document.querySelector<HTMLElement>(`[data-scroll-target="${targetName}"]`);

  if (!target) {
    return false;
  }

  const targetTop =
    targetName === 'top'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - anchorScrollOffset;
  const prefersReducedMotion =
    shouldReduceMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    top: Math.max(targetTop, 0)
  });

  return true;
}

function scrollToTarget(
  event: MouseEvent<HTMLElement>,
  targetName: string,
  shouldReduceMotion?: boolean | null
) {
  if (scrollToTargetName(targetName, shouldReduceMotion)) {
    event.preventDefault();
  }
}

function Reveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={shouldReduceMotion ? { duration: 0 } : { delay, ...revealTransition }}
    >
      {children}
    </motion.div>
  );
}

const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

function RevealGroup({
  children,
  className,
  delay = 0,
  onMount = false,
  stagger: interval = 0.08
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onMount?: boolean;
  stagger?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const activationProps: HTMLMotionProps<'div'> = onMount
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: revealViewport };

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{ hidden: {}, visible: {} }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delayChildren: stagger(interval, { startDelay: delay }) }
      }
      {...activationProps}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={revealVariants}
      transition={shouldReduceMotion ? { duration: 0 } : revealTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
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
        className="h-11 max-w-full gap-2 rounded-full border-slate-900/10 bg-white px-4 text-slate-900 shadow-none transition-colors hover:border-slate-900/20 hover:bg-white hover:text-slate-900"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{contactEmail}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 grid w-full min-w-64 overflow-hidden rounded-2xl border border-slate-900/8 bg-white p-1 text-sm font-medium text-slate-700 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:bg-slate-50 focus-visible:text-slate-900 focus-visible:outline-none"
            onClick={copyEmail}
          >
            {copyLabel}
          </button>
          <a
            role="menuitem"
            className="rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:bg-slate-50 focus-visible:text-slate-900 focus-visible:outline-none"
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

type HeroGlowBlob = {
  id: string;
  className: string;
  animate: { x: number[]; y: number[]; scale: number[] };
  duration: number;
  delay: number;
};

const heroGlowBlobs: HeroGlowBlob[] = [
  {
    id: 'violet',
    className:
      '-bottom-[22%] -left-[8%] w-[60%] bg-[radial-gradient(circle,--alpha(var(--color-violet-400)/20%),--alpha(var(--color-violet-400)/0%)_70%)]',
    animate: { x: [0, 38], y: [0, -24], scale: [1, 1.08] },
    duration: 18,
    delay: 0
  },
  {
    id: 'sky',
    className:
      '-bottom-[26%] left-[28%] w-[48%] bg-[radial-gradient(circle,--alpha(var(--color-sky-400)/14%),--alpha(var(--color-sky-400)/0%)_70%)]',
    animate: { x: [0, -28], y: [0, 18], scale: [1, 1.06] },
    duration: 14,
    delay: 1.6
  },
  {
    id: 'pink',
    className:
      '-right-[8%] top-[38%] w-[42%] bg-[radial-gradient(circle,--alpha(var(--color-pink-400)/10%),--alpha(var(--color-pink-400)/0%)_70%)]',
    animate: { x: [0, 22], y: [0, 34], scale: [1, 1.07] },
    duration: 22,
    delay: 3.4
  }
];

function HeroPreviewBand() {
  const shouldReduceMotion = useReducedMotion();
  const glowRef = useRef<HTMLDivElement>(null);
  const isGlowInView = useInView(glowRef, { amount: 0.1 });
  const isGlowBreathing = isGlowInView && !shouldReduceMotion;

  return (
    <div className="relative isolate">
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -bottom-8 top-1/3 -z-10 sm:-inset-x-12 sm:-bottom-12"
      >
        {heroGlowBlobs.map((blob) => (
          <motion.div
            key={blob.id}
            className={`absolute aspect-[10/7] rounded-full blur-3xl will-change-transform ${blob.className}`}
            animate={isGlowBreathing ? blob.animate : false}
            transition={{
              duration: blob.duration,
              delay: blob.delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-slate-900/5">
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
            alt="Team collaborating around a laptop with attention directed toward the next action"
            className="block h-[12.5rem] w-full object-cover object-[50%_22%] sm:h-[17rem] lg:h-[18rem]"
            decoding="async"
            src="/portfolio-previews/team-gaze-hero-final-spec-source.png"
          />
        </picture>
      </div>
    </div>
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

function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate border-b border-slate-200 bg-white pb-16 pt-24 sm:pt-28 md:pb-20 lg:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(280%_160%_at_50%_0%,transparent_32%,black_64%)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_100%,var(--color-sky-100)_0%,var(--color-sky-200)_45%,var(--color-sky-400)_100%)] opacity-40" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,--alpha(var(--color-white)/78%)_0_1px,transparent_1px_8px)] opacity-40" />
      </div>
      <RevealGroup
        className={`${pageShellClassName} grid gap-10 md:gap-12`}
        onMount
        stagger={0.1}
      >
        <div className="grid gap-8">
          <RevealItem>
            <h1 className="max-w-6xl text-[2.5rem] font-heading font-normal leading-[1.04] tracking-tight text-slate-900 sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5rem]">
              Building web solutions
              <span className="block pt-1 text-slate-500 sm:pt-2">that actually scale.</span>
            </h1>
          </RevealItem>

          <RevealItem>
            <HeroPreviewBand />
          </RevealItem>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] lg:items-end">
          <RevealItem>
            <HeroProofBlock yearsExperience={yearsExperience} />
          </RevealItem>

          <RevealItem className={`grid ${detailStackGapClassName} lg:justify-items-start`}>
            <p className="max-w-xl text-base font-normal leading-7 text-slate-700 text-pretty">
              I&apos;m a full-stack engineer with hands-on experience building{' '}
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
                <a href="/resume.pdf" rel="noopener" target="_blank">
                  <Download data-icon="inline-start" />
                  Download resume
                </a>
              </Button>
            </div>
          </RevealItem>
        </div>
      </RevealGroup>
    </section>
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
            className="inline-flex min-h-10 items-center whitespace-nowrap text-slate-950 transition-colors hover:text-sky-700"
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

function stageLayerLabel(id: StageLayerId) {
  return stageLayers.find((layer) => layer.id === id)?.label ?? id;
}

function LayerPills({ className, layers }: { className?: string; layers: StageLayerId[] }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {layers.map((id) => (
        <span
          key={id}
          className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
        >
          {stageLayerLabel(id)}
        </span>
      ))}
    </div>
  );
}

const projectMediaClassName =
  'aspect-[3/2] w-full rounded-xl object-cover shadow-sm';

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
            <p className={taglineClassName}>{project.role}</p>
          </RevealItem>
          <RevealItem>
            <LayerPills layers={project.layers} />
          </RevealItem>
          <RevealItem>
            <h3 className="max-w-xl text-3xl font-heading font-normal leading-tight tracking-tight text-slate-900 text-balance sm:text-4xl">
              {project.title}
            </h3>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-slate-600 text-pretty">
              {project.summary}
            </p>
          </RevealItem>
        </div>
        <RevealItem>
          <ul className={`grid ${listGapClassName}`}>
            {project.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm font-normal leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sky-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </RevealItem>
        <RevealItem className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
          {project.stack.map((tech, stackIndex) => (
            <span key={tech} className="inline-flex items-center gap-2">
              {stackIndex > 0 ? (
                <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
              ) : null}
              <span>{tech}</span>
            </span>
          ))}
        </RevealItem>
      </RevealGroup>

      <Reveal className={isMediaFirst ? 'lg:order-1' : undefined} delay={0.15}>
        <ProjectMedia project={project} />
      </Reveal>
    </article>
  );
}

function WorkSamplesSection() {
  return (
    <section className={`bg-slate-50 ${sectionPaddingClassName}`} data-scroll-target="work">
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderCenteredClassName}>
          <RevealItem>
            <p className={taglineClassName}>Selected work</p>
          </RevealItem>
          <RevealItem>
            <h2 className="text-4xl font-heading font-normal tracking-tight text-slate-900 text-balance sm:text-5xl">
              Work samples
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
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

function PlayBulletMarker() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-[0.3125rem] size-3.5 shrink-0 text-sky-300"
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
          className={`relative size-2.5 rounded-full ring-4 ring-slate-800 transition-colors duration-500 ${
            isActive ? 'bg-sky-400' : 'bg-slate-500'
          }`}
        />
      </span>

      <RevealItem className="mb-3 grid content-start gap-1 lg:mb-0 lg:pr-10 lg:text-right">
        <p className="text-sm whitespace-nowrap tabular-nums text-slate-300">{item.period}</p>
        {isCurrent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 lg:justify-self-end">
            Current
          </span>
        ) : null}
      </RevealItem>

      <div className="grid content-start gap-3 lg:pl-10">
        <RevealItem className="grid gap-1">
          <p className="text-sm font-medium text-sky-300">{item.company}</p>
          <h3 className="text-2xl font-heading font-normal leading-tight tracking-tight text-slate-50 text-balance sm:text-3xl">
            {item.role}
          </h3>
        </RevealItem>
        <RevealItem>
          <p className="max-w-[60ch] text-base leading-7 text-slate-300 text-pretty">{item.summary}</p>
        </RevealItem>
        <RevealItem>
          <ul className={`grid max-w-[60ch] ${listGapClassName}`}>
            {item.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-3 text-[0.9375rem] font-normal leading-6 text-slate-200"
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

function ExperienceSection() {
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
      className={`bg-slate-800 bg-[radial-gradient(ellipse_at_top_right,--alpha(var(--color-sky-400)/14%),transparent_55%)] text-slate-50 ${sectionPaddingClassName}`}
      data-scroll-target="experience"
    >
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderClassName}>
          <RevealItem>
            <p className={`${taglineBaseClassName} text-sky-300`}>Career</p>
          </RevealItem>
          <RevealItem>
            <h2 className="text-4xl font-heading font-normal tracking-tight text-slate-50 text-balance sm:text-5xl">
              Experience
            </h2>
          </RevealItem>
          <RevealItem className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="max-w-2xl text-base font-normal leading-7 text-slate-300 text-pretty">
              ERP consulting, then lending backends, then bank platform engineering.
            </p>
            <a
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-300 underline-offset-4 hover:underline"
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

function CapabilitiesBento() {
  return (
    <RevealGroup className="grid gap-4 md:grid-cols-2 lg:gap-6" stagger={0.1}>
      {expertiseItems.map((item) => (
        <RevealItem
          key={item.title}
          className="grid content-start gap-5 rounded-[1.75rem] border border-slate-900/6 bg-white p-4 shadow-sm sm:p-5"
        >
          <CapabilityInstrument className="bg-slate-50 shadow-none" kind={item.kind} />
          <div className="grid gap-2 px-2 pb-3">
            <h3 className="text-lg font-semibold leading-7 text-slate-900">{item.title}</h3>
            <p className="text-base font-normal leading-7 text-slate-700 text-pretty">{item.body}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function CapabilitiesSection() {
  return (
    <section className={sectionPaddingClassName}>
      <div className={pageShellClassName}>
        <RevealGroup className={`mb-12 grid items-end md:mb-16 ${twoColumnGapClassName} lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)]`}>
          <RevealItem className="grid gap-4">
            <p className={taglineClassName}>How I work</p>
            <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-slate-900 text-balance sm:text-5xl">
              Expertise that holds up in production.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-slate-600 text-pretty">
              Full-stack product and platform work in regulated environments: interfaces, APIs,
              access rules, data, and the monitoring that keeps the system operable after launch.
            </p>
          </RevealItem>
        </RevealGroup>

        <CapabilitiesBento />
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
          <p className={taglineClassName}>About</p>
        </RevealItem>
        <RevealItem>
          <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-slate-900 text-balance sm:text-5xl">
            Full-stack engineer who treats operability as part of the feature.
          </h2>
        </RevealItem>
      </div>
      <div className="grid max-w-xl gap-4 text-base font-normal leading-7 text-slate-700 text-pretty">
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
    <ul className={`grid divide-y divide-slate-900/8 sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${className ?? ''}`}>
      {aboutFacts.map((fact) => (
        <li key={fact.value} className="grid gap-1 py-4 sm:px-6 sm:first:pl-0">
          <p className="text-2xl font-heading font-semibold leading-none tracking-tight text-slate-900">
            {fact.value}
          </p>
          <p className="text-[0.8125rem] font-medium leading-5 text-slate-600">{fact.label}</p>
        </li>
      ))}
    </ul>
  );
}

function AboutRibbon({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup
      className={`grid items-center ${twoColumnGapClassName} lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]`}
      stagger={0.1}
    >
      <div className={`grid content-start ${detailStackGapClassName}`}>
        <AboutCopy yearsExperience={yearsExperience} />
        <RevealItem>
          <AboutFacts className="max-w-xl border-t border-slate-900/8" />
        </RevealItem>
      </div>
      <RevealItem className="relative isolate py-10">
        <div
          aria-hidden="true"
          className="absolute -inset-x-6 inset-y-0 -z-10 -skew-y-6 rounded-[2rem] bg-[linear-gradient(120deg,var(--color-sky-200),var(--color-violet-200)_55%,var(--color-sky-100))] lg:-right-[50vw]"
        />
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/10 shadow-[0_32px_64px_-24px_--alpha(var(--color-slate-900)/35%)]">
          <img
            alt="Laptop open on a coffee table in a dim living room, city lights through the window"
            className="aspect-[4/3] w-full object-cover object-[50%_60%]"
            decoding="async"
            loading="lazy"
            src={aboutSystemsImage}
          />
        </div>
      </RevealItem>
    </RevealGroup>
  );
}

function AboutSection() {
  return (
    <section className={sectionPaddingClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        <AboutRibbon yearsExperience={getYearsExperience()} />
      </div>
    </section>
  );
}

export default function PortfolioHome() {
  usePreventHashNavigation();

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
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

function SiteFooter() {
  const shouldReduceMotion = useReducedMotion();
  const footerLinkClassName =
    'inline-flex min-h-9 w-fit items-center gap-1.5 text-left text-slate-600 transition-colors hover:text-slate-900 focus-visible:text-slate-900 focus-visible:outline-none';

  return (
    <footer data-scroll-target="contact" className="mt-8 overflow-hidden border-t border-slate-900/6 bg-slate-50 text-slate-600 md:mt-12">
      <div className={`${pageShellClassName} pt-20 md:pt-24`}>
        <RevealGroup className="grid gap-12">
          <div className={`grid content-start ${detailStackGapClassName}`}>
            <RevealItem>
              <p className={taglineClassName}>Sign-off</p>
            </RevealItem>
            <RevealItem>
              <h2 className="max-w-2xl text-4xl font-heading font-normal leading-[1.02] tracking-tight text-slate-900 text-balance sm:text-5xl lg:text-6xl">
                Let&apos;s build something
                <span className="block text-slate-500">that stays up.</span>
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="max-w-lg text-base font-normal leading-7 text-slate-600 text-pretty">
                Frontend, backend, and platform work for systems that have to stay operable in
                production. Working from Jakarta with teams across time zones.
              </p>
            </RevealItem>
            <RevealItem className="flex flex-wrap items-center gap-3 pt-1">
              <EmailActionMenu />
            </RevealItem>
          </div>

        </RevealGroup>

        <RevealGroup className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-1 border-t border-slate-900/6 pt-6 text-sm font-medium md:mt-16">
          {footerSocialLinks.map((item) => {
            const Icon = item.icon;

            return (
              <RevealItem key={item.href}>
                <a
                  className={`group ${footerLinkClassName}`}
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" className="size-4 text-slate-400 transition-colors group-hover:text-sky-700" />
                  <span>{item.label}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 text-slate-300 transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900"
                  />
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <div className="relative mt-14 overflow-hidden md:mt-20">
        <div className={pageShellClassName}>
          <motion.p
            aria-hidden="true"
            className="w-fit max-w-none select-none font-heading text-[clamp(3.5rem,11vw,9.25rem)] sm:whitespace-nowrap font-medium leading-[0.82] tracking-[-0.045em] text-slate-300"
            initial={shouldReduceMotion ? false : { opacity: 0, y: '48%' }}
            whileInView={{ opacity: 1, y: '26%' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.4, ease: revealEase }}
          >
            Denny Dharmawan
          </motion.p>
        </div>
      </div>

      <div className="border-t border-slate-900/6">
        <div
          className={`${pageShellClassName} flex flex-col gap-4 py-6 text-sm font-normal text-slate-600 sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>© 2026 Denny Dharmawan. All rights reserved.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 w-fit gap-2 rounded-full border-slate-900/10 bg-white px-3 text-slate-900 shadow-none transition-colors hover:border-slate-900/20 hover:bg-white hover:text-slate-900"
            onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
          >
            <ChevronUp aria-hidden="true" className="size-3.5" />
            <span>Back to top</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
