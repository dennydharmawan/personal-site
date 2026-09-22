import { motion, stagger } from 'motion/react';
import {
  RevealGroup,
  RevealItem,
  instant,
  pageShellClassName,
  revealEase,
  revealVariants,
  sectionPaddingBottomClassName
} from '@/components/sections/shared';

const aboutFacts: { term: string; detail: string }[] = [
  { term: 'Now', detail: 'Senior full-stack engineer at Krom Bank, Jakarta' },
  { term: 'Before', detail: 'Lending backends at Jenius' },
  { term: 'First', detail: 'Programming labs, then ERP for enterprise clients' },
  { term: 'Stack', detail: 'TypeScript, React, Next.js, and Node.js' }
];

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

const ruleVariants = {
  hidden: { transform: 'scaleX(0)', transition: instant },
  visible: { transform: 'scaleX(1)', transition: { duration: 0.7, ease: revealEase } }
};

const ruledRowVariants = {
  hidden: { transition: instant },
  visible: { transition: { delayChildren: stagger(0.1) } }
};

// Tight leading can put ink outside the line box, so the clip extends past it vertically.
const writeInVariants = {
  hidden: { clipPath: 'inset(-0.25em 100% -0.25em 0)', transition: instant },
  visible: {
    clipPath: 'inset(-0.25em 0% -0.25em 0)',
    transition: { delay: 0.2, duration: 0.6, ease: revealEase },
    transitionEnd: { clipPath: 'none' }
  }
};

const accentRuleVariants = {
  hidden: ruleVariants.hidden,
  visible: { ...ruleVariants.visible, transition: { delay: 0.65, duration: 0.45, ease: revealEase } }
};

function Rule({ className }: { className: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`h-px origin-left bg-zinc-200 ${className}`}
      variants={ruleVariants}
    />
  );
}

export function AboutSection() {
  return (
    <section className={sectionPaddingBottomClassName} data-scroll-target="about">
      <div className={pageShellClassName}>
        <RevealGroup
          className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.7fr)] lg:gap-20"
          stagger={0.08}
        >
          <div className="grid gap-8">
            <RevealItem>
              <h2 className="max-w-[12em] font-heading text-4xl font-normal leading-[1.02] tracking-tight text-balance text-zinc-900 sm:text-5xl">
                I learn how a business works
                <motion.span
                  className="mt-2 block w-fit text-balance text-zinc-500"
                  variants={writeInVariants}
                >
                  before I write the code.
                </motion.span>
              </h2>
              <motion.span
                aria-hidden="true"
                className="mt-8 block h-px w-12 origin-left bg-sky-600"
                variants={accentRuleVariants}
              />
            </RevealItem>

            <RevealItem className="grid max-w-[68ch] gap-4 text-base leading-7 text-pretty text-zinc-600">
              <p>
                I&apos;m a senior full-stack engineer at Krom Bank, a digital bank in Jakarta. I work
                across the stack in TypeScript, React, Next.js, and Node.js, on regulated products
                where security and uptime matter as much as the feature.
              </p>
              <p>
                Before Krom, I built lending backends for Jenius. I started out teaching programming
                labs at university, then customized ERP systems for enterprise clients.
              </p>
            </RevealItem>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8 lg:pt-3">
            {aboutFacts.map((fact) => (
              <motion.div key={fact.term} className="grid gap-1" variants={ruledRowVariants}>
                <dt className="relative pt-4 text-sm font-medium text-zinc-500">
                  <Rule className="absolute inset-x-0 top-0" />
                  <motion.span className="block" variants={revealVariants}>
                    {fact.term}
                  </motion.span>
                </dt>
                <motion.dd
                  className="text-base leading-6 text-pretty text-zinc-900"
                  variants={revealVariants}
                >
                  {fact.detail}
                </motion.dd>
              </motion.div>
            ))}
          </dl>
        </RevealGroup>

        <RevealGroup className="mt-16 lg:mt-24" stagger={0.1}>
          <ul>
            {aboutHabits.map((habit) => (
              <motion.li key={habit.title} className="relative" variants={ruledRowVariants}>
                <Rule className="absolute inset-x-0 top-0" />
                <RevealItem className="grid gap-3 py-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-baseline md:gap-16 md:py-9">
                  <h3 className="font-heading text-2xl font-normal leading-tight tracking-tight text-zinc-900 sm:text-3xl">
                    {habit.title}
                  </h3>
                  <p className="max-w-[62ch] text-base leading-7 text-pretty text-zinc-600">
                    {habit.body}
                  </p>
                </RevealItem>
              </motion.li>
            ))}
          </ul>
          <Rule className="block" />
        </RevealGroup>
      </div>
    </section>
  );
}
