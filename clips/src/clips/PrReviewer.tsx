import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ease } from "../components/kit";
import { Check, Cross, fade, mono } from "../components/shapes";
import { displayFont, palette, uiFont } from "../theme";

/**
 * Reviewer attention is the limited resource, so the clip stays on the diff. Agents
 * sweep it and raise findings, the merger re-reads the line each finding cites and
 * drops the one the code contradicts, and the two that remain go to different places.
 */

const ROW = 60;
const DIFF = { left: 56, top: 214, width: 800 };
const CARDS = { left: 896, top: 214, width: 488, height: 150, gap: 20 };

const beats = {
  sweep: [44, 150],
  verify: [150, 292],
  route: [292, 424],
  out: [426, 446],
} as const;

type Row =
  | { readonly kind: "file"; readonly path: string }
  | {
      readonly kind: "code";
      readonly added?: boolean;
      readonly line: number;
      readonly text: string;
    };

const rows: Row[] = [
  { kind: "file", path: "src/orders/query.ts" },
  { kind: "code", line: 87, text: "const q = orders.select();" },
  {
    kind: "code",
    added: true,
    line: 88,
    text: "q.whereRaw(req.query.filter);",
  },
  { kind: "file", path: "src/refund/refund.service.ts" },
  {
    kind: "code",
    added: true,
    line: 140,
    text: "await ledger.reverse(orderId);",
  },
  { kind: "code", added: true, line: 141, text: "await notify(orderId);" },
  { kind: "file", path: "src/ledger/balance.ts" },
  { kind: "code", line: 51, text: "await tx.lock(accountId);" },
  { kind: "code", added: true, line: 52, text: "balance.amount -= total;" },
];

const agents = [
  { color: palette.rose600, from: 48, name: "security", to: 112 },
  { color: palette.amber500, from: 58, name: "testing", to: 124 },
  { color: palette.sky600, from: 68, name: "correctness", to: 136 },
  { color: palette.zinc400, from: 78, name: "conventions", to: 146 },
];

const findings = [
  {
    agent: "security",
    cite: "query.ts:88",
    color: palette.rose600,
    raisedAt: 70,
    row: 2,
    title: "Unvalidated input reaches the SQL builder",
    verifiedAt: 184,
  },
  {
    agent: "testing",
    cite: "refund.service.ts:140",
    color: palette.amber500,
    raisedAt: 96,
    row: 4,
    title: "Refund path has no test",
    verifiedAt: 212,
  },
  {
    agent: "correctness",
    cite: "balance.ts:52",
    color: palette.sky600,
    raisedAt: 132,
    row: 8,
    title: "Race condition on balance update",
    verifiedAt: 246,
  },
];

const COMMENT_ROW = 4;
const COMMENT_HEIGHT = 128;
const DROPPED = 2;
const LOCK_ROW = 7;

const rowCenter = (index: number) => DIFF.top + index * ROW + ROW / 2;
const cardTop = (index: number) =>
  CARDS.top + index * (CARDS.height + CARDS.gap);

