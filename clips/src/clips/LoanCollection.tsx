import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Cursor } from "../components/Cursor";
import { Check, fade } from "../components/shapes";
import { codeFont, displayFont, palette, uiFont } from "../theme";

/**
 * One overdue loan. First the old way: three collectors reach the borrower on their
 * own phones and on paper, and none of it is on the record. Then the loan gets an
 * owner and a next step, the owner calls from the browser, sends a WhatsApp
 * template, and every contact drops onto one timeline until the promise to pay
 * lands there too.
 *
 * The site's chapter buttons seek to 0, 2.5 and 8 s. Each of those frames is a hard
 * state swap, so a seek always lands on a fully drawn state, never mid-fade.
 */
export const LOAN_DURATION = 390;

const CHAPTER = { work: 75, promise: 240 } as const;

// The scattered contacts are already on screen at frame 0, so a chapter-1 seek shows the problem.
const FRAGMENT_FLAG = [10, 22, 34] as const;
const EMPTY_WARN = 48;
// The notes sit over the next-step panel, so they are gone by 74 and the chapter-2 frame shows the panel whole.
const FRAGMENT_LEAVE = 52;

const CALL = { cursorIn: 82, click: 102, noAnswer: 146, fly: [154, 174] } as const;
const WHATSAPP = { show: 176, cursorIn: 180, click: 194, fly: [206, 226], waiting: 228 } as const;
const REPLY = { mark: 248, fly: [256, 274] } as const;
const PROMISE_AT = 276;

// The stage leaves left on an ease-in and the fresh one arrives from the right on an
// ease-out at about the same speed, settling by 388 so the last frames match frame 0.
const SEAM = { exit: [330, 352], enter: [352, 388] } as const;
const PUSH = 1520;

type Rect = { left: number; top: number; width: number; height: number };

const CARD: Rect = { left: 64, top: 64, width: 680, height: 384 };
const PANEL: Rect = { left: 64, top: 480, width: 680, height: 416 };
const BODY: Rect = { left: PANEL.left + 32, top: PANEL.top + 120, width: PANEL.width - 64, height: 264 };
const TIMELINE: Rect = { left: 776, top: 64, width: 600, height: 832 };
const ENTRY_GAP = 168;

const slot = (index: number): Rect => ({
  left: TIMELINE.left + 28,
  top: TIMELINE.top + 112 + index * ENTRY_GAP,
  width: TIMELINE.width - 56,
  height: 148,
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const glide = Easing.bezier(0.45, 0, 0.2, 1);

const after = (frame: number, at: number) => (frame >= at ? 1 : 0);

const Lucide: React.FC<{ readonly children: React.ReactNode; readonly color: string; readonly size: number }> = ({
  children,
  color,
  size,
}) => (
  <svg
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </svg>
);

const PhoneIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  </Lucide>
);

const PhoneOffIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M10.1 13.9a14 14 0 0 0 3.732 2.668 1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2 18 18 0 0 1-12.728-5.272" />
    <path d="M22 2 2 22" />
    <path d="M4.76 13.582A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 .244.473" />
  </Lucide>
);

const NoteIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
    <path d="M2 6h4" />
    <path d="M2 10h4" />
    <path d="M2 14h4" />
    <path d="M2 18h4" />
    <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
  </Lucide>
);

const CalendarIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect height="18" rx="2" width="18" x="3" y="4" />
    <path d="M3 10h18" />
  </Lucide>
);

const SendIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </Lucide>
);

const TicksIcon: React.FC<{ readonly color: string; readonly size: number }> = (props) => (
  <Lucide {...props}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </Lucide>
);

const Logo: React.FC<{ readonly name: string; readonly size: number }> = ({ name, size }) => (
  <Img
    src={staticFile(`logos/${name}.svg`)}
    style={{ width: size, height: size, objectFit: "contain" }}
  />
);

const IconBox: React.FC<{
  readonly background?: string;
  readonly children: React.ReactNode;
  readonly size?: number;
}> = ({ background = "#ffffff", children, size = 88 }) => (
  <div
    style={{
      position: "relative",
      flexShrink: 0,
      width: size,
      height: size,
      boxSizing: "border-box",
      borderRadius: size / 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: background,
      border: background === "#ffffff" ? `2px solid ${palette.zinc200}` : "none",
    }}
  >
    {children}
  </div>
);

