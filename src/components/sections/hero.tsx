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

type HeroVariant = 'current' | 'band' | 'split' | 'proof';

const bandImageClassName: Record<'current' | 'band', string> = {
  current: 'h-[12.5rem] sm:h-[17rem] lg:h-[18rem]',
  // The band gives back whatever the viewport cannot spare, so the actions stay above the fold.
  band: 'h-[clamp(9rem,calc(100svh-35rem),18rem)]'
};

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

function HeroStacked({ variant }: { variant: 'current' | 'band' }) {
  const yearsExperience = getYearsExperience();
  const isBand = variant === 'band';

  return (
    <section
      className={`relative isolate border-b border-zinc-200 bg-white pt-24 ${
        isBand ? 'pb-10 sm:pt-24 md:pb-12' : 'pb-16 sm:pt-28 md:pb-20 lg:pb-24'
      }`}
    >
      <HeroBackdrop />
      <RevealGroup
        className={`${pageShellClassName} grid ${isBand ? 'gap-8' : 'gap-10 md:gap-12'}`}
        onMount
        stagger={0.1}
      >
        <div className={`grid ${isBand ? 'gap-6' : 'gap-8'}`}>
          <RevealItem>
            <HeroHeadline className="max-w-6xl text-[2.5rem] leading-[1.04] sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5rem]" />
          </RevealItem>

          <RevealItem>
            <HeroPhoto className={`object-[50%_22%] ${bandImageClassName[variant]}`} />
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

function HeroSplit() {
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate border-b border-zinc-200 bg-white pb-10 pt-24 md:pb-12 lg:min-h-svh">
      <HeroBackdrop />
      <RevealGroup
        className={`${pageShellClassName} grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16`}
        onMount
        stagger={0.1}
      >
        <div className="grid gap-7">
          <RevealItem>
            <p className="font-mono text-xs uppercase tracking-widest text-sky-700">
              {yearsExperience}+ years · full-stack · financial systems
            </p>
          </RevealItem>
          <RevealItem>
            <HeroHeadline className="text-[2.5rem] leading-[1.04] sm:text-[3.25rem] sm:leading-none lg:text-[4.25rem]" />
          </RevealItem>
          <RevealItem className={`grid ${detailStackGapClassName}`}>
            <HeroLede />
            <HeroActions />
          </RevealItem>
          <RevealItem className="grid gap-3 border-t border-zinc-200 pt-6">
            <p className="text-sm font-medium leading-6 text-zinc-700">{trustedLine}</p>
            <TrustedLogos />
          </RevealItem>
        </div>

        <RevealItem>
          <HeroPhoto className="h-[14rem] object-[62%_22%] sm:h-[18rem] lg:h-[min(34rem,calc(100svh-11rem))]" />
        </RevealItem>
      </RevealGroup>
    </section>
  );
}

function HeroProof() {
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate border-b border-zinc-200 bg-white pb-10 pt-28 md:pb-12 lg:min-h-svh lg:pt-36">
      <HeroBackdrop />
      <RevealGroup
        className={`${pageShellClassName} grid justify-items-center gap-10 text-center lg:gap-14`}
        onMount
        stagger={0.1}
      >
        <div className="grid justify-items-center gap-7">
          <RevealItem>
            <HeroHeadline className="text-[2.5rem] leading-[1.04] sm:text-[3.5rem] sm:leading-[0.96] lg:text-[5.5rem]" />
          </RevealItem>
          <RevealItem className={`grid justify-items-center ${detailStackGapClassName}`}>
            <HeroLede className="max-w-2xl" />
            <HeroActions className="justify-center" />
          </RevealItem>
        </div>

        <RevealItem className="grid w-full max-w-4xl gap-6 rounded-[1.5rem] bg-white/70 p-6 ring-1 ring-zinc-900/5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-10 sm:p-8 sm:text-left">
          <div className="grid gap-1 sm:border-r sm:border-zinc-200 sm:pr-10">
            <p className="text-5xl font-semibold leading-none text-zinc-800 tabular-nums">
              {yearsExperience}+
            </p>
            <p className="text-sm font-medium leading-5 text-zinc-600">years of experience</p>
          </div>
          <div className="grid gap-3">
            <p className="text-sm font-medium leading-6 text-zinc-700">{trustedLine}</p>
            <TrustedLogos className="justify-center sm:justify-start" />
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}

export function HeroSection({ variant = 'current' }: { variant?: HeroVariant }) {
  if (variant === 'split') return <HeroSplit />;
  if (variant === 'proof') return <HeroProof />;
  return <HeroStacked variant={variant} />;
}
