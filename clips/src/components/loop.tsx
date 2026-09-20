import { Easing, interpolate, useCurrentFrame } from "remotion";
import { handFont } from "../theme";
import { fade } from "./shapes";

/**
 * Every clip returns to its opening frame over this beat, two frames before the
 * end, so the last frame matches the first and the loop has no cut.
 */
export const OUT = [426, 446] as const;

/**
 * The rewind runs on an ease-in-out. The kit's ease-out puts most of the change
 * into the first few frames, which reads as a wipe rather than a rewind.
 */
export const reset = (
  frame: number,
  range: readonly [number, number],
  values: readonly [number, number],
) =>
  interpolate(frame, [range[0], range[1]], [values[0], values[1]], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** 1 while the story plays, 0 once the clip is back in its opening state. */
export const useSettle = (out: readonly [number, number] = OUT) =>
  reset(useCurrentFrame(), out, [1, 0]);

/** Frames the outgoing label of a swap gets to itself before the next one starts. */
export const LEAD = 6;

/**
 * One slot, one label. The outgoing string reaches zero on the frame the
 * incoming one starts, so no frame carries both.
 */
export const swapAt = (frame: number, at: number) =>
  [
    fade(frame, [at - LEAD, at], [1, 0]),
    fade(frame, [at, at + 8], [0, 1]),
  ] as const;

/** The same sequenced swap, run backwards inside a slot's settle window. */
export const settleSwap = (frame: number, range: readonly [number, number]) =>
  [
    reset(frame, [range[0], range[0] + LEAD], [1, 0]),
    reset(frame, [range[0] + LEAD, range[1]], [0, 1]),
  ] as const;

/** A pen stroke that draws itself. `length` is the path length in user units, measured by hand. */
export const DrawnPath: React.FC<{
  readonly color: string;
  readonly d: string;
  readonly from: number;
  readonly length: number;
  readonly to: number;
  readonly width?: number;
}> = ({ color, d, from, length, to, width = 4 }) => {
  const frame = useCurrentFrame();
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeDasharray={`${length} ${length}`}
      strokeDashoffset={(1 - fade(frame, [from, to], [0, 1])) * length}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={width}
    />
  );
};

/** One handwritten note per clip, for the single thing the viewer should not miss. */
export const Hand: React.FC<{
  readonly color: string;
  readonly from: number;
  readonly left: number;
  readonly rotate?: number;
  readonly size?: number;
  readonly text: string;
  readonly to: number;
  readonly top: number;
}> = ({ color, from, left, rotate = -4, size = 46, text, to, top }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        fontFamily: handFont,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "pre",
        color,
        rotate: `${rotate}deg`,
        opacity: fade(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0]),
      }}
    >
      {text}
    </div>
  );
};
