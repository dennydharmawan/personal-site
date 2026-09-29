import { useEffect, useState, type FocusEvent, type MouseEvent, type PointerEvent } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { GlyphTile } from '@/components/about-glyphs';
import { DotGrid } from '@/components/dot-grid';
import {
  aboutEvidence,
  aboutParagraph,
  type EvidenceTarget
} from '@/components/portfolio-home-data';
import {
  focusTargetName,
  instant,
  overshootEase,
  pageShellClassName,
  scrollToTargetName,
  sectionPaddingBottomClassName,
  useRevealState
} from '@/components/sections/shared';
import { cn } from '@/lib/utils';

const proofOrder = aboutParagraph.flatMap((segment) =>
  typeof segment === 'string' ? [] : [segment.evidence]
);

const focusRing =
  'rounded-sm [--focus-offset:4px]';

// The router only hears hashchange, which a second click on the same hash never fires.
function jumpToEvidence(event: MouseEvent<HTMLAnchorElement>, target: EvidenceTarget) {
  // A modified click opens the hash in a new tab or window, where the router lands it.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  if (!scrollToTargetName(target)) {
    return;
  }

  event.preventDefault();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${target}`
  );
  focusTargetName(target);
}

const phraseClassName = 'transition-colors duration-200 group-data-[active=true]:text-sky-700';

// The entrance plays once, when the paragraph's top clears the lower 30% of the viewport.
// Phrases go in reading order: the tile pops, then its glyph plays.
const entranceRootMargin = '0px 0px -30% 0px';
const firstBeat = 0.35;
const beatGap = 0.42;
const beat = (index: number) => firstBeat + index * beatGap;

const fadeIn: Variants = {
  hidden: { opacity: 0, transition: instant },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'linear' } }
};

const tilePop = (at: number): Variants => ({
  hidden: { opacity: 0, transform: 'scale(0.4) rotate(-12deg)', transition: instant },
  visible: {
    opacity: 1,
    transform: 'scale(1) rotate(0deg)',
    transition: {
      opacity: { delay: at, duration: 0.25, ease: 'linear' },
      transform: { delay: at, duration: 0.55, ease: overshootEase }
    }
  }
});

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState<EvidenceTarget | null>(null);
  const [entrancePlaying, setEntrancePlaying] = useState(false);
  const [focusedWhileHidden, setFocusedWhileHidden] = useState(false);
  const [replays, setReplays] = useState<Partial<Record<EvidenceTarget, number>>>({});
  const { ref: paragraphRef, state } = useRevealState<HTMLParagraphElement>(
    false,
    entranceRootMargin
  );
  // Keyboard focus can land on a link in the band below the trigger; a focused link must be visible.
  const phase = focusedWhileHidden ? 'visible' : state;

  useEffect(() => {
    if (phase === 'hidden') {
      setEntrancePlaying(true);
    }
  }, [phase]);

  const replay = (target: EvidenceTarget) => {
    if (shouldReduceMotion || entrancePlaying) {
      return;
    }

    setReplays((current) => ({ ...current, [target]: (current[target] ?? 0) + 1 }));
  };

  // Touch fires pointerenter on every scroll that starts on a phrase; pairing is for a hovering pointer.
  // A mouse click focuses the link right after the pointer entered it, so only keyboard focus replays.
  const pair = (target: EvidenceTarget, replayOnEnter = false) => ({
    onBlur: () => setActive(null),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      setActive(target);

      if (replayOnEnter && event.currentTarget.matches(':focus-visible')) {
        replay(target);
      }
    },
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      setActive(target);

      if (replayOnEnter) {
        replay(target);
      }
    },
    onPointerLeave: () => setActive(null)
  });

  return (
    <section
      aria-labelledby="about-heading"
      className={cn(sectionPaddingBottomClassName, 'relative isolate scroll-mt-20 md:scroll-mt-28 lg:scroll-mt-32')}
      data-scroll-target="about"
      onFocusCapture={() => setFocusedWhileHidden((current) => current || state === 'hidden')}
    >
      {/* The grid fades out toward the paragraph and at the top and bottom, so the text sits on
          white and the dots fill the space beside it. */}
      <DotGrid className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 -z-10 h-[calc(100%+6rem)] w-full [mask-image:linear-gradient(to_right,black_0%,black_30%,transparent_62%),linear-gradient(to_bottom,transparent,black_25%,black_70%,transparent)] [mask-composite:intersect]" />
      <div className={pageShellClassName}>
        {/* From lg this shares the bento grid's three columns and gap, so the heading and the
            paragraph start where the headings of the cards above do. */}
        <div className="grid gap-y-8 lg:grid-cols-3 lg:gap-x-6">
          <div className="grid content-start gap-5 lg:pl-9">
            <h2
              className="text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl"
              id="about-heading"
            >
              About me
            </h2>
          </div>

          <motion.div
            animate={phase}
            className="lg:col-span-2 lg:pl-9"
            initial={false}
            variants={{ hidden: {}, visible: {} }}
            onAnimationComplete={(definition) => {
              if (definition === 'visible') {
                setEntrancePlaying(false);
              }
            }}
          >
            <motion.p
              ref={paragraphRef}
              className="max-w-[40em] font-heading text-[clamp(1.25rem,1.8vw,1.625rem)] font-normal leading-[1.45] tracking-tight text-pretty text-zinc-900"
              variants={fadeIn}
            >
              {aboutParagraph.map((segment) => {
                if (typeof segment === 'string') {
                  return segment;
                }

                const target = segment.evidence;
                const index = proofOrder.indexOf(target);
                const { glyph, phrase } = aboutEvidence[target];
                const firstSpace = phrase.indexOf(' ');
                const firstWord = firstSpace === -1 ? phrase : phrase.slice(0, firstSpace);
                const rest = firstSpace === -1 ? '' : phrase.slice(firstSpace);

                return (
                  <a
                    key={target}
                    // The padding closes the leading between wrapped lines, so the pointer never leaves the phrase mid-read.
                    className={cn('group py-[0.12em]', focusRing)}
                    data-active={active === target}
                    href={`#${target}`}
                    onClick={(event) => jumpToEvidence(event, target)}
                    {...pair(target, true)}
                  >
                    <span className="whitespace-nowrap">
                      <GlyphTile
                        at={beat(index) + 0.15}
                        className="mr-[0.22em] align-[-0.17em] transition-[rotate,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]:-translate-y-[0.06em] group-data-[active=true]:-rotate-6"
                        glyph={glyph}
                        replay={replays[target]}
                        variants={tilePop(beat(index))}
                      />
                      <span className={phraseClassName}>{firstWord}</span>
                    </span>
                    {rest ? <span className={phraseClassName}>{rest}</span> : null}
                  </a>
                );
              })}
            </motion.p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
