"use client";
import { useTheme } from "../ThemeProvider";
import { fill, outline, INK, type ColorName } from "@/lib/skin";

export const SOCK_COLORS: ColorName[] = ["red", "green", "gold", "blue", "pink"];

export function Sock({ name, index = 0, isNew = false, onClick }: { name: string; index?: number; isNew?: boolean; onClick?: () => void }) {
  const { theme } = useTheme();
  const o = outline(theme);
  const color = SOCK_COLORS[index % SOCK_COLORS.length];
  const striped = index % 2 === 0;
  return (
    <button type="button" className={`sock sock--c${index % SOCK_COLORS.length}${isNew ? " sock--new" : ""}`} onClick={onClick} style={{ animationDelay: `${-(index * 0.7) % 4}s` }} aria-label={`Socke von ${name}`}>
      {theme === "film" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sock__img" src="/film/stocking.webp" alt="" draggable={false} />
      ) : (
      <svg viewBox="0 0 84 118" aria-hidden>
        <path d="M34 2 v10" stroke={theme === "sticker" ? INK : "#e9c98f"} strokeWidth="3" strokeLinecap="round" />
        <path d="M18 26 V80 Q18 108 44 108 H58 Q76 108 76 90 Q76 73 58 73 H52 V26 Z" fill={fill(theme, color)} {...o} />
        {striped ? (
          <path d="M19 44 H51 M19 58 H51" stroke="#fff" strokeOpacity="0.7" strokeWidth="5" />
        ) : (
          <g fill="#fff" opacity="0.7"><circle cx="28" cy="42" r="3.5" /><circle cx="42" cy="52" r="3.5" /><circle cx="29" cy="64" r="3.5" /></g>
        )}
        <path d="M63 73.5 Q76 76 76 90 Q76 107 60 108 Q69 91 63 73.5 Z" fill={fill(theme, "cream")} {...outline(theme, 3)} />
        <rect x="12" y="10" width="46" height="20" rx="9" fill={fill(theme, "cream")} {...o} />
      </svg>
      )}
      <span className="sock__name">{name}</span>
    </button>
  );
}
