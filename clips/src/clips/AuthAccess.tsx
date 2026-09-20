import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { Check, Cross, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * A new hire's first morning. HR records the new hire, the accounts create themselves,
 * one provider times out, and the retry finishes the job without making a second copy
 * of the account that already exists. The person on the left is the point: she can sign
 * in on day one, and the audit log says how it happened.
 */

/** Runs 18 s, longer than the default, so each account changes state on its own. */
export const AUTH_DURATION = 540;
// The return to the opening state is staggered so each slot swaps on its own
// frames instead of every crossfade landing at once. All end by 536 so the
// last frames match frame 0.
const SETTLE = {
  overlay: [510, 522],
  row: (index: number) => [512 + 4 * index, 526 + 4 * index] as const,
  profile: [520, 536],
} as const;

/**
 * The reset runs on an ease-in-out. The shared ease-out put 89% of the change
 * into its first five frames, which read as a wipe rather than a rewind.
 */
const reset = (
  frame: number,
  range: readonly [number, number],
  values: readonly [number, number],
) =>
  interpolate(frame, [range[0], range[1]], [values[0], values[1]], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const useSettle = (range: readonly [number, number]) =>
  reset(useCurrentFrame(), range, [1, 0]);

/** Frames the outgoing label of a swap gets to itself before the next one starts. */
const LEAD = 6;

/**
 * One slot, one label. The outgoing string reaches zero on the frame the
 * incoming one starts, so no frame carries both.
 */
const swapAt = (frame: number, at: number) =>
  [
    fade(frame, [at - LEAD, at], [1, 0]),
    fade(frame, [at, at + 8], [0, 1]),
  ] as const;

/** The same sequenced swap, run backwards inside a slot's settle window. */
const settleSwap = (frame: number, range: readonly [number, number]) =>
  [
    reset(frame, [range[0], range[0] + LEAD], [1, 0]),
    reset(frame, [range[0] + LEAD, range[1]], [0, 1]),
  ] as const;

const MARGIN = 56;
const PROFILE = { left: MARGIN, top: 214, width: 420, height: 560 };
const ROWS = { left: 520, top: 286, width: 864, height: 136, gap: 26 };
const RESULT = { top: 800, height: 96 };

const beats = {
  fail: [0, 130],
  retry: [130, 256],
  resume: [256, 382],
  done: [382, 510],
} as const;

const EVENT_AT = 10;
const ATTEMPT_AT = 14;
const FAIL_AT = 58;
const PROFILE_FAIL_AT = 62;
const RETRY_AT = 136;
// The retry beat's claim is "skips accounts already created", so the retry has
// to be seen reaching the directory row and turning away: its accent re-runs
// there, leaves, and the skip note lands in the gap it left.
const SCAN_AT = 168;
const SKIPPED_AT = 190;
// The person resolves as the last account lands, not 40 frames later.
const DONE_AT = 350;
const RESULT_AT = 396;
const ENTRY_AT = 440;

type Kind = "waiting" | "creating" | "failed" | "ready";

const providers: ReadonlyArray<{
  readonly name: string;
  readonly states: ReadonlyArray<{ readonly at: number; readonly kind: Kind }>;
}> = [
  {
    name: "Directory",
    states: [
      { at: -1, kind: "waiting" },
      { at: 18, kind: "creating" },
      { at: 36, kind: "ready" },
    ],
  },
  {
    name: "Email & docs",
    states: [
      { at: -1, kind: "waiting" },
      { at: 40, kind: "creating" },
      { at: FAIL_AT, kind: "failed" },
      { at: 262, kind: "creating" },
      { at: 292, kind: "ready" },
    ],
  },
  {
    name: "Issue tracker",
    states: [
      { at: -1, kind: "waiting" },
      { at: 304, kind: "creating" },
      { at: 340, kind: "ready" },
    ],
  },
];

const kindStyle: Record<
  Kind,
  {
    readonly bg: string;
    readonly ink: string;
    readonly line: string;
    readonly text: string;
  }
> = {
  creating: {
    bg: palette.indigo100,
    ink: palette.indigo800,
    line: palette.indigo100,
    text: "creating account",
  },
  failed: {
    bg: palette.rose50,
    ink: palette.rose700,
    line: palette.rose200,
    text: "timed out",
  },
  ready: {
    bg: palette.zinc100,
    ink: palette.zinc700,
    line: palette.zinc100,
    text: "ready",
  },
  waiting: {
    bg: palette.amber50,
    ink: palette.amber700,
    line: palette.amber200,
    text: "waiting",
  },
};

const Pill: React.FC<{
  readonly bg: string;
  readonly children: React.ReactNode;
  readonly ink: string;
  readonly line?: string;
}> = ({ bg, children, ink, line = bg }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "7px 18px",
      border: `2px solid ${line}`,
      borderRadius: 999,
      whiteSpace: "nowrap",
      backgroundColor: bg,
      fontFamily: uiFont,
      fontSize: 26,
      fontWeight: 600,
      color: ink,
    }}
  >
    {children}
  </div>
);

