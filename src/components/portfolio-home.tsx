import type { MouseEvent } from 'react';
import { AboutSection } from '@/components/sections/about';
import { ExperienceSection } from '@/components/sections/experience';
import { CapabilitiesSection } from '@/components/sections/expertise';
import { HeroSection } from '@/components/sections/hero';
import { SiteFooter } from '@/components/sections/site-footer';
import { SiteHeader, usePreventHashNavigation } from '@/components/sections/site-header';
import { WorkSamplesSection } from '@/components/sections/work-samples';

// usePreventHashNavigation turns any #hash into a jump to the top, so the skip link moves focus itself.
function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById('content')?.focus();
}

export default function PortfolioHome() {
  usePreventHashNavigation();

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-zinc-900">
      <a
        href="#content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow-md"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" tabIndex={-1} data-scroll-target="top">
        <HeroSection />

        <WorkSamplesSection />

        <ExperienceSection />

        <CapabilitiesSection />

        <AboutSection />
      </main>

      <SiteFooter />
    </div>
  );
}
