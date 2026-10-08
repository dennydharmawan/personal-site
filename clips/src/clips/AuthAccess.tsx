import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Check, Cross, Lock, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * A new hire's accounts across eight tools, triggered by her Zoho People record.
 * Attempt 1 times out at Confluence. Attempt 2 runs the same job marker quickly
 * past the three accounts that already exist, slows into Confluence, and finishes,
 * so the counter never counts an account twice. The tool set is sample data.
 *
 * The site's chapter buttons seek to 0, 4 and 9 s. Each of those frames is a hard
 * state swap, so a seek always lands on a fully drawn state, never mid-fade.
 */
export const AUTH_DURATION = 390;

const CHAPTER = { retry: 120, ready: 270 } as const;
const FAIL_AT = 84;
const RESUME_AT = 160;
const MARKER_OUT = 276;
// The stage leaves left on an ease-in and the fresh one arrives from the right on an
// ease-out at about the same speed, settling by 388 so the last frames match frame 0.
const SEAM = { exit: [340, 362], enter: [362, 388] } as const;
const PUSH = 1520;

const MARGIN = 64;
const CARD = { left: MARGIN, top: MARGIN, width: 480, height: 720, pad: 40 };
const GRID = { left: 576, top: MARGIN, colGap: 24, rowGap: 20, width: 388, height: 165 };
const LOG = { left: MARGIN, top: 816, width: 1440 - 2 * MARGIN, height: 80 };
const PILL = {
  left: CARD.left + CARD.pad,
  top: CARD.top + CARD.height - CARD.pad - 88,
  width: CARD.width - 2 * CARD.pad,
  height: 88,
};

type Rect = { left: number; top: number; width: number; height: number };

const tileRect = (index: number): Rect => ({
  left: GRID.left + (index % 2) * (GRID.width + GRID.colGap),
  top: GRID.top + Math.floor(index / 2) * (GRID.height + GRID.rowGap),
  width: GRID.width,
  height: GRID.height,
});

type Tool = {
  readonly name: string;
  /** Single-colour brand mark in `public/logos`. */
  readonly logo: string;
  /** Frames the job marker spends working on this tool, as [from, done). */
  readonly work: ReadonlyArray<readonly [number, number]>;
  readonly skippedAt?: number;
};

const FAILING = 3;

const tools: ReadonlyArray<Tool> = [
  { name: "JumpCloud", logo: "jumpcloud", work: [[10, 20]], skippedAt: 122 },
  { name: "Zoho Mail", logo: "zoho", work: [[26, 34]], skippedAt: 132 },
  { name: "Slack", logo: "slack", work: [[40, 48]], skippedAt: 142 },
  { name: "Confluence", logo: "confluence", work: [[54, FAIL_AT], [RESUME_AT, 188]] },
  { name: "Jira", logo: "jira", work: [[194, 200]] },
  { name: "Bitbucket", logo: "bitbucket", work: [[206, 212]] },
  { name: "Datadog", logo: "datadog", work: [[218, 224]] },
  { name: "Tailscale", logo: "tailscale", work: [[230, 236]] },
];

const doneAt = (tool: Tool) => tool.work[tool.work.length - 1][1];

const countAt = (frame: number) =>
  tools.filter((tool) => frame >= doneAt(tool)).length;

/** Where the job marker sits. Each move runs [from, to] toward a target rect. */
const markerMoves: ReadonlyArray<{ from: number; to: number; target: Rect }> = [
  { from: 20, to: 26, target: tileRect(1) },
  { from: 34, to: 40, target: tileRect(2) },
  { from: 48, to: 54, target: tileRect(3) },
  // Attempt 2 starts back at the first tool, on the chapter frame.
  { from: CHAPTER.retry, to: CHAPTER.retry, target: tileRect(0) },
  { from: 126, to: 130, target: tileRect(1) },
  { from: 136, to: 140, target: tileRect(2) },
  // The marker skims the existing accounts, then slows into the one that failed.
  { from: 146, to: RESUME_AT, target: tileRect(3) },
  { from: 188, to: 194, target: tileRect(4) },
  { from: 200, to: 206, target: tileRect(5) },
  { from: 212, to: 218, target: tileRect(6) },
  { from: 224, to: 230, target: tileRect(7) },
  { from: 240, to: 258, target: PILL },
];

const move = Easing.bezier(0.45, 0, 0.2, 1);

