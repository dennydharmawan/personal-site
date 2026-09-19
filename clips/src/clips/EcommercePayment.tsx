import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { DrawnPath, Hand, useSettle as useSettleAt } from "../components/loop";
import { Check, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * One order seen from three seats. The customer is confirmed in 0.4 s, the payment
 * settles behind them, and the parcel stays on hold until the ledger matches. The
 * webhook then arrives a second time and the shipped count stays at one, which is the
 * part of the system a customer never sees and a finance team cares about most.
 */

/** Runs 18 s, longer than the default, so only one thing changes at a time. */
export const ECOMMERCE_DURATION = 540;
const OUT = [516, 536] as const;
const useSettle = () => useSettleAt(OUT);

const MARGIN = 56;
const CARD = { top: 214, height: 666 };
const COLS = {
  customer: { left: 56, width: 392 },
  payment: { left: 500, width: 440 },
  warehouse: { left: 992, width: 392 },
};

const beats = {
  confirm: [24, 130],
  settle: [130, 300],
  ship: [300, 404],
  repeat: [404, 516],
} as const;

const PAY_AT = 50;
const CONFIRMED_AT = 80;
const RELEASED_AT = 346;
const IGNORED_AT = 446;
const NOTE_AT = 462;

type StepTone = "amber" | "emerald" | "zinc";

const steps: ReadonlyArray<{
  readonly at: number;
  readonly label: string;
  readonly sub?: string;
  readonly time: string;
  readonly tone: StepTone;
  readonly y: number;
}> = [
  { at: 146, label: "authorized", time: "0.3 s", tone: "amber", y: 318 },
  { at: 190, label: "captured", time: "1.4 s", tone: "amber", y: 418 },
  {
    at: 234,
    label: "webhook received",
    sub: "evt_81f2",
    time: "1.9 s",
    tone: "amber",
    y: 518,
  },
  { at: 306, label: "ledger matches", time: "3.0 s", tone: "emerald", y: 638 },
  {
    at: 416,
    label: "webhook again",
    sub: "evt_81f2, same id",
    time: "3.6 s",
    tone: "zinc",
    y: 738,
  },
];

const stepColor: Record<StepTone, string> = {
  amber: palette.amber500,
  emerald: palette.emerald500,
  zinc: palette.zinc400,
};

const Panel: React.FC<{
  readonly children: React.ReactNode;
  readonly col: { readonly left: number; readonly width: number };
  readonly title: string;
}> = ({ children, col, title }) => (
  <div
    style={{
      position: "absolute",
      left: col.left,
      top: CARD.top,
      width: col.width,
      height: CARD.height,
      boxSizing: "border-box",
      borderRadius: 28,
      border: `1px solid ${palette.amber200}`,
      backgroundColor: "#ffffff",
      fontFamily: uiFont,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 32,
        top: 28,
        fontSize: 26,
        fontWeight: 500,
        color: palette.zinc500,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const LineItem: React.FC<{
  readonly name: string;
  readonly price: string;
  readonly top: number;
}> = ({ name, price, top }) => (
  <div
    style={{
      position: "absolute",
      left: 32,
      right: 32,
      top,
      display: "flex",
      alignItems: "center",
      gap: 18,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        backgroundColor: palette.amber100,
      }}
    />
    <div>
      <div style={{ fontSize: 28, fontWeight: 600, color: palette.zinc900 }}>
        {name}
      </div>
      <div
        style={{ fontFamily: codeFont, fontSize: 22, color: palette.zinc500 }}
      >
        {price}
      </div>
    </div>
  </div>
);

const Customer: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const press = fade(frame, [PAY_AT, PAY_AT + 5, PAY_AT + 10], [0, 1, 0]);
  const busy = fade(
    frame,
    [PAY_AT + 8, PAY_AT + 14, CONFIRMED_AT - 4, CONFIRMED_AT],
    [0, 1, 1, 0],
  );
  const done = fade(frame, [CONFIRMED_AT, CONFIRMED_AT + 10], [0, 1]) * settle;
  const label: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  };

  return (
    <Panel col={COLS.customer} title="Customer's cart">
      <LineItem name="Coffee grinder" price="IDR 940,000" top={92} />
      <LineItem name="Filter papers" price="IDR 300,000" top={180} />
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 284,
          paddingTop: 24,
          borderTop: `1px solid ${palette.zinc200}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: palette.zinc600,
        }}
      >
        <span>Total</span>
        <span style={{ fontWeight: 600, color: palette.zinc900 }}>
          IDR 1,240,000
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 104,
          height: 88,
          borderRadius: 22,
          backgroundColor: interpolateColors(
            done,
            [0, 1],
            [palette.zinc900, palette.emerald600],
          ),
          fontSize: 30,
          fontWeight: 600,
          color: "#ffffff",
          scale: interpolate(press, [0, 1], [1, 0.96], {
            output: "perceptual-scale",
          }),
        }}
      >
        <div style={{ ...label, opacity: 1 - Math.max(busy, done) }}>
          Pay now
        </div>
        <div style={{ ...label, opacity: busy }}>
          <svg
            height={30}
            style={{ rotate: `${frame * 14}deg` }}
            viewBox="0 0 30 30"
            width={30}
          >
            <path
              d="M15 3 A12 12 0 1 1 3 15"
              fill="none"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeWidth={3.5}
            />
          </svg>
          Placing order
        </div>
        <div style={{ ...label, opacity: done }}>
          <Check color="#ffffff" size={30} />
          Order confirmed
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 48,
          textAlign: "center",
          fontSize: 26,
          color: palette.zinc600,
          opacity: done,
        }}
      >
        confirmed in 0.4 s
      </div>
    </Panel>
  );
};

const Step: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const step = steps[index];
  const on = fade(frame, [step.at, step.at + 10], [0, 1]) * settle;
  const ignored =
    step.tone === "zinc"
      ? fade(frame, [IGNORED_AT, IGNORED_AT + 12], [0, 1]) * settle
      : 0;
  const top = step.y - CARD.top;
  const next = steps[index + 1];

  return (
    <>
      {next ? (
        <div
          style={{
            position: "absolute",
            left: 47,
            top: top + 16,
            width: 4,
            height: next.y - step.y,
            backgroundColor: palette.zinc200,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 32,
          top,
          width: 34,
          height: 34,
          boxSizing: "border-box",
          borderRadius: 17,
          border: "4px solid #ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: interpolateColors(
            on,
            [0, 1],
            [palette.zinc200, stepColor[step.tone]],
          ),
          scale: interpolate(on, [0, 1], [0.8, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        {step.tone === "emerald" ? (
          <div style={{ display: "flex", opacity: on }}>
            <Check color="#ffffff" size={18} />
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 32,
          top: top - 5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          opacity: on,
        }}
      >
        <div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              whiteSpace: "nowrap",
              fontSize: 27,
              fontWeight: 600,
              color: interpolateColors(
                ignored,
                [0, 1],
                [palette.zinc900, palette.zinc400],
              ),
            }}
          >
            {step.label}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "56%",
                width: `${ignored * 100}%`,
                height: 3,
                backgroundColor: palette.zinc500,
              }}
            />
          </div>
          {step.sub ? (
            <div
              style={{
                fontFamily: codeFont,
                fontSize: 22,
                whiteSpace: "nowrap",
                color: palette.zinc500,
              }}
            >
              {step.sub}
            </div>
          ) : null}
        </div>
        <div style={{ position: "relative", width: 80, height: 40 }}>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 6,
              fontFamily: codeFont,
              fontSize: 22,
              color: palette.zinc500,
              opacity: 1 - ignored,
            }}
          >
            {step.time}
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              padding: "5px 14px",
              borderRadius: 999,
              backgroundColor: palette.zinc200,
              fontSize: 23,
              fontWeight: 600,
              color: palette.zinc700,
              opacity: ignored,
            }}
          >
            ignored
          </div>
        </div>
      </div>
    </>
  );
};

const Warehouse: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const released =
    fade(frame, [RELEASED_AT, RELEASED_AT + 12], [0, 1]) * settle;
  const recount = fade(
    frame,
    [IGNORED_AT, IGNORED_AT + 8, IGNORED_AT + 18],
    [0, 1, 0],
  );
  const tag: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 300,
    display: "flex",
    justifyContent: "center",
  };
  const pill: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: 999,
    fontSize: 26,
    fontWeight: 600,
  };
  const numeral: React.CSSProperties = {
    position: "absolute",
    left: 32,
    bottom: 36,
    fontFamily: displayFont,
    fontSize: 120,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  };

  return (
    <Panel col={COLS.warehouse} title="Warehouse">
      <svg
        height={170}
        style={{
          position: "absolute",
          left: 86,
          top: 104,
          translate: `0px ${released * -6}px`,
        }}
        viewBox="0 0 220 170"
        width={220}
      >
        <rect
          fill={palette.amber300}
          height={112}
          rx={8}
          width={196}
          x={12}
          y={58}
        />
        <rect
          fill={palette.amber400}
          height={44}
          rx={8}
          width={220}
          x={0}
          y={20}
        />
        <rect fill={palette.amber100} height={72} width={24} x={98} y={20} />
        <rect fill="#ffffff" height={36} rx={4} width={60} x={134} y={118} />
        <rect
          fill={palette.zinc300}
          height={4}
          rx={2}
          width={40}
          x={144}
          y={128}
        />
        <rect
          fill={palette.zinc300}
          height={4}
          rx={2}
          width={28}
          x={144}
          y={140}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 278,
          top: 96,
          width: 52,
          height: 52,
          borderRadius: 26,
          border: "5px solid #ffffff",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.emerald500,
          opacity: released,
          scale: interpolate(released, [0, 1], [0.5, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        <Check color="#ffffff" size={26} />
      </div>
      <div style={{ ...tag, opacity: 1 - released }}>
        <div
          style={{
            ...pill,
            backgroundColor: palette.amber100,
            color: palette.amber900,
          }}
        >
          on hold until paid
        </div>
      </div>
      <div style={{ ...tag, opacity: released }}>
        <div
          style={{
            ...pill,
            backgroundColor: palette.emerald100,
            color: palette.emerald800,
          }}
        >
          released to ship
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 172,
          paddingTop: 24,
          borderTop: `1px solid ${palette.zinc200}`,
          fontSize: 28,
          color: palette.zinc600,
        }}
      >
        Parcels shipped
      </div>
      <div
        style={{ ...numeral, color: palette.zinc300, opacity: 1 - released }}
      >
        0
      </div>
      <div
        style={{
          ...numeral,
          color: palette.zinc900,
          opacity: released,
          transformOrigin: "left bottom",
          scale: interpolate(recount, [0, 1], [1, 1.08], {
            output: "perceptual-scale",
          }),
        }}
      >
        1
      </div>
    </Panel>
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

export const EcommercePayment: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const ledgerY = steps[3].y + 17;
  const handoffX = COLS.payment.left + COLS.payment.width;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.amber50 }}>
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
          Order 20418
        </div>
        <div
          style={{ fontFamily: uiFont, fontSize: 28, color: palette.zinc500 }}
        >
          from cart to shipped parcel
        </div>
      </div>

      <Customer />
      <Panel col={COLS.payment} title="Payment">
        {steps.map((_, index) => (
          <Step index={index} key={index} />
        ))}
      </Panel>
      <Warehouse />

      <AbsoluteFill style={{ opacity: settle }}>
        <svg
          height={960}
          style={{ position: "absolute", inset: 0 }}
          width={1440}
        >
          <DrawnPath
            color={palette.emerald500}
            d={`M ${handoffX + 6} ${ledgerY} L ${COLS.warehouse.left - 8} ${ledgerY} m -14 -12 l 14 12 l -14 12`}
            from={322}
            length={80}
            to={340}
          />
          <g
            opacity={fade(
              frame,
              [NOTE_AT, NOTE_AT + 6, OUT[0] - 10, OUT[0]],
              [0, 1, 1, 0],
            )}
          >
            <DrawnPath
              color={palette.amber700}
              d="M 1196 800 C 1160 812, 1130 806, 1106 786"
              from={NOTE_AT + 6}
              length={100}
              to={NOTE_AT + 20}
            />
            <DrawnPath
              color={palette.amber700}
              d="M 1106 786 L 1132 788 M 1106 786 L 1114 810"
              from={NOTE_AT + 20}
              length={54}
              to={NOTE_AT + 26}
            />
          </g>
        </svg>
        <Hand
          color={palette.amber700}
          from={NOTE_AT}
          left={1204}
          size={42}
          text="still one"
          to={OUT[0]}
          top={778}
        />

        <Caption
          range={beats.confirm}
          text="The customer gets a confirmation in 0.4 s."
        />
        <Caption
          range={beats.settle}
          text="The payment settles in the background."
        />
        <Caption
          range={beats.ship}
          text="The parcel ships once the ledger matches."
        />
        <Caption
          range={beats.repeat}
          text="The same webhook arrives again. It counts once."
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
