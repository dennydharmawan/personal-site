import { createElement, type ComponentType } from 'react';

import { HeroSection, type HeroVariant } from '@/components/portfolio-home';

const hero = (variant: HeroVariant) => () => createElement(HeroSection, { variant });

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
    variants: [
      { Component: hero('current'), id: 'current', label: 'Current' },
      { Component: hero('dots'), id: 'dots', label: 'Dots' },
      { Component: hero('sweep'), id: 'sweep', label: 'Sweep' },
      { Component: hero('both'), id: 'both', label: 'Both' }
    ]
  }
];
