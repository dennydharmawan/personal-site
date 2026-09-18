import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CardSubject, CardTitle, Chip, ClipCard } from "../components/kit";
import { Act, Bubble, QueueRow, ResultRow, Stage } from "../components/shapes";
import { Cursor } from "../components/Cursor";
import { ease } from "../components/kit";
import { interpolate } from "remotion";
import { useStoryFrame } from "../pace";

/**
 * A collector's working session. The queue decides what to touch, the contact
 * happens where the customer already is, and the outcome goes back to the queue
 * so the next account rises. Ends where it started, which is also the loop.
 */
export const LoanCollection: React.FC = () => {
  const frame = useStoryFrame();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Backdrop tone="sky" />
      <ClipCard>
        <Chip label="collections" tone="amber" />
        <CardTitle>Queue for r.wijaya</CardTitle>
        <CardSubject>12 accounts due today · sorted by exposure</CardSubject>

        <Stage>
          <Act from={18} to={136} caption="the queue decides what to touch">
            <QueueRow account="4471 · Budi S." amount="IDR 1.24m" overdue="32 days" selected selectedAt={78} start={28} />
            <QueueRow account="9130 · Sari W." amount="IDR 2.10m" overdue="9 days" start={38} />
            <QueueRow account="2208 · Andi P." amount="IDR 640k" overdue="18 days" start={48} />
            <QueueRow account="5567 · Rina T." amount="IDR 310k" overdue="4 days" start={58} />
          </Act>

          <Act from={136} to={254} caption="contact on the channel they answer">
              <Bubble start={158} text="Hi Budi, your Flexi Cash instalment of IDR 1,240,000 was due 32 days ago." />
              <Bubble incoming start={190} text="Sorry, I get paid on the 18th. I can pay then." />
              <Bubble start={216} text="Noted. I've logged 18 September and will follow up that morning." />
          </Act>

          <Act from={254} to={356} caption="the outcome goes back to the queue">
            <ResultRow
              detail="18 September · IDR 1,240,000"
              label="promise to pay"
              pending="writing"
              result="logged"
              start={270}
              tone="emerald"
            />
            <QueueRow
              account="4471 · Budi S."
              amount="IDR 1.24m"
              cleared
              clearedAt={288}
              overdue="follow-up 18 Sep"
              start={264}
            />
            <QueueRow account="9130 · Sari W." amount="IDR 2.10m" overdue="9 days" selected selectedAt={302} start={264} />
          </Act>
        </Stage>
      </ClipCard>

      <Cursor
        opacity={interpolate(frame, [48, 60, 110, 124], [0, 1, 1, 0], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        x={interpolate(frame, [48, 80, 110, 128], [1500, 470, 470, 1500], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
        y={interpolate(frame, [48, 80, 110, 128], [1040, 476, 476, 1040], {
          easing: ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
    </AbsoluteFill>
  );
};
