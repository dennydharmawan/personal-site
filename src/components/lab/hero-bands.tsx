// Throwaway lab prototypes for the hero band. Desktop only, not production code.
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { cycle } from '@/components/capability-instruments';
import { DotField } from '@/components/dot-field';

const bandClassName =
  'relative z-10 h-[12.5rem] overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-slate-900/5 sm:h-[17rem] lg:h-[18rem]';
const titleClassName = 'fill-slate-900 text-[14px] font-semibold';
const captionClassName = 'fill-slate-500 text-[12px]';
const metaClassName = 'fill-sky-700 text-[11px] font-medium tabular-nums';

const traceNodes = [
  { caption: 'Next.js · React', latency: '0 ms', title: 'Client', x: 40 },
  { caption: 'GraphQL · RBAC', latency: '+12 ms', title: 'API and access', x: 280 },
  { caption: 'BullMQ · Kafka', latency: '+31 ms', title: 'Queue', x: 520 },
  { caption: 'PostgreSQL · Mongo', latency: '+48 ms', title: 'Data', x: 760 },
  { caption: 'Datadog · audit log', latency: '142 ms p95', title: 'Monitoring', x: 1000 }
];
const traceNodeWidth = 190;
const traceY = 128;
const traceLength = 1230 + 80 + 118;

export function TraceBand({ dots = false }: { dots?: boolean }) {
  const reduced = !!useReducedMotion();
  const dot = (duration: number, delay: number) =>
    cycle(
      reduced,
      { cx: [0, 1180, 1230, 1230], cy: [traceY, traceY, traceY + 50, 288], opacity: [0, 1, 1, 0] },
      duration,
      [0, 0.83, 0.9, 1],
      { delay, ease: 'linear' }
    );

  return (
    <div className={bandClassName}>
      {dots ? (
        <DotField className="absolute inset-0 opacity-40" colorVar="--color-sky-400" />
      ) : null}
      <svg className="relative size-full" viewBox="0 0 1280 288">
        <path
          className="stroke-sky-200"
          d={`M 0 ${traceY} L 1180 ${traceY} Q 1230 ${traceY} 1230 ${traceY + 50} L 1230 288`}
          fill="none"
          strokeDasharray="4 5"
          strokeWidth="1.5"
        />
        {traceNodes.map((node, index) => {
          const hitAt = (node.x + traceNodeWidth / 2) / traceLength;

          return (
            <g key={node.title}>
              <rect
                className="fill-white stroke-slate-900/8"
                height="92"
                rx="14"
                width={traceNodeWidth}
                x={node.x}
                y={traceY - 46}
              />
              <motion.rect
                className="fill-sky-50 stroke-sky-400"
                height="92"
                opacity={reduced ? 0 : undefined}
                rx="14"
                strokeWidth="1.5"
                width={traceNodeWidth}
                x={node.x}
                y={traceY - 46}
                {...cycle(
                  reduced,
                  { opacity: [0, 0, 1, 0, 0] },
                  7,
                  [0, Math.max(hitAt * 0.83 - 0.04, 0), hitAt * 0.83 + 0.02, hitAt * 0.83 + 0.16, 1],
                  { ease: 'linear' }
                )}
              />
              <text className={titleClassName} x={node.x + 18} y={traceY - 14}>
                {node.title}
              </text>
              <text className={captionClassName} x={node.x + 18} y={traceY + 6}>
                {node.caption}
              </text>
              <text className={metaClassName} x={node.x + 18} y={traceY + 28}>
                {node.latency}
              </text>
              <text className="fill-slate-300 text-[11px]" x={node.x + traceNodeWidth - 26} y={traceY - 14}>
                {`0${index + 1}`}
              </text>
            </g>
          );
        })}
        {reduced ? null : (
          <>
            <motion.circle className="fill-sky-600" r="5" {...dot(7, 0)} />
            <motion.circle className="fill-sky-300" r="3.5" {...dot(9.4, 2.1)} />
            <motion.circle className="fill-violet-300" r="3.5" {...dot(11.3, 4.6)} />
          </>
        )}
        <text className={captionClassName} x="40" y="252">
          One request, traced from the interface to the dashboard that watches it.
        </text>
      </svg>
    </div>
  );
}

