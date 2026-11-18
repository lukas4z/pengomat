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

const STARS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 10 + ((i * 7) % 12),
  delay: (i * 1.3) % 7,
  dur: 4 + (i % 4),
}));

/** Little stars on the wall that sparkle every few seconds. */
function Twinkles() {
  return (
    <div className="twinkles" aria-hidden>
      {STARS.map((s, i) => (
        <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
    </div>
  );
}

const TREE_BAUBLES = [
  { x: 30, y: 44, c: "#e2574c", d: 0 }, { x: 62, y: 38, c: "#f4c04e", d: 0.8 }, { x: 46, y: 60, c: "#f4c04e", d: 1.5 },
  { x: 22, y: 70, c: "#f4c04e", d: 0.4 }, { x: 72, y: 66, c: "#e2574c", d: 1.1 }, { x: 54, y: 80, c: "#e2574c", d: 1.9 },
];

/** The rendered tree with a twinkling star and softly swinging baubles on top. */
function FilmTree() {
  return (
    <div className="deco-tree">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/film/tree.webp" alt="" draggable={false} />
      <span className="deco-tree__star" />
      {TREE_BAUBLES.map((b, i) => (
        <span key={i} className="deco-tree__bauble" style={{ left: `${b.x}%`, top: `${b.y}%`, background: `radial-gradient(circle at 35% 30%, #fff8 0 12%, ${b.c} 40%, #0005 130%)`, animationDelay: `-${b.d}s` }} />
      ))}
    </div>
  );
}

function FilmFloor() {
  const img = (name: string, cls = "") => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`deco deco--${name} ${cls}`} src={`/film/${name}.webp`} alt="" draggable={false} />
  );
  return (
    <div className="floor floor--film" aria-hidden>
      <div className="floor__row">
        <FilmTree />
        {img("sack")}
        {img("gingerbread")}
        <span className="deco-candles">
          {img("candles")}
          <i className="deco-candles__glow" />
        </span>
        {img("globe")}
        {img("horse", "deco--rock")}
      </div>
    </div>
  );
}

export function Room({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const film = theme === "film";
  return (
    <div className="room">
      <Defs />
      {film && <div className="room__backdrop" aria-hidden />}
      <div className="room__light" aria-hidden />
      <Twinkles />
      <Garland />
      {film ? null : <Wreath />}
      {film ? null : <Frame />}
      <main className="room__content">{children}</main>
      {film ? <FilmFloor /> : <Floor />}
    </div>
  );
}
