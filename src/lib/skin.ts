export type Theme = "sticker" | "film";
export const THEMES: Theme[] = ["sticker", "film"];
export const INK = "#3a2823";

/** [light, base, dark] per named colour. Sticker uses base flat, film uses a gradient of all three. */
export const PALETTE = {
  red: ["#ee7d6f", "#cf4a3f", "#8c2924"],
  green: ["#6fae7f", "#3f7d57", "#234a35"],
  gold: ["#ffe08a", "#f1b540", "#b97a1c"],
  cream: ["#fffaf0", "#fbeed6", "#dcc39c"],
  wood: ["#c98a5b", "#a5673f", "#6a3d24"],
  grey: ["#c9c3be", "#a9a39e", "#7d7772"],
  blue: ["#8fb6d9", "#5f8fbf", "#35608c"],
  pink: ["#f8c4bd", "#f2a59c", "#c97a72"],
  night: ["#3d5a94", "#263c6e", "#131f42"],
  dark: ["#4a2a22", "#2b1612", "#170b09"],
} as const;
export type ColorName = keyof typeof PALETTE;

export function fill(theme: Theme, name: ColorName): string {
  return theme === "film" ? `url(#g-${name})` : PALETTE[name][1];
}

export function outline(theme: Theme, width = 4) {
  return theme === "sticker"
    ? { stroke: INK, strokeWidth: width, strokeLinejoin: "round" as const, strokeLinecap: "round" as const }
    : {};
}
