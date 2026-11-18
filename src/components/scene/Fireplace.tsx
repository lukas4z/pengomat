"use client";
import type { ReactNode } from "react";
import { useTheme } from "../ThemeProvider";
import { fill, outline, INK } from "@/lib/skin";

function Candle({ x, h, delay }: { x: number; h: number; delay: number }) {
  const { theme } = useTheme();
  return (
    <g>
      {theme === "film" && <circle cx={x} cy={60 - h - 10} r="26" fill="url(#g-glow)" opacity="0.7" />}
      <path className="flame" style={{ transformOrigin: `${x}px ${60 - h}px`, animationDelay: `${delay}s` }} d={`M${x} ${60 - h - 22} q9 12 0 22 q-9 -10 0 -22z`} fill="url(#g-flame)" stroke={theme === "sticker" ? INK : "none"} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x={x - 8} y={60 - h} width="16" height={h} rx="3" fill={fill(theme, "cream")} {...outline(theme, 3)} />
    </g>
  );
}

export function Fireplace({ children }: { children?: ReactNode }) {
  const { theme } = useTheme();
  const o = outline(theme);
  if (theme === "film") {
    return (
      <section className="hearth hearth--film" aria-label="Kamin">
        {/* eslint-disable @next/next/no-img-element */}
        <img className="hearth__top" src="/film/hearth-top.webp" alt="" draggable={false} />
        <div className="hearth__band">
          <div className="hearth__socks">{children}</div>
        </div>
        <div className="hearth__bottom">
          <img src="/film/hearth-bottom.webp" alt="" draggable={false} />
          <span className="hearth__glow" />
        </div>
        {/* eslint-enable @next/next/no-img-element */}
      </section>
    );
  }
  return (
    <section className="hearth" aria-label="Kamin">
      <svg className="hearth__deco" viewBox="0 0 320 62" aria-hidden>
        <Candle x={40} h={30} delay={0} />
        <Candle x={62} h={20} delay={0.4} />
        <path d="M246 60 l22 -50 22 50z" fill={fill(theme, "green")} {...o} />
        <circle cx="262" cy="46" r="4" fill={fill(theme, "red")} /><circle cx="274" cy="34" r="4" fill={fill(theme, "gold")} /><circle cx="278" cy="50" r="4" fill={fill(theme, "cream")} />
        <path d="M268 2 l2.6 5.4 6 .8 -4.4 4.2 1 6 -5.2 -2.9 -5.2 2.9 1 -6 -4.4 -4.2 6 -.8z" fill={fill(theme, "gold")} {...outline(theme, 2)} />
      </svg>
      <div className="hearth__mantel" />
      <div className="hearth__body">
        <div className="hearth__socks">{children}</div>
        <svg className="hearth__fire" viewBox="0 0 300 180" aria-hidden>
          <path d="M24 180 V84 Q24 14 150 14 Q276 14 276 84 V180 Z" fill={fill(theme, "dark")} {...outline(theme, 5)} />
          <g className="flames">
            <path className="flame" style={{ transformOrigin: "150px 160px" }} d="M150 44 q44 46 26 94 q-10 26 -26 26 q-18 0 -28 -26 q-16 -44 28 -94z" fill="#f2702c" {...outline(theme, 3.5)} />
            <path className="flame" style={{ transformOrigin: "108px 160px", animationDelay: "-0.5s" }} d="M108 92 q24 28 14 54 q-5 14 -14 14 q-11 0 -16 -14 q-8 -26 16 -54z" fill="#f2702c" {...outline(theme, 3.5)} />
            <path className="flame" style={{ transformOrigin: "194px 160px", animationDelay: "-0.9s" }} d="M194 86 q26 30 15 58 q-5 14 -15 14 q-11 0 -16 -14 q-9 -28 16 -58z" fill="#f2702c" {...outline(theme, 3.5)} />
            <path className="flame" style={{ transformOrigin: "150px 162px", animationDelay: "-0.3s" }} d="M150 92 q24 28 14 54 q-5 14 -14 14 q-10 0 -15 -14 q-9 -26 15 -54z" fill="#ffd45e" />
          </g>
          <rect x="84" y="150" width="134" height="20" rx="10" transform="rotate(-5 150 160)" fill={fill(theme, "wood")} {...o} />
          <rect x="92" y="156" width="124" height="20" rx="10" transform="rotate(6 150 166)" fill={fill(theme, "wood")} {...o} />
        </svg>
      </div>
      <div className="hearth__base" />
    </section>
  );
}
