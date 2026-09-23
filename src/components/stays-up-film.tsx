import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const posterAvif = '/film/stays-up-poster.avif';
const posterJpg = '/film/stays-up-poster.jpg';
const posterAt = 13.4;

const frameClassName = 'group relative rounded-2xl bg-zinc-100 p-1.5 ring-1 ring-zinc-900/5';
const layerClassName = 'block aspect-square w-full rounded-xl object-cover';

type Choice = 'auto' | 'play' | 'pause';

function playMuted(video: HTMLVideoElement) {
  // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
  video.muted = true;
  video.defaultMuted = true;
  video.play().catch(() => {});
}

export function StaysUpFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();
  const [choice, setChoice] = useState<Choice>('auto');
  const [isPlaying, setIsPlaying] = useState(false);
  const shouldPlay = isInView && (choice === 'play' || (choice === 'auto' && !shouldReduceMotion));

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (shouldPlay) {
      playMuted(video);
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  const toggle = () => setChoice(isPlaying ? 'pause' : 'play');

  return (
    <div className={frameClassName}>
      <div className="relative">
        {/* The poster sits under the video so it can lazy-load; a video's own poster loads with the page. */}
        <picture>
          <source srcSet={posterAvif} type="image/avif" />
          <img
            src={posterJpg}
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            alt=""
            className={layerClassName}
          />
        </picture>
        <video
          ref={videoRef}
          aria-label="Stays up, a 41 second silent film of one night at my desk in Jakarta"
          className={cn(layerClassName, 'absolute inset-0 size-full cursor-pointer')}
          disablePictureInPicture
          disableRemotePlayback
          loop
          muted
          playsInline
          preload="none"
          onClick={toggle}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => setIsPlaying(true)}
        >
          {/* Start on the poster's frame so the swap from poster to video does not jump. */}
          <source src={`/film/stays-up-av1.mp4#t=${posterAt}`} type='video/mp4; codecs="av01.0.04M.08"' />
          <source src={`/film/stays-up-h264.mp4#t=${posterAt}`} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-zinc-900/10 ring-inset" />
      </div>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause film' : 'Play film'}
        className={cn(
          'absolute right-4 bottom-4 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-zinc-900 ring-1 ring-zinc-900/10 transition-opacity duration-200 hover:bg-white focus-visible:opacity-100',
          isPlaying && 'opacity-0 group-hover:opacity-100'
        )}
        onClick={toggle}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-3.5 fill-current" />
        ) : (
          <Play aria-hidden="true" className="size-3.5 translate-x-px fill-current" />
        )}
      </button>
    </div>
  );
}
