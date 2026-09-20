import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { projects, type Project } from '@/components/portfolio-home-data';
import { RequestPath } from '@/components/sections/request-path';
import {
  PlayBulletMarker,
  RevealGroup,
  RevealItem,
  listGapClassName,
  pageShellClassName,
  sectionHeaderCenteredClassName,
  sectionPaddingClassName
} from '@/components/sections/shared';
import { requestPathLayers, type StageLayerId } from '@/components/system-stage-data';
import { cn } from '@/lib/utils';

function stageLayerLabel(id: StageLayerId) {
  return requestPathLayers.find((layer) => layer.id === id)?.label ?? id;
}

function LayerPills({ activeHop, layers }: { activeHop: StageLayerId | null; layers: StageLayerId[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {layers.map((id) => (
        <span
          key={id}
          className={cn(
            'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-300',
            activeHop === id ? 'bg-sky-50 text-sky-800' : 'bg-zinc-100 text-zinc-600'
          )}
        >
          {stageLayerLabel(id)}
        </span>
      ))}
    </div>
  );
}

// One frame for all four clips: same inset, radius, ring, and backing, so they read as one body of work.
const clipFrameClassName = 'rounded-2xl bg-zinc-100 p-1.5 ring-1 ring-zinc-900/5';
const clipClassName = 'block aspect-[3/2] w-full rounded-xl object-cover ring-1 ring-zinc-900/10';

function ProjectMedia({ project, startOffset }: { project: Project; startOffset: number }) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSeeked = useRef(false);
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

      // Two clips share a duration, so they would loop in lockstep without a per-card head start.
      if (!hasSeeked.current) {
        hasSeeked.current = true;
        const seek = () => {
          video.currentTime = Math.min(startOffset, video.duration - 0.1);
        };

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          seek();
        } else {
          video.addEventListener('loadedmetadata', seek, { once: true });
        }
      }

      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView, startOffset]);

  if (shouldReduceMotion) {
    return (
      <img
        alt={`${project.title} interface preview`}
        className={clipClassName}
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
      className={clipClassName}
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
          <span className="text-pretty">{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectCard({
  activeHop,
  index,
  project
}: {
  activeHop: StageLayerId | null;
  index: number;
  project: Project;
}) {
  const isDimmed = activeHop !== null && !project.layers.includes(activeHop);

  return (
    <RevealItem>
      <article
        className={cn(
          'grid content-start gap-5 rounded-3xl bg-white p-4 ring-1 ring-zinc-900/5 transition duration-300 sm:p-5',
          isDimmed && 'opacity-45',
          activeHop !== null && !isDimmed && 'ring-sky-600/30'
        )}
      >
        <div className={clipFrameClassName}>
          <ProjectMedia project={project} startOffset={index * 2.6} />
        </div>
        <div className="grid gap-3 px-1 pb-2">
          <p className="text-sm font-medium text-sky-700">{project.role}</p>
          <h3 className="font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-900 text-balance">
            {project.title}
          </h3>
          <p className="text-sm font-normal leading-6 text-zinc-600 text-pretty">{project.summary}</p>
          <LayerPills activeHop={activeHop} layers={project.layers} />
          <details className="group" open>
            <summary className="inline-flex w-fit min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-md text-sm font-medium text-zinc-900 hover:text-sky-700">
              <span className="group-open:hidden">How it works</span>
              <span className="hidden group-open:inline">Hide details</span>
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="grid gap-3 pb-1">
              <ProjectBullets project={project} />
            </div>
          </details>
          <p className="text-xs text-zinc-500">{project.stack.join(', ')}</p>
        </div>
      </article>
    </RevealItem>
  );
}

export function WorkSamplesSection() {
  const [pinnedHop, setPinnedHop] = useState<StageLayerId | null>(null);
  const [previewHop, setPreviewHop] = useState<StageLayerId | null>(null);
  const activeHop = previewHop ?? pinnedHop;

  function toggleHop(id: StageLayerId) {
    setPinnedHop((current) => (current === id ? null : id));
  }

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
              Four systems, each recorded running: access provisioning, collections operations,
              checkout and payments, and automated code review.
            </p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="mb-12 grid gap-4 md:mb-16">
          <RevealItem>
            <RequestPath
              className="max-w-2xl lg:max-w-none"
              activeHop={activeHop}
              onPreview={setPreviewHop}
              onToggle={toggleHop}
              pinnedHop={pinnedHop}
            />
          </RevealItem>
          <RevealItem>
            <p className="max-w-2xl text-xs leading-5 text-zinc-500 text-pretty">
              Employer systems stay under NDA. These four are NDA-safe builds of the same patterns.
            </p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              activeHop={activeHop}
              index={index}
              project={project}
            />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
