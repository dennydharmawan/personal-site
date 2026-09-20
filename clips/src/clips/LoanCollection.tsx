import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { useSettle as useSettleAt } from "../components/loop";
import { ease } from "../components/kit";
import { Check, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * One collector's queue. It opens on the old way, a reminder typed by hand.
 * The queue then gives each account an owner, the reminder goes out as a
 * WhatsApp template, and the reply and promise land in one activity log.
 */

const MARGIN = 56;
const QUEUE = { left: MARGIN, top: 214, width: 704, row: 108, gap: 16 };
const PHONE = { left: 840, top: 190, width: 544, height: 712, border: 10 };

/** Runs 18 s so each chat message has time to be read. */
export const LOAN_DURATION = 540;
/** The rewind runs to the last frame; a settled tail before the wrap reads as a stall. */
const OUT = [508, 538] as const;
/** The log clears first, then the rows return, so the two never print over each other. */
const LOG_OUT = [504, 512] as const;
const ROWS_OUT = [512, 538] as const;
const useSettle = () => useSettleAt(OUT);

const CAPTIONS = [
  { range: [6, 120], text: "Collectors retype every reminder by hand." },
  { range: [120, 258], text: "The queue gives every account an owner." },
  { range: [258, 372], text: "Reminders go out as WhatsApp templates." },
  {
    range: [372, 504],
    text: "Collectors stop retyping. Every outcome is logged.",
  },
] as const;

const DRAFT = "Hi Budi, your instalment of IDR 1,240,000 is 32 days overdue.";
/** The whole sentence is typed out: the line outgrowing the field is what sells the manual work. */
const TYPING = [24, 112] as const;
const DRAFT_OUT = [122, 136] as const;
const BRIGHTEN = [124, 146] as const;
const BADGE_AT = 140;
const BADGE_STEP = 10;
const SELECT_AT = 212;
const PILL_AT = 264;
const POINTER = [284, 312] as const;
const PRESS = [314, 320, 328] as const;
const SENT_AT = 326;
const REPLY_AT = 376;
const OTHERS_OUT = [392, 408] as const;
const LOG_LABEL_AT = 410;
const ENTRY_AT = [424, 434, 470, 480] as const;
/** Lands 10 frames after "Customer replied", so the eye reads the log line before the phone changes. */
const CHIP_AT = 442;

const DIM = 0.55;

const accounts = [
  {
    amount: "IDR 1.24m",
    id: "4471",
    name: "Budi S.",
    overdue: "32 days",
    risk: palette.rose600,
  },
  {
    amount: "IDR 640k",
    id: "2208",
    name: "Andi P.",
    overdue: "18 days",
    risk: palette.amber500,
  },
  {
    amount: "IDR 2.10m",
    id: "9130",
    name: "Sari W.",
    overdue: "9 days",
    risk: palette.amber500,
  },
  {
    amount: "IDR 310k",
    id: "5567",
    name: "Rina T.",
    overdue: "4 days",
    risk: palette.zinc300,
  },
  {
    amount: "IDR 220k",
    id: "7314",
    name: "Dewi K.",
    overdue: "3 days",
    risk: palette.zinc300,
  },
];

const slot = (index: number) => QUEUE.top + index * (QUEUE.row + QUEUE.gap);

const LOG = {
  label: slot(1) + 2,
  first: slot(1) + 66,
  row: 62,
  gap: 14,
};
const entryTop = (index: number) => LOG.first + index * (LOG.row + LOG.gap);
const ENTRY_PAD = 22;
const MARK = 30;
const ENTRY_GAP = 16;
const ENTRY_TEXT_LEFT = QUEUE.left + ENTRY_PAD + MARK + ENTRY_GAP;
const CHIP_HEIGHT = 44;

const Avatar: React.FC<{ readonly label: string; readonly size: number }> = ({
  label,
  size,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      backgroundColor: palette.teal100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: uiFont,
      fontSize: size * 0.46,
      fontWeight: 600,
      color: palette.teal800,
    }}
  >
    {label}
  </div>
);

