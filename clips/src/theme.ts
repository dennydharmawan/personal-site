import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

/**
 * The site's Tailwind tokens, resolved to literal hex. This package is not part
 * of the site's Tailwind build, so the values are duplicated here on purpose.
 */
export const palette = {
  zinc50: "#fafafa",
  zinc100: "#f4f4f5",
  zinc200: "#e4e4e7",
  zinc300: "#d4d4d8",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc600: "#52525b",
  zinc700: "#3f3f46",
  zinc800: "#27272a",
  zinc900: "#18181b",
  sky50: "#f0f9ff",
  sky200: "#bae6fd",
  sky300: "#7dd3fc",
  sky600: "#0284c7",
  sky700: "#0369a1",
  violet200: "#ddd6fe",
  violet300: "#c4b5fd",
  emerald50: "#ecfdf5",
  emerald200: "#a7f3d0",
  emerald600: "#059669",
  green600: "#16a34a",
  amber50: "#fffbeb",
  amber500: "#f59e0b",
  amber700: "#b45309",
  rose50: "#fff1f2",
  rose100: "#ffe4e6",
  rose600: "#e11d48",
  zinc950: "#09090b",
  sky100: "#e0f2fe",
  sky400: "#38bdf8",
  sky500: "#0ea5e9",
  sky900: "#0c4a6e",
  sky950: "#082f49",
  violet50: "#f5f3ff",
  violet100: "#ede9fe",
  violet400: "#a78bfa",
  violet500: "#8b5cf6",
  violet600: "#7c3aed",
  violet700: "#6d28d9",
  violet900: "#4c1d95",
  violet950: "#2e1065",
  emerald100: "#d1fae5",
  emerald300: "#6ee7b7",
  emerald400: "#34d399",
  emerald500: "#10b981",
  emerald700: "#047857",
  emerald800: "#065f46",
  emerald900: "#064e3b",
  emerald950: "#022c22",
  amber100: "#fef3c7",
  amber200: "#fde68a",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  amber600: "#d97706",
  amber900: "#78350f",
  amber950: "#451a03",
  rose400: "#fb7185",
  rose500: "#f43f5e",
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
