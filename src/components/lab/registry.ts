import { createElement, type ComponentType } from 'react';

import { SiteFooter, type FooterVariant } from '@/components/portfolio-home';

export type LabVariant = {
  Component: ComponentType;
  id: string;
  label: string;
};

export type LabSection = {
  section: string;
  variants: LabVariant[];
};

const footer = (variant: FooterVariant) => () => createElement(SiteFooter, { variant });

export const labSections: LabSection[] = [
  {
    section: 'footer',
    variants: [
      { Component: footer('current'), id: 'current', label: 'Current' },
      { Component: footer('night'), id: 'night', label: 'Night' },
      { Component: footer('card'), id: 'card', label: 'Card' },
      { Component: footer('centered'), id: 'centered', label: 'Centered' },
      { Component: footer('minimal'), id: 'minimal', label: 'Minimal' }
    ]
  }
];
