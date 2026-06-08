import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Mail,
  ShieldCheck
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll
} from 'motion/react';
import { SiMysql, SiNextdotjs, SiNodedotjs, SiReact, SiRedis, SiTypescript } from 'react-icons/si';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '#work', label: 'Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#strengths', label: 'Strengths' },
  { href: '#contact', label: 'Contact' }
];

const proofItems = [
  { label: 'Years experience', value: '7+' },
  { label: 'Faster execution after refactoring legacy modules', value: '37%' },
  { label: 'Digital banking and internal platforms', value: 'Fintech' },
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
    body: 'Internal platforms with clear workflows and role-aware actions.',
    icon: BriefcaseBusiness
  },
  {
    body: 'Auditability, permission visibility, and data integrity by design.',
    icon: ShieldCheck
  },
  {
    body: 'Performance, scalability, and operational reliability across delivery.',
    icon: Gauge
  }
];

const projects = [
  {
    bullets: [
      'Models approval states as explicit queue phases instead of hidden app behavior',
      'Makes role-aware decisions clear before someone clicks a risky action',
      'Keeps review history audit-ready without exposing private operational data'
    ],
    demonstrates: 'Workflow modeling, product judgment, and audit-aware implementation',
    icon: BriefcaseBusiness,
    impact: 'Designed around clearer queues, safer actions, and maintainable workflow state.',
    preview: '/portfolio-previews/approval-workflow.png',
    role: 'Full-stack product engineering',
    stack: ['React', 'Node.js', 'TypeScript', 'MySQL'],
    summary:
      'A public-safe workflow for reviewing operational records, surfacing status, and keeping approval decisions traceable.',
    title: 'Approval Workflow Prototype'
  },
  {
    bullets: [
      'Turns scattered assignments, follow-ups, and reporting into one operating surface',
      'Designs for agents, team leads, managers, and admins without splitting the workflow',
      'Uses status and ownership signals to reduce ambiguity in daily operations'
    ],
    demonstrates: 'Operational UX, dashboard systems, and cross-role visibility',
    icon: Gauge,
    impact: 'Focuses on reducing ambiguity for agents, team leads, managers, and admins.',
    preview: '/portfolio-previews/operations-platform.png',
    role: 'Workflow and systems design',
    stack: ['Next.js', 'Express', 'Sequelize', 'Redis'],
    summary:
      'A dashboard-style system for assignments, follow-ups, reporting, and team visibility across internal operations.',
    title: 'Operations Platform Prototype'
  },
  {
    bullets: [
      'Shows roles, requests, protected areas, and access history in one reviewable flow',
      'Separates permission review from implementation details so decisions stay readable',
      'Keeps access changes traceable for audits, support, and safer maintenance'
    ],
    demonstrates: 'Security UX, RBAC structure, and protected-route thinking',
    icon: ShieldCheck,
    impact:
      'Built around auditability, permission visibility, and reusable protected-route patterns.',
    preview: '/portfolio-previews/access-management.png',
    role: 'Full-stack implementation',
    stack: ['Next.js', 'SSO', 'RBAC', 'Redis'],
    summary:
      'A secure permissions experience for reviewing roles, requests, protected areas, and access history.',
    title: 'Access Management Prototype'
  }
];

const experiences = [
  {
    company: 'Krom Bank',
    details:
      'Build and maintain full-stack internal fintech platforms across React, Next.js, Node.js, Express, TypeScript, MySQL, Sequelize, Redis, and Mantine UI.',
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer'
  },
  {
    company: 'Jenius / Bank BTPN',
    details:
      'Worked on digital banking and lending services using Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
    period: 'Dec 2019 - Jan 2022',
    role: 'Back End Engineer'
  },
  {
    company: 'Iverson Technology',
    details:
      'Delivered Microsoft Dynamics AX customizations, integrations, and operational system support for enterprise clients.',
    period: 'Dec 2017 - Dec 2019',
    role: 'Technical Consultant'
  }
];

const strengths = [
  {
    items: ['React and Next.js', 'TypeScript', 'Component systems', 'Responsive interfaces'],
    title: 'Frontend Engineering'
  },
  {
    items: ['Node.js and Express', 'API design', 'Data models', 'Caching and integrations'],
    title: 'Backend Engineering'
  },
  {
    items: ['Access control', 'Auditability', 'Monitoring awareness', 'Operational clarity'],
    title: 'Fintech Reliability'
  },
  {
    items: [
      'Requirements shaping',
      'Architecture planning',
      'Documentation',
      'Implementation plans'
    ],
    title: 'System Design'
  }
];

const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
const easeOut = [0.2, 0, 0, 1] as const;
const anchorScrollOffset = 76;

function smoothScrollToHash(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  shouldReduceMotion: boolean | null
) {
  if (!href.startsWith('#')) {
    return;
  }

  const target = document.querySelector<HTMLElement>(href);

  if (!target) {
    return;
  }

  event.preventDefault();

  const targetTop =
    href === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - anchorScrollOffset;

  window.scrollTo({
    behavior: shouldReduceMotion ? 'auto' : 'smooth',
    top: Math.max(targetTop, 0)
  });

  window.history.pushState(null, '', href);
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium uppercase text-indigo-700 shadow-sm shadow-indigo-200/60">
      {children}
    </p>
  );
}

