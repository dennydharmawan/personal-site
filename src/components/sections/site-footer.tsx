import { ArrowUpRight, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { LuGithub, LuLinkedin } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { pageShellClassName, scrollToTargetName } from '@/components/sections/shared';
import { EmailActionMenu } from '@/components/sections/site-header';
import { DeskScenery } from '@/components/desk-scenery';

const footerPillClassName =
  'h-11 gap-2 rounded-full border-zinc-900/10 bg-white px-4 text-zinc-900 shadow-none transition-colors hover:border-zinc-900/20 hover:bg-white hover:text-zinc-900';

const footerSocialLinks = [
  {
    href: 'https://www.linkedin.com/in/ddharmawan',
    icon: LuLinkedin,
    label: 'LinkedIn'
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
            className="group inline-flex min-h-11 w-fit items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900 rounded-sm"
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

function FooterStatus() {
  return (
    <p className="flex items-center gap-2.5 font-medium text-zinc-700">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-500" />
      Open to fintech roles · Jakarta, UTC+7
    </p>
  );
}

function FooterContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 border-b border-zinc-900/10 py-3 sm:min-h-16 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center sm:gap-4 sm:py-2.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function FooterBottomBar() {
  const shouldReduceMotion = useReducedMotion();

  const backToTop = () => {
    scrollToTargetName('top', shouldReduceMotion);

    const pageTop = document.querySelector<HTMLElement>('[data-scroll-target="top"]');

    if (pageTop) {
      // <main> is not focusable on its own, so without this the next Tab resumes from the footer.
      pageTop.tabIndex = -1;
      pageTop.focus({ preventScroll: true });
    }
  };

  return (
    <div className="border-t border-zinc-900/6">
      <div
        className={`${pageShellClassName} flex flex-col gap-4 py-6 text-sm font-normal sm:flex-row sm:items-center sm:justify-between text-zinc-600`}
      >
        <p>© 2026 Denny Dharmawan. All rights reserved.</p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={`w-fit ${footerPillClassName}`}
          onClick={backToTop}
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
      className="relative isolate overflow-hidden border-t border-zinc-900/6 bg-zinc-50"
    >
      <div
        className={`${pageShellClassName} grid gap-14 pt-16 pb-16 md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-16 lg:pt-24 lg:pb-20`}
      >
        <div className="flex flex-col gap-10 lg:justify-between">
          <div className="grid gap-6">
            <h2 className="max-w-3xl font-heading text-4xl font-normal leading-[1.02] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
              Let&apos;s build something
              <span className="block text-zinc-500">that stays up.</span>
            </h2>
            <p className="max-w-md text-base font-normal leading-7 text-zinc-600 text-pretty">
              I take on full-stack and platform work in banking and fintech, anywhere access control,
              audit trails, and uptime matter.
            </p>
          </div>
          <dl className="grid border-t border-zinc-900/10 text-sm">
            <FooterContactRow label="Email">
              <EmailActionMenu />
            </FooterContactRow>
            <FooterContactRow label="Elsewhere">
              <FooterSocials />
            </FooterContactRow>
            <FooterContactRow label="Status">
              <FooterStatus />
            </FooterContactRow>
          </dl>
        </div>
        <figure className="grid w-full max-w-md content-start gap-3 lg:max-w-none">
          <DeskScenery />
          <figcaption className="text-sm leading-6 text-zinc-600">
            One day at my desk in Jakarta, drawn in code.
          </figcaption>
        </figure>
      </div>
      <FooterBottomBar />
    </footer>
  );
}
