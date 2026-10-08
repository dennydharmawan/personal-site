import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Check, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * One QRIS payment. The customer's phone says paid and Midtrans says settled, but
 * the store's order hears nothing and waits. Midtrans's webhook lands on the order
 * and moves it to Paid on the same frame. Then the nightly check pairs every store
 * order with a Midtrans settlement, ending on the order from the story.
 *
 * The site's chapter buttons seek to 0, 4 and 7 s. Each of those frames is a hard
 * state swap, so a seek always lands on a fully drawn state, never mid-fade.
 */
export const ECOMMERCE_DURATION = 375;

const CHAPTER = { confirm: 120, check: 210 } as const;

const PRESS_AT = 12;
const PAY_FLIGHT = [16, 40] as const;
const SETTLED_AT = 40;
const PHONE_PAID_AT = 44;
const UNKNOWN_AT = 52;
const HOOK_FLIGHT = [CHAPTER.confirm + 2, 138] as const;
const CONFIRMED_AT = 138;
const ADVANCE = [138, 150] as const;
// Scene A leaves on an ease-in and the check arrives on an ease-out, settled on the chapter frame.
const SCENE_SWAP = { exit: [184, 198], enter: [198, CHAPTER.check] } as const;
const ROW_STARTS = [214, 232, 250, 268] as const;
const PAYOFF_AT = 294;
// The check leaves and scene A comes back in its opening state, settled two frames
// before the end so the last frames match frame 0.
const SEAM = { exit: [337, 355], enter: [355, 373] } as const;
const PUSH = 1520;

const MARGIN = 64;
const PHONE = { left: MARGIN, top: MARGIN, width: 440, height: 440, pad: 36 };
const PROVIDER = { left: 936, top: MARGIN, width: 440, height: 440, pad: 36 };
// The Pay button and Midtrans's status chip share one line, so the money flies straight across.
const ACTION = { top: 380, height: 88 };
const ACTION_Y = ACTION.top + ACTION.height / 2;
const PHONE_ACTION_X = PHONE.left + PHONE.width / 2;
const PROVIDER_ACTION_X = PROVIDER.left + PROVIDER.width / 2;
const ORDER = { left: MARGIN, top: 548, width: 1440 - 2 * MARGIN, height: 244, pad: 36 };
const STATUS = { left: 820, top: 568, width: 520, height: 68 };
const RAIL = { y: 690, stops: [224, 720, 1216] as const };
const LOG = { left: MARGIN, top: 816, width: 1440 - 2 * MARGIN, height: 80 };
const CHECK = { left: MARGIN, top: MARGIN, width: 1440 - 2 * MARGIN, height: 728, pad: 36 };
const ROWS = { top: 256, height: 108, gap: 18, left: 100, right: 860, width: 480 };
const PILL = { left: 1340 - 380, top: 92, width: 380, height: 80 };

const move = Easing.bezier(0.45, 0, 0.2, 1);
const step = (frame: number, range: readonly [number, number], from: number, to: number, easing = move) =>
  interpolate(frame, [...range], [from, to], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const QrIcon: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.2}
    viewBox="0 0 24 24"
    width={size}
  >
    <rect height="5" rx="1" width="5" x="3" y="3" />
    <rect height="5" rx="1" width="5" x="16" y="3" />
    <rect height="5" rx="1" width="5" x="3" y="16" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

const WebhookIcon: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.2}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
    <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
    <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
  </svg>
);

const Clock: React.FC<{ readonly color: string; readonly size: number }> = ({ color, size }) => (
  <svg
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2.4}
    viewBox="0 0 24 24"
    width={size}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const cardStyle: React.CSSProperties = {
  position: "absolute",
  boxSizing: "border-box",
  borderRadius: 32,
  border: `2px solid ${palette.zinc200}`,
  backgroundColor: "#ffffff",
};

