import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

/**
 * The site's Tailwind tokens, resolved to literal hex. This package is not part
 * of the site's Tailwind build, so the values are duplicated here on purpose.
 * They are the sRGB conversions of Tailwind v4.3's oklch values, which is what
 * the site renders; v3 hexes drift far enough to miss the site's accent.
 */
export const palette = {
  zinc50: "#fafafa",
  zinc100: "#f4f4f5",
  zinc200: "#e4e4e7",
  zinc300: "#d4d4d8",
  zinc400: "#9f9fa9",
  zinc500: "#71717b",
  zinc600: "#52525c",
  zinc700: "#3f3f46",
  zinc800: "#27272a",
  zinc900: "#18181b",
  sky50: "#f0f9ff",
  sky200: "#b8e6fe",
  sky300: "#74d4ff",
  sky600: "#0084d1",
  sky700: "#0069a8",
  violet200: "#ddd6ff",
  violet300: "#c4b4ff",
  emerald50: "#ecfdf5",
  emerald200: "#a4f4cf",
  emerald600: "#009966",
  green600: "#00a63e",
  amber50: "#fffbeb",
  amber500: "#fe9a00",
  amber700: "#bb4d00",
  rose50: "#fff1f2",
  rose100: "#ffe4e6",
  rose600: "#ec003f",
  zinc950: "#09090b",
  sky100: "#dff2fe",
  sky400: "#00bcff",
  sky500: "#00a6f4",
  sky900: "#024a70",
  sky950: "#052f4a",
  violet50: "#f5f3ff",
  violet100: "#ede9fe",
  violet400: "#a684ff",
  violet500: "#8e51ff",
  violet600: "#7f22fe",
  violet700: "#7008e7",
  violet900: "#4d179a",
  violet950: "#2f0d68",
  emerald100: "#d0fae5",
  emerald300: "#5ee9b5",
  emerald400: "#00d492",
  emerald500: "#00bc7d",
  emerald700: "#007a55",
  emerald800: "#006045",
  emerald900: "#004f3b",
  emerald950: "#002c22",
  amber100: "#fef3c6",
  amber200: "#fee685",
  amber300: "#ffd230",
  amber400: "#ffb900",
  amber600: "#e17100",
  amber900: "#7b3306",
  amber950: "#461901",
  rose200: "#ffccd3",
  rose700: "#c70036",
  sky800: "#00598a",
  indigo50: "#eef2ff",
  indigo100: "#e0e7ff",
  indigo700: "#432dd7",
  indigo800: "#372aac",
  teal50: "#f0fdfa",
  teal100: "#cbfbf1",
  teal200: "#96f7e4",
  teal700: "#00786f",
  teal800: "#005f5a",
  teal900: "#0b4f4a",
  fuchsia50: "#fdf4ff",
  fuchsia100: "#fae8ff",
  fuchsia700: "#a800b7",
  fuchsia800: "#8a0194",
  rose400: "#ff637e",
  rose500: "#ff2056",
} as const;

export const uiFont = loadInstrument("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const displayFont = loadBricolage("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
}).fontFamily;

export const handFont = loadCaveat("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily;

export const codeFont = loadJetBrains("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily;

/** Every clip shares one composition shape so the four read as a set. */
export const clipConfig = {
  width: 1440,
  height: 960,
  fps: 30,
  durationInFrames: 450,
} as const;
