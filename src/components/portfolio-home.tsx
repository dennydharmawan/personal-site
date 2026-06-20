import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Database,
  Download,
  Gauge,
  Mail,
  MapPin,
  Rocket,
  ServerCog,
  Waypoints
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { portfolioMarqueeImages } from '@/components/portfolio-marquee-images';
import { TechStackCarousel } from '@/components/tech-stack-carousel';
import { ThreeDMarquee } from '@/components/ui/3d-marquee';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Work Samples', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' }
];

const footerNavItems = [
  { label: 'Home', target: 'top' },
  { label: 'Work Samples', target: 'work' },
  { label: 'Experience', target: 'experience' },
  { label: 'About', target: 'about' },
  { label: 'Contact', target: 'contact' }
];

const footerProfileLinks = [
  {
    href: 'https://github.com/dennydharmawan',
    label: 'GitHub'
  },
  {
    href: 'https://www.linkedin.com/in/ddharmawan',
    label: 'LinkedIn'
  },
  {
    href: '/resume.pdf',
    label: 'Resume'
  }
];

const footerWorkSamplePlaceholders = [
  'Access Governance Portal',
  'Incident Replay Workbench',
  'Feature Flag Control Plane'
];

const capabilityItems = [
  {
    body: 'Build React and Next.js interfaces for complex product flows, status, and ownership.',
    icon: Code2,
    iconTone: 'bg-sky-50 text-sky-700 ring-sky-100',
    signals: ['React / Next.js', 'Stateful UI', 'Responsive flows'],
    title: 'Frontend Applications'
  },
  {
    body: 'Design APIs and services around integrations, auth, and business rules that need to stay reliable.',
    icon: ServerCog,
    iconTone: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    signals: ['Node / Express', 'REST / GraphQL', 'Auth flows'],
    title: 'Backend Services & APIs'
  },
  {
    body: 'Shape operational data across database design, SQL, NoSQL, caching, reporting, and service handoffs.',
    icon: Database,
    iconTone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    signals: ['Database design', 'SQL / NoSQL', 'Redis'],
    title: 'Data & System Flows'
  },
  {
    body: 'Build async workflows with queues, scheduled tasks, notifications, and integrations.',
    icon: Waypoints,
    iconTone: 'bg-orange-50 text-orange-700 ring-orange-100',
    signals: ['Kafka / Bull', 'Scheduled jobs', 'Integrations'],
    title: 'Background Jobs & Messaging'
  },
  {
    body: 'Build admin tools, approval flows, RBAC reviews, audit trails, and workflow tooling.',
    icon: BriefcaseBusiness,
    iconTone: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100',
    signals: ['Admin tools', 'Approvals', 'RBAC'],
    title: 'Product & Operations Tools'
  },
  {
    body: 'Improve monitoring, logs, traces, error triage, rollouts, and performance visibility for high-availability systems.',
    icon: Gauge,
    iconTone: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    signals: ['Datadog', 'Debugging', 'High availability'],
    title: 'Reliability & Observability'
  }
];

const skillGroups = [
  {
    body: 'Build React, Next.js, and TypeScript interfaces where complex status, ownership, and next action stay obvious.',
    icon: Code2,
    items: ['React', 'Next.js', 'TypeScript', 'Component systems'],
    title: 'Frontend engineering'
  },
  {
    body: 'Design Node.js services, APIs, data models, integrations, and caching around business rules that need to stay reliable.',
    icon: Database,
    items: ['Node.js', 'Express', 'GraphQL', 'Redis'],
    title: 'Backend services'
  },
  {
    body: 'Improve observability, access control, release workflows, and CI/CD so teams can ship changes with less operational risk.',
    icon: Rocket,
    items: ['Monitoring', 'RBAC', 'Rollouts', 'CI/CD'],
    title: 'Reliability and delivery'
  }
];