const Avatar: React.FC<{ readonly ink: string; readonly initials: string; readonly size: number; readonly tint: string }> = ({
  ink,
  initials,
  size,
  tint,
}) => (
  <div
    style={{
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tint,
      fontFamily: displayFont,
      fontSize: size * 0.4,
      fontWeight: 600,
      color: ink,
    }}
  >
    {initials}
  </div>
);

const surface = (rect: Rect, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute",
  ...rect,
  boxSizing: "border-box",
  borderRadius: 32,
  border: `2px solid ${palette.zinc200}`,
  backgroundColor: "#ffffff",
  ...extra,
});

const label: React.CSSProperties = {
  fontFamily: uiFont,
  fontSize: 40,
  lineHeight: "48px",
  color: palette.zinc500,
  whiteSpace: "nowrap",
};

const strong: React.CSSProperties = {
  fontFamily: uiFont,
  fontSize: 44,
  fontWeight: 600,
  lineHeight: "52px",
  letterSpacing: "-0.01em",
  color: palette.zinc900,
  whiteSpace: "nowrap",
};

/** The borrower. Only the owner changes: nobody, then Rina from the chapter-2 frame on. */
const AccountCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const owned = after(frame, CHAPTER.work);
  return (
    <div style={surface(CARD)}>
      <div style={{ position: "absolute", left: 36, top: 36 }}>
        <Avatar ink={palette.zinc700} initials="BS" size={96} tint={palette.zinc100} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 156,
          top: 30,
          fontFamily: displayFont,
          fontSize: 56,
          fontWeight: 600,
          lineHeight: "64px",
          letterSpacing: "-0.02em",
          color: palette.zinc900,
          whiteSpace: "nowrap",
        }}
      >
        Budi Santoso
      </div>
      <div style={{ ...label, position: "absolute", left: 156, top: 94 }}>Loan 4471</div>

      {[
        { left: 36, value: "IDR 1.18m", note: "instalment", ink: palette.zinc900 },
        { left: 360, value: "32 days", note: "overdue", ink: palette.rose600 },
      ].map((stat) => (
        <div key={stat.note} style={{ position: "absolute", left: stat.left, top: 164 }}>
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 64,
              fontWeight: 600,
              lineHeight: "72px",
              letterSpacing: "-0.03em",
              color: stat.ink,
              whiteSpace: "nowrap",
            }}
          >
            {stat.value}
          </div>
          <div style={label}>{stat.note}</div>
        </div>
      ))}

      <div style={{ position: "absolute", left: 36, right: 36, top: 296, height: 2, backgroundColor: palette.zinc200 }} />
      <div style={{ ...label, position: "absolute", left: 36, top: 316 }}>Owner</div>
      <div
        style={{
          ...strong,
          position: "absolute",
          left: 200,
          top: 314,
          color: palette.rose600,
          opacity: 1 - owned,
        }}
      >
        Unassigned
      </div>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 306,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: owned,
        }}
      >
        <Avatar ink={palette.sky800} initials="RW" size={64} tint={palette.sky100} />
        <span style={strong}>Rina W.</span>
      </div>
    </div>
  );
};

const fragments = [
  { left: 72, top: 488, rotate: -3, who: "Andi called", where: "from his own phone", icon: "phone" },
  { left: 136, top: 628, rotate: 2.5, who: "Sari messaged", where: "from her own phone", icon: "whatsapp" },
  { left: 88, top: 768, rotate: -2, who: "Dewi visited", where: "notes on paper", icon: "note" },
] as const;

