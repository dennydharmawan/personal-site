import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronUp,
  Code2,
  Database,
  Download,
  ExternalLink,
  Gauge,
  Rocket,
  ServerCog,
  ShieldCheck,
  Waypoints
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FaLinkedinIn } from 'react-icons/fa';
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
    body: 'Shape operational data across SQL, NoSQL, caching, reporting, and service handoffs.',
    icon: Database,
    iconTone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    signals: ['SQL / NoSQL', 'Redis', 'Reporting data'],
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
    body: 'Improve monitoring, logs, traces, error triage, rollouts, and performance visibility.',
    icon: Gauge,
    iconTone: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    signals: ['Datadog', 'Debugging', 'Performance'],
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
    body: 'Improve observability, access control, release workflows, and CI/CD so teams can ship changes with less risk.',
    icon: Rocket,
    items: ['Monitoring', 'RBAC', 'Rollouts', 'CI/CD'],
    title: 'Reliability and delivery'
  }
];

const projects = [
  {
    bullets: [
      'Models approval status, ownership, and next action in a clear review queue',
      'Makes role-aware decisions visible before users take sensitive operational actions',
      'Keeps reviewer history and decision context traceable without exposing private data'
    ],
    icon: BriefcaseBusiness,
    impact:
      'Shows how operational rules become clear statuses, API behavior, and traceable data history.',
    preview: '/portfolio-previews/approval-workflow.png',
    role: 'Product flow and full-stack implementation',
    stack: ['React', 'Node.js', 'TypeScript', 'MySQL'],
    summary:
      'A representative approval system for reviewing operational records, exposing status, and keeping decisions traceable.',
    title: 'Approval Workflow System'
  },
  {
    bullets: [
      'Combines assignments, follow-ups, and reporting in one internal workspace',
      'Separates role-specific actions while keeping the workflow readable across teams',
      'Uses status, ownership, and overdue-work signals to reduce ambiguity in daily operations'
    ],
    icon: Gauge,
    impact: 'Shows how daily internal tools can stay readable across roles, status, and ownership.',
    preview: '/portfolio-previews/operations-platform.png',
    role: 'Internal tooling and systems design',
    stack: ['Next.js', 'Express', 'Sequelize', 'Redis'],
    summary:
      'A representative internal platform for assignments, follow-ups, reporting, and team visibility.',
    title: 'Operations Platform'
  },
  {
    bullets: [
      'Brings roles, access requests, protected areas, and history into one review flow',
      'Separates permission decisions from implementation details so reviews stay readable',
      'Keeps access changes traceable for audits, support, and safer maintenance'
    ],
    icon: ShieldCheck,
    impact: 'Connects access-control workflows with maintainable implementation patterns.',
    preview: '/portfolio-previews/access-management.png',
    role: 'Access control and full-stack implementation',
    stack: ['Next.js', 'SSO', 'RBAC', 'Redis'],
    summary:
      'A representative access-control system for roles, requests, protected areas, and audit history.',
    title: 'Access Management System'
  }
];

