import { createElement, type ComponentType } from 'react';

import { HeroSection, SiteFooter } from '@/components/portfolio-home';

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
  },
  {
    section: 'footer',
    variants: [
      { Component: () => createElement(SiteFooter, { variant: 'lean' }), id: 'lean', label: 'Lean' },
      {
        Component: () => createElement(SiteFooter, { variant: 'status' }),
        id: 'status',
        label: 'With clock'
      }
    ]
  }
];
