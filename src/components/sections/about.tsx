import { Download } from 'lucide-react';
import { LuLinkedin } from 'react-icons/lu';
import {
  RevealGroup,
  RevealItem,
  pageShellClassName,
  sectionPaddingBottomClassName,
  twoColumnGapClassName
} from '@/components/sections/shared';
import { Button } from '@/components/ui/button';

const aboutHabits: { title: string; body: string }[] = [
  {
    title: 'I plan for failure first',
    body: 'Retries, timeouts, and third-party outages are in the design from the first draft.'
  },
  {
    title: 'I build what other teams reuse',
    body: "Several production apps run on my shared package for auth, logging, and feature flags, and my Datadog dashboards became the company's monitoring template."
  },
  {
    title: 'I use AI with judgment',
    body: 'After winning an internal AI engineering competition, I brought spec-driven development to our engineering teams. I use AI every day, and I check what it writes.'
  }
];

function AboutPortrait() {
  return (
    <div
      aria-hidden="true"
      className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[1.5rem] bg-zinc-100 ring-1 ring-zinc-900/5"
    >
      <span className="font-heading text-7xl tracking-tight text-zinc-400 sm:text-8xl">DD</span>
    </div>
  );
}

function AboutActions() {
  return (
    <div className="grid w-full gap-3 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center">
      <Button asChild size="lg" className="min-h-11 w-full px-3 min-[420px]:w-auto sm:px-4">
        <a href="/resume.pdf" rel="noopener" target="_blank">
          <Download data-icon="inline-start" />
          Download resume
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="min-h-11 w-full px-3 min-[420px]:w-auto sm:px-4"
      >
        <a href="https://www.linkedin.com/in/ddharmawan" rel="noopener noreferrer" target="_blank">
          <LuLinkedin aria-hidden="true" data-icon="inline-start" />
          LinkedIn
        </a>
      </Button>
    </div>
  );
}

export function AboutSection() {
  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        <RevealGroup
          stagger={0.1}
          className={`grid items-start ${twoColumnGapClassName} md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}
        >
          <RevealItem className="w-40 sm:w-52 md:w-full">
            <AboutPortrait />
          </RevealItem>

          <div className="grid gap-6">
            <RevealItem>
              <p className="text-sm font-medium text-zinc-500">About me</p>
            </RevealItem>

            <RevealItem>
              <h2 className="font-heading text-4xl font-normal tracking-tight text-balance text-zinc-900 sm:text-5xl">
                I build products and platforms{' '}
                <span className="text-zinc-500">for digital banks and fintech companies.</span>
              </h2>
            </RevealItem>

            <RevealItem className="grid max-w-xl gap-4 text-base leading-7 text-pretty text-zinc-600">
              <p>
                I&apos;m a senior full-stack engineer at Krom Bank, a digital bank in Jakarta. I work
                across the stack in TypeScript, React, Next.js, and Node.js, on regulated products
                where security and uptime matter as much as the feature.
              </p>
              <p>
                Before Krom, I built lending backends for Jenius. I started out teaching programming
                labs at university, then customized ERP systems for enterprise clients. That path
                taught me to learn how a business works before I write code.
              </p>
            </RevealItem>

            <RevealItem className="grid max-w-xl gap-3">
              <p className="text-sm font-medium text-zinc-500">How I work</p>
              <ul>
                {aboutHabits.map((habit) => (
                  <li key={habit.title} className="grid gap-1 border-t border-zinc-200 py-4">
                    <h3 className="text-base font-medium text-zinc-900">{habit.title}</h3>
                    <p className="text-[0.9375rem] leading-6 text-pretty text-zinc-600">
                      {habit.body}
                    </p>
                  </li>
                ))}
              </ul>
            </RevealItem>

            <RevealItem>
              <AboutActions />
            </RevealItem>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
