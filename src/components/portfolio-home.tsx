import { useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FaLinkedinIn } from 'react-icons/fa';
import {
  SiGithub,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiRedis,
  SiTypescript
} from 'react-icons/si';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Work', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'Strengths', target: 'strengths' },
  { label: 'Contact', target: 'contact' }
];

const proofItems = [
  { label: 'Years across fintech and enterprise systems', value: '7+' },
  { label: 'Faster execution after legacy refactoring', value: '37%' },
  { label: 'Internal platforms, RBAC, audit workflows', value: 'Fintech' },
  { label: 'React, Next.js, Node.js, TypeScript', value: 'JS' }
];

const coreStack: { icon: IconType; iconClass: string; name: string }[] = [
  { icon: SiReact, iconClass: 'text-sky-500', name: 'React' },
  { icon: SiNextdotjs, iconClass: 'text-slate-950', name: 'Next.js' },
  { icon: SiNodedotjs, iconClass: 'text-green-500', name: 'Node.js' },
  { icon: SiTypescript, iconClass: 'text-blue-500', name: 'TypeScript' },
  { icon: SiMysql, iconClass: 'text-sky-600', name: 'MySQL' },
  { icon: SiRedis, iconClass: 'text-rose-500', name: 'Redis' }
];

const focusItems = [
  {
    body: 'Internal operations platforms where ownership, status, and next action are easy to see.',
    icon: BriefcaseBusiness
  },
  {
    body: 'Access-control workflows with clear permissions, review history, and audit trails.',
    icon: ShieldCheck
  },
  {
    body: 'Reliable delivery across APIs, data models, monitoring, and performance improvements.',
    icon: Gauge
  }
];

const projects = [
  {
    bullets: [
      'Turns approval status, ownership, and next action into a clear review queue',
      'Makes role-aware decisions visible before someone takes a sensitive action',
      'Keeps reviewer history and decision context audit-ready without exposing private data'
    ],
    icon: BriefcaseBusiness,
    impact: 'Shows how I translate operational rules into safer, easier-to-review software.',
    preview: '/portfolio-previews/approval-workflow.png',
    role: 'Full-stack product engineering',
    stack: ['React', 'Node.js', 'TypeScript', 'MySQL'],
    summary:
      'A public-safe approval experience for reviewing operational records, surfacing status, and keeping decisions traceable.',
    title: 'Approval Workflow System'
  },
  {
    bullets: [
      'Consolidates assignments, follow-ups, and reporting into one operating surface',
      'Supports agents, leads, managers, and admins without fragmenting the workflow',
      'Uses status, ownership, and aging signals to reduce ambiguity in daily operations'
    ],
    icon: Gauge,
    impact: 'Demonstrates how I design internal tools for repeated daily use, not one-time demos.',
    preview: '/portfolio-previews/operations-platform.png',
    role: 'Workflow and systems design',
    stack: ['Next.js', 'Express', 'Sequelize', 'Redis'],
    summary:
      'A dashboard-style platform for assignments, follow-ups, reporting, and team visibility across internal operations.',
    title: 'Operations Platform'
  },
  {
    bullets: [
      'Shows roles, requests, protected areas, and access history in one reviewable flow',
      'Separates permission review from technical implementation so decisions stay readable',
      'Keeps access changes traceable for audits, support, and safer maintenance'
    ],
    icon: ShieldCheck,
    impact: 'Connects secure product flows with maintainable implementation patterns.',
    preview: '/portfolio-previews/access-management.png',
    role: 'Full-stack implementation',
    stack: ['Next.js', 'SSO', 'RBAC', 'Redis'],
    summary:
      'A permissions experience for reviewing roles, requests, protected areas, and access history.',
    title: 'Access Management System'
  }
];

