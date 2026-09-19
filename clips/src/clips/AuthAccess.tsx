import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { useSettle as useSettleAt } from "../components/loop";
import { Check, Cross, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * A new hire's first morning. HR records the joiner, the accounts create themselves,
 * one provider times out, and the retry finishes the job without making a second copy
 * of the account that already exists. The person on the left is the point: she can sign
 * in on day one, and the audit log says how it happened.
 */

/** Runs 18 s, longer than the default, so each account changes state on its own. */
export const AUTH_DURATION = 540;
const OUT = [516, 536] as const;
const useSettle = () => useSettleAt(OUT);

const MARGIN = 56;
const PROFILE = { left: MARGIN, top: 214, width: 420, height: 560 };
const ROWS = { left: 520, top: 286, width: 864, height: 136, gap: 26 };
const RESULT = { top: 800, height: 96 };

const beats = {
  start: [24, 150],
  fail: [150, 290],
  retry: [290, 424],
  done: [424, 516],
} as const;

const EVENT_AT = 40;
const RETRY_AT = 296;
const SKIPPED_AT = 310;
const DONE_AT = 432;

type Kind = "waiting" | "creating" | "failed" | "ready";

const providers: ReadonlyArray<{
  readonly name: string;
  readonly states: ReadonlyArray<{ readonly at: number; readonly kind: Kind }>;
}> = [
  {
    name: "JumpCloud",
    states: [
      { at: -1, kind: "waiting" },
      { at: 62, kind: "creating" },
      { at: 100, kind: "ready" },
    ],
  },
  {
    name: "Google Workspace",
    states: [
      { at: -1, kind: "waiting" },
      { at: 164, kind: "creating" },
      { at: 210, kind: "failed" },
      { at: 340, kind: "creating" },
      { at: 370, kind: "ready" },
    ],
  },
  {
    name: "Atlassian",
    states: [
      { at: -1, kind: "waiting" },
      { at: 384, kind: "creating" },
      { at: 412, kind: "ready" },
    ],
  },
];

const kindStyle: Record<
  Kind,
  { readonly bg: string; readonly ink: string; readonly text: string }
> = {
  creating: {
    bg: palette.violet100,
    ink: palette.violet700,
    text: "creating account",
  },
  failed: { bg: palette.rose100, ink: palette.rose600, text: "timed out" },
  ready: { bg: palette.emerald100, ink: palette.emerald800, text: "ready" },
  waiting: { bg: palette.zinc100, ink: palette.zinc500, text: "waiting" },
};

const Pill: React.FC<{
  readonly bg: string;
  readonly children: React.ReactNode;
  readonly ink: string;
}> = ({ bg, children, ink }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 20px",
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
      height={24}
      style={{ rotate: `${frame * 14}deg` }}
      viewBox="0 0 30 30"
      width={24}
    >
      <path
        d="M15 3 A12 12 0 1 1 3 15"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={4}
      />
    </svg>
  );
};