const experiences = [
  {
    bullets: [
      'Maintain and improve internal platforms used by business and operations teams, with focus on reliability, maintainability, and performance.',
      'Drive engineering quality through RFCs, technical documentation, reusable implementation patterns, and cross-functional delivery.',
      'Own platform improvements across frontend, backend, service integrations, observability, and release support.',
      'Strengthen operational control surfaces including RBAC, access review, audit trails, approval flows, and safer internal tooling.'
    ],
    company: 'Krom Bank',
    current: true,
    period: 'May 2026 - Present',
    role: 'Senior Full-Stack Engineer'
  },
  {
    bullets: [
      'Built and maintained full-stack internal fintech platforms using React, Next.js, Node.js, Express, TypeScript, MySQL, Sequelize, Redis, and Mantine UI.',
      'Owned end-to-end delivery of internal operations tools across data modeling, workflow UI, API integration, monitoring, and release support.',
      'Reduced average API execution time by 37% through legacy module refactoring, code structure improvements, and targeted caching.',
      'Designed access-management workflows covering RBAC, access review, audit trails, and operational approval flows.',
      'Built shared internal libraries for audit logging, feature-flag management, and common implementation utilities.',
      'Improved production reliability through monitoring dashboards, distributed tracing, CI/CD improvements, and infrastructure migration support.'
    ],
    company: 'Krom Bank',
    period: 'Jan 2023 - May 2026',
    role: 'Full-Stack Engineer'
  },
  {
    bullets: [
      'Built and maintained backend services for Jenius and Flexi Cash using Node.js, Express.js, GraphQL, MongoDB, Redis, and Kafka.',
      'Served on the backend team during Flexi Cash growth from launch to a 147% increase in user base over three years.',
      'Developed APIs, data flows, and service integrations for loan origination, funding disbursement, and partner distribution workflows.',
      'Built external retail partner integration flows to expand Flexi Cash digital lending distribution.',
      'Improved backend maintainability through service refactoring, integration reliability improvements, and cleaner error handling.'
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

const aboutPrinciples = [
  {
    body: 'I prefer work where requirements, product behavior, data shape, and operating constraints are clear before the implementation gets complex.',
    title: 'Clarify before building'
  },
  {
    body: 'I look for the path that keeps the workflow understandable for users and maintainable for the engineers who will own it later.',
    title: 'Build for ownership'
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

function HeroDownArrow() {
  return (
    <svg
      aria-hidden="true"
      className="-mr-0.5 h-4 w-5 shrink-0 overflow-visible text-current"
      data-icon="inline-end"
      fill="none"
      viewBox="0 0 20 16"
    >
      <line
        className="origin-[10px_3px] scale-y-0 opacity-0 transition-[scale,opacity] duration-300 ease-out group-hover:scale-y-100 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-y-0 motion-reduce:group-hover:opacity-0"
        x1="10"
        x2="10"
        y1="3"
        y2="13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        className="transition-transform duration-300 ease-out group-hover:translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        d="M6 4L10 8L14 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function HeroTrustStrip() {
  const trustedTeams = [
    {
      logo: '/company-logos/bank-btpn.svg',
      logoClassName: 'h-10 max-w-[8rem]',
      logoStyleClassName: 'opacity-[0.58] brightness-0',
      name: 'Bank BTPN'
    },
    {
      logo: '/company-logos/krom-bank.svg',
      logoClassName: 'h-9 max-w-[9.75rem]',
      logoStyleClassName: 'opacity-[0.74] grayscale',
      name: 'Krom Bank'
    }
  ];

  return (
    <div aria-label="Company experience snapshot" className="grid max-w-xl gap-3.5 pt-3">
      <p className="text-sm font-semibold leading-5 text-slate-600">
        Trusted by teams at Indonesia&apos;s leading digital banks
      </p>
      <div className="flex flex-wrap items-center gap-x-9 gap-y-4">
        {trustedTeams.map((team) => (
          <span key={team.name} className="inline-flex h-11 min-w-28 items-center justify-start">
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

function MiniOperationsMockup() {
  return (
    <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[4.8rem_1fr]">
      <div className="hidden bg-slate-950 p-2.5 text-white sm:block">
        <div className="mb-3 flex items-center gap-2 text-[0.6rem] font-semibold text-slate-200">
          <span className="size-2 rounded-full bg-indigo-400" />
          ops
        </div>
        {['Queue', 'Access', 'Reports'].map((item, index) => (
          <div
            key={item}
            className={`mb-1.5 rounded-md px-2 py-1 text-[0.56rem] ${
              index === 0 ? 'bg-white/12 text-white' : 'text-slate-400'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="p-2.5">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-950">Review queue</p>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.58rem] font-medium text-emerald-700">
            Healthy
          </span>
        </div>
        <div className="mb-2.5 grid grid-cols-3 gap-1.5">
          {[
            ['128', 'Open'],
            ['94%', 'SLA'],
            ['12', 'Risks']
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
              <p className="text-sm font-semibold leading-none text-slate-950">{value}</p>
              <p className="mt-1 text-[0.56rem] font-normal text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-1">
          {[
            ['Access review', 'Approved'],
            ['Lending queue', 'Pending']
          ].map(([name, status]) => (
            <div
              key={name}
              className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-slate-100 px-2 py-1 text-[0.58rem]"
            >
              <span className="font-medium text-slate-600">{name}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${
                  status === 'Pending'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSystemCard({
  body,
  children,
  className,
  icon: Icon,
  iconClassName,
  shouldReduceMotion,
  title
}: {
  body: string;
  children?: React.ReactNode;
  className: string;
  icon: typeof BriefcaseBusiness;
  iconClassName: string;
  shouldReduceMotion: boolean | null;
  title: string;
}) {
  return (
    <motion.div
      className={`relative z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-indigo-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] ${className}`}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={spring}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="size-5" />
        </span>
        <span className="grid gap-1">
          <span className="text-base font-semibold leading-5 text-slate-950">{title}</span>
          <span className="text-sm font-normal leading-5 text-slate-600">{body}</span>
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function HeroCapabilityCard({
  body,
  className,
  icon: Icon,
  iconTileClassName,
  shouldReduceMotion,
  title
}: {
  body: string;
  className?: string;
  icon: typeof BriefcaseBusiness;
  iconTileClassName: string;
  shouldReduceMotion: boolean | null;
  title: string;
}) {
  return (
    <motion.div
      className={`relative z-10 grid min-h-[10.75rem] content-start gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-indigo-200 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] ${className ?? ''}`}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={spring}
    >
      <span
        className={`relative flex size-14 items-center justify-center overflow-hidden rounded-2xl text-white ${iconTileClassName}`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),transparent_42%)]" />
        <Icon className="relative size-7 drop-shadow-sm" strokeWidth={2.3} />
      </span>
      <span className="grid gap-2">
        <span className="text-xl font-semibold leading-6 text-slate-950">{title}</span>
        <span className="text-sm font-normal leading-5 text-slate-600">{body}</span>
      </span>
    </motion.div>
  );
}

function HeroSystemVisual({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      initial={shouldReduceMotion ? false : { filter: 'blur(4px)', opacity: 0, y: 16 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.48, ease: easeOut }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_48%_35%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_64%_58%,rgba(16,185,129,0.09),transparent_27%)]"
      />

      <div className="relative grid gap-4">
        <HeroSystemCard
          body="Interfaces users rely on"
          className=""
          icon={BriefcaseBusiness}
          iconClassName="bg-sky-100 text-sky-700"
          shouldReduceMotion={shouldReduceMotion}
          title="Product UI"
        >
          <div className="mt-4" />
          <MiniOperationsMockup />
        </HeroSystemCard>

        <div className="relative hidden h-9 items-center justify-center sm:flex">
          <span className="absolute left-10 right-10 top-1/2 border-t border-dashed border-indigo-200" />
          <motion.span
            aria-hidden="true"
            className="absolute left-10 top-1/2 size-2 -translate-y-1/2 rounded-full bg-indigo-500 shadow-[0_0_0_6px_rgba(99,102,241,0.12)]"
            animate={
              shouldReduceMotion
                ? undefined
                : { left: ['2.5rem', 'calc(100% - 2.75rem)', '2.5rem'] }
            }
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          />
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck className="size-6" />
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <HeroCapabilityCard
            body="Logic and integrations"
            icon={Code2}
            iconTileClassName="bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600"
            shouldReduceMotion={shouldReduceMotion}
            title="API services"
          />

          <HeroCapabilityCard
            body="Consistent data shape"
            icon={Database}
            iconTileClassName="bg-gradient-to-br from-orange-500 via-pink-500 to-fuchsia-600"
            shouldReduceMotion={shouldReduceMotion}
            title="Data model"
          />

          <HeroCapabilityCard
            body="Logs, metrics, alerts"
            icon={Gauge}
            iconTileClassName="bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600"
            shouldReduceMotion={shouldReduceMotion}
            title="Monitoring"
          />
        </div>
      </div>
    </motion.div>
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
                  href="https://www.linkedin.com/in/ddharmawan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on LinkedIn"
                >
                  <FaLinkedinIn data-icon="inline-start" className="size-3.5" />
                  Chat on LinkedIn
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

export default function PortfolioHome() {
  const shouldReduceMotion = useReducedMotion();
  const yearsExperience = getYearsExperience();

  usePreventHashNavigation();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AnimatedHeader />

      <main data-scroll-target="top">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 pb-10 pt-20 md:pt-28 lg:gap-9 lg:pb-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <motion.div
                className="grid gap-5 sm:gap-6"
                initial={initialValue(shouldReduceMotion, {
                  filter: 'blur(3px)',
                  opacity: 0,
                  y: 12
                })}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
              >
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                      {yearsExperience}+ years building fintech and digital banking systems
                    </p>
                  </div>
                  <h1 className="max-w-3xl text-4xl font-normal leading-[1.04] text-slate-950 text-balance sm:text-5xl sm:leading-[1.02] lg:text-[3.5rem]">
                    Building <span className="font-semibold">reliable web solutions</span> for
                    complex business operations.
                  </h1>
                </div>
                <p className="max-w-xl text-base font-normal leading-6 text-slate-700 text-pretty sm:leading-7 lg:text-lg">
                  My work spans product UI, backend services, and infrastructure, turning complex
                  business requirements into software that engineering teams can own, scale, and
                  trust.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="group min-h-11 px-3 has-data-[icon=inline-end]:pr-3 sm:px-4 sm:has-data-[icon=inline-end]:pr-4"
                    onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                  >
                    View work samples <HeroDownArrow />
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="min-h-11 px-3 sm:px-4">
                    <a href="/resume.pdf">
                      <Download data-icon="inline-start" />
                      Download resume
                    </a>
                  </Button>
                </div>
                <HeroTrustStrip />
              </motion.div>

              <HeroSystemVisual shouldReduceMotion={shouldReduceMotion} />
            </div>
          </div>
        </section>

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
                I work across system design, implementation, monitoring, and infrastructure for
                software that has to stay usable, maintainable, and reliable.
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

        <section className="bg-slate-50 py-16 md:py-24" data-scroll-target="work">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
            <motion.div
              className="mb-14 grid max-w-3xl gap-4"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.4, once: true }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <p className="text-sm font-semibold text-slate-950">Work samples</p>
              <h2 className="text-4xl font-semibold leading-tight text-slate-900 text-balance sm:text-5xl">
                Selected systems.
              </h2>
              <p className="max-w-2xl text-base font-normal leading-7 text-slate-600 text-pretty">
                These samples show the type of systems I build without exposing proprietary details.
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
                    <div className="flex size-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shadow-lg shadow-indigo-100">
                      <project.icon className="size-5" />
                    </div>
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
                    <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-indigo-950/90 p-4 text-white shadow-2xl shadow-indigo-950/30 backdrop-blur">
                      <p className="text-xs font-medium text-indigo-200">Representative sample</p>
                      <p className="mt-2 text-sm font-normal leading-6 text-indigo-50">
                        {project.impact}
                      </p>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>
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
              customization, APIs, integrations, access control, monitoring, and documentation.
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
                    <span className="w-fit text-sm font-medium text-indigo-700">Current</span>
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
                    <h3 className="text-2xl font-semibold leading-tight text-slate-900 text-balance">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600">{item.company}</p>
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
                  How I approach product and platform engineering.
                </h2>
                <p className="max-w-2xl text-base font-normal leading-7 text-slate-700 text-pretty">
                  I work best on problems where product behavior, backend rules, infrastructure
                  constraints, and reliability all matter. My default mode is to clarify the
                  workflow and ownership first, then make the implementation durable.
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
                I help teams build and improve software from UI to infrastructure, with long-term
                reliability and maintainability in mind.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 gap-2 px-4 has-data-[icon=inline-start]:pl-4"
                >
                  <a
                    href="https://www.linkedin.com/in/ddharmawan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedinIn data-icon="inline-start" className="size-4" />
                    Chat on LinkedIn
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

            <div className="pb-8 pt-14">
              <div className="grid gap-10 border-t border-slate-200 pt-10 lg:grid-cols-12 lg:items-start lg:gap-x-14">
                <div className="grid content-start gap-6 sm:max-w-md lg:col-span-4">
                  <div className="grid max-w-sm gap-2">
                    <p className="text-2xl font-semibold leading-tight text-slate-950">
                      Denny Dharmawan
                    </p>
                    <p className="text-sm font-normal leading-6 text-slate-600 text-pretty">
                      Experienced engineer working across product UI, backend services, data flows,
                      and infrastructure for critical systems.
                    </p>
                  </div>

                  <div className="grid gap-5 text-sm md:pt-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Location
                      </p>
                      <p className="mt-2 font-normal text-slate-600">Jakarta, Indonesia</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Email
                      </p>
                      <a
                        className="group mt-2 inline-flex w-fit max-w-full items-center gap-1.5 break-all text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-indigo-600"
                        href="mailto:contact@dennydharmawan.com"
                      >
                        <span>contact@dennydharmawan.com</span>
                        <ExternalLink
                          aria-hidden="true"
                          className="size-3.5 text-slate-400 transition-colors group-hover:text-indigo-600"
                        />
                      </a>
                    </div>
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="group/back min-h-9 gap-2 rounded-lg border-slate-200 bg-white px-3 text-slate-950 shadow-none transition-colors hover:border-indigo-200 hover:bg-slate-50 hover:text-indigo-600"
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

                <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-[minmax(8rem,1fr)_minmax(13rem,1.25fr)_minmax(7rem,0.85fr)] lg:gap-x-12 xl:gap-x-16">
                  <nav className="grid content-start gap-4 text-sm font-semibold text-slate-950">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Site Map
                    </p>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                    >
                      Work Samples
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'experience', shouldReduceMotion)}
                    >
                      Experience
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'about', shouldReduceMotion)}
                    >
                      About
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'contact', shouldReduceMotion)}
                    >
                      Contact
                    </button>
                  </nav>

                  <nav className="grid content-start gap-4 text-sm font-semibold text-slate-950">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Work Samples
                    </p>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                    >
                      Access Management
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                    >
                      Operations Workflow
                    </button>
                    <button
                      type="button"
                      className="w-fit transition-colors hover:text-indigo-600"
                      onClick={(event) => scrollToTarget(event, 'work', shouldReduceMotion)}
                    >
                      Reliability Dashboard
                    </button>
                  </nav>

                  <nav className="grid content-start gap-4 text-sm font-semibold text-slate-950">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Links
                    </p>
                    <a
                      className="group inline-flex w-fit items-center gap-2 transition-colors hover:text-indigo-600"
                      href="https://github.com/dennydharmawan"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>GitHub</span>
                      <FooterLinkArrow />
                    </a>
                    <a
                      className="group inline-flex w-fit items-center gap-2 transition-colors hover:text-indigo-600"
                      href="https://www.linkedin.com/in/ddharmawan"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>LinkedIn</span>
                      <FooterLinkArrow />
                    </a>
                    <a
                      className="group inline-flex w-fit items-center gap-2 transition-colors hover:text-indigo-600"
                      href="/resume.pdf"
                    >
                      <span>Resume</span>
                      <FooterLinkArrow />
                    </a>
                  </nav>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm font-normal text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>Thank you for looking around.</p>
                <p>© 2026 Denny Dharmawan. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
}