const markerRect = (frame: number): Rect => {
  let rect = tileRect(0);
  for (const step of markerMoves) {
    if (frame < step.from) break;
    const progress =
      step.to === step.from
        ? 1
        : interpolate(frame, [step.from, step.to], [0, 1], {
            easing: move,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
    rect = {
      left: rect.left + (step.target.left - rect.left) * progress,
      top: rect.top + (step.target.top - rect.top) * progress,
      width: rect.width + (step.target.width - rect.width) * progress,
      height: rect.height + (step.target.height - rect.height) * progress,
    };
  }
  return rect;
};

const markerOpacity = (frame: number) => {
  if (frame < 10 || frame >= MARKER_OUT) return 0;
  if (frame < CHAPTER.retry) return fade(frame, [FAIL_AT, FAIL_AT + 3], [1, 0]);
  return fade(frame, [CHAPTER.ready, MARKER_OUT], [1, 0]);
};

const Marker: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const rect = markerRect(frame);
  const outset = 8;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - outset,
        top: rect.top - outset,
        width: rect.width + 2 * outset,
        height: rect.height + 2 * outset,
        boxSizing: "border-box",
        borderRadius: Math.min(32, (rect.height + 2 * outset) / 2),
        border: `5px solid ${palette.sky500}`,
        opacity: markerOpacity(frame),
      }}
    />
  );
};

const Tile: React.FC<{ readonly frame: number; readonly index: number }> = ({ frame, index }) => {
  const tool = tools[index];
  const rect = tileRect(index);
  const isFailing = index === FAILING;
  // Each state is a 0..1 weight so colours cross-fade over a few frames.
  const working = tool.work.reduce(
    (sum, [from, to]) => sum + fade(frame, [from, from + 3, to, to + 3], [0, 1, 1, 0]),
    0,
  );
  const done = fade(frame, [doneAt(tool), doneAt(tool) + 4], [0, 1]);
  const failed = isFailing ? fade(frame, [FAIL_AT, FAIL_AT + 3, RESUME_AT, RESUME_AT + 3], [0, 1, 1, 0]) : 0;
  const skipped = tool.skippedAt === undefined ? 0 : fade(frame, [tool.skippedAt, tool.skippedAt + 5], [0, 1]);
  const tag = Math.max(failed, skipped);
  // The logo stays grey until the job reaches its tool, so colour reads as "touched".
  const lit = Math.min(1, working + done + failed);
  const mix = (weights: ReadonlyArray<readonly [number, string]>, base: string) =>
    weights.reduce((color, [weight, to]) => interpolateColors(weight, [0, 1], [color, to]), base);
  const tileBg = mix(
    [
      [done, palette.emerald50],
      [failed, palette.rose50],
    ],
    "#ffffff",
  );
  const tileLine = mix(
    [
      [done, palette.emerald200],
      [failed, palette.rose600],
    ],
    palette.zinc200,
  );

  return (
    <div
      style={{
        position: "absolute",
        ...rect,
        boxSizing: "border-box",
        borderRadius: 24,
        backgroundColor: tileBg,
        border: `${2 + 2 * failed}px solid ${tileLine}`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: 88,
          height: 88,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          border: `2px solid ${palette.zinc200}`,
        }}
      >
        <Img
          src={staticFile(`logos/${tool.logo}.svg`)}
          style={{
            width: 64,
            height: 52,
            objectFit: "contain",
            filter: `grayscale(${1 - lit})`,
            opacity: 0.35 + 0.65 * lit,
          }}
        />
        {working > 0 ? (
          <svg
            height={112}
            style={{ position: "absolute", left: -14, top: -14, rotate: `${frame * 14}deg`, opacity: working }}
            viewBox="0 0 112 112"
            width={112}
          >
            <path
              d="M56 4 A52 52 0 0 1 108 56"
              fill="none"
              stroke={palette.sky500}
              strokeLinecap="round"
              strokeWidth={6}
            />
          </svg>
        ) : null}
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: -12,
            width: 40,
            height: 40,
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isFailing && failed > 0 ? palette.rose600 : palette.emerald600,
            border: "3px solid #ffffff",
            opacity: Math.max(done, failed),
            scale: 0.6 + 0.4 * Math.max(done, failed),
          }}
        >
          {failed > 0 ? <Cross color="#ffffff" size={26} /> : <Check color="#ffffff" size={26} />}
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, height: 104 }}>
        <div
          style={{
            position: "absolute",
            top: 26 - 24 * tag,
            fontFamily: uiFont,
            fontSize: 42,
            fontWeight: 600,
            lineHeight: "52px",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            color: palette.zinc900,
          }}
        >
          {tool.name}
        </div>
        <div
          style={{
            position: "absolute",
            top: 56,
            fontFamily: uiFont,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: "48px",
            whiteSpace: "nowrap",
            color: isFailing ? palette.rose700 : palette.sky700,
            opacity: tag,
            translate: `0px ${(1 - tag) * 8}px`,
          }}
        >
          {isFailing ? "Timed out" : "Skipped"}
        </div>
      </div>
    </div>
  );
};

