import { useEffect, useId, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { contactEmail, easeOut } from '@/components/sections/shared';

type MobileNavProps = {
  items: ReadonlyArray<{ label: string; target: string }>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (target: string) => void;
  triggerStyle?: CSSProperties;
};

// The trigger carries the header's entrance itself. Wrapping it and the panel in one animated
// element would give the panel a transformed containing block, which pins it to the trigger's width.
export function MobileNav({ items, isOpen, onOpenChange, onSelect, triggerStyle }: MobileNavProps) {
  const shouldReduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpenRef = useRef(false);
  // A chosen link hands focus to its section, so closing must not pull it back to the trigger.
  const selectedRef = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const blocked = document.querySelectorAll('main, footer');
    const root = document.documentElement;
    const wideEnoughForNav = window.matchMedia('(min-width: 640px)');
    const close = () => onOpenChange(false);
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    blocked.forEach((element) => element.setAttribute('inert', ''));
    root.style.overflow = 'hidden';
    firstLinkRef.current?.focus({ preventScroll: true });
    document.addEventListener('keydown', handleKeyDown);
    wideEnoughForNav.addEventListener('change', close);

    return () => {
      blocked.forEach((element) => element.removeAttribute('inert'));
      root.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      wideEnoughForNav.removeEventListener('change', close);
    };
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;

      if (selectedRef.current) {
        selectedRef.current = false;
      } else {
        triggerRef.current?.focus({ preventScroll: true });
      }
    }
  }, [isOpen]);

  const iconClassName =
    'absolute size-5 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        style={triggerStyle}
        className="animate-rise-in relative inline-flex size-11 items-center justify-center rounded-lg border border-zinc-900/10 bg-white text-zinc-900 transition-colors hover:border-zinc-900/20 sm:hidden"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Menu
          aria-hidden="true"
          className={`${iconClassName} ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
        />
        <X
          aria-hidden="true"
          className={`${iconClassName} ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? [
          <motion.div
            key="scrim"
            className="absolute inset-x-0 top-full h-[100dvh] bg-zinc-900/30 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, ease: easeOut }}
            onClick={() => onOpenChange(false)}
          />,
          <motion.div
            key="panel"
            id={panelId}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-100%)] overflow-y-auto border-b border-zinc-200 bg-white shadow-lg sm:hidden"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: easeOut }}
          >
            <motion.nav
              aria-label="Sections"
              className="mx-auto w-[calc(100%-2.5rem)] pt-2"
              initial="closed"
              animate="open"
              transition={
                shouldReduceMotion ? { duration: 0 } : { delayChildren: 0.05, staggerChildren: 0.04 }
              }
            >
              <ul className="grid">
                {items.map((item, index) => (
                  <motion.li
                    key={item.target}
                    className="border-b border-zinc-100 last:border-b-0"
                    variants={{
                      closed: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
                      open: { opacity: 1, y: 0 }
                    }}
                    transition={
                      shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: easeOut }
                    }
                  >
                    <a
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={`#${item.target}`}
                      className="group flex min-h-16 items-center justify-between gap-4 rounded-lg px-1"
                      onClick={(event) => {
                        event.preventDefault();
                        selectedRef.current = true;
                        onOpenChange(false);
                        // The panel locks page scroll, so the jump waits for the unlock to commit.
                        window.setTimeout(() => onSelect(item.target), 0);
                      }}
                    >
                      <span className="font-heading text-3xl font-normal tracking-tight text-zinc-900 transition-colors group-hover:text-sky-700">
                        {item.label}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-5 shrink-0 text-zinc-400 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-sky-600"
                      />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            <motion.div
              className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { delay: 0.18, duration: 0.32, ease: easeOut }
              }
            >
              <a
                href={`mailto:${contactEmail}`}
                aria-label={`Email ${contactEmail}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-zinc-800"
              >
                Email me
              </a>
              <a
                href="/resume.pdf"
                rel="noopener"
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-900/10 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900/20"
              >
                Resume
                <ArrowUpRight aria-hidden="true" className="size-4 text-zinc-500" />
              </a>
            </motion.div>
          </motion.div>
        ] : null}
      </AnimatePresence>
    </>
  );
}
