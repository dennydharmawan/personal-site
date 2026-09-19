import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { DrawnPath, Hand, useSettle as useSettleAt } from "../components/loop";
import { ease } from "../components/kit";
import { fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * One collector session. The queue picks the account, the collector messages the
 * customer, and the promise to pay travels back into the queue, which reorders so
 * the next account is on top. The queue and the phone share the frame because the
 * system's job is keeping the two in step.
 */

const MARGIN = 56;
const QUEUE = { left: MARGIN, top: 214, width: 704, row: 108, gap: 16 };
const PHONE = { left: 840, top: 190, width: 544, height: 712 };

/** Runs 18 s, longer than the other clips, so each chat message can be read. */
export const LOAN_DURATION = 540;
const OUT = [516, 536] as const;
const useSettle = () => useSettleAt(OUT);

const beats = {
  pick: [24, 120],
  chat: [120, 312],
  update: [312, 516],
} as const;

const SELECT_AT = 70;
const BUBBLES = [132, 194, 250] as const;
const CHIP_AT = 320;
const LAND_AT = 360;
const REORDER = [372, 410] as const;
const NOTE_AT = 420;

const accounts = [
  {
    amount: "IDR 1.24m",
    id: "4471",
    name: "Budi S.",
    overdue: "32 days",
    risk: palette.rose400,
  },
  {
    amount: "IDR 640k",
    id: "2208",
    name: "Andi P.",
    overdue: "18 days",
    risk: palette.amber400,
  },
  {
    amount: "IDR 2.10m",
    id: "9130",
    name: "Sari W.",
    overdue: "9 days",
    risk: palette.amber400,
  },
  {
    amount: "IDR 310k",
    id: "5567",
    name: "Rina T.",
    overdue: "4 days",
    risk: palette.zinc400,
  },
  {
    amount: "IDR 220k",
    id: "7314",
    name: "Dewi K.",
    overdue: "3 days",
    risk: palette.zinc400,
  },
];

const slot = (index: number) => QUEUE.top + index * (QUEUE.row + QUEUE.gap);

const QueueRow: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const account = accounts[index];
  const moved = fade(frame, [...REORDER], [0, 1]) * settle;
  const promised =
    index === 0 ? fade(frame, [LAND_AT, LAND_AT + 10], [0, 1]) * settle : 0;
  const selected =
    index === 0
      ? fade(
          frame,
          [SELECT_AT, SELECT_AT + 10, LAND_AT + 4, LAND_AT + 14],
          [0, 1, 1, 0],
        )
      : 0;
  const top =
    index === 0
      ? slot(0) + moved * (slot(accounts.length - 1) - slot(0))
      : slot(index) - moved * (QUEUE.row + QUEUE.gap);

  return (
    <div
      style={{
        position: "absolute",
        left: QUEUE.left,
        top,
        width: QUEUE.width,
        height: QUEUE.row,
        boxSizing: "border-box",
        padding: "0 28px",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        border: `1px solid ${interpolateColors(selected, [0, 1], [palette.zinc700, "#ffffff"])}`,
        backgroundColor: interpolateColors(
          selected,
          [0, 1],
          [palette.zinc800, "#ffffff"],
        ),
        color: interpolateColors(
          selected,
          [0, 1],
          ["#ffffff", palette.zinc950],
        ),
        fontFamily: uiFont,
        scale: interpolate(selected, [0, 1], [1, 1.015], {
          output: "perceptual-scale",
        }),
      }}
    >
      <div
        style={{ fontFamily: codeFont, fontSize: 24, opacity: 0.6, width: 84 }}
      >
        {account.id}
      </div>
      <div style={{ fontSize: 33, fontWeight: 600 }}>{account.name}</div>
      <div
        style={{
          position: "relative",
          marginLeft: "auto",
          width: 230,
          height: 36,
          fontSize: 25,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 2,
            color: interpolateColors(
              selected,
              [0, 1],
              [account.risk, palette.rose600],
            ),
            opacity: 1 - promised,
          }}
        >
          {account.overdue}
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: -4,
            padding: "5px 14px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            backgroundColor: palette.amber300,
            color: palette.zinc950,
            fontSize: 23,
            fontWeight: 600,
            opacity: promised,
          }}
        >
          follow-up 18 Sep
        </div>
      </div>
      <div
        style={{
          width: 168,
          textAlign: "right",
          fontFamily: codeFont,
          fontSize: 28,
        }}
      >
        {account.amount}
      </div>
    </div>
  );
};