/** A full-width pill on the action line. Its two states swap on one frame. */
const ActionChip: React.FC<{
  readonly done: boolean;
  readonly swell: number;
  readonly idle: React.ReactNode;
  readonly finished: React.ReactNode;
  readonly idleBg: string;
  readonly idleInk: string;
}> = ({ done, swell, idle, finished, idleBg, idleInk }) => (
  <div
    style={{
      position: "absolute",
      left: PHONE.pad,
      right: PHONE.pad,
      top: ACTION.top - PHONE.top,
      height: ACTION.height,
      borderRadius: ACTION.height / 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      backgroundColor: done ? palette.emerald600 : idleBg,
      color: done ? "#ffffff" : idleInk,
      scale: swell,
      fontFamily: uiFont,
      fontSize: 40,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {done ? finished : idle}
  </div>
);

const landing = (frame: number, at: number) =>
  frame >= at ? step(frame, [at, at + 10], 1.06, 1, Easing.out(Easing.exp)) : 1;

const Phone: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const paid = frame >= PHONE_PAID_AT;
  const pressed = frame >= PRESS_AT && frame < PHONE_PAID_AT ? step(frame, [PRESS_AT, PRESS_AT + 4], 1, 0.96) : 1;
  return (
    <div
      style={{
        ...cardStyle,
        ...PHONE,
        borderRadius: 56,
        border: `6px solid ${palette.zinc900}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PHONE.width / 2 - 66,
          top: 16,
          width: 120,
          height: 14,
          borderRadius: 7,
          backgroundColor: palette.zinc900,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PHONE.pad,
          top: 60,
          fontFamily: uiFont,
          fontSize: 40,
          fontWeight: 600,
          whiteSpace: "nowrap",
          color: palette.zinc900,
        }}
      >
        Kopi Nusantara
      </div>
      <div style={{ position: "absolute", left: PHONE.pad, top: 132, fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>
        Total
      </div>
      <div
        style={{
          position: "absolute",
          left: PHONE.pad,
          top: 182,
          fontFamily: displayFont,
          fontSize: 60,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          color: palette.zinc900,
        }}
      >
        Rp 185.000
      </div>
      <ActionChip
        done={paid}
        finished={
          <>
            <Check color="#ffffff" size={40} />
            Paid
          </>
        }
        idle={
          <>
            <QrIcon color="#ffffff" size={40} />
            Pay with QRIS
          </>
        }
        idleBg={palette.zinc900}
        idleInk="#ffffff"
        swell={paid ? landing(frame, PHONE_PAID_AT) : pressed}
      />
    </div>
  );
};

const Provider: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const settled = frame >= SETTLED_AT;
  return (
    <div style={{ ...cardStyle, ...PROVIDER }}>
      <Img
        src={staticFile("logos/midtrans.svg")}
        style={{ position: "absolute", left: PROVIDER.pad, top: 62, width: 268, height: 44 }}
      />
      <div style={{ position: "absolute", left: PROVIDER.pad, top: 132, fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>
        QRIS payment
      </div>
      <div
        style={{
          position: "absolute",
          left: PROVIDER.pad,
          top: 182,
          fontFamily: displayFont,
          fontSize: 60,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          color: palette.zinc900,
        }}
      >
        Rp 185.000
      </div>
      <ActionChip
        done={settled}
        finished={
          <>
            <Check color="#ffffff" size={40} />
            Settled
          </>
        }
        idle={
          <>
            <Clock color={palette.zinc600} size={38} />
            Waiting
          </>
        }
        idleBg={palette.zinc100}
        idleInk={palette.zinc700}
        swell={landing(frame, SETTLED_AT)}
      />
    </div>
  );
};

/** A sky token that flies between two centres and vanishes on the frame it lands. */
const Flight: React.FC<{
  readonly frame: number;
  readonly appear: number;
  readonly range: readonly [number, number];
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
  readonly children: React.ReactNode;
}> = ({ frame, appear, range, from, to, children }) => {
  if (frame < appear || frame >= range[1]) return null;
  const x = step(frame, range, from[0], to[0]);
  const y = step(frame, range, from[1], to[1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        height: 76,
        padding: "0 30px",
        borderRadius: 38,
        display: "flex",
        alignItems: "center",
        gap: 14,
        backgroundColor: palette.sky400,
        boxShadow: `0 0 0 6px ${palette.zinc50}`,
        whiteSpace: "nowrap",
        color: palette.zinc900,
      }}
    >
      {children}
    </div>
  );
};

const waitClock = (frame: number) => {
  // The wait runs as a time-lapse: about nine minutes pass while the store hears nothing.
  const seconds = Math.floor(step(frame, [UNKNOWN_AT, CONFIRMED_AT], 0, 572, (t) => t));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

const OrderStatus: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const unknown = frame >= UNKNOWN_AT && frame < CONFIRMED_AT;
  const confirmed = frame >= CONFIRMED_AT;
  const bg = confirmed ? palette.emerald600 : unknown ? palette.amber50 : palette.zinc100;
  const ink = confirmed ? "#ffffff" : unknown ? palette.amber700 : palette.zinc700;
  return (
    <div
      style={{
        position: "absolute",
        left: STATUS.left - ORDER.left,
        top: STATUS.top - ORDER.top,
        width: STATUS.width,
        height: STATUS.height,
        boxSizing: "border-box",
        borderRadius: STATUS.height / 2,
        border: `2px solid ${unknown ? palette.amber200 : bg}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        backgroundColor: bg,
        color: ink,
        scale: landing(frame, confirmed ? CONFIRMED_AT : UNKNOWN_AT),
        fontFamily: uiFont,
        fontSize: 40,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {confirmed ? (
        <>
          <Check color="#ffffff" size={40} />
          Confirmed by Midtrans
        </>
      ) : unknown ? (
        <>
          No confirmation
          <span style={{ fontFamily: codeFont, fontWeight: 400 }}>{waitClock(frame)}</span>
        </>
      ) : (
        <>
          <Clock color={palette.zinc600} size={38} />
          Waiting for payment
        </>
      )}
    </div>
  );
};

const stopLabels = ["Created", "Awaiting payment", "Paid"] as const;

const Rail: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const advance = step(frame, ADVANCE, 0, 1);
  const tokenX = RAIL.stops[1] + (RAIL.stops[2] - RAIL.stops[1]) * advance;
  const unknown = frame >= UNKNOWN_AT && frame < CONFIRMED_AT;
  const paid = frame >= CONFIRMED_AT;
  const ringColor = paid ? palette.emerald600 : unknown ? palette.amber500 : palette.sky500;
  const y = RAIL.y - ORDER.top;
  const doneDot = (x: number, key: string, size = 40) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left: x - ORDER.left - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.emerald600,
      }}
    >
      <Check color="#ffffff" size={size * 0.62} />
    </div>
  );
  const reached = (index: number) => index === 0 || (index === 1 ? true : advance >= 1);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: RAIL.stops[0] - ORDER.left,
          top: y - 4,
          width: RAIL.stops[2] - RAIL.stops[0],
          height: 8,
          borderRadius: 4,
          backgroundColor: palette.zinc200,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: RAIL.stops[0] - ORDER.left,
          top: y - 4,
          width: tokenX - RAIL.stops[0],
          height: 8,
          borderRadius: 4,
          backgroundColor: palette.emerald600,
        }}
      />
      {doneDot(RAIL.stops[0], "created")}
      {advance > 0 ? doneDot(RAIL.stops[1], "awaiting") : null}
      {advance < 1 ? (
        <div
          style={{
            position: "absolute",
            left: RAIL.stops[2] - ORDER.left - 14,
            top: y - 14,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: palette.zinc300,
          }}
        />
      ) : null}
      {/* The token: a ring that sits on the current stage and rides the rail when the stage changes. */}
      <div
        style={{
          position: "absolute",
          left: tokenX - ORDER.left - 34,
          top: y - 34,
          width: 68,
          height: 68,
          boxSizing: "border-box",
          borderRadius: 34,
          border: `6px solid ${ringColor}`,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {paid ? (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.emerald600,
            }}
          >
            <Check color="#ffffff" size={30} />
          </div>
        ) : unknown ? (
          <span style={{ fontFamily: displayFont, fontSize: 40, fontWeight: 600, lineHeight: "40px", color: palette.amber600 }}>?</span>
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: palette.sky500 }} />
        )}
      </div>
      {stopLabels.map((label, index) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: RAIL.stops[index] - ORDER.left,
            top: y + 40,
            translate: "-50% 0px",
            fontFamily: uiFont,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: "48px",
            whiteSpace: "nowrap",
            color: reached(index) ? palette.zinc900 : palette.zinc400,
          }}
        >
          {label}
        </div>
      ))}
    </>
  );
};

