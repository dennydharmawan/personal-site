import { CapabilityInstrument } from '@/components/capability-instruments';
import { type DustFormation, ParticleStream } from '@/components/particle-stream';
import { expertiseItems } from '@/components/portfolio-home-data';
import {
  RevealGroup,
  RevealItem,
  pageShellClassName,
  sectionHeaderMarginClassName,
  sectionPaddingClassName
} from '@/components/sections/shared';

const bentoCardClassName =
  'relative isolate flex flex-col lg:min-h-[27rem] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100';

function BentoHeading({ tail, title }: { tail: string; title: string }) {
  return (
    <h3 className="max-w-[30rem] p-7 pb-8 text-2xl font-heading font-normal leading-tight tracking-tight text-zinc-900 text-pretty sm:p-9 sm:text-[1.75rem]">
      {title} <span className="text-zinc-500">{tail}</span>
    </h3>
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
    <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-6" stagger={0.1}>
      {expertiseItems.map((item, index) => {
        const wide = index < wideCardCount;
        return (
          <RevealItem
            key={item.title}
            className={`${bentoCardClassName} ${
              wide ? 'md:col-span-2 lg:col-span-3 lg:min-h-[31rem]' : 'lg:col-span-2'
            }`}
          >
            <ParticleStream
              className={`pointer-events-none absolute inset-0 -z-10 size-full ${index === 0 ? spiralMaskClassName : ''}`}
              formation={cardFormations[index]}
              origin={index === 0 ? spiralOrigin : arcOrigin}
              pattern={index === 0 ? 'spiral' : 'dust'}
              seed={index + 1}
            />
            <BentoHeading tail={item.tail} title={item.title} />
            <div className="mt-auto">
              <CapabilityInstrument kind={item.kind} />
            </div>
          </RevealItem>
        );
      })}
      <StackCard className="md:col-span-2 lg:col-span-2" />
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
      <BentoHeading tail="Frontend, backend, and UI/UX." title="Work on every layer." />
      <div className="mt-auto">
        <CapabilityInstrument kind="stack" />
      </div>
    </RevealItem>
  );
}

export function CapabilitiesSection() {
  return (
    <section className={sectionPaddingClassName}>
      <div className={pageShellClassName}>
        <RevealGroup className={sectionHeaderMarginClassName}>
          <RevealItem>
            <h2 className="max-w-4xl text-4xl font-heading font-normal leading-[1.1] tracking-tight text-balance sm:text-5xl">
              <span className="block text-zinc-900">What I optimize for.</span>
              <span className="block text-zinc-500">Fewer incidents. Easier audits. A faster team.</span>
            </h2>
          </RevealItem>
        </RevealGroup>

        <CapabilityCards />
      </div>
    </section>
  );
}
