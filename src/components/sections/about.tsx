import { DotField } from '@/components/dot-field';
import { aboutSystemsImage } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  detailStackGapClassName,
  getYearsExperience,
  pageShellClassName,
  sectionPaddingBottomClassName
} from '@/components/sections/shared';

type AboutVariant = 'current' | 'bento' | 'band';

const aboutHeadline = 'Full-stack engineer who treats operability as part of the feature.';

const aboutFacts = [
  { label: 'regulated delivery since 2019', value: 'Banking' },
  { label: 'React, Next.js, Node', value: 'TypeScript' }
];

function AboutCopy({ yearsExperience }: { yearsExperience: number }) {
  return (
    <>
      <div className="grid gap-4">
        <RevealItem>
          <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-white text-balance sm:text-5xl">
            {aboutHeadline}
          </h2>
        </RevealItem>
      </div>
      <div className="grid max-w-xl gap-4 text-base font-normal leading-7 text-zinc-300 text-pretty">
        <RevealItem>
          <p>
            I have spent {yearsExperience}+ years shipping product and platform work for Indonesian
            digital banks. Every release there has to survive audit, incident review, and the next
            engineer who inherits it.
          </p>
        </RevealItem>
        <RevealItem>
          <p>
            Most of my depth is TypeScript across React, Next.js, and Node: distributed services,
            access control, and the path from interface to API to data to monitoring. I adopt
            tools, AI coding agents included, on one test: does the team ship and operate better
            with them.
          </p>
        </RevealItem>
      </div>
    </>
  );
}

function AboutFacts({ className }: { className?: string }) {
  return (
    <ul className={`grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 ${className ?? ''}`}>
      {aboutFacts.map((fact) => (
        <li key={fact.value} className="grid gap-1 py-4 sm:px-6 sm:first:pl-0">
          <p className="text-2xl font-heading font-semibold leading-none tracking-tight text-white">
            {fact.value}
          </p>
          <p className="text-[0.8125rem] font-medium leading-5 text-zinc-300">{fact.label}</p>
        </li>
      ))}
    </ul>
  );
}

// The ripple starts at the laptop in the photo, as if the dust were the city lights behind it.
const aboutPulse = { everySeconds: 6, origin: [0.82, 0.62] as [number, number] };

function AboutCard({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup
      className="relative isolate overflow-hidden rounded-[2rem] bg-zinc-700 ring-1 ring-zinc-900/5"
      stagger={0.1}
    >
      <DotField
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(110%_120%_at_100%_0%,black_25%,transparent_85%)]"
        colorVar="--color-sky-200"
        density={0.16}
        pulse={aboutPulse}
      />
      <div className="grid gap-10 px-6 pt-12 sm:px-10 sm:pt-16 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)] lg:items-end lg:gap-16 lg:pl-16 lg:pr-0 lg:pt-20">
        <div className={`grid content-start lg:pb-20 ${detailStackGapClassName}`}>
          <AboutCopy yearsExperience={yearsExperience} />
          <RevealItem>
            <AboutFacts className="max-w-xl border-t border-white/10" />
          </RevealItem>
        </div>
        <RevealItem className="-mr-6 self-end sm:-mr-10 lg:mr-0">
          <div className="overflow-hidden rounded-tl-2xl border-l border-t border-white/10 bg-zinc-600 shadow-[0_-16px_64px_-16px_--alpha(var(--color-black)/50%)]">
            <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-zinc-400" />
              <span className="size-2.5 rounded-full bg-zinc-400" />
              <span className="size-2.5 rounded-full bg-zinc-400" />
            </div>
            <img
              alt="Laptop open on a coffee table in a dim living room, city lights through the window"
              className="aspect-[4/3] w-full object-cover object-[50%_60%]"
              decoding="async"
              loading="lazy"
              src={aboutSystemsImage}
            />
          </div>
        </RevealItem>
      </div>
    </RevealGroup>
  );
}