const QueueRow: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettleAt(ROWS_OUT);
  const account = accounts[index];
  const bright =
    index === 0
      ? fade(frame, [...BRIGHTEN], [DIM, 1])
      : fade(frame, [BRIGHTEN[0], BRIGHTEN[1], ...OTHERS_OUT], [DIM, 1, 1, 0]);
  const opacity = DIM + (bright - DIM) * settle;
  const stamp = BADGE_AT + index * BADGE_STEP;
  const selected =
    index === 0 ? fade(frame, [SELECT_AT, SELECT_AT + 12], [0, 1]) * settle : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: QUEUE.left,
        top: slot(index),
        width: QUEUE.width,
        height: QUEUE.row,
        boxSizing: "border-box",
        padding: "0 28px 0 24px",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        color: palette.zinc900,
        fontFamily: uiFont,
        opacity,
        scale: interpolate(selected, [0, 1], [1, 1.015], {
          output: "perceptual-scale",
        }),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 24,
          bottom: 24,
          width: 6,
          borderRadius: 3,
          backgroundColor: account.risk,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -5,
          borderRadius: 24,
          border: `4px solid ${palette.teal700}`,
          opacity: selected,
        }}
      />
      <div
        style={{
          width: 48,
          marginRight: 18,
          opacity: fade(frame, [stamp, stamp + 6], [0, 1]) * settle,
          scale: interpolate(frame, [stamp, stamp + 10], [1.35, 1], {
            easing: ease,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <Avatar label="RW" size={48} />
      </div>
      <div
        style={{
          fontFamily: codeFont,
          fontSize: 24,
          color: palette.zinc500,
          width: 80,
        }}
      >
        {account.id}
      </div>
      <div style={{ fontSize: 33, fontWeight: 600 }}>{account.name}</div>
      <div
        style={{
          marginLeft: "auto",
          fontSize: 25,
          fontWeight: 500,
          color: palette.zinc700,
        }}
      >
        {account.overdue}
      </div>
      <div
        style={{
          width: 168,
          textAlign: "right",
          fontFamily: codeFont,
          fontSize: 28,
          color: palette.zinc700,
        }}
      >
        {account.amount}
      </div>
    </div>
  );
};

const Bubble: React.FC<{
  readonly at: number;
  readonly children: React.ReactNode;
  readonly incoming?: boolean;
}> = ({ at, children, incoming = false }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        alignSelf: incoming ? "flex-start" : "flex-end",
        maxWidth: 410,
        padding: "16px 20px",
        borderRadius: 22,
        borderBottomLeftRadius: incoming ? 6 : 22,
        borderBottomRightRadius: incoming ? 22 : 6,
        backgroundColor: incoming ? "#ffffff" : palette.teal100,
        fontFamily: uiFont,
        fontSize: 27,
        lineHeight: 1.32,
        color: palette.zinc900,
        opacity: fade(frame, [at, at + 10], [0, 1]),
        scale: interpolate(frame, [at, at + 14], [0.94, 1], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        transformOrigin: incoming ? "left bottom" : "right bottom",
      }}
    >
      {children}
    </div>
  );
};

const Field: React.FC<{ readonly children: string }> = ({ children }) => (
  <span
    style={{
      padding: "0 4px",
      margin: "0 -2px",
      borderRadius: 6,
      backgroundColor: palette.teal200,
      color: palette.teal900,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

/** WhatsApp's double tick: grey once delivered, blue once Budi has read it. */
const ReadTicks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg
      fill="none"
      height={18}
      style={{ display: "inline-block", marginLeft: 10, verticalAlign: -1 }}
      viewBox="0 0 28 18"
      width={28}
    >
      <path
        d="M2 9.5 L6.5 14 L15 4.5 M11 14 L23.5 4.5"
        stroke={interpolateColors(
          fade(frame, [REPLY_AT - 16, REPLY_AT - 8], [0, 1]),
          [0, 1],
          [palette.zinc400, palette.sky600],
        )}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.4}
      />
    </svg>
  );
};

