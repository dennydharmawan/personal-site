import { useCurrentFrame } from "remotion";
import { handFont } from "../theme";
import { fade } from "./shapes";

/**
 * Every clip returns to its opening frame over this beat, two frames before the
 * end, so the last frame matches the first and the loop has no cut.
 */
export const OUT = [426, 446] as const;

/** 1 while the story plays, 0 once the clip is back in its opening state. */
export const useSettle = (out: readonly [number, number] = OUT) =>
  fade(useCurrentFrame(), [...out], [1, 0]);

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