function AboutParagraphs({ yearsExperience }: { yearsExperience: number }) {
  return (
    <>
      <RevealItem>
        <p>
          I have spent {yearsExperience}+ years shipping product and platform work for Indonesian
          digital banks. Every release there has to survive audit, incident review, and the next
          engineer who inherits it.
        </p>
      </RevealItem>
      <RevealItem>
        <p>
          Most of my depth is TypeScript across React, Next.js, and Node: distributed services,
          access control, and the path from interface to API to data to monitoring. I adopt tools,
          AI coding agents included, on one test: does the team ship and operate better with them.
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

const nightCardClassName =
  'relative isolate overflow-hidden rounded-[2rem] bg-zinc-700 ring-1 ring-zinc-900/5';

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

function AboutBento({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup className="grid gap-4 lg:grid-cols-6 lg:gap-6" stagger={0.1}>
      <RevealItem className={`${nightCardClassName} grid content-between gap-10 p-8 sm:p-12 lg:col-span-4`}>
        <DotField
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(110%_120%_at_100%_0%,black_25%,transparent_85%)]"
          colorVar="--color-sky-200"
          density={0.16}
          pulse={aboutPulse}
        />
        <h2 className="max-w-xl font-heading text-4xl font-normal tracking-tight text-white text-balance sm:text-5xl">
          {aboutHeadline}
        </h2>
        <div className="grid max-w-2xl gap-4 text-base font-normal leading-7 text-zinc-300 text-pretty">
          <AboutParagraphs yearsExperience={yearsExperience} />
        </div>
      </RevealItem>

      <RevealItem className={`${nightCardClassName} flex min-h-[18rem] flex-col justify-end pl-8 pt-8 lg:col-span-2`}>
        <AboutPhotoWindow className="flex-1 rounded-tl-2xl border-l border-t" />
      </RevealItem>

      {aboutFacts.map((fact) => (
        <RevealItem
          key={fact.value}
          className="grid content-between gap-8 rounded-[1.5rem] bg-zinc-100 p-7 ring-1 ring-zinc-900/5 lg:col-span-1"
        >
          <p className="font-heading text-2xl font-semibold leading-none tracking-tight text-zinc-900">
            {fact.value}
          </p>
          <p className="text-[0.8125rem] font-medium leading-5 text-zinc-600">{fact.label}</p>
        </RevealItem>
      ))}

      <RevealItem className="rounded-[1.5rem] bg-zinc-100 p-7 ring-1 ring-zinc-900/5 lg:col-span-4">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
          {aboutBackground.map((entry) => (
            <div key={entry.value} className="grid content-start gap-1">
              <dt className="text-sm font-medium leading-5 text-zinc-900">{entry.value}</dt>
              <dd className="text-[0.8125rem] leading-5 text-zinc-600">{entry.label}</dd>
            </div>
          ))}
        </dl>
      </RevealItem>
    </RevealGroup>
  );
}

function AboutBand({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup className="grid gap-10 lg:gap-14" stagger={0.1}>
      <RevealItem>
        <h2 className="max-w-5xl font-heading text-4xl font-normal leading-[1.04] tracking-tight text-zinc-900 sm:text-5xl lg:text-[4.25rem]">
          Full-stack engineer
          <span className="block pt-1 text-zinc-500">who treats operability as part of the feature.</span>
        </h2>
      </RevealItem>

      <RevealItem className={nightCardClassName}>
        <DotField
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(110%_120%_at_0%_0%,black_25%,transparent_85%)]"
          colorVar="--color-sky-200"
          density={0.16}
          pulse={{ ...aboutPulse, origin: [0.2, 0.62] }}
        />
        <div className="grid gap-10 px-6 pt-10 sm:px-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:items-end lg:gap-16 lg:pl-0 lg:pr-16 lg:pt-16">
          <AboutPhotoWindow className="order-2 -ml-6 aspect-[4/3] self-end rounded-tr-2xl border-r border-t sm:-ml-10 lg:order-1 lg:ml-0" />
          <div className={`order-1 grid content-start lg:order-2 lg:pb-16 ${detailStackGapClassName}`}>
            <div className="grid max-w-xl gap-4 text-base font-normal leading-7 text-zinc-300 text-pretty">
              <AboutParagraphs yearsExperience={yearsExperience} />
            </div>
            <AboutFacts className="max-w-xl border-t border-white/10" />
          </div>
        </div>
      </RevealItem>
    </RevealGroup>
  );
}

export function AboutSection({ variant = 'current' }: { variant?: AboutVariant }) {
  const yearsExperience = getYearsExperience();

  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        {variant === 'bento' ? (
          <AboutBento yearsExperience={yearsExperience} />
        ) : variant === 'band' ? (
          <AboutBand yearsExperience={yearsExperience} />
        ) : (
          <AboutCard yearsExperience={yearsExperience} />
        )}
      </div>
    </section>
  );
}
