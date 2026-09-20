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
 * One order seen from three seats. The storefront waits on a payment it cannot see,
 * the payment intent moves through explicit states, the provider's webhook confirms
 * the order, and reconciliation matches the captured amount to the order total.
 */

/** Runs 18 s, longer than the default, so only one thing changes at a time. */
export const ECOMMERCE_DURATION = 540;
const OUT = [512, 538] as const;
const useSettle = () => useSettleAt(OUT);

const MARGIN = 56;
const CARD = { top: 214, height: 666 };
const COLS = {
  customer: { left: 56, width: 392 },
  payment: { left: 500, width: 440 },
  ledger: { left: 992, width: 392 },
};

const beats = {
  problem: [4, 138],
  states: [138, 252],
  webhook: [252, 396],
  reconcile: [396, 512],
} as const;

const PAY_AT = 40;
const NOTE = [66, 138] as const;
const CONFIRM_ARROW = [308, 326] as const;
const CONFIRMED_AT = 330;
const HANDOFF = [408, 426] as const;
/** The ledger draws its bracket around the two amounts before it compares them. */
const COMPARE = [428, 452] as const;
const MATCHED_AT = 452;

/**
 * Each rail step is pending, then active (accent ring), then done (emerald disc).
 * The webhook step also waits on the provider before it becomes active.
 */
const steps: ReadonlyArray<{
  readonly at: number;
  readonly doneAt: number;
  readonly label: string;
  readonly sub?: string;
  readonly waitingAt?: number;
  readonly y: number;
}> = [
  { at: 146, doneAt: 186, label: "authorized", y: 318 },
  { at: 200, doneAt: 228, label: "captured", y: 428 },
  {
    at: 296,
    doneAt: 326,
    label: "webhook received",
    sub: "evt_81f2",
    waitingAt: 242,
    y: 538,
  },
  { at: 400, doneAt: MATCHED_AT, label: "reconciled", y: 668 },
];

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
      border: `1px solid ${palette.zinc200}`,
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
        backgroundColor: palette.fuchsia100,
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
  /**
   * The three button labels never share the slot. "Pay now" is out before the
   * spinner fades in, and the spinner is out before the check starts.
   */
  const busy = fade(
    frame,
    [PAY_AT + 8, PAY_AT + 16, CONFIRMED_AT - 10, CONFIRMED_AT - 1],
    [0, 1, 1, 0],
  );
  const started = fade(frame, [PAY_AT + 2, PAY_AT + 12], [0, 1]) * settle;
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
            [palette.fuchsia700, palette.emerald600],
          ),
          fontSize: 30,
          fontWeight: 600,
          color: "#ffffff",
          scale: interpolate(press, [0, 1], [1, 0.96], {
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            ...label,
            opacity: interpolate(Math.max(started, done), [0, 0.45], [1, 0], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Pay now
        </div>
        <div style={{ ...label, opacity: busy }}>
          <svg
            height={30}
            style={{ rotate: `${frame * 9}deg` }}
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
          Payment pending
        </div>
        <div
          style={{
            ...label,
            // During the reset "Pay now" returns below 0.45, so the higher
            // threshold keeps the check and the label from overlapping.
            opacity: interpolate(
              done,
              [frame < OUT[0] ? 0.1 : 0.55, 1],
              [0, 1],
              { extrapolateLeft: "clamp" },
            ),
          }}
        >
          <Check color="#ffffff" size={40} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          bottom: 44,
          textAlign: "center",
          fontSize: 28,
          fontWeight: 600,
          color: palette.zinc900,
          opacity: done,
        }}
      >
        Order confirmed
      </div>
    </Panel>
  );
};

