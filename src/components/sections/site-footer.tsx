import { ArrowUpRight, ChevronUp } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { LuGithub, LuInstagram, LuLinkedin } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import {
  detailStackGapClassName,
  pageShellClassName,
  scrollToTarget,
  sectionPaddingTopClassName
} from '@/components/sections/shared';
import { EmailActionMenu } from '@/components/sections/site-header';

const footerSocialLinks = [
  {
    href: 'https://www.linkedin.com/in/ddharmawan',
    icon: LuLinkedin,
    label: 'LinkedIn'
  },
  {
    href: 'https://www.instagram.com/naiklevel.dev/',
    icon: LuInstagram,
    label: 'Instagram'
  },
  {
    href: 'https://github.com/dennydharmawan',
    icon: LuGithub,
    label: 'GitHub'
  }
];

function FooterSocials({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-1 text-sm font-medium ${className ?? ''}`}>
      {footerSocialLinks.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            className="group inline-flex min-h-11 w-fit items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={item.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon aria-hidden="true" className="size-4 text-zinc-400 transition-colors group-hover:text-sky-500" />
            <span>{item.label}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}

function FooterBottomBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="border-t border-zinc-900/6">
      <div
        className={`${pageShellClassName} flex flex-col gap-4 py-6 text-sm font-normal sm:flex-row sm:items-center sm:justify-between text-zinc-600`}
      >
        <p>© 2026 Denny Dharmawan. All rights reserved.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 w-fit gap-2 rounded-full px-4 shadow-none transition-colors border-zinc-900/10 bg-white text-zinc-900 hover:border-zinc-900/20 hover:bg-white hover:text-zinc-900"
          onClick={(event) => scrollToTarget(event, 'top', shouldReduceMotion)}
        >
          <ChevronUp aria-hidden="true" className="size-3.5" />
          <span>Back to top</span>
        </Button>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer
      data-scroll-target="contact"
      className="relative isolate overflow-hidden border-t border-zinc-900/6 bg-zinc-50"
    >
      <div
        className={`${pageShellClassName} grid gap-12 pb-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end lg:gap-16 ${sectionPaddingTopClassName}`}
      >
        <div className={`grid justify-items-start ${detailStackGapClassName}`}>
          <h2 className="max-w-3xl font-heading text-4xl font-normal leading-[1.02] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
            Let&apos;s build something
            <span className="block text-zinc-500">that stays up.</span>
          </h2>
          <EmailActionMenu />
        </div>
        <div className="grid gap-6 border-t border-zinc-900/10 pt-6">
          <p className="max-w-md text-base font-normal leading-7 text-zinc-600 text-pretty">
            Frontend, backend, and platform work for systems that have to stay operable in
            production. Working from Jakarta with teams across time zones.
          </p>
          <FooterSocials className="flex-col !items-start gap-y-0" />
        </div>
      </div>
      <FooterBottomBar />
    </footer>
  );
}
