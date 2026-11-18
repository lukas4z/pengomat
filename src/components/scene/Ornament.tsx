"use client";
import { useTheme } from "../ThemeProvider";
import { fill, outline, INK, type ColorName } from "@/lib/skin";

/** A bauble drawn inside a parent <svg>, hanging from (x, y). */
export function OrnamentG({ x, y, r = 14, color = "red", drop = 14, delay = 0 }: { x: number; y: number; r?: number; color?: ColorName; drop?: number; delay?: number }) {
  const { theme } = useTheme();
  const o = outline(theme, 3.5);
  return (
    <g className="swing" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${delay}s` }}>
      <line x1={x} y1={y} x2={x} y2={y + drop} stroke={theme === "sticker" ? INK : "#e9c98f"} strokeWidth={theme === "sticker" ? 3 : 1.5} />
      <rect x={x - 5} y={y + drop - 2} width="10" height="7" rx="2" fill={fill(theme, "gold")} {...o} />
      <circle cx={x} cy={y + drop + 4 + r} r={r} fill={fill(theme, color)} {...o} />
      <path d={`M ${x - r * 0.55} ${y + drop + 4 + r * 0.7} q ${r * 0.1} ${-r * 0.5} ${r * 0.5} ${-r * 0.6}`} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Standalone bauble, e.g. as the "o" in the wordmark. */
export function Ornament({ color = "red", className }: { color?: ColorName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 62" aria-hidden>
      <OrnamentG x={22} y={2} r={17} drop={6} color={color} />
    </svg>
  );
}