const Bubble: React.FC<{
  readonly at: number;
  readonly incoming?: boolean;
  readonly text: string;
}> = ({ at, incoming = false, text }) => {
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
        backgroundColor: incoming ? "#ffffff" : palette.emerald100,
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
      {text}
    </div>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const open = fade(frame, [SELECT_AT + 8, SELECT_AT + 24], [0, 1]) * settle;

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
        border: `10px solid ${palette.zinc700}`,
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
          backgroundColor: palette.emerald700,
          fontFamily: uiFont,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: palette.emerald300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 600,
            color: palette.emerald950,
            opacity: open,
          }}
        >
          B
        </div>
        <div style={{ opacity: open }}>
          <div style={{ fontSize: 29, fontWeight: 600, color: "#ffffff" }}>
            Budi S.
          </div>
          <div style={{ fontSize: 21, color: palette.emerald100 }}>
            WhatsApp, account 4471
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          textAlign: "center",
          fontFamily: uiFont,
          fontSize: 27,
          color: palette.zinc500,
          opacity: 1 - open,
        }}
      >
        No conversation open
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
        <Bubble
          at={BUBBLES[0]}
          text="Hi Budi, your instalment of IDR 1,240,000 is 32 days overdue."
        />
        <Bubble
          at={BUBBLES[1]}
          incoming
          text="Sorry, I get paid on the 18th. I can pay then."
        />
        <Bubble
          at={BUBBLES[2]}
          text="Noted. I'll follow up on the morning of the 18th."
        />
      </div>
    </div>
  );
};

const FlyingPromise: React.FC = () => {
  const frame = useCurrentFrame();
  const travel = fade(frame, [CHIP_AT + 10, LAND_AT], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(travel, [0, 1], [1040, 470]),
        top:
          interpolate(travel, [0, 1], [742, slot(0) + 30]) -
          Math.sin(travel * Math.PI) * 90,
        padding: "8px 18px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        backgroundColor: palette.amber300,
        fontFamily: uiFont,
        fontSize: 25,
        fontWeight: 600,
        color: palette.zinc950,
        opacity: fade(
          frame,
          [CHIP_AT, CHIP_AT + 8, LAND_AT, LAND_AT + 8],
          [0, 1, 1, 0],
        ),
      }}
    >
      promise to pay, 18 Sep
    </div>
  );
};

const Pointer: React.FC = () => {
  const frame = useCurrentFrame();
  const move = fade(frame, [40, 68], [0, 1]);
  return (
    <svg
      height={48}
      style={{
        position: "absolute",
        left: interpolate(move, [0, 1], [880, 560]),
        top: interpolate(move, [0, 1], [900, slot(0) + 50]),
        opacity: fade(frame, [36, 44, 90, 102], [0, 1, 1, 0]),
      }}
      viewBox="0 0 32 44"
      width={35}
    >
      <path
        d="M2 2 L2 32.5 L9.6 25.2 L14.6 37.3 L20.1 35.0 L15.2 23.1 L25.6 22.9 Z"
        fill="#ffffff"
        stroke={palette.zinc950}
        strokeLinejoin="round"
        strokeWidth={2.2}
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
        top: 124,
        fontFamily: uiFont,
        fontSize: 38,
        fontWeight: 500,
        color: palette.zinc300,
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
  const frame = useCurrentFrame();
  const settle = useSettle();

  return (
    <AbsoluteFill style={{ backgroundColor: palette.zinc900 }}>
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
            color: "#ffffff",
          }}
        >
          Queue for r.wijaya
        </div>
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 28,
            color: palette.zinc400,
          }}
        >
          12 due today, sorted by risk
        </div>
      </div>

      {accounts.map((_, index) => (
        <QueueRow index={index} key={index} />
      ))}
      <Phone />

      <AbsoluteFill style={{ opacity: settle }}>
        <FlyingPromise />
        <Pointer />
        <svg
          height={960}
          style={{ position: "absolute", inset: 0 }}
          width={1440}
        >
          <g
            opacity={fade(
              frame,
              [NOTE_AT, NOTE_AT + 6, OUT[0] - 10, OUT[0]],
              [0, 1, 1, 0],
            )}
          >
            <DrawnPath
              color={palette.amber300}
              d="M 132 884 C 96 876, 84 852, 100 830"
              from={NOTE_AT + 6}
              length={92}
              to={NOTE_AT + 20}
            />
            <DrawnPath
              color={palette.amber300}
              d="M 100 830 L 88 852 M 100 830 L 120 844"
              from={NOTE_AT + 20}
              length={50}
              to={NOTE_AT + 26}
            />
          </g>
        </svg>
        <Hand
          color={palette.amber300}
          from={NOTE_AT}
          left={150}
          text="back in line for the 18th"
          to={OUT[0]}
          top={858}
        />

        <Caption
          range={beats.pick}
          text="The queue picks the next account to contact."
        />
        <Caption
          range={beats.chat}
          text="The collector messages the customer on WhatsApp."
        />
        <Caption
          range={[beats.update[0], OUT[0]]}
          text="The promise becomes a follow-up. Nobody has to remember it."
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
