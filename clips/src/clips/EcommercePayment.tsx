import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CardSubject, CardTitle, Chip, ClipCard } from "../components/kit";
import { Act, Lane, ResultRow, Stage } from "../components/shapes";

/**
 * Storefront and money run on separate clocks. The customer gets an answer in
 * under a second; the processor takes as long as it takes; fulfillment waits
 * for the ledger rather than for the customer.
 */
export const EcommercePayment: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Backdrop tone="pink" />
      <ClipCard>
        <Chip label="order 20418" tone="teal" />
        <CardTitle>IDR 1,240,000</CardTitle>
        <CardSubject>checkout · card · single capture</CardSubject>

        <Stage>
          <Act from={18} to={136} caption="the storefront finishes before the money does">
            <div style={{ display: "flex", flexDirection: "column", gap: 46 }}>
            <Lane
              label="storefront"
              states={[
                { label: "cart", start: 32 },
                { label: "checkout", start: 44 },
                { label: "order placed", start: 56 },
              ]}
              tone="teal"
            />
            <Lane
              label="money"
              states={[
                { label: "authorized", start: 64 },
                { label: "captured", start: 82 },
                { label: "payout", start: 96 },
              ]}
              tone="amber"
            />
            </div>
          </Act>

          <Act from={136} to={254} caption="the processor answers on its own schedule">
            <ResultRow
              detail="payment_intent.succeeded"
              label="webhook received"
              pending="listening"
              result="applied"
              start={158}
              tone="teal"
            />
            <ResultRow
              detail="payment_intent.succeeded · same event id"
              dropped
              icon="dash"
              label="webhook received again"
              pending="listening"
              result="ignored, already applied"
              start={182}
              tone="slate"
            />
            <ResultRow
              detail="processor payout vs order ledger"
              label="reconciled"
              pending="matching"
              result="balances once"
              start={208}
              tone="teal"
            />
          </Act>

          <Act from={254} to={356} caption="fulfillment waits for the ledger, not the customer">
            <ResultRow
              detail="money side agrees"
              label="fulfillment released"
              pending="holding"
              result="warehouse notified"
              start={276}
              tone="green"
            />
            <ResultRow
              detail="no processor call on the storefront path"
              label="storefront never blocked"
              pending="checking"
              result="returns immediately"
              start={292}
              tone="teal"
            />
          </Act>
        </Stage>
      </ClipCard>
    </AbsoluteFill>
  );
};
