import type { ComponentType } from 'react';

import {
  AboutSection,
  SiteFooter
} from '@/components/portfolio-home';
import { ExperienceSection } from '@/components/sections/experience';
import { CapabilitiesSection } from '@/components/sections/expertise';
import { HeroSection } from '@/components/sections/hero';
import { WorkSamplesSection } from '@/components/sections/work-samples';

export type LabVariant = {
  Component: ComponentType;
  id: string;
  label: string;
};

export type LabSection = {
  section: string;
  variants: LabVariant[];
};

export const labSections: LabSection[] = [
  { section: 'hero', variants: [{ Component: HeroSection, id: 'current', label: 'Current' }] },
  { section: 'work', variants: [{ Component: WorkSamplesSection, id: 'current', label: 'Current' }] },
  {
    section: 'experience',
    variants: [{ Component: ExperienceSection, id: 'current', label: 'Current' }]
  },
  {
    section: 'expertise',
    variants: [{ Component: CapabilitiesSection, id: 'current', label: 'Current' }]
  },
  { section: 'about', variants: [{ Component: AboutSection, id: 'current', label: 'Current' }] },
  { section: 'footer', variants: [{ Component: SiteFooter, id: 'current', label: 'Current' }] }
];
