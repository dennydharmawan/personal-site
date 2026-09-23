import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Play, RotateCcw } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const posterAvif = '/film/stays-up-poster.avif';
const posterJpg = '/film/stays-up-poster.jpg';

type Phase = 'poster' | 'video' | 'ended';

const frameClassName = 'block size-full rounded-xl object-cover ring-1 ring-zinc-900/10';
const cornerPillClassName = 'absolute h-8 gap-1.5 px-3 text-xs';

export function StaysUpFilm({ pillClassName }: { pillClassName: string }) {
  const [phase, setPhase] = useState<Phase>('poster');
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasVideo = phase !== 'poster';
  const pill = cn(buttonVariants({ size: 'lg', variant: 'outline' }), pillClassName, cornerPillClassName);

  const playFromStart = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    video.focus();
    void video.play();
  };

  const start = () => {
    // Mount the video inside the click so play() and focus() run in the same user gesture.
    flushSync(() => setPhase('video'));
    playFromStart();
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!hasVideo || !video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.25) {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [hasVideo]);

  return (
    <div className="relative aspect-square w-full">
      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            className={frameClassName}
            controls
            muted
            playsInline
            poster={posterJpg}
            onEnded={() => setPhase('ended')}
            onPlay={() => setPhase('video')}
            onSeeking={() => setPhase('video')}
          >
            <source src="/film/stays-up-av1.mp4" type='video/mp4; codecs="av01.0.04M.08"' />
            <source src="/film/stays-up-h264.mp4" type="video/mp4" />
          </video>
          {phase === 'ended' ? (
            <button
              type="button"
              className={cn(pill, 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2')}
              onClick={playFromStart}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Replay
            </button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          aria-label="Play Stays up, a 41 second silent film"
          className={cn(
            'relative block size-full cursor-pointer rounded-xl transition-[translate,box-shadow] duration-200 ease-out',
            !shouldReduceMotion && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/10'
          )}
          onClick={start}
        >
          <picture>
            <source srcSet={posterAvif} type="image/avif" />
            <img
              src={posterJpg}
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
              alt=""
              className={frameClassName}
            />
          </picture>
          <span aria-hidden="true" className={cn(pill, 'bottom-3 left-3')}>
            <Play className="size-3 fill-current" />
            Play · 41s
          </span>
        </button>
      )}
    </div>
  );
}
