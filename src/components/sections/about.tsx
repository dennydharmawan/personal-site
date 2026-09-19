import { DotField } from '@/components/dot-field';
import { aboutSystemsImage } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  getYearsExperience,
  pageShellClassName,
  sectionPaddingBottomClassName
} from '@/components/sections/shared';

const aboutHeadline = 'Full-stack engineer who treats operability as part of the feature.';

const aboutFacts = [
  { label: 'regulated delivery since 2019', value: 'Banking' },
  { label: 'React, Next.js, Node', value: 'TypeScript' }
];

// The ripple starts at the laptop in the photo, as if the dust were the city lights behind it.
const aboutPulse = { everySeconds: 6, origin: [0.84, 0.42] as [number, number] };

function AboutParagraphs({ yearsExperience }: { yearsExperience: number }) {
  return (
    <>
      <RevealItem>
        <p>
          I have spent {yearsExperience}+ years shipping product and platform work for Indonesian
          digital banks, including a lending product that handled 2M+ transactions a month. Every
          release there has to survive audit, incident review, and the next engineer who inherits
          it.
        </p>
      </RevealItem>
      <RevealItem>
        <p>
          Most of my depth is TypeScript across React, Next.js, and Node. I work on distributed
          services, access control, and the whole path from interface to API to data to
          monitoring. I adopt tools, AI coding agents included, on one test. Does the team ship
          and operate better with them?
        </p>
      </RevealItem>
    </>
  );
}

const aboutBackground = [
  { label: 'BINUS University', value: 'B.Sc. Computer Science' },
  { label: 'RWTH Aachen and KMUTNB Bangkok', value: 'DAAD exchange scholar' },
  { label: 'BINUS Software Laboratory Center', value: 'Programming lab instructor' }
];

function AboutPhotoWindow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden border-white/10 bg-zinc-600 shadow-[0_-16px_64px_-16px_--alpha(var(--color-black)/50%)] ${className}`}
    >
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-zinc-400" />
        <span className="size-2.5 rounded-full bg-zinc-400" />
        <span className="size-2.5 rounded-full bg-zinc-400" />
      </div>
      <img
        alt="Laptop open on a coffee table in a dim living room, city lights through the window"
        className="size-full object-cover object-[50%_60%]"
        decoding="async"
        loading="lazy"
        src={aboutSystemsImage}
      />
    </div>
  );
}

const skyPanelClassName = 'rounded-3xl bg-white/5 ring-1 ring-white/10';

function AboutSky({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup
      className="relative isolate overflow-hidden rounded-[2rem] bg-zinc-700 p-4 ring-1 ring-zinc-900/5 sm:p-6"
      stagger={0.1}
    >
      <DotField
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(120%_130%_at_100%_0%,black_30%,transparent_90%)]"
        colorVar="--color-sky-200"
        density={0.16}
        pulse={aboutPulse}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 lg:gap-6">
        <RevealItem className="col-span-2 grid content-between gap-10 p-4 sm:p-8 lg:col-span-4 lg:p-10">
          <h2 className="max-w-xl font-heading text-4xl font-normal tracking-tight text-white text-balance sm:text-5xl">
            {aboutHeadline}
          </h2>
          <div className="grid max-w-2xl gap-4 text-base font-normal leading-7 text-zinc-300 text-pretty">
            <AboutParagraphs yearsExperience={yearsExperience} />
          </div>
        </RevealItem>

        <RevealItem className={`${skyPanelClassName} col-span-2 flex min-h-[16rem] flex-col justify-end overflow-hidden pl-6 pt-6`}>
          <AboutPhotoWindow className="flex-1 rounded-tl-2xl border-l border-t" />
        </RevealItem>

        {aboutFacts.map((fact) => (
          <RevealItem key={fact.value} className={`${skyPanelClassName} grid content-between gap-8 p-6`}>
            <p className="font-heading text-2xl font-semibold leading-none tracking-tight text-white">
              {fact.value}
            </p>
            <p className="text-[0.8125rem] font-medium leading-5 text-zinc-300">{fact.label}</p>
          </RevealItem>
        ))}

        <RevealItem className={`${skyPanelClassName} col-span-2 p-6 lg:col-span-4`}>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
            {aboutBackground.map((entry) => (
              <div key={entry.value} className="grid content-start gap-1">
                <dt className="text-sm font-medium leading-5 text-white">{entry.value}</dt>
                <dd className="text-[0.8125rem] leading-5 text-zinc-300">{entry.label}</dd>
              </div>
            ))}
          </dl>
        </RevealItem>
      </div>
    </RevealGroup>
  );
}

export function AboutSection() {
  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        <AboutSky yearsExperience={getYearsExperience()} />
      </div>
    </section>
  );
}
