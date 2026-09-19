import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { palette, uiFont } from "../theme";
import {
  buildFrame,
  buildSchedule,
  revealEase,
  topologyEdges,
  topologyNodes,
  trailChunkCount,
  type Layout,
  type Point,
  type Tone,
} from "./topology";

const toneColor: Record<Tone, string> = {
  amber: palette.amber500,
  green: palette.green600,
  rose: palette.rose600,
};

function polyline(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

/**
 * The diagram from `system-stage.tsx`, rendered per frame. The glow, trail blur and
 * pulse blur are the parts a rasterised video can afford that the live SVG could not.
 */
export const HeroTopology: React.FC<{ layout: Layout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const schedule = React.useMemo(() => buildSchedule(layout), [layout]);
  const scene = buildFrame(layout, schedule, (frame / fps) * 1000);
  const { dot } = layout.type;
  const [, , boxWidth, boxHeight] = layout.viewBox.split(" ").map(Number);
  const filterRegion = {
    filterUnits: "userSpaceOnUse",
    height: boxHeight,
    width: boxWidth,
    x: 0,
    y: 0,
  } as const;

  return (
    <svg
      width={width}
      height={height}
      viewBox={layout.viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ backgroundColor: "#ffffff", fontFamily: uiFont }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id="hero-arrowhead" markerHeight={6} markerWidth={6} orient="auto" refX={5.5} refY={3}>
          <path fill={palette.zinc300} d="M0 0 L6 3 L0 6 Z" />
        </marker>
        {/* User-space regions: a straight trail has a zero-height bbox, which would
            collapse a bbox-relative filter region and hide the element entirely. */}
        <filter id="hero-glow" {...filterRegion}>
          <feGaussianBlur stdDeviation={dot.radius * 0.9} />
        </filter>
        <filter id="hero-trail" {...filterRegion}>
          <feGaussianBlur stdDeviation={dot.radius * 0.35} />
        </filter>
        <filter id="hero-pulse" {...filterRegion}>
          <feGaussianBlur stdDeviation={dot.pulse * 0.45} />
        </filter>
      </defs>

      <rect x={0} y={0} width="100%" height="100%" fill="#ffffff" />

      {topologyEdges.map((edge) => {
        const label = layout.labels[edge.id];

        return (
          <g key={edge.id}>
            <polyline
              fill="none"
              stroke={palette.zinc300}
              strokeWidth={1.5}
              markerEnd="url(#hero-arrowhead)"
              points={polyline(layout.routes[edge.id])}
            />
            {edge.label && label ? (
              <text
                fill={palette.zinc500}
                fontSize={layout.type.edgeLabel}
                textAnchor={label.anchor}
                transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
                x={label.x}
                y={label.y}
              >
                {edge.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {scene.packets.map((packet) => {
        const color = toneColor[packet.tone];

        return (
          <g key={packet.key} opacity={packet.opacity}>
            {packet.trailChunks.length > 0 ? (
              <g filter="url(#hero-trail)">
                {packet.trailChunks.map((chunk, index) => {
                  const ratio = (index + 1) / trailChunkCount;
                  return (
                    <polyline
                      key={index}
                      fill="none"
                      stroke={color}
                      opacity={0.06 + 0.34 * ratio}
                      points={polyline(chunk)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={dot.radius * (0.6 + 0.9 * ratio)}
                    />
                  );
                })}
              </g>
            ) : null}
            <circle
              fill={color}
              cx={packet.point.x}
              cy={packet.point.y}
              opacity={0.22}
              r={dot.halo}
              filter="url(#hero-glow)"
            />
            <circle fill={color} cx={packet.point.x} cy={packet.point.y} r={dot.radius} />
          </g>
        );
      })}
      {topologyNodes.map((node) => {
        const center = layout.centers[node.id];
        const size = layout.sizes[node.id];
        const isSmall = node.id === "idempotency";

        return (
          <g key={node.id}>
            <rect
              fill="#ffffff"
              stroke={palette.zinc200}
              height={size.height}
              rx={10}
              width={size.width}
              x={center.x - size.width / 2}
              y={center.y - size.height / 2}
            />
            <text
              fill={palette.zinc800}
              fontSize={layout.type.label}
              fontWeight={500}
              textAnchor="middle"
              x={center.x}
              y={center.y + (isSmall ? layout.type.label * 0.35 : -layout.type.label * 0.25)}
            >
              {node.label}
            </text>
            {isSmall ? null : (
              <text
                fill={palette.zinc500}
                fontSize={layout.type.sublabel}
                textAnchor="middle"
                x={center.x}
                y={center.y + layout.type.sublabel * 1.2}
              >
                {node.sublabel}
              </text>
            )}
          </g>
        );
      })}

      {scene.rings.map((ring) => (
        <circle
          key={ring.key}
          fill="none"
          stroke={palette.green600}
          cx={ring.point.x}
          cy={ring.point.y}
          opacity={ring.opacity}
          r={ring.radius}
          strokeWidth={1.5}
        />
      ))}

      {scene.dots.map((point, index) => (
        <circle key={`dedupe-${index}`} fill={palette.zinc400} cx={point.x} cy={point.y} r={3} />
      ))}

      {scene.pulses.map((pulse) => {
        const center = layout.centers[pulse.node];
        const size = layout.sizes[pulse.node];
        const rect = {
          height: size.height,
          rx: 10,
          width: size.width,
          x: center.x - size.width / 2,
          y: center.y - size.height / 2,
        };

        return (
          <g key={pulse.key} opacity={1 - revealEase(pulse.progress)}>
            <rect
              {...rect}
              fill="none"
              stroke={toneColor[pulse.tone]}
              strokeWidth={layout.type.dot.pulse}
              filter="url(#hero-pulse)"
              opacity={0.55}
            />
            <rect
              {...rect}
              fill="none"
              stroke={toneColor[pulse.tone]}
              strokeWidth={layout.type.dot.pulse}
            />
          </g>
        );
      })}

    </svg>
  );
};