const experiences = [
  {
    bullets: [
      'Build and maintain full-stack internal fintech platforms across React, Next.js, Node.js, Express, TypeScript, MySQL, Sequelize, Redis, and Mantine UI.',
      'Own internal operations tools end to end, from data modeling and UI workflows to backend implementation, monitoring, and integrations.',
      'Design secure access-management workflows covering RBAC, auditability, access review, and safer operational actions.',
      'Improve reliability through monitoring dashboards, error tracing, CI/CD fixes, infrastructure migration support, and reusable rollout helpers.',
      'Reduced average execution time by 37% by refactoring legacy modules, improving structure, and optimizing slow APIs with caching.',
      'Author RFCs and technical documentation for approval workflows, API practices, shared engineering workflows, and onboarding.'
    ],
    company: 'Krom Bank',
    current: true,
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer'
  },
  {
    bullets: [
      'Built and maintained backend services for Jenius and Flexi Cash using Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
      'Contributed APIs, data flows, and service integrations for loan application, funding, and lending business processes.',
      'Supported partner integration flows with external retail partners for digital lending distribution.',
      'Improved backend reliability, maintainability, and troubleshooting practices across lending-related services.'
    ],
    company: 'Jenius / Bank BTPN',
    period: 'Dec 2019 - Jan 2022',
    role: 'Back End Engineer'
  },
  {
    bullets: [
      'Customized Microsoft Dynamics AX ERP workflows for enterprise clients including JNE and Gramedia.',
      'Translated business requirements into ERP customizations, integrations, and operational fixes.',
      'Built and supported integrations across data warehouse, enterprise portal, and POS printer-related systems.',
      'Trained professionals from multiple companies in Dynamics AX customization and implementation practices.'
    ],
    company: 'Iverson Technology',
    period: 'Dec 2017 - Dec 2019',
    role: 'Technical Consultant'
  }
];

const strengths = [
  {
    items: ['React and Next.js', 'TypeScript', 'Component systems', 'Operational interfaces'],
    title: 'Frontend Engineering'
  },
  {
    items: [
      'Node.js and Express',
      'GraphQL and REST APIs',
      'Data models',
      'Caching and integrations'
    ],
    title: 'Backend Engineering'
  },
  {
    items: ['RBAC workflows', 'Auditability', 'Monitoring and tracing', 'Safer rollouts'],
    title: 'Fintech Reliability'
  },
  {
    items: [
      'Requirements shaping',
      'RFCs and implementation plans',
      'Cross-team documentation',
      'Spec-driven development'
    ],
    title: 'System Design'
  }
];

const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
const easeOut = [0.2, 0, 0, 1] as const;
const anchorScrollOffset = 76;

function scrollToTarget(
  event: MouseEvent<HTMLElement>,
  targetName: string,
  shouldReduceMotion: boolean | null
) {
  const target = document.querySelector<HTMLElement>(`[data-scroll-target="${targetName}"]`);

  if (!target) {
    return;
  }

  event.preventDefault();

  const targetTop =
    targetName === 'top'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - anchorScrollOffset;

  window.scrollTo({
    behavior: shouldReduceMotion ? 'auto' : 'smooth',
    top: Math.max(targetTop, 0)
  });
}

function SectionLabel({
  children,
  tone = 'light'
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <div
      className={`flex w-fit items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] ${
        tone === 'dark' ? 'text-indigo-200' : 'text-indigo-700'
      }`}
    >
      <span className={`h-px w-7 ${tone === 'dark' ? 'bg-indigo-600' : 'bg-indigo-300'}`} />
      <span>{children}</span>
    </div>
  );
}

