import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { projects, type Project } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  Reveal,
  RevealGroup,
  RevealItem,
  detailStackGapClassName,
  listGapClassName,
  pageShellClassName,
  sectionContentGapClassName,
  sectionHeaderCenteredClassName,
  sectionPaddingClassName,
  spring
} from '@/components/sections/shared';
import { stageLayers, type StageLayerId } from '@/components/system-stage-data';

function stageLayerLabel(id: StageLayerId) {
  return stageLayers.find((layer) => layer.id === id)?.label ?? id;
}

function LayerPills({ className, layers }: { className?: string; layers: StageLayerId[] }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {layers.map((id) => (
        <span
          key={id}
          className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
        >
          {stageLayerLabel(id)}
        </span>
      ))}
    </div>
  );
}

const projectMediaClassName =
  'aspect-[3/2] w-full rounded-2xl object-cover ring-1 ring-zinc-900/10';

function ProjectMedia({ project }: { project: Project }) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.4 });

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isInView) {
      // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView]);

  if (shouldReduceMotion) {
    return (
      <img
        alt={`${project.title} interface preview`}
        className={projectMediaClassName}
        decoding="async"
        loading="lazy"
        src={project.preview}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      aria-label={`${project.title} interface recording`}
      className={projectMediaClassName}
      disablePictureInPicture
      disableRemotePlayback
      loop
      muted
      playsInline
      poster={project.preview}
      preload="none"
      src={project.video}
    />
  );
}

type WorkVariant = 'current' | 'stack' | 'grid' | 'index';

function ProjectBullets({ project }: { project: Project }) {
  return (
    <ul className={`grid ${listGapClassName}`}>
      {project.bullets.map((bullet) => (
        <li key={bullet} className="flex gap-3 text-sm font-normal leading-6 text-zinc-700">
          <PlayBulletMarker className="text-zinc-500" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectArticle({
  compact,
  index,
  project
}: {
  compact: boolean;
  index: number;
  project: Project;
}) {
  const isMediaFirst = index % 2 === 1;

  return (
    <article
      className={`grid lg:items-center ${
        compact
          ? 'gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-12'
          : 'gap-10 lg:grid-cols-2 lg:gap-16'
      }`}
      data-scroll-target={`project-${index}`}
    >
      <RevealGroup
        className={`grid ${compact ? 'gap-4' : detailStackGapClassName} ${isMediaFirst ? 'lg:order-2' : ''}`}
      >
        <div className="grid gap-3">
          <RevealItem>
            <p className="text-sm font-medium text-sky-700">{project.role}</p>
          </RevealItem>
          <RevealItem>
            <LayerPills layers={project.layers} />
          </RevealItem>
          <RevealItem>
            <h3
              className={`max-w-xl font-heading font-normal leading-tight tracking-tight text-zinc-900 text-balance ${
                compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
              }`}
            >
              {project.title}
            </h3>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              {project.summary}
            </p>
          </RevealItem>
        </div>
        <RevealItem>
          <ProjectBullets project={project} />
        </RevealItem>
        <RevealItem>
          <p className="text-sm text-zinc-500">{project.stack.join(', ')}</p>
        </RevealItem>
      </RevealGroup>

      <Reveal className={isMediaFirst ? 'lg:order-1' : undefined} delay={0.15}>
        <ProjectMedia project={project} />
      </Reveal>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <RevealItem className="grid content-start gap-5 rounded-3xl bg-white p-4 ring-1 ring-zinc-900/5 sm:p-5">
      <ProjectMedia project={project} />
      <div className="grid gap-3 px-1 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-sky-700">{project.role}</p>
          <LayerPills layers={project.layers} />
        </div>
        <h3 className="font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-900 text-balance">
          {project.title}
        </h3>
        <p className="text-sm font-normal leading-6 text-zinc-600 text-pretty">{project.summary}</p>
        <details className="group">
          <summary className="cursor-pointer list-none rounded-md text-sm font-medium text-zinc-900 outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300">
            <span className="group-open:hidden">How it works</span>
            <span className="hidden group-open:inline">Hide details</span>
          </summary>
          <div className="grid gap-3 pt-3">
            <ProjectBullets project={project} />
          </div>
        </details>
        <p className="text-xs text-zinc-500">{project.stack.join(', ')}</p>
      </div>
    </RevealItem>
  );
}

function ProjectIndex() {
  const [openIndex, setOpenIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  return (
    <RevealGroup className="grid border-t border-zinc-200">
      {projects.map((project, index) => {
        const isOpen = index === openIndex;
        const panelId = `work-panel-${index}`;

        return (
          <RevealItem key={project.title} className="border-b border-zinc-200">
            <h3>
              <button
                type="button"
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-5 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,0.6fr)]"
                onClick={() => setOpenIndex(index)}
              >
                <span className="font-mono text-xs text-zinc-400 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`font-heading text-2xl font-normal tracking-tight transition-colors sm:text-3xl ${
                    isOpen ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {project.title}
                </span>
                <span className="col-start-2 text-sm font-medium text-sky-700 md:col-start-3 md:text-right">
                  {project.role}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : spring}
                >
                  <div className="grid gap-8 pb-8 pt-2 md:pl-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
                    <div className="grid gap-4">
                      <LayerPills layers={project.layers} />
                      <p className="text-base font-normal leading-7 text-zinc-600 text-pretty">
                        {project.summary}
                      </p>
                      <ProjectBullets project={project} />
                      <p className="text-sm text-zinc-500">{project.stack.join(', ')}</p>
                    </div>
                    <ProjectMedia project={project} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

export function WorkSamplesSection({ variant = 'current' }: { variant?: WorkVariant }) {
  return (
    <section className={`bg-zinc-50 ${sectionPaddingClassName}`} data-scroll-target="work">
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderCenteredClassName}>
          <RevealItem>
            <h2 className="text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Work samples
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-2xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Employer platforms stay under NDA. These samples show the same systems work: access
              control, operational workflows, payments, and review automation.
            </p>
          </RevealItem>
        </RevealGroup>

        {variant === 'grid' ? (
          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </RevealGroup>
        ) : variant === 'index' ? (
          <ProjectIndex />
        ) : (
          <div className={`grid ${variant === 'stack' ? 'gap-14 lg:gap-16' : sectionContentGapClassName}`}>
            {projects.map((project, index) => (
              <ProjectArticle
                key={project.title}
                compact={variant === 'stack'}
                index={index}
                project={project}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
