import { useId, type CSSProperties, type JSX, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { overshootEase } from '@/components/sections/shared';
import { cycle, useEpisode, type Frame } from '@/components/instruments/shared';

export const parcelLineLabel =
  'Illustration: a small parcel depot on a clear day. A conveyor belt runs from a workshop on the left to a delivery van on the right. Three pastel parcels sit on the belt; the one under the scanner and the one past it carry a green check seal, and the scanner shows a green check.';

// Drawn once for the narrowest card (312px) and enlarged as one piece on wider cards, so the art
// never stretches.
const stage = { height: 250, width: 312 };
// The yard runs past both sides of the stage, so a wider card still has scenery at its edges.
const field = { left: -60, width: 432 };
const floor = stage.height + 6;

function Stage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="@container w-full">
      <div className="relative h-[250px] [--stage-scale:1] @[340px]:h-[280px] @[340px]:[--stage-scale:1.12] @[400px]:h-[290px] @[400px]:[--stage-scale:1.16]">
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            height: stage.height,
            marginLeft: -stage.width / 2,
            transform: 'scale(var(--stage-scale))',
            width: stage.width
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function stop(color: string, opacity = 1): CSSProperties {
  return { stopColor: color, stopOpacity: opacity };
}

const ground = 206;
const belt = { from: 40, to: 262, y: 170 };
// Parcels stop one pitch apart, and one of the stops is under the scanner.
const pitch = 78;
const scanner = 156;
const parcelHeight = 22;

const beats = [
  { ms: 1150, name: 'scan' },
  { ms: 850, name: 'move' }
] as const;

type Tint = 'amber' | 'indigo' | 'pink';
const parcelKinds: readonly { tint: Tint; width: number }[] = [
  { tint: 'amber', width: 26 },
  { tint: 'pink', width: 30 },
  { tint: 'indigo', width: 24 }
];
const tintClassName: Record<Tint, { box: string; lid: string; tape: string }> = {
  amber: { box: 'from-amber-100 to-amber-200', lid: 'bg-amber-300/70', tape: 'bg-white/70' },
  indigo: { box: 'from-indigo-100 to-indigo-200', lid: 'bg-indigo-300/70', tape: 'bg-white/70' },
  pink: { box: 'from-pink-100 to-pink-200', lid: 'bg-pink-300/70', tape: 'bg-white/70' }
};
// Stops along the belt, counted from the scanner: the ends are hidden inside the workshop and the van.
const stops = [-2, -1, 0, 1, 2];

const hills = 'M-60 206V172C-36 160-12 158 12 164 36 170 52 160 78 152 104 144 128 150 152 160 176 170 196 166 220 156 244 146 268 148 292 158 316 168 344 164 372 154V206Z';
const nearHills = 'M-60 206V190C-30 182 0 184 30 190 60 196 90 190 124 184 158 178 190 184 222 190 254 196 290 190 324 184 344 181 360 182 372 184V206Z';
const trees: readonly { height?: number; r?: number; x: number }[] = [
  { height: 22, x: 96 },
  { r: 8, x: 112 },
  { height: 18, x: 204 },
  { r: 9, x: 222 },
  { height: 24, x: 352 }
];
const clouds: readonly { delay: number; duration: number; left: number; scale: number; top: number }[] = [
  { delay: 0.3, duration: 12, left: 84, scale: 0.9, top: 52 },
  { delay: 2, duration: 14, left: 216, scale: 0.7, top: 78 },
  { delay: 1.2, duration: 13, left: 286, scale: 1, top: 36 }
];
const gulls: readonly { delay: number; duration: number; size: number; x: number; y: number }[] = [
  { delay: 0, duration: 5.2, size: 9, x: 196, y: 44 },
  { delay: 0.9, duration: 6.1, size: 7, x: 211, y: 34 },
  { delay: 1.7, duration: 5.6, size: 6, x: 185, y: 30 }
];
const smoke = [
  { delay: 0, duration: 4.2, left: 23, size: 5, top: 70 },
  { delay: 1.5, duration: 4.8, left: 25.5, size: 7, top: 63 },
  { delay: 2.9, duration: 5.4, left: 22, size: 4.5, top: 56 }
];
// Grass tufts in the yard, some with a few flowers beside them: x, y, and which posy (0 is none).
const tufts: readonly (readonly [number, number, number])[] = [
  [78, 232, 1], [132, 240, 0], [176, 226, 2], [216, 238, 3], [242, 222, 0], [-24, 236, 2], [20, 244, 0], [332, 240, 1], [112, 220, 0]
];
const posies: readonly (readonly (readonly [number, number, boolean])[])[] = [
  [],
  [[6, -1, false], [9.4, 0.8, true], [-5.6, 0.6, false]],
  [[-6.2, -1.2, true], [-9.4, 1, false], [5.6, 1.4, false]],
  [[5.2, 1.6, false], [-5.2, -0.4, true]]
];
const rollers = [78, 98, 118, 138, 158, 178, 198, 218, 238];

function Cloud({ id, scale }: { id: string; scale: number }): JSX.Element {
  return (
    <svg className="block overflow-visible" height={14 * scale} viewBox="0 0 56 14" width={56 * scale}>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={id} x1="0" x2="0" y1="0" y2="14">
          <stop offset="0.3" style={stop('var(--color-white)')} />
          <stop offset="1" style={stop('var(--color-indigo-100)')} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <rect height={6} rx={3} width={56} x={0} y={8} />
        <rect height={7} rx={3.5} width={34} x={9} y={3.5} />
        <circle cx={22} cy={6} r={5.5} />
        <circle cx={33} cy={6.5} r={4} />
      </g>
    </svg>
  );
}

function Tree({ height, r, x }: { height?: number; r?: number; x: number }): JSX.Element {
  if (height) {
    const half = round(height * 0.19);
    const top = ground - height;
    const belly = round(ground - height * 0.42);
    return (
      <g>
        <rect className="fill-indigo-400" height={3} width={1.4} x={x - 0.7} y={ground - 2} />
        <path className="fill-teal-200" d={`M${x} ${top}C${x - half * 0.5} ${round(top + height * 0.2)} ${x - half} ${belly} ${x - half} ${round(ground - height * 0.24)}C${x - half} ${round(ground - height * 0.1)} ${x - half * 0.5} ${ground - 1.5} ${x} ${ground - 1.5}Z`} />
        <path className="fill-teal-300" d={`M${x} ${top}C${x + half * 0.5} ${round(top + height * 0.2)} ${x + half} ${belly} ${x + half} ${round(ground - height * 0.24)}C${x + half} ${round(ground - height * 0.1)} ${x + half * 0.5} ${ground - 1.5} ${x} ${ground - 1.5}Z`} />
      </g>
    );
  }
  const size = r ?? 8;
  const y = round(ground - size * 1.7);
  return (
    <g>
      <rect className="fill-indigo-400" height={round(size * 1.1)} rx={0.6} width={round(size * 0.2)} x={round(x - size * 0.1)} y={round(ground - size * 1.1)} />
      <circle className="fill-teal-300" cx={x} cy={y} r={size} />
      <circle className="fill-teal-200" cx={round(x - size * 0.2)} cy={round(y - size * 0.2)} r={round(size * 0.76)} />
      <circle className="fill-teal-100" cx={round(x - size * 0.36)} cy={round(y - size * 0.4)} r={round(size * 0.34)} />
    </g>
  );
}

function Seal(): JSX.Element {
  return (
    <span className="grid size-[13px] place-items-center rounded-full bg-linear-to-b from-emerald-200 to-emerald-300 text-emerald-800 ring-[1.5px] ring-white shadow-[0_1px_2px_--alpha(var(--color-indigo-950)/18%)]">
      <Check size={8} strokeWidth={4} />
    </span>
  );
}

function Parcel({ kind, seal, x }: { kind: number; seal: ReactNode; x: number }): JSX.Element {
  const { tint, width } = parcelKinds[kind];
  const tone = tintClassName[tint];
  return (
    <span className="absolute" style={{ height: parcelHeight, left: x - width / 2, top: belt.y - parcelHeight, width }}>
      <span
        className={cn(
          'absolute inset-0 rounded-[3px] bg-linear-to-br shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/80%),inset_-2px_-2px_3px_--alpha(var(--color-indigo-950)/8%),0_1px_1px_--alpha(var(--color-indigo-950)/14%)]',
          tone.box
        )}
      />
      <span className={cn('absolute inset-x-0 top-0 h-[5px] rounded-t-[3px]', tone.lid)} />
      <span className={cn('absolute inset-y-0 left-1/2 w-[5px] -translate-x-1/2', tone.tape)} />
      <span className="absolute bottom-[4px] left-[3px] h-[1.5px] w-[6px] rounded-full bg-indigo-400/50" />
      <span className="absolute bottom-[7px] left-[3px] h-[1.5px] w-[4px] rounded-full bg-indigo-400/40" />
      <span className="absolute top-[7px] left-1/2 -ml-[6.5px]">{seal}</span>
    </span>
  );
}

export function ParcelLine({ frame }: { frame: Frame }): JSX.Element {
  const id = useId();
  const { still } = frame;
  const { beat, episode } = useEpisode(beats, 'scan', !still);
  // A move shows the next layout sliding in from one pitch back, so the loop never jumps.
  const step = episode + (beat === 'move' ? 1 : 0);
  const moving = beat === 'move';
  const slide = moving
    ? {
        animate: { transform: 'translateX(0px)' },
        initial: { transform: `translateX(${-pitch}px)` },
        transition: { duration: 0.75, ease: [0.5, 0, 0.2, 1] as const }
      }
    : {};

  return (
    <Stage>
      {/* Sky: a white lift behind the scanner, clouds and a few birds. */}
      <span
        className="absolute rounded-full bg-[radial-gradient(closest-side,var(--color-white)_20%,--alpha(var(--color-white)/0%))]"
        style={{ height: 260, left: scanner - 130, top: -10, width: 260 }}
      />
      {clouds.map(({ delay, duration, left, scale, top }) => (
        <motion.div
          className="absolute"
          key={left}
          style={{ left, top }}
          {...cycle(still, { transform: ['translateX(0px)', 'translateX(5px)', 'translateX(0px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <Cloud id={`${id}-cloud-${left}`} scale={scale} />
        </motion.div>
      ))}
      {gulls.map(({ delay, duration, size, x, y }) => (
        <motion.div
          className="absolute size-0"
          key={x}
          style={{ left: x, top: y }}
          {...cycle(still, { transform: ['translate(0px, 0px)', 'translate(3px, -2px)', 'translate(0px, 0px)'] }, duration, [0, 0.5, 1], { delay })}
        >
          <svg className="absolute overflow-visible" fill="none" height={size * 0.5} style={{ left: -size / 2, top: -size / 4 }} viewBox="0 0 12 6" width={size}>
            <path className="stroke-indigo-400" d="M.8 3.600C2.600 1.200 4.600 1.200 6 4 7.400 1.200 9.400 1.200 11.200 3.600" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
          </svg>
        </motion.div>
      ))}

      {/* Hills, trees, the yard, and everything that stands behind the belt. */}
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-hills`} x1="0" x2="0" y1="146" y2={ground}>
            <stop offset="0" style={stop('var(--color-violet-200)')} />
            <stop offset="1" style={stop('var(--color-violet-100)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-hills-near`} x1="0" x2="0" y1="180" y2={ground}>
            <stop offset="0" style={stop('var(--color-indigo-200)')} />
            <stop offset="1" style={stop('var(--color-indigo-100)')} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-yard`} x1="0" x2="0" y1={ground} y2={floor}>
            <stop offset="0" style={stop('var(--color-violet-100)')} />
            <stop offset="1" style={stop('var(--color-violet-300)')} />
          </linearGradient>
          <linearGradient id={`${id}-steel`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
          <linearGradient id={`${id}-steel-across`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-200)')} />
          </linearGradient>
        </defs>
        <path d={hills} fill={`url(#${id}-hills)`} />
        <path d={nearHills} fill={`url(#${id}-hills-near)`} />
        {trees.map((tree) => (
          <Tree key={tree.x} {...tree} />
        ))}
        <rect fill={`url(#${id}-yard)`} height={floor - ground} width={field.width} x={field.left} y={ground} />
        <rect className="fill-white" height={1.4} width={field.width} x={field.left} y={ground} />
        <path className="stroke-white/50" d="M-60 222H372M-60 242H372M-20 206L-34 256M68 206L60 256M156 206V256M244 206L252 256M332 206L346 256" strokeWidth={1} />
        {tufts.map(([x, y, posy]) => (
          <g key={`${x}-${y}`}>
            <path className="stroke-violet-400/70" d={`M${x - 2.4} ${y - 2.6}L${x} ${y}L${x + 0.4} ${y - 3.6}M${x} ${y}L${x + 2.8} ${y - 2.4}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.9} />
            {posies[posy].map(([dx, dy, white]) => (
              <circle className={white ? 'fill-white' : 'fill-pink-300'} cx={x + dx} cy={y + dy} key={dx} r={white ? 1 : 1.2} />
            ))}
          </g>
        ))}

        {/* The scanner's mast and arm, behind the belt. */}
        <ellipse className="fill-violet-400/40" cx={188} cy={ground + 1} rx={11} ry={2.6} />
        <rect fill={`url(#${id}-steel-across)`} height={ground - 112} rx={1.5} width={7} x={184} y={112} />
        <rect className="fill-indigo-300" height={5} rx={1.5} width={15} x={180} y={ground - 4} />
        <rect className="fill-white" height={1.2} rx={0.6} width={15} x={180} y={ground - 4.6} />
        <path className="stroke-indigo-300" d="M187.500 126C200 136 200 150 190 158" strokeLinecap="round" strokeWidth={1.2} />

        {/* The belt's legs. */}
        {[92, 214].map((x) => (
          <g key={x}>
            <path d={`M${x - 3} ${belt.y + 7}L${x - 8} ${ground}M${x + 3} ${belt.y + 7}L${x + 8} ${ground}`} stroke={`url(#${id}-steel-across)`} strokeLinecap="round" strokeWidth={3.4} />
            <path className="stroke-indigo-300" d={`M${x - 5.500} ${belt.y + 22}H${x + 5.500}`} strokeWidth={1.4} />
            <rect className="fill-indigo-300" height={3} rx={1.5} width={24} x={x - 12} y={ground - 2} />
          </g>
        ))}
        <rect fill={`url(#${id}-steel)`} height={8} rx={2} width={belt.to - belt.from} x={belt.from} y={belt.y + 1} />
        <rect className="fill-indigo-300/80" height={1.2} width={belt.to - belt.from} x={belt.from} y={belt.y + 7.800} />
      </svg>

      {rollers.map((x) => (
        <motion.span
          className="absolute size-[6px] rounded-full bg-indigo-300 shadow-[inset_0_0_0_1px_var(--color-indigo-400)]"
          key={`${x}-${step}`}
          style={{ left: x - 3, top: belt.y + 2 }}
          {...(moving
            ? { animate: { transform: 'rotate(360deg)' }, initial: { transform: 'rotate(0deg)' }, transition: { duration: 0.75, ease: [0.5, 0, 0.2, 1] as const } }
            : {})}
        >
          <span className="absolute top-[1px] left-[2.5px] h-[2px] w-[1px] rounded-full bg-white" />
        </motion.span>
      ))}

      {/* The belt's surface and the parcels on it move together, one stop at a time. */}
      <div className="absolute overflow-hidden" style={{ height: 60, left: belt.from, top: belt.y - 50, width: belt.to - belt.from }}>
        <motion.div className="absolute top-0" key={step} style={{ left: -belt.from, top: -(belt.y - 50) }} {...slide}>
          <span
            className="absolute h-[2.5px] rounded-full bg-indigo-400"
            style={{ left: belt.from - pitch, top: belt.y - 0.5, width: belt.to - belt.from + pitch * 2 }}
          />
          {Array.from({ length: 30 }, (_, index) => (
            <span
              className="absolute h-[2.5px] w-[3px] bg-indigo-200"
              key={`dash-${index}`}
              style={{ left: belt.from - pitch + index * 13, top: belt.y - 0.5 }}
            />
          ))}
          {stops.map((stopIndex) => {
            const kind = (((stopIndex - step) % 3) + 3) % 3;
            const x = scanner + stopIndex * pitch;
            if (stopIndex > 0) return <Parcel key={stopIndex} kind={kind} seal={<Seal />} x={x} />;
            if (stopIndex < 0 || moving) return <Parcel key={stopIndex} kind={kind} seal={null} x={x} />;
            return (
              <Parcel
                key={stopIndex}
                kind={kind}
                seal={
                  still ? (
                    <Seal />
                  ) : (
                    <motion.span
                      animate={{ opacity: 1, transform: 'scale(1)' }}
                      className="block"
                      initial={{ opacity: 0, transform: 'scale(0.2)' }}
                      key={episode}
                      transition={{ delay: 0.62, duration: 0.32, ease: overshootEase }}
                    >
                      <Seal />
                    </motion.span>
                  )
                }
                x={x}
              />
            );
          })}
        </motion.div>
      </div>

      {/* The scan: a sheet of light drops onto the parcel, then lifts. */}
      {beat === 'scan' && !still ? (
        <motion.span
          animate={{ opacity: [0, 0.9, 0.9, 0], transform: ['scaleY(0.2)', 'scaleY(1)', 'scaleY(1)', 'scaleY(1)'] }}
          className="absolute origin-top bg-linear-to-b from-emerald-300/70 to-emerald-200/10 [clip-path:polygon(28%_0,72%_0,100%_100%,0_100%)]"
          initial={{ opacity: 0, transform: 'scaleY(0.2)' }}
          key={episode}
          style={{ height: belt.y - 128, left: scanner - 20, top: 128, width: 40 }}
          transition={{ delay: 0.12, duration: 0.72, ease: 'easeOut', times: [0, 0.25, 0.75, 1] }}
        />
      ) : null}

      {/* In front of the belt: the workshop, the scanner head, and the van. */}
      <svg
        className="absolute overflow-visible"
        fill="none"
        height={floor}
        style={{ left: field.left, top: 0 }}
        viewBox={`${field.left} 0 ${field.width} ${floor}`}
        width={field.width}
      >
        <defs>
          <linearGradient id={`${id}-wall`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.3" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-roof`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-pink-300)')} />
            <stop offset="1" style={stop('var(--color-pink-400)')} />
          </linearGradient>
          <linearGradient id={`${id}-pane`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-100)')} />
            <stop offset="1" style={stop('var(--color-amber-300)')} />
          </linearGradient>
          <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={stop('var(--color-indigo-300)')} />
            <stop offset="1" style={stop('var(--color-indigo-500)')} />
          </linearGradient>
          <linearGradient id={`${id}-van`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-white)')} />
            <stop offset="1" style={stop('var(--color-indigo-100)')} />
          </linearGradient>
          <linearGradient id={`${id}-cab`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={stop('var(--color-amber-200)')} />
            <stop offset="1" style={stop('var(--color-amber-300)')} />
          </linearGradient>
        </defs>

        {/* Workshop: a gabled shed with a chimney, two lit windows and a hatch the belt comes out of. */}
        <rect className="fill-indigo-300" height={22} width={7} x={20} y={74} />
        <rect className="fill-indigo-400/60" height={22} width={2} x={25} y={74} />
        <rect className="fill-white" height={2.4} rx={1.2} width={10} x={18.500} y={72.500} />
        <rect fill={`url(#${id}-wall)`} height={ground - 112} width={116} x={-64} y={112} />
        <rect className="fill-indigo-400/25" height={2.4} width={116} x={-64} y={112} />
        <path d="M-70 113L-6 84L58 113Z" fill={`url(#${id}-roof)`} stroke={`url(#${id}-roof)`} strokeLinejoin="round" strokeWidth={2} />
        <path className="fill-white/30" d="M-70 113L-6 84V113Z" />
        <circle className="fill-white" cx={-6} cy={101} r={5.5} />
        <path className="stroke-pink-400" d="M-9 99.500H-3V104H-9ZM-6 99.500V104" strokeLinejoin="round" strokeWidth={1.1} />
        {[-40, -14, 12].map((x) => (
          <g key={x}>
            <path className="fill-indigo-300" d={`M${x - 6} 152V134a6 6 0 0 1 12 0V152Z`} />
            <path d={`M${x - 4.600} 150.600V134.200a4.600 4.600 0 0 1 9.200 0V150.600Z`} fill={`url(#${id}-pane)`} />
            <path className="stroke-white/80" d={`M${x} 129.600V150.600M${x - 4.600} 139H${x + 4.600}`} strokeWidth={0.9} />
            <rect className="fill-white" height={1.6} rx={0.8} width={15} x={x - 7.500} y={151.600} />
          </g>
        ))}
        <rect className="fill-indigo-300/50" height={3} width={116} x={-64} y={ground - 12} />
        <rect fill={`url(#${id}-cap)`} height={40} rx={3} width={30} x={38} y={138} />
        <rect className="fill-white/50" height={1.2} rx={0.6} width={26} x={40} y={138} />
        <rect className="fill-indigo-500/60" height={30} width={3} x={65} y={143} />
        {[146, 152.500, 159, 165.500].map((y) => (
          <rect className="fill-pink-300" height={4.5} key={y} rx={0.8} width={4} x={64.500} y={y} />
        ))}
        <circle className="fill-emerald-300" cx={46} cy={145} r={1.8} />
        <circle className="fill-amber-200" cx={52} cy={145} r={1.8} />

        {/* The scanner head hangs from the mast over the belt. */}
        <rect fill={`url(#${id}-steel-across)`} height={7} rx={2} width={36} x={152} y={112} />
        <rect fill={`url(#${id}-cap)`} height={16} rx={4} width={44} x={134} y={110} />
        <rect className="fill-white/50" height={1.2} rx={0.6} width={38} x={137} y={110} />
        <rect className="fill-indigo-200" height={6} rx={1.5} width={18} x={139} y={114} />
        <path className="stroke-emerald-400" d="M141.500 117.500l2 1.800 3-3.600" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.1} />
        <path className="stroke-indigo-400/70" d="M149.500 115.500h5M149.500 118.500h3" strokeLinecap="round" strokeWidth={0.9} />
        <circle className="fill-pink-300" cx={167} cy={117} r={1.6} />
        <circle className="fill-amber-200" cx={172} cy={117} r={1.6} />
        <path className="fill-indigo-400" d="M146 126H166L163 130H149Z" />
        <rect className="fill-emerald-200" height={1.6} rx={0.8} width={13} x={149.500} y={128.800} />

        {/* The van, backed up to the end of the belt with its tail door lifted. */}
        <ellipse className="fill-violet-400/40" cx={304} cy={ground + 1} rx={58} ry={3.4} />
        <path className="stroke-indigo-300" d="M250 133L233 121" strokeLinecap="round" strokeWidth={3.4} />
        <path className="stroke-white/70" d="M249 131.500L235 121.800" strokeLinecap="round" strokeWidth={1} />
        <rect fill={`url(#${id}-van)`} height={66} rx={4} width={70} x={250} y={132} />
        <rect className="fill-pink-300" height={7} width={70} x={250} y={170} />
        <rect className="fill-pink-200" height={2} width={70} x={250} y={177} />
        <rect className="fill-white/90" height={1.4} rx={0.7} width={64} x={253} y={132} />
        <rect className="fill-indigo-400/70" height={38} width={3} x={250} y={138} />
        {[141, 148, 155, 162].map((y) => (
          <rect className="fill-indigo-300" height={5} key={y} rx={0.8} width={4.5} x={249} y={y} />
        ))}
        <rect className="fill-white" height={15} rx={2} width={17} x={277} y={146} />
        <path className="stroke-pink-400" d="M281 150H290V157.500H281ZM285.500 150V157.500" strokeLinejoin="round" strokeWidth={1.2} />
        <path d="M320 198V152H336C341 152 344 155 346 160L350 172H354C357 172 358 174 358 177V198Z" fill={`url(#${id}-cab)`} />
        <path className="fill-indigo-300" d="M324 157H335.500C339 157 341 159 342.500 162.500L345.500 171H324Z" />
        <path className="stroke-white/70" d="M327 159.500L331 168" strokeLinecap="round" strokeWidth={1.4} />
        <rect className="fill-amber-400/70" height={1.4} width={38} x={320} y={183} />
        <rect className="fill-white" height={3} rx={1} width={2.6} x={355.400} y={179} />
        <rect className="fill-indigo-400" height={4} rx={1.5} width={112} x={248} y={196} />
        {[272, 338].map((x) => (
          <g key={x}>
            <circle className="fill-indigo-500" cx={x} cy={198} r={8} />
            <circle className="fill-indigo-200" cx={x} cy={198} r={3.6} />
            <circle className="fill-white" cx={x} cy={198} r={1.4} />
          </g>
        ))}

        {/* A stack of parcels waiting in the yard. */}
        <ellipse className="fill-violet-400/40" cx={126} cy={ground + 21} rx={22} ry={3} />
        <rect className="fill-pink-200" height={15} rx={2} width={20} x={106} y={ground + 5} />
        <rect className="fill-white/70" height={15} width={4} x={114} y={ground + 5} />
        <rect className="fill-indigo-200" height={15} rx={2} width={18} x={127} y={ground + 5} />
        <rect className="fill-white/70" height={15} width={4} x={134} y={ground + 5} />
        <rect className="fill-amber-200" height={13} rx={2} width={18} x={116} y={ground - 8} />
        <rect className="fill-white/70" height={13} width={4} x={123} y={ground - 8} />
        <rect className="fill-white/60" height={1.2} rx={0.6} width={16} x={117} y={ground - 8} />
      </svg>

      {smoke.map(({ delay, duration, left, size, top }) => (
        <motion.span
          className="absolute rounded-full bg-linear-to-b from-white to-indigo-100 opacity-90"
          key={top}
          style={{ height: size, left: left - size / 2, top: top - size / 2, width: size }}
          {...cycle(
            still,
            { opacity: [0, 0.9, 0.7, 0], transform: ['translate(-1px, 5px) scale(0.6)', 'translate(0px, 2px) scale(0.9)', 'translate(1px, -1px) scale(1)', 'translate(3px, -4px) scale(1.15)'] },
            duration,
            [0, 0.25, 0.6, 1],
            { delay, ease: 'linear' }
          )}
        />
      ))}

      {/* The scanner's verdict. */}
      <span className="absolute size-0" style={{ left: scanner, top: 100 }}>
        {beat === 'scan' && !still ? (
          <motion.span
            animate={{ opacity: [0, 0.7, 0], transform: ['scale(0.8)', 'scale(1)', 'scale(1.7)'] }}
            className="absolute -top-[14px] -left-[14px] size-7 rounded-full bg-emerald-300"
            initial={{ opacity: 0, transform: 'scale(0.8)' }}
            key={episode}
            transition={{ delay: 0.62, duration: 0.5, ease: 'easeOut', times: [0, 0.3, 1] }}
          />
        ) : null}
        <motion.span
          className="absolute -top-[11px] -left-[11px] grid size-[22px] place-items-center rounded-full bg-linear-to-b from-emerald-100 to-emerald-300 text-emerald-700 ring-[3px] ring-white shadow-[0_2px_4px_--alpha(var(--color-indigo-950)/16%)]"
          key={beat === 'scan' ? `badge-${episode}` : 'steady'}
          {...(beat === 'scan' && !still
            ? {
                animate: { transform: ['scale(1)', 'scale(1.22)', 'scale(1)'] },
                transition: { delay: 0.62, duration: 0.4, ease: 'easeOut', times: [0, 0.4, 1] }
              }
            : {})}
        >
          <Check size={13} strokeWidth={3} />
        </motion.span>
      </span>
    </Stage>
  );
}
