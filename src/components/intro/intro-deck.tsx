import { Fragment, useEffect, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Network, X } from 'lucide-react';
import { revealSteps, slides, stack, storyOrder, stories } from '@/components/intro/intro-data';
import type { Flow, Slide, Story, StoryId } from '@/components/intro/intro-data';
import { profileLinks, siteMeta, trustedTeams } from '@/components/portfolio-home-data';
import { contactEmail } from '@/components/sections/shared';
import { cn } from '@/lib/utils';

const panelClassName = 'border-[3px] border-zinc-900 bg-white shadow-[6px_6px_0_0_var(--color-zinc-900)]';
const pressableClassName =
  'inline-flex items-center gap-2 border-2 border-zinc-900 font-semibold text-zinc-900 shadow-[3px_3px_0_0_var(--color-zinc-900)] transition-[translate,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--color-zinc-900)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-600 disabled:pointer-events-none disabled:opacity-40';
const stickerClassName =
  'inline-flex items-center border-2 border-zinc-900 px-2.5 py-1 text-sm font-semibold text-zinc-900';
// Unrevealed steps stay faint, so the panel never looks empty.
const revealClassName = 'transition-opacity duration-300 ease-out deck:data-[shown=false]:opacity-15';

type DeckState = { slide: number; step: number };
type DeckAction = { type: 'next' } | { type: 'previous' } | { slide: number; type: 'go' };

const steps = slides.map(revealSteps);
const lastSlide = slides.length - 1;

function deckReducer(state: DeckState, action: DeckAction): DeckState {
  switch (action.type) {
    case 'next':
      if (state.step < steps[state.slide]) return { ...state, step: state.step + 1 };
      return state.slide < lastSlide ? { slide: state.slide + 1, step: 0 } : state;
    case 'previous':
      if (state.step > 0) return { ...state, step: state.step - 1 };
      // Walking back lands on a slide that is already fully built.
      return state.slide > 0 ? { slide: state.slide - 1, step: steps[state.slide - 1] } : state;
    case 'go':
      return { slide: Math.min(Math.max(action.slide, 0), lastSlide), step: 0 };
  }
}

function slideTitle(slide: Slide) {
  if (slide.kind === 'intro') return 'Who I am';
  if (slide.kind === 'story') return slide.story.name;
  return 'Tech stack';
}

function slideShortTitle(slide: Slide) {
  if (slide.kind === 'intro') return 'Intro';
  if (slide.kind === 'story') return slide.story.shortName;
  return 'Stack';
}

function architectureDialogId(story: Story) {
  return `architecture-${story.id}`;
}

function openArchitecture(story: Story) {
  document.querySelector<HTMLDialogElement>(`#${architectureDialogId(story)}`)?.showModal();
}

type Diagrams = Record<StoryId, ReactNode>;