const Composer: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const typed = Math.floor(
    interpolate(frame, [...TYPING], [0, DRAFT.length + 0.5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const draft = fade(
    frame,
    [TYPING[0] - 4, TYPING[0], ...DRAFT_OUT],
    [0, 1, 1, 0],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 96,
        boxSizing: "border-box",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${palette.zinc200}`,
        backgroundColor: palette.zinc50,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: 1,
          height: 60,
          boxSizing: "border-box",
          padding: "0 22px",
          borderRadius: 30,
          border: `1px solid ${palette.zinc200}`,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          fontFamily: uiFont,
          fontSize: 25,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            color: palette.zinc500,
            opacity:
              1 -
              fade(
                frame,
                [TYPING[0] - 10, TYPING[0] - 4, DRAFT_OUT[1], DRAFT_OUT[1] + 8],
                [0, 1, 1, 0],
              ),
          }}
        >
          Message
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            overflow: "hidden",
            color: palette.zinc900,
            opacity: draft * settle,
          }}
        >
          {/* Shrinks to nothing once the line fills the field, so the draft then scrolls left under a fixed caret. */}
          <div style={{ flexBasis: "100%", flexShrink: 1, minWidth: 0 }} />
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {DRAFT.slice(0, typed)}
            <div
              style={{
                width: 4,
                height: 30,
                marginLeft: 3,
                borderRadius: 2,
                backgroundColor: palette.teal700,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplatePill: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  return (
    <div
      style={{
        position: "absolute",
        left: 22,
        bottom: 110,
        padding: "8px 18px",
        borderRadius: 999,
        border: `4px solid ${palette.teal700}`,
        backgroundColor: palette.teal100,
        fontFamily: uiFont,
        fontSize: 24,
        fontWeight: 600,
        color: palette.teal800,
        opacity:
          fade(
            frame,
            [PILL_AT, PILL_AT + 12, SENT_AT, SENT_AT + 12],
            [0, 1, 1, 0],
          ) * settle,
        translate: `0px ${fade(frame, [PILL_AT, PILL_AT + 14], [12, 0])}px`,
        scale: interpolate(frame, [...PRESS], [1, 0.94, 1], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
      }}
    >
      Overdue reminder
    </div>
  );
};

const Phone: React.FC = () => {
  const settle = useSettle();

  return (
    <div
      style={{
        position: "absolute",
        left: PHONE.left,
        top: PHONE.top,
        width: PHONE.width,
        height: PHONE.height,
        boxSizing: "border-box",
        borderRadius: 48,
        border: `${PHONE.border}px solid ${palette.zinc700}`,
        backgroundColor: palette.zinc100,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 96,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          backgroundColor: palette.teal800,
          fontFamily: uiFont,
        }}
      >
        <Avatar label="B" size={54} />
        <div>
          <div style={{ fontSize: 29, fontWeight: 600, color: "#ffffff" }}>
            Budi S.
          </div>
          <div style={{ fontSize: 21, color: palette.teal100 }}>
            WhatsApp, account 4471
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "24px 22px",
          opacity: settle,
        }}
      >
        <Bubble at={SENT_AT}>
          Hi <Field>Budi</Field>, your instalment of{" "}
          <Field>IDR 1,240,000</Field> is <Field>32 days</Field> overdue.
          <ReadTicks />
        </Bubble>
        <Bubble at={REPLY_AT} incoming>
          {"Sorry, I get paid on the 18th. I\u00a0can pay then."}
        </Bubble>
      </div>
      <TemplatePill />
      <Composer />
    </div>
  );
};

type LogMark = "done" | "neutral" | "waiting";

const markStyle: Record<LogMark, { size: number; color: string }> = {
  done: { size: MARK, color: palette.emerald600 },
  neutral: { size: 12, color: palette.zinc400 },
  waiting: { size: 14, color: palette.amber500 },
};

const Mark: React.FC<{ readonly mark: LogMark }> = ({ mark }) => {
  const { size, color } = markStyle[mark];
  return (
    <div
      style={{
        width: MARK,
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mark === "done" ? <Check color="#ffffff" size={22} /> : null}
      </div>
    </div>
  );
};

const WaitingChip: React.FC<{ readonly children: string }> = ({ children }) => (
  <div
    style={{
      height: CHIP_HEIGHT,
      boxSizing: "border-box",
      padding: "0 18px",
      display: "flex",
      alignItems: "center",
      borderRadius: 999,
      whiteSpace: "nowrap",
      border: `2px solid ${palette.amber200}`,
      backgroundColor: palette.amber50,
      fontFamily: uiFont,
      fontSize: 25,
      fontWeight: 600,
      color: palette.amber700,
    }}
  >
    {children}
  </div>
);

const Entry: React.FC<{
  readonly at: number;
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly mark: LogMark;
}> = ({ at, children, index, mark }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: QUEUE.left,
        top: entryTop(index),
        width: QUEUE.width,
        height: LOG.row,
        boxSizing: "border-box",
        padding: `0 ${ENTRY_PAD}px`,
        borderRadius: 16,
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: ENTRY_GAP,
        fontFamily: uiFont,
        fontSize: 26,
        fontWeight: 500,
        color: palette.zinc900,
        opacity: fade(frame, [at, at + 10], [0, 1]),
        translate: `0px ${fade(frame, [at, at + 14], [14, 0])}px`,
      }}
    >
      <Mark mark={mark} />
      {children}
    </div>
  );
};

const ActivityLog: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettleAt(LOG_OUT);
  return (
    <AbsoluteFill style={{ opacity: settle }}>
      <div
        style={{
          position: "absolute",
          left: QUEUE.left + 4,
          top: LOG.label,
          fontFamily: displayFont,
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: palette.zinc900,
          opacity: fade(frame, [LOG_LABEL_AT, LOG_LABEL_AT + 10], [0, 1]),
          translate: `0px ${fade(frame, [LOG_LABEL_AT, LOG_LABEL_AT + 14], [10, 0])}px`,
        }}
      >
        Activity log
      </div>
      <Entry at={ENTRY_AT[0]} index={0} mark="done">
        Reminder sent · template
      </Entry>
      <Entry at={ENTRY_AT[1]} index={1} mark="neutral">
        Customer replied
      </Entry>
      <Entry at={ENTRY_AT[2] - 10} index={2} mark="waiting" />
      <Entry at={ENTRY_AT[3]} index={3} mark="waiting">
        <WaitingChip>Follow-up due · 18 Sep</WaitingChip>
      </Entry>
    </AbsoluteFill>
  );
};

const FlyingPromise: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettleAt(LOG_OUT);
  const travel = fade(frame, [CHIP_AT + 6, ENTRY_AT[2]], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(travel, [0, 1], [880, ENTRY_TEXT_LEFT - 4]),
        top: interpolate(
          travel,
          [0, 1],
          [596, entryTop(2) + (LOG.row - CHIP_HEIGHT) / 2],
        ),
        opacity: fade(frame, [CHIP_AT, CHIP_AT + 8], [0, 1]) * settle,
      }}
    >
      <WaitingChip>Promise to pay, 18 Sep</WaitingChip>
    </div>
  );
};

const Pointer: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const move = fade(frame, [...POINTER], [0, 1]);
  return (
    <svg
      height={48}
      style={{
        position: "absolute",
        left: interpolate(move, [0, 1], [1300, 986]),
        top: interpolate(move, [0, 1], [960, 752]),
        opacity:
          fade(
            frame,
            [POINTER[0] - 6, POINTER[0] + 4, SENT_AT + 6, SENT_AT + 18],
            [0, 1, 1, 0],
          ) * settle,
        scale: interpolate(frame, [...PRESS], [1, 0.88, 1], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        transformOrigin: "left top",
      }}
      viewBox="0 0 32 44"
      width={35}
    >
      <path
        d="M2 2 L2 32.5 L9.6 25.2 L14.6 37.3 L20.1 35.0 L15.2 23.1 L25.6 22.9 Z"
        fill="#ffffff"
        stroke={palette.teal700}
        strokeLinejoin="round"
        strokeWidth={3.7}
      />
    </svg>
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
        top: 120,
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

export const LoanCollection: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.teal50 }}>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 40,
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
          Queue for r.wijaya
        </div>
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 28,
            color: palette.teal800,
          }}
        >
          Due today, by priority
        </div>
      </div>

      {accounts.map((_, index) => (
        <QueueRow index={index} key={index} />
      ))}
      <ActivityLog />
      <Phone />
      <FlyingPromise />
      <Pointer />

      {CAPTIONS.map((caption) => (
        <Caption key={caption.text} range={caption.range} text={caption.text} />
      ))}
    </AbsoluteFill>
  );
};