const mapNodes = {
  audit: { label: 'Audit log', x: 900, y: 56 },
  backoffice: { label: 'Backoffice', x: 130, y: 200 },
  datadog: { label: 'Datadog', x: 1150, y: 144 },
  gateway: { label: 'GraphQL API', x: 400, y: 144 },
  kafka: { label: 'Kafka', x: 650, y: 232 },
  mongo: { label: 'MongoDB', x: 900, y: 232 },
  postgres: { label: 'PostgreSQL', x: 900, y: 144 },
  queue: { label: 'BullMQ · Redis', x: 650, y: 144 },
  rbac: { label: 'RBAC · CASL', x: 650, y: 56 },
  web: { label: 'Next.js app', x: 130, y: 88 }
};
type MapNodeId = keyof typeof mapNodes;
const mapEdges: [MapNodeId, MapNodeId, number, number][] = [
  ['web', 'gateway', 3.1, 0],
  ['backoffice', 'gateway', 4.3, 1.2],
  ['gateway', 'rbac', 2.7, 0.6],
  ['gateway', 'queue', 3.7, 0.2],
  ['gateway', 'kafka', 4.9, 1.9],
  ['rbac', 'audit', 3.3, 1.1],
  ['queue', 'postgres', 2.9, 0.9],
  ['kafka', 'mongo', 4.1, 2.4],
  ['audit', 'datadog', 5.3, 0.4],
  ['postgres', 'datadog', 3.9, 1.6],
  ['mongo', 'datadog', 4.7, 2.8]
];

