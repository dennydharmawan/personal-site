import { createElement, type ComponentType } from 'react';

import { IncidentBand, MapBand, TraceBand } from '@/components/lab/hero-bands';
import { HeroSection, type HeroVariant } from '@/components/portfolio-home';

const hero = (variant: HeroVariant) => () => createElement(HeroSection, { variant });
const heroBand = (band: ComponentType<{ dots?: boolean }>, dots = false) => () =>
  createElement(HeroSection, { band: createElement(band, { dots }), variant: 'sweep' });

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
      { Component: hero('both'), id: 'both', label: 'Both' },
      { Component: heroBand(TraceBand), id: 'trace', label: 'Band: trace' },
      { Component: heroBand(TraceBand, true), id: 'trace-dots', label: 'Band: trace + dots' },
      { Component: heroBand(MapBand), id: 'map', label: 'Band: map' },
      { Component: heroBand(IncidentBand), id: 'incident', label: 'Band: incident' }
    ]
  }
];
