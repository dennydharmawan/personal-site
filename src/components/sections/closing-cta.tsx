import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { DepartureBoard } from '@/components/departure-board';
import { contactEmail, pageShellClassName, sectionPaddingBottomClassName } from '@/components/sections/shared';

const linkClassName =
  'inline-flex min-h-11 items-center gap-1.5 text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-500';

function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = () => {
    navigator.clipboard?.writeText(contactEmail).then(() => {
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-900"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5 text-emerald-600" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export function ClosingCtaSection() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className={`bg-white ${sectionPaddingBottomClassName}`}
      data-scroll-target="contact"
    >
      <div className={pageShellClassName}>
        <h2 id="closing-cta-heading" className="sr-only">
          Turn your growth ideas into reality today
        </h2>
        <DepartureBoard email={contactEmail} />
        <div className="mt-5 flex flex-wrap items-center gap-x-6 text-sm">
          <span className="inline-flex items-center gap-3">
            <a className={linkClassName} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <CopyEmailButton />
          </span>
          <a
            className={linkClassName}
            href="https://www.linkedin.com/in/ddharmawan"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