function AnimatedHeader() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isNavFloating, setIsNavFloating] = useState(false);
  const [hoveredNavHref, setHoveredNavHref] = useState<string | null>(null);
  const navShellClass = isNavFloating
    ? 'mt-3 w-[min(980px,calc(100%-0rem))] rounded-full border border-white/70 bg-white/85 shadow-2xl shadow-indigo-950/10'
    : 'mt-0 w-[min(1200px,calc(100%-0rem))] rounded-none border border-transparent bg-transparent shadow-none';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsNavFloating(latest > 28);
  });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-0 md:px-4">
      <motion.div
        layout
        className={`pointer-events-auto mx-auto flex min-h-16 items-center justify-between gap-4 px-4 backdrop-blur transition-[background-color,border-color,box-shadow] duration-300 md:px-6 ${navShellClass}`}
        animate={shouldReduceMotion ? false : { scale: isNavFloating ? 0.985 : 1 }}
        transition={spring}
      >
        <motion.a
          className="inline-flex min-h-10 items-center whitespace-nowrap text-base font-semibold text-slate-950 transition-colors hover:text-indigo-700"
          href="#top"
          aria-label="Denny Dharmawan home"
          onClick={(event) => smoothScrollToHash(event, '#top', shouldReduceMotion)}
          transition={spring}
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
        <nav
          className="flex items-center justify-end gap-1.5"
          aria-label="Main navigation"
          onMouseLeave={() => setHoveredNavHref(null)}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              className="relative hidden min-h-10 items-center rounded-full px-3 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:text-slate-950 focus-visible:text-slate-950 sm:inline-flex"
              href={item.href}
              onBlur={() => setHoveredNavHref(null)}
              onFocus={() => setHoveredNavHref(item.href)}
              onClick={(event) => smoothScrollToHash(event, item.href, shouldReduceMotion)}
              onMouseEnter={() => setHoveredNavHref(item.href)}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {hoveredNavHref === item.href ? (
                  <motion.span
                    layoutId="nav-hover-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-white/75 ring-1 ring-slate-200/70"
                    initial={
                      shouldReduceMotion ? false : { filter: 'blur(4px)', opacity: 0, scale: 0.96 }
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
            </a>
          ))}
          <Button asChild variant="outline" size="sm" className="ml-1">
            <a href="/resume.pdf">
              Resume <Download data-icon="inline-end" />
            </a>
          </Button>
        </nav>
      </motion.div>
    </header>
  );
}

