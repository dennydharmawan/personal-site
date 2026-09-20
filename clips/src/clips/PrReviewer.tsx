import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ease } from "../components/kit";
import { Check, Cross, fade, mono } from "../components/shapes";
import { displayFont, palette, uiFont } from "../theme";

/**
 * Reviewer attention is the limited resource, so the clip stays on the diff. A naive
 * bot buries it in comments, then four agents sweep it, the merger re-reads the line
 * each finding cites and drops the one the code contradicts, and the two that remain
 * go to different places.
 */

export const PR_DURATION = 600;

const ROW = 50;
const DIFF = { left: 56, top: 214, width: 800 };
const CARDS = { left: 896, top: 214, width: 488, height: 150, gap: 20 };
const TRAY_TOP = 588;
/** The card lands at the top of the tray and the label sits under it, so the
 * arriving card never travels across the label's text. */
const TRAY_CARD_TOP = TRAY_TOP + 16;
const TRAY_HEIGHT = TRAY_CARD_TOP - TRAY_TOP + CARDS.height + 76;
const CODE_LEFT = 128;

const shots = {
  pile: 0,
  sweep: 120,
  verify: 234,
  route: 348,
  outcome: 462,
  reset: [564, 588],
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
  { kind: "code", line: 89, text: "return q.run();" },
  { kind: "code", line: 90, text: "}" },
  { kind: "file", path: "src/refund/refund.service.ts" },
  {
    kind: "code",
    added: true,
    line: 140,
    text: "await ledger.reverse(orderId);",
  },
  { kind: "code", added: true, line: 141, text: "await notify(orderId);" },
  { kind: "code", added: true, line: 142, text: "return refund;" },
  { kind: "file", path: "src/ledger/balance.ts" },
  { kind: "code", line: 51, text: "await tx.lock(accountId);" },
  { kind: "code", added: true, line: 52, text: "balance.amount -= total;" },
  { kind: "code", line: 53, text: "await tx.commit();" },
  { kind: "code", line: 54, text: "return balance;" },
];

const LOCK_ROW = 10;
const DROPPED_HUNK_FROM = 9;

/** Shot 1: what a single bot posts, one comment per claim, right or wrong. */
const pile = [
  {
    at: 8,
    line: 88,
    row: 2,
    title: "Unvalidated input reaches the SQL builder",
  },
  { at: 26, line: 140, row: 6, title: "Refund path has no test" },
  { at: 44, line: 52, row: 11, title: "Race condition on balance update" },
];
const PILE_OUT = [98, 118];

/** Scan lines, staggered so each label reads on its own. */
const agents = [
  { from: 124, name: "security", to: 196 },
  { from: 134, name: "testing", to: 206 },
  { from: 144, name: "correctness", to: 216 },
  { from: 154, name: "conventions", to: 226 },
];
const SCAN = 4;
const SWEEP_END = rows.length * ROW - SCAN;
/** Constant speed, so the ten-frame stagger holds the same gap between lines
 * for the whole sweep and no two name chips ever share a row. */
