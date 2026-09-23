import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject
} from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { GlyphTile } from '@/components/about-glyphs';
import {
  aboutEvidence,
  aboutParagraph,
  type EvidenceTarget
} from '@/components/portfolio-home-data';
import {
  instant,
  overshootEase,
  pageShellClassName,
  revealEase,
  scrollToTargetName,
  sectionPaddingBottomClassName,
  useRevealState
} from '@/components/sections/shared';
import { cn } from '@/lib/utils';

const noteOrder = aboutParagraph.flatMap((segment) =>
  typeof segment === 'string' ? [] : [segment.evidence]
);

const focusRing =
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600';
// The router only hears hashchange, which a second click on the same hash never fires.
function jumpToEvidence(event: MouseEvent<HTMLAnchorElement>, target: EvidenceTarget) {
  if (!scrollToTargetName(target)) {
    return;
  }

  event.preventDefault();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${target}`
  );
}

const underline =
  'bg-no-repeat transition-colors duration-200 [background-image:linear-gradient(var(--color-sky-600),var(--color-sky-600))] [background-position:0_calc(100%-0.04em)] [background-size:100%_2px] group-data-[active=true]:bg-sky-50';

// Margin notes need real line positions, which only exist once the paragraph has wrapped.
const marginQuery = '(min-width: 80rem)';
const noteGap = 20;
const noteMetaCenter = 14;

// The entrance plays once, when the paragraph's top clears the lower 30% of the viewport.
// Phrases go in reading order: the tile pops, its glyph plays, its underline draws, then its note lands.
const entranceRootMargin = '0px 0px -30% 0px';
const firstBeat = 0.35;
const beatGap = 0.42;
const underlineDraw = 0.5;
const beat = (index: number) => firstBeat + index * beatGap;
const underlineStart = (index: number) => beat(index) + 0.12;

const fadeIn = (delay: number, duration: number): Variants => ({
  hidden: { opacity: 0, transition: instant },
  visible: { opacity: 1, transition: { delay, duration, ease: 'linear' } }
});

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

const noteIn = (at: number): Variants => ({
  hidden: { opacity: 0, transform: 'translateX(-6px)', transition: instant },
  visible: {
    opacity: 1,
    transform: 'translateX(0px)',
    transition: { delay: at, duration: 0.45, ease: revealEase }
  }
});

// Motion only propagates a parent's variant to children that mounted with variants, so notes
// below xl hold a variant that keeps them shown instead of dropping the prop.
const noteStays: Variants = {
  hidden: { opacity: 1, transform: 'translateX(0px)', transition: instant },
  visible: { opacity: 1, transform: 'translateX(0px)', transition: instant }
};

type NoteLayout = { height: number; tops: Partial<Record<EvidenceTarget, number>> };

function useMarginNotes(paragraphRef: RefObject<HTMLParagraphElement | null>) {
  const listRef = useRef<HTMLOListElement>(null);
  const phraseStarts = useRef(new Map<EvidenceTarget, HTMLElement>());
  const notes = useRef(new Map<EvidenceTarget, HTMLLIElement>());
  const [layout, setLayout] = useState<NoteLayout | null>(null);

  useLayoutEffect(() => {
    const paragraph = paragraphRef.current;
    const list = listRef.current;

    if (!paragraph || !list) {
      return;
    }

    const media = window.matchMedia(marginQuery);

    const place = () => {
      if (!media.matches) {
        setLayout(null);
        return;
      }

      const base = list.getBoundingClientRect().top;
      const tops: NoteLayout['tops'] = {};
      let floor = 0;

      for (const target of noteOrder) {
        const start = phraseStarts.current.get(target)?.getClientRects()[0];
        const note = notes.current.get(target);

        if (!start || !note) {
          return;
        }

        const top = Math.max(start.top + start.height / 2 - noteMetaCenter - base, floor);
        tops[target] = top;
        floor = top + note.offsetHeight + noteGap;
      }

      setLayout({ height: floor, tops });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(paragraph);
    media.addEventListener('change', place);
    window.addEventListener('resize', place);
    document.fonts.ready.then(place);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', place);
      window.removeEventListener('resize', place);
    };
  }, [paragraphRef]);

  return { layout, listRef, notes, phraseStarts };
}

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
  const { layout, listRef, notes, phraseStarts } = useMarginNotes(paragraphRef);
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
  const pair = (target: EvidenceTarget, replays = false) => ({
    onBlur: () => setActive(null),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      setActive(target);

      if (replays && event.currentTarget.matches(':focus-visible')) {
        replay(target);
      }
    },
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      setActive(target);

      if (replays) {
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
        <h2 className="sr-only" id="about-heading">
          About me
        </h2>

        <motion.div
          animate={phase}
          className="grid gap-y-12 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] xl:gap-x-24"
          initial={false}
          variants={{ hidden: {}, visible: {} }}
          onAnimationComplete={(definition) => {
            if (definition === 'visible') {
              setEntrancePlaying(false);
            }
          }}
        >
          <div className="grid content-start gap-8">
            <motion.p
              ref={paragraphRef}
              className="max-w-[34em] font-heading text-[clamp(1.5rem,2.4vw,2.25rem)] font-normal leading-[1.36] tracking-tight text-pretty text-zinc-900"
              variants={fadeIn(0, 0.5)}
            >
              {aboutParagraph.map((segment) => {
                if (typeof segment === 'string') {
                  return segment;
                }

                const target = segment.evidence;
                const index = noteOrder.indexOf(target);
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
                        ref={(node) => {
                          if (node) {
                            phraseStarts.current.set(target, node);
                          }
                        }}
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

            <motion.div
              className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-base"
              variants={fadeIn(0.2, 0.4)}
            >
              <a
                className={cn(
                  'font-medium text-sky-700 underline decoration-sky-600/40 decoration-2 underline-offset-[5px] transition-colors hover:text-sky-800 hover:decoration-sky-600',
                  focusRing
                )}
                href="/resume.pdf"
                rel="noopener"
                target="_blank"
              >
                Download resume
              </a>
              <span className="text-zinc-500">Jakarta, UTC+7</span>
            </motion.div>
          </div>

          <ol
            ref={listRef}
            aria-label="Evidence for each linked phrase"
            className="relative grid gap-6 border-t border-zinc-200 pt-8 md:grid-cols-2 md:gap-x-12 xl:block xl:border-t-0 xl:pt-0"
            style={layout ? { height: layout.height } : undefined}
          >
            {noteOrder.map((target, index) => {
              const { glyph, proof, source } = aboutEvidence[target];
              const top = layout?.tops[target];

              return (
                <motion.li
                  key={target}
                  ref={(node) => {
                    if (node) {
                      notes.current.set(target, node);
                    }
                  }}
                  className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-1 transition-colors duration-200 xl:border-l xl:border-zinc-200 xl:pl-5 data-[active=true]:xl:border-sky-600"
                  data-active={active === target}
                  data-dim={active !== null && active !== target}
                  style={top === undefined ? undefined : { left: 0, position: 'absolute', right: 0, top }}
                  // In the margin a note lands as its underline ends. Under the paragraph it is usually
                  // still off screen during the entrance, so it skips it rather than arrive late.
                  variants={layout ? noteIn(underlineStart(index) + underlineDraw) : noteStays}
                  {...pair(target)}
                >
                  <GlyphTile
                    className="text-[1.375rem] transition-opacity duration-200 group-data-[dim=true]:opacity-45"
                    glyph={glyph}
                  />
                  <div>
                    <p className="text-sm text-zinc-500 transition-colors duration-200 group-data-[dim=true]:text-zinc-400">
                      {source}
                    </p>
                    <p className="mt-1 text-[0.9375rem] leading-6 text-pretty">
                      <span
                        className="text-zinc-700 transition-colors duration-200 group-data-[active=true]:text-zinc-900 group-data-[dim=true]:text-zinc-400"
                        id={`about-proof-${target}`}
                      >
                        {proof}
                      </span>{' '}
                      <a
                        className={cn(
                          'whitespace-nowrap font-medium text-sky-700 transition-colors duration-200 hover:text-sky-800 group-data-[dim=true]:text-zinc-400',
                          focusRing
                        )}
                        aria-label={`See it: ${aboutEvidence[target].phrase}`}
                        href={`#${target}`}
                        onClick={(event) => jumpToEvidence(event, target)}
                      >
                        See it
                      </a>
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
