import { createElement, type ComponentType } from 'react';

import { AboutSection, type AboutLayout } from '@/components/portfolio-home';

export type LabVariant = {
  Component: ComponentType;
  id: string;
  label: string;
};

export type LabSection = {
  section: string;
  variants: LabVariant[];
};

const about = (layout: AboutLayout) => () => createElement(AboutSection, { layout });

export const labSections: LabSection[] = [
  {
    section: 'about',
    variants: [
      { Component: about('current'), id: 'current', label: 'Current' },
      { Component: about('ribbon'), id: 'ribbon', label: 'Ribbon' },
      { Component: about('editorial'), id: 'editorial', label: 'Editorial' },
      { Component: about('recolor'), id: 'recolor', label: 'Recolor' }
    ]
  }
];
