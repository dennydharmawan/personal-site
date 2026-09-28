import { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const posterAvif = '/film/desk-scenery-poster.avif';
const posterJpg = '/film/desk-scenery-poster.jpg';

const layerClassName = 'block aspect-square w-full rounded-xl object-cover';

function playMuted(video: HTMLVideoElement) {
  // React sets `muted` as a property only; mobile autoplay policy checks the attribute.
  video.muted = true;
  video.defaultMuted = true;
  video.play().catch(() => {});
}

export function DeskScenery() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  // Plays only while on screen; under reduced motion the poster stands in and nothing moves.
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

  return (
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
        aria-label="A 42 second silent loop of one day at my desk in Jakarta, drawn in code"
        className={cn(layerClassName, 'absolute inset-0 size-full')}
        disablePictureInPicture
        disableRemotePlayback
        loop
        muted
        playsInline
        preload="none"
      >
        <source src="/film/desk-scenery-av1.mp4" type='video/mp4; codecs="av01.0.04M.08"' />
        <source src="/film/desk-scenery-h264.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