const ProviderRow: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const { name, states } = providers[index];
  const on = (at: number) =>
    at < 0 ? 1 : fade(frame, [at, at + 8], [0, 1]) * settle;
  const weights = states.map(
    (state, i) =>
      on(state.at) * (1 - (states[i + 1] ? on(states[i + 1].at) : 0)),
  );
  const weightOf = (kind: Kind) =>
    states.reduce(
      (sum, state, i) => sum + (state.kind === kind ? weights[i] : 0),
      0,
    );
  const ready = weightOf("ready");
  const skipped =
    index === 0
      ? fade(frame, [SKIPPED_AT, SKIPPED_AT + 10], [0, 1]) * settle
      : 0;
  const border = interpolateColors(
    weightOf("failed"),
    [0, 1],
    [
      interpolateColors(
        weightOf("creating"),
        [0, 1],
        [palette.violet200, palette.violet500],
      ),
      palette.rose400,
    ],
  );

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
        border: `2px solid ${border}`,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: uiFont,
      }}
    >
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
            [palette.violet100, palette.emerald500],
          ),
          fontFamily: displayFont,
          fontSize: 34,
          fontWeight: 600,
          color: palette.violet700,
        }}
      >
        <div style={{ position: "absolute", opacity: 1 - ready }}>
          {name[0]}
        </div>
        <div style={{ display: "flex", opacity: ready }}>
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
            opacity: 1 - ready,
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
            opacity: ready,
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
        }}
      >
        <Pill bg={palette.zinc100} ink={palette.zinc600}>
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
                opacity: weights[i],
              }}
            >
              <Pill bg={style.bg} ink={style.ink}>
                {state.kind === "creating" ? (
                  <Spinner color={style.ink} />
                ) : null}
                {state.kind === "failed" ? (
                  <Cross color={style.ink} size={22} />
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
  const settle = useSettle();
  const event = fade(frame, [EVENT_AT, EVENT_AT + 10], [0, 1]) * settle;
  const done = fade(frame, [DONE_AT, DONE_AT + 12], [0, 1]) * settle;
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
        border: `2px solid ${palette.violet200}`,
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
          backgroundColor: palette.violet200,
          fontFamily: displayFont,
          fontSize: 44,
          fontWeight: 600,
          color: palette.violet900,
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
              style={{ position: "absolute", right: 0, opacity: 1 - event }}
            >
              none yet
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                whiteSpace: "nowrap",
                fontWeight: 600,
                color: palette.violet700,
                opacity: event,
              }}
            >
              joiner, 08:02
            </span>
          </span>
        </div>
      </div>
      <div style={{ ...status, opacity: 1 - done }}>
        <Pill bg={palette.zinc100} ink={palette.zinc500}>
          cannot sign in yet
        </Pill>
      </div>
      <div style={{ ...status, opacity: done }}>
        <Pill bg={palette.emerald100} ink={palette.emerald800}>
          <Check color={palette.emerald800} size={24} />
          ready for day one
        </Pill>
      </div>
    </div>
  );
};

const Attempt: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const started = fade(frame, [EVENT_AT + 12, EVENT_AT + 22], [0, 1]) * settle;
  const retry = fade(frame, [RETRY_AT, RETRY_AT + 10], [0, 1]) * settle;
  const slot: React.CSSProperties = {
    position: "absolute",
    left: ROWS.left,
    top: PROFILE.top,
  };
  return (
    <>
      <div style={{ ...slot, opacity: started * (1 - retry) }}>
        <Pill bg={palette.violet900} ink="#ffffff">
          provisioning, attempt 1
        </Pill>
      </div>
      <div style={{ ...slot, opacity: retry }}>
        <Pill bg={palette.violet900} ink="#ffffff">
          automatic retry, same request key
        </Pill>
      </div>
    </>
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
        fontSize: 38,
        fontWeight: 500,
        color: palette.violet900,
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
  const settle = useSettle();
  const result = fade(frame, [DONE_AT + 10, DONE_AT + 24], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.violet100 }}>
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
            color: palette.violet950,
          }}
        >
          A new hire starts today
        </div>
        <div
          style={{ fontFamily: uiFont, fontSize: 28, color: palette.violet600 }}
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
            backgroundColor: palette.violet950,
            opacity: result,
            translate: `0px ${(1 - result) * 16}px`,
          }}
        >
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 28,
              color: palette.violet200,
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
            }}
          >
            2 attempts, 3 accounts, 0 duplicates
          </div>
        </div>

        <Caption
          range={beats.start}
          text="HR records the joiner. Her accounts start on their own."
        />
        <Caption range={beats.fail} text="One provider times out halfway." />
        <Caption
          range={beats.retry}
          text="The retry continues from the account that failed."
        />
        <Caption
          range={beats.done}
          text="Three accounts are ready before her first login."
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
