import { useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { isEvidenceTarget } from '@/components/portfolio-home-data';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/sections/mobile-nav';
import {
  contactEmail,
  easeOut,
  focusTargetName,
  pageShellClassName,
  riseDelay,
  scrollToTargetName,
  spring,
  writeClipboardText
} from '@/components/sections/shared';

const navItems: ReadonlyArray<{ label: string; shortLabel?: string; target: string }> = [
  { label: 'Work Samples', shortLabel: 'Work', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' }
];

export function EmailActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const shouldReduceMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
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
        triggerRef.current?.focus({ preventScroll: true });
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

  const closeOnFocusLeaving = (event: FocusEvent<HTMLDivElement>) => {
    const { relatedTarget } = event;

    // The copy fallback briefly focuses a detached textarea; that is not the menu losing focus.
    const isCopyFallback = relatedTarget instanceof HTMLTextAreaElement && relatedTarget.readOnly;

    if (relatedTarget instanceof Node && !event.currentTarget.contains(relatedTarget) && !isCopyFallback) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={menuRef} className="relative w-fit max-w-full" onBlur={closeOnFocusLeaving}>
      <Button
        ref={triggerRef}
        type="button"
        size="lg"
        variant="outline"
        className="h-11 max-w-full gap-2 rounded-full border-zinc-900/10 bg-white px-4 text-zinc-900 shadow-none transition-colors hover:border-zinc-900/20 hover:bg-white hover:text-zinc-900 aria-expanded:border-zinc-900/20 aria-expanded:bg-white aria-expanded:text-zinc-900"
        aria-controls={panelId}
        aria-expanded={isOpen}
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

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={panelId}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-20 grid w-full min-w-64 origin-top overflow-hidden rounded-2xl border border-zinc-900/8 bg-white p-1 text-sm font-medium text-zinc-700 shadow-lg"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: easeOut }}
          >
            <button
              type="button"
              className="flex min-h-11 items-center rounded-xl px-3 text-left transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:text-zinc-900"
              onClick={copyEmail}
            >
              {copyLabel}
            </button>
            <a
              className="flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:text-zinc-900"
              href={`mailto:${contactEmail}`}
              onClick={() => setIsOpen(false)}
            >
              Send email
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span aria-live="polite" className="sr-only">
        {copyState === 'idle' ? '' : copyLabel}
      </span>
    </div>
  );
}

// The section whose top has passed 40% of the viewport is the one being read; the page end
// counts as the last section, because the footer is too short to reach that line.
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: string | null = null;

      for (const item of navItems) {
        const section = document.querySelector(`[data-scroll-target="${item.target}"]`);

        if (section && section.getBoundingClientRect().top <= line) {
          current = item.target;
        }
      }

      setActive(atEnd ? navItems[navItems.length - 1].target : current);
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return active;
}