const Order: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <div style={{ ...cardStyle, ...ORDER }}>
    <div
      style={{
        position: "absolute",
        left: ORDER.pad,
        top: 20,
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontFamily: displayFont, fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em", color: palette.zinc900 }}>
        Order #20418
      </span>
      <span style={{ fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>store</span>
    </div>
    <OrderStatus frame={frame} />
    <Rail frame={frame} />
  </div>
);

const SceneA: React.FC<{ readonly frame: number }> = ({ frame }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: PHONE.left + PHONE.width,
        width: PROVIDER.left - PHONE.left - PHONE.width,
        top: ACTION_Y - 2,
        height: 0,
        borderTop: `4px dashed ${palette.zinc300}`,
      }}
    />
    <Phone frame={frame} />
    <Provider frame={frame} />
    <Order frame={frame} />
    <Flight
      appear={PRESS_AT + 2}
      frame={frame}
      from={[PHONE_ACTION_X, ACTION_Y]}
      range={PAY_FLIGHT}
      to={[PROVIDER_ACTION_X, ACTION_Y]}
    >
      <span style={{ fontFamily: displayFont, fontSize: 44, fontWeight: 600 }}>Rp 185.000</span>
    </Flight>
    <Flight
      appear={CHAPTER.confirm}
      frame={frame}
      from={[PROVIDER_ACTION_X, ACTION_Y]}
      range={HOOK_FLIGHT}
      to={[STATUS.left + STATUS.width / 2, STATUS.top + STATUS.height / 2]}
    >
      <WebhookIcon color={palette.zinc900} size={40} />
      <span style={{ fontFamily: codeFont, fontSize: 40 }}>payment.settled</span>
    </Flight>
  </>
);

const settlements = [
  { id: "#20415", amount: "Rp 92.000" },
  { id: "#20416", amount: "Rp 240.000" },
  { id: "#20417", amount: "Rp 57.500" },
  { id: "#20418", amount: "Rp 185.000" },
] as const;

// The last pair is the order from the story, so the check slows down for it.
const rowTiming = (index: number) => {
  const start = ROW_STARTS[index];
  const slow = index === settlements.length - 1 ? 4 : 0;
  return { start, slide: [start, start + 10 + slow] as const, link: [start + 8 + slow, start + 14 + slow] as const, tick: start + 14 + slow };
};

const rowTop = (index: number) => ROWS.top + index * (ROWS.height + ROWS.gap);

const matchedAt = (frame: number) => settlements.filter((_, index) => frame >= rowTiming(index).tick).length;

const CheckMarker: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < ROW_STARTS[0] - 2 || frame >= PAYOFF_AT) return null;
  const outset = 12;
  const rowRect = (index: number) => ({
    left: ROWS.left - outset,
    top: rowTop(index) - outset,
    width: ROWS.right + ROWS.width - ROWS.left + 2 * outset,
    height: ROWS.height + 2 * outset,
  });
  let rect = rowRect(0);
  const hops: ReadonlyArray<{ range: readonly [number, number]; target: ReturnType<typeof rowRect> }> = [
    ...settlements.slice(1).map((_, i) => ({ range: [ROW_STARTS[i + 1] - 4, ROW_STARTS[i + 1]] as const, target: rowRect(i + 1) })),
    // After the last pair the marker travels into the header pill, where the payoff lands.
    { range: [rowTiming(3).tick + 2, PAYOFF_AT - 2] as const, target: { left: PILL.left - 8, top: PILL.top - 8, width: PILL.width + 16, height: PILL.height + 16 } },
  ];
  for (const hop of hops) {
    if (frame < hop.range[0]) break;
    const t = step(frame, hop.range, 0, 1);
    rect = {
      left: rect.left + (hop.target.left - rect.left) * t,
      top: rect.top + (hop.target.top - rect.top) * t,
      width: rect.width + (hop.target.width - rect.width) * t,
      height: rect.height + (hop.target.height - rect.height) * t,
    };
  }
  return (
    <div
      style={{
        position: "absolute",
        left: rect.left - CHECK.left,
        top: rect.top - CHECK.top,
        width: rect.width,
        height: rect.height,
        boxSizing: "border-box",
        borderRadius: Math.min(30, rect.height / 2),
        border: `5px solid ${palette.sky500}`,
      }}
    />
  );
};