const sweepY = (frame: number, agent: (typeof agents)[number]) =>
  interpolate(frame, [agent.from, agent.to], [0, SWEEP_END], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const rowCenterInDiff = (row: number) => row * ROW + ROW / 2;
/** The frame a scan line crosses a row, so a card is raised as its line is read. */
const passFrame = (agent: (typeof agents)[number], row: number) => {
  let frame = agent.from;
  while (frame < agent.to && sweepY(frame, agent) < rowCenterInDiff(row)) {
    frame++;
  }
  return frame;
};

const findings = [
  {
    agent: agents[0],
    checkAt: 258,
    cite: "query.ts:88",
    drawAt: 240,
    row: 2,
    title: "Unvalidated input reaches the SQL builder",
  },
  {
    agent: agents[1],
    checkAt: 270,
    cite: "refund.service.ts:140",
    drawAt: 252,
    row: 6,
    title: "Refund path has no test",
  },
  {
    agent: agents[2],
    checkAt: 300,
    cite: "balance.ts:52",
    drawAt: 264,
    row: 11,
    title: "Race condition on balance update",
  },
].map((finding) => ({
  ...finding,
  raisedAt: passFrame(finding.agent, finding.row),
}));

const SECURITY = 0;
const TESTING = 1;
const DROPPED = 2;
const LOCK_LIT = [284, 296];
const DIM = [324, 342];
const CLEAR = [shots.route, shots.route + 14];
const TRAY_IN = [366, 382];
/** The card empties before it moves, so its text never crosses the code. */
const CARD_TEXT_OUT = [386, 392];
const TO_COMMENT = [392, 410];
/**
 * The comment box turns solid on the frame the card lands, under it, and the
 * card fades off that identical rectangle while the comment's text wipes in.
 */
const COMMENT_BOX_IN = [409, 410];
const CARD_LIFT = [410, 414];
const COMMENT_IN = [410, 424];
const TO_TRAY = [478, 508];
/**
 * Card travel. The kit's ease covers 99% of the distance in its first third,
 * which leaves a card sitting still while its trip is nominally still running;
 * this one keeps moving until it arrives.
 */
const travel = (frame: number, range: number[], to: number) =>
  interpolate(frame, range, [0, to], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const captions = [
  { at: [6, 16, 108, 118], text: "Every finding posts, right or wrong." },
  {
    at: [120, 130, 222, 232],
    text: "Four specialist agents review in parallel.",
  },
  {
    at: [234, 244, 336, 346],
    text: "Findings without code evidence get dropped.",
  },
  { at: [348, 358, 450, 460], text: "Security findings never auto-post." },
  {
    at: [462, 470, 560, 572],
    text: "Only evidence-backed findings reach a human.",
  },
];

const rowCenter = (index: number) => DIFF.top + rowCenterInDiff(index);
/** Comment geometry inside the diff; the diff's 1px border offsets it on the canvas. */
const commentLeft = CODE_LEFT - 18;
const commentRight = 20;
const commentTop = (row: number) => (row + 1) * ROW + 6;
const COMMENT_HEIGHT = 2 * ROW - 12;
const withAlpha = (hex: string, alpha: number) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
const cardTop = (index: number) =>
  CARDS.top + index * (CARDS.height + CARDS.gap);

const Caption: React.FC<{
  readonly at: readonly number[];
  readonly text: string;
}> = ({ at, text }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: DIFF.left,
        top: 122,
        fontFamily: uiFont,
        fontSize: 44,
        fontWeight: 500,
        whiteSpace: "nowrap",
        color: palette.zinc700,
        opacity: fade(frame, [...at], [0, 1, 1, 0]),
        translate: `0px ${fade(frame, [at[0], at[1] + 4], [10, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

/**
 * Revealed top-down by a wipe at full opacity, so its text never double-exposes
 * the code under it. `boxIn` wipes the box, `textIn` wipes the text inside it;
 * splitting the two lets the box arrive solid under a card that is landing.
 */
const CommentBox: React.FC<{
  readonly boxIn: number;
  readonly line: number;
  readonly row: number;
  readonly textIn: number;
  readonly title: string;
  readonly y: number;
}> = ({ boxIn, line, row, textIn, title, y }) => (
  <div
    style={{
      position: "absolute",
      left: commentLeft,
      right: commentRight,
      top: commentTop(row),
      height: COMMENT_HEIGHT,
      boxSizing: "border-box",
      padding: "12px 18px",
      borderRadius: 10,
      border: `1px solid ${palette.zinc200}`,
      backgroundColor: "#ffffff",
      boxShadow: `0 6px 18px ${withAlpha(palette.zinc900, 0.08)}`,
      fontFamily: uiFont,
      opacity: boxIn > 0 ? 1 : 0,
      clipPath: `inset(-24px -24px ${(1 - boxIn) * (COMMENT_HEIGHT + 48) - 24}px -24px)`,
      translate: `0px ${y}px`,
    }}
  >
    <div style={{ clipPath: `inset(0 0 ${(1 - textIn) * 100}% 0)` }}>
      <div style={{ fontSize: 21, fontWeight: 600, color: palette.zinc500 }}>
        review bot commented on line {line}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 27,
          fontWeight: 500,
          color: palette.zinc900,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
    </div>
  </div>
);

const Diff: React.FC = () => {
  const frame = useCurrentFrame();
  const clear = fade(frame, CLEAR, [1, 0]);
  const droppedDim = fade(
    frame,
    [DIM[0], DIM[1], shots.reset[0], shots.reset[1]],
    [1, 0.4, 0.4, 1],
  );
  const lockLit = fade(frame, LOCK_LIT, [0, 1]) * clear;
  const commentBox = fade(
    frame,
    [COMMENT_BOX_IN[0], COMMENT_BOX_IN[1], shots.reset[0], shots.reset[1]],
    [0, 1, 1, 0],
  );
  const commentOpen = fade(
    frame,
    [COMMENT_IN[0], COMMENT_IN[1], shots.reset[0], shots.reset[1]],
    [0, 1, 1, 0],
  );
  const cited = (index: number) => {
    const finding = findings.find((item) => item.row === index);
    if (finding) {
      return (
        fade(frame, [finding.raisedAt - 6, finding.raisedAt + 6], [0, 1]) *
        clear
      );
    }
    return index === LOCK_ROW ? lockLit : 0;
  };

  return (
    <div
      style={{
        position: "absolute",
        left: DIFF.left,
        top: DIFF.top,
        width: DIFF.width,
        height: rows.length * ROW,
        borderRadius: 14,
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {rows.map((row, index) => {
        const citedProgress = cited(index);

        return (
          <div
            key={index}
            style={{
              opacity: index >= DROPPED_HUNK_FROM ? droppedDim : 1,
            }}
          >
            {row.kind === "file" ? (
              <div
                style={{
                  height: ROW,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 20px",
                  backgroundColor: palette.zinc50,
                  borderTop:
                    index === 0 ? "none" : `1px solid ${palette.zinc200}`,
                  borderBottom: `1px solid ${palette.zinc200}`,
                  fontFamily: mono,
                  fontSize: 24,
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
                  fontSize: 28,
                  backgroundColor: row.added ? palette.emerald50 : "#ffffff",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: palette.sky100,
                    borderLeft: `${SCAN}px solid ${palette.sky700}`,
                    opacity: citedProgress,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 84,
                    textAlign: "right",
                    color: palette.zinc600,
                  }}
                >
                  {row.line}
                </span>
                <span
                  style={{
                    position: "relative",
                    width: CODE_LEFT - 84,
                    textAlign: "center",
                    color: palette.emerald700,
                  }}
                >
                  {row.added ? "+" : ""}
                </span>
                <span
                  style={{
                    position: "relative",
                    color: palette.zinc900,
                    whiteSpace: "pre",
                  }}
                >
                  {row.text}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {pile.map((comment) => (
        <CommentBox
          boxIn={fade(
            frame,
            [comment.at, comment.at + 14, PILE_OUT[0], PILE_OUT[1]],
            [0, 1, 1, 0],
          )}
          key={comment.line}
          line={comment.line}
          row={comment.row}
          textIn={1}
          title={comment.title}
          y={fade(frame, [comment.at, comment.at + 16], [-14, 0])}
        />
      ))}

      <CommentBox
        boxIn={commentBox}
        line={140}
        row={findings[TESTING].row}
        textIn={commentOpen}
        title={findings[TESTING].title}
        y={0}
      />

      {agents.map((agent) => {
        const y = sweepY(frame, agent);
        return (
          <div
            key={agent.name}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: SCAN,
              backgroundColor: palette.sky700,
              opacity: fade(
                frame,
                [agent.from, agent.from + 8, agent.to - 8, agent.to],
                [0, 1, 1, 0],
              ),
            }}
          >
            {/* Right of the longest code line: the only lane in the diff where an
                opaque chip covers neither the line number nor the code. */}
            <div
              style={{
                position: "absolute",
                right: 12,
                top: interpolate(y, [SWEEP_END - ROW, SWEEP_END], [6, -42], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                padding: "2px 10px",
                borderRadius: 6,
                backgroundColor: palette.sky700,
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
  const fromX = DIFF.left + DIFF.width;
  const toX = CARDS.left;
  const fromY = rowCenter(finding.row);
  const toY = cardTop(index) + CARDS.height / 2;
  const middle = (fromX + toX) / 2;
  const length = toX - fromX + Math.abs(toY - fromY);
  const d = `M ${toX} ${toY} H ${middle} V ${fromY} H ${fromX}`;
  const drawn = fade(frame, [finding.drawAt, finding.drawAt + 18], [0, 1]);
  const visible = fade(frame, CLEAR, [1, 0]);
  const dropped =
    index === DROPPED
      ? fade(frame, [finding.checkAt, finding.checkAt + 12], [0, 1])
      : 0;

  return (
    <g opacity={visible}>
      <path
        d={d}
        fill="none"
        opacity={1 - dropped}
        stroke={palette.sky700}
        strokeDasharray={`${length} ${length}`}
        strokeDashoffset={(1 - drawn) * length}
        strokeWidth={SCAN}
      />
      <path
        d={d}
        fill="none"
        opacity={dropped * 0.7}
        stroke={palette.zinc400}
        strokeDasharray="8 10"
        strokeWidth={SCAN}
      />
    </g>
  );
};

const FindingCard: React.FC<{ readonly index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const finding = findings[index];
  const dropped = index === DROPPED;
  const judged = fade(frame, [finding.checkAt, finding.checkAt + 12], [0, 1]);
  const raised = fade(frame, [finding.raisedAt, finding.raisedAt + 12], [0, 1]);
  const presence =
    index === DROPPED
      ? fade(
          frame,
          [finding.checkAt + 4, finding.checkAt + 20, CLEAR[0], CLEAR[1] + 2],
          [1, 0.5, 0.5, 0],
        )
      : index === TESTING
        ? fade(frame, CARD_LIFT, [1, 0])
        : fade(frame, [...shots.reset], [1, 0]);
  const toTray =
    index === SECURITY
      ? travel(frame, TO_TRAY, TRAY_CARD_TOP - cardTop(SECURITY))
      : 0;
  /** The testing card travels onto the diff and takes the comment's shape, so it
   * visibly becomes the comment. The target rectangle is the comment box to the
   * pixel, so the handoff between the two reads as one object. */
  const toComment = index === TESTING ? travel(frame, TO_COMMENT, 1) : 0;
  const morph = (from: number, to: number) => from + (to - from) * toComment;
  const text = index === TESTING ? fade(frame, CARD_TEXT_OUT, [1, 0]) : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: morph(CARDS.left, DIFF.left + 1 + commentLeft),
        top: morph(cardTop(index), DIFF.top + 1 + commentTop(finding.row)),
        width: morph(CARDS.width, DIFF.width - 2 - commentLeft - commentRight),
        height: morph(CARDS.height, COMMENT_HEIGHT),
        boxSizing: "border-box",
        padding: "18px 22px",
        borderRadius: morph(14, 10),
        border: `1px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        fontFamily: uiFont,
        opacity: raised * presence,
        translate: `${fade(frame, [finding.raisedAt, finding.raisedAt + 16], [36, 0])}px ${toTray}px`,
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
          opacity: text,
        }}
      >
        <span
          style={{
            padding: "2px 12px",
            borderRadius: 6,
            backgroundColor: palette.sky100,
            color: palette.sky800,
          }}
        >
          {finding.agent.name}
        </span>
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
          opacity: text,
          marginTop: 10,
          fontSize: 29,
          fontWeight: 600,
          lineHeight: 1.2,
          color: palette.zinc900,
          textDecoration: dropped ? "line-through" : "none",
          textDecorationThickness: 3,
          textDecorationColor: withAlpha(
            palette.zinc500,
            fade(frame, [finding.checkAt + 4, finding.checkAt + 16], [0, 1]),
          ),
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
          opacity: judged * text,
          scale: interpolate(judged, [0, 1], [0.6, 1], {
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

const Tray: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: CARDS.left - 16,
        top: TRAY_TOP,
        width: CARDS.width + 32,
        height: TRAY_HEIGHT,
        boxSizing: "border-box",
        borderRadius: 18,
        border: `2px dashed ${palette.zinc300}`,
        backgroundColor: palette.sky100,
        opacity: fade(
          frame,
          [TRAY_IN[0], TRAY_IN[1], shots.reset[0], shots.reset[1]],
          [0, 1, 1, 0],
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: uiFont,
          fontSize: 30,
          fontWeight: 600,
          color: palette.zinc700,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: palette.amber500,
          }}
        />
        Held · not posted
      </div>
    </div>
  );
};

export const PrReviewer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.sky50 }}>
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
          Pull request #418
        </div>
        <div
          style={{ fontFamily: uiFont, fontSize: 28, color: palette.sky800 }}
        >
          orders-service, 3 files changed
        </div>
      </div>

      <Diff />
      <Tray />

      <svg height={960} style={{ position: "absolute", inset: 0 }} width={1440}>
        {findings.map((_, index) => (
          <Connector index={index} key={index} />
        ))}
      </svg>

      {findings.map((_, index) => (
        <FindingCard index={index} key={index} />
      ))}

      {captions.map((caption) => (
        <Caption at={caption.at} key={caption.text} text={caption.text} />
      ))}
    </AbsoluteFill>
  );
};