const Counter: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const count = countAt(frame);
  const changedAt = Math.max(...tools.map(doneAt).filter((at) => at <= frame), -1);
  const enter = count === 0 ? 1 : fade(frame, [changedAt, changedAt + 6], [0, 1]);
  return (
    <div style={{ position: "absolute", left: CARD.pad, top: 340 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: displayFont, fontWeight: 600 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 168,
            lineHeight: "168px",
            letterSpacing: "-0.04em",
            color: palette.zinc900,
            opacity: 0.4 + 0.6 * enter,
            translate: `0px ${(1 - enter) * 18}px`,
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: 80, color: palette.zinc300, letterSpacing: "-0.02em" }}>/8</span>
      </div>
      <div style={{ marginTop: 8, fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>accounts ready</div>
    </div>
  );
};

const StatusPill: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const failed = frame >= FAIL_AT ? fade(frame, [FAIL_AT, FAIL_AT + 4], [0, 1]) : 0;
  const ready = frame >= CHAPTER.ready;
  // The payoff lands on the chapter frame at full colour and settles from a slight swell.
  const swell = ready ? interpolate(frame, [CHAPTER.ready, CHAPTER.ready + 10], [1.06, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateRight: "clamp",
  }) : 1;
  const bg = ready ? palette.emerald600 : interpolateColors(failed, [0, 1], [palette.zinc100, palette.rose50]);
  const ink = ready ? "#ffffff" : interpolateColors(failed, [0, 1], [palette.zinc700, palette.rose700]);

  return (
    <div
      style={{
        position: "absolute",
        left: PILL.left - CARD.left,
        top: PILL.top - CARD.top,
        width: PILL.width,
        height: PILL.height,
        borderRadius: PILL.height / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: bg,
        scale: swell,
        fontFamily: uiFont,
        fontSize: 40,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: ink,
      }}
    >
      {ready ? <Check color="#ffffff" size={38} /> : <Lock color={ink} size={36} />}
      {ready ? "Ready on day one" : "Can't sign in yet"}
    </div>
  );
};

const Card: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      left: CARD.left,
      top: CARD.top,
      width: CARD.width,
      height: CARD.height,
      boxSizing: "border-box",
      borderRadius: 32,
      border: `2px solid ${palette.zinc200}`,
      backgroundColor: "#ffffff",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: CARD.pad,
        top: CARD.pad,
        width: 112,
        height: 112,
        borderRadius: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.sky100,
        fontFamily: displayFont,
        fontSize: 44,
        fontWeight: 600,
        color: palette.sky800,
      }}
    >
      MS
    </div>
    <div
      style={{
        position: "absolute",
        left: CARD.pad,
        top: 176,
        fontFamily: displayFont,
        fontSize: 56,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        color: palette.zinc900,
      }}
    >
      Maya Santoso
    </div>
    <div style={{ position: "absolute", left: CARD.pad, top: 250, fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>
      Starts today
    </div>
    <div
      style={{
        position: "absolute",
        left: CARD.pad,
        right: CARD.pad,
        top: 324,
        height: 2,
        backgroundColor: palette.zinc200,
      }}
    />
    <Counter frame={frame} />
    <StatusPill frame={frame} />
  </div>
);

const logLines: ReadonlyArray<{ at: number; text: string; dot: string }> = [
  { at: -Infinity, text: "Zoho People · new hire, 08:02", dot: palette.zinc500 },
  { at: 10, text: "Attempt 1 · creating 8 accounts", dot: palette.sky400 },
  { at: FAIL_AT, text: "Attempt 1 · Confluence timed out", dot: palette.rose500 },
  { at: CHAPTER.retry, text: "Attempt 2 · skip what exists", dot: palette.sky400 },
  { at: RESUME_AT, text: "Attempt 2 · resuming at Confluence", dot: palette.sky400 },
  { at: CHAPTER.ready, text: "Audit log · 8 created, 0 duplicates", dot: palette.emerald400 },
];

/** The job's own log. It never moves, so it carries the eye across the loop seam. */
const LogStrip: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const line = [...logLines].reverse().find((entry) => frame >= entry.at) ?? logLines[0];
  return (
    <div
      style={{
        position: "absolute",
        ...LOG,
        boxSizing: "border-box",
        borderRadius: 20,
        padding: "0 36px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        backgroundColor: palette.zinc900,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: line.dot }} />
      <div style={{ fontFamily: codeFont, fontSize: 40, color: palette.zinc100, whiteSpace: "nowrap" }}>
        {line.text}
      </div>
    </div>
  );
};

export const AuthAccess: React.FC = () => {
  const frame = useCurrentFrame();
  // After the stage leaves, the arriving copy plays the frames before 0: the opening state.
  const story = frame >= SEAM.enter[0] ? frame - AUTH_DURATION : frame;
  const shift =
    frame < SEAM.enter[0]
      ? interpolate(frame, [...SEAM.exit], [0, -PUSH], {
          easing: Easing.in(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [...SEAM.enter], [PUSH, 0], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.zinc50 }}>
      <AbsoluteFill style={{ translate: `${shift}px 0px` }}>
        <Card frame={story} />
        {tools.map((_, index) => (
          <Tile frame={story} index={index} key={index} />
        ))}
        <Marker frame={story} />
      </AbsoluteFill>
      <LogStrip frame={story} />
    </AbsoluteFill>
  );
};