/** Astro passes each architecture SVG as a named slot, so React never re-renders the markup. */
export default function IntroDeck({
  employeeAccess,
  lending,
  loanCollections,
  prReviewer,
  yearsExperience
}: {
  employeeAccess?: ReactNode;
  lending?: ReactNode;
  loanCollections?: ReactNode;
  prReviewer?: ReactNode;
  yearsExperience: number;
}) {
  const diagrams: Diagrams = {
    'employee-access': employeeAccess,
    lending,
    'loan-collections': loanCollections,
    'pr-reviewer': prReviewer
  };
  const [state, dispatch] = useReducer(deckReducer, { slide: 0, step: 0 });
  const current = slides[state.slide];

  useEffect(() => {
    const fromHash = Number.parseInt(window.location.hash.slice(1), 10);
    if (Number.isInteger(fromHash)) dispatch({ slide: fromHash - 1, type: 'go' });
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', state.slide === 0 ? window.location.pathname : `#${state.slide + 1}`);
  }, [state.slide]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      const onControl = event.target instanceof Element && event.target.closest('button, a');
      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          dispatch({ type: 'next' });
          break;
        case ' ':
          if (onControl) return;
          dispatch({ type: 'next' });
          break;
        case 'ArrowLeft':
        case 'PageUp':
          dispatch({ type: 'previous' });
          break;
        case 'Home':
          dispatch({ slide: 0, type: 'go' });
          break;
        case 'End':
          dispatch({ slide: lastSlide, type: 'go' });
          break;
        case 'a':
        case 'A':
          if (current.kind !== 'story') return;
          openArchitecture(current.story);
          break;
        default:
          return;
      }
      event.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current]);

  return (
    <main
      className="min-h-dvh bg-sky-50 text-zinc-900 print:bg-white"
      style={{
        backgroundImage: 'radial-gradient(var(--color-zinc-300) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }}
    >
      <h1 className="sr-only">Denny Dharmawan, introduction</h1>
      <DeckControls dispatch={dispatch} state={state} />
      <p aria-live="polite" className="sr-only">
        {`Slide ${state.slide + 1} of ${slides.length}: ${slideTitle(current)}`}
      </p>
      {slides.map((slide, index) => {
        const active = index === state.slide;
        // Off-screen slides render fully built, because the phone layout and print show them all.
        const step = active ? state.step : revealSteps(slide);
        return (
          <Fragment key={index}>
            <SlideFrame active={active} label={`Slide ${index + 1} of ${slides.length}: ${slideTitle(slide)}`}>
              {slide.kind === 'intro' && <IntroSlide yearsExperience={yearsExperience} />}
              {slide.kind === 'story' && (
                <StorySlide number={storyOrder.indexOf(slide.story.id) + 1} step={step} story={slide.story} />
              )}
              {slide.kind === 'stack' && <StackSlide />}
            </SlideFrame>
            {slide.kind === 'story' && <ArchitectureDialog diagram={diagrams[slide.story.id]} story={slide.story} />}
          </Fragment>
        );
      })}
    </main>
  );
}

function SlideFrame({ active, children, label }: { active: boolean; children: ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      className="flex min-h-dvh items-center py-12 deck:h-dvh deck:pt-6 deck:pb-24 short:pt-3 short:pb-16 deck:data-[active=false]:hidden print:h-[7.5in] print:min-h-0 print:break-after-page print:py-8"
      data-active={String(active)}
    >
      <div className="mx-auto grid w-[min(1200px,calc(100%-2.5rem))] gap-6 wide:gap-7 short:gap-4">{children}</div>
    </section>
  );
}

function IntroSlide({ yearsExperience }: { yearsExperience: number }) {
  return (
    <>
      <div className="grid gap-5">
        <p className={cn(stickerClassName, 'w-fit bg-sky-300')}>Senior Full-Stack Engineer, Jakarta</p>
        <p className="font-heading text-6xl font-extrabold tracking-tight wide:text-8xl">Denny Dharmawan</p>
        <p className="max-w-3xl text-xl text-zinc-700 wide:text-2xl">
          {`Senior full-stack engineer with ${yearsExperience}+ years of experience. I've built distributed systems for Indonesian digital banks, from lending backends at Jenius handling 2M+ transactions a month to workflow orchestration at Krom Bank.`}
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 wide:grid-cols-4">
        {storyOrder.map((id, index) => (
          <li key={id} className={cn(panelClassName, 'grid gap-1 p-4')}>
            <span className="font-heading text-3xl font-extrabold text-sky-700">{`0${index + 1}`}</span>
            <span className="text-lg font-semibold">{stories[id].name}</span>
          </li>
        ))}
      </ol>
      <ul aria-label="Where I have worked" className="flex flex-wrap items-center gap-4">
        {trustedTeams.map((team) => (
          <li key={team.name} className={cn(panelClassName, 'flex h-14 items-center px-4 shadow-[4px_4px_0_0_var(--color-zinc-900)]')}>
            <img
              alt={team.name}
              className="h-6 w-auto max-w-[7rem] object-contain grayscale"
              decoding="async"
              height={team.logoHeight}
              src={team.logo}
              width={team.logoWidth}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function StorySlide({ number, step, story }: { number: number; step: number; story: Story }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn(stickerClassName, 'bg-zinc-900 text-white')}>{`0${number}`}</span>
        <span className={cn(stickerClassName, 'bg-sky-300')}>{story.name}</span>
        <span className={cn(stickerClassName, 'bg-white')}>{`${story.context}, ${story.period}`}</span>
      </div>
      <div className="grid items-start gap-6 wide:grid-cols-[1fr_auto] wide:gap-10">
        <div className="grid gap-3">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-balance wide:text-5xl short:text-4xl">
            {story.headline}
          </h2>
          <p className="max-w-4xl text-lg text-pretty text-zinc-700 wide:text-xl short:text-base">{story.problem}</p>
          <p className="flex max-w-3xl flex-wrap items-baseline gap-2 font-semibold text-pretty short:text-sm">
            <span className={cn(stickerClassName, 'bg-white py-0.5 text-xs tracking-wide uppercase')}>My part</span>
            {story.role}
          </p>
        </div>
        <p className={cn(panelClassName, 'grid w-fit gap-1 bg-emerald-200 px-5 py-4 wide:min-w-56 short:py-3')}>
          <span className="font-heading text-4xl font-extrabold wide:text-5xl short:text-4xl">{story.proof.value}</span>
          <span className="max-w-56 font-semibold">{story.proof.label}</span>
        </p>
      </div>
      <div className={cn(panelClassName, 'relative mt-3 p-4 pt-7 wide:p-5 wide:pt-7')}>
        <button
          className={cn(pressableClassName, 'absolute -top-5 right-4 bg-sky-300 px-3 py-2 print:hidden')}
          onClick={() => openArchitecture(story)}
          type="button"
        >
          <Network aria-hidden className="size-4" />
          Show the architecture
        </button>
        <FlowDiagram flow={story.flow} step={step} />
      </div>
    </>
  );
}

function FlowDiagram({ flow, step }: { flow: Flow; step: number }) {
  return (
    <ol aria-label="How it works" className="flex flex-col items-stretch gap-2 wide:flex-row wide:items-center">
      {flow.map((column, index) => (
        <li
          key={index}
          className={cn(revealClassName, 'flex flex-col items-stretch gap-2 wide:flex-1 wide:flex-row wide:items-center')}
          data-shown={String(step >= index)}
        >
          {index > 0 && <ArrowRight aria-hidden className="size-6 shrink-0 rotate-90 self-center wide:rotate-0" />}
          <ul className="grid flex-1 gap-2">
            {column.map((node) => (
              <li key={node.label} className="grid border-2 border-zinc-900 bg-white px-3 py-2 short:py-1">
                <span className="font-semibold">{node.label}</span>
                {node.tag && <span className="text-sm text-zinc-600">{node.tag}</span>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function ArchitectureDialog({ diagram, story }: { diagram: ReactNode; story: Story }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      aria-labelledby={`${architectureDialogId(story)}-title`}
      className={cn(
        panelClassName,
        'm-auto max-h-[calc(100dvh-2rem)] w-[min(1240px,calc(100%-2rem))] max-w-none overflow-auto p-0 backdrop:bg-zinc-900/60',
        'print:static print:block print:h-[7.5in] print:max-h-none print:w-full print:break-after-page print:overflow-visible print:border-0 print:shadow-none'
      )}
      id={architectureDialogId(story)}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
      ref={dialog}
    >
      <div className="grid gap-4 p-5 wide:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight" id={`${architectureDialogId(story)}-title`}>
            {`${story.name}: architecture`}
          </h2>
          <button
            className={cn(pressableClassName, 'bg-white px-3 py-2 print:hidden')}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            <X aria-hidden className="size-4" />
            Close
          </button>
        </div>
        {diagram ? (
          // Wide enough to read on a phone, which scrolls it sideways. Short enough to fit a 720px share.
          <div className="overflow-x-auto [&_svg]:h-auto [&_svg]:max-h-[calc(100dvh-8rem)] [&_svg]:w-full [&_svg]:min-w-[960px] print:[&_svg]:max-h-[6.5in]">
            {diagram}
          </div>
        ) : (
          <p className="text-zinc-600">The diagram for this system is not drawn yet.</p>
        )}
      </div>
    </dialog>
  );
}

function StackSlide() {
  return (
    <>
      <h2 className="font-heading text-5xl font-extrabold tracking-tight wide:text-7xl">Tech stack</h2>
      <ul className="grid gap-4 sm:grid-cols-2 wide:grid-cols-4">
        {stack.map((group) => (
          <li key={group.name} className={cn(panelClassName, 'grid content-start gap-3 p-5')}>
            <h3 className={cn(stickerClassName, 'w-fit bg-sky-300')}>{group.name}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="border-2 border-zinc-900 bg-white px-2.5 py-1 font-semibold">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <ul aria-label="Contact" className="flex flex-wrap gap-3">
        <ContactLink href={`mailto:${contactEmail}`}>{contactEmail}</ContactLink>
        <ContactLink href={profileLinks.linkedIn}>LinkedIn</ContactLink>
        <ContactLink href={siteMeta.url}>dennydharmawan.com</ContactLink>
      </ul>
    </>
  );
}

function ContactLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <li>
      <a className={cn(pressableClassName, 'bg-white px-4 py-2 no-underline')} href={href}>
        {children}
      </a>
    </li>
  );
}

function DeckControls({ dispatch, state }: { dispatch: (action: DeckAction) => void; state: DeckState }) {
  return (
    <nav aria-label="Slides" className="fixed inset-x-0 bottom-0 hidden items-center justify-center gap-3 p-4 deck:flex short:p-2">
      <button
        className={cn(pressableClassName, 'bg-white px-3 py-2')}
        disabled={state.slide === 0 && state.step === 0}
        onClick={() => dispatch({ type: 'previous' })}
        type="button"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back
      </button>
      <ol className="flex gap-1.5">
        {slides.map((slide, index) => (
          <li key={index}>
            <button
              aria-current={index === state.slide ? 'step' : undefined}
              className={cn(
                pressableClassName,
                'bg-white px-2.5 py-2 text-sm aria-[current=step]:bg-sky-300',
                index < state.slide && 'bg-zinc-100'
              )}
              onClick={() => dispatch({ slide: index, type: 'go' })}
              type="button"
            >
              <span aria-hidden>{slideShortTitle(slide)}</span>
              <span className="sr-only">{slideTitle(slide)}</span>
            </button>
          </li>
        ))}
      </ol>
      <button
        className={cn(pressableClassName, 'bg-zinc-900 px-3 py-2 text-white')}
        disabled={state.slide === lastSlide}
        onClick={() => dispatch({ type: 'next' })}
        type="button"
      >
        Next
        <ArrowRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
