import { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { projects, type Project } from '@/components/portfolio-home-data';
import {
  PlayBulletMarker,
  RevealGroup,
  RevealItem,
  listGapClassName,
  pageShellClassName,
  sectionHeaderCenteredClassName,
  sectionPaddingClassName
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

export function WorkSamplesSection() {
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

        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
