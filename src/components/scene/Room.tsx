"use client";
import type { ReactNode } from "react";
import { useTheme } from "../ThemeProvider";
import { fill, outline, INK, PALETTE } from "@/lib/skin";
import { Defs } from "./Defs";
import { Garland } from "./Garland";

function Wreath() {
  const { theme } = useTheme();
  const film = theme === "film";
  return (
    <svg className="wall-decor wall-decor--left swing-slow" viewBox="0 0 180 200" aria-hidden>
      <line x1="90" y1="0" x2="90" y2="30" stroke={film ? "#e9c98f" : INK} strokeWidth="3" />
      <circle cx="90" cy="104" r="56" fill="none" stroke={film ? PALETTE.green[2] : INK} strokeWidth="40" />
      <circle cx="90" cy="104" r="56" fill="none" stroke={PALETTE.green[1]} strokeWidth="32" />
      <circle cx="90" cy="104" r="56" fill="none" stroke={PALETTE.green[0]} strokeWidth="24" strokeDasharray="4 12" strokeOpacity="0.7" />
      {[[52, 70], [134, 96], [70, 150], [118, 152], [96, 50]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={fill(theme, i % 2 ? "gold" : "red")} {...outline(theme, 3)} />
      ))}
      <path d="M90 158 l-30 -14 v30z M90 158 l30 -14 v30z" fill={fill(theme, "red")} {...outline(theme)} />
      <circle cx="90" cy="158" r="9" fill={fill(theme, "red")} {...outline(theme)} />
    </svg>
  );
}

function Frame() {
  const { theme } = useTheme();
  return (
    <svg className="wall-decor wall-decor--right" viewBox="0 0 170 200" aria-hidden>
      <rect x="14" y="20" width="142" height="164" rx="12" fill={fill(theme, "wood")} {...outline(theme)} />
      <rect x="32" y="38" width="106" height="128" rx="6" fill={fill(theme, "cream")} {...outline(theme, 3)} />
      <g fill={fill(theme, "grey")} {...outline(theme, 3)}>
        <ellipse cx="85" cy="118" rx="24" ry="20" />
        <circle cx="56" cy="92" r="10" /><circle cx="76" cy="78" r="10" /><circle cx="98" cy="78" r="10" /><circle cx="116" cy="92" r="10" />
      </g>
    </svg>
  );
}

function Floor() {
  const { theme } = useTheme();
  const o = outline(theme);
  return (
    <div className="floor" aria-hidden>
      <svg className="floor__gifts" viewBox="0 0 260 110">
        <rect x="14" y="44" width="78" height="62" rx="8" fill={fill(theme, "green")} {...o} />
        <rect x="46" y="44" width="14" height="62" fill={fill(theme, "cream")} {...outline(theme, 3)} />
        <rect x="100" y="24" width="92" height="82" rx="8" fill={fill(theme, "red")} {...o} />
        <rect x="138" y="24" width="16" height="82" fill={fill(theme, "gold")} {...outline(theme, 3)} />
        <path d="M146 24 q-26 -26 -30 -6 q-2 10 30 6 q32 4 30 -6 q-4 -20 -30 6z" fill={fill(theme, "gold")} {...o} />
        <rect x="198" y="60" width="52" height="46" rx="8" fill={fill(theme, "blue")} {...o} />
        <rect x="218" y="60" width="12" height="46" fill={fill(theme, "cream")} {...outline(theme, 3)} />
      </svg>
    </div>
  );
}

export function Room({ children }: { children: ReactNode }) {
  return (
    <div className="room">
      <Defs />
      <div className="room__light" aria-hidden />
      <Garland />
      <Wreath />
      <Frame />
      <main className="room__content">{children}</main>
      <Floor />
    </div>
  );
}
