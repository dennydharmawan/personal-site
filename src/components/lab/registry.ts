import { createElement, type ComponentType } from 'react';

import { CapabilitiesSection, type CapabilitiesLayout } from '@/components/portfolio-home';

export type LabVariant = {
  Component: ComponentType;
  id: string;
  label: string;
};

export type LabSection = {
  section: string;
  variants: LabVariant[];
};

const capabilities = (layout: CapabilitiesLayout) => () =>
  createElement(CapabilitiesSection, { layout });

export const labSections: LabSection[] = [
  {
    section: 'expertise',
    variants: [
      { Component: capabilities('current'), id: 'current', label: 'Current' },
      { Component: capabilities('bento'), id: 'bento', label: 'Bento' },
      { Component: capabilities('spy'), id: 'spy', label: 'Scroll spy' },
      { Component: capabilities('rows'), id: 'rows', label: 'Rows' }
    ]
  }
];
