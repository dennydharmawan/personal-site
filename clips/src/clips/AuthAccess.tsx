import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { CardSubject, CardTitle, Chip, ClipCard } from "../components/kit";
import { Act, ResultRow, Stage } from "../components/shapes";

/**
 * Provisioning one joiner means several third-party calls that can each fail
 * halfway. The clip shows the failure and then the replay, because the point of
 * the system is that the second attempt is safe rather than destructive.
 */
export const AuthAccess: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Backdrop tone="violet" />
      <ClipCard>
        <Chip label="joiner" tone="sky" />
        <CardTitle>Provision m.santoso</CardTitle>
        <CardSubject>hris event · engineering · starts today</CardSubject>

        <Stage>
          <Act from={18} to={136} caption="first attempt, and one call fails halfway">
            <ResultRow label="JumpCloud" pending="calling" result="account created" start={40} tone="sky" />
            <ResultRow
              dropped
              label="Google Workspace"
              strike={false}
              pending="calling"
              result="timed out, outcome unknown"
              start={66}
              tone="rose"
            />
            <ResultRow icon="dash" label="Atlassian" pending="waiting" result="not reached" start={88} tone="slate" />
          </Act>

          <Act from={136} to={254} caption="the replay skips work that already finished">
            <ResultRow icon="dash" label="JumpCloud" pending="resuming" result="skipped, already done" start={158} tone="slate" />
            <ResultRow label="Google Workspace" pending="resuming" result="account created" start={218} tone="sky" />
            <ResultRow label="Atlassian" pending="resuming" result="account created" start={200} tone="sky" />
          </Act>

          <Act from={254} to={356} caption="onboarding done, nobody opened a ticket">
            <ResultRow
              detail="jumpcloud · google workspace · atlassian"
              label="access granted"
              pending="finalizing"
              result="3 of 3 providers"
              start={276}
              tone="sky"
            />
            <ResultRow
              detail="2 attempts · 1 replay · 0 duplicates"
              label="audit entry written"
              pending="finalizing"
              result="logged"
              start={292}
              tone="sky"
            />
          </Act>
        </Stage>
      </ClipCard>
    </AbsoluteFill>
  );
};
