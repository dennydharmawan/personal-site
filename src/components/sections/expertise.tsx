import { useState } from 'react';
import type { ReactNode } from 'react';
import { CapabilityInstrument, StackGrid } from '@/components/capability-instruments';
import { type DustFormation, ParticleStream } from '@/components/particle-stream';
import { expertiseItems } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  pageShellClassName,
  sectionHeaderMarginClassName,
  sectionPaddingClassName,
  twoColumnGapClassName
} from '@/components/sections/shared';

type ExpertiseVariant = 'current' | 'quad' | 'rail';

const bentoCardClassName =
  'relative isolate flex flex-col lg:min-h-[27rem] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100';
const bentoWindowShadowClassName =
  'shadow-[0_28px_56px_-24px_--alpha(var(--color-zinc-900)/30%)]';

function BentoHeading({ tail, title }: { tail: string; title: string }) {
  return (
    <h3 className="max-w-[24rem] p-7 pb-8 text-2xl font-heading font-normal leading-tight tracking-tight text-zinc-900 text-balance sm:p-9 sm:text-[1.75rem]">
      {title} <span className="text-zinc-500">{tail}</span>
    </h3>
  );
}

function BentoWindow({ children, label, wide }: { children: ReactNode; label: string; wide: boolean }) {
  return (
    <div
      className={`mt-auto overflow-hidden rounded-t-xl border border-b-0 border-zinc-200 bg-white ${bentoWindowShadowClassName} ${
        wide ? 'mx-7 sm:mr-0 sm:ml-[18%] sm:rounded-tr-none sm:border-r-0' : 'mx-7 sm:mx-9'
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3">
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span aria-hidden="true" className="size-2 rounded-full bg-zinc-300" />
        <span className="mx-auto pr-8 text-[11px] font-medium text-zinc-500">{label}</span>
      </div>
      <div className={wide ? '-mb-16' : '-mb-10'}>{children}</div>
    </div>
  );
}

const wideCardCount = 2;
const spiralOrigin: [number, number] = [0.1, 1.2];
const arcOrigin: [number, number] = [1.08, 1.12];
const cardFormations: DustFormation[] = ['arcs', 'braid', 'waves', 'arcs', 'columns'];
const spiralMaskClassName =
  '[mask-image:radial-gradient(120%_110%_at_75%_0%,black_35%,transparent_85%)]';

function CapabilityCards() {
  return (
    <RevealGroup className="grid gap-4 lg:grid-cols-6 lg:gap-6" stagger={0.1}>
      {expertiseItems.map((item, index) => {
        const wide = index < wideCardCount;
        return (
          <RevealItem
            key={item.title}
            className={`${bentoCardClassName} ${wide ? 'lg:col-span-3 lg:min-h-[31rem]' : 'lg:col-span-2'}`}
          >
            <ParticleStream
              className={`pointer-events-none absolute inset-0 -z-10 size-full ${index === 0 ? spiralMaskClassName : ''}`}
              formation={cardFormations[index]}
              origin={index === 0 ? spiralOrigin : arcOrigin}
              pattern={index === 0 ? 'spiral' : 'dust'}
              seed={index + 1}
            />
            <BentoHeading tail={item.tail} title={item.title} />
            <BentoWindow label={item.windowLabel} wide={wide}>
              <CapabilityInstrument className="rounded-none shadow-none ring-0" kind={item.kind} />
            </BentoWindow>
          </RevealItem>
        );
      })}
      <StackCard className="lg:col-span-2" />
    </RevealGroup>
  );
}

function StackCard({ className }: { className: string }) {
  return (
    <RevealItem className={`${bentoCardClassName} ${className}`}>
      <ParticleStream
        className="pointer-events-none absolute inset-0 -z-10 size-full"
        formation={cardFormations[expertiseItems.length]}
        origin={arcOrigin}
        pattern="dust"
        seed={expertiseItems.length + 1}
      />
      <BentoHeading tail="from the interface to the queue" title="One TypeScript stack" />
      <StackGrid className="mx-7 mt-auto -mb-6 [mask-image:linear-gradient(black_55%,transparent)] sm:mx-9" />
    </RevealItem>
  );
}

function QuadCards() {
  return (
    <RevealGroup className="grid gap-4 md:grid-cols-2 lg:gap-6" stagger={0.1}>
      {expertiseItems.map((item, index) => (
        <RevealItem key={item.title} className={bentoCardClassName}>
          <ParticleStream
            className="pointer-events-none absolute inset-0 -z-10 size-full"
            formation={cardFormations[index]}
            origin={arcOrigin}
            pattern="dust"
            seed={index + 1}
          />
          <BentoHeading tail={item.tail} title={item.title} />
          <BentoWindow label={item.windowLabel} wide={false}>
            <CapabilityInstrument className="rounded-none shadow-none ring-0" kind={item.kind} />
          </BentoWindow>
        </RevealItem>
      ))}
      <StackCard className="md:col-span-2 lg:min-h-[16rem] lg:flex-row lg:items-end" />
    </RevealGroup>
  );
}

function RailCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = expertiseItems[activeIndex];

  return (
    <RevealGroup className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-6" stagger={0.1}>
      <RevealItem className="grid content-start">
        <ul className="grid border-t border-zinc-200">
          {expertiseItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.title} className="border-b border-zinc-200">
                <button
                  type="button"
                  aria-pressed={isActive}
                  className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-5 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-sky-300"
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="font-mono text-xs tabular-nums text-zinc-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-heading text-2xl font-normal leading-tight tracking-tight transition-colors ${
                      isActive ? 'text-zinc-900' : 'text-zinc-400'
                    }`}
                  >
                    {item.title}
                    <span
                      className={`block pt-1 font-sans text-sm leading-6 tracking-normal transition-colors ${
                        isActive ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {item.tail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <StackGrid className="mt-8 [mask-image:linear-gradient(black_55%,transparent)]" />
      </RevealItem>

      <RevealItem className={`${bentoCardClassName} lg:min-h-[34rem]`}>
        <ParticleStream
          className={`pointer-events-none absolute inset-0 -z-10 size-full ${spiralMaskClassName}`}
          formation="arcs"
          origin={spiralOrigin}
          pattern="spiral"
          seed={1}
        />
        <p className="p-7 pb-8 font-mono text-xs uppercase tracking-widest text-sky-700 sm:p-9">
          {active.windowLabel}
        </p>
        <BentoWindow key={active.kind} label={active.windowLabel} wide>
          <CapabilityInstrument className="rounded-none shadow-none ring-0" kind={active.kind} />
        </BentoWindow>
      </RevealItem>
    </RevealGroup>
  );
}

export function CapabilitiesSection({ variant = 'current' }: { variant?: ExpertiseVariant }) {
  return (
    <section className={sectionPaddingClassName}>
      <div className={pageShellClassName}>
        <RevealGroup className={`grid items-end ${sectionHeaderMarginClassName} ${twoColumnGapClassName} lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)]`}>
          <RevealItem className="grid gap-4">
            <h2 className="max-w-xl text-4xl font-heading font-normal tracking-tight text-zinc-900 text-balance sm:text-5xl">
              Expertise that holds up in production.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 text-pretty">
              Full-stack product and platform work in regulated environments: interfaces, APIs,
              access rules, data, and the monitoring that keeps the system operable after launch.
            </p>
          </RevealItem>
        </RevealGroup>

        {variant === 'quad' ? <QuadCards /> : variant === 'rail' ? <RailCards /> : <CapabilityCards />}
      </div>
    </section>
  );
}

