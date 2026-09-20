import { ArrowUpRight, ChevronUp, Download } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { LuGithub, LuLinkedin } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import {
  detailStackGapClassName,
  pageShellClassName,
  scrollToTargetName
} from '@/components/sections/shared';
import { EmailActionMenu } from '@/components/sections/site-header';

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

function FooterStatus() {
  return (
    <p className="flex items-center gap-2.5 text-sm font-medium text-zinc-600">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-500" />
      Jakarta · UTC+7 · open to fintech roles
    </p>
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
      data-scroll-target="contact"
      className="relative isolate overflow-hidden border-t border-zinc-900/6 bg-zinc-50"
    >
      <div
        className={`${pageShellClassName} grid gap-10 pt-16 pb-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-start md:pt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16 lg:pt-24`}
      >
        <div className={`grid justify-items-start ${detailStackGapClassName}`}>
          <h2 className="max-w-3xl font-heading text-4xl font-normal leading-[1.02] tracking-tight text-zinc-900 sm:text-5xl lg:text-7xl">
            Let&apos;s build something
            <span className="block text-zinc-500">that stays up.</span>
          </h2>
          <div className="grid justify-items-start gap-4">
            <FooterStatus />
            <div className="flex flex-wrap items-center gap-3">
              <EmailActionMenu />
              <Button asChild variant="outline" size="lg" className={footerPillClassName}>
                <a href="/resume.pdf" rel="noopener" target="_blank">
                  <Download aria-hidden="true" className="size-4" />
                  Download resume
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-6 border-t border-zinc-900/10 pt-6">
          <p className="max-w-md text-base font-normal leading-7 text-zinc-600 text-pretty">
            I take on full-stack and platform work in banking and fintech, anywhere access control,
            audit trails, and uptime matter. Based in Jakarta.
          </p>
          <FooterSocials className="flex-col !items-start gap-y-0" />
        </div>
      </div>
      <FooterBottomBar />
    </footer>
  );
}
