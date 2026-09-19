import { AbsoluteFill } from "remotion";
import { palette } from "../theme";

/**
 * Flat neutral field with a fine grid. The card carries no shadow, so the grid
 * and the card border separate it from the field.
 */
export const backdropTones = {
  sky: { field: palette.zinc100, line: palette.zinc200 },
  violet: { field: palette.zinc100, line: palette.zinc200 },
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