export function MapBand() {
  const reduced = !!useReducedMotion();
  const [hovered, setHovered] = useState<MapNodeId | null>(null);

  return (
    <div className={bandClassName}>
      <svg className="size-full" viewBox="0 0 1280 288">
        {mapEdges.map(([from, to, duration, delay]) => {
          const a = mapNodes[from];
          const b = mapNodes[to];
          const isLit = hovered === from || hovered === to;
          const isDim = hovered !== null && !isLit;

          return (
            <g key={`${from}-${to}`} className="transition-opacity duration-300" opacity={isDim ? 0.25 : 1}>
              <line
                className={isLit ? 'stroke-sky-500' : 'stroke-slate-200'}
                strokeWidth={isLit ? 2 : 1.25}
                x1={a.x}
                x2={b.x}
                y1={a.y}
                y2={b.y}
              />
              {reduced ? null : (
                <motion.circle
                  className="fill-sky-500"
                  r="3.5"
                  {...cycle(
                    reduced,
                    { cx: [a.x, b.x, b.x], cy: [a.y, b.y, b.y], opacity: [1, 1, 0] },
                    duration,
                    [0, 0.7, 1],
                    { delay, ease: 'linear' }
                  )}
                />
              )}
            </g>
          );
        })}
        {(Object.keys(mapNodes) as MapNodeId[]).map((id) => {
          const node = mapNodes[id];
          const isActive = hovered === id;

          return (
            <g
              key={id}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                className={`transition-colors duration-300 ${
                  isActive ? 'fill-sky-50 stroke-sky-400' : 'fill-white stroke-slate-900/10'
                }`}
                height="40"
                rx="20"
                width="150"
                x={node.x - 75}
                y={node.y - 20}
              />
              <circle className={isActive ? 'fill-sky-600' : 'fill-emerald-500'} cx={node.x - 55} cy={node.y} r="4" />
              <text className="fill-slate-800 text-[13px] font-medium" x={node.x - 42} y={node.y + 4.5}>
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const incidentNodes = [
  { title: 'API', x: 70 },
  { title: 'Queue', x: 330 },
  { title: 'Worker', x: 590 },
  { title: 'Ledger DB', x: 850 }
];
const incidentSeconds = 12;

export function IncidentBand() {
  const reduced = !!useReducedMotion();
  const phase = (opacity: number[], times: number[]) =>
    cycle(reduced, { opacity }, incidentSeconds, times, { ease: 'linear' });

  return (
    <div className={bandClassName}>
      <svg className="size-full" viewBox="0 0 1280 288">
        <line className="stroke-slate-200" strokeWidth="1.5" x1="70" x2="1030" y1="110" y2="110" />
        <motion.path
          className="stroke-amber-500"
          d="M 420 64 C 480 10 620 10 680 64"
          fill="none"
          opacity={0}
          strokeDasharray="5 5"
          strokeWidth="1.75"
          {...phase([0, 0, 1, 1, 0, 0], [0, 0.45, 0.5, 0.72, 0.78, 1])}
        />
        <motion.text
          className="fill-amber-700 text-[11px] font-medium"
          opacity={0}
          x="508"
          y="16"
          {...phase([0, 0, 1, 1, 0, 0], [0, 0.45, 0.5, 0.72, 0.78, 1])}
        >
          retry with backoff
        </motion.text>
        {incidentNodes.map((node) => (
          <g key={node.title}>
            <rect className="fill-white stroke-slate-900/10" height="92" rx="14" width="180" x={node.x} y="64" />
            {node.title === 'Worker' ? (
              <motion.rect
                className="fill-amber-50 stroke-amber-400"
                height="92"
                opacity={0}
                rx="14"
                strokeWidth="1.5"
                width="180"
                x={node.x}
                y="64"
                {...phase([0, 0, 1, 1, 0, 0], [0, 0.28, 0.33, 0.72, 0.8, 1])}
              />
            ) : null}
            <text className={titleClassName} x={node.x + 18} y="100">
              {node.title}
            </text>
            <circle className="fill-emerald-500" cx={node.x + 156} cy="95" r="4" />
            {node.title === 'Worker' ? (
              <motion.circle
                className="fill-amber-500"
                cx={node.x + 156}
                cy="95"
                opacity={0}
                r="4"
                {...phase([0, 0, 1, 1, 0, 0], [0, 0.28, 0.33, 0.72, 0.8, 1])}
              />
            ) : null}
          </g>
        ))}
        <text className={captionClassName} x="348" y="124">
          depth
        </text>
        <line className="stroke-slate-100" strokeLinecap="round" strokeWidth="8" x1="348" x2="492" y1="138" y2="138" />
        <motion.line
          className="stroke-sky-400"
          strokeLinecap="round"
          strokeWidth="8"
          x1="348"
          x2={372}
          y1="138"
          y2="138"
          {...cycle(
            reduced,
            { x2: [372, 372, 486, 486, 372, 372] },
            incidentSeconds,
            [0, 0.3, 0.5, 0.62, 0.8, 1]
          )}
        />
        {reduced ? null : (
          <motion.circle
            className="fill-sky-600"
            r="4.5"
            {...cycle(reduced, { cx: [70, 1030], cy: [110, 110] }, 3.4, [0, 1], { ease: 'linear' })}
          />
        )}

        <rect className="fill-slate-50 stroke-slate-900/6" height="200" rx="16" width="180" x="1070" y="44" />
        <text className={captionClassName} x="1090" y="76">
          Production
        </text>
        <motion.text className="fill-emerald-600 text-[22px] font-semibold" x="1090" y="112" {...phase([1, 1, 0, 0, 1, 1], [0, 0.3, 0.33, 0.78, 0.82, 1])}>
          healthy
        </motion.text>
        <motion.text
          className="fill-amber-600 text-[22px] font-semibold"
          opacity={0}
          x="1090"
          y="112"
          {...phase([0, 0, 1, 1, 0, 0], [0, 0.3, 0.33, 0.78, 0.82, 1])}
        >
          degraded
        </motion.text>
        <text className={captionClassName} x="1090" y="150">
          Error budget
        </text>
        <text className="fill-slate-900 text-[15px] font-medium tabular-nums" x="1090" y="172">
          99.97%
        </text>
        <motion.g opacity={0} {...phase([0, 0, 1, 1, 0, 0], [0, 0.36, 0.4, 0.7, 0.76, 1])}>
          <rect className="fill-amber-100" height="26" rx="13" width="140" x="1090" y="196" />
          <text className="fill-amber-800 text-[11.5px] font-medium" x="1104" y="213.5">
            on-call paged · 14 s
          </text>
        </motion.g>
        <text className={captionClassName} x="70" y="216">
          A worker slows, the queue absorbs it, on-call gets paged, retries drain the backlog.
        </text>
        <text className={captionClassName} x="70" y="236">
          Customers see nothing.
        </text>
      </svg>
    </div>
  );
}