/** Chapter 1: contacts that happened off the record. Each gets flagged, then they leave left before chapter 2. */
const Fragment: React.FC<{ readonly frame: number; readonly index: number }> = ({ frame, index }) => {
  const fragment = fragments[index];
  const flag = fade(frame, [FRAGMENT_FLAG[index], FRAGMENT_FLAG[index] + 6], [0, 1]);
  const leaveFrom = FRAGMENT_LEAVE + 3 * index;
  const leave = interpolate(frame, [leaveFrom, leaveFrom + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (leave === 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: fragment.left,
        top: fragment.top,
        width: 600,
        height: 124,
        boxSizing: "border-box",
        borderRadius: 24,
        border: `2px solid ${palette.zinc200}`,
        backgroundColor: "#ffffff",
        boxShadow: `0 12px 32px ${palette.zinc900}14`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 24px",
        rotate: `${fragment.rotate}deg`,
        translate: `${-leave * 900}px 0px`,
      }}
    >
      <IconBox background={palette.zinc100} size={76}>
        {fragment.icon === "phone" ? <PhoneIcon color={palette.zinc600} size={40} /> : null}
        {fragment.icon === "whatsapp" ? <Logo name="whatsapp" size={42} /> : null}
        {fragment.icon === "note" ? <NoteIcon color={palette.zinc600} size={40} /> : null}
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: -12,
            width: 40,
            height: 40,
            borderRadius: 20,
            border: "3px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.rose600,
            fontFamily: uiFont,
            fontSize: 28,
            fontWeight: 700,
            color: "#ffffff",
            opacity: flag,
            scale: 0.6 + 0.4 * flag,
          }}
        >
          ?
        </div>
      </IconBox>
      <div>
        <div style={strong}>{fragment.who}</div>
        <div style={label}>{fragment.where}</div>
      </div>
    </div>
  );
};

type StepChip = { text: string; tint: string; ink: string; icon: React.ReactNode };

const stepAt = (frame: number): StepChip => {
  if (frame >= PROMISE_AT) {
    return {
      text: "Collect",
      tint: palette.emerald600,
      ink: "#ffffff",
      icon: <CalendarIcon color="#ffffff" size={36} />,
    };
  }
  if (frame >= CALL.fly[1]) {
    return { text: "WhatsApp", tint: palette.sky50, ink: palette.sky700, icon: <Logo name="whatsapp" size={36} /> };
  }
  return { text: "Call", tint: palette.sky50, ink: palette.sky700, icon: <PhoneIcon color={palette.sky700} size={34} /> };
};

/** From the chapter-2 frame on, the loan has a next step. The current action happens inside it. */
const NextStepPanel: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < CHAPTER.work) return null;
  const step = stepAt(frame);
  const active =
    fade(frame, [CALL.click, CALL.click + 4, CALL.noAnswer, CALL.noAnswer + 6], [0, 1, 1, 0]) +
    fade(frame, [WHATSAPP.show, WHATSAPP.show + 4, WHATSAPP.fly[0], WHATSAPP.fly[0] + 4], [0, 1, 1, 0]);
  const swell =
    frame >= PROMISE_AT
      ? interpolate(frame, [PROMISE_AT, PROMISE_AT + 10], [1.08, 1], { ...clamp, easing: Easing.out(Easing.exp) })
      : 1;

  return (
    <div style={surface(PANEL)}>
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 32,
          border: `4px solid ${palette.sky500}`,
          opacity: Math.min(1, active),
        }}
      />
      <div style={{ ...label, position: "absolute", left: 36, top: 40 }}>Next step</div>
      <div
        style={{
          position: "absolute",
          left: 236,
          top: 28,
          height: 72,
          padding: "0 28px",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          gap: 14,
          backgroundColor: step.tint,
          scale: swell,
          transformOrigin: "left center",
          fontFamily: uiFont,
          fontSize: 40,
          fontWeight: 600,
          color: step.ink,
          whiteSpace: "nowrap",
        }}
      >
        {step.icon}
        {step.text}
      </div>
    </div>
  );
};

const bodyStyle = (opacity: number, lift = 0): React.CSSProperties => ({
  position: "absolute",
  ...BODY,
  opacity,
  translate: `0px ${lift}px`,
});