const PairRow: React.FC<{ readonly frame: number; readonly index: number }> = ({ frame, index }) => {
  const row = settlements[index];
  const timing = rowTiming(index);
  const arrived = frame >= timing.start ? fade(frame, [...timing.slide], [0, 1]) : 0;
  const link = frame >= timing.slide[0] ? fade(frame, [...timing.link], [0, 1]) : 0;
  const ticked = frame >= timing.tick;
  const top = rowTop(index) - CHECK.top;
  const isStory = index === settlements.length - 1;
  const box: React.CSSProperties = {
    position: "absolute",
    top,
    width: ROWS.width,
    height: ROWS.height,
    boxSizing: "border-box",
    borderRadius: 22,
    padding: "0 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    whiteSpace: "nowrap",
  };
  const amount: React.CSSProperties = {
    fontFamily: displayFont,
    fontSize: 46,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: palette.zinc900,
  };
  const gutterLeft = ROWS.left + ROWS.width - CHECK.left;
  const gutterWidth = ROWS.right - ROWS.left - ROWS.width;
  return (
    <>
      <div
        style={{
          ...box,
          left: ROWS.left - CHECK.left,
          backgroundColor: ticked ? palette.emerald50 : palette.zinc50,
          border: `2px solid ${ticked ? palette.emerald200 : palette.zinc200}`,
        }}
      >
        <span style={{ fontFamily: codeFont, fontSize: 40, color: isStory ? palette.sky700 : palette.zinc600 }}>{row.id}</span>
        <span style={amount}>{row.amount}</span>
      </div>
      <div
        style={{
          ...box,
          left: ROWS.right - CHECK.left,
          backgroundColor: "transparent",
          border: `3px dashed ${palette.zinc300}`,
          opacity: 1 - arrived,
        }}
      />
      <div
        style={{
          ...box,
          left: ROWS.right - CHECK.left,
          backgroundColor: ticked ? palette.emerald50 : "#ffffff",
          border: `2px solid ${ticked ? palette.emerald200 : palette.zinc200}`,
          opacity: arrived,
          translate: `${(1 - arrived) * 90}px 0px`,
        }}
      >
        <Img src={staticFile("logos/midtrans-mark.svg")} style={{ width: 42, height: 45 }} />
        <span style={amount}>{row.amount}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: gutterLeft,
          top: top + ROWS.height / 2 - 3,
          width: gutterWidth * link,
          height: 6,
          backgroundColor: ticked ? palette.emerald600 : palette.sky500,
        }}
      />
      {ticked ? (
        <div
          style={{
            position: "absolute",
            left: gutterLeft + gutterWidth / 2 - 30,
            top: top + ROWS.height / 2 - 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.emerald600,
            border: `5px solid #ffffff`,
            scale: landing(frame, timing.tick),
          }}
        >
          <Check color="#ffffff" size={34} />
        </div>
      ) : null}
    </>
  );
};