function NavHoverPill({ isActive }: { isActive: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {isActive ? (
        <motion.span
          layoutId="nav-hover-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-lg bg-zinc-100/90 shadow-sm ring-1 ring-zinc-300/70"
          initial={shouldReduceMotion ? false : { filter: 'blur(4px)', opacity: 0, scale: 0.96 }}
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
  );
}

export function SiteHeader() {
  const shouldReduceMotion = useReducedMotion();
  const activeSection = useActiveSection();
  const [isNavCompact, setIsNavCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredNavHref, setHoveredNavHref] = useState<string | null>(null);
  let surfaceClassName = 'border-transparent bg-white/0';

  if (isMenuOpen) {
    surfaceClassName = 'border-zinc-200 bg-white';
  } else if (isNavCompact) {
    surfaceClassName = 'border-zinc-200/90 bg-white/86';
  }

  useEffect(() => {
    const updateCompactState = () => setIsNavCompact(window.scrollY > 28);

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, { passive: true });

    return () => window.removeEventListener('scroll', updateCompactState);
  }, []);

  const goToSection = (target: string) => {
    const hash = navItems.some((item) => item.target === target) ? `#${target}` : '';

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${hash}`
    );
    scrollToTargetName(target, shouldReduceMotion);
    focusTargetName(target);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div
        className={`pointer-events-auto relative border-b backdrop-blur transition-[background-color,border-color] duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${surfaceClassName}`}
      >
        <div
          className={`${pageShellClassName} flex items-center justify-between gap-4 px-0 transition-[height] duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none md:px-0 ${
            isNavCompact ? 'h-14' : 'h-18'
          }`}
        >
          <a
            className="animate-rise-in inline-flex min-h-11 items-center whitespace-nowrap text-zinc-950 transition-colors hover:text-sky-700 rounded-sm"
            style={riseDelay(0.04)}
            href="/"
            aria-label="Denny Dharmawan home"
            onClick={(event) => {
              event.preventDefault();
              setIsMenuOpen(false);
              goToSection('top');
            }}
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
              <span className="text-xs font-medium text-zinc-600">Senior Full-Stack Engineer</span>
            </span>
          </a>
          <nav
            className="hidden items-center justify-end gap-1 sm:flex md:gap-1.5"
            aria-label="Main navigation"
          >
            <div className="flex items-center gap-0.5 md:gap-1.5" onMouseLeave={() => setHoveredNavHref(null)}>
              {navItems.map((item, index) => (
                <a
                  key={item.target}
                  aria-current={activeSection === item.target ? 'location' : undefined}
                  href={`#${item.target}`}
                  className="animate-rise-in relative inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-zinc-800 transition-colors duration-200 hover:text-zinc-950 focus-visible:text-zinc-950 md:px-3"
                  style={riseDelay(0.12 + index * 0.04)}
                  onBlur={() => setHoveredNavHref(null)}
                  onFocus={() => setHoveredNavHref(item.target)}
                  onClick={(event) => {
                    event.preventDefault();
                    goToSection(item.target);
                  }}
                  onMouseEnter={() => setHoveredNavHref(item.target)}
                >
                  <NavHoverPill isActive={hoveredNavHref === item.target} />
                  <span className="relative z-10">
                    {item.shortLabel ? (
                      <>
                        <span className="md:hidden">{item.shortLabel}</span>
                        <span className="hidden md:inline">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </span>
                </a>
              ))}
              {/* From lg only: below that the row has no room, and the hero's button covers it. */}
              <a
                href="/resume.pdf"
                download
                className="animate-rise-in relative hidden min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium text-zinc-800 transition-colors duration-200 hover:text-zinc-950 focus-visible:text-zinc-950 lg:inline-flex"
                style={riseDelay(0.12 + navItems.length * 0.04)}
                onBlur={() => setHoveredNavHref(null)}
                onFocus={() => setHoveredNavHref('resume')}
                onMouseEnter={() => setHoveredNavHref('resume')}
              >
                <NavHoverPill isActive={hoveredNavHref === 'resume'} />
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <Download aria-hidden="true" className="size-3.5 text-zinc-500" />
                  Resume
                </span>
              </a>
            </div>
            <Button
              asChild
              variant="outline"
              className="animate-rise-in ml-1 h-11 px-4"
              style={riseDelay(0.12 + (navItems.length + 1) * 0.04)}
            >
              <a href={`mailto:${contactEmail}`} aria-label={`Email ${contactEmail}`}>
                <span className="lg:hidden">Email</span>
                <span className="hidden lg:inline">{contactEmail}</span>
              </a>
            </Button>
          </nav>
          <MobileNav
            items={navItems}
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            onSelect={goToSection}
            triggerStyle={riseDelay(0.12)}
          />
        </div>
      </div>
    </header>
  );
}

// A malformed escape keeps the raw hash, whose `%` matches no target, so it takes the unknown-hash path.
function decodeHash(hash: string) {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export function usePreventHashNavigation() {
  useEffect(() => {
    const routeHash = () => {
      const target = decodeHash(window.location.hash.slice(1));

      if (!target) {
        return;
      }

      // `html` sets scroll-behavior: smooth, which turns a `behavior: 'auto'` jump into a glide.
      // A deep link should land, not travel, so the jump runs with smoothing switched off.
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;

      root.style.scrollBehavior = 'auto';

      if (navItems.some((item) => item.target === target) || isEvidenceTarget(target)) {
        scrollToTargetName(target, true);
      } else {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        );
        window.scrollTo({ left: 0, top: 0 });
      }

      root.style.scrollBehavior = previousScrollBehavior;
    };

    routeHash();

    // Sections settle after fonts and images land, so the landing offset needs a second pass.
    const settle = window.setTimeout(routeHash, 250);

    window.addEventListener('hashchange', routeHash);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('hashchange', routeHash);
    };
  }, []);
}
