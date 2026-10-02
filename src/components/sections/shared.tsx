import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { motion, stagger } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

export const trustedLogoToneClassName = 'grayscale opacity-[0.72] contrast-100';
export const pageShellClassName = 'mx-auto w-[min(1280px,calc(100%-2.5rem))]';
export const sectionPaddingTopClassName = 'pt-20 md:pt-28 lg:pt-32';
export const sectionPaddingBottomClassName = 'pb-20 md:pb-28 lg:pb-32';
export const sectionPaddingClassName = `${sectionPaddingTopClassName} ${sectionPaddingBottomClassName}`;
export const sectionHeaderMarginClassName = 'mb-12 md:mb-16';
export const sectionHeaderClassName = `grid max-w-3xl gap-4 ${sectionHeaderMarginClassName}`;
// Stacked below lg, the intro belongs to its heading, so the row gap stays at the header's gap-4.
export const sectionContentGapClassName = 'gap-16 md:gap-20 lg:gap-28';
export const detailStackGapClassName = 'gap-6';
export const listGapClassName = 'gap-3';
export const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
export const easeOut = [0.2, 0, 0, 1] as const;
export const revealEase = [0.22, 1, 0.36, 1] as const;
export const overshootEase = [0.34, 1.56, 0.64, 1] as const;
// A transform string runs on the compositor through WAAPI. Motion's independent y would tick on the main thread.
export const revealTransition = {
  opacity: { duration: 0.4, ease: 'linear' as const },
  transform: { duration: 0.6, ease: revealEase }
};
export const revealHidden = { opacity: 0, transform: 'translateY(12px)' };
export const revealVisible = { opacity: 1, transform: 'translateY(0px)' };
// Nothing reveals in the last 10% of the viewport; the element has to clear that band first.
export const revealRootMargin = '0px 0px -10% 0px';

// The compact header: 56px tall plus its 1px bottom border. Keep in sync with scroll-padding-top.
export const anchorScrollOffset = 57;
// The Experience rail marks the role crossing a band from here to 40% down the viewport. A target
// marked `data-scroll-landing="reading-band"` lands on the band's top edge instead of under the
// header, so the rail names that target's own role.
export const readingBandTop = 0.33;
export const careerStart = { monthIndex: 11, year: 2017 };
export const contactEmail = 'contact@dennydharmawan.com';

export function getYearsExperience(date = new Date()) {
  const completedYears = date.getFullYear() - careerStart.year;
  return date.getMonth() >= careerStart.monthIndex ? completedYears : completedYears - 1;
}

// A target inside a reveal is still offset by its hidden transform when the jump starts, and
// the rect includes that offset. offsetTop does not, so the jump lands where the target settles.
function layoutTop(element: HTMLElement) {
  let top = element.offsetTop;
  let parent = element.offsetParent as HTMLElement | null;

  while (parent) {
    top += parent.offsetTop + parent.clientTop;
    parent = parent.offsetParent as HTMLElement | null;
  }

  return top;
}

export function scrollToTargetName(targetName: string, shouldReduceMotion?: boolean | null) {
  const target = document.querySelector<HTMLElement>(`[data-scroll-target="${targetName}"]`);

  if (!target) {
    return false;
  }

  let targetTop =
    layoutTop(target) - anchorScrollOffset - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);

  if (targetName === 'top') {
    targetTop = 0;
  } else if (target.dataset.scrollLanding === 'reading-band') {
    targetTop = layoutTop(target) - window.innerHeight * readingBandTop;
  }

  const prefersReducedMotion =
    shouldReduceMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    top: Math.max(targetTop, 0)
  });

  return true;
}

// A jump that only scrolls leaves focus on the link, so the next Tab scrolls back to it and a
// screen reader never reaches the target.
export function focusTargetName(targetName: string) {
  const target = document.querySelector<HTMLElement>(`[data-scroll-target="${targetName}"]`);

  if (target) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
}

export function scrollToTarget(
  event: MouseEvent<HTMLElement>,
  targetName: string,
  shouldReduceMotion?: boolean | null
) {
  if (scrollToTargetName(targetName, shouldReduceMotion)) {
    event.preventDefault();
  }
}

type RevealState = 'hidden' | 'visible';

// Content starts visible so the server HTML paints without JS. Only an element the
// observer measures as entirely below the viewport is pushed back to hidden, off screen,
// where the jump cannot be seen. Anything already on screen keeps its painted state.
export function useRevealState<T extends Element = HTMLDivElement>(
  skip = false,
  rootMargin = revealRootMargin
) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>('visible');

  useEffect(() => {
    const element = ref.current;

    if (skip || !element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
          observer.disconnect();
        } else if (entry.boundingClientRect.top >= window.innerHeight) {
          setState('hidden');
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, skip]);

  return { ref, state };
}

export const instant = { duration: 0 };

export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, state } = useRevealState();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={state}
      variants={{
        hidden: { ...revealHidden, transition: instant },
        // Per-value transitions don't inherit root keys, so the delay goes inside each one.
        visible: {
          ...revealVisible,
          transition: {
            opacity: { ...revealTransition.opacity, delay },
            transform: { ...revealTransition.transform, delay }
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealVariants = {
  hidden: { ...revealHidden, transition: instant },
  visible: { ...revealVisible, transition: revealTransition }
};

export function RevealGroup({
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
  const { ref, state } = useRevealState(onMount);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={state}
      variants={{
        hidden: { transition: instant },
        visible: { transition: { delayChildren: stagger(interval, { startDelay: delay }) } }
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div className={className} variants={revealVariants} {...props}>
      {children}
    </motion.div>
  );
}

export function PlayBulletMarker({ className = 'text-zinc-400' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`mt-[0.3125rem] size-3.5 shrink-0 ${className}`}
    >
      <path d="M2 3.4 L2 14.6 L11.2 9 Z" className="fill-sky-400/70" />
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

export function riseDelay(seconds: number) {
  return { '--rise-delay': `${seconds}s` } as CSSProperties;
}

// The Clipboard API needs a secure context and permission; execCommand covers the rest.
export async function writeClipboardText(value: string) {
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
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.append(textArea);
  textArea.focus({ preventScroll: true });
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  const didCopy = document.execCommand('copy');
  textArea.remove();
  previousFocus?.focus({ preventScroll: true });

  if (!didCopy) {
    throw new Error('Copy command failed');
  }
}