const Caption: React.FC<{
  readonly from: number;
  readonly text: string;
  readonly to: number;
}> = ({ from, text, to }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: DIFF.left,
        top: 124,
        fontFamily: uiFont,
        fontSize: 38,
        fontWeight: 500,
        color: palette.zinc700,
        opacity: fade(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0]),
        translate: `0px ${fade(frame, [from, from + 14], [10, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

const Diff: React.FC = () => {
  const frame = useCurrentFrame();
  const commentOpen = fade(
    frame,
    [beats.route[0] + 34, beats.route[0] + 58, beats.out[0], beats.out[1]],
    [0, 1, 1, 0],
  );
  const droppedDim = fade(
    frame,
    [
      findings[DROPPED].verifiedAt + 10,
      findings[DROPPED].verifiedAt + 30,
      beats.out[0],
      beats.out[1],
    ],
    [1, 0.4, 0.4, 1],
  );
  const settle = fade(frame, [beats.out[0], beats.out[1]], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: DIFF.left,
        top: DIFF.top,
        width: DIFF.width,
        borderRadius: 14,
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {rows.map((row, index) => {
        const finding = findings.find((item) => item.row === index);
        const flagged = finding
          ? fade(frame, [finding.raisedAt - 6, finding.raisedAt + 6], [0, 1])
          : 0;
        const lockLit =
          index === LOCK_ROW
            ? fade(
                frame,
                [
                  findings[DROPPED].verifiedAt - 22,
                  findings[DROPPED].verifiedAt - 8,
                ],
                [0, 1],
              )
            : 0;
        const inDroppedHunk = index >= 6;

        return (
          <div key={index} style={{ opacity: inDroppedHunk ? droppedDim : 1 }}>
            {row.kind === "file" ? (
              <div
                style={{
                  height: ROW,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 20px",
                  backgroundColor: palette.zinc50,
                  borderTop:
                    index === 0 ? "none" : `1px solid ${palette.zinc200}`,
                  borderBottom: `1px solid ${palette.zinc200}`,
                  fontFamily: mono,
                  fontSize: 25,
                  color: palette.zinc600,
                }}
              >
                {row.path}
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  height: ROW,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: mono,
                  fontSize: 30,
                  backgroundColor: row.added ? palette.emerald50 : "#ffffff",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: finding?.color ?? palette.emerald200,
                    opacity:
                      (finding ? flagged * 0.16 : lockLit * 0.55) * settle,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 84,
                    textAlign: "right",
                    color: palette.zinc400,
                  }}
                >
                  {row.line}
                </span>
                <span
                  style={{
                    position: "relative",
                    width: 44,
                    textAlign: "center",
                    color: palette.emerald600,
                  }}
                >
                  {row.added ? "+" : ""}
                </span>
                <span
                  style={{
                    position: "relative",
                    color: palette.zinc800,
                    whiteSpace: "pre",
                  }}
                >
                  {row.text}
                </span>
              </div>
            )}
            {index === COMMENT_ROW ? (
              <div
                style={{
                  height: commentOpen * COMMENT_HEIGHT,
                  overflow: "hidden",
                  backgroundColor: palette.zinc50,
                }}
              >
                <div
                  style={{
                    margin: "14px 20px 14px 128px",
                    padding: "14px 18px",
                    borderRadius: 10,
                    border: `1px solid ${palette.zinc200}`,
                    backgroundColor: "#ffffff",
                    fontFamily: uiFont,
                    opacity: fade(
                      frame,
                      [beats.route[0] + 48, beats.route[0] + 64],
                      [0, 1],
                    ),
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: palette.zinc500,
                    }}
                  >
                    review bot commented on line 140
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 27,
                      fontWeight: 500,
                      color: palette.zinc900,
                    }}
                  >
                    Refund path has no test
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}

      {agents.map((agent) => {
        const progress = interpolate(frame, [agent.from, agent.to], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={agent.name}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: progress * rows.length * ROW,
              height: 2,
              backgroundColor: agent.color,
              opacity: fade(
                frame,
                [agent.from, agent.from + 6, agent.to - 6, agent.to],
                [0, 0.7, 0.7, 0],
              ),
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 12,
                top: -34,
                padding: "2px 10px",
                borderRadius: 6,
                backgroundColor: agent.color,
                fontFamily: uiFont,
                fontSize: 22,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {agent.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Connector: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const finding = findings[index];
  const dropped = index === DROPPED;
  const fromX = DIFF.left + DIFF.width;
  const toX = CARDS.left;
  const fromY = rowCenter(finding.row);
  const toY = cardTop(index) + CARDS.height / 2;
  const middle = (fromX + toX) / 2;
  const length = toX - fromX + Math.abs(toY - fromY);
  const drawn = fade(
    frame,
    [finding.verifiedAt - 34, finding.verifiedAt - 6],
    [0, 1],
  );
  const settled = fade(
    frame,
    [finding.verifiedAt, finding.verifiedAt + 10],
    [0, 1],
  );

  return (
    <path
      d={`M ${toX} ${toY} H ${middle} V ${fromY} H ${fromX}`}
      fill="none"
      opacity={
        fade(
          frame,
          [
            finding.verifiedAt - 34,
            finding.verifiedAt - 28,
            beats.route[0],
            beats.route[0] + 14,
          ],
          [0, 1, 1, 0],
        ) * (dropped ? 1 - settled * 0.6 : 1)
      }
      stroke={dropped && settled > 0.5 ? palette.zinc400 : finding.color}
      strokeDasharray={dropped && settled > 0.5 ? "6 8" : `${length} ${length}`}
      strokeDashoffset={dropped && settled > 0.5 ? 0 : (1 - drawn) * length}
      strokeWidth={3}
    />
  );
};

const FindingCard: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const finding = findings[index];
  const dropped = index === DROPPED;
  const verified = fade(
    frame,
    [finding.verifiedAt, finding.verifiedAt + 10],
    [0, 1],
  );
  const routeStart = beats.route[0] + (index === 0 ? 8 : 26);
  const routed = dropped
    ? 0
    : fade(frame, [routeStart, routeStart + 30], [0, 1]);
  const trayTop = 738;
  const shiftY = index === 0 ? routed * (trayTop - cardTop(0)) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: CARDS.left,
        top: cardTop(index),
        width: CARDS.width,
        height: CARDS.height,
        boxSizing: "border-box",
        padding: "18px 22px",
        borderRadius: 14,
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        fontFamily: uiFont,
        opacity:
          fade(frame, [finding.raisedAt, finding.raisedAt + 12], [0, 1]) *
          (dropped
            ? fade(
                frame,
                [finding.verifiedAt + 8, finding.verifiedAt + 24, 276, 292],
                [1, 0.45, 0.45, 0],
              )
            : 1) *
          (index === 1 ? 1 - routed : 1),
        translate: `${fade(frame, [finding.raisedAt, finding.raisedAt + 16], [-36, 0])}px ${shiftY}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 23,
          fontWeight: 600,
          color: palette.zinc500,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: finding.color,
          }}
        />
        {finding.agent}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: mono,
            fontSize: 22,
            fontWeight: 400,
          }}
        >
          {finding.cite}
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 29,
          fontWeight: 600,
          lineHeight: 1.2,
          color: palette.zinc900,
          textDecoration: dropped && verified > 0.5 ? "line-through" : "none",
          textDecorationColor: palette.zinc400,
        }}
      >
        {finding.title}
      </div>
      <div
        style={{
          position: "absolute",
          right: -16,
          top: -16,
          width: 40,
          height: 40,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: dropped ? palette.zinc500 : palette.emerald600,
          opacity: verified,
          scale: interpolate(verified, [0, 1], [0.6, 1], {
            easing: ease,
            output: "perceptual-scale",
          }),
        }}
      >
        {dropped ? (
          <Cross color="#ffffff" size={24} />
        ) : (
          <Check color="#ffffff" size={24} />
        )}
      </div>
    </div>
  );
};