const CallWidget: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < CHAPTER.work || frame >= CALL.fly[0]) return null;
  const settle = interpolate(frame, [CHAPTER.work, CHAPTER.work + 8], [0.96, 1], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  const pressed = frame >= CALL.click && frame < CALL.click + 4 ? 0.95 : 1;
  const ringing = after(frame, CALL.click) * (1 - after(frame, CALL.noAnswer));
  const ended = after(frame, CALL.noAnswer);
  const idle = 1 - after(frame, CALL.click);

  return (
    <div style={{ ...bodyStyle(1), scale: settle, transformOrigin: "left top" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <IconBox>
          <Logo name="vonage" size={48} />
        </IconBox>
        <div>
          <div style={strong}>Budi Santoso</div>
          <div style={{ ...label, fontFamily: codeFont }}>+62 812 5501 4471</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 152, height: 88, display: "flex", alignItems: "center" }}>
        {idle ? (
          <div
            style={{
              height: 88,
              padding: "0 36px",
              borderRadius: 44,
              display: "flex",
              alignItems: "center",
              gap: 16,
              backgroundColor: palette.sky500,
              scale: pressed,
              ...strong,
              fontSize: 40,
            }}
          >
            <PhoneIcon color={palette.zinc900} size={36} />
            Call
          </div>
        ) : null}
        {ringing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: palette.sky500,
                    opacity: Math.floor((frame - CALL.click) / 6) % 3 === dot ? 1 : 0.25,
                  }}
                />
              ))}
            </div>
            <span style={{ ...strong, color: palette.sky700 }}>Ringing</span>
          </div>
        ) : null}
        {ended ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <PhoneOffIcon color={palette.zinc500} size={40} />
            <span style={strong}>No answer</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const WhatsAppComposer: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < WHATSAPP.show || frame >= WHATSAPP.fly[0]) return null;
  const shown = fade(frame, [WHATSAPP.show, WHATSAPP.show + 8], [0, 1]);
  const sent = after(frame, WHATSAPP.click + 4);
  const pressed = frame >= WHATSAPP.click && frame < WHATSAPP.click + 4 ? 0.92 : 1;

  return (
    <div style={bodyStyle(shown, (1 - shown) * 20)}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 72 }}>
        <Logo name="whatsapp" size={52} />
        <div
          style={{
            height: 64,
            padding: "0 24px",
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            backgroundColor: palette.sky50,
            fontFamily: uiFont,
            fontSize: 40,
            fontWeight: 600,
            color: palette.sky700,
            whiteSpace: "nowrap",
          }}
        >
          Overdue reminder
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 72,
          height: 72,
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.sky500,
          scale: pressed,
          opacity: 1 - sent,
        }}
      >
        <SendIcon color={palette.zinc900} size={34} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          ...label,
          color: palette.sky700,
          opacity: sent,
        }}
      >
        <TicksIcon color={palette.sky500} size={40} />
        Sent
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 96,
          boxSizing: "border-box",
          padding: "16px 24px",
          borderRadius: 24,
          borderTopRightRadius: 6,
          backgroundColor: palette.emerald50,
          border: `2px solid ${palette.emerald200}`,
          fontFamily: uiFont,
          fontSize: 40,
          lineHeight: "50px",
          color: palette.zinc900,
        }}
      >
        Hi Budi, your instalment of IDR 1,180,000 is 32 days overdue.
      </div>
    </div>
  );
};

const WaitingNote: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < WHATSAPP.waiting || frame >= CHAPTER.promise) return null;
  return (
    <div style={{ ...bodyStyle(fade(frame, [WHATSAPP.waiting, WHATSAPP.waiting + 6], [0, 1])), ...label, color: palette.zinc400, paddingTop: 96 }}>
      Waiting for a reply
    </div>
  );
};

const ReplyCard: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < CHAPTER.promise || frame >= REPLY.fly[0]) return null;
  const settle = interpolate(frame, [CHAPTER.promise, CHAPTER.promise + 8], [0.96, 1], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  const mark = fade(frame, [REPLY.mark, REPLY.mark + 6], [0, 1]);

  return (
    <div style={{ ...bodyStyle(1), scale: settle, transformOrigin: "left top" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 72 }}>
        <Logo name="whatsapp" size={52} />
        <span style={strong}>Budi replied</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 96,
          boxSizing: "border-box",
          padding: "18px 28px",
          borderRadius: 24,
          borderTopLeftRadius: 6,
          backgroundColor: "#ffffff",
          border: `2px solid ${palette.zinc200}`,
          ...strong,
          fontWeight: 500,
        }}
      >
        I can pay on the{" "}
        <span
          style={{
            borderRadius: 10,
            padding: "0 6px",
            marginRight: -4,
            backgroundColor: `color-mix(in srgb, ${palette.sky100} ${mark * 100}%, transparent)`,
            color: mark > 0.5 ? palette.sky800 : palette.zinc900,
            fontWeight: 600,
          }}
        >
          18th
        </span>
        .
      </div>
    </div>
  );
};

