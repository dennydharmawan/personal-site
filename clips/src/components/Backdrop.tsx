import { AbsoluteFill } from "remotion";

/**
 * Flat saturated field with a fine grid, the way Relume frames a product shot.
 * The card carries no shadow, so separation comes from this contrast instead.
 */
export const backdropTones = {
  cyan: { field: "#7dd3fc", line: "#a9e4fd" },
  pink: { field: "#f5a3ef", line: "#fac3f6" },
} as const;

export type BackdropTone = keyof typeof backdropTones;

export const Backdrop: React.FC<{ readonly tone: BackdropTone }> = ({ tone }) => (
  <AbsoluteFill style={{ backgroundColor: backdropTones[tone].field }}>
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, ${backdropTones[tone].line} 0 2px, transparent 2px 46px), repeating-linear-gradient(90deg, ${backdropTones[tone].line} 0 2px, transparent 2px 46px)`,
      }}
    />
  </AbsoluteFill>
);
