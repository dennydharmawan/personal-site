import { useEffect, useState, type FocusEvent, type MouseEvent, type PointerEvent } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { GlyphTile } from '@/components/about-glyphs';
import {
  aboutEvidence,
  aboutParagraph,
  type EvidenceTarget
} from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
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
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600';

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

const underline =
  'bg-no-repeat transition-colors duration-200 [background-image:linear-gradient(var(--color-sky-600),var(--color-sky-600))] [background-position:0_calc(100%-0.04em)] [background-size:100%_2px] group-data-[active=true]:bg-sky-50';

// The entrance plays once, when the paragraph's top clears the lower 30% of the viewport.
// Phrases go in reading order: the tile pops, its glyph plays, then its underline draws.
const entranceRootMargin = '0px 0px -30% 0px';
const firstBeat = 0.35;
const beatGap = 0.42;
const underlineDraw = 0.5;
const beat = (index: number) => firstBeat + index * beatGap;
const underlineStart = (index: number) => beat(index) + 0.12;

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

const drawUnderline = (at: number, duration: number): Variants => ({
  hidden: { backgroundSize: '0% 2px', transition: instant },
  visible: { backgroundSize: '100% 2px', transition: { delay: at, duration, ease: 'linear' } }
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
      className={sectionPaddingBottomClassName}
      data-scroll-target="about"
      onFocusCapture={() => setFocusedWhileHidden((current) => current || state === 'hidden')}
    >
      <div className={pageShellClassName}>
        <div className="grid gap-y-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-x-16">
          <div className="grid content-start gap-5">
            <h2
              className="text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl"
              id="about-heading"
            >
              About me
            </h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-zinc-500">Jakarta, UTC+7</span>
              <a
                className={cn(
                  'group/resume -my-2 inline-flex items-center gap-1.5 py-2 font-medium text-sky-700 transition-colors hover:text-sky-800',
                  focusRing
                )}
                href="/resume.pdf"
                rel="noopener"
                target="_blank"
              >
                <Download
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover/resume:translate-y-0.5"
                />
                Download resume
              </a>
            </div>
          </div>

          <motion.div
            animate={phase}
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
                // Character share stands in for width share, so the underline keeps one speed across both spans.
                const firstDraw = underlineDraw * (firstWord.length / phrase.length);

                return (
                  <a
                    key={target}
                    aria-describedby={`about-proof-${target}`}
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
                      <motion.span
                        className={underline}
                        variants={drawUnderline(underlineStart(index), firstDraw)}
                      >
                        {firstWord}
                      </motion.span>
                    </span>
                    {rest ? (
                      <motion.span
                        className={underline}
                        variants={drawUnderline(
                          underlineStart(index) + firstDraw,
                          underlineDraw - firstDraw
                        )}
                      >
                        {rest}
                      </motion.span>
                    ) : null}
                  </a>
                );
              })}
            </motion.p>
          </motion.div>
        </div>

        <RevealGroup className="mt-12 lg:mt-16">
          <ol
            aria-label="Evidence for each linked phrase"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {proofOrder.map((target) => {
              const { glyph, phrase, proof, source } = aboutEvidence[target];

              return (
                <li
                  key={target}
                  className="group"
                  data-active={active === target}
                  data-dim={active !== null && active !== target}
                  {...pair(target)}
                >
                  <RevealItem className="flex h-full flex-col gap-4 rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-900/5 transition-[background-color,box-shadow] duration-200 group-data-[active=true]:bg-white group-data-[active=true]:shadow-md group-data-[active=true]:shadow-zinc-900/5 group-data-[active=true]:ring-sky-600/30">
                    <GlyphTile
                      className="text-[1.75rem] transition-opacity duration-200 group-data-[dim=true]:opacity-45"
                      glyph={glyph}
                    />
                    <div className="grid gap-1.5">
                      <p className="text-sm text-zinc-500">
                        {source}
                      </p>
                      <p
                        className="text-[0.9375rem] leading-6 text-pretty text-zinc-700 transition-colors duration-200 group-data-[active=true]:text-zinc-900 group-data-[dim=true]:text-zinc-500"
                        id={`about-proof-${target}`}
                      >
                        {proof}
                      </p>
                    </div>
                    <a
                      aria-label={`See it: ${phrase}`}
                      className={cn(
                        'group/see mt-auto -mb-1 inline-flex w-fit items-center gap-1 py-1 text-sm font-medium text-sky-700 transition-colors duration-200 hover:text-sky-800 group-data-[dim=true]:text-zinc-500',
                        focusRing
                      )}
                      href={`#${target}`}
                      onClick={(event) => jumpToEvidence(event, target)}
                    >
                      See it
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-200 group-hover/see:translate-x-0.5"
                      />
                    </a>
                  </RevealItem>
                </li>
              );
            })}
          </ol>
        </RevealGroup>
      </div>
    </section>
  );
}