const PromiseBody: React.FC<{ readonly frame: number }> = ({ frame }) => {
  if (frame < PROMISE_AT) return null;
  const swell = interpolate(frame, [PROMISE_AT, PROMISE_AT + 10], [1.06, 1], {
    ...clamp,
    easing: Easing.out(Easing.exp),
  });
  return (
    <div style={{ ...bodyStyle(1), display: "flex", alignItems: "center", gap: 32, scale: swell, transformOrigin: "left center" }}>
      <IconBox background={palette.emerald50} size={128}>
        <CalendarIcon color={palette.emerald700} size={64} />
      </IconBox>
      <div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 96,
            fontWeight: 600,
            lineHeight: "100px",
            letterSpacing: "-0.03em",
            color: palette.zinc900,
            whiteSpace: "nowrap",
          }}
        >
          18 Oct
        </div>
        <div style={label}>IDR 1,180,000 promised</div>
      </div>
    </div>
  );
};

type Entry = {
  readonly title: string;
  readonly detail: string;
  readonly logo?: string;
  /** Frames the record flies from the next-step panel into its slot. */
  readonly fly?: readonly [number, number];
  readonly stampAt?: number;
};

const entries: ReadonlyArray<Entry> = [
  { title: "Call", detail: "09:14 · no answer", logo: "vonage", fly: CALL.fly },
  { title: "WhatsApp reminder", detail: "09:16 · template", logo: "whatsapp", fly: WHATSAPP.fly },
  { title: "Budi replied", detail: "09:41 · pays on the 18th", logo: "whatsapp", fly: REPLY.fly },
  { title: "Promise to pay", detail: "18 Oct · IDR 1,180,000", stampAt: PROMISE_AT },
];

const TimelineEntry: React.FC<{ readonly frame: number; readonly index: number }> = ({ frame, index }) => {
  const entry = entries[index];
  const target = slot(index);
  const start = entry.fly ? entry.fly[0] : (entry.stampAt ?? 0);
  if (frame < start) return null;

  let dx = 0;
  let dy = 0;
  let carried = 0;
  let scale = 1;
  if (entry.fly) {
    // Across first, then up: the record turns into the timeline's column below the account
    // card, so it never passes over the card's numbers.
    const travel = interpolate(frame, [entry.fly[0], entry.fly[1]], [0, 1], clamp);
    const across = interpolate(travel, [0, 0.6], [0, 1], { ...clamp, easing: glide });
    const up = interpolate(travel, [0.45, 1], [0, 1], { ...clamp, easing: glide });
    dx = (BODY.left - target.left) * (1 - across);
    dy = (BODY.top - target.top) * (1 - up);
    // While it travels it is a card with the active outline; on landing it becomes a row.
    carried = fade(frame, [entry.fly[0], entry.fly[0] + 2, entry.fly[1] - 2, entry.fly[1] + 4], [0, 1, 1, 0]);
  } else {
    scale = interpolate(frame, [start, start + 10], [1.08, 1], { ...clamp, easing: Easing.out(Easing.exp) });
  }
  const isPromise = entry.logo === undefined;

  return (
    <div
      style={{
        position: "absolute",
        ...target,
        boxSizing: "border-box",
        borderRadius: 28,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 0 0 0",
        translate: `${dx}px ${dy}px`,
        scale,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -14,
          borderRadius: 28,
          backgroundColor: "#ffffff",
          border: `4px solid ${palette.sky500}`,
          boxShadow: `0 16px 40px ${palette.zinc900}1a`,
          opacity: carried,
        }}
      />
      <div style={{ position: "relative" }}>
        {isPromise ? (
          <IconBox background={palette.emerald600}>
            <Check color="#ffffff" size={52} />
          </IconBox>
        ) : (
          <IconBox>
            <Logo name={entry.logo ?? ""} size={48} />
          </IconBox>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ ...strong, color: isPromise ? palette.emerald700 : palette.zinc900 }}>{entry.title}</div>
        <div style={label}>{entry.detail}</div>
      </div>
    </div>
  );
};