const projects = [
  {
    bullets: [
      'User and team management with roles, permissions, protected resources, and admin actions',
      'RBAC rules for product features, API routes, and sensitive operational workflows',
      'Access requests, approvals, and audit logs for traceable permission changes'
    ],
    impact:
      'Planned sample for platform thinking around authentication, RBAC, protected APIs, and auditability.',
    preview: '/portfolio-previews/multi-tenant-rbac.svg',
    role: 'Authentication, RBAC, and user management',
    stack: ['Next.js', 'Node.js', 'RBAC', 'PostgreSQL'],
    summary:
      'A planned platform for sign-in, user accounts, team membership, role-based permissions, access requests, and audit logs.',
    title: 'Authentication & Access Management'
  },
  {
    bullets: [
      'Designed to turn delinquent accounts into prioritized queues with owners, due dates, and escalation state',
      'Planned WhatsApp API messaging for reminders, promises to pay, and follow-up templates',
      'Collection activity, customer responses, payment promises, and operational outcome tracking'
    ],
    impact:
      'Planned sample connecting fintech operations, messaging integrations, queues, and reporting in one workflow.',
    preview: '/portfolio-previews/loan-collection-whatsapp.svg',
    role: 'Fintech operations workflow and integration design',
    stack: ['React', 'Node.js', 'WhatsApp API', 'Queues'],
    summary:
      'A planned loan collection workspace for prioritizing overdue accounts, coordinating collectors, and sending WhatsApp-based follow-ups.',
    title: 'Loan Collection System'
  },
  {
    bullets: [
      'Designed to cover catalog, cart, checkout, order status, inventory visibility, and admin operations',
      'Planned payment intent states, callbacks, reconciliation, and customer-facing confirmation',
      'Clear separation between storefront UX and operational payment and fulfillment workflows'
    ],
    impact:
      'Planned sample for full-stack product delivery across checkout UX, payment state, and order operations.',
    preview: '/portfolio-previews/ecommerce-payment-platform.svg',
    role: 'Commerce product flow and payment integration',
    stack: ['Next.js', 'Payment API', 'Webhooks', 'SQL'],
    summary:
      'A planned e-commerce platform prototype with product browsing, checkout, payment integration, and order management.',
    title: 'E-commerce Payment Platform'
  },
  {
    bullets: [
      'Designed to generate carousel drafts from a prompt, topic outline, or reusable content structure',
      'Planned brand presets, slide-level editing, image choices, and export-ready layouts',
      'AI generation connected to a practical editing workflow instead of one-shot output'
    ],
    impact:
      'Planned sample for applied AI product thinking across generation, editing, brand controls, and export flow.',
    preview: '/portfolio-previews/ai-carousel-generator.svg',
    role: 'AI-assisted creative tooling and frontend workflow',
    stack: ['React', 'AI API', 'Canvas UI', 'Export'],
    summary:
      'A planned social media carousel generator that helps users turn ideas into editable, branded carousel posts with AI support.',
    title: 'AI Carousel Generator'
  }
];