export default function PortfolioHome() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnimatedHeader />

      <main id="top">
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
            <motion.div
              className="grid content-start gap-7"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <motion.div
                className="grid gap-5"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
              >
                <SectionLabel>Senior Full-Stack Engineer</SectionLabel>
                <h1 className="max-w-3xl text-5xl font-light leading-[1.03] text-slate-900 text-balance sm:text-6xl">
                  Building reliable web platforms for fintech and business operations.
                </h1>
                <p className="max-w-2xl text-base font-light leading-7 text-slate-700 sm:text-lg">
                  I design and build full-stack applications across the JavaScript ecosystem, with
                  experience in digital banking, internal tools, access management, and
                  performance-focused web systems.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.42, ease: easeOut }}
              >
                <Button asChild size="lg" className="h-10 px-4">
                  <a
                    className="group"
                    href="#work"
                    onClick={(event) => smoothScrollToHash(event, '#work', shouldReduceMotion)}
                  >
                    View my work{' '}
                    <ArrowRight
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      data-icon="inline-end"
                    />
                  </a>
                </Button>
              </motion.div>

              <motion.div
                className="grid gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/80 backdrop-blur transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/50 sm:grid-cols-2 lg:grid-cols-4"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
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
                        Remote and onsite collaboration
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
                      <span className="font-light text-indigo-100">Workflow clarity</span>
                      <span className="font-medium tabular-nums text-white">37%</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.46, duration: 0.3, ease: easeOut }}
                    >
                      <span className="font-light text-indigo-100">Platform focus</span>
                      <span className="font-medium text-white">Fintech</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.54, duration: 0.3, ease: easeOut }}
                    >
                      <span className="font-light text-indigo-100">Primary stack</span>
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

        <section className="bg-slate-50 py-16 md:py-24" id="work">
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
                Portfolio prototypes that show how I think through systems.
              </h2>
              <p className="max-w-2xl text-base font-light leading-7 text-slate-600 text-pretty">
                These are public-safe demonstrations of the kind of product engineering work I do:
                clarifying operational workflows, designing for reliability, and turning ambiguous
                requirements into maintainable interfaces.
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
                    <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-sm shadow-slate-200/70">
                      <p className="text-xs font-medium uppercase text-indigo-700">
                        What this demonstrates
                      </p>
                      <p className="mt-2 text-sm font-light leading-6 text-slate-700">
                        {project.demonstrates}
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
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-medium uppercase text-indigo-200">
                          Portfolio signal
                        </p>
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
          className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-10 py-16 md:grid-cols-[15rem_minmax(0,1fr)] md:py-20"
          id="experience"
        >
          <motion.div
            className="grid content-start gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4, once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <SectionLabel>Experience</SectionLabel>
            <h2 className="text-4xl font-light leading-tight text-slate-900">
              Fintech, banking, and enterprise systems.
            </h2>
          </motion.div>
          <div className="grid gap-3">
            {experiences.map((item, index) => (
              <motion.article
                key={`${item.company}-${item.role}`}
                className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70 md:grid-cols-[9rem_minmax(0,13rem)_minmax(0,1fr)] md:gap-8"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.35, once: true }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: easeOut }}
              >
                <div className="flex items-center gap-3 text-sm font-light text-slate-500 md:block">
                  <span className="inline-flex size-2.5 rounded-full bg-indigo-600" />
                  <p className="md:mt-3">{item.period}</p>
                </div>
                <div>
                  <h3 className="text-xl font-light leading-tight text-slate-900">{item.role}</h3>
                  <p className="mt-1 text-sm font-medium text-indigo-600">{item.company}</p>
                </div>
                <p className="text-sm font-light leading-6 text-slate-600">{item.details}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 py-16 md:py-20" id="strengths">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
            <motion.div
              className="mb-8 grid gap-4 md:grid-cols-[15rem_minmax(0,1fr)]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <SectionLabel>Technical strengths</SectionLabel>
              <div className="max-w-3xl">
                <h2 className="text-4xl font-light leading-tight text-slate-900">
                  Full-stack delivery with product and reliability awareness.
                </h2>
                <p className="mt-3 text-sm font-light leading-6 text-slate-600">
                  Practical engineering across interfaces, APIs, data models, operational workflows,
                  and implementation planning.
                </p>
              </div>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {strengths.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="group rounded-xl border border-amber-200 bg-white p-6 shadow-sm shadow-amber-100 transition-[border-color,box-shadow] duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-amber-200/70"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  viewport={{ amount: 0.35, once: true }}
                  transition={{ delay: index * 0.05, duration: 0.35, ease: easeOut }}
                >
                  <h3 className="text-xl font-light leading-tight text-slate-900">{item.title}</h3>
                  <ul className="mt-4 grid gap-2 text-sm font-light leading-5 text-slate-600">
                    {item.items.map((skill) => (
                      <li key={skill} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-600 transition-transform duration-200 group-hover:scale-110" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-indigo-950 py-12 text-white md:py-14" id="contact">
          <motion.div
            className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.35, once: true }}
            transition={{ duration: 0.42, ease: easeOut }}
          >
            <div>
              <p className="w-fit rounded-full bg-indigo-800 px-3 py-1 text-xs font-medium uppercase text-indigo-100">
                Contact
              </p>
              <h2 className="mt-4 text-4xl font-light leading-tight">
                Let&apos;s build reliable software together.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-indigo-100">
                Open to conversations about full-stack engineering, fintech systems, internal tools,
                and remote engineering opportunities.
              </p>
            </div>
            <Button asChild size="lg" className="h-10 px-4">
              <a className="group" href="mailto:contact@dennydharmawan.com">
                Contact me{' '}
                <ArrowRight
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  data-icon="inline-end"
                />
              </a>
            </Button>
            <div className="flex flex-wrap gap-5 text-sm">
              <a
                className="group inline-flex min-h-11 items-center gap-3 text-indigo-100 transition-[color,transform] hover:-translate-y-0.5 hover:text-white active:scale-[0.96]"
                href="mailto:contact@dennydharmawan.com"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-indigo-700 bg-indigo-900 transition-colors group-hover:bg-indigo-800">
                  <Mail className="size-4" />
                </span>
                <span>
                  <span className="block font-medium text-white">Email</span>
                  contact@dennydharmawan.com
                </span>
              </a>
              <a
                className="group inline-flex min-h-11 items-center gap-3 text-indigo-100 transition-[color,transform] hover:-translate-y-0.5 hover:text-white active:scale-[0.96]"
                href="https://www.linkedin.com/in/ddharmawan"
                target="_blank"
                rel="noreferrer"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-indigo-700 bg-indigo-900 transition-colors group-hover:bg-indigo-800">
                  <ExternalLink className="size-4" />
                </span>
                <span>
                  <span className="block font-medium text-white">LinkedIn</span>
                  /in/ddharmawan
                </span>
              </a>
            </div>
          </motion.div>
        </section>

        <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] flex-wrap items-center justify-between gap-4 py-6 text-sm font-light text-slate-500">
          <p>Denny Dharmawan</p>
          <div className="flex gap-4">
            <a
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              href="https://github.com/dennydharmawan"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 className="size-4" /> GitHub
            </a>
            <a
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              href="/resume.pdf"
            >
              <FileText className="size-4" /> Resume
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
