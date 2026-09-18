import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CardSubject, CardTitle, Chip, ClipCard } from "../components/kit";
import { Act, ResultRow, Stage } from "../components/shapes";

/**
 * The system's scarce resource is a reviewer's attention, so the clip is about
 * selectivity: agents produce findings, the merger throws one away for failing
 * its evidence check, and the gate decides which survivor a human ever sees.
 */
export const PrReviewer: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Backdrop tone="sky" />
      <ClipCard>
        <Chip label="code review" tone="sky" />
        <CardTitle>orders-service #418</CardTitle>
        <CardSubject>6 files changed · 214 additions</CardSubject>

        <Stage>
          <Act from={18} to={136} caption="four agents, one diff, in parallel">
            <ResultRow label="security" result="1 finding" start={36} tone="rose" />
            <ResultRow label="testing" result="1 finding" start={50} tone="amber" />
            <ResultRow label="correctness" result="clean" start={66} tone="sky" />
            <ResultRow label="conventions" result="clean" start={82} tone="sky" />
          </Act>

          <Act from={136} to={254} caption="merger checks every citation">
            <ResultRow
              detail="src/orders/query.ts:88"
              label="unvalidated input reaches SQL builder"
              pending="checking"
              result="evidence holds"
              start={158}
              tone="sky"
            />
            <ResultRow
              detail="src/refund/refund.service.ts:140"
              label="refund path has no test"
              pending="checking"
              result="evidence holds"
              start={176}
              tone="sky"
            />
            <ResultRow
              detail="src/ledger/balance.ts:52"
              dropped
              label="race condition on balance update"
              pending="checking"
              result="cited code does not support it"
              start={196}
              tone="rose"
            />
          </Act>

          <Act from={254} to={356} caption="the gate decides who gets interrupted">
            <ResultRow
              detail="security · any severity"
              label="SQL builder finding"
              pending="routing"
              result="private Slack queue"
              start={276}
              tone="amber"
            />
            <ResultRow
              detail="high confidence · not security"
              label="missing refund test"
              pending="routing"
              result="posted inline on the PR"
              start={294}
              tone="sky"
            />
          </Act>
        </Stage>
      </ClipCard>
    </AbsoluteFill>
  );
};
