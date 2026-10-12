// Everything on the site is read from the generated token files, so numbers can't drift from the build.
import built from "@tokens/pairings.json";
import source from "@tokens/source.json";

export type Pairing = {
  fg: string;
  bg: string;
  min: number;
  where: string;
  fgHex: string;
  bgHex: string;
  ratio: number;
  verdict: string;
  pass: boolean;
};
export type Forbidden = { fg: string; bg: string; why: string; fgHex: string; bgHex: string; ratio: number; verdict: string };
export type ScaleStep = { step: string; hex: string; note: string; white: number; black: number; whiteVerdict: string; blackVerdict: string };
export type SemanticToken = { name: string; ref: string; use: string; hex: string };

export const PAIRINGS = built.pairings as Pairing[];
export const FORBIDDEN = built.forbidden as Forbidden[];
export const SCALE = built.scale as Record<string, ScaleStep[]>;
export const SEMANTIC: SemanticToken[] = Object.entries(built.semantic as Record<string, { ref: string; use: string; hex: string }>).map(
  ([name, v]) => ({ name, ...v }),
);
export const PRIMITIVE_COUNT = Object.values(source.primitives).reduce((n, fam) => n + Object.keys(fam).length, 0);

export const ROLE_ORDER = ["text", "surface", "action", "border", "icon", "status"] as const;
export const ROLE_COPY: Record<(typeof ROLE_ORDER)[number], string> = {
  text: "Readable content. Every text token is paired with the surfaces it may sit on.",
  surface: "Backgrounds and containers, from the page up to raised cards and brand tints.",
  action: "Fills for buttons. Ink moves forward; pink commits once per flow.",
  border: "Outlines that must reach 3:1 when they carry meaning (inputs, focus, selection).",
  icon: "Icon strokes. Decorative icons are exempt; meaningful ones follow 3:1.",
  status: "Background, foreground and solid triplets for loan and upload states.",
};

/* ---------- WCAG 2.1 math (matches contrast_check.py) ---------- */
const channel = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export const fmt = (r: number) => `${r.toFixed(2)}:1`;

export type Level = { label: string; tone: "pass" | "warn" | "fail" };
export function level(r: number): Level {
  if (r >= 7) return { label: "AAA", tone: "pass" };
  if (r >= 4.5) return { label: "AA", tone: "pass" };
  if (r >= 3) return { label: "Large & UI", tone: "warn" };
  return { label: "Fails", tone: "fail" };
}

export const tokenHex = (name: string) => SEMANTIC.find((t) => t.name === name)?.hex ?? "#000000";
export const cssVar = (name: string) => `var(--${name.replace("/", "-")})`;

/** Look up the measured pairing; fall back to computing it so every table shows a real number. */
export function pairing(fg: string, bg: string, where = "", min = 4.5): Pairing {
  const found = PAIRINGS.find((p) => p.fg === fg && p.bg === bg);
  if (found) return found;
  const fgHex = tokenHex(fg);
  const bgHex = tokenHex(bg);
  const ratio = Math.round(contrast(fgHex, bgHex) * 100) / 100;
  return { fg, bg, min, where, fgHex, bgHex, ratio, verdict: level(ratio).label, pass: ratio >= min };
}

export const thresholdLabel = (min: number) => (min >= 7 ? "7:1 AAA text" : min >= 4.5 ? "4.5:1 text" : "3:1 large text & UI");

export const FIGMA_URL = "https://www.figma.com/design/CjkuZ1iutgScOiU62Lgw9P";
export const PROTOTYPE_FIGMA_URL = "https://www.figma.com/design/30mLuzHrFuG8VCbEV2USth";
