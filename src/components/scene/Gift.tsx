"use client";
import { useTheme } from "../ThemeProvider";
import { fill, outline } from "@/lib/skin";

export function Gift({ shake = 0, open = false }: { shake?: 0 | 1 | 2 | 3; open?: boolean }) {
  const { theme } = useTheme();
  const o = outline(theme, 5);
  return (
    <svg className={`gift gift--s${shake}${open ? " gift--open" : ""}`} viewBox="0 0 200 210" role="img" aria-label="Geschenk">
      <ellipse cx="100" cy="196" rx="78" ry="9" fill="#000" opacity="0.18" />
      <rect x="30" y="86" width="140" height="106" rx="12" fill={fill(theme, "red")} {...o} />
      <rect x="88" y="86" width="24" height="106" fill={fill(theme, "gold")} {...outline(theme, 4)} />
      <g fill="#fff" opacity="0.55">
        <circle cx="54" cy="120" r="4" /><circle cx="70" cy="160" r="4" /><circle cx="140" cy="130" r="4" /><circle cx="152" cy="168" r="4" />
      </g>
      <g className="gift__lid">
        <rect x="20" y="62" width="160" height="36" rx="11" fill={fill(theme, "red")} {...o} />
        <rect x="86" y="62" width="28" height="36" fill={fill(theme, "gold")} {...outline(theme, 4)} />
        <ellipse cx="74" cy="46" rx="26" ry="15" transform="rotate(-18 74 46)" fill={fill(theme, "gold")} {...o} />
        <ellipse cx="126" cy="46" rx="26" ry="15" transform="rotate(18 126 46)" fill={fill(theme, "gold")} {...o} />
        <circle cx="100" cy="54" r="12" fill={fill(theme, "gold")} {...o} />
      </g>
    </svg>
  );
}
