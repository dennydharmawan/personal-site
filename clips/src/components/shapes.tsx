import { interpolate, interpolateColors } from "remotion";
import { useStoryFrame } from "../pace";
import { palette, uiFont } from "../theme";
import { ease, Tone, tones } from "./kit";

export const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const fade = (frame: number, range: number[], values: number[]) =>
  interpolate(frame, range, values, { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Blend between two states on a 0..1 progress, so a row tints in over the same beat its text fades. */
const blend = (progress: number, from: string, to: string) => interpolateColors(progress, [0, 1], [from, to]);

export const Check: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    <path d="M5 12.5 L9.5 17 L19 7" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} />
  </svg>
);

export const Cross: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    <path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" stroke={color} strokeLinecap="round" strokeWidth={2.6} />
  </svg>
);

export const Lock: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    <path
      d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5 M5.5 10.5 H18.5 V20 H5.5 Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.6}
    />
  </svg>
);

export const Dash: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    <path d="M6 12 L18 12" stroke={color} strokeLinecap="round" strokeWidth={2.6} />
  </svg>
);

/**
 * One beat of a clip. Acts share the card's body area and cross-fade, so the
 * card never resizes and only one idea is on screen at a time.
 */
export const CAPTION_BAND = 62;

export const Act: React.FC<{
  readonly caption: string;
  readonly children: React.ReactNode;
  readonly from: number;
  readonly to: number;
}> = ({ caption, children, from, to }) => {
  const frame = useStoryFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: fade(frame, [from, from + 11, to - 11, to], [0, 1, 1, 0]),
        translate: `0px ${fade(frame, [from, from + 13, to - 11, to], [12, 0, 0, -10])}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: CAPTION_BAND,
          fontFamily: uiFont,
          fontSize: 28,
          fontWeight: 600,
          color: palette.zinc500,
        }}
      >
        {caption}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAPTION_BAND,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Fixed-height body so cross-fading acts never move the card's edges. */
export const Stage: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "relative", marginTop: 38, height: 442 }}>{children}</div>
);


/**
 * The workhorse row: a named thing on the left and what happened to it on the
 * right. Agents, providers, findings and routes are all this shape.
 */
export const ResultRow: React.FC<{
  readonly detail?: string;
  readonly dropped?: boolean;
  readonly icon?: "check" | "cross" | "dash";
  readonly label: string;
  readonly pending?: string;
  readonly result: string;
  readonly start: number;
  readonly strike?: boolean;
  readonly tone: Tone;
}> = ({ detail, dropped = false, icon, label, pending = "running", result, start, strike, tone }) => {
  const mark = icon ?? (dropped ? "cross" : "check");
  const struck = strike ?? dropped;
  const frame = useStoryFrame();
  const done = fade(frame, [start, start + 11], [0, 1]);
  const lit = done > 0.5;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 26,
        padding: "20px 28px",
        borderRadius: 12,
        border: `1px solid ${blend(done, palette.zinc200, tones[tone].border)}`,
        backgroundColor: blend(done, palette.zinc50, tones[tone].tint),
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 30,
            fontWeight: 600,
            color: dropped && lit ? palette.zinc400 : palette.zinc900,
            textDecoration: struck && lit ? "line-through" : "none",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        {detail ? (
          <div
            style={{
              marginTop: 6,
              fontFamily: mono,
              fontSize: 24,
              color: palette.zinc500,
              whiteSpace: "nowrap",
            }}
          >
            {detail}
          </div>
        ) : null}
      </div>

      <div style={{ position: "relative", height: 38, flex: 1 }}>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 3,
            fontFamily: uiFont,
            fontSize: 27,
            fontWeight: 500,
            color: palette.zinc400,
            whiteSpace: "nowrap",
            opacity: fade(frame, [start, start + 8], [1, 0]),
          }}
        >
          {pending}
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            display: "flex",
            alignItems: "center",
            gap: 11,
            fontFamily: uiFont,
            fontSize: 28,
            fontWeight: 600,
            color: tones[tone].accent,
            whiteSpace: "nowrap",
            opacity: done,
          }}
        >
          {mark === "cross" ? <Cross color={tones[tone].accent} size={26} /> : null}
          {mark === "dash" ? <Dash color={tones[tone].accent} size={26} /> : null}
          {mark === "check" ? <Check color={tones[tone].accent} size={26} /> : null}
          {result}
        </div>
      </div>
    </div>
  );
};


/** Collections: one account waiting in a collector's queue. */
export const QueueRow: React.FC<{
  readonly amount: string;
  readonly cleared?: boolean;
  readonly clearedAt?: number;
  readonly account: string;
  readonly overdue: string;
  readonly selected?: boolean;
  readonly selectedAt?: number;
  readonly start: number;
}> = ({ amount, account, cleared = false, clearedAt = 0, overdue, selected = false, selectedAt = 0, start }) => {
  const frame = useStoryFrame();
  const picked = selected ? fade(frame, [selectedAt, selectedAt + 11], [0, 1]) : 0;
  const gone = cleared ? fade(frame, [clearedAt, clearedAt + 12], [0, 1]) : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 26,
        padding: "20px 28px",
        borderRadius: 12,
        border: `1px solid ${blend(picked, palette.zinc200, palette.amber500)}`,
        backgroundColor: blend(gone, blend(picked, "#ffffff", palette.amber50), palette.zinc50),
        opacity: fade(frame, [start, start + 10], [0, 1]),
      }}
    >
      <div
        style={{
          fontFamily: uiFont,
          fontSize: 30,
          fontWeight: 600,
          color: gone > 0.5 ? palette.zinc400 : palette.zinc900,
          textDecoration: gone > 0.5 ? "line-through" : "none",
          opacity: 1 - gone * 0.35,
        }}
      >
        {account}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: 1 - gone * 0.45 }}>
        <div style={{ fontFamily: uiFont, fontSize: 27, fontWeight: 500, color: blend(picked, palette.zinc500, palette.amber700) }}>
          {overdue}
        </div>
        <div style={{ fontFamily: mono, fontSize: 27, color: palette.zinc700, width: 210, textAlign: "right" }}>
          {amount}
        </div>
      </div>
    </div>
  );
};

/** Collections: the customer conversation the queue produces. */
export const Bubble: React.FC<{
  readonly incoming?: boolean;
  readonly start: number;
  readonly text: string;
}> = ({ incoming = false, start, text }) => {
  const frame = useStoryFrame();

  return (
    <div
      style={{
        alignSelf: incoming ? "flex-start" : "flex-end",
        maxWidth: 720,
        padding: "20px 26px",
        borderRadius: 18,
        borderBottomRightRadius: incoming ? 18 : 5,
        borderBottomLeftRadius: incoming ? 5 : 18,
        backgroundColor: incoming ? "#ffffff" : palette.emerald50,
        border: `1px solid ${incoming ? palette.zinc200 : palette.emerald200}`,
        fontFamily: uiFont,
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.34,
        color: palette.zinc700,
        opacity: fade(frame, [start, start + 11], [0, 1]),
        translate: `0px ${fade(frame, [start, start + 13], [12, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

/**
 * Payments: a lane of states advancing on its own clock. Two of these side by
 * side is the whole argument — the storefront never waits on the processor.
 */
export const Lane: React.FC<{
  readonly label: string;
  readonly states: readonly { label: string; start: number }[];
  readonly tone: Tone;
}> = ({ label, states, tone }) => {
  const frame = useStoryFrame();
  const first = states[0].start;
  const last = states[states.length - 1].start;

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          fontFamily: uiFont,
          fontSize: 25,
          fontWeight: 600,
          color: tones[tone].accent,
        }}
      >
        {label}
      </div>
      <div style={{ position: "relative", height: 78 }}>
        <div style={{ position: "absolute", left: 90, right: 90, top: 15, height: 3, backgroundColor: palette.zinc200 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 3,
              backgroundColor: tones[tone].accent,
              width: `${fade(frame, [first, last + 9], [0, 100])}%`,
            }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between" }}>
          {states.map((state) => {
            const reached = fade(frame, [state.start, state.start + 10], [0, 1]);
            const on = reached > 0.5;

            return (
              <div key={state.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 180 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: blend(reached, "#ffffff", tones[tone].accent),
                    border: `3px solid ${blend(reached, palette.zinc300, tones[tone].accent)}`,
                  }}
                />
                <div
                  style={{
                    marginTop: 16,
                    fontFamily: mono,
                    fontSize: 25,
                    fontWeight: on ? 600 : 400,
                    color: blend(reached, palette.zinc400, palette.zinc900),
                    whiteSpace: "nowrap",
                  }}
                >
                  {state.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