const Spinner: React.FC<{ readonly color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      height={28}
      style={{ rotate: `${frame * 14}deg` }}
      viewBox="0 0 30 30"
      width={28}
    >
      <path
        d="M15 3 A12 12 0 1 1 3 15"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={4.5}
      />
    </svg>
  );
};

const ProviderRow: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettle(SETTLE.row(index));
  const overlay = useSettle(SETTLE.overlay);
  const [settleOut, settleIn] = settleSwap(frame, SETTLE.row(index));
  const { name, states } = providers[index];
  const on = (at: number) => (at < 0 ? 1 : swapAt(frame, at)[1]);
  const off = (at: number) => swapAt(frame, at)[0];
  // Tints cross-fade, so a row changes colour without a gap. Settle blends the
  // whole row straight back to "waiting" instead of replaying the states.
  const weights = states.map(
    (state, i) =>
      on(state.at) * (1 - (states[i + 1] ? on(states[i + 1].at) : 0)) * settle +
      (i === 0 ? 1 - settle : 0),
  );
  // Labels do not cross-fade: each pill is gone before the next one inks.
  const pillWeights = states.map(
    (state, i) =>
      on(state.at) * (states[i + 1] ? off(states[i + 1].at) : 1) * settleOut +
      (i === 0 ? settleIn : 0),
  );
  const weightOf = (kind: Kind) =>
    states.reduce(
      (sum, state, i) => sum + (state.kind === kind ? weights[i] : 0),
      0,
    );
  const ready = weightOf("ready");
  const failed = weightOf("failed");
  // Every provider ends ready, and that is the frame its slots swap on.
  const [leaveWaiting, enterHandle] = swapAt(
    frame,
    states[states.length - 1].at,
  );
  const waitingInk = leaveWaiting + settleIn;
  const handleInk = enterHandle * settleOut;
  const arriving =
    index === 0
      ? fade(
          frame,
          [SCAN_AT, SCAN_AT + 8, SCAN_AT + 18, SCAN_AT + 26],
          [0, 1, 1, 0],
        ) * overlay
      : 0;
  const skippedIn =
    index === 0 ? fade(frame, [SKIPPED_AT, SKIPPED_AT + 10], [0, 1]) : 0;
  const skipped = skippedIn * overlay;

  return (
    <div
      style={{
        position: "absolute",
        left: ROWS.left,
        top: ROWS.top + index * (ROWS.height + ROWS.gap),
        width: ROWS.width,
        height: ROWS.height,
        boxSizing: "border-box",
        padding: "0 32px",
        borderRadius: 24,
        border: `2px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: uiFont,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 24,
          border: `4px solid ${interpolateColors(failed, [0, 1], [palette.indigo700, palette.rose600])}`,
          opacity: Math.min(1, weightOf("creating") + failed + arriving),
        }}
      />
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: interpolateColors(
            ready,
            [0, 1],
            [palette.indigo100, palette.emerald600],
          ),
          fontFamily: displayFont,
          fontSize: 34,
          fontWeight: 600,
          color: palette.indigo800,
        }}
      >
        <div style={{ position: "absolute", opacity: waitingInk }}>
          {name[0]}
        </div>
        <div style={{ display: "flex", opacity: handleInk }}>
          <Check color="#ffffff" size={36} />
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, height: 84 }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            whiteSpace: "nowrap",
            color: palette.zinc900,
          }}
        >
          {name}
        </div>
        <div
          style={{
            position: "absolute",
            top: 48,
            whiteSpace: "nowrap",
            fontSize: 24,
            color: palette.zinc500,
            opacity: waitingInk,
          }}
        >
          no account yet
        </div>
        <div
          style={{
            position: "absolute",
            top: 48,
            whiteSpace: "nowrap",
            fontFamily: codeFont,
            fontSize: 24,
            color: palette.zinc600,
            opacity: handleInk,
          }}
        >
          m.santoso
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 40,
          opacity: skipped,
          translate: `${(1 - skippedIn) * -18}px 0px`,
        }}
      >
        <Pill bg={palette.indigo100} ink={palette.indigo800}>
          already exists, skipped
        </Pill>
      </div>
      <div style={{ position: "relative", width: 270, height: 50 }}>
        {states.map((state, i) => {
          const style = kindStyle[state.kind];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                opacity: pillWeights[i],
              }}
            >
              <Pill bg={style.bg} ink={style.ink} line={style.line}>
                {state.kind === "waiting" ? (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: palette.amber500,
                    }}
                  />
                ) : null}
                {state.kind === "creating" ? (
                  <Spinner color={palette.indigo700} />
                ) : null}
                {state.kind === "failed" ? (
                  <Cross color={palette.rose600} size={22} />
                ) : null}
                {style.text}
              </Pill>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const frame = useCurrentFrame();
  const [settleOut, settleIn] = settleSwap(frame, SETTLE.profile);
  const [noRecord, record] = swapAt(frame, EVENT_AT);
  const [blocked, done] = swapAt(frame, DONE_AT);
  const failed =
    fade(frame, [PROFILE_FAIL_AT, PROFILE_FAIL_AT + 10], [0, 1]) *
    fade(frame, [DONE_AT, DONE_AT + 12], [1, 0]);
  const field: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 26,
    color: palette.zinc500,
  };
  const status: React.CSSProperties = {
    position: "absolute",
    left: 36,
    bottom: 36,
  };

  return (
    <div
      style={{
        position: "absolute",
        ...PROFILE,
        boxSizing: "border-box",
        padding: 36,
        borderRadius: 28,
        border: `2px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        fontFamily: uiFont,
      }}
    >
      <div
        style={{
          width: 112,
          height: 112,
          borderRadius: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.indigo100,
          fontFamily: displayFont,
          fontSize: 44,
          fontWeight: 600,
          color: palette.indigo800,
        }}
      >
        MS
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: displayFont,
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: palette.zinc900,
        }}
      >
        Maya Santoso
      </div>
      <div style={{ marginTop: 4, fontSize: 27, color: palette.zinc600 }}>
        Software engineer
      </div>
      <div
        style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: `1px solid ${palette.zinc200}`,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={field}>
          <span>Team</span>
          <span style={{ color: palette.zinc900 }}>Engineering</span>
        </div>
        <div style={field}>
          <span>HR record</span>
          <span style={{ position: "relative", width: 200, height: 34 }}>
            <span
              style={{
                position: "absolute",
                right: 0,
                opacity: noRecord + settleIn,
              }}
            >
              none yet
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                whiteSpace: "nowrap",
                fontWeight: 600,
                color: palette.indigo800,
                opacity: record * settleOut,
              }}
            >
              new hire, 08:02
            </span>
          </span>
        </div>
      </div>
      <div style={{ ...status, opacity: blocked + settleIn }}>
        <Pill
          bg={interpolateColors(
            failed,
            [0, 1],
            [palette.zinc100, palette.rose50],
          )}
          ink={interpolateColors(
            failed,
            [0, 1],
            [palette.zinc700, palette.rose700],
          )}
          line={interpolateColors(
            failed,
            [0, 1],
            [palette.zinc100, palette.rose200],
          )}
        >
          cannot sign in yet
        </Pill>
      </div>
      <div style={{ ...status, opacity: done * settleOut }}>
        <Pill bg={palette.zinc100} ink={palette.zinc700}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.emerald600,
            }}
          >
            <Check color="#ffffff" size={24} />
          </div>
          ready for day one
        </Pill>
      </div>
    </div>
  );
};

