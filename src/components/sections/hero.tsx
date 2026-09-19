import { ChevronDown, Download } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { trustedTeams } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  detailStackGapClassName,
  getYearsExperience,
  pageShellClassName,
  scrollToTarget,
  trustedLogoToneClassName
} from '@/components/sections/shared';
import { Button } from '@/components/ui/button';

function HeroPhoto({ className }: { className: string }) {
  return (
    <div className="relative z-10 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-zinc-900/5">
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/portfolio-previews/team-gaze-hero-final-curiosity-mobile-crop.png"
        />
        <source
          media="(min-width: 1024px)"
          srcSet="/portfolio-previews/team-gaze-hero-final-curiosity-pc-crop.png"
        />
        <img
          alt="Team collaborating around a laptop with attention directed toward the next action"
          className={`block w-full object-cover ${className}`}
          decoding="async"
          src="/portfolio-previews/team-gaze-hero-final-spec-source.png"
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
      Building web solutions
      <span className="block pt-1 text-zinc-500 sm:pt-2">that actually scale.</span>
    </h1>
  );
}

function HeroLede({ className = '' }: { className?: string }) {
  return (
    <p className={`max-w-xl text-base font-normal leading-7 text-zinc-700 text-pretty ${className}`}>
      I&apos;m a full-stack engineer with hands-on experience building{' '}
      <span className="whitespace-nowrap">large-scale</span> financial systems, where scalability,
      reliability, and maintainability are critical.
    </p>
  );
}

function HeroActions({ className = '' }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Button
        size="lg"
        className="group min-h-11 px-3 has-data-[icon=inline-end]:pr-3 sm:px-4 sm:has-data-[icon=inline-end]:pr-4"
        onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
      >
        View work samples
        <ChevronDown data-icon="inline-end" className="size-4" />
      </Button>
      <Button asChild variant="outline" size="lg" className="min-h-11 px-3 sm:px-4">
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
    <div className={`flex flex-wrap items-center gap-x-10 gap-y-3 ${className}`}>
      {trustedTeams.map((team) => (
        <span key={team.name} className="inline-flex h-10 min-w-24 items-center justify-start">
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className={`${team.logoClassName} ${trustedLogoToneClassName} w-auto object-contain`}
            decoding="async"
          />
        </span>
      ))}
    </div>
  );
}

const trustedLine = "Trusted by teams at Indonesia's leading digital banks";

function HeroProofBlock({ yearsExperience }: { yearsExperience: number }) {
  return (
    <div className="grid gap-6 pt-2 min-[520px]:grid-cols-[minmax(0,1fr)_minmax(8.5rem,0.36fr)] min-[520px]:items-end lg:gap-8">
      <div className="grid gap-3">
        <p className="max-w-md text-sm font-medium leading-6 text-zinc-700 text-pretty">
          {trustedLine}
        </p>
        <TrustedLogos />
      </div>

      <div className="grid gap-2">
        <p className="text-5xl font-semibold leading-none text-zinc-700 tabular-nums">
          {yearsExperience}+
        </p>
        <p className="text-sm font-medium leading-5 text-zinc-600 text-pretty">
          years of experience
        </p>
      </div>
    </div>
  );
}

export function HeroSection() {
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate border-b border-zinc-200 bg-white pb-16 pt-24 sm:pt-28 md:pb-20 lg:pb-24">
      <HeroBackdrop />
      <RevealGroup
        className={`${pageShellClassName} grid gap-10 md:gap-12`}
        onMount
        stagger={0.1}
      >
        <div className="grid gap-8">
          <RevealItem>
            <HeroHeadline className="max-w-6xl text-[2.5rem] leading-[1.04] sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5rem]" />
          </RevealItem>

          <RevealItem>
            <HeroPhoto className="h-[12.5rem] object-[50%_22%] sm:h-[17rem] lg:h-[18rem]" />
          </RevealItem>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] lg:items-end">
          <RevealItem>
            <HeroProofBlock yearsExperience={yearsExperience} />
          </RevealItem>

          <RevealItem className={`grid ${detailStackGapClassName} lg:justify-items-start`}>
            <HeroLede />
            <HeroActions />
          </RevealItem>
        </div>
      </RevealGroup>
    </section>
  );
}