const SceneB: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const matched = matchedAt(frame);
  const done = frame >= PAYOFF_AT;
  return (
    <div style={{ ...cardStyle, ...CHECK }}>
      <div
        style={{
          position: "absolute",
          left: CHECK.pad,
          top: 30,
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: displayFont, fontSize: 60, fontWeight: 600, letterSpacing: "-0.02em", color: palette.zinc900 }}>
          Daily check
        </span>
        <span style={{ fontFamily: codeFont, fontSize: 40, color: palette.zinc500 }}>02:00</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: PILL.left - CHECK.left,
          top: PILL.top - CHECK.top,
          width: PILL.width,
          height: PILL.height,
          borderRadius: PILL.height / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          backgroundColor: done ? palette.emerald600 : palette.zinc100,
          color: done ? "#ffffff" : palette.zinc700,
          scale: landing(frame, PAYOFF_AT),
          fontFamily: uiFont,
          fontSize: 40,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {done ? <Check color="#ffffff" size={40} /> : null}
        <span style={{ fontFamily: displayFont, fontSize: 48 }}>{matched}/4</span>
        matched
      </div>
      <div
        style={{
          position: "absolute",
          left: ROWS.left - CHECK.left,
          top: 190 - CHECK.top,
          fontFamily: uiFont,
          fontSize: 40,
          color: palette.zinc500,
        }}
      >
        Store orders
      </div>
      <div
        style={{
          position: "absolute",
          left: ROWS.right - CHECK.left,
          top: 190 - CHECK.top,
          display: "flex",
          alignItems: "center",
          gap: 16,
          whiteSpace: "nowrap",
        }}
      >
        <Img src={staticFile("logos/midtrans.svg")} style={{ width: 236, height: 38 }} />
        <span style={{ fontFamily: uiFont, fontSize: 40, color: palette.zinc500 }}>settlements</span>
      </div>
      {settlements.map((_, index) => (
        <PairRow frame={frame} index={index} key={index} />
      ))}
      <CheckMarker frame={frame} />
    </div>
  );
};

