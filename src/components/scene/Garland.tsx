"use client";
import { useTheme } from "../ThemeProvider";
import { INK, PALETTE, type ColorName } from "@/lib/skin";
import { OrnamentG } from "./Ornament";

const BULBS: ColorName[] = ["gold", "red", "cream", "gold"];
const BAUBLES: ColorName[] = ["red", "gold", "blue", "cream"];
// points on the quadratic M0 14 Q110 90 220 14
const at = (t: number) => ({ x: 220 * t, y: 14 + 152 * t * (1 - t) });

function Swag({ i }: { i: number }) {
  const { theme } = useTheme();
  const d = "M -4 14 Q 110 90 224 14";
  const film = theme === "film";
  return (
    <svg className="garland__swag" viewBox="0 0 220 110" width="220" height="110" aria-hidden>
      <path d={d} fill="none" stroke={film ? PALETTE.green[2] : INK} strokeWidth="27" strokeLinecap="round" />
      <path d={d} fill="none" stroke={PALETTE.green[1]} strokeWidth="19" strokeLinecap="round" />
      <path d={d} fill="none" stroke={PALETTE.green[0]} strokeWidth="13" strokeDasharray="3 10" strokeOpacity={film ? 0.55 : 0.8} />
      {[0.14, 0.38, 0.62, 0.86].map((t, k) => {
        const p = at(t);
        const c = BULBS[(k + i) % BULBS.length];
        return (
          <g key={k} className="bulb" style={{ animationDelay: `${((k * 0.6 + i * 0.35) % 2.4).toFixed(2)}s` }}>
            {film && <circle cx={p.x} cy={p.y + 6} r="20" fill="url(#g-glow)" />}
            <ellipse cx={p.x} cy={p.y + 6} rx="6.5" ry="8.5" fill={PALETTE[c][film ? 0 : 1]} stroke={film ? "none" : INK} strokeWidth="3" />
          </g>
        );
      })}
      <OrnamentG x={110} y={60} r={13} drop={10} color={BAUBLES[i % BAUBLES.length]} delay={i * 0.4} />
    </svg>
  );
}

export function Garland() {
  const { theme } = useTheme();
  if (theme === "film") return <div className="garland garland--film" aria-hidden />;
  return (
    <div className="garland" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <Swag key={i} i={i} />
      ))}
    </div>
  );
}
