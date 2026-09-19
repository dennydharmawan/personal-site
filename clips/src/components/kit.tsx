import { Easing, Interactive, interpolate } from "remotion";
import { useStoryFrame } from "../pace";
import { palette, uiFont, displayFont } from "../theme";
import { timing } from "../timing";

/** Brief's easing: settles without overshoot. */
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export type Tone = "sky" | "emerald" | "amber" | "rose" | "zinc";

export const tones: Record<Tone, { accent: string; bar: string; border: string; tint: string }> = {
  amber: { accent: palette.amber700, bar: palette.amber500, border: palette.amber500, tint: palette.amber50 },
  emerald: { accent: palette.emerald600, bar: palette.emerald600, border: palette.emerald200, tint: palette.emerald50 },
  rose: { accent: palette.rose600, bar: palette.rose600, border: palette.rose100, tint: palette.rose50 },
  sky: { accent: palette.sky700, bar: palette.sky600, border: palette.sky200, tint: palette.sky50 },
  zinc: { accent: palette.zinc500, bar: palette.zinc400, border: palette.zinc200, tint: palette.zinc50 },
};

const fade = (frame: number, range: readonly number[], values: readonly number[]) =>
  interpolate(frame, range as number[], values as number[], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * The card shell. Sized for the site, where these clips render at roughly a
 * third of their native width inside `aspect-[3/2]` — everything is deliberately
 * oversized so the smallest label still resolves at that scale.
 */
export const ClipCard: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const frame = useStoryFrame();

  return (
    <Interactive.Div
      name="Card"
      style={{
        position: "relative",
        width: 1240,
        padding: 64,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        border: `1px solid ${palette.zinc200}`,
        boxShadow: "none",
        opacity: fade(frame, [timing.cardIn[0], timing.cardIn[1], timing.cardOut[0], timing.cardOut[1]], [0, 1, 1, 0]),
        scale: interpolate(frame, [0, 16], [0.985, 1], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        translate: `0px ${fade(frame, timing.cardIn, [16, 0])}px`,
      }}
    >
      {children}
    </Interactive.Div>
  );
};

/** Category tag in the card header. */
export const Chip: React.FC<{ readonly label: string; readonly tone: Tone }> = ({ label, tone }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "10px 20px",
      borderRadius: 8,
      backgroundColor: tones[tone].tint,
      border: `1px solid ${tones[tone].border}`,
      fontFamily: uiFont,
      fontSize: 24,
      fontWeight: 600,
      color: tones[tone].accent,
    }}
  >
    {label}
  </div>
);

export const CardTitle: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      marginTop: 30,
      fontFamily: displayFont,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: 1.16,
      letterSpacing: "-0.022em",
      color: palette.zinc900,
    }}
  >
    {children}
  </div>
);

export const CardSubject: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      marginTop: 16,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 30,
      color: palette.zinc500,
    }}
  >
    {children}
  </div>
);