function FooterLinkArrow() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-1 h-4 w-5 shrink-0 overflow-visible text-current"
      fill="none"
      viewBox="0 0 20 16"
    >
      <line
        className="origin-[5px_8px] scale-x-0 opacity-0 transition-[scale,opacity] duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100"
        x1="5"
        x2="15"
        y1="8"
        y2="8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
        d="M5 4L9 8L5 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function AnimatedHeader() {
  const shouldReduceMotion = useReducedMotion();
  const [isNavCompact, setIsNavCompact] = useState(false);
  const [hoveredNavHref, setHoveredNavHref] = useState<string | null>(null);

  useEffect(() => {
    const updateCompactState = () => setIsNavCompact(window.scrollY > 28);

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, { passive: true });

    return () => window.removeEventListener('scroll', updateCompactState);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <motion.div
        className="pointer-events-auto border-b backdrop-blur"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{
          backgroundColor: isNavCompact ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0)',
          borderColor: isNavCompact ? 'rgba(226,232,240,0.9)' : 'rgba(226,232,240,0)',
          opacity: 1
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                backgroundColor: { duration: 0.28, ease: easeOut },
                borderColor: { duration: 0.28, ease: easeOut },
                opacity: { duration: 0.36, ease: easeOut }
              }
        }
      >
        <motion.div
          className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 px-0 md:px-0"
          initial={shouldReduceMotion ? false : { filter: 'blur(3px)', y: -8 }}
          animate={{ filter: 'blur(0px)', height: isNavCompact ? 56 : 72, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  filter: { delay: 0.04, duration: 0.32, ease: easeOut },
                  height: { duration: 0.28, ease: easeOut },
                  y: { delay: 0.04, duration: 0.32, ease: easeOut }
                }
          }
        >
          <motion.a
            className="inline-flex min-h-10 items-center whitespace-nowrap text-base font-semibold text-slate-950 transition-colors hover:text-indigo-700"
            href="/"
            aria-label="Denny Dharmawan home"
            onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.08, ...spring }}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-sm shadow-indigo-200"
              style={{ height: '2rem', marginRight: '0.625rem', width: '2rem' }}
            >
              DD
            </span>
            <span>Denny Dharmawan</span>
          </motion.a>
          <motion.nav
            className="flex items-center justify-end gap-1.5"
            aria-label="Main navigation"
            onMouseLeave={() => setHoveredNavHref(null)}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.14, ...spring }}
          >
            {navItems.map((item, index) => (
              <motion.button
                key={item.target}
                type="button"
                className="relative hidden min-h-10 items-center rounded-full px-3 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:text-slate-950 focus-visible:text-slate-950 sm:inline-flex"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                onBlur={() => setHoveredNavHref(null)}
                onFocus={() => setHoveredNavHref(item.target)}
                onClick={(event) => scrollToTarget(event, item.target, shouldReduceMotion)}
                onMouseEnter={() => setHoveredNavHref(item.target)}
                transition={
                  shouldReduceMotion ? { duration: 0 } : { delay: 0.18 + index * 0.04, ...spring }
                }
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {hoveredNavHref === item.target ? (
                    <motion.span
                      layoutId="nav-hover-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white/75 ring-1 ring-slate-200/70"
                      initial={
                        shouldReduceMotion
                          ? false
                          : { filter: 'blur(4px)', opacity: 0, scale: 0.96 }
                      }
                      animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
                      exit={{ filter: 'blur(3px)', opacity: 0, scale: 0.98 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              ...spring,
                              duration: 0.38,
                              filter: { duration: 0.3, ease: easeOut },
                              opacity: { duration: 0.3, ease: easeOut }
                            }
                      }
                    />
                  ) : null}
                </AnimatePresence>
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: 0.18 + navItems.length * 0.04, ...spring }
              }
            >
              <Button asChild variant="outline" size="sm" className="ml-1">
                <a href="/resume.pdf">
                  Resume <Download data-icon="inline-end" />
                </a>
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      </motion.div>
    </header>
  );
}

