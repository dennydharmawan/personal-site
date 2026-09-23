import { ChevronDown, Download } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { trustedTeams } from '@/components/portfolio-home-data';
import {
  detailStackGapClassName,
  getYearsExperience,
  pageShellClassName,
  riseDelay,
  scrollToTarget,
  trustedLogoToneClassName
} from '@/components/sections/shared';
import { Button } from '@/components/ui/button';

const shellWidth = 'calc(100vw - 2.5rem)';

// One crop per breakpoint range, each framed for the band height that range renders.
// A picture takes the first source whose media matches, so the narrowest range comes first.
const heroPhotoBands = [
  { media: '(max-width: 639px)', sizes: shellWidth, slug: 'mobile', widths: [500, 700, 1000, 1200] },
  { media: '(max-width: 1023px)', sizes: shellWidth, slug: 'tablet', widths: [1000, 1456, 1774] },
  { media: undefined, sizes: `min(1280px, ${shellWidth})`, slug: 'desktop', widths: [1280, 1774] }
];

const heroPhotoFormats = ['avif', 'webp'];

function heroPhotoSrcSet(slug: string, widths: number[], format: string) {
  return widths
    .map((width) => `/portfolio-previews/hero-team-${slug}-${width}.${format} ${width}w`)
    .join(', ');
}

function HeroPhoto({ className }: { className: string }) {
  return (
    <div className="relative z-10 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-zinc-900/5">
      <picture>
        {heroPhotoBands.flatMap((band) =>
          heroPhotoFormats.map((format) => (
            <source
              key={`${band.slug}-${format}`}
              media={band.media}
              sizes={band.sizes}
              srcSet={heroPhotoSrcSet(band.slug, band.widths, format)}
              type={`image/${format}`}
            />
          ))
        )}
        <img
          alt="Team collaborating around a laptop with attention directed toward the next action"
          className={`block w-full object-cover ${className}`}
          decoding="async"
          fetchPriority="high"
          height={312}
          src="/portfolio-previews/hero-team-desktop-1280.jpg"
          width={1280}
        />
      </picture>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(280%_160%_at_50%_0%,transparent_32%,black_64%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_100%,var(--color-sky-100)_0%,var(--color-sky-200)_45%,var(--color-sky-400)_100%)] opacity-40" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,--alpha(var(--color-white)/78%)_0_1px,transparent_1px_8px)] opacity-40" />
    </div>
  );
}

function HeroHeadline({ className }: { className: string }) {
  return (
    <h1 className={`font-heading font-normal tracking-tight text-zinc-900 ${className}`}>
      Senior Full-Stack Engineer
      <span className="block pt-1 text-balance text-zinc-500 sm:pt-2">for Indonesian digital banks.</span>
    </h1>
  );
}

function HeroLede({ className = '' }: { className?: string }) {
  return (
    <p className={`max-w-xl text-base font-normal leading-7 text-zinc-700 text-balance ${className}`}>
      I build access control at Krom Bank. Before that I ran lending backends at Jenius at 2M+
      transactions a month and 99.98% uptime.
    </p>
  );
}

function HeroActions({ className = '' }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`grid w-full gap-3 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center ${className}`}
    >
      <Button
        size="lg"
        className="group min-h-11 w-full px-3 has-data-[icon=inline-end]:pr-3 min-[420px]:w-auto sm:px-4 sm:has-data-[icon=inline-end]:pr-4"
        onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
      >
        View work samples
        <ChevronDown data-icon="inline-end" className="size-4" />
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="min-h-11 w-full px-3 min-[420px]:w-auto sm:px-4"
      >
        <a href="/resume.pdf" rel="noopener" target="_blank">
          <Download data-icon="inline-start" />
          Download resume
        </a>
      </Button>
    </div>
  );
}

function TrustedLogos({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-8 lg:gap-x-10 ${className}`}>
      {trustedTeams.map((team) => (
        <span key={team.name} className="inline-flex h-10 items-center justify-start">
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className={`${team.logoClassName} ${trustedLogoToneClassName} w-auto object-contain`}
            decoding="async"
            height={team.logoHeight}
            width={team.logoWidth}
          />
        </span>
      ))}
    </div>
  );
}

const trustedLine = "Where I've built banking systems";

function HeroProofBlock({ yearsExperience }: { yearsExperience: number }) {
  return (
    <div className="grid gap-5 pt-2">
      <p className="flex items-baseline gap-2.5">
        <span className="text-5xl font-semibold leading-none text-zinc-700 tabular-nums">
          {yearsExperience}+
        </span>
        <span className="text-sm font-medium leading-5 text-zinc-600">years of experience</span>
      </p>

      <div className="grid gap-3">
        <p className="max-w-md text-sm font-medium leading-6 text-zinc-700 text-pretty">
          {trustedLine}
        </p>
        <TrustedLogos />
      </div>
    </div>
  );
}

export function HeroSection() {
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate border-b border-zinc-200 bg-white pb-16 pt-24 sm:pt-28 md:pb-20 lg:pb-24">
      <HeroBackdrop />
      <div className={`${pageShellClassName} grid gap-10 md:gap-12`}>
        <div className="grid gap-8">
          <div className="animate-rise-in">
            {/* Below sm the size tracks the shell (100vw minus its gutter) so "Senior
                Full-Stack Engineer" holds one line and never orphans "Engineer". */}
            <HeroHeadline className="max-w-6xl text-[clamp(1.25rem,calc(8.1vw_-_3.2px),2.5rem)] leading-[1.04] sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5rem]" />
          </div>

          <div className="animate-rise-in" style={riseDelay(0.08)}>
            <HeroPhoto className="h-[12.5rem] object-[50%_22%] sm:h-[17rem] lg:h-[18rem]" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] lg:items-start">
          <div className="animate-rise-in" style={riseDelay(0.16)}>
            <HeroProofBlock yearsExperience={yearsExperience} />
          </div>

          <div
            className={`animate-rise-in grid ${detailStackGapClassName} lg:justify-items-start`}
            style={riseDelay(0.24)}
          >
            <HeroLede />
            <HeroActions />
          </div>
        </div>
      </div>
    </section>
  );
}
