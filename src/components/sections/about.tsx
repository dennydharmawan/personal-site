import { useRef } from 'react';
import type { RefObject } from 'react';
import { DotField } from '@/components/dot-field';
import {
  RevealGroup,
  RevealItem,
  getYearsExperience,
  pageShellClassName,
  sectionPaddingBottomClassName
} from '@/components/sections/shared';

const aboutHeadline = 'Full-stack engineer who treats security and reliability as part of the feature.';

// The gauge axis is zoomed to the last fifth of a percent, so the floor and the
// measurement stay separable instead of collapsing onto one full bar.
const uptime = { axisFrom: 99.8, axisTo: 100, floor: 99.9, measured: 99.98 };

function uptimeLabel(value: number) {
  return `${value}%`;
}

function uptimeTrackPercent(value: number) {
  return ((value - uptime.axisFrom) / (uptime.axisTo - uptime.axisFrom)) * 100;
}

const aboutReadouts = [
  {
    label: 'transactions a month',
    note: 'Regulated lending. Real money moving, not traffic.',
    value: '2M+'
  },
  {
    label: 'user growth in three years',
    note: 'Origination and disbursement stayed stable through it.',
    value: '147%'
  }
];

const aboutBackground = [
  { label: 'BINUS University', value: 'B.Sc. Computer Science' },
  { label: 'RWTH Aachen and KMUTNB Bangkok', value: 'DAAD exchange scholar' },
  { label: 'BINUS Software Laboratory Center', value: 'Programming lab instructor' }
];

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
          Most of my depth is TypeScript across React, Next.js, and Node.js, with Kafka, Redis, and
          MongoDB behind it. Most of my design work goes into what a bank cannot get wrong, such as
          access rules, partner integrations, and retries that stay idempotent when a third-party
          call fails halfway. I adopt tools, AI coding agents included, on one test. Does the team
          ship and operate better with them?
        </p>
      </RevealItem>
    </>
  );
}

const monitorLabelClassName = 'font-mono text-[0.6875rem] leading-4 tracking-tight text-zinc-300';

function UptimeGauge() {
  return (
    <div
      role="img"
      aria-label={`Gauge: ${uptimeLabel(uptime.measured)} uptime against a ${uptimeLabel(uptime.floor)} floor, on an axis running from ${uptimeLabel(uptime.axisFrom)} to ${uptimeLabel(uptime.axisTo)}.`}
    >
      <div aria-hidden="true" className="relative">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-300/80"
            style={{ width: `${uptimeTrackPercent(uptime.measured)}%` }}
          />
        </div>
        <div
          className="absolute -inset-y-2 w-0 border-l border-dashed border-white/70"
          style={{ left: `${uptimeTrackPercent(uptime.floor)}%` }}
        />
      </div>
      <div aria-hidden="true" className={`relative mt-2.5 flex justify-between ${monitorLabelClassName}`}>
        <span>{uptimeLabel(uptime.axisFrom)}</span>
        <span
          className="absolute -translate-x-1/2 text-zinc-200"
          style={{ left: `${uptimeTrackPercent(uptime.floor)}%` }}
        >
          {uptimeLabel(uptime.floor)}
        </span>
        <span>{uptimeLabel(uptime.axisTo)}</span>
      </div>
    </div>
  );
}

function ReliabilityMonitor({ panelRef }: { panelRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={panelRef}
      className="flex h-full flex-col justify-between gap-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-7 lg:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-5 text-zinc-100">Jenius lending backends</p>
          <p className={monitorLabelClassName}>Dec 2019 – Dec 2022</p>
        </div>
        <p className="flex items-center gap-2 rounded-full bg-sky-300/10 px-2.5 py-1 text-xs font-medium text-sky-200 ring-1 ring-sky-300/25">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-sky-300" />
          steady
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <p className="font-heading text-5xl leading-none font-normal tracking-tight tabular-nums text-white sm:text-6xl">
            {uptimeLabel(uptime.measured)}
          </p>
          <p className="text-sm leading-5 text-zinc-300">uptime, measured across 36 months</p>
        </div>
        <UptimeGauge />
      </div>

      <div className="grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-2 sm:gap-8">
        {aboutReadouts.map((readout) => (
          <div key={readout.value} className="grid content-start gap-1.5">
            <p className="font-heading text-[1.75rem] leading-none font-normal tracking-tight tabular-nums text-white">
              {readout.value}
            </p>
            <p className="text-sm leading-5 font-medium text-zinc-200 text-pretty">{readout.label}</p>
            <p className="text-[0.8125rem] leading-5 text-zinc-300 text-pretty">{readout.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSky({ yearsExperience }: { yearsExperience: number }) {
  const monitorRef = useRef<HTMLDivElement>(null);

  return (
    <RevealGroup
      className="relative isolate overflow-hidden rounded-[2rem] bg-zinc-700 p-5 ring-1 ring-zinc-900/5 sm:p-8 lg:p-10"
      stagger={0.1}
    >
      <DotField
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_18%)] lg:[mask-image:radial-gradient(95%_110%_at_100%_0%,black_20%,transparent_75%)]"
        colorVar="--color-sky-200"
        density={0.16}
        pulseFrom={monitorRef}
        pulseSeconds={6}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <RevealItem className="grid content-start gap-6">
          <h2 className="font-heading text-3xl font-normal tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
            {aboutHeadline}
          </h2>
          <div className="grid max-w-xl gap-4 text-base leading-7 font-normal text-zinc-300 text-pretty">
            <AboutParagraphs yearsExperience={yearsExperience} />
          </div>
        </RevealItem>

        <RevealItem>
          <ReliabilityMonitor panelRef={monitorRef} />
        </RevealItem>
      </div>

      <RevealItem className="mt-10 border-t border-white/15 pt-8 lg:mt-14">
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {aboutBackground.map((entry) => (
            <div key={entry.value} className="grid content-start gap-1">
              <dt className="text-sm leading-5 font-medium text-white text-pretty">{entry.value}</dt>
              <dd className="text-[0.8125rem] leading-5 text-zinc-300 text-pretty">{entry.label}</dd>
            </div>
          ))}
        </dl>
      </RevealItem>
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
