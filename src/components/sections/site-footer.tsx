import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, ChevronUp, Mail } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { contactEmail, pageShellClassName, scrollToTargetName } from '@/components/sections/shared';
import { DeskScenery } from '@/components/desk-scenery';
import { profileLinks } from '@/components/portfolio-home-data';

const footerPillClassName =
  'h-11 gap-2 rounded-full border-zinc-900/15 bg-white/60 px-4 text-zinc-900 shadow-none hover:border-zinc-900/25 hover:bg-white hover:text-zinc-900';

// Ordered by what a recruiter reaching the end of the page most likely wants next.
const footerTakeaways = [
  {
    href: `mailto:${contactEmail}`,
    label: 'Email',
    meta: contactEmail,
    icon: Mail
  },
  {
    href: '/resume.pdf',
    label: 'Resume',
    meta: 'PDF, 71 KB',
    icon: ArrowDown,
    download: 'Denny_Dharmawan_Resume.pdf'
  },
  {
    href: profileLinks.linkedIn,
    label: 'LinkedIn',
    meta: 'in/ddharmawan',
    icon: ArrowUpRight,
    external: true
  }
];

function FooterTakeaways() {
  return (
    <ul className="border-t border-zinc-900/15">
      {footerTakeaways.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.href} className="border-b border-zinc-900/15">
            <a
              className="group flex min-h-16 items-center justify-between gap-6 py-4 sm:min-h-20"
              href={item.href}
              download={item.download}
              {...(item.external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
            >
              <span className="font-heading text-3xl font-normal tracking-tight text-zinc-900 transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none sm:text-4xl">
                {item.label}
              </span>{' '}
              <span className="flex items-center gap-4 text-sm text-zinc-600">
                <span className="hidden sm:inline">{item.meta}</span>
                <span className="grid size-11 place-items-center rounded-full bg-white/60 text-zinc-900 ring-1 ring-zinc-900/15 transition-colors duration-150 group-hover:bg-zinc-900 group-hover:text-white">
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const jakartaTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });

// Set after mount so the server-rendered HTML never carries a stale build-time clock.
function JakartaClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(jakartaTime.format(new Date()));

    tick();
    const interval = window.setInterval(tick, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span>
      Jakarta{time ? <> · <time className="tabular-nums">{time}</time></> : null} GMT+7
    </span>
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
    <div className="border-t border-zinc-900/10">
      <div
        className={`${pageShellClassName} flex flex-col gap-4 py-6 text-sm font-normal sm:flex-row sm:items-center sm:justify-between text-zinc-600`}
      >
        <p>© 2026 Denny Dharmawan. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <JakartaClock />
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
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer
      // The footer sits on the paper the desk scene is printed on (film/paper.mjs), so the two read as one sheet.
      className="relative isolate overflow-hidden border-t border-zinc-900/10 bg-orange-50 bg-[url(/film/desk-paper.webp)] bg-cover bg-center"
    >
      <div
        className={`${pageShellClassName} grid gap-14 pt-16 pb-16 md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-16 lg:pt-24 lg:pb-20`}
      >
        <div className="flex flex-col gap-12 lg:justify-between">
          <h2 className="max-w-3xl font-heading text-4xl font-normal leading-[1.04] tracking-tight text-balance text-zinc-900 sm:text-5xl lg:text-6xl">
            Thanks for stopping by.{' '}
            <span className="block text-zinc-500">Let’s make something cool together.</span>
          </h2>
          <FooterTakeaways />
        </div>
        <div className="w-full max-w-md lg:max-w-none">
          <DeskScenery />
        </div>
      </div>
      <FooterBottomBar />
    </footer>
  );
}
