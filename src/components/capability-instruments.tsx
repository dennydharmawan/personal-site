import { useRef, type JSX } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { CableCar, cableCarLabel } from '@/components/instruments/cable-car';
import { CanalLock, canalLockLabel } from '@/components/instruments/canal-lock';
import { Keypad, keypadLabel } from '@/components/instruments/keypad';
import { Lighthouse, lighthouseLabel } from '@/components/instruments/lighthouse';
import { ParcelLine, parcelLineLabel } from '@/components/instruments/parcel-line';
import { usePageVisible, type Frame } from '@/components/instruments/shared';

export type CapabilityKind = 'fullstack' | 'release' | 'production' | 'stack' | 'standards';

const instruments: Record<CapabilityKind, { Instrument: (props: { frame: Frame }) => JSX.Element; ariaLabel: string }> = {
  fullstack: { Instrument: CanalLock, ariaLabel: canalLockLabel },
  production: { Instrument: ParcelLine, ariaLabel: parcelLineLabel },
  release: { Instrument: Lighthouse, ariaLabel: lighthouseLabel },
  stack: { Instrument: Keypad, ariaLabel: keypadLabel },
  standards: { Instrument: CableCar, ariaLabel: cableCarLabel }
};

export function CapabilityInstrument({ kind }: { kind: CapabilityKind }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  // The margin swaps still and live just outside the viewport, where the remount cannot be seen.
  const isInView = useInView(ref, { margin: '150px 0px' });
  const pageVisible = usePageVisible();
  // Off screen, the illustration remounts in its still state so no loop ticks where nobody can see it.
  const still = useReducedMotion() === true || !isInView || !pageVisible;
  const { Instrument, ariaLabel } = instruments[kind];

  return (
    <div ref={ref} aria-label={ariaLabel} role="img">
      <div aria-hidden="true" key={still ? 'still' : 'live'}>
        <Instrument frame={{ still }} />
      </div>
    </div>
  );
}
