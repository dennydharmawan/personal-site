import { createContext, useContext } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { motion, stagger, useReducedMotion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

export const trustedLogoToneClassName = 'grayscale opacity-[0.72] contrast-100';
export const pageShellClassName = 'mx-auto w-[min(1280px,calc(100%-2.5rem))]';
export const sectionPaddingTopClassName = 'pt-20 md:pt-28 lg:pt-32';
export const sectionPaddingBottomClassName = 'pb-20 md:pb-28 lg:pb-32';
export const sectionPaddingClassName = `${sectionPaddingTopClassName} ${sectionPaddingBottomClassName}`;
export const sectionHeaderMarginClassName = 'mb-12 md:mb-16';
export const sectionHeaderClassName = `grid max-w-3xl gap-4 ${sectionHeaderMarginClassName}`;
export const sectionHeaderCenteredClassName = `${sectionHeaderClassName} mx-auto justify-items-center text-center`;
export const sectionContentGapClassName = 'gap-16 md:gap-20 lg:gap-28';
export const twoColumnGapClassName = 'gap-10 lg:gap-16';
export const detailStackGapClassName = 'gap-6';
export const listGapClassName = 'gap-3';
export const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
export const easeOut = [0.2, 0, 0, 1] as const;
export const revealEase = [0.22, 1, 0.36, 1] as const;
// A transform string runs on the compositor through WAAPI. Motion's independent y would tick on the main thread.
export const revealTransition = {
  opacity: { duration: 0.4, ease: 'linear' as const },
  transform: { duration: 0.6, ease: revealEase }
};
export const revealHidden = { opacity: 0, transform: 'translateY(12px)' };
export const revealVisible = { opacity: 1, transform: 'translateY(0px)' };
export const revealViewport = { margin: '0px 0px -10% 0px', once: true };

export const anchorScrollOffset = 76;
export const careerStart = { monthIndex: 11, year: 2017 };
export const contactEmail = 'contact@dennydharmawan.com';

export function getYearsExperience(date = new Date()) {
  const completedYears = date.getFullYear() - careerStart.year;
  return date.getMonth() >= careerStart.monthIndex ? completedYears : completedYears - 1;
}

export function scrollToTargetName(targetName: string, shouldReduceMotion?: boolean | null) {
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

export function scrollToTarget(
  event: MouseEvent<HTMLElement>,
  targetName: string,
  shouldReduceMotion?: boolean | null
) {
  if (scrollToTargetName(targetName, shouldReduceMotion)) {
    event.preventDefault();
  }
}

// The lab renders sections already revealed. A hidden browser tab freezes animations at frame 0, so a reveal would screenshot blank.
export const RevealedContext = createContext(false);

export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const revealed = useContext(RevealedContext);
  const activationProps: HTMLMotionProps<'div'> = revealed
    ? { initial: false, animate: revealVisible }
    : { initial: revealHidden, whileInView: revealVisible, viewport: revealViewport };

  return (
    <motion.div
      className={className}
      {...activationProps}
      transition={shouldReduceMotion ? { duration: 0 } : { delay, ...revealTransition }}
    >
      {children}
    </motion.div>
  );
}

export const revealVariants = { hidden: revealHidden, visible: revealVisible };

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
  const shouldReduceMotion = useReducedMotion();
  const revealed = useContext(RevealedContext);
  const activationProps: HTMLMotionProps<'div'> = revealed
    ? { initial: false, animate: 'visible' }
    : onMount
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: revealViewport };

  return (
    <motion.div
      className={className}
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

export function RevealItem({ children, className, ...props }: HTMLMotionProps<'div'>) {
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


export function PlayBulletMarker({ className = 'text-zinc-400' }: { className?: string }) {
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
