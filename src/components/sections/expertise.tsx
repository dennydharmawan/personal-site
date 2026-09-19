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

export function CapabilitiesSection() {
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
              Full-stack product and platform work in regulated environments, from interfaces and
              APIs to access rules, data, and the monitoring that keeps a system healthy after
              launch.
            </p>
          </RevealItem>
        </RevealGroup>

        <CapabilityCards />
      </div>
    </section>
  );
}