const Attempt: React.FC = () => {
  const frame = useCurrentFrame();
  const started = fade(frame, [ATTEMPT_AT, ATTEMPT_AT + 10], [0, 1]);
  const [first, second] = swapAt(frame, RETRY_AT);
  const label: React.CSSProperties = { gridArea: "1 / 1" };
  // Both labels share one grid cell, so the pill keeps the wider label's
  // footprint while the sequenced swap hands the cell from one to the other.
  return (
    <div
      style={{
        position: "absolute",
        left: ROWS.left,
        top: PROFILE.top,
        opacity: started,
      }}
    >
      <Pill bg={palette.indigo700} ink="#ffffff">
        <div style={{ display: "grid" }}>
          <span style={{ ...label, opacity: first }}>
            provisioning, attempt 1
          </span>
          <span style={{ ...label, opacity: second }}>retry, attempt 2</span>
        </div>
      </Pill>
    </div>
  );
};

const Caption: React.FC<{
  readonly range: readonly [number, number];
  readonly text: string;
}> = ({ range, text }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: MARGIN,
        top: 124,
        fontFamily: uiFont,
        fontSize: 44,
        fontWeight: 500,
        whiteSpace: "nowrap",
        color: palette.zinc700,
        opacity: fade(
          frame,
          [range[0], range[0] + 12, range[1] - 12, range[1]],
          [0, 1, 1, 0],
        ),
        translate: `0px ${fade(frame, [range[0], range[0] + 14], [10, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

export const AuthAccess: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle(SETTLE.overlay);
  // The log opens first and the line lands after it, so the closing beat keeps
  // changing instead of holding one frame for three seconds.
  const result = fade(frame, [RESULT_AT, RESULT_AT + 14], [0, 1]);
  const entry = fade(frame, [ENTRY_AT, ENTRY_AT + 14], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.indigo50 }}>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 48,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: "-0.022em",
            color: palette.zinc900,
          }}
        >
          A new hire starts today
        </div>
        <div
          style={{ fontFamily: uiFont, fontSize: 28, color: palette.indigo800 }}
        >
          accounts created from the HR record
        </div>
      </div>

      <Profile />
      {providers.map((_, index) => (
        <ProviderRow index={index} key={index} />
      ))}

      <AbsoluteFill style={{ opacity: settle }}>
        <Attempt />
        <div
          style={{
            position: "absolute",
            left: MARGIN,
            right: MARGIN,
            top: RESULT.top,
            height: RESULT.height,
            boxSizing: "border-box",
            padding: "0 36px",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: palette.zinc700,
            opacity: result,
            translate: `0px ${(1 - result) * 16}px`,
          }}
        >
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 28,
              color: palette.zinc300,
            }}
          >
            Audit log
          </div>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 36,
              fontWeight: 600,
              color: "#ffffff",
              opacity: entry,
              translate: `0px ${(1 - entry) * 8}px`,
            }}
          >
            m.santoso: 3 accounts, 0 duplicates
          </div>
        </div>

        <Caption range={beats.fail} text="A new hire's setup fails halfway." />
        <Caption
          range={beats.retry}
          text="The retry skips accounts already created."
        />
        <Caption
          range={beats.resume}
          text="Setup resumes at the failed step."
        />
        <Caption range={beats.done} text="Ready on day one. No duplicates." />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
