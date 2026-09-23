import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue
} from 'motion/react';
import { projects, type Chapter, type Project } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  pageShellClassName,
  sectionHeaderMarginClassName,
  sectionPaddingClassName,
  twoColumnGapClassName
} from '@/components/sections/shared';
import { cn } from '@/lib/utils';

// One frame for all four clips: same inset, radius, ring, and backing, so they read as one body of work.
const clipFrameClassName = 'rounded-2xl bg-zinc-100 p-1.5 ring-1 ring-zinc-900/5';
const clipClassName = 'block aspect-[3/2] w-full rounded-xl object-cover ring-1 ring-zinc-900/10';

function chapterIndexAt(chapters: readonly Chapter[], seconds: number) {
  let index = 0;
  chapters.forEach((chapter, i) => {
    if (seconds >= chapter.at) {
      index = i;
    }
  });
  return index;
}

function playMuted(video: HTMLVideoElement) {
  // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
  video.muted = true;
  video.defaultMuted = true;
  video.play().catch(() => {});
}

function ChapterButton({
  chapter,
  end,
  isActive,
  onSelect,
  time
}: {
  chapter: Chapter;
  end: number;
  isActive: boolean;
  onSelect: () => void;
  time: MotionValue<number>;
}) {
  const fill = useTransform(time, [chapter.at, end], [0, 1], { clamp: true });

  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-current={isActive ? 'step' : undefined}
        className={cn(
          'grid min-h-11 w-full content-start gap-2 rounded-md pb-1 text-left text-xs leading-5 transition-colors duration-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-sm',
          isActive ? 'text-zinc-900' : 'text-zinc-500'
        )}
        onClick={onSelect}
      >
        <span aria-hidden="true" className="relative block h-0.5 w-full overflow-hidden rounded-full bg-zinc-200">
          <motion.span className="absolute inset-0 origin-left bg-sky-600" style={{ scaleX: fill }} />
        </span>
        <span className="text-pretty">{chapter.label}</span>
      </button>
    </li>
  );
}

function ProjectClip({ project }: { project: Project }) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.4 });
  const time = useMotionValue(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const { chapters } = project;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let frameId = 0;

    const sync = () => {
      time.set(video.currentTime);
      const next = chapterIndexAt(chapters, video.currentTime);

      if (next !== activeIndexRef.current) {
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
    };
    const tick = () => {
      sync();
      frameId = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frameId);
      sync();
    };
    const readDuration = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : null);
    };

    readDuration();

    if (!video.paused) {
      start();
    }

    video.addEventListener('durationchange', readDuration);
    video.addEventListener('playing', start);
    video.addEventListener('pause', stop);
    video.addEventListener('seeking', sync);

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener('durationchange', readDuration);
      video.removeEventListener('playing', start);
      video.removeEventListener('pause', stop);
      video.removeEventListener('seeking', sync);
    };
  }, [chapters, time]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isInView && !shouldReduceMotion) {
      playMuted(video);
    } else {
      video.pause();
    }
  }, [isInView, shouldReduceMotion]);

  function selectChapter(chapter: Chapter) {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const seek = () => {
      video.currentTime = chapter.at;

      if (!shouldReduceMotion) {
        playMuted(video);
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seek();
      return;
    }

    // `preload="none"` holds the file back until something asks for it; a paused seek has to ask.
    video.addEventListener('loadedmetadata', seek, { once: true });
    video.preload = 'auto';
    video.load();
  }

  return (
    <div className="grid content-start gap-3">
      <div className={clipFrameClassName}>
        <video
          ref={videoRef}
          aria-label={`${project.title}, animated walkthrough with sample data`}
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
      </div>
      <ol aria-label={`${project.title} chapters`} className="grid grid-cols-3 gap-3 px-1 sm:gap-4">
        {chapters.map((chapter, index) => (
          <ChapterButton
            key={chapter.label}
            chapter={chapter}
            end={chapters[index + 1]?.at ?? duration ?? Number.POSITIVE_INFINITY}
            isActive={index === activeIndex}
            onSelect={() => selectChapter(chapter)}
            time={time}
          />
        ))}
      </ol>
    </div>
  );
}

// Rows alternate the clip's side so four samples read as a sequence of stories, not a stack of cards.
function ProjectRow({ flip, project }: { flip: boolean; project: Project }) {
  return (
    <RevealItem>
      <article
        data-scroll-target={project.target}
        className={cn(
          'grid content-start gap-6 lg:items-center lg:gap-16',
          flip
            ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'
            : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'
        )}
      >
        <div className={flip ? 'lg:order-2' : undefined}>
          <ProjectClip project={project} />
        </div>
        <div className="grid gap-4 px-1">
          <p className="text-sm font-medium text-sky-700">{project.role}</p>
          <h3 className="font-heading text-3xl font-normal leading-tight tracking-tight text-zinc-900 text-balance sm:text-4xl">
            {project.title}
          </h3>
          <dl className="grid gap-4 border-t border-zinc-200 pt-5">
            <div className="grid gap-1">
              <dt className="text-sm font-medium text-zinc-500">Problem</dt>
              <dd className="text-base leading-7 text-zinc-700 text-pretty">{project.problem}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm font-medium text-zinc-500">What I built</dt>
              <dd className="text-base leading-7 text-zinc-700 text-pretty">{project.built}</dd>
            </div>
          </dl>
          <ul aria-label="Stack" className="flex flex-wrap gap-1.5 pt-1">
            {project.stack.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-900/10"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </RevealItem>
  );
}

export function WorkSamplesSection() {
  return (
    <section className={`bg-zinc-50 ${sectionPaddingClassName}`} data-scroll-target="work">
      <div className={pageShellClassName}>
        <RevealGroup
          className={`grid items-end ${sectionHeaderMarginClassName} ${twoColumnGapClassName} lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)]`}
        >
          <RevealItem>
            <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Work samples
            </h2>
          </RevealItem>
          <RevealItem className="grid gap-3">
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Four systems, shown as short animations with sample data: access provisioning,
              collections operations, checkout and payments, and automated code review.
            </p>
            <p className="max-w-xl text-sm leading-6 text-zinc-500 text-pretty">
              The PR reviewer runs in production at Krom Bank. The other three are NDA-safe builds.
            </p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid gap-16 lg:gap-24">
          {projects.map((project, index) => (
            <ProjectRow key={project.title} flip={index % 2 === 1} project={project} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
