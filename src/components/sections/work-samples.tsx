import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { projects, type Project } from '@/components/portfolio-home-data';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  pageShellClassName,
  sectionHeaderClassName,
  sectionPaddingClassName,
  spring
} from '@/components/sections/shared';
import { cn } from '@/lib/utils';

// One frame for every sample: same inset, radius, ring, and backing, so they read as one body of work.
const frameClassName = 'rounded-2xl bg-zinc-100 p-1.5 ring-1 ring-zinc-900/5';
const imageClassName = 'block aspect-[3/2] w-full rounded-xl bg-white object-contain ring-1 ring-zinc-900/10';
// The screen and the diagram share one grid cell, so switching views never changes the row's height.
const stackedClassName =
  '[grid-area:1/1] transition-opacity duration-200 motion-reduce:transition-none data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0';
const captionClassName = 'px-1 pt-2.5 text-xs leading-5 text-zinc-500 text-pretty sm:text-sm';

const views = [
  { id: 'preview', caption: null, label: 'Preview' },
  { id: 'architecture', caption: 'Simplified. Tool names and data are samples.', label: 'Architecture' }
] as const;

type View = (typeof views)[number]['id'];

// scripts/encode-screens.sh writes an AVIF and a 1024px copy beside every screen WebP; the WebP stays as the fallback.
const toAvif = (src: string) => src.replace(/\.webp$/, '.avif');
const screenSrcSet = (src: string) => `${src.replace(/(\.\w+)$/, '-1024$1')} 1024w, ${src} 1536w`;
// Side by side the screen fills the wider of two columns, about 660px; stacked it spans the page shell.
const screenSizes = '(min-width: 1024px) 660px, calc(100vw - 2.5rem)';

function ProjectViews({ project }: { project: Project }) {
  const [view, setView] = useState<View>('preview');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const shouldReduceMotion = useReducedMotion();
  const panelId = (id: View) => `${baseId}-${id}-panel`;
  const tabId = (id: View) => `${baseId}-${id}-tab`;
  const isPreview = view === 'preview';
  const { architecture, screen } = project;

  // Arrow keys move between the two tabs and select as they go, the WAI-ARIA tabs pattern.
  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

    if (step === 0) {
      return;
    }

    event.preventDefault();
    const index = (views.findIndex((item) => item.id === view) + step + views.length) % views.length;
    setView(views[index].id);
    tabRefs.current[index]?.focus();
  }

  return (
    <div className="grid content-start gap-3">
      <div
        aria-label={`${project.title} view`}
        className="flex w-fit gap-1 rounded-full bg-zinc-100 p-1 ring-1 ring-zinc-900/5"
        role="tablist"
        onKeyDown={onTabKeyDown}
      >
        {views.map((item, index) => {
          const isSelected = item.id === view;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-controls={panelId(item.id)}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                'relative h-8 rounded-full px-3.5 text-sm font-medium transition-colors duration-200 after:absolute after:-inset-1.5 [--focus-offset:2px]',
                isSelected ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
              )}
              onClick={() => setView(item.id)}
            >
              {isSelected ? (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white ring-1 ring-zinc-900/10"
                  layoutId={`${baseId}-tab-pill`}
                  transition={shouldReduceMotion ? { duration: 0 } : spring}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className={cn(frameClassName, 'grid')}>
        <div
          aria-labelledby={tabId('preview')}
          className={stackedClassName}
          data-hidden={!isPreview}
          id={panelId('preview')}
          inert={!isPreview}
          role="tabpanel"
        >
          {/* A phone gets the one card that tells the story; the full screen's text would land at 3 px. */}
          <picture>
            <source
              height={screen.phone.height}
              media="(max-width: 639px)"
              srcSet={toAvif(screen.phone.src)}
              type="image/avif"
              width={screen.phone.width}
            />
            <source sizes={screenSizes} srcSet={screenSrcSet(toAvif(screen.src))} type="image/avif" />
            <source
              height={screen.phone.height}
              media="(max-width: 639px)"
              srcSet={screen.phone.src}
              width={screen.phone.width}
            />
            <img
              alt={screen.alt}
              className={cn(imageClassName, 'aspect-(--phone-aspect) sm:aspect-[3/2]')}
              decoding="async"
              height={1024}
              loading="lazy"
              sizes={screenSizes}
              src={screen.src}
              srcSet={screenSrcSet(screen.src)}
              style={{ '--phone-aspect': `${screen.phone.width} / ${screen.phone.height}` } as CSSProperties}
              width={1536}
            />
          </picture>
        </div>
        <div
          aria-labelledby={tabId('architecture')}
          className={cn(stackedClassName, 'self-center')}
          data-hidden={isPreview}
          id={panelId('architecture')}
          inert={isPreview}
          role="tabpanel"
        >
          <img
            alt={architecture.alt}
            className={imageClassName}
            decoding="async"
            height={960}
            loading="lazy"
            src={architecture.src}
            width={1440}
          />
        </div>
      </div>
      <div className="grid">
        {views.map((item) =>
          item.caption ? (
            <p
              key={item.id}
              aria-hidden={item.id !== view}
              className={cn(captionClassName, stackedClassName)}
              data-hidden={item.id !== view}
            >
              {item.caption}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
}

// Rows alternate the screen's side so the samples read as a sequence of stories, not a stack of cards.
// Stacked, the title leads so the screen below it has a subject. Side by side, the screen spans all four
// rows and the two 1fr rows around the text center it against the screen.
function ProjectRow({ flip, project }: { flip: boolean; project: Project }) {
  const textColumn = flip ? 'lg:col-start-1' : 'lg:col-start-2';

  // Each row reveals on its own entry, so a row below the fold still animates when it arrives.
  return (
    <Reveal>
      <article
        data-scroll-target={project.target}
        className={cn(
          'grid content-start gap-6 lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-16 lg:gap-y-0',
          flip
            ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'
            : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'
        )}
      >
        <header className={cn('grid gap-2 px-1 lg:row-start-2', textColumn)}>
          <h3 className="font-heading text-3xl font-normal leading-tight tracking-tight text-zinc-900 text-balance sm:text-4xl">
            {project.title}
          </h3>
          <p className="font-heading text-xl font-normal leading-snug tracking-tight text-zinc-500 text-pretty sm:text-2xl">
            {project.problem}
          </p>
        </header>
        <div
          className={cn(
            'lg:row-span-4 lg:row-start-1 lg:self-center',
            flip ? 'lg:col-start-2' : 'lg:col-start-1'
          )}
        >
          <ProjectViews project={project} />
        </div>
        <div className={cn('grid gap-4 px-1 lg:row-start-3 lg:pt-4', textColumn)}>
          <dl className="grid gap-4 border-t border-zinc-200 pt-5">
            <div className="grid gap-1">
              <dt className="text-sm font-medium text-zinc-500">What I built</dt>
              <dd className="text-base leading-7 text-zinc-700 text-pretty">{project.built}</dd>
            </div>
          </dl>
          <p className="text-sm leading-6 text-zinc-500 text-pretty">
            <span className="sr-only">Stack: </span>
            {project.stack.join(' · ')}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function WorkSamplesSection() {
  return (
    <section className={`bg-zinc-50 ${sectionPaddingClassName}`} data-scroll-target="work">
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderClassName}>
          <RevealItem>
            <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Work samples
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Most of my work is private to the companies I built it for. Here are three samples and the problem I solved in each.
            </p>
          </RevealItem>
        </RevealGroup>

        <div className="grid gap-16 lg:gap-24">
          {projects.map((project, index) => (
            <ProjectRow key={project.title} flip={index % 2 === 1} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