export default function PortfolioHome() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const resetHashNavigation = () => {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        );
        window.scrollTo({ behavior: 'auto', left: 0, top: 0 });
        window.setTimeout(() => window.scrollTo({ behavior: 'auto', left: 0, top: 0 }), 0);
      }
    };

    resetHashNavigation();
    window.addEventListener('hashchange', resetHashNavigation);

    return () => window.removeEventListener('hashchange', resetHashNavigation);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnimatedHeader />

      <main data-scroll-target="top">
        <section className="relative overflow-hidden border-b border-slate-200">
          <motion.div
            className="absolute inset-x-0 top-0 h-[34rem] bg-gradient-to-r from-amber-100 via-fuchsia-200 to-indigo-300"
            animate={shouldReduceMotion ? undefined : { x: [0, 28, -18, 0], y: [0, -10, 12, 0] }}
            transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-[34rem] bg-gradient-to-br from-orange-200/80 via-white/30 to-rose-300/70"
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0.8, 0.95, 0.75, 0.8], x: [0, -18, 24, 0] }
            }
            transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 h-[34rem] bg-gradient-to-tr from-white/80 via-transparent to-indigo-600/30"
            animate={shouldReduceMotion ? undefined : { opacity: [0.72, 0.9, 0.76, 0.72] }}
            transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity }}
          />

          <div className="relative mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-10 py-16 md:grid-cols-[minmax(0,1fr)_24rem] md:py-20 lg:gap-14">
            <motion.div className="grid content-start gap-7">
              <motion.div
                className="grid gap-5"
                initial={shouldReduceMotion ? false : { filter: 'blur(3px)', opacity: 0, y: 12 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
              >
                <SectionLabel>Full-Stack Engineer</SectionLabel>
                <h1 className="max-w-3xl text-5xl font-light leading-[1.03] text-slate-900 text-balance sm:text-6xl">
                  Full-stack engineer building reliable fintech and internal operations platforms.
                </h1>
                <p className="max-w-2xl text-base font-light leading-7 text-slate-700 sm:text-lg">
                  I build secure, scalable web systems across React, Next.js, Node.js, and
                  TypeScript, with deep experience in digital banking, RBAC workflows, auditability,
                  API design, and operational reliability.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={shouldReduceMotion ? false : { filter: 'blur(3px)', opacity: 0, y: 12 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.42, ease: easeOut }}
              >
                <Button
                  size="lg"
                  className="group h-10 px-4"
                  onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                >
                  View my work{' '}
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    data-icon="inline-end"
                  />
                </Button>
              </motion.div>

              <motion.div
                className="grid gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/80 backdrop-blur transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/50 sm:grid-cols-2 lg:grid-cols-4"
                initial={shouldReduceMotion ? false : { filter: 'blur(3px)', opacity: 0, y: 14 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.42, ease: easeOut }}
              >
                {proofItems.map((item) => (
                  <motion.div
                    key={item.label}
                    className="border-slate-200 sm:border-r sm:pr-5 last:border-r-0"
                    whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                    transition={spring}
                  >
                    <p className="text-3xl font-light leading-none text-slate-900 tabular-nums">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm font-light leading-5 text-slate-600">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.aside
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl shadow-slate-300/40 backdrop-blur"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            >
              <div className="grid gap-5">
                <div className="rounded-xl bg-indigo-950 p-5 text-white">
                  <div className="flex items-start gap-3">
                    <motion.span
                      className="mt-1.5 size-2.5 rounded-full bg-fuchsia-400"
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              boxShadow: [
                                '0 0 0 0 rgba(232,121,249,0.35)',
                                '0 0 0 8px rgba(232,121,249,0)',
                                '0 0 0 0 rgba(232,121,249,0)'
                              ]
                            }
                      }
                      transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity }}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        Available for focused engineering conversations
                      </p>
                      <p className="mt-1 text-sm font-light text-indigo-100">
                        Fintech, internal tools, and remote-first teams
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 rounded-lg border border-indigo-800 bg-indigo-900/70 p-3 text-sm">
                    <motion.div
                      className="flex items-center justify-between gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.38, duration: 0.3, ease: easeOut }}
                    >
                      <span className="font-light text-indigo-100">Execution improved</span>
                      <span className="font-medium tabular-nums text-white">37%</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.46, duration: 0.3, ease: easeOut }}
                    >
                      <span className="font-light text-indigo-100">Domain focus</span>
                      <span className="font-medium text-white">Fintech</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.54, duration: 0.3, ease: easeOut }}
                    >
                      <span className="font-light text-indigo-100">Primary ecosystem</span>
                      <span className="font-medium text-white">JS</span>
                    </motion.div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <SectionLabel>Core Stack</SectionLabel>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {coreStack.map(({ icon: Icon, iconClass, name }, index) => (
                      <motion.div
                        key={name}
                        className="group flex min-h-9 items-center gap-3 rounded-lg px-1 transition-colors hover:bg-indigo-50"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 + index * 0.04, duration: 0.3, ease: easeOut }}
                        whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                      >
                        <Icon
                          className={`size-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconClass}`}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5">
                  <SectionLabel>Current Focus</SectionLabel>
                  <div className="grid gap-4">
                    {focusItems.map(({ body, icon: Icon }) => (
                      <div key={body} className="group flex gap-3">
                        <Icon className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                        <p className="text-sm font-light leading-6 text-slate-700 transition-colors group-hover:text-slate-900">
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24" data-scroll-target="work">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
            <motion.div
              className="mx-auto mb-14 grid max-w-3xl justify-items-center gap-4 text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <SectionLabel>Selected work</SectionLabel>
              <h2 className="text-4xl font-light leading-tight text-slate-900 text-balance sm:text-5xl">
                Selected product systems and internal tools.
              </h2>
              <p className="max-w-2xl text-base font-light leading-7 text-slate-600 text-pretty">
                These public-safe examples show how I structure internal workflows, design for
                auditability, connect frontend and backend concerns, and turn ambiguous requirements
                into maintainable product surfaces.
              </p>
            </motion.div>

            <div className="grid gap-16 md:gap-20">
              {projects.map((project, index) => (
                <motion.article
                  key={project.title}
                  className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.25, once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: easeOut }}
                >
                  <motion.div
                    className={`grid gap-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                    whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                    transition={spring}
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shadow-lg shadow-indigo-100">
                      <project.icon className="size-5" />
                    </div>
                    <div className="grid gap-3">
                      <p className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium uppercase text-indigo-700">
                        {project.role}
                      </p>
                      <h3 className="max-w-xl text-3xl font-light leading-tight text-slate-900 text-balance transition-colors group-hover:text-indigo-700 sm:text-4xl">
                        {project.title}
                      </h3>
                      <p className="max-w-xl text-base font-light leading-7 text-slate-600 text-pretty">
                        {project.summary}
                      </p>
                    </div>
                    <ul className="grid gap-3">
                      {project.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="group/bullet flex gap-3 text-sm font-light leading-6 text-slate-700"
                        >
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-600 transition-transform duration-200 group-hover/bullet:scale-110" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors group-hover:bg-indigo-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className={`relative min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/70 outline outline-1 outline-black/10 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { rotate: index % 2 === 1 ? -0.25 : 0.25, y: -6 }
                    }
                    transition={spring}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-100/70 to-transparent" />
                    <img
                      src={project.preview}
                      alt={`${project.title} interface preview`}
                      className="relative aspect-[1.45/1] h-full min-h-[18rem] w-full rounded-xl object-cover object-left-top shadow-lg shadow-slate-200 transition-transform duration-500 group-hover:scale-[1.025]"
                      loading="lazy"
                    />
                    <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-indigo-950/90 p-4 text-white shadow-2xl shadow-indigo-950/30 backdrop-blur">
                      <div className="flex justify-end">
                        <span className="rounded-full bg-fuchsia-400 px-2.5 py-1 text-xs font-medium text-indigo-950">
                          Demo
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-light leading-6 text-indigo-50">
                        {project.impact}
                      </p>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto w-[min(1200px,calc(100%-2rem))] py-16 md:py-20"
          data-scroll-target="experience"
        >
          <motion.div
            className="mx-auto mb-14 grid max-w-3xl justify-items-center gap-4 text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4, once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <SectionLabel>Experience</SectionLabel>
            <h2 className="text-4xl font-light leading-tight text-slate-900 text-balance sm:text-5xl">
              Seven years across fintech, banking, and enterprise systems.
            </h2>
            <p className="max-w-2xl text-base font-light leading-7 text-slate-600 text-pretty">
              My experience spans internal fintech platforms, digital lending services, ERP
              customization, access control, APIs, integrations, monitoring, documentation, and
              performance improvement.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute bottom-0 left-[min(21rem,43%)] top-0 hidden w-px bg-slate-200 lg:block" />
            {experiences.map((item, index) => (
              <motion.article
                key={`${item.company}-${item.role}`}
                className="relative grid gap-5 border-t border-slate-200 py-9 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(12rem,21rem)_3rem_minmax(0,1fr)] lg:gap-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.35, once: true }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: easeOut }}
              >
                <div className="grid content-start gap-3">
                  <p
                    className={`text-lg font-medium leading-none ${
                      item.current ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                  >
                    {item.period}
                  </p>
                  {item.current ? (
                    <span className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                      Current
                    </span>
                  ) : null}
                </div>

                <div className="pointer-events-none absolute left-0 top-8 lg:static lg:flex lg:justify-center">
                  <span
                    className={`relative z-10 inline-flex size-6 rounded-full border-2 bg-white ${
                      item.current
                        ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-200'
                        : 'border-slate-400'
                    }`}
                  />
                </div>

                <div className="pl-10 lg:pl-0">
                  <div className="grid gap-2">
                    <h3 className="text-2xl font-light leading-tight text-slate-900 text-balance">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600">{item.company}</p>
                  </div>
                  <ul className="mt-5 grid gap-3">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm font-light leading-6 text-slate-600"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-16 md:py-20" data-scroll-target="strengths">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
            <motion.div
              className="mx-auto mb-12 grid max-w-3xl justify-items-center gap-4 text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <SectionLabel tone="dark">Technical strengths</SectionLabel>
              <h2 className="text-4xl font-light leading-tight text-white text-balance sm:text-5xl">
                Strong where product, platform, and reliability meet.
              </h2>
              <p className="max-w-2xl text-base font-light leading-7 text-slate-300 text-pretty">
                I am strongest on teams that need someone who can connect user-facing workflows,
                backend services, data models, access rules, monitoring, and delivery planning.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {strengths.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="group rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm shadow-slate-950/30 transition-[background-color,border-color,box-shadow] duration-300 hover:border-indigo-500 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-950/40"
                  initial={shouldReduceMotion ? false : { opacity: 0.35, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  viewport={{ amount: 0.35, once: true }}
                  transition={{ delay: index * 0.04, duration: 0.24, ease: easeOut }}
                >
                  <h3 className="text-xl font-light leading-tight text-white">{item.title}</h3>
                  <ul className="mt-4 grid gap-2 text-sm font-light leading-5 text-slate-300">
                    {item.items.map((skill) => (
                      <li key={skill} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-300 transition-transform duration-200 group-hover:scale-110 group-hover:text-indigo-200" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20" data-scroll-target="contact">
          <motion.div
            className="mx-auto w-[min(1200px,calc(100%-2rem))]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.35, once: true }}
            transition={{ duration: 0.42, ease: easeOut }}
          >
            <div className="max-w-4xl">
              <p className="flex w-fit items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-indigo-700">
                <span className="h-px w-10 bg-indigo-300" />
                Let&apos;s connect
              </p>
              <h2 className="mt-8 max-w-4xl text-5xl font-light leading-[1.05] text-slate-900 text-balance sm:text-6xl">
                Thanks for looking.
                <br />
                Let&apos;s stay in touch.
              </h2>
              <p className="mt-7 max-w-3xl text-base font-light leading-7 text-slate-600 text-pretty sm:text-lg">
                If your team needs a full-stack engineer who can connect product workflows, backend
                services, and operational reliability, I&apos;d be glad to talk.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-0 gap-y-4 text-sm font-medium text-indigo-700">
              <a
                className="group inline-flex min-h-11 items-center gap-2 pr-8 transition-colors duration-200 hover:text-indigo-500 active:scale-[0.96]"
                href="mailto:contact@dennydharmawan.com"
              >
                <Mail className="size-5" />
                <span>Email me</span>
                <FooterLinkArrow />
              </a>
              <span className="mr-8 hidden h-8 w-px bg-slate-300 sm:block" />
              <a
                className="group inline-flex min-h-11 items-center gap-2 pr-8 transition-colors duration-200 hover:text-indigo-500 active:scale-[0.96]"
                href="https://www.linkedin.com/in/ddharmawan"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedinIn className="size-5" />
                <span>LinkedIn</span>
                <FooterLinkArrow />
              </a>
              <span className="mr-8 hidden h-8 w-px bg-slate-300 sm:block" />
              <a
                className="group inline-flex min-h-11 items-center gap-2 pr-8 transition-colors duration-200 hover:text-indigo-500 active:scale-[0.96]"
                href="https://github.com/dennydharmawan"
                target="_blank"
                rel="noreferrer"
              >
                <SiGithub className="size-5" />
                <span>GitHub</span>
                <FooterLinkArrow />
              </a>
              <span className="mr-8 hidden h-8 w-px bg-slate-300 sm:block" />
              <a
                className="group inline-flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-indigo-500 active:scale-[0.96]"
                href="/resume.pdf"
              >
                <FileText className="size-5" />
                <span>Resume</span>
                <FooterLinkArrow />
              </a>
            </div>

            <div className="mt-14 border-t border-slate-200 pt-8">
              <div className="flex flex-col gap-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-200"
                  >
                    DD
                  </span>
                  <span className="font-medium text-slate-900">Denny Dharmawan</span>
                  <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
                    •
                  </span>
                  <span>Full-Stack Engineer</span>
                  <span aria-hidden="true" className="hidden text-slate-400 sm:inline">
                    •
                  </span>
                  <span>Jakarta, Indonesia</span>
                </div>
                <p className="font-light">© 2026 All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
