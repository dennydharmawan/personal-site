import type { CSSProperties, JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import type { IconType } from 'react-icons';
import { FaAws } from 'react-icons/fa6';
import { GrMysql } from 'react-icons/gr';
import {
  SiApachekafka,
  SiDatadog,
  SiGraphql,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiTypescript
} from 'react-icons/si';
import { cn } from '@/lib/utils';
import { liftClassName, useEpisode, type Frame } from '@/components/instruments/shared';

export const keypadLabel =
  'Illustration: a twelve-key keypad with a tool logo and its name printed on every keycap: TypeScript, React, Next.js, Node.js, Kafka, GraphQL, AWS, Redis, PostgreSQL, MySQL, MongoDB, and Datadog. Five caps are pastel: TypeScript, Next.js, Kafka, AWS and MongoDB, and the other keys are pressed one after another.';

type Tool = { Icon: IconType; name: string };

const tools = {
  aws: { Icon: FaAws, name: 'AWS' },
  datadog: { Icon: SiDatadog, name: 'Datadog' },
  graphql: { Icon: SiGraphql, name: 'GraphQL' },
  kafka: { Icon: SiApachekafka, name: 'Kafka' },
  mongodb: { Icon: SiMongodb, name: 'MongoDB' },
  mysql: { Icon: SiMysql, name: 'MySQL' },
  next: { Icon: SiNextdotjs, name: 'Next.js' },
  node: { Icon: SiNodedotjs, name: 'Node.js' },
  postgres: { Icon: SiPostgresql, name: 'PostgreSQL' },
  react: { Icon: SiReact, name: 'React' },
  redis: { Icon: SiRedis, name: 'Redis' },
  typescript: { Icon: SiTypescript, name: 'TypeScript' }
} satisfies Record<string, Tool>;

const stage = { height: 250, width: 296 };

// The art is drawn once on a fixed stage that fits the narrowest card, then enlarged as a whole on
// wider cards, so nothing inside it ever stretches.
function Stage({ children, style }: { children: ReactNode; style?: CSSProperties }): JSX.Element {
  return (
    <div className="@container">
      <div className="flex h-[250px] items-end justify-center @min-[400px]:h-[290px]">
        <div
          className="relative shrink-0 origin-bottom @min-[400px]:scale-[1.16]"
          style={{ height: stage.height, width: stage.width, ...style }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type Tint = 'plain' | 'amber' | 'indigo' | 'pink' | 'teal' | 'violet';

const tintClassName: Record<Tint, { ink: string; skirt: string; top: string }> = {
  amber: { ink: 'text-amber-800', skirt: 'from-amber-200 to-amber-300', top: 'from-amber-50 to-amber-200' },
  indigo: { ink: 'text-indigo-800', skirt: 'from-indigo-200 to-indigo-300', top: 'from-indigo-50 to-indigo-200' },
  pink: { ink: 'text-pink-800', skirt: 'from-pink-200 to-pink-300', top: 'from-pink-50 to-pink-200' },
  plain: { ink: 'text-zinc-700', skirt: 'from-indigo-100 to-indigo-200', top: 'from-white to-indigo-50' },
  teal: { ink: 'text-teal-800', skirt: 'from-teal-100 to-teal-200', top: 'from-teal-50 to-teal-100' },
  violet: { ink: 'text-violet-800', skirt: 'from-violet-200 to-violet-300', top: 'from-violet-50 to-violet-200' }
};

const columns = 3;
const rows = 4;
const cap = { face: 34, height: 42, travel: 5, width: 74 };
const pitch = { x: 80, y: 47 };
const rim = 12;
const bed = {
  height: (rows - 1) * pitch.y + cap.height + 14,
  left: 11 + rim,
  top: rim,
  width: (columns - 1) * pitch.x + cap.width + 16
};

type Key = Tool & { markClassName?: string; tint: Tint; viewBox?: string };

// The stock MySQL and AWS logos spell their own names, which would read twice above a legend. MySQL
// takes the dolphin alone; AWS is cropped to the smile under its wordmark.
const keys: readonly Key[] = [
  { ...tools.typescript, tint: 'indigo' },
  { ...tools.react, tint: 'plain' },
  { ...tools.next, tint: 'pink' },
  { ...tools.node, tint: 'plain' },
  { ...tools.kafka, tint: 'violet' },
  { ...tools.graphql, tint: 'plain' },
  { Icon: FaAws, markClassName: 'h-[10px] w-[34px]', name: 'AWS', tint: 'amber', viewBox: '0 300 640 172' },
  { ...tools.redis, tint: 'plain' },
  { ...tools.postgres, tint: 'plain' },
  { Icon: GrMysql, markClassName: 'size-[18px]', name: 'MySQL', tint: 'plain' },
  { ...tools.mongodb, tint: 'teal' },
  { ...tools.datadog, tint: 'plain' }
];

// The run wanders across all three rows, so no row is played as a group.
const run = [1, 3, 7, 9, 8, 5, 11];
const firstPress = 0.25;
const pressGap = 0.72;
const pressSeconds = 0.55;
const runSeconds = firstPress + run.length * pressGap + 0.5;

const beats = [
  { ms: 1900, name: 'rest' },
  { ms: Math.round(runSeconds * 1000), name: 'run' }
] as const;

const press = {
  keyframes: ['translateY(0px)', `translateY(${cap.travel}px)`, 'translateY(-1px)', 'translateY(0px)'],
  times: [0, 0.2, 0.62, 1]
};

// The whole pad gives a little under every press.
const give = run.flatMap((_, index) => {
  const at = firstPress + index * pressGap;
  return [
    { at, y: 0 },
    { at: at + pressSeconds * 0.2, y: 1.5 },
    { at: at + pressSeconds * 0.7, y: 0 }
  ];
});
const giveKeyframes = ['translateY(0px)', ...give.map(({ y }) => `translateY(${y}px)`), 'translateY(0px)'];
const giveTimes = [0, ...give.map(({ at }) => at / runSeconds), 1];

export function Keypad({ frame }: { frame: Frame }): JSX.Element {
  const { beat, episode } = useEpisode(beats, 'rest', !frame.still);
  // Counts the runs started so far, so every key replays its press once per run.
  const played = episode + (beat === 'run' ? 1 : 0);

  return (
    <Stage>
      <span className="absolute -inset-x-10 top-[40px] -bottom-10 rounded-[50%] bg-[radial-gradient(closest-side,--alpha(var(--color-violet-200)/90%)_30%,--alpha(var(--color-violet-200)/0%))]" />
      <span className="absolute top-[-34px] left-[20px] size-[260px] rounded-full bg-[radial-gradient(closest-side,var(--color-white)_20%,--alpha(var(--color-white)/0%))]" />
      <div className="absolute inset-0 -rotate-[2.5deg]">
        <motion.div
          animate={played ? { transform: giveKeyframes } : undefined}
          className="absolute inset-0"
          key={played}
          transition={{ duration: runSeconds, ease: 'easeOut', times: giveTimes }}
        >
          <span
            className="absolute rounded-[26px] bg-indigo-300"
            style={{ height: bed.height + 2 * rim, left: bed.left - rim, top: bed.top - rim + 8, width: bed.width + 2 * rim }}
          />
          <span
            className={cn('absolute rounded-[26px] bg-linear-to-b from-white to-indigo-50', liftClassName)}
            style={{ height: bed.height + 2 * rim, left: bed.left - rim, top: bed.top - rim, width: bed.width + 2 * rim }}
          />
          <span
            className="absolute rounded-[16px] bg-indigo-100 shadow-[inset_0_2px_4px_--alpha(var(--color-indigo-950)/10%),inset_0_0_0_1px_--alpha(var(--color-indigo-950)/4%)]"
            style={{ height: bed.height, left: bed.left, top: bed.top, width: bed.width }}
          />

          {keys.map(({ Icon, markClassName, name, tint, viewBox }, index) => {
            const order = run.indexOf(index);
            const pressAt = firstPress + order * pressGap;
            const pressed = played > 0 && order >= 0;
            const tone = tintClassName[tint];
            const glows = pressed && tint === 'plain';
            const glow = {
              animate: { opacity: [0, 1, 1, 0] },
              initial: { opacity: 0 },
              transition: { delay: pressAt, duration: 1.3, ease: 'easeOut' as const, times: [0, 0.1, 0.45, 1] }
            };
            return (
              <div
                className="absolute"
                key={name}
                style={{
                  height: cap.height,
                  left: bed.left + 8 + (index % columns) * pitch.x,
                  top: bed.top + 6 + Math.floor(index / columns) * pitch.y,
                  width: cap.width
                }}
              >
                {pressed ? (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    className="absolute -inset-x-[3px] -top-[3px] -bottom-[1px] rounded-[15px] bg-violet-300"
                    initial={{ opacity: 0 }}
                    key={`halo-${played}`}
                    transition={{ delay: pressAt, duration: 0.9, ease: 'easeOut', times: [0, 0.2, 1] }}
                  />
                ) : null}
                <motion.div
                  animate={pressed ? { transform: press.keyframes } : undefined}
                  className="absolute inset-0"
                  key={played}
                  transition={{ delay: pressAt, duration: pressSeconds, ease: ['easeOut', 'easeOut', 'easeInOut'], times: press.times }}
                >
                  <span
                    className={cn(
                      'absolute inset-0 overflow-hidden rounded-[12px] bg-linear-to-b shadow-[0_3px_5px_-1px_--alpha(var(--color-indigo-950)/20%),0_0_0_1px_--alpha(var(--color-indigo-950)/5%)]',
                      tone.skirt
                    )}
                  >
                    {glows ? <motion.span className="absolute inset-0 bg-linear-to-b from-violet-200 to-violet-300" {...glow} /> : null}
                  </span>
                  <span
                    className={cn(
                      'absolute inset-x-[2px] top-[1px] flex flex-col items-center justify-center gap-[2px] overflow-hidden rounded-[10px] bg-linear-to-b shadow-[inset_0_1.5px_0_--alpha(var(--color-white)/90%),inset_0_-1px_0_--alpha(var(--color-zinc-900)/4%)]',
                      tone.top,
                      tone.ink
                    )}
                    style={{ height: cap.face }}
                  >
                    {glows ? <motion.span className="absolute inset-0 bg-linear-to-b from-violet-50 to-violet-200" {...glow} /> : null}
                    <span className="relative grid h-[16px] place-items-center">
                      <Icon aria-hidden="true" className={cn('size-[16px]', markClassName)} {...(viewBox ? { viewBox } : {})} />
                    </span>
                    <span className="relative text-[11px] leading-[12px] font-medium whitespace-nowrap">{name}</span>
                  </span>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </Stage>
  );
}