const logLines: ReadonlyArray<{ at: number; text: string; dot: string }> = [
  { at: -Infinity, text: "order #20418 · awaiting payment", dot: palette.zinc500 },
  { at: UNKNOWN_AT, text: "order #20418 · no confirmation yet", dot: palette.amber400 },
  { at: CHAPTER.confirm, text: "webhook · midtrans · payment.settled", dot: palette.sky400 },
  { at: CONFIRMED_AT, text: "kafka → order-service · #20418 → PAID", dot: palette.emerald400 },
  { at: CHAPTER.check, text: "recon 02:00 · orders vs Midtrans", dot: palette.sky400 },
  { at: PAYOFF_AT, text: "recon 02:00 · 4 orders, 4 payments, 0 gaps", dot: palette.emerald400 },
];

/** The store's own log. It never moves, so it carries the eye across both pushes. */
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
      <div style={{ fontFamily: codeFont, fontSize: 40, color: palette.zinc100, whiteSpace: "nowrap" }}>{line.text}</div>
    </div>
  );
};

export const EcommercePayment: React.FC = () => {
  const frame = useCurrentFrame();
  // Once scene A comes back in, it replays the frames before 0: the opening state.
  const story = frame >= SEAM.enter[0] ? frame - ECOMMERCE_DURATION : frame;
  const showA = frame < SCENE_SWAP.enter[0] || frame >= SEAM.enter[0];
  const shiftA =
    frame < SEAM.enter[0]
      ? step(frame, SCENE_SWAP.exit, 0, -PUSH, Easing.in(Easing.cubic))
      : step(frame, SEAM.enter, PUSH, 0, Easing.out(Easing.cubic));
  const shiftB =
    frame < SEAM.exit[0]
      ? step(frame, SCENE_SWAP.enter, PUSH, 0, Easing.out(Easing.cubic))
      : step(frame, SEAM.exit, 0, -PUSH, Easing.in(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: palette.zinc50 }}>
      {showA ? (
        <AbsoluteFill style={{ translate: `${shiftA}px 0px` }}>
          <SceneA frame={story} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ translate: `${shiftB}px 0px` }}>
          <SceneB frame={story} />
        </AbsoluteFill>
      )}
      <LogStrip frame={story} />
    </AbsoluteFill>
  );
};
