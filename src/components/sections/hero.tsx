import { ChevronDown, Download } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { HeroBlueprint } from '@/components/hero-blueprint';
import { trustedTeams } from '@/components/portfolio-home-data';
import {
  detailStackGapClassName,
  focusTargetName,
  getYearsExperience,
  pageShellClassName,
  riseDelay,
  scrollToTarget
} from '@/components/sections/shared';
import { Button } from '@/components/ui/button';

function HeroHeadline({ className }: { className: string }) {
  return (
    <h1 className={`font-heading font-normal tracking-tight text-zinc-900 ${className}`}>
      Building systems
      <span className="block">to grow revenue.</span>
    </h1>
  );
}

function HeroLede({ yearsExperience, className = '' }: { yearsExperience: number; className?: string }) {
  return (
    <p className={`max-w-xl text-lg font-normal leading-7 text-zinc-600 text-pretty xl:max-w-none ${className}`}>
      Senior full-stack engineer with {yearsExperience}+ years of experience. I build distributed
      systems for Indonesian digital banks, from lending backends at Jenius handling 2M+
      transactions a month to workflow orchestration at Krom Bank.
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
        onClick={(event) => {
          scrollToTarget(event, 'work', shouldReduceMotion);
          focusTargetName('work');
        }}
      >
        View work samples
        <ChevronDown
          data-icon="inline-end"
          className="size-4 transition-transform duration-200 group-hover/button:translate-y-0.5"
        />
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="min-h-11 w-full px-3 min-[420px]:w-auto sm:px-4"
      >
        <a href="/resume.pdf" download>
          <Download
            data-icon="inline-start"
            className="transition-transform duration-200 group-hover/button:translate-y-0.5"
          />
          Download resume
        </a>
      </Button>
    </div>
  );
}

// Secondary proof sits under the actions as one sentence, the way a product hero lists its
// integrations under the buttons.
function HeroProofLine() {
  return (
    <div className="grid gap-2.5">
      <p id="hero-proof-label" className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        Trusted by leading digital banks
      </p>
      <ul aria-labelledby="hero-proof-label" className="flex items-center gap-2">
        {trustedTeams.map((team) => (
          <li
            key={team.name}
            className="flex h-10 items-center rounded-xl bg-white px-3.5 ring-1 ring-zinc-900/8"
          >
            <img
              src={team.logo}
              alt={team.name}
              className="h-[1.1rem] w-auto max-w-[5.5rem] object-contain opacity-75 grayscale"
              decoding="async"
              height={team.logoHeight}
              width={team.logoWidth}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroSection() {
  const yearsExperience = getYearsExperience();

  return (
    <section className="relative isolate">
      <div className="relative bg-linear-to-b from-zinc-50 from-70% to-white pt-16 pb-16 md:pt-20 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(--alpha(var(--color-zinc-200)/60%)_1px,transparent_1px),linear-gradient(90deg,--alpha(var(--color-zinc-200)/60%)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,var(--color-black)_40%,--alpha(var(--color-black)/30%)_70%,transparent)]"
        />
        <HeroBlueprint className="md:mx-auto md:w-[min(1280px,calc(100%_-_2.5rem),max(40rem,calc((100svh_-_25rem)*2.857)))]" />

        {/* From xl the hero uses the bento grid's three columns and gap, so the lede and actions
            start on the third card's edge. The headline only takes a side column from xl; below that a narrow column squeezes it.
            From xl the right column is a subgrid: the lede's first line lines up with the top of the
            headline, and the actions line up with the top of the proof row. Stacked, the proof follows the actions. */}
        <div
          className={`${pageShellClassName} relative mt-8 grid gap-6 md:mt-10 xl:grid-cols-3 xl:grid-rows-[auto_auto] xl:gap-x-6 xl:gap-y-8`}
        >
          {/* The size tracks the column (a container), so each line of the headline holds one
              line at every width. */}
          <div className="animate-rise-in @container xl:col-span-2 xl:col-start-1 xl:row-start-1 xl:self-start">
            <HeroHeadline className="text-[min(3rem,calc(100cqw/8.2))] leading-[1] sm:text-[min(4rem,calc(100cqw/8.2))] sm:leading-[0.94] xl:text-[min(5.5rem,calc(100cqw/8.2))]" />
          </div>

          <div
            className={`animate-rise-in grid ${detailStackGapClassName} lg:grid-cols-[minmax(0,36rem)_auto] lg:items-end lg:justify-between lg:gap-10 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:grid-cols-1 xl:grid-rows-subgrid`}
            style={riseDelay(0.08)}
          >
            <HeroLede yearsExperience={yearsExperience} className="xl:self-start xl:pt-1" />
            <HeroActions className="xl:self-start" />
          </div>

          <div className="animate-rise-in xl:col-span-2 xl:col-start-1 xl:row-start-2" style={riseDelay(0.16)}>
            <HeroProofLine />
          </div>
        </div>
      </div>
    </section>
  );
}
