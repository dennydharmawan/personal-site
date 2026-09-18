import { AbsoluteFill } from "remotion";
import { palette } from "../theme";

/**
 * Flat saturated field with a fine grid, the way Relume frames a product shot.
 * The card carries no shadow, so separation comes from this contrast instead.
 */
export const backdropTones = {
  sky: { field: palette.sky300, line: palette.sky200 },
  violet: { field: palette.violet300, line: palette.violet200 },
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
