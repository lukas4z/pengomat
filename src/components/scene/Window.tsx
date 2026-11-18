"use client";
import { useTheme } from "../ThemeProvider";
import { fill, outline, INK } from "@/lib/skin";

const FLAKES = Array.from({ length: 22 }, (_, i) => ({
  x: 34 + ((i * 53) % 232),
  r: 2 + (i % 3),
  dur: 5 + ((i * 7) % 6),
  delay: -((i * 1.3) % 9),
}));

export function Window() {
  const { theme } = useTheme();
  const o = outline(theme);
  const film = theme === "film";
  return (
    <svg className="window" viewBox="0 0 300 250" aria-hidden>
      <defs>
        <clipPath id="pane">
          <rect x="26" y="20" width="248" height="190" rx="14" />
        </clipPath>
      </defs>
      <rect x="12" y="6" width="276" height="218" rx="22" fill={fill(theme, "wood")} {...o} />
      <rect x="26" y="20" width="248" height="190" rx="14" fill={fill(theme, "night")} {...outline(theme, 3)} />
      <g clipPath="url(#pane)">
        <circle cx="216" cy="62" r="22" fill="#fff3c9" />
        {film && <circle cx="216" cy="62" r="46" fill="url(#g-glow)" opacity="0.5" />}
        <path d="M0 190 Q70 140 150 176 T300 160 V230 H0Z" fill="#e9f1fb" />
        <path d="M0 205 Q90 170 190 198 T300 186 V230 H0Z" fill="#fff" />
        <g>
          <path d="M58 182 l16 -34 16 34z M62 160 l12 -26 12 26z" fill={film ? "#2f6247" : "#3f7d57"} stroke={film ? "none" : INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
        {FLAKES.map((f, i) => (
          <circle key={i} className="flake" cx={f.x} cy="0" r={f.r} fill="#fff" style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }} />
        ))}
      </g>
      <rect x="144" y="20" width="12" height="190" fill={fill(theme, "wood")} {...outline(theme, 3)} />
      <rect x="26" y="108" width="248" height="12" fill={fill(theme, "wood")} {...outline(theme, 3)} />
      <rect x="2" y="216" width="296" height="26" rx="10" fill={fill(theme, "wood")} {...o} />
    </svg>
  );
}