const DropNote: React.FC = () => {
  const frame = useCurrentFrame();
  const at = findings[DROPPED].verifiedAt;
  return (
    <div
      style={{
        position: "absolute",
        left: CARDS.left,
        top: cardTop(DROPPED) + CARDS.height + 14,
        width: CARDS.width,
        fontFamily: uiFont,
        fontSize: 26,
        lineHeight: 1.3,
        color: palette.zinc600,
        opacity: fade(frame, [at + 6, at + 20, 276, 292], [0, 1, 1, 0]),
      }}
    >
      Line 51 already takes the lock, so the merger drops it.
    </div>
  );
};

const Tray: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: CARDS.left - 16,
        top: 684,
        width: CARDS.width + 32,
        height: 222,
        boxSizing: "border-box",
        padding: "14px 20px",
        borderRadius: 18,
        border: `2px dashed ${palette.zinc300}`,
        fontFamily: uiFont,
        fontSize: 25,
        fontWeight: 600,
        color: palette.zinc600,
        opacity: fade(frame, [beats.route[0], beats.route[0] + 16], [0, 1]),
      }}
    >
      Private Slack queue, security team only
    </div>
  );
};

export const PrReviewer: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: palette.zinc100 }}>
      <div
        style={{
          position: "absolute",
          left: DIFF.left,
          right: DIFF.left,
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
          orders-service #418
        </div>
        <div
          style={{ fontFamily: uiFont, fontSize: 28, color: palette.zinc500 }}
        >
          6 files changed, 214 additions
        </div>
      </div>

      <Diff />

      <AbsoluteFill
        style={{
          opacity: fade(frame, [beats.out[0], beats.out[1]], [1, 0]),
        }}
      >
        <Tray />

        <svg
          height={960}
          style={{ position: "absolute", inset: 0 }}
          width={1440}
        >
          {findings.map((_, index) => (
            <Connector index={index} key={index} />
          ))}
        </svg>

        {findings.map((_, index) => (
          <FindingCard index={index} key={index} />
        ))}
        <DropNote />

        <Caption
          from={beats.sweep[0]}
          text="Four agents review the same diff at once."
          to={beats.sweep[1]}
        />
        <Caption
          from={beats.verify[0]}
          text="The merger re-reads the code each finding cites."
          to={beats.verify[1]}
        />
        <Caption
          from={beats.route[0]}
          text="Security goes to a private queue. The rest posts on the PR."
          to={beats.route[1]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
