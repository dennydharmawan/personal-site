import type { FocusEvent, PointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { requestPathLayers, type StageLayerId } from '@/components/system-stage-data';
import { cn } from '@/lib/utils';

export type RequestPathProps = {
  activeHop: StageLayerId | null;
  className?: string;
  onPreview: (id: StageLayerId | null) => void;
  onToggle: (id: StageLayerId) => void;
  pinnedHop: StageLayerId | null;
};

// The rail sits behind the nodes; each node's opaque disc masks the segment it covers.
const railClassName = 'pointer-events-none absolute bg-zinc-200';
const verticalRailInset = 'top-[22px] bottom-[22px] left-[10px] w-px lg:hidden';
// Five equal columns put the outer node centres at 10% and 90%.
const horizontalRailInset = 'hidden lg:block lg:top-[10px] lg:left-[10%] lg:right-[10%] lg:h-px';

function RailPulse({ axis, duration }: { axis: 'x' | 'y'; duration: number }) {
  const keyframes =
    axis === 'x'
      ? ['translateX(-100%)', 'translateX(400%)']
      : ['translateY(-100%)', 'translateY(400%)'];

  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        'absolute',
        axis === 'x'
          ? 'inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-sky-500 to-transparent'
          : 'inset-x-0 top-0 h-1/5 bg-gradient-to-b from-transparent via-sky-500 to-transparent'
      )}
      initial={{ transform: keyframes[0] }}
      animate={{ transform: keyframes }}
      transition={{ duration, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
    />
  );
}

export function RequestPath({
  activeHop,
  className,
  onPreview,
  onToggle,
  pinnedHop
}: RequestPathProps) {
  const reduced = useReducedMotion() === true;

  function releasePointer(event: PointerEvent<HTMLDivElement>) {
    // Touch never fires a matching leave, so a tapped hop has to stay lit until it is tapped again.
    if (event.pointerType === 'mouse') {
      onPreview(null);
    }
  }

  function releaseFocus(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onPreview(null);
    }
  }

  return (
    <div className={cn('grid gap-5', className)} onBlur={releaseFocus} onPointerLeave={releasePointer}>
      {/* The 10% inset brackets the label row to the rail, which spans the outer node centres. */}
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-6 gap-y-1 lg:px-[10%]">
        <p className="text-sm font-medium text-zinc-900">The path a request takes</p>
        {pinnedHop ? (
          <button
            type="button"
            onClick={() => onToggle(pinnedHop)}
            className="inline-flex min-h-11 items-center rounded-md text-xs font-medium text-sky-700 hover:text-sky-800"
          >
            Show all four again
          </button>
        ) : (
          <p className="text-xs text-zinc-500">Pick a hop to see which samples touch it</p>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter work samples by the stage of the request path they touch"
        className="relative grid gap-2 lg:grid-cols-5 lg:gap-0"
      >
        <span aria-hidden="true" className={cn(railClassName, verticalRailInset)}>
          {reduced ? null : <RailPulse axis="y" duration={7.4} />}
        </span>
        <span aria-hidden="true" className={cn(railClassName, horizontalRailInset)}>
          {reduced ? null : <RailPulse axis="x" duration={6.2} />}
        </span>

        {requestPathLayers.map((layer) => {
          const isActive = activeHop === layer.id;

          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={pinnedHop === layer.id}
              onClick={() => onToggle(layer.id)}
              onFocus={() => onPreview(layer.id)}
              onPointerEnter={() => onPreview(layer.id)}
              className="group/hop flex min-h-11 items-center gap-3 rounded-lg text-left lg:flex-col lg:items-center lg:gap-2 lg:px-2 lg:text-center"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-zinc-50">
                <span
                  className={cn(
                    'size-2.5 rounded-full ring-1 transition-colors duration-200',
                    isActive
                      ? 'bg-sky-600 ring-sky-600'
                      : 'bg-white ring-zinc-300 group-hover/hop:ring-sky-500'
                  )}
                />
              </span>
              <span className="grid gap-0.5">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isActive ? 'text-sky-800' : 'text-zinc-900'
                  )}
                >
                  {layer.label}
                </span>
                <span className="text-xs leading-4 text-zinc-500 text-pretty">{layer.caption}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
