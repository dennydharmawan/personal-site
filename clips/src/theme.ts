import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";

/**
 * The site's Tailwind tokens, resolved to literal hex. This package is not part
 * of the site's Tailwind build, so the values are duplicated here on purpose.
 */
export const palette = {
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  teal50: "#f0fdfa",
  teal100: "#ccfbf1",
  teal600: "#0d9488",
  green50: "#f0fdf4",
  green600: "#16a34a",
  amber50: "#fffbeb",
  amber500: "#f59e0b",
  rose50: "#fff1f2",
  rose100: "#ffe4e6",
  rose600: "#e11d48",
} as const;

export const uiFont = loadInstrument("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const displayFont = loadBricolage("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
}).fontFamily;

/** Every clip shares one composition shape so the four read as a set. */
export const clipConfig = {
  width: 1440,
  height: 960,
  fps: 30,
  durationInFrames: 450,
} as const;
