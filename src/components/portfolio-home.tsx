import { AboutSection } from '@/components/sections/about';
import { ExperienceSection } from '@/components/sections/experience';
import { CapabilitiesSection } from '@/components/sections/expertise';
import { HeroSection } from '@/components/sections/hero';
import { SiteFooter } from '@/components/sections/site-footer';
import { SiteHeader, usePreventHashNavigation } from '@/components/sections/site-header';
import { WorkSamplesSection } from '@/components/sections/work-samples';

export default function PortfolioHome() {
  usePreventHashNavigation();

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-zinc-900">
      <SiteHeader />

      <main data-scroll-target="top">
        <HeroSection />

        <WorkSamplesSection />

        <ExperienceSection />

        <CapabilitiesSection />

        <AboutSection />

        <SiteFooter />
      </main>
    </div>
  );
}
