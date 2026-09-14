/** macOS-style pointer. Positioned by the caller; the tip sits at (x, y). */
export const Cursor: React.FC<{ readonly opacity: number; readonly x: number; readonly y: number }> = ({
  opacity,
  x,
  y,
}) => {
  return (
    <svg
      height={44}
      style={{ position: "absolute", left: x, top: y, opacity }}
      viewBox="0 0 32 44"
      width={32}
    >
      <path
        d="M2 2 L2 32.5 L9.6 25.2 L14.6 37.3 L20.1 35.0 L15.2 23.1 L25.6 22.9 Z"
        fill="#0f172a"
        stroke="#ffffff"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
    </svg>
  );
};
