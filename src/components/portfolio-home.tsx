import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
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
  useReducedMotion
} from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { LuGithub, LuInstagram, LuLinkedin } from 'react-icons/lu';
import { DotField } from '@/components/dot-field';
import {
  aboutSystemsImage
} from '@/components/portfolio-home-data';
import { Button } from '@/components/ui/button';
import {
  RevealGroup,
  RevealItem,
  RevealedContext,
  anchorScrollOffset,
  careerStart,
  contactEmail,
  detailStackGapClassName,
  easeOut,
  getYearsExperience,
  pageShellClassName,
  revealEase,
  revealHidden,
  revealTransition,
  revealVariants,
  revealViewport,
  revealVisible,
  scrollToTarget,
  scrollToTargetName,
  sectionHeaderCenteredClassName,
  sectionPaddingBottomClassName,
  sectionPaddingTopClassName,
  spring,
  trustedLogoToneClassName,
} from '@/components/sections/shared';
import { HeroSection } from '@/components/sections/hero';
import { ExperienceSection } from '@/components/sections/experience';
import { CapabilitiesSection } from '@/components/sections/expertise';
import { WorkSamplesSection } from '@/components/sections/work-samples';

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
