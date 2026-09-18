import type { ComponentType } from 'react';

import { HeroSection } from '@/components/portfolio-home';

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
  {
    section: 'hero',
    variants: [{ Component: HeroSection, id: 'current', label: 'Current' }]
  }
];