const experiences = [
  {
    bullets: [
      'Maintain and improve internal fintech platforms used by business and operations teams, with focus on reliability, maintainability, and performance.',
      'Owned end-to-end system design and delivery for internal operations tools across data modeling, workflow UI, API integration, monitoring, and release support.',
      'Reduced average API execution time by 37% by addressing technical debt in legacy modules, improving code structure, and adding targeted caching.',
      'Designed access-management workflows covering RBAC, access review, audit trails, and operational approval flows.',
      'Built shared internal libraries for audit logging, feature-flag management, and common implementation utilities that helped standardize delivery.',
      'Drive engineering standards through RFCs, technical documentation, reusable implementation patterns, and cross-functional delivery.',
      'Improved production reliability through monitoring dashboards, distributed tracing, CI/CD improvements, and infrastructure migration support.'
    ],
    company: 'Krom Bank',
    current: true,
    period: 'Jan 2023 - Present',
    role: 'Senior Full-Stack Engineer',
    roleHistory: [
      {
        period: 'May 2026 - Present',
        role: 'Senior Full-Stack Engineer'
      },
      {
        period: 'Jan 2023 - May 2026',
        role: 'Full-Stack Engineer'
      }
    ]
  },
  {
    bullets: [
      'Built and maintained backend services for Jenius and Flexi Cash using Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
      'Served on the backend team during Flexi Cash growth from launch to a 147% increase in user base over three years.',
      'Developed APIs, data flows, and service integrations for loan origination, funding disbursement, and partner distribution workflows.',
      'Built external retail partner integration flows to expand Flexi Cash digital lending distribution.',
      'Improved backend maintainability through service refactoring, integration reliability improvements, and cleaner error handling.'
    ],
    company: 'Jenius / Bank SMBC Indonesia',
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

const aboutPrinciples = [
  {
    body: 'I keep up with evolving web technologies, with a strong interest in distributed systems and scalable architecture.',
    title: 'Continuous learning'
  },
  {
    body: 'I rely on clear problem-solving, persistence, and close collaboration to move work forward across teams and stakeholders.',
    title: 'Collaborative delivery'
  }
];

const trustedTeams = [
  {
    logo: '/company-logos/bank-smbc-indonesia.svg',
    logoClassName: 'h-9 max-w-[8.5rem]',
    logoStyleClassName: 'grayscale opacity-[0.6] contrast-90',
    name: 'Bank SMBC Indonesia'
  },
  {
    logo: '/company-logos/krom-bank.svg',
    logoClassName: 'h-7 max-w-[7.75rem]',
    logoStyleClassName: 'opacity-[0.68] grayscale',
    name: 'Krom Bank'
  }
];

const spring = { bounce: 0, duration: 0.3, type: 'spring' as const };
const easeOut = [0.2, 0, 0, 1] as const;
const anchorScrollOffset = 76;
const careerStart = { monthIndex: 11, year: 2017 };

function getYearsExperience(date = new Date()) {
  const completedYears = date.getFullYear() - careerStart.year;
  return date.getMonth() >= careerStart.monthIndex ? completedYears : completedYears - 1;
}

function initialValue<T>(shouldReduceMotion: boolean | null, value: T) {
  return shouldReduceMotion ? false : value;
}

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

function FooterLinkArrow() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-1 h-4 w-5 shrink-0 overflow-visible text-current"
      fill="none"
      viewBox="0 0 20 16"
    >
      <line
        className="origin-[5px_8px] scale-x-0 opacity-0 transition-[scale,opacity] duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-x-0 motion-reduce:group-hover:opacity-0"
        x1="5"
        x2="15"
        y1="8"
        y2="8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        d="M5 4L9 8L5 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function HeroPreviewBand({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      initial={shouldReduceMotion ? false : { filter: 'blur(4px)', opacity: 0, y: 16 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.48, ease: easeOut }}
    >
      <img
        src="/portfolio-previews/team-gaze-hero.png"
        alt="Team collaborating around a laptop with attention directed toward the next action"
        className="h-[12.5rem] w-full object-cover object-[25%_center] sm:h-[17rem] lg:h-[18rem]"
        decoding="async"
      />
    </motion.div>
  );
}

function HeroProofBlock({ yearsExperience }: { yearsExperience: number }) {
  return (
    <div className="grid gap-6 pt-2 min-[520px]:grid-cols-[minmax(0,1fr)_minmax(8.5rem,0.36fr)] min-[520px]:items-end lg:gap-8">
      <div className="grid gap-3">
        <p className="max-w-md text-sm font-medium leading-6 text-slate-700 text-pretty">
          Trusted by teams at Indonesia&apos;s leading digital banks
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {trustedTeams.map((team) => (
            <span key={team.name} className="inline-flex h-10 min-w-24 items-center justify-start">
              <img
                src={team.logo}
                alt={`${team.name} logo`}
                className={`${team.logoClassName} ${team.logoStyleClassName} w-auto object-contain`}
                decoding="async"
              />
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-5xl font-semibold leading-none text-slate-700 tabular-nums">
          {yearsExperience}+
        </p>
        <p className="text-sm font-medium leading-5 text-slate-600 text-pretty">
          years of experience
        </p>
      </div>
    </div>
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
            className="inline-flex min-h-10 items-center whitespace-nowrap text-slate-950 transition-colors hover:text-indigo-700"
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
              style={{ height: '2rem', marginRight: '0.5rem', width: '2rem' }}
            >
              DD
            </span>
            <span className="grid gap-px leading-none">
              <span className="text-base font-semibold">Denny Dharmawan</span>
              <span className="text-xs font-medium text-slate-500">Full-Stack Engineer</span>
            </span>
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
                className="relative hidden min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-800 transition-colors duration-200 hover:text-slate-950 focus-visible:text-slate-950 sm:inline-flex"
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
                      className="absolute inset-0 rounded-xl bg-slate-100/90 shadow-sm ring-1 ring-slate-300/70"
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
              <Button asChild variant="outline" size="sm" className="ml-1 min-h-10 px-4">
                <a
                  href="mailto:contact@dennydharmawan.com"
                  aria-label="Email contact@dennydharmawan.com"
                >
                  <span className="lg:hidden">Email</span>
                  <span className="hidden lg:inline">contact@dennydharmawan.com</span>
                </a>
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      </motion.div>
    </header>
  );
}

function usePreventHashNavigation() {
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
}

function CapabilitiesSection({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section className="border-y border-slate-200 bg-white py-16 md:py-20">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
        <motion.div
          className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4, once: true }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div className="grid content-start gap-4">
            <p className="text-sm font-semibold text-slate-950">Capabilities</p>
            <h2 className="max-w-md text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl">
              What I build and how I build it.
            </h2>
          </div>
          <p className="max-w-xl text-base font-normal leading-7 text-slate-700 text-pretty lg:pt-8">
            I work across product interfaces, APIs, data models, access control, performance,
            monitoring, and delivery. I care about software that is clear to use, reliable to run,
            and practical for teams to maintain.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {skillGroups.map((group, index) => {
            const Icon = group.icon;

            return (
              <motion.article
                key={group.title}
                className="group grid gap-5"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3, once: true }}
                transition={{ delay: index * 0.06, duration: 0.36, ease: easeOut }}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                  <Icon className="size-6" />
                </div>
                <div className="grid gap-3">
                  <h3 className="max-w-sm text-3xl font-semibold leading-[1.08] text-slate-950 text-balance">
                    {group.title}
                  </h3>
                  <p className="max-w-sm text-base font-normal leading-7 text-slate-700 text-pretty">
                    {group.body}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
                  {group.items.map((skill, skillIndex) => (
                    <span key={skill} className="inline-flex items-center gap-2">
                      {skillIndex > 0 ? (
                        <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
                      ) : null}
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkSamplesSection({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const tapeText = Array.from({ length: 8 }, (_, index) => (
    <span key={index} className="inline-flex items-center gap-5">
      <span>Under development</span>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-slate-950/70" />
    </span>
  ));

  return (
    <section className="bg-slate-50 py-14 md:py-20" data-scroll-target="work">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
        <motion.div
          className="mb-12 grid max-w-3xl gap-4 md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4, once: true }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <h2 className="text-3xl font-semibold leading-[1.08] text-slate-950 text-balance sm:text-4xl lg:text-[2.75rem]">
            Selected Work Samples
          </h2>
          <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
            My work for enterprise companies is protected under strict NDAs. The prototypes and side
            projects below demonstrate how I approach problem-solving and apply my skills without
            exposing proprietary systems.
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
              <motion.div className={`grid gap-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="grid gap-3">
                  <p className="text-sm font-medium text-slate-500">{project.role}</p>
                  <h3 className="max-w-xl text-3xl font-semibold leading-tight text-slate-900 text-balance transition-colors group-hover:text-slate-700 sm:text-4xl">
                    {project.title}
                  </h3>
                  <p className="max-w-xl text-base font-normal leading-7 text-slate-600 text-pretty">
                    {project.summary}
                  </p>
                </div>
                <ul className="grid gap-3">
                  {project.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="group/bullet flex gap-3 text-sm font-normal leading-6 text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-600 transition-transform duration-200 group-hover/bullet:scale-110" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
                  {project.stack.map((tech, stackIndex) => (
                    <span key={tech} className="inline-flex items-center gap-2">
                      {stackIndex > 0 ? (
                        <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
                      ) : null}
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={`relative min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm outline outline-1 outline-black/10 transition-[border-color,box-shadow] duration-300 hover:border-indigo-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={spring}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-100/70 to-transparent" />
                <img
                  src={project.preview}
                  alt={`${project.title} interface preview`}
                  className="relative aspect-[1.45/1] h-full min-h-[18rem] w-full rounded-xl object-cover object-left-top"
                  loading="lazy"
                />
                <div
                  aria-label="Under development"
                  className="pointer-events-none absolute left-1/2 top-[42%] z-10 flex w-[135%] -translate-x-1/2 -rotate-3 items-center overflow-hidden border-y border-lime-300 bg-lime-300 py-2 text-sm font-black uppercase tracking-[0.08em] text-slate-950 shadow-[0_10px_0_rgba(15,23,42,0.12)] sm:text-base"
                >
                  <div className="flex min-w-max gap-5 whitespace-nowrap px-5">{tapeText}</div>
                </div>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PortfolioHome() {
  const shouldReduceMotion = useReducedMotion();
  const yearsExperience = getYearsExperience();

  usePreventHashNavigation();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnimatedHeader />

      <main data-scroll-target="top">
        <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_52%,#f2f6ff_100%)] pb-10 pt-24 sm:pt-28 lg:pb-14">
          <motion.div
            className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8"
            initial={initialValue(shouldReduceMotion, {
              filter: 'blur(3px)',
              opacity: 0,
              y: 12
            })}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
          >
            <div className="grid gap-7">
              <h1 className="max-w-6xl text-[2.625rem] font-normal leading-[1.04] text-slate-950 sm:text-6xl sm:leading-[0.96] lg:text-[5.35rem]">
                Building web solutions
                <span className="block pt-1 text-slate-400 sm:pt-2">that actually scale.</span>
              </h1>

              <HeroPreviewBand shouldReduceMotion={shouldReduceMotion} />
            </div>

            <div className="grid gap-7 pt-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)] lg:items-end">
              <HeroProofBlock yearsExperience={yearsExperience} />

              <div className="grid gap-5 lg:justify-items-start">
                <p className="max-w-xl text-base font-normal leading-7 text-slate-700 text-pretty">
                  I'm a full-stack engineer with hands-on experience building{' '}
                  <span className="whitespace-nowrap">large-scale</span> financial systems, where
                  scalability, reliability, and maintainability are critical.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="group min-h-11 px-3 has-data-[icon=inline-end]:pr-3 sm:px-4 sm:has-data-[icon=inline-end]:pr-4"
                    onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                  >
                    View work samples
                    <ChevronDown data-icon="inline-end" className="size-4" />
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="min-h-11 px-3 sm:px-4">
                    <a href="/resume.pdf">
                      <Download data-icon="inline-start" />
                      Download resume
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <WorkSamplesSection shouldReduceMotion={shouldReduceMotion} />

        <section
          id="capabilities"
          className="border-b border-slate-200 bg-white py-14 md:py-20"
          data-scroll-target="capabilities"
          aria-labelledby="engineering-scope-heading"
        >
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-10">
            <motion.div
              className="grid max-w-3xl gap-4"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.45, once: true }}
              transition={{ duration: 0.35, ease: easeOut }}
            >
              <h2
                id="engineering-scope-heading"
                className="max-w-xl text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl"
              >
                Systems I can design, build, and improve.
              </h2>
              <p className="max-w-2xl text-base font-normal leading-7 text-slate-700 text-pretty">
                I work across technical strategy, system design, implementation, monitoring, and
                infrastructure for software that has to stay usable, secure, maintainable, and
                reliable.
              </p>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {capabilityItems.map((item, index) => (
                <motion.article
                  key={item.title}
                  className="grid content-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.3, once: true }}
                  transition={{ delay: index * 0.04, duration: 0.34, ease: easeOut }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${item.iconTone}`}
                    >
                      <item.icon className="size-5" />
                    </span>
                    <div className="grid gap-2">
                      <h3 className="text-lg font-semibold leading-6 text-slate-950">
                        {item.title}
                      </h3>
                      <p className="text-sm font-normal leading-6 text-slate-600 text-pretty">
                        {item.body}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.signals.map((signal) => (
                      <span
                        key={signal}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>

            <TechStackCarousel shouldReduceMotion={shouldReduceMotion} />

            <motion.aside
              className="grid gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 md:grid-cols-[auto_1fr] md:items-start"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.45, once: true }}
              transition={{ delay: 0.08, duration: 0.35, ease: easeOut }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-white text-indigo-700 ring-1 ring-indigo-100">
                <Bot className="size-5" />
              </span>
              <div className="grid gap-1">
                <h3 className="text-base font-semibold text-slate-950">AI-assisted Engineering</h3>
                <p className="max-w-4xl text-sm font-normal leading-6 text-slate-700 text-pretty">
                  Claude Code, Codex, and LLM workflows help me explore implementation paths,
                  refactor safely, debug faster, document decisions, and move from unclear
                  requirements to working software.
                </p>
              </div>
            </motion.aside>
          </div>
        </section>

        <CapabilitiesSection shouldReduceMotion={shouldReduceMotion} />

        <section
          className="mx-auto w-[min(1200px,calc(100%-2rem))] py-16 md:py-20"
          data-scroll-target="experience"
        >
          <motion.div
            className="mb-14 grid max-w-3xl gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4, once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <p className="text-sm font-semibold text-slate-950">Experience</p>
            <h2 className="text-4xl font-semibold leading-tight text-slate-900 text-balance sm:text-5xl">
              Banking, fintech, and enterprise systems.
            </h2>
            <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
              Experience across internal fintech platforms, digital lending services, ERP
              customization, APIs, integrations, access control, monitoring, technical
              documentation, and performance tuning.
            </p>
          </motion.div>

          <div className="relative">
            {experiences.map((item, index) => (
              <motion.article
                key={`${item.company}-${item.role}`}
                className="relative grid gap-5 border-t border-slate-200 py-9 first:border-t-0 first:pt-0 last:pb-0 lg:grid-cols-[minmax(12rem,21rem)_minmax(0,1fr)] lg:gap-12"
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
                    <span className="w-fit text-sm font-medium text-indigo-700">Current</span>
                  ) : null}
                </div>

                <div>
                  <div className="grid gap-2">
                    <h3 className="text-2xl font-semibold leading-tight text-slate-900 text-balance">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600">{item.company}</p>
                    {'roleHistory' in item ? (
                      <div className="mt-2 grid gap-2">
                        {item.roleHistory.map((roleItem) => (
                          <div
                            key={`${item.company}-${roleItem.role}-${roleItem.period}`}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5"
                          >
                            <span className="font-medium text-slate-800">{roleItem.role}</span>
                            <span className="text-slate-500">{roleItem.period}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <ul className="mt-5 grid gap-3">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm font-normal leading-6 text-slate-600"
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

        <section className="bg-slate-50 py-16 md:py-20" data-scroll-target="about">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
            <motion.div
              className="grid gap-7"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <div className="grid gap-4">
                <p className="text-sm font-semibold text-slate-950">About me</p>
                <h2 className="max-w-xl text-4xl font-semibold leading-[1.04] text-slate-950 text-balance sm:text-5xl">
                  Pragmatic engineering for product and platform work.
                </h2>
                <p className="max-w-2xl text-base font-normal leading-7 text-slate-700 text-pretty">
                  My background is full-stack engineering in digital banking and fintech, where UI
                  quality, API design, data integrity, infrastructure, and reliability are part of
                  the same customer workflow. I approach engineering pragmatically: understand the
                  domain, clarify tradeoffs, and balance engineering quality with the speed and
                  needs of the business.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {aboutPrinciples.map((principle, index) => (
                  <motion.div
                    key={principle.title}
                    className="grid gap-2 border-t border-slate-200 pt-4"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.4, once: true }}
                    transition={{ delay: index * 0.06, duration: 0.35, ease: easeOut }}
                  >
                    <h3 className="text-base font-semibold text-slate-950">{principle.title}</h3>
                    <p className="text-sm font-normal leading-6 text-slate-700">{principle.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative min-h-[22rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-indigo-200 hover:shadow-[0_20px_55px_rgba(15,23,42,0.1)]"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98, y: 18 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              viewport={{ amount: 0.35, once: true }}
              transition={{ duration: 0.42, ease: easeOut }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_86%_78%,rgba(20,184,166,0.16),transparent_36%)]" />
              <div className="relative grid h-full min-h-[19rem] content-between rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-medium">Engineering loop</p>
                    <p className="mt-1 text-sm font-normal text-slate-400">
                      Clarify, implement, ship, observe
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-200">
                    Reliable
                  </span>
                </div>

                <div className="grid gap-3">
                  {[
                    'Clarify the workflow',
                    'Define ownership and constraints',
                    'Ship the durable implementation'
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ amount: 0.4, once: true }}
                      transition={{ delay: 0.08 + index * 0.08, duration: 0.35, ease: easeOut }}
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-normal text-slate-200">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="bg-white" data-scroll-target="contact">
          <motion.div
            className="mx-auto w-[min(1200px,calc(100%-2rem))]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.08, once: true }}
            transition={{ duration: 0.42, ease: easeOut }}
          >
            <div className="grid max-w-4xl gap-5 py-14 text-left md:py-16">
              <h2 className="max-w-3xl text-3xl font-semibold leading-[1.05] text-slate-950 text-balance sm:text-4xl lg:text-5xl">
                Need an engineer who has shipped critical systems before?
              </h2>

              <p className="max-w-2xl text-base font-normal leading-7 text-slate-700 text-pretty">
                I help teams turn business requirements into reliable software from UI to
                infrastructure, with long-term maintainability and delivery risk in mind.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 gap-2 px-4 has-data-[icon=inline-start]:pl-4"
                >
                  <a href="mailto:contact@dennydharmawan.com">
                    <Mail data-icon="inline-start" className="size-4" />
                    Let&apos;s chat
                  </a>
                </Button>
              </div>
              <p className="text-sm font-normal text-slate-500">
                Based in Jakarta, Indonesia - open to remote opportunities.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_54%_82%,rgba(14,165,233,0.18),transparent_34%)]" />
              <ThreeDMarquee
                className="relative h-[26rem] rounded-none sm:h-[32rem] lg:h-[36rem]"
                images={portfolioMarqueeImages}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent sm:w-36 lg:w-44" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent sm:w-36 lg:w-44" />
            </div>

            <div className="pb-8 pt-12">
              <div className="grid gap-10 border-t border-slate-200 pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(36rem,1.2fr)] lg:items-start lg:gap-x-16 xl:gap-x-20">
                <div className="grid content-start gap-6">
                  <div className="grid max-w-md gap-3">
                    <p className="text-2xl font-semibold leading-tight text-slate-950">
                      Denny Dharmawan
                    </p>
                    <p className="text-base font-normal leading-7 text-slate-600 text-pretty">
                      Full-stack engineer building product interfaces, backend services, data flows,
                      and infrastructure for critical systems.
                    </p>
                  </div>

                  <div className="grid gap-2.5 text-sm">
                    <p className="inline-flex min-h-8 items-center gap-2 font-normal text-slate-700">
                      <MapPin aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
                      <span>Jakarta, Indonesia</span>
                    </p>
                    <a
                      className="inline-flex min-h-10 w-fit max-w-full items-center gap-2 break-all font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
                      href="mailto:contact@dennydharmawan.com"
                      aria-label="Email contact@dennydharmawan.com"
                    >
                      <Mail aria-hidden="true" className="size-4 shrink-0 text-indigo-500" />
                      <span>contact@dennydharmawan.com</span>
                    </a>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(8rem,0.8fr)_minmax(13rem,1.2fr)_minmax(7rem,0.8fr)]">
                  <nav className="grid content-start gap-2 text-sm font-semibold text-slate-950">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Navigate
                    </p>
                    {footerNavItems.map((item) => (
                      <button
                        key={item.target}
                        type="button"
                        className="inline-flex min-h-10 w-fit items-center text-left transition-colors hover:text-indigo-600"
                        onClick={(event) => scrollToTarget(event, item.target, shouldReduceMotion)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <div className="grid content-start gap-2 text-sm font-semibold text-slate-950">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Work Samples
                    </p>
                    <ul className="grid gap-2">
                      {footerWorkSamplePlaceholders.map((item) => (
                        <li
                          key={item}
                          className="flex min-h-10 w-fit max-w-full items-center text-left text-slate-950"
                        >
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <nav className="grid content-start gap-2 text-sm font-semibold text-slate-950">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Profiles
                    </p>
                    {footerProfileLinks.map((item) => (
                      <a
                        key={item.href}
                        className="group inline-flex min-h-10 w-fit items-center gap-2 transition-colors hover:text-indigo-600"
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        <span>{item.label}</span>
                        <FooterLinkArrow />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-5 text-sm font-normal text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>© 2026 Denny Dharmawan. All rights reserved.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <p>Thank you for looking around.</p>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="group/back min-h-10 gap-2 rounded-lg border-slate-200 bg-white px-3 text-slate-950 shadow-none transition-colors hover:border-indigo-200 hover:bg-slate-50 hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
                    >
                      <span
                        aria-hidden="true"
                        className="relative inline-flex size-6 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-300 group-hover/back:border-indigo-600"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 scale-0 rounded-full bg-indigo-600 transition-transform duration-300 ease-out group-hover/back:scale-100"
                        />
                        <ChevronUp className="relative z-10 size-3.5 transition-colors duration-300 group-hover/back:text-white" />
                      </span>
                      <span>Back to top</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
}