const Step: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const step = steps[index];
  const next = steps[index + 1];
  const on = fade(frame, [step.at, step.at + 10], [0, 1]) * settle;
  const done = fade(frame, [step.doneAt, step.doneAt + 10], [0, 1]) * settle;
  /** Out before the label arrives, so the pill and the label never overlap. */
  const waiting =
    step.waitingAt === undefined
      ? 0
      : fade(
          frame,
          [step.waitingAt, step.waitingAt + 10, step.at - 12, step.at - 4],
          [0, 1, 1, 0],
        ) * settle;
  const present =
    fade(
      frame,
      [step.waitingAt ?? step.at, (step.waitingAt ?? step.at) + 10],
      [0, 1],
    ) * settle;
  const pulse = ((frame - step.at) % 30) / 30;
  const top = step.y - CARD.top;
  const ring = interpolateColors(
    done,
    [0, 1],
    [
      interpolateColors(on, [0, 1], [palette.zinc300, palette.fuchsia700]),
      palette.emerald600,
    ],
  );

  return (
    <>
      {next ? (
        <Connector from={step} next={next} top={top} />
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
          border: `4px solid ${ring}`,
          opacity: on * (1 - done) * (1 - pulse),
          scale: 1 + pulse * 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 32,
          top,
          width: 34,
          height: 34,
          boxSizing: "border-box",
          borderRadius: 17,
          border: `4px solid ${ring}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: interpolateColors(
            done,
            [0, 1],
            ["#ffffff", palette.emerald600],
          ),
          scale: interpolate(present, [0, 1], [0.8, 1], {
            output: "perceptual-scale",
          }),
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: palette.amber500,
            opacity: waiting,
          }}
        />
        <div style={{ display: "flex", opacity: done }}>
          <Check color="#ffffff" size={22} />
        </div>
      </div>
      {step.waitingAt === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: 88,
            top: top - 4,
            padding: "3px 14px",
            borderRadius: 999,
            border: `2px solid ${palette.amber200}`,
            backgroundColor: palette.amber50,
            color: palette.amber700,
            fontSize: 22,
            fontWeight: 600,
            whiteSpace: "nowrap",
            opacity: waiting,
          }}
        >
          awaiting provider
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 32,
          top: top - 5,
          opacity: on,
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            fontSize: 27,
            fontWeight: 600,
            color: palette.zinc900,
          }}
        >
          {step.label}
        </div>
        {step.sub ? (
          <div
            style={{
              display: "inline-block",
              marginTop: 6,
              padding: "2px 10px",
              borderRadius: 8,
              backgroundColor: palette.zinc100,
              fontFamily: codeFont,
              fontSize: 22,
              whiteSpace: "nowrap",
              color: palette.zinc700,
            }}
          >
            {step.sub}
          </div>
        ) : null}
      </div>
    </>
  );
};

/** The track fills in the accent as the next step arrives, then greys out once it is done. */
const Connector: React.FC<{
  readonly from: (typeof steps)[number];
  readonly next: (typeof steps)[number];
  readonly top: number;
}> = ({ from, next, top }) => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const fill = fade(frame, [next.at - 20, next.at], [0, 1]) * settle;
  const nextDone = fade(frame, [next.doneAt, next.doneAt + 10], [0, 1]);
  const height = next.y - from.y - 34;
  const track: React.CSSProperties = {
    position: "absolute",
    left: 47,
    top: top + 34,
    width: 4,
    height,
  };

  return (
    <>
      <div style={{ ...track, backgroundColor: palette.zinc200 }} />
      <div
        style={{
          ...track,
          height: height * fill,
          backgroundColor: interpolateColors(
            nextDone,
            [0, 1],
            [palette.fuchsia700, palette.zinc300],
          ),
        }}
      />
    </>
  );
};

const Amount: React.FC<{
  readonly children: React.ReactNode;
  readonly label: string;
  readonly top: number;
}> = ({ children, label, top }) => (
  <div style={{ position: "absolute", left: 64, right: 32, top }}>
    <div style={{ fontSize: 24, color: palette.zinc500 }}>{label}</div>
    <div
      style={{
        position: "relative",
        height: 44,
        marginTop: 6,
        fontFamily: codeFont,
        fontSize: 32,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </div>
);

const Reconciliation: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = useSettle();
  const matched = fade(frame, [MATCHED_AT, MATCHED_AT + 12], [0, 1]) * settle;
  const compared = fade(frame, [COMPARE[0], COMPARE[1]], [0, 1]) * settle;
  /** The mark arrives with the handoff, so no unlabelled shape waits on screen. */
  const mark = fade(frame, [HANDOFF[1], HANDOFF[1] + 10], [0, 1]) * settle;
  const layer: React.CSSProperties = { position: "absolute", left: 0, top: 0 };

  return (
    <Panel col={COLS.ledger} title="Reconciliation">
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 124,
          width: 8,
          height: interpolate(compared, [0, 1], [0, 170]),
          borderRadius: 4,
          backgroundColor: interpolateColors(
            matched,
            [0, 1],
            [palette.fuchsia700, palette.emerald600],
          ),
        }}
      />
      <Amount label="Order total" top={108}>
        <div style={{ ...layer, color: palette.zinc900 }}>IDR 1,240,000</div>
      </Amount>
      <Amount label="Captured payment" top={218}>
        <div
          style={{
            ...layer,
            color: palette.zinc300,
            opacity: fade(matched, [0, 0.5], [1, 0]),
          }}
        >
          IDR —
        </div>
        <div
          style={{
            ...layer,
            color: palette.zinc900,
            opacity: fade(matched, [0.5, 1], [0, 1]),
          }}
        >
          IDR 1,240,000
        </div>
      </Amount>
      <div
        style={{
          position: "absolute",
          left: 32,
          right: 32,
          top: 409,
          paddingTop: 36,
          borderTop: `1px solid ${palette.zinc200}`,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -14,
            right: -14,
            top: 22,
            bottom: -22,
            borderRadius: 18,
            border: `1px solid ${palette.emerald200}`,
            backgroundColor: palette.emerald50,
            opacity: matched,
          }}
        />
        <div
          style={{
            position: "relative",
            width: 52,
            height: 52,
            boxSizing: "border-box",
            borderRadius: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${interpolateColors(
              matched,
              [0, 1],
              [palette.zinc300, palette.emerald600],
            )}`,
            backgroundColor: interpolateColors(
              matched,
              [0, 1],
              ["#ffffff", palette.emerald600],
            ),
            opacity: mark,
            scale: interpolate(mark, [0, 1], [0.85, 1], {
              output: "perceptual-scale",
            }),
          }}
        >
          <div style={{ display: "flex", opacity: matched }}>
            <Check color="#ffffff" size={28} />
          </div>
        </div>
        <div
          style={{
            position: "relative",
            color: palette.zinc700,
            fontSize: 28,
            fontWeight: 600,
            opacity: matched,
          }}
        >
          matched
        </div>
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
        fontSize: 44,
        fontWeight: 500,
        whiteSpace: "nowrap",
        color: palette.zinc700,
        opacity: fade(
          frame,
          [range[0], range[0] + 10, range[1] - 10, range[1]],
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
  const webhookY = steps[2].y + 17;
  const reconciledY = steps[3].y + 17;
  const handoffX = COLS.payment.left + COLS.payment.width;
  const noteOpacity = fade(
    frame,
    [NOTE[0], NOTE[0] + 10, NOTE[1] - 10, NOTE[1]],
    [0, 1, 1, 0],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: palette.fuchsia50 }}>
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
          style={{
            fontFamily: uiFont,
            fontSize: 28,
            color: palette.fuchsia800,
          }}
        >
          from cart to reconciled payment
        </div>
      </div>

      <Customer />
      <Panel col={COLS.payment} title="Payment">
        {steps.map((_, index) => (
          <Step index={index} key={index} />
        ))}
      </Panel>
      <Reconciliation />

      <AbsoluteFill style={{ opacity: settle }}>
        <svg
          height={960}
          style={{ position: "absolute", inset: 0 }}
          width={1440}
        >
          <g opacity={noteOpacity}>
            <DrawnPath
              color={palette.fuchsia700}
              d="M 664 470 C 636 474, 606 456, 578 444"
              from={NOTE[0] + 8}
              length={96}
              to={NOTE[0] + 20}
            />
            <DrawnPath
              color={palette.fuchsia700}
              d="M 578 444 L 596 458 M 578 444 L 602 440"
              from={NOTE[0] + 20}
              length={52}
              to={NOTE[0] + 26}
            />
          </g>
          <DrawnPath
            color={palette.fuchsia700}
            d={`M ${COLS.payment.left + 14} ${webhookY + 40} C ${COLS.payment.left - 20} ${webhookY + 90}, 470 700, 426 728 m 4 -22 l -4 22 l 22 4`}
            from={CONFIRM_ARROW[0]}
            length={260}
            to={CONFIRM_ARROW[1]}
          />
          <DrawnPath
            color={palette.fuchsia700}
            d={`M ${handoffX + 6} ${reconciledY} L ${COLS.ledger.left - 8} ${reconciledY} m -14 -12 l 14 12 l -14 12`}
            from={HANDOFF[0]}
            length={80}
            to={HANDOFF[1]}
          />
        </svg>
        <Hand
          color={palette.fuchsia700}
          from={NOTE[0]}
          left={676}
          size={46}
          text="paid?"
          to={NOTE[1]}
          top={450}
        />

        <Caption
          range={beats.problem}
          text="The store can't tell if it's paid."
        />
        <Caption
          range={beats.states}
          text="The payment moves through explicit states."
        />
        <Caption
          range={beats.webhook}
          text="The provider's update confirms the order."
        />
        <Caption
          range={beats.reconcile}
          text="Every order matches its payment."
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
