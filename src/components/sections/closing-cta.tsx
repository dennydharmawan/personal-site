import { DepartureBoard } from '@/components/departure-board';
import { contactEmail, pageShellClassName, sectionPaddingBottomClassName } from '@/components/sections/shared';

export function ClosingCtaSection() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className={`bg-white ${sectionPaddingBottomClassName}`}
      data-scroll-target="contact"
    >
      <div className={pageShellClassName}>
        <h2 id="closing-cta-heading" className="sr-only">
          Hiring a senior engineer for fintech?
        </h2>
        <DepartureBoard email={contactEmail} />
      </div>
    </section>
  );
}
