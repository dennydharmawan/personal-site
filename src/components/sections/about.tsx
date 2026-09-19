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

type AboutVariant = 'current' | 'letter' | 'statement';

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

function AboutLabel({ children }: { children: string }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-sky-700">{children}</p>;
}

function AboutLetter({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup className="mx-auto grid max-w-3xl gap-8" stagger={0.1}>
      <RevealItem className="grid gap-4">
        <AboutLabel>About</AboutLabel>
        <h2 className="font-heading text-4xl font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
          {aboutHeadline}
        </h2>
      </RevealItem>
      <div className="grid gap-4 text-lg font-normal leading-8 text-zinc-700 text-pretty">
        <AboutParagraphs yearsExperience={yearsExperience} />
      </div>
      <RevealItem>
        <dl className="grid border-t border-zinc-200 font-mono text-sm">
          {aboutFacts.map((fact) => (
            <div key={fact.value} className="flex items-baseline justify-between gap-6 border-b border-zinc-200 py-3">
              <dt className="text-zinc-900">{fact.value}</dt>
              <dd className="text-right text-zinc-500">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </RevealItem>
    </RevealGroup>
  );
}

function AboutStatement({ yearsExperience }: { yearsExperience: number }) {
  return (
    <RevealGroup
      className="grid gap-10 border-t border-zinc-200 pt-10 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,1fr)] lg:gap-16 lg:pt-14"
      stagger={0.1}
    >
      <RevealItem className="grid content-start gap-8">
        <AboutLabel>About</AboutLabel>
        <ul className="grid gap-5">
          {aboutFacts.map((fact) => (
            <li key={fact.value} className="grid gap-1">
              <p className="font-heading text-2xl font-semibold leading-none tracking-tight text-zinc-900">
                {fact.value}
              </p>
              <p className="text-[0.8125rem] font-medium leading-5 text-zinc-500">{fact.label}</p>
            </li>
          ))}
        </ul>
      </RevealItem>
      <div className="grid gap-10">
        <RevealItem>
          <h2 className="max-w-4xl font-heading text-4xl font-normal leading-[1.08] tracking-tight text-zinc-900 text-balance sm:text-5xl lg:text-6xl">
            {aboutHeadline}
          </h2>
        </RevealItem>
        <div className="grid gap-6 text-base font-normal leading-7 text-zinc-600 text-pretty md:grid-cols-2 md:gap-10">
          <AboutParagraphs yearsExperience={yearsExperience} />
        </div>
      </div>
    </RevealGroup>
  );
}

export function AboutSection({ variant = 'current' }: { variant?: AboutVariant }) {
  const yearsExperience = getYearsExperience();

  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        {variant === 'letter' ? (
          <AboutLetter yearsExperience={yearsExperience} />
        ) : variant === 'statement' ? (
          <AboutStatement yearsExperience={yearsExperience} />
        ) : (
          <AboutCard yearsExperience={yearsExperience} />
        )}
      </div>
    </section>
  );
}
