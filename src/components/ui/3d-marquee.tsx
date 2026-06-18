import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

function GridLineHorizontal({ className, offset }: { className?: string; offset?: string }) {
  return (
    <div
      className={cn(
        'absolute left-[calc(var(--offset)/2*-1)] z-30 h-[var(--height)] w-[calc(100%+var(--offset))]',
        'bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        className
      )}
      style={
        {
          '--background': '#050816',
          '--color': 'rgba(255,255,255,0.18)',
          '--fade-stop': '90%',
          '--height': '1px',
          '--offset': offset || '180px',
          '--width': '5px'
        } as CSSProperties
      }
    />
  );
}

function GridLineVertical({ className, offset }: { className?: string; offset?: string }) {
  return (
    <div
      className={cn(
        'absolute top-[calc(var(--offset)/2*-1)] z-30 h-[calc(100%+var(--offset))] w-[var(--width)]',
        'bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        className
      )}
      style={
        {
          '--background': '#050816',
          '--color': 'rgba(255,255,255,0.18)',
          '--fade-stop': '90%',
          '--height': '5px',
          '--offset': offset || '140px',
          '--width': '1px'
        } as CSSProperties
      }
    />
  );
}

export function ThreeDMarquee({ className, images }: { className?: string; images: string[] }) {
  if (images.length === 0) {
    return null;
  }

  const repeatedImages =
    images.length >= 32
      ? images
      : Array.from({ length: Math.ceil(32 / images.length) }, () => images).flat();
  const chunkSize = Math.ceil(repeatedImages.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return repeatedImages.slice(start, start + chunkSize);
  });

  return (
    <div
      className={cn(
        'mx-auto block h-[600px] overflow-hidden rounded-2xl max-sm:h-[25rem]',
        className
      )}
    >
      <div className="flex size-full items-center justify-center [perspective:1400px]">
        <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
          <div
            className="relative right-[34%] top-[34rem] grid size-full origin-top-left grid-cols-4 gap-8"
            style={{
              transform: 'rotateX(55deg) rotateY(0deg) rotateZ(-45deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{ y: colIndex % 2 === 0 ? 100 : -100 }}
                className="flex flex-col items-start gap-8"
                key={`marquee-column-${colIndex}`}
                transition={{
                  duration: colIndex % 2 === 0 ? 10 : 15,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((image, imageIndex) => (
                  <div className="relative" key={`${imageIndex}-${image}`}>
                    <GridLineHorizontal className="-top-4" offset="20px" />
                    <motion.img
                      alt=""
                      className="aspect-[970/700] select-none rounded-lg object-cover shadow-[0_16px_42px_rgba(0,0,0,0.18)] ring ring-white/10"
                      draggable={false}
                      height={700}
                      loading="lazy"
                      src={image}
                      width={970}
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