/** The one record. It never moves; every contact ends up here. */
const Timeline: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const empty = 1 - fade(frame, [CALL.fly[1] - 4, CALL.fly[1]], [0, 1]);
  const railTop = slot(0).top - TIMELINE.top + 44;
  const filled = entries.filter((entry) => frame >= (entry.fly ? entry.fly[1] : (entry.stampAt ?? 0))).length;
  const railBottom = filled > 1 ? slot(filled - 1).top - TIMELINE.top + 44 : railTop;

  return (
    <div style={surface(TIMELINE)}>
      <div style={{ ...label, position: "absolute", left: 36, top: 36 }}>Contact timeline</div>
      <div
        style={{
          position: "absolute",
          left: 28 + 42,
          top: railTop,
          width: 4,
          height: railBottom - railTop,
          borderRadius: 2,
          backgroundColor: palette.zinc200,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 360,
          textAlign: "center",
          ...strong,
          fontWeight: 500,
          color: frame >= EMPTY_WARN ? palette.rose600 : palette.zinc400,
          opacity: empty,
        }}
      >
        No contacts logged
      </div>
    </div>
  );
};

const cursorAt = (frame: number) => {
  const press = (at: number) => (frame >= at && frame < at + 4 ? 0.88 : 1);
  if (frame >= CALL.cursorIn && frame < CALL.click + 14) {
    const move = interpolate(frame, [CALL.cursorIn, CALL.click - 2], [0, 1], { ...clamp, easing: glide });
    return {
      x: 700 + (196 - 700) * move,
      y: 940 + (BODY.top + 196 - 940) * move,
      opacity: fade(frame, [CALL.cursorIn, CALL.cursorIn + 4, CALL.click + 4, CALL.click + 10], [0, 1, 1, 0]),
      scale: press(CALL.click),
    };
  }
  if (frame >= WHATSAPP.cursorIn && frame < WHATSAPP.click + 14) {
    const move = interpolate(frame, [WHATSAPP.cursorIn, WHATSAPP.click - 2], [0, 1], { ...clamp, easing: glide });
    return {
      x: 520 + (BODY.left + BODY.width - 34 - 520) * move,
      y: 900 + (BODY.top + 38 - 900) * move,
      opacity: fade(frame, [WHATSAPP.cursorIn, WHATSAPP.cursorIn + 4, WHATSAPP.click + 2, WHATSAPP.click + 6], [0, 1, 1, 0]),
      scale: press(WHATSAPP.click),
    };
  }
  return null;
};

const Pointer: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const cursor = cursorAt(frame);
  if (!cursor) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, scale: cursor.scale, transformOrigin: `${cursor.x}px ${cursor.y}px` }}>
      <Cursor opacity={cursor.opacity} x={cursor.x} y={cursor.y} />
    </div>
  );
};

export const LoanCollection: React.FC = () => {
  const frame = useCurrentFrame();
  // After the stage leaves, the arriving copy plays the frames before 0: the opening state.
  const story = frame >= SEAM.enter[0] ? frame - LOAN_DURATION : frame;
  const shift =
    frame < SEAM.enter[0]
      ? interpolate(frame, [...SEAM.exit], [0, -PUSH], { ...clamp, easing: Easing.in(Easing.cubic) })
      : interpolate(frame, [...SEAM.enter], [PUSH, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.zinc50 }}>
      <AbsoluteFill style={{ translate: `${shift}px 0px` }}>
        <AccountCard frame={story} />
        <Timeline frame={story} />
        <NextStepPanel frame={story} />
        <CallWidget frame={story} />
        <WhatsAppComposer frame={story} />
        <WaitingNote frame={story} />
        <ReplyCard frame={story} />
        <PromiseBody frame={story} />
        {entries.map((_, index) => (
          <TimelineEntry frame={story} index={index} key={index} />
        ))}
        {fragments.map((_, index) => (
          <Fragment frame={story} index={index} key={index} />
        ))}
        <Pointer frame={story} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
